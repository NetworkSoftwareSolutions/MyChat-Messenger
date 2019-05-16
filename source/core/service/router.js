"use strict";

 var Service    = require('./service.js');
 var console    = require('gifer-console');
 var URL        = require('url');
 var SendFile   = require('send');
 var Resources  = require('./resourceList').list;

 var POST_Processing    = null;
 var sendIntegrationAPI = null;
 var cacheHandler       = null;
 var _clearCache        = null;

 try {
     POST_Processing    = require('./post_parser.js');
 } catch (e) {}

 function enableCache(useCompress, compressType){
     if (!useCompress) return;

     var cacheOptions = {
         watchDirectoryChange: false,
         watchFileChange     : true,
         hashAlgo : 'sha1',
         gzip     : compressType == '1',
         deflate  : compressType == '2',
         etag     : true,
         lastmod  : true,
         expires  : 3600000,
         maxAge   : 3600
     };

     var fileCache = require('file-cache')(cacheOptions);
     var path      = '';
     var location  = '';
     var reportErrorTimer = null;
     var errString = "";

     function makeErrorReport(err){
         if (!reportErrorTimer){
             reportErrorTimer = setTimeout(function(){
                 var srt = errString;

                 errString = "";

                 console.err("Cache file not found during scanning: " + srt);

                 reportErrorTimer = null;
             }, 3000);
         } else {
             errString += "\n" + err;

             if (errString.length > 30000){
                 console.err("Cache file not found during scanning: " + errString);

                 errString = "";
             }
         }
     }

     for (var i in Resources){
         if (Resources[i].cache){
             path = Service.isString(Resources[i].source) ? Resources[i].source : Resources[i].source();
             location = Resources[i].pathWWW.replace(/\/|\\/g,'');

             path += path[path.length - 1] != '/' ? '/' : '';

             console.info('Caching folder: ' + path + location);

             fileCache.load(path + location, {
                 prefix: location.length > 0 ? '/' + location : ''
             });
         }
     }

     fileCache.on('ready', function() {
         cacheHandler = fileCache.httpHandler(cacheOptions);
     });

     fileCache.on('error', function(error) {
         if (error.code && error.code === "ENOENT"){
             if (console.GetLogLevel === console.logLevel.L_Extended) {
                 makeErrorReport(error.message);
             }
         }
     });

     fileCache.on('errorLimit', function(error) {
         console.err("File doesn't added into cache, because it's too large:\n path - " + error.path + ", size - " + error.size + ', limit - ' + error.limit);
     });

     _clearCache = fileCache.clearCache;
 }

 function sendFiles(req, res, uri, root){
     SendFile(req, uri)
     .root(root)
     .on('error', function error(err) {
         res.statusCode = err.status || 500;

         res.end('Sorry, path ' + uri + ' not found :(');

         console.err('[' + req.remoteHostIp + '] SendFile Error:' + err.message);
     })
     .on('directory', function redirect(){
         res.statusCode = 301;

         res.setHeader('Location', req.url + '/');
         res.end('Redirecting to ' + req.url + '/');
     })
     .pipe(res); //;
 }

 /**
  * @return {undefined}
  */
 function ParseRequest(req, res){
 	var _IDX   = -1;
	var maxLen = -1;
    var _res   = false;
    var _path  = URL.parse(req.url).pathname;
    var match  = false;

    console.log("Request for " + _path + " received.", console.logLevel.L_Full);

    if (_path) {
        for (var i in Resources){
            match = _path.indexOf(Resources[i].pathWWW) === 0;

            if (Resources[i].hasOwnProperty('redirect') && _path === Resources[i].redirect){
                res.writeHead(302, {
                    'Location': Resources[i].pathWWW
                });
                res.end();

                _res = true;
                _IDX = -1;

                break;
            }

            if ((_path === Resources[i].pathWWW) || (Resources[i].hasParams && match)) {
                _IDX = i;

                break;
            } else
            if (match){
                var _curLen = Resources[i].pathWWW.split('/').length - 1;

                if (maxLen < _curLen){
                    _IDX = i;
                    maxLen = _curLen;
                }
            }
        }

        if (_IDX !== -1){
            var localPath = Service.GetSubstringFrom(_path, Resources[_IDX].pathWWW);

            res.setHeader('MyChat-version', MCServer.ClientVersion);

            req.routePath = Resources[_IDX].pathWWW;

            if (Resources[_IDX].runFunc){
                Resources[_IDX].CallBack.call(this, req, res, localPath);

                _res = true;
            } else {
                switch (req.method){
                    case "GET" :
                        var uri   = URL.parse(req.url).pathname;
                        var _root = (Service.isFunction(Resources[_IDX].source)) ? Resources[_IDX].source() : Resources[_IDX].source;

                        if (_IDX.length == 20 ){
                            uri   = Service.ExtractFileName(Resources[_IDX].source);

                            _root = Service.ExtractPath(Resources[_IDX].source);
                        }

                        if (MCServer.WEBUseCache && cacheHandler != null){
                            cacheHandler(req, res, function(next) {
                                if (next) {
                                    sendFiles(req, res, uri, _root);
                                }
                            });
                        } else {
                            sendFiles(req, res, uri, _root);
                        }

                        _res = true;
                    break;

                    case "POST": POST_Processing.Parse.call(this, req, res); _res = true; break;
                }
            }
        }
    }

    return _res;
 }

 /**
  * @return {number}
  */
 function AddRoutPath(_rout){
 	var Option = Service.Extend({
		host : MCServer.Host,
		pathWWW : '/',
		source : './',
		TTL : ''
	}, _rout || {});

    var res = undefined;
    var idx = Service.RandomHash(20);

    if (Resources[idx]) {
        res = AddRoutPath(Option)
    } else {
        Resources[idx] = Option;

        res = idx;
    }

    return res;
 }
 
 function AddRandomPath(_opt){
 	var Option = Service.Extend({
		host     : MCServer.Host,
		pathWWW  : '/',
		source   : './',
		email    : 'support@nsoft-s.com',
        fileName : '/img.jpg',
		TTL      : ''
	}, _opt || {});
	
	Option.pathWWW = '/' + Service.RandomHash(32) + Option.fileName;// + Service.ExtractFileName(Option.source);
	
	// Непостредственная вставка виртуального пути в список Роутер_лист
    var idx = AddRoutPath(Option);
	
	console.info("Added random path: " + Option.pathWWW + " for file: " + Option.source, console.logLevel.L_Extended);
	console.log("Total pathes: " + JSON.stringify(Resources), console.logLevel.L_Extended);

	return [idx, Option.pathWWW];
 }
 
 function DelRoutPath(idx){
     if (Resources[idx]) {
         delete Resources[idx];
     }
 }
 
 function LoadPathes(){
     //TODO: save pathes to the server and load on start
 }

 function clearCache() {
     if (_clearCache) {
         _clearCache();
     }
 }

 exports.enableCache    = enableCache;
 exports.clearCache     = clearCache;
 exports.GO             = ParseRequest;
 exports.AddRandomPath  = AddRandomPath;
 exports.AddPath        = AddRoutPath;
 exports.LoadPathes     = LoadPathes;
 exports.DelRoutPath    = DelRoutPath;