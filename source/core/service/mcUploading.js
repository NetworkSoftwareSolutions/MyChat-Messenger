/**
 * Created by Gifer on 11.07.2015.
 */

"use strict";

var Service	    = require('./service.js');
var console	    = require('gifer-console');
var URL         = require('url');
var webUploader = require('multer');
var fs          = require('fs');
var _purl       = require('../client/modules/mctools/purl').purl;

var CRLF     = "\r\n";

var checkUploadRights = require('./mcconnect').checkUploadRights;

function sendToClient(res, data, code){
    res.statusCode = code || 200;
    res.end(JSON.stringify(data));
}

function webImage(req, res){
    var postData = '';
    var purl     = _purl(req.url);
    var hashFile = purl.param('hash');

    req.addListener("data", function(postDataChunk) {
        postData += postDataChunk;

        if (postData.length > MCServer.maxUploadData){
            console.err("POST data is too large. Break connection.");

            req.removeAllListeners();
        }
    });

    req.addListener("end", function() {
        var image = Service.decodeBase64Image(postData);
        var fileName = Date.now() + ".pasteImage.png";

        if (!image){
            setTimeout(function(){
                sendToClient(res, {
                    status   : 'error',
                    fileName : 'empty'
                }, 403);
            }, 10);
        } else {
            fs.writeFile(MCPathes.Uploads + fileName, image.data, function(err) {
                if (err){
                    sendToClient(res, {
                        status   : 'error',
                        fileName : fileName
                    }, 403);
                } else {
                    sendToClient(res, {
                        status   : 'server',
                        fileName : fileName
                    });
                }
            });
        }
    });
}

function webFile(req, res){
    var fileName = "ttt";
    var purl     = _purl(req.url);
    var sid      = purl.param('sid');
    var isSert   = purl.param('issert');
    var sertFile = purl.param('sertfile');
    var hashFile = purl.param('hash');

    webUploader({
        dest: isSert && sertFile ? MCPathes.Cert : MCPathes.Uploads,
        inMemory: false,
        rename: function (fieldname, filename) {
            fileName = hashFile + "." + (filename === 'blob' ? 'png' : Service.ExtractFileExtention(filename));

            return  fileName;
        },
        onError: function (error) {
            console.log(error);
        }
    }).call(null, req, res, function(error){
        if (error){
            console.err(error);
        } else {
            console.log('Upload file - ' + fileName + ' from User: ' + sid);// + sid[1]);

            sendToClient(res, {
                status   : 'server',
                fileName : fileName
            });
        }
    });
}

function mcFile(req, res, info){
    var firstChunk     = true;
    var fd             = '';
    var fragment       = 0;
    var postData       = [];
    var postDataLength = 0;
    var secondHeader   = info[1] || 0;
    var isChunkNumber  = info[2] || 0;

    req.addListener("data", function(postDataChunk) {
        if (firstChunk){
            firstChunk = false;

            var data = ((postDataChunk.slice(0, secondHeader)).toString()).split(CRLF);

            postDataChunk = postDataChunk.slice(secondHeader, postDataChunk.length);

            fd = MCPathes.Uploads + data[0];

            if (isChunkNumber === "0"){
                try{
                    fs.unlinkSync(fd);
                } catch (e){}
            }
        }

        postData.push(postDataChunk);
        postDataLength += postDataChunk.length;

        fragment ++;

        if (postDataLength > MCServer.maxUploadData){
            console.err("POST data is too large. Break connection.");

            res.statusCode = 403;
            res.end("WTF?");

            req.removeAllListeners();

            postData = null;
        }
    });

    req.addListener("end", function() {
        if (postData && postData.length > 0){
            fs.appendFileSync(fd, Buffer.concat(postData));

            res.statusCode = 200;
            res.end("ok|" + isChunkNumber + "|" + fragment);
        }
    });
}

function uploader (req, res) {
    function isWeb(){
        // console.log('checkUploadRights(sid): ' + checkUploadRights(sid));
        // console.log('cLength: ' + cLength);
        // console.log('cLength <= MCServer.maxUploadData: ' + (cLength <= MCServer.maxUploadData));

        return sid
            && checkUploadRights(sid)
            && cLength
            && cLength <= MCServer.maxUploadData;
    }

    if (req.method == 'POST' /*|| !URL.parse(req.url).query*/){
        var query   = URL.parse(req.url).query;

        var purl    = _purl(req.url);
        var sid     = purl.param('sid');

        var cLength = req.headers['content-length'] || 0;
        var cType   = req.headers['content-type'] || "";
        //var socket  = this;
        var info    = [];

        /*if (query) {
            sid = query.split('=');
        }*/

        if (cType.indexOf('MyChat') === 0){
            info = cType.split('/');

            cType = 'MyChat';
        }

        if (isWeb()){
            if (cType === 'pastImage/Base64'){
                webImage(req, res);
            } else {
                webFile(req, res);
            }
        } else
        if (cType === 'MyChat') {
            mcFile(req, res, info);
        } else {
            console.warn('Rejected file from: ' + req.url);

            sendToClient(res, {
                status   : 'error'
            }, 403);
        }
    }
}

exports.upload = uploader;