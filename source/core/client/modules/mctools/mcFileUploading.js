/**
 * Created by Gifer on 10.07.2015.
 */


function mcFileUploading($rootScope){
    "use strict";

    var uploader   = null;
    var errorCallback = null;
    var successCallback = null;
    var uploaderOptions = {};
    var inputFileName = "__fileSender__";
    var abortUploadingID = null;
    var abortPreparingUploading = null;
    var abortUploadingCB = null;
    var abortNow = false;
    var whereWeWork = "";

    function parseFile(file, callback) {
        var fileSize  = file.size;
        var chunkSize = 512 * 1024; // bytes
        var offset    = 0;
        var chunkReaderBlock = null;
        var onePercent     = file.size / 100;
        var currentPercent = 0;

        var readEventHandler = function (evt) {
            if (!abortNow){
                if (evt.target.error == null) {
                    offset += evt.target.result.byteLength;
                    currentPercent = (offset / onePercent).toFixed();

                    callback(null, evt.target.result, currentPercent); // callback for handling read chunk
                } else {
                    callback(evt.target.error);

                    return;
                }

                if (offset >= fileSize) {
                    callback(null, null, 100);

                    return;
                }

                chunkReaderBlock(fileReader, offset, chunkSize, file);
            }
        };

        chunkReaderBlock = function (_reader, _offset, length, _file) {
            var reader = _reader || new FileReader();
            var blob   = _file.slice(_offset, length + _offset);

            if (!_reader) {
                if (uploaderOptions.onBeforeFileAdd) {
                    uploaderOptions.onBeforeFileAdd(file);
                }

                if (!abortPreparingUploading){
                    abortPreparingUploading = function () {
                        reader.abort();
                        reader.onload = null;

                        abortPreparingUploading = null;
                    }
                }

                reader.onload = readEventHandler;
            }

            reader.readAsArrayBuffer(blob);

            return reader;
        };

        var fileReader = chunkReaderBlock(null, offset, chunkSize, file);
    }

    function startUploadAfterCheck(info, file) {
        uploaderOptions.Hash     = info.Hash; // SHA1 хэш файла
        uploaderOptions.Width    = $rootScope.thumbsSize.x; // произвольная ширина уменьшеной копии изображения
        uploaderOptions.Height   = $rootScope.thumbsSize.y; // произвольная высота уменьшенной копии изображения
        uploaderOptions.FileName = info.FileName; // локальное название файла

        if (!info.Present) { // file not exist - uploading
            uploader.define("upload", mcService.getLocalHostPath($rootScope.isWebClient) + "/uploading/?sid=" + mcConst.SessionID + "&hash=" + info.Hash + whereWeWork);
            uploader.addFile(file);
        } else {
            if (successCallback) {
                successCallback.apply(uploaderOptions, arguments);
            } else {
                console.trace('No set success callback on file uploading');
            }
        }
    }

    function electronUploader() {
        $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
            mcConst._CMD_.ce_file_upload_start,
            uploaderOptions.filePath,
            {
                Where    : uploaderOptions.Where,
                ID       : uploaderOptions.ID,
                Type     : uploaderOptions.Type,
                chatType : uploaderOptions.chatType
            }
        ]);

        abortUploadingCB = function () {
            abortUploadingCB = null;

            $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                mcConst._CMD_.ce_file_upload_abort
            ]);
        };
        
        abortPreparingUploading = function () {
            abortPreparingUploading = null;

            $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                mcConst._CMD_.ce_file_upload_prepare_abort
            ]);
        };
    }

    function checkFileExist(params, cb) {
        $rootScope.SendCMDToServer(
            [ mcConst._CMD_.cs_is_file_exists, mcConst.SessionID ]
            .concat(params || [])
            .concat(cb)
        );
    }

    function _goUploadClipboardImage() {
        var calcSha1   = mcService.SHA1();
        var Hash       = "";
        var fileReader = new FileReader();

        fileReader.onloadend = function() {
            var screenImg = this.result;
            var imageInfo = uploaderOptions.clipboardImage;

            calcSha1.append(screenImg);

            if (!imageInfo.name || (imageInfo.name && imageInfo.name.indexOf("image.") === 0 && !imageInfo.path) ){
                try{
                    imageInfo["name"] = "Screenshot (" + mcConst.UserInfo.Nick + ") " + mcService.formatDate(new Date(), "dd-mm-yyyy hh-nn-ss") + ".png";
                } catch (e) {}
            }

            Hash = calcSha1.end();

            checkFileExist([
                Hash    ,                     // SHA1 хэш файла
                mcConst._CMD_.msgType.IMAGE,  // тип файла. 2 - изображение, 4 - обычный файл
                imageInfo.name,               // локальное название файла
                uploaderOptions.Where,
                uploaderOptions.ID   ,
                mcService.fileTimeStamp()
            ], function (data) {
                startUploadAfterCheck(data, imageInfo);
            });
        };

        fileReader.readAsArrayBuffer(uploaderOptions.clipboardImage);
    }

    function _goUploadFile() {
        var fileInput= this;
        var calcSha1 = mcService.SHA1();
        var file     = fileInput.files[0];
        var MsgType  = uploaderOptions.Type;

        if (file){
            uploaderOptions.fileSize = file.size;
            uploaderOptions.lastModifiedDate = file.lastModified || file.lastModifiedDate;

            setTimeout(function () {
                parseFile(file, function (err, data, percent) {
                    if (err) {
                        console.error("Read error: " + err);
                    } else {
                        if (data) {
                            if (uploaderOptions.onPrepareProgress){
                                uploaderOptions.onPrepareProgress(percent);
                            }

                            calcSha1.append(data);
                        } else {
                            var Hash = calcSha1.end();

                            if (fileInput.value) {
                                fileInput.value = "";
                            }

                            checkFileExist([
                                Hash    ,                 // SHA1 хэш файла
                                MsgType ,                 // тип файла. 2 - изображение, 4 - обычный файл
                                uploaderOptions.Type === mcConst._CMD_.msgType.IMAGE
                                    ? file.name           // локальное название файла
                                    : file.path || file.name,
                                uploaderOptions.Where   , // куда вставлять файл (priv, conf, bbs, broadcast, forum, kanban)
                                uploaderOptions.ID      , // число-идентификатор, для кого отправлять файл:
                                                          // 1, private    - UIN
                                                          // 2, conference - UID
                                                          // 3, forum      - ID топика
                                                          // 4, kanban     - ID таска
                                                          // 5, bbs        - -1
                                                          // 6, broadcast  - -1
                                mcService.fileTimeStamp(file.lastModified || file.lastModifiedDate)
                            ], function (data) {
                                startUploadAfterCheck(data, file);
                            });
                        }
                    }
                });
            }, 100);
        }/* else {
            if (errorCallback){
                errorCallback();
            }
        }*/
    }

    function fileFromDialog() {
        var element  = document.getElementById(inputFileName);

        if (!element){
            element = document.createElement('div');

            element.id        = inputFileName;
            element.className = 'hideFileInput';

            document.body.appendChild(element);
        }

        element.innerHTML = '<input type="file">';

        var fileInput = element.firstChild;

        if (fileInput.value && mcService.isIE()) {
            fileInput.parentNode.replaceChild(
                fileInput.cloneNode(true),
                fileInput
            );

            fileInput = document.getElementById(inputFileName).firstChild;
        }

        switch (uploaderOptions.Type) {
            case mcConst._CMD_.msgType.IMAGE:
                fileInput.accept = "image/png, image/gif, image/jpeg, image/jpg";
            break;

            case mcConst._CMD_.msgType.VIDEO:
                fileInput.accept = "video/mp4, video/x-m4v, .mkv, video/mpeg, video/webm, video/*";
            break;

            default:
                fileInput.accept = "";
        }

        if (fileInput.fileEvent){
            fileInput.removeEventListener('change', fileInput.fileEvent);
        }

        fileInput.fileEvent = _goUploadFile;

        fileInput.addEventListener('change', fileInput.fileEvent);

        fileInput.click();
    }

    function uploadFile(_errorCallback, _successCallback, _uploaderOptions){
        errorCallback   = _errorCallback;
        successCallback = _successCallback;
        uploaderOptions = _uploaderOptions || {};

        // -- clipboard image --
        if (uploaderOptions.clipboardImage) {
            _goUploadClipboardImage();
        } else

        // -- drop file into chat text --
        if (uploaderOptions.filePath && uploaderOptions.dropFile){
            _goUploadFile.apply(uploaderOptions.dropFile);
        } else

        // -- clipboard file, only for electron app --
        if (uploaderOptions.filePath){
            electronUploader();
        } else
        
        // -- file from dialog window --
        {
            fileFromDialog();
        }
    }

    // ========================================================

    var _msg = window._messages_.mcFileUploader = {
        abortUploading          : 'abortUploading',
        abortPreparingUploading : 'abortPreparingUploading',
        uploadFile              : 'uploadFile'
    };

    $rootScope.$on(_msg.abortUploading, function () {
        abortNow = true;

        if (abortPreparingUploading) {
            abortPreparingUploading();
        }

        if (uploader && abortUploadingID) {
            uploader.stopUpload(abortUploadingID);
            uploader.destructor();
        }

        if (abortUploadingCB){
            abortUploadingCB();
        }

        uploaderOptions = {};
    });

    $rootScope.$on(_msg.abortPreparingUploading, function () {
        if (abortPreparingUploading) {
            abortPreparingUploading();
        }

        if (uploader){
            uploader.destructor();
        }
    });

    $rootScope.$on(_msg.uploadFile, function(e,args){
        uploader = $$("uploadAPI");

        if (uploader){
            uploader.destructor();
        }

        abortUploadingID = null;
        abortPreparingUploading = null;
        abortUploadingCB = null;
        abortNow = false;

        whereWeWork = $rootScope.hasOwnProperty("GetChatType") ? "&where=" + $rootScope.GetChatType().toLowerCase() : "";

        var opt = args[2] || {};

        if (!opt.uploadProgress && !$$("uploadProgress")){
            webix.ui({ id: "uploadProgress", view: "list", scroll: false, padding: 0, borderless: true, hidden: true, select: false});
        }

        uploader = webix.ui({
            id     : "uploadAPI",
            view   : "uploader",
            multiple: false,
            link   : opt.uploadProgress || "uploadProgress",
            apiOnly: true,
            on     : {
                onAfterFileAdd: function (file) {
                    abortUploadingID = file.id;

                    if (uploaderOptions.onAfterFileAdd){
                        uploaderOptions.onAfterFileAdd(file);
                    }
                },
                onUploadComplete:function(){
                    if (successCallback) {
                        successCallback.apply(uploaderOptions, []);
                    } else {
                        console.trace('No set success callback on file uploading');
                    }

                    errorCallback = null;
                    successCallback = null;
                },
                onFileUploadError:function(){
                    console.warn("Error during file uploading");

                    if (errorCallback) {
                        errorCallback.apply(null, arguments);
                    }

                    errorCallback = null;
                    successCallback = null;
                }
            }
        });

        uploadFile.apply(null, args);
    });
}