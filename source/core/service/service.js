 "use strict";

 const CRLF = "\r\n";
 const CR   = "\r";

 const fs         = require('fs');
 const console    = require('gifer-console');
 const crypto     = require("crypto");
 const iconv      = require('iconv-lite');
 const _path      = require('path');
 const HDWID      = require("machine-uuid");
 const HOME_DIR   = "/Documents/MyChat/";

 let Service    = {};
 let empty 	    = {};
 let extraNames	= ["hasOwnProperty", "valueOf", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "constructor"];
 let extraLen 	= extraNames.length;

 // ==================================================

 Service.MCPathes = global.MCPathes = {};

 Service.MCServer = global.MCServer = {
     ProtocolVersion : "2.37",
     ClientVersion   : "7.3.0",
     ElectronVersion : "2.1.0-unsupported.20180809",
     ElectronVersionShort: "2.1",
     ElectronNodeVersion : "57",
     MaximumHTTPConnections: 1000,
     sendBufferSize: 10240,
     maxUploadData : 600000000,
     Host     : '127.0.0.1',
     Port     : '2004',
     PWD      : "",
     ServPass : "",
     MCPort   : 2004,
     STUN     : {
         enable : false,
         addr1  : "127.0.0.1",
         addr2  : "127.0.0.1",
         port1  : "3478",
         port2  : "3479"
     },
     GZIP     : false,
     Lang     : "ru",
     externalIceServers : [
         {url: "stun:stun.sipgate.net"},
         {url: "stun:217.10.68.152"},
         {url: "stun:stun.sipgate.net:10000"},
         {url: "stun:217.10.68.152:10000"}
     ],
     iceServers : []
 };

 // ==================================================

 function dec2hex(i){
     var result = "0000";

     if      (i >= 0    && i <= 15)    { result = "000" + i.toString(16); }
     else if (i >= 16   && i <= 255)   { result = "00"  + i.toString(16); }
     else if (i >= 256  && i <= 4095)  { result = "0"   + i.toString(16); }
     else if (i >= 4096 && i <= 65535) { result =         i.toString(16); }

     return result
 }

 function isPlainObject(obj) {
     if (!obj || toString.call(obj) !== '[object Object]' || obj.nodeType || obj.setInterval)
         return false;

     var has_own_constructor = hasOwnProperty.call(obj, 'constructor');
     var has_is_property_of_method = hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf');
     // Not own constructor property must be Object
     if (obj.constructor && !has_own_constructor && !has_is_property_of_method)
         return false;

     // Own properties are enumerated firstly, so to speed up,
     // if last one is own, then all properties are own.
     var key;
     for ( key in obj ) {}

     return key === undefined || hasOwn.call( obj, key );
 }

 function makeCRCTable(){
     var c;
     var crcTable = [];

     for(var n =0; n < 256; n++){
         c = n;

         for(var k =0; k < 8; k++){
             c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
         }

         crcTable[n] = c;
     }

     return crcTable;
 }

 function isObjectEmpty(obj){
     var flag = true;

     if (obj){
         for (var i in obj){
             flag = false;
         }
     }

     return flag;
 }

 // ==================================================

 Service.Const = {
     PrimaryHost : 'localhost',
     PrimaryPort : "80"
 };
 
 Service.FileWalker = function(rootDir, done, parent){
    let results = [];
 
    fs.readdir(rootDir, function(err, list){
        if (err) {
            console.error(err.message);
            
			if (results.length) {
			    done(results);
            }
		} else {
            (function next(i){
                let filePath = list[i];

                if (filePath) {
                    fs.stat(rootDir + '/' + filePath, function(err, stat){
                        if (stat && stat.isDirectory()) {
                            let fld = {
                                id: filePath + (parent ? "_" + parent : ""), value: filePath, data: []
                            };

                            results.push(fld);

                            Service.FileWalker(rootDir + '/' + filePath, function(folderList){
                                fld.data = folderList;

                                next(++i);
                            }, filePath + (parent ? "_" + parent : ""));
                        } else {
                            results.push({ id: filePath + (parent ? "_" + parent : ""), value: filePath });

                            next(++i);
                        }
                    });
                } else {
                    done(results);
                }
            })(0);
        }
    });
 };
 
 Service.JSON_to_INI = function(/* array of objects */_options, GlobalCallBack){
 	if (_options.length > 0){
		var Option = Service.MargeObj({
			JSON	 : {},
			FileName : 'file.ini',
			FilePath : './',
			Section	 : '',
			LocalCallBack : undefined
		}, _options[0] || {});
		
		var OutText = '';
		
		if (Option.Section !== ''){
			OutText += '[' + Option.Section + ']\r\n';
		}
		 
		for (var item in Option.JSON){
			if (Option.Section !== ''){
				OutText += item + '=' + Option.JSON[item] + '\r\n';
			} else
			if (typeof Option.JSON[item] === 'object'){
				OutText += '[' + item + ']\r\n';
				
				for (var subItem in Option.JSON[item]) {
					OutText += subItem + '=' + Option.JSON[item][subItem] + '\r\n';
				}
			}
		}
		
		Service.AddTextToFile(Option.FilePath, Option.FileName, OutText, function(){
			if (Option.LocalCallBack) {
				Option.LocalCallBack(Option.FilePath + Option.FileName);
			}
			
			_options.shift();
			
			if (_options.length > 0){
				Service.JSON_to_INI(_options, GlobalCallBack);
			} else {
				GlobalCallBack.apply();
			}
		});
	}
 };
 
 Service.AddTextToFile = function(Path, FileName, Text, CallBack){
 	if (Path !== '') {
		Path += (Path[Path.length] === '/') ? '' : '/';
	}
	 
 	fs.writeFile(Path + FileName, Text, CallBack);
 };

 Service.WriteFile = function(path, data, cb, opt){
     fs.writeFile(path, data, opt, function (err) {
         if (err) {
             console.err("Service.WriteFile " + err);
         } else {
             if (cb) cb();
         }
     });
 };

 Service.convertToEntities = function(tstr) {
     var bstr = "";

     if (tstr){
         for(var i = 0; i < tstr.length; ++i)
         {
             if(tstr.charCodeAt(i) > 127)
             {
                 bstr += "\\u" + dec2hex(tstr.charCodeAt(i));
             } else {
                 bstr += tstr.charAt(i);
             }
         }
     } else {
         throw new Error('convertToEntities: incoming data is empty or undefined: ' + tstr);
         //console.err('convertToEntities: incoming data is empty or undefined', true);
     }

     return bstr;
 };

 Service.UTF8 = {
     encode: function(s){
         for(var c, i = -1, l = (s = s.split("")).length, o = String.fromCharCode; ++i < l;
             s[i] = (c = s[i].charCodeAt(0)) >= 127 ? o(0xc0 | (c >>> 6)) + o(0x80 | (c & 0x3f)) : s[i]);

         return s.join("");
     },
     decode: function(s){
         for(var a, b, i = -1, l = (s = s.split("")).length, o = String.fromCharCode, c = "charCodeAt"; ++i < l;
             ((a = s[i][c](0)) & 0x80) &&
                 (s[i] = (a & 0xfc) == 0xc0 && ((b = s[i + 1][c](0)) & 0xc0) == 0x80 ?
                     o(((a & 0x03) << 6) + (b & 0x3f)) : o(128), s[++i] = "")
             );

         return s.join("");
     }
 };

 Service.Extend = Service.extend = Service.MargeObj = function () {
	var options, name, src, copy, copyIsArray, clone,
	    target = arguments[0] || {},
	    i = 1,
	    length = arguments.length,
	    deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && typeof target !== "function") {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = Array.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && Array.isArray(src) ? src : [];

					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = Service.MargeObj( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
 };
 
 Service.Get_CMD = function(msg){
	var WEB_CR_IDX = msg.indexOf(CR);
	
	if (WEB_CR_IDX == -1) WEB_CR_IDX = msg.length;
	
	var request = msg.slice(0, WEB_CR_IDX);
	var _msg    = msg.slice(WEB_CR_IDX + 1, msg.length + 1);
	
	this.CMD  = request;
	this.DATA = Service.DropEndCRLF(_msg);
	
	return this;  
 };

 /**
  * @return {number}
  */
 Service.CRC32 = function(str) {
     var crcTable = makeCRCTable();
     var crc = 0 ^ (-1);

     for (var i = 0; i < str.length; i++ ) {
         crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
     }

     return (crc ^ (-1)) >>> 0;
 };

 Service.GetSubstringFrom = function(str, term){
	var idx = str.indexOf(term);
	var res = (idx != -1)? str.slice(idx + term.length, str.length + 1) : str.slice(0, str.length + 1);
	return (res === '') ? '' : res;
 };

 Service.Delete_File = function(FileName, CallBack){
     /*var cmd = 'del "' + FileName + '" /q';

     console.log("File: " + cmd + " deleted", console.logLevel.L_Normal);

     exec(cmd, _execOptions, CallBack);*/

     fs.unlink(FileName, CallBack);
 };

 Service.DropEndCRLF = function(str){
 	if ((str[str.length - 2] + str[str.length - 1]) === '\r\n') {
		return str.slice(0, str.length - 2);
	} else {
		return str;
	}
 };

 /**
 * @return {string}
 */
 Service.RandomHash = function (len) {
    var letters = 'JjKAEeaMpsTtQqRxBcDdFfGgHhI23ibC-kLmNnOoPV8yrSUuZ1WwXlY456790._vz_';
	var res = '';

    for (var i = 0; i < len; i++) {
        res += letters[Math.floor(Math.random() * letters.length)];
    }
    
	return res;
 };

 Service.ExtractFileName = function(Path){
     var count = 0;

     for (var i = Path.length - 1; i >= 0; i--){
         count ++;

         if ((Path[i] === '\\') || (Path[i] === '/')) {
             return Path.slice(i + 1, i + count);
         }
     }

     return Path;
 };

 Service.ExtractPath = function(Path){
     for (var i = Path.length - 1; i >= 0; i--){
         if ((Path[i] === '\\') || (Path[i] === '/')) {
             return Path.slice(0, i);
         }
     }

     return Path;
 };

 Service.LoadMail = Service.LoadJSONFile = Service.LoadFile = function(Path, callback, opt) {
     var _opt = opt || 'win1251';

     fs.stat(Path, function (err, stats) {
         if (err){
             if (Path.indexOf('first.login') === -1) {
                 console.err('Failed Load ' + Path + "\n" + err, true);
             }

             if (callback){
                 callback(null);
             }
         } else
         if (stats.size > 50000000){
             console.err('Log file ' + Path + ' too large: ' + stats.size);

             if (callback){
                 callback('FFFF|Log file ' + Path + ' is too large for view, size: ' + stats.size + " bite|||");
             }
         } else {
             var str    = fs.createReadStream(Path);
             var inData = [];

             str.on('data', function(chunk){
                 inData.push(chunk);
             });

             str.on('error', function(err){
                 console.err('Failed Load ' + Path + "\n" + err, true);

                 if (callback){
                     callback(null);
                 }
             });

             str.on('end', function(){
                 var res = "";

                 try{
                     if (opt){
                         res = iconv.decode(Buffer.concat(inData), _opt);
                     } else {
                         res = Buffer.concat(inData).toString();
                     }

                     console.info('Loaded file: "' + Path + '"', console.logLevel.L_Full);
                 } catch (e){
                     console.err('Failed Load ' + Path + "\n" + e.message + "\n" + e.stack + "\n", true);

                     if (callback){
                         callback(null);
                     }

                     return;
                 }

                 if (callback){
                    callback(res);
                 }
             });
         }
     });
 };

 Service.Replace = function(str, cond, args){
     if (Service.isArray(args)){
         for (var i = 0; i < args.length; i++){
             str = str.replace(cond, args[i]);
         }
     } else {
         str = str.replace(cond, args);
     }

     return str;
 };

 Service.myReplace = function(source, _items, term){
     var res = source;
     var items = [];

     if (_items !== undefined && source !== undefined){
         var _term = term || "%s";

         if (!Service.isArray(_items)) {
             items.push(_items);
         } else {
             items = _items;
         }

         if (items.length > 0){
             res = source.replace(_term, items.shift());
             res = Service.myReplace(res, items, _term);
         }
     }

     return res;
 };

 /**
 * @return {string}
 */
 Service.CapitaliseFirstLetter = function(string){
     return string.charAt(0).toUpperCase() + string.slice(1);
 };
 
 Service.minimumOfTwo = function(a, b){
     var res = [];

     if ((parseInt(a) - parseInt(b)) > 0){
         res = [b,  a];
     } else {
         res = [a, b];
     }

     return res;
 };

 Service.PrintObjectItems = function(_obj){
   for (var i in _obj){
       console.log(i + ": " + ((typeof(_obj[i]) === 'object') ? JSON.stringify(_obj[i]) : _obj[i]));
   }
 };
 
 Service.isValidEmailAddress = function(emailAddress) {
    var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);

     return pattern.test(emailAddress);
 };

 Service.isValidIpAddress = function (ip) {
    var reg = /(^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?$))/; // |(((^|:)([0-9a-fA-F]{0,4})){1,8})

    return reg.test(ip);
 };

 Service.StringToObj = function(_data, debug){
     var res = {};
     
     if (debug){
         console.info("StringToObj: " + _data);
     }

     if (Service.isObject(_data)){
         if (debug) Service.PrintObjectItems(_data);
         
         res = _data;
     } else {
         try {
             var new_obj = JSON.parse(_data);

             if (debug) {
                 Service.PrintObjectItems(new_obj);
             }

             res = new_obj;
         } catch(e){
             console.err("StringToObj: " + e.message);
             //console.err("StringToObj: " + e.stack);

             res = _data;
         }
     }
    
    return res;
 };

 Service.inArrayNoStrict = function( elem, arr, i ) {
    var len;

    if ( arr ) {
        len = arr.length;
        i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

        for ( ; i < len; i++ ) {
            if ( i in arr && arr[ i ] == elem ) {
                return i;
            }
        }
    }

    return -1;
 };

 /**
  * @return {string}
  */
 Service.ArrayToString = function(_array, _separator){
     var res = "";
     var separator = (!_separator) ? CR : _separator;

     for (var i = 0; i < _array.length; i++){
         res += Service.ObjToString(_array[i]) + separator;
     }

     return res;
 };

 /**
  * @return {string}
  */
 Service.ObjToString = function(_obj){
     var res = "";

     if (Service.isString(_obj) || Service.isNumber(_obj)){
         res = _obj.toString() + "";
     } else
     try {
         res = JSON.stringify(_obj);
     } catch (e){
         res = _obj.toString() + "";
     }

     return res;
 };

 /**
  * @return {boolean}
  */
 Service.InArray = function(item, arr){
   var res = false;
   
   for(var i = 0; i < arr.length; i++) {
        if (item == arr[i]) {
            res = true;
            break;
        }
    }
    
    return res;
 };

 /**
 * @return {boolean}
 */
 Service.InObject = function(item, obj){
    var res = false;

    for(var i in obj) {
        if (item == obj[i]) {
            res = true;
            break;
        }
    }

    return res;
 };

 Service.isArray = function isArray(obj) {
     return Object.prototype.toString.call( obj ) === '[object Array]';
 };

 Service.isObject = function isObject(obj) {
     return Object.prototype.toString.call( obj ) === '[object Object]';
 };

 Service.isString = function isString(obj) {
     return Object.prototype.toString.call( obj ) === '[object String]';
 };

 Service.isNumber = function isNumber(obj) {
     return Object.prototype.toString.call( obj ) === '[object Number]';
 };

 Service.isFunction = function (obj) {
    return Object.prototype.toString.call( obj ) === '[object Function]';
 };

 /**
 * @return {string}
 */
 Service.GetType = function GetType(obj){
     return Object.prototype.toString.call( obj );
 };

 /**
 * @return {string}
 */
 Service.GetSubstring = function (str, term){
     var res = "";

     if (str) {
         var idx = str.indexOf(term);

         res = (idx !== -1)? str.slice(0, idx) : str.slice(0, str.length + 1);
     }

     return res;
 };

 Service.isPortBusy = function(PORT, passedCallBack, failedCallBack, loop) {
     var net = require('net');
     var tester = net.createServer();

     console.info("Testing port: " + PORT);

     tester.once('error', function (err) {
         if (failedCallBack && !loop){
             if (err.code === 'EADDRINUSE') {
                 failedCallBack();
             } else {
                 failedCallBack(PORT, err);
             }
         }

         if (loop){
             setTimeout(function () {
                 Service.isPortBusy(++PORT, passedCallBack, failedCallBack, --loop);
             }, 10);
         }
     });

     tester.once('close', function() {
         if (passedCallBack) {
             passedCallBack(PORT);
         }
     });

     tester.listen(PORT, "0.0.0.0", function () {
         tester.close();
     });
 };

 /**
 * @return {undefined}
 */
 Service.Read_JSON_File = function(_file, invertSlesh){
     var res = undefined;

     try {
         res = fs.readFileSync(_file);

         if (invertSlesh) res = res.toString().replace(/\\/g, '/');

         var txt = res;
     } catch (e){
         console.err("Can't load JSON file: " + _file + "\n" + e);

         return;
     }

     try {
         res = JSON.parse(res);
     } catch (e){
         console.err("Wrong JSON format or syntax error: " + _file + "\n" + e);

         return;
     }

     console.log("JSON file successfully loaded: " + _file + "\n" + txt);

     return res;
 };

 Service.InitMCPathes = function(params){
     MCPathes.Profile    = params;
     MCPathes.ProfilNode = MCPathes.Profile    + "node/";
     MCPathes.Events     = MCPathes.ProfilNode + "events/";
     MCPathes.History    = MCPathes.Profile    + "logs/";
     MCPathes.Uploads    = MCPathes.ProfilNode + "uploads/";
     MCPathes.Downloads  = MCPathes.ProfilNode + "downloads/";
     MCPathes.Updates    = MCPathes.Profile    + "updates/";
 };

 Service.Base64 = {

     // private property
     _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

     // public method for encoding
     encode : function (input) {
         var output = "";
         var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
         var i = 0;

         input = Base64._utf8_encode(input);

         while (i < input.length) {

             chr1 = input.charCodeAt(i++);
             chr2 = input.charCodeAt(i++);
             chr3 = input.charCodeAt(i++);

             enc1 = chr1 >> 2;
             enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
             enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
             enc4 = chr3 & 63;

             if (isNaN(chr2)) {
                 enc3 = enc4 = 64;
             } else if (isNaN(chr3)) {
                 enc4 = 64;
             }

             output = output +
                 this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                 this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

         }

         return output;
     },

     // public method for decoding
     decode : function (input) {
         var output = "";
         var chr1, chr2, chr3;
         var enc1, enc2, enc3, enc4;
         var i = 0;

         input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

         while (i < input.length) {

             enc1 = this._keyStr.indexOf(input.charAt(i++));
             enc2 = this._keyStr.indexOf(input.charAt(i++));
             enc3 = this._keyStr.indexOf(input.charAt(i++));
             enc4 = this._keyStr.indexOf(input.charAt(i++));

             chr1 = (enc1 << 2) | (enc2 >> 4);
             chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
             chr3 = ((enc3 & 3) << 6) | enc4;

             output = output + String.fromCharCode(chr1);

             if (enc3 != 64) {
                 output = output + String.fromCharCode(chr2);
             }

             if (enc4 != 64) {
                 output = output + String.fromCharCode(chr3);
             }

         }

         output = Base64._utf8_decode(output);

         return output;

     },

     // private method for UTF-8 encoding
     _utf8_encode : function (string) {
         string = string.replace(/\r\n/g,"\n");
         var utftext = "";

         for (var n = 0; n < string.length; n++) {

             var c = string.charCodeAt(n);

             if (c < 128) {
                 utftext += String.fromCharCode(c);
             } else
             if((c > 127) && (c < 2048)) {
                 utftext += String.fromCharCode((c >> 6) | 192);
                 utftext += String.fromCharCode((c & 63) | 128);
             } else {
                 utftext += String.fromCharCode((c >> 12) | 224);
                 utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                 utftext += String.fromCharCode((c & 63) | 128);
             }

         }

         return utftext;
     },

     // private method for UTF-8 decoding
     _utf8_decode : function (utftext) {
         var string = "";
         var i  = 0;
         var c  = 0;
         var c1 = 0;
         var c2 = 0;
         var c3 = 0;

         while ( i < utftext.length ) {

             c = utftext.charCodeAt(i);

             if (c < 128) {
                 string += String.fromCharCode(c);
                 i++;
             } else
             if((c > 191) && (c < 224)) {
                 c2 = utftext.charCodeAt(i+1);
                 string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                 i += 2;
             } else {
                 c2 = utftext.charCodeAt(i+1);
                 c3 = utftext.charCodeAt(i+2);
                 string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                 i += 3;
             }

         }

         return string;
     }
 };

 Service.formatDate = function(formatDate, formatString){

     var yyyy = formatDate.getFullYear();
     var yy = yyyy.toString().substring(2);
     var m = formatDate.getMonth() + 1;
     var mm = m < 10 ? "0" + m : m;
     var d = formatDate.getDate();
     var dd = d < 10 ? "0" + d : d;

     var  h = formatDate.getHours();
     var  hh = h < 10 ? "0" + h : h;
     var  n = formatDate.getMinutes();
     var  nn = n < 10 ? "0" + n : n;
     var  s = formatDate.getSeconds();
     var  ss = s < 10 ? "0" + s : s;

     formatString = formatString.replace(/yyyy/i, yyyy);
     formatString = formatString.replace(/yy/i, yy);
     formatString = formatString.replace(/mm/i, mm);
     formatString = formatString.replace(/m/i, m);
     formatString = formatString.replace(/dd/i, dd);
     formatString = formatString.replace(/d/i, d);
     formatString = formatString.replace(/hh/i, hh);
     formatString = formatString.replace(/h/i, h);
     formatString = formatString.replace(/nn/i, nn);
     formatString = formatString.replace(/n/i, n);
     formatString = formatString.replace(/ss/i, ss);
     formatString = formatString.replace(/s/i, s);

     return formatString;
 };

 Service.Encrypt = function encrypt(key, data) {
     var cipher = crypto.createCipher('aes-256-cbc', key);
     var crypted = cipher.update(data, 'utf-8', 'hex');
     crypted += cipher.final('hex');

     return crypted;
 };

 Service.Decrypt = function decrypt(key, data) {
     var decipher = crypto.createDecipher('aes-256-cbc', key);
     var decrypted = decipher.update(data, 'hex', 'utf-8');
     decrypted += decipher.final('utf-8');

     return decrypted;
 };

 Service.Queue = function(lookupTime, loop){
     var self      = this;
     var needRun   = [];
     var canNext   = loop || false;
     var paramList = [];
     var nowRunned = false;
     var time      = lookupTime || 1000;

     var lookUp    = null;

     function start(){
         return setInterval(function(){
             if (!nowRunned && needRun.length > 0){
                 nowRunned = true;

                 var arg = (Service.isArray(paramList[0])) ? paramList[0] : [paramList[0]];

                 needRun[0].apply(self, arg);
             }
         }, time);
     }

     this.next = function(){
         if (needRun.length > 0){
             needRun.shift();
             paramList.shift();

             nowRunned = false;
         } else
         if (!canNext){
             clearInterval(lookUp);

             self = null;
         }
     };

     this.addTask = function (qItem, params){
         if (needRun.length === 0 && !nowRunned) {
             lookUp = start();
         }

         needRun.push(qItem);
         paramList.push(params);

         return needRun.length;
     };
 };

 Service.TaskList = function(_scope){
     var self  = this;
     var list  = [];
     var scope = {};

     this.AddTask = function(task){
         list.push(task);
     };

     this.Next = function(){
         if (list.length){
             list.shift().apply(scope);
         } else {
             self = null;
         }
     };

     this.Run = function(){
         self.Next();
     };

     scope = Service.MargeObj({
         next : self.Next
     }, _scope || {});
 };

 /**
 * @return {boolean}
 */
 Service.NTLM = function(request, response) {
    var auth = request.headers.authorization;
    var res = false;

    if (!auth) {
        console.log('Start NTLM authentication', console.logLevel.L_Normal);

        response.statusCode = 401;
        response.setHeader('WWW-Authenticate', 'NTLM');
        response.end();
    } else {
        console.log('Authentication-Header ' + auth, console.logLevel.L_Normal);

        var msg = new Buffer(auth.substr(5), 'base64');

        if (msg.toString('utf8', 0, 8) != 'NTLMSSP\0') {
            console.error('Invalid NTLM response header.');
        }

        if (msg.readUInt8(8) == 1) {
            console.log('NTML Message Type 1', console.logLevel.L_Normal);

            var msg2 = new Buffer(40);
            var offset = 0;

            var header = 'NTLMSSP\0';
            for (var i = 0; i < header.length; i++) {
                msg2.writeUInt8(header.charCodeAt(i), offset++)
            }

            msg2.writeUInt8(0x02, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x28, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x01, offset++);
            msg2.writeUInt8(0x82, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x01, offset++);
            msg2.writeUInt8(0x23, offset++);
            msg2.writeUInt8(0x45, offset++);
            msg2.writeUInt8(0x67, offset++);
            msg2.writeUInt8(0x89, offset++);
            msg2.writeUInt8(0xab, offset++);
            msg2.writeUInt8(0xcd, offset++);
            msg2.writeUInt8(0xef, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x00, offset++);
            msg2.writeUInt8(0x00, offset++);

            console.log('NTML Message Type 2', 'NTLM ' + msg2.toString(), console.logLevel.L_Normal);

            response.statusCode = 401;
            response.setHeader('WWW-Authenticate', 'NTLM ' + msg2.toString('base64'));
            response.end();
        } else if (msg.readUInt8(8) == 3) {
            console.log('NTML Message Type 3', console.logLevel.L_Normal);

            var ntlmdata = {
                target: msg.toString('utf16le', msg.readUInt16LE(32), msg.readUInt16LE(32) + msg.readUInt16LE(28)),
                userid: msg.toString('utf16le', msg.readUInt16LE(40), msg.readUInt16LE(40) + msg.readUInt16LE(36)),
                workstation: msg.toString('utf16le', msg.readUInt16LE(48), msg.readUInt16LE(48) + msg.readUInt16LE(44))
            };

            request.ntlm = ntlmdata;
            response.ntlm = ntlmdata;

            res = true;

            console.log(ntlmdata);
        } else {
            console.log('NTML Message Type not known', console.logLevel.L_Normal);

            response.end();
        }
    }

    return res;
};

 Service.SendDataInternal = null;

 Service.decodeBase64Image = function (dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    var response = {};

    if (!matches || matches.length !== 3) {
        console.err('Invalid input string');

        return false;
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
 };

 Service.findMyChatServer = function (host, cb) {
     var message = new Buffer('FindMyChat');
     var client  = require('dgram').createSocket('udp4');
     var broadcastMask = host.split('.');

     broadcastMask[3] = '255';
     broadcastMask = broadcastMask.join('.');

     client.bind(2005, host, function () {
         let stClose = setTimeout(function () {
             if (client){
                 client.close();
                 client = null;
             }
         }, 300);

         client.setBroadcast(true);

         client.on('message', function(msg, info) {
             cb(Service.StringToObj(msg), info); // msg info.address info.port

             clearTimeout(stClose);

             client.close();
             client = null;
         });

         client.send(message, 0, message.length, 2004, broadcastMask);
     });
     
     client.on("error", (err) => {
         console.log(`findMyChatServer: ${err.message}\n${err.stack}`);

         client.close();
     });
 };

 Service.getNetworkInterfacesList = function () {
     var netList = require('os').networkInterfaces();
     var list    = [];

     Object.keys(netList).forEach(function (ifname) {
         var alias = 0;

         netList[ifname].forEach(function (currentInterface) {
             if (!('IPv4' !== currentInterface.family || currentInterface.internal !== false)) { // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                 if (alias >= 1) {
                     // this single interface has multiple ipv4 addresses
                     //console.log(ifname + ':' + alias, iface.address);
                 } else {
                     // this interface has only one ipv4 adress
                     //console.log(ifname.toString('utf-8') + ", " + iface.address);
                 }

                 list.push(currentInterface.address);

                 alias ++;
             }
         });
     });

     return list;
 };

 Service.testServerConnect = function (host, port, callback) {
     try{
         var inData   = "";
         var __socket = require('net').createConnection(
             // {
             //     host: host,
             //     port: port
             // },
             port, host,
             function () {
                 __socket.setTimeout(10000);
                 
                 __socket.write("mctest" + CRLF);
             }
         );

         __socket.setTimeout(10000);

         __socket.on('data', function (data) {
             inData += data.toString();
         });

         __socket.on('close', function () {
             if (inData){
                 if (inData.indexOf("mctest") === 0){
                     callback(null, inData);
                 } else {
                     callback({
                         message: "it is not a MyChat Server or this server version is too old"
                     });
                 }
             }
         });

         __socket.on('error', function (err) {
             inData = "";

             __socket.destroy();
             __socket = null;

             callback(err);
         });

         __socket.on('timeout', function () {
             callback({code: "connection timeout"});
         });
     } catch (e) {
         callback(e);
     }
 };

 Service.ExtractFileExtention = function(Path){
     var res   = Path.split('.');

     res = res[res.length - 1];

     return res;
 };

 Service.getHardwareID = function (cb) {
     HDWID(cb);
 };

 Service.getLinkInfoByXY = function(win, x, y) {
     function script() {
         var x = "XXX";
         var y = "YYY";
         var link = document.elementFromPoint(x, y);
         var uin  = link.getAttribute('uin');

         window.mcComponents._broadcast(window._messages_.dialogsList.getQuickUserInfo, [uin, function (userInfo) {
             var _electronHandler = require("electron").ipcRenderer;
             var data = {
                 id      : link.id,
                 href    : link.href,

                 filePath: link.getAttribute("filepath"),
                 fileDT  : link.getAttribute("filedt"),
                 fileSize: link.getAttribute("filesize"),

                 userInfo: userInfo
             };
             
             _electronHandler.send("e_CMD", [
                 '7027', // ce_special_link_user_info
                 data
             ]);
         }]);
     }
     
     win.webContents.executeJavaScript(("(" + script.toString().replace("XXX", x).replace('YYY', y) + ")()"));
 };

 Service.loadFileSync = fs.readFileSync;

 Service.format_size = function(size) {
     let index = 0;

     while (size > 1024){
         index ++;

         size = size / 1024;
     }

     return Math.round(size * 100)/100 + " " + ["B","KB","MB","GB","TB","PB","EB"][index];
 };

 Service.findItemInArrayOfObj = function( arr, val, id, lowerCase ){
     for (var i = 0; i < arr.length; i++){
         if (!id){
             for (var j in arr[i]){
                 if (lowerCase){
                     if (arr[i][j].toLowerCase() == val.toLowerCase()){
                         return i;
                     }
                 } else
                 if (arr[i][j] == val){
                     return i;
                 }
             }
         } else
         if (lowerCase){
             if (arr[i][id].toLowerCase() == val.toLowerCase()){
                 return i;
             }
         } else
         if (arr[i][id] == val){
             return i;
         }
     }

     return -1;
 };

 Service.checkDir = function (checkPath) {
     var statLogDir = null;
     var createPath = Service.ExtractPath(checkPath);

     try {
         statLogDir = fs.statSync(createPath) ? createPath : "./";
     } catch (e){
         statLogDir = './';
     }

     try {
         if (statLogDir === './' && createPath !== './') {
             var sep = '/';
             var initDir = _path.isAbsolute(createPath) ? sep : '';

             createPath.split(sep).reduce((parentDir, childDir) => {
                 var curDir = _path.resolve(parentDir, childDir);

                 if (!fs.existsSync(curDir)) {
                     fs.mkdirSync(curDir);
                 }

                 return curDir;
             }, initDir);

             statLogDir = createPath;
         }
     } catch (e){
         process.stdout.write("\x1B[31m >> [err]: Path not found: " + createPath + CRLF);

         statLogDir = './';
     }

     return statLogDir;
 };

 Service.deleteFolderRecursive = function(path) {
     if( fs.existsSync(path) ) {
         fs.readdirSync(path).forEach(function(file){
             var curPath = path + (path[path.length - 1] === "/" ? "" : "/") + file;
             
             if(fs.lstatSync(curPath).isDirectory()) { // recurse
                 Service.deleteFolderRecursive(curPath);
             } else { // delete file
                 fs.unlinkSync(curPath);
             }
         });

         fs.rmdirSync(path);
     }
 };


 Service.versionToInt = function(_ver){
     var ver = _ver.split(".");
     var res = 0;
     var multiplier = 1000000;

     ver.forEach(function (itm) {
         res += multiplier * itm;
         multiplier /= 1000;
     });

     return res;
 };

 Service.convertIntToBool = function (val) {
     return (Object.prototype.toString.call( val ) === '[object Boolean]') ? val : val == 1;
 };

 Service.myReplaceFormated = function(source, items){
     if (Service.isObject(items) && Service.isString(source)){
         for (var i in items){
             source = source.replace(new RegExp("#{" + i + "}", "g"), items[i]);
         }
     }

     return source;
 };

 Service.HOME_DIR = HOME_DIR;

 // ==============================================

 MCPathes.NodeEXE    = Service.ExtractPath(process.argv[0]).replace(/\\/g, '/'); //__dirname;
 MCPathes.NodeModules= MCPathes.NodeEXE + '/node_modules/';
 MCPathes.Index      = global.__dirname; //ii + ((ii[ii.length - 1] != '/')? '/' : '');
 MCPathes.Service    = MCPathes.Index   + '/client/modules/';
 MCPathes.Modules    = MCPathes.Index   + '/client/modules/';
 MCPathes.Images     = MCPathes.Index   + '/client/modules/images/';
 MCPathes.WWW        = MCPathes.Index   + '/client/';

 MCPathes.Profile    = "./";
 MCPathes.History    = "./";
 MCPathes.ProfilNode = "./";
 MCPathes.Events     = "./";
 MCPathes.Updates    = "./";

 // ==============================================

 module.exports = Service.MargeObj(module.exports, Service);
