function DownloadUploadManager($rootScope, doneCallBack, __opt) {
    var downloadConstants = {
        UPLOAD          : 1,
        UPLOADBUFFER    : 2,
        DOWNLOAD        : 3,
        PREPARING       : 4,
        UPLOADIRECT     : 5,
        WAITANSWER      : 6,
        DOWNLOADPREP    : 7,
        DOWNLOADDIRECT  : 8
    };

    var currentDuState = false;
    var started        = false;
    var duManager      = this;
    var downloadTools  = {
        Visualisation   : function Visualisation($rootScope){
            var _self = this;
            var _uin  = null;
            var rnd   = mcService.RandomHash(5);
            var vFileUploader = null;
            var vDirectReceive = null;
            var items = {};

            function _abortFileDownloadUpload() {
                switch (currentDuState){
                    case downloadConstants.DOWNLOAD:
                        $rootScope.$broadcast('sendCMDToElectron', [
                            mcConst._CMD_.ce_file_download_abort
                        ]);
                        break;

                    case downloadConstants.WAITANSWER:
                        if (vFileUploader.getUINsend()){
                            $rootScope.$broadcast('sendCMDToElectron', [
                                mcConst._CMD_.ce_file_direct_upload_abort
                            ]);
                        }

                        $rootScope.SendCMDToServer([
                            mcConst._CMD_.cs_files_transfer_request_abort,
                            mcConst.SessionID,
                            $rootScope.GetChatID()
                        ]);
                        break;

                    case downloadConstants.UPLOADIRECT:
                        $rootScope.$broadcast('sendCMDToElectron', [
                            mcConst._CMD_.ce_file_direct_upload_abort
                        ]);

                        $rootScope.SendCMDToServer([
                            mcConst._CMD_.cs_files_transfer_abort,
                            mcConst.SessionID,
                            $rootScope.GetChatID()
                        ]);
                        break;

                    case downloadConstants.UPLOADBUFFER:
                    case downloadConstants.UPLOAD:
                        $rootScope.$broadcast('abortUploading');
                        break;

                    case downloadConstants.PREPARING:
                        $rootScope.$broadcast('abortPreparingUploading');
                        break;

                    case downloadConstants.DOWNLOADPREP:
                        vDirectReceive.reject(true);
                        break;

                    case downloadConstants.DOWNLOADDIRECT:
                        $rootScope.$broadcast('sendCMDToElectron', [
                            mcConst._CMD_.ce_remove_ftp_user,
                            _uin
                        ]);
                        break;
                }

                _self._hideProgressInfo();
            }

            function _acceptFilesReceive() {

            }

            this._getViews  = function (cancelText) {
                return {
                    progressWrapper:
                        { id: "progressWrapper" + rnd, css: "noBGColor byCenter borderTopBottom", height: 30, padding: 0, borderless: true, hidden: true, cols: [
                                { id: "universalProgress" + rnd, borderless: true, css: "noBGColor byCenter", hidden: true,
                                    template: function () {
                                        var html = "&nbsp;";

                                        if (this.progress){
                                            var data = this.progress;

                                            html = mcService.myReplaceFormated(
                                                "<div class='uploader_overall'>" +
                                                "   <div class='uploader_status'>" +
                                                "       <div class='uploader_progress' style='width:#{width}'></div>" +
                                                "       <div class='uploader_message'>#{txt}</div>" +
                                                "   </div>"+
                                                "</div>",
                                                {
                                                    width   : data.percent !== undefined ? data.percent + "%" : 0,
                                                    txt     : data.text + (data.size ? "/" + data.size + " " : " ") + (data.percent !== undefined ? data.percent + "%" : "")
                                                }
                                            );
                                        }

                                        return html;
                                    }
                                },

                                { id: "uploadProgress" + rnd, view: "list", type: "myUploader", css: "uploader_nopadding", scroll: false, padding: 0, borderless: true, hidden: true, select: false},
                                { view: "button", value: cancelText || mcLang(33), width: 105, click: _abortFileDownloadUpload } // "33" :"Отмена",
                            ]
                        },

                    downloadFilesQuestion:
                        { id: "downloadFilesQuestion" + rnd, css: "borderTopBottom", borderless: true, height: 60, hidden: true, rows: [
                                { id: "downloadFileList", view: "template", template: "&nbsp;", padding: 5, borderless: true, css: "whiteBg monospaceAll", scroll: 'y'},

                                { cols: [
                                    {},
                                    { view: "button", value: mcLang(592), maxWidth: 130, click: _acceptFilesReceive}, // "592":"Принять",
                                    { width: 10},
                                    { view: "button", value: mcLang(33),  maxWidth: 130, click: _abortFileDownloadUpload, type: "danger"}, // "33" :"Отмена",
                                    {}
                                ]}

                            ]}
                }
            };

            this.getUploadProgress = function () {
                return "uploadProgress" + rnd;
            };

            this._initViews = function () {
                items.progressWrapper       = $$("progressWrapper" + rnd);
                items.universalProgress     = $$("universalProgress" + rnd);
                items.uploadProgress        = $$("uploadProgress" + rnd);
            };

            this._showDownloadFileList = function (list) {
                _uin = list.UIN;

                $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                    mcConst._CMD_.ce_get_user_folder,
                    list.UIN,
                    list.DisplayName,

                    function (path) {
                        vDirectReceive.setFilesList(list, path);

                        if ($rootScope.customUserOptions.getOption(_uin, "autoReceive")) {
                            setTimeout(function () {
                                vDirectReceive.accept(path);
                            }, 100);
                        } else {
                            $rootScope.$broadcast("selectTool", [mcConst.dataModels.ReceiveFiles]);
                            $rootScope.$broadcast(window._messages_.receiveFiles.setReceiveFilesInfo, [vDirectReceive.getInfo()]);
                        }
                    }
                ]);
            };

            this._hideProgressInfo = function (allOk){
                if (currentDuState){
                    if (items.progressWrapper) items.progressWrapper.hide();

                    if (!allOk && window._messages_.chatFrame) {
                        $rootScope.$broadcast(window._messages_.chatFrame.scrollDownChat);
                    }
                }

                if (allOk){
                    switch (currentDuState){
                        case downloadConstants.DOWNLOAD:
                            webix.message(mcLang(575)); // "575":"Файл скачан",
                        break;

                        case  downloadConstants.UPLOAD:
                            webix.message(mcLang(576)); // "576":"Файл загружен на сервер",
                        break;
                    }
                }

                currentDuState = false;
            };

            this._showProgressInfo = function (clear){
                if (currentDuState){
                    items.progressWrapper.show();
                }

                if (clear){
                    items.uploadProgress.clearAll();
                }

                switch (currentDuState){
                    case downloadConstants.PREPARING:
                    case downloadConstants.DOWNLOAD:
                    case downloadConstants.UPLOADBUFFER:
                    case downloadConstants.UPLOADIRECT:
                    case downloadConstants.DOWNLOADDIRECT:
                        _self._updateProgress({
                            percent : 0,
                            text    : ' ... '
                        });

                        items.universalProgress.show();
                        items.uploadProgress.hide();
                    break;

                    case downloadConstants.WAITANSWER:
                        _self._updateProgress({
                            text: mcLang(583) // "583":"Ожидаем согласие на прием файлов...",
                        });

                        items.universalProgress.show();
                        items.uploadProgress.hide();
                    break;

                    case downloadConstants.UPLOAD:
                        items.universalProgress.hide();
                        items.uploadProgress.show();
                    break;
                }
            };

            this._updateProgress = function (chunk) {
                if (currentDuState){
                    items.universalProgress.define('progress', chunk);
                    items.universalProgress.refresh();
                }
            };

            this._onPrepareProgress = function (percent) {
                _self._updateProgress({
                    percent: percent,
                    text   : 'SHA1 calculating'
                });
            };

            this._abortUploading = _abortFileDownloadUpload;

            this.setFileUploader = function (_fileUploader) {
                vFileUploader = _fileUploader;
            };

            this.setDirectReceive = function (_directReceive) {
                vDirectReceive = _directReceive;
            };

            this.active = function () {
                return !!items.progressWrapper;
            };
        },

        LoadingImages   : function LoadingImages($rootScope) {
            var deferredLoadImages = new McDeferredLoadImages();
            var loadingImgList = {};
            var self = this;
            var autoLoad = null;

            function getImgFromLoadList(hash) {
                return loadingImgList[hash] && loadingImgList[hash].idx && loadingImgList[hash].idx.length ? loadingImgList[hash].idx.shift() : null;
            }

            function getImgNameFromLoadList(hash) {
                return loadingImgList[hash] ? loadingImgList[hash].name : null;
            }

            function getTaskIdLoadList(hash) {
                return loadingImgList[hash] && loadingImgList[hash].ID && loadingImgList[hash].ID.length ? loadingImgList[hash].ID.shift() : null;
            }

            function runLoad(queue, idx, done, onLoadImg){
                self.loadThumbs([queue[idx], getImgNameFromLoadList(queue[idx])], onLoadImg, function () {
                    idx ++;
                    
                    if (idx < queue.length){
                        runLoad(queue, idx, done, onLoadImg);
                    } else
                    if (done) {
                        done();
                    }
                });
            }

            self.loadAllThumbs = function(done, onLoadImg){
                if (!deferredLoadImages){
                    deferredLoadImages = new McDeferredLoadImages();
                }

                var queue = [];

                Object.keys(loadingImgList).forEach(function (hash) {
                    loadingImgList[hash].idx.forEach(function () {
                        queue.push(hash);
                    });
                });
                
                runLoad(queue, 0, done, onLoadImg);
            };

            self.loadThumbs = function (info, cb, done) {
                var fileInfo = mcService.isObject(info) ? info : {
                    Hash    : info[0],
                    FileName: info[1],
                    idx     : info[2]
                };

                if (fileInfo.FileName){
                        $rootScope.SendCMDToServer([
                            mcConst._CMD_.cs_get_image_thumbs,
                            mcConst.SessionID,

                            fileInfo.Hash,                //info[0] , //.Hash     , // SHA1 хэш файла
                            $rootScope.thumbsSize.x     , // произвольная ширина уменьшеной копии изображения
                            $rootScope.thumbsSize.y     , // произвольная высота уменьшенной копии изображения
                            fileInfo.FileName,            //info[1] , // FileName , // локальное название файла
                            mcService.getCurrentChantTypeForFiles($rootScope.GetChatType()),

                            function (data) {
                                var idx = getImgFromLoadList(data.Hash) || fileInfo.idx;

                                if (idx) {
                                    var where   = "/" + $rootScope.GetChatType().toLowerCase() + "/";
                                    var _link   = document.getElementById('link_' + data.Hash + idx);
                                    var _img    = document.getElementById('img_' + data.Hash + idx);

                                    if (where !== "/kanban/" || where !== "/forum/") where = "/";

                                    var imgSrc  = data.Exists && ($rootScope.isWebClient || mcConst.ClientSettings.SysEventsShowImagesInChat)
                                        ? mcService.getLocalHostPath($rootScope.isWebClient) + "/" + mcConst.pathAliases.AliasFiles + where + data.Hash + '-' + $rootScope.thumbsSize.xy + '.jpg'
                                        : mcConst.imagesPath.nofile;
                                    var lnkHref = mcService.getLocalHostPath($rootScope.isWebClient) + "/" + mcConst.pathAliases.AliasFiles + where + data.Hash + "/" + (data.Exists ? encodeURI(data.FileName) : mcConst.imagesPath.nofile);

                                    // if (!_img){
                                    //     console.log('loadThmb: ' + imgSrc);
                                    //     console.log(fileInfo);
                                    //     console.log('loadThmb2: ' + data.Hash + idx);
                                    // }

                                    if (_img && _img.src && _link && _link.href){
                                        _img.src   = imgSrc;
                                        _link.href = lnkHref;

                                        _img.onload = function () {
                                            if (cb) {
                                                cb(this.height, data, getTaskIdLoadList(data.Hash), imgSrc, lnkHref);
                                            }
                                        };

                                        _img.onerror = _img.onabort = function (err) {
                                            console.warn(err);
                                        };
                                    } else
                                        
                                    if (deferredLoadImages) {
                                        deferredLoadImages.addImage(idx, data.Hash, imgSrc, lnkHref);
                                    }
                                } else {
                                    // console.error('Can\'t find image with hash: ' + data.Hash);
                                }

                                if (done){
                                    done(data);
                                }
                            }
                        ]);
                }
            };

            self.loadAllImages = function (cb) {
                if (!deferredLoadImages){
                    deferredLoadImages = new McDeferredLoadImages();
                }

                deferredLoadImages.load(cb);
            };

            self.addImageToLoad = function (hash, idx, name, taskID) {
                if (!loadingImgList.hasOwnProperty(hash)) {
                    loadingImgList[hash] = {
                        idx : [idx],
                        name: name
                    };

                    if (taskID) {
                        loadingImgList[hash].ID = [taskID];
                    }
                } else {
                    if (mcService.inArray(idx, loadingImgList[hash].idx) === -1){
                        loadingImgList[hash].idx.push(idx);

                        if (taskID){
                            if (loadingImgList[hash].ID){
                                loadingImgList[hash].ID.push(taskID);
                            } else {
                                loadingImgList[hash].ID = [taskID];
                            }
                        }
                    }
                }
            };

            self.destroy = function () {
                deferredLoadImages = null;
            };

            return self;
        },

        FileUploaderViaServer: function FileUploaderViaServer($rootScope, doneCallBack, _opt) {
            var _uin = null;
            var _filesInfo = null;
            var fVisualisation = null;

            function _sendFileMessage(info, allok) {
                doneCallBack(
                    info.chatType,
                    info.ID,
                    info.Hash + mcConst.CRLF + info.FileName + mcConst.CRLF + mcService.fileTimeStamp(info.lastModifiedDate) + mcConst.CRLF + info.fileSize,
                    info.Type
                );

                fVisualisation._hideProgressInfo(allok);
            }
            function __setUIN(uin, _type) {
                if (_type === $rootScope.chatAliases.UIN) {
                    _uin = uin;
                }
            }
            function __getUIN() {
                return _uin;
            }
            function __clearUIN() {
                _uin = null;
                _filesInfo = null;

                fVisualisation._abortUploading();
            }
            function __onBeforeFileAdd() {
                currentDuState = downloadConstants.PREPARING;

                if (_opt && _opt.onBeforeFileAdd && _opt.onBeforeFileAdd.apply(null, arguments)){
                    __clearUIN();
                } else {
                    fVisualisation._showProgressInfo(true);
                }
            }
            function __onAfterFileAdd() {
                currentDuState = downloadConstants.UPLOAD;

                if (_opt && _opt.onAfterFileAdd && _opt.onAfterFileAdd.apply(null, arguments)){
                    __clearUIN();
                } else {
                    fVisualisation._showProgressInfo();
                }
            }
            // function __getCurrentChantTypeForImages(type) {
            //     var currentChat = type || $rootScope.GetChatType();
            //     var res         = 1;
            //
            //     switch (currentChat){
            //         case $rootScope.chatAliases.UIN   : res = mcConst.whereFiles.private;break;
            //         case $rootScope.chatAliases.UID   : res = mcConst.whereFiles.conf;   break;
            //         case $rootScope.chatAliases.Forum : res = mcConst.whereFiles.forum;  break;
            //         case $rootScope.chatAliases.Kanban: res = mcConst.whereFiles.kanban; break;
            //         case $rootScope.chatAliases.BBS   : res = mcConst.whereFiles.bbs;    break;
            //     }
            //
            //     return res;
            // }

            function __getFilesInfo() {
                return _filesInfo;
            }

            this.getFilesInfo = __getFilesInfo;

            this.getUINsend = __getUIN;
            this.setUINsend = __setUIN;
            this.abortUploading = __clearUIN;
            this.sendFileMessage = _sendFileMessage;

            this._onPasteItemFromClipboard = function (_view){
                var imageID;

                if (!currentDuState){
                    _view.addEventListener("paste", function(e) {
                        var type = $rootScope.GetChatType();

                        if (e.clipboardData.items.length) {
                            for (var i = e.clipboardData.items.length - 1; i >= 0 ; i--) {
                                if (e.clipboardData.items[i].kind === "file" && e.clipboardData.items[i].type === "image/png") {
                                    imageID = i;

                                    var image = e.clipboardData.items[imageID].getAsFile();
                                    var _ID   = $rootScope.GetChatID();

                                    __setUIN(_ID, type);

                                    $rootScope.$broadcast(window._messages_.mcFileUploader.uploadFile, [
                                        function error(){ // info
                                            fVisualisation._hideProgressInfo();

                                            __clearUIN();

                                            webix.alert('Error file uploading!');
                                        },
                                        function success(){ // file
                                            var info = this;

                                            __clearUIN();

                                            info.Type     = mcConst._CMD_.msgType.IMAGE;
                                            info.chatType = type;
                                            info.ID       = _ID;
                                            info.fileSize = image.size;

                                            _sendFileMessage(info);
                                        }, {
                                            onBeforeFileAdd     : __onBeforeFileAdd,
                                            onPrepareProgress   : fVisualisation._onPrepareProgress,
                                            onAfterFileAdd      : __onAfterFileAdd,
                                            uploadProgress      : fVisualisation.getUploadProgress(),

                                            clipboardImage: image, // Получаем файл как Blob (бинарные данные)
                                            Where         : mcService.getCurrentChantTypeForFiles($rootScope.GetChatType()),
                                            ID            : _ID
                                        }
                                    ]);

                                    e.preventDefault();

                                    break;
                                }
                            }
                        } else

                        if (e.clipboardData.files.length >= 0){
                            if (currentDuState){
                                webix.message(mcLang(601)); // "601":"Подождите окончания приема/передачи файлов",
                            } else
                            if (!$rootScope.isWebClient){
                                $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                                    mcConst._CMD_.ce_get_clipboard_files_list
                                ]);
                            }
                        }
                    });
                }
            };

            this.setVisualisation = function (_visualisation) {
                fVisualisation = _visualisation;
            };

            this._uploadFile = function (fileType, filePath, dropFileInfo){
                var currentID = $rootScope.GetChatID();
                var chatType  = $rootScope.GetChatType();

                __setUIN(currentID, chatType);

                $rootScope.$broadcast(window._messages_.mcFileUploader.uploadFile, [
                    function error(){
                        fVisualisation._hideProgressInfo();

                        __clearUIN();

                        webix.alert('Error file uploading!');
                    },
                    function success(){
                        var info = this;

                        __clearUIN();

                        switch (fileType){
                            case mcConst._CMD_.msgType.IMAGE:
                                _sendFileMessage(info);
                            break;

                            default:
                                _sendFileMessage(info, true);
                        }
                    }, {
                        onBeforeFileAdd     : __onBeforeFileAdd,
                        onAfterFileAdd      : __onAfterFileAdd,
                        onPrepareProgress   : fVisualisation._onPrepareProgress,
                        uploadProgress      : fVisualisation.getUploadProgress(),

                        filePath: filePath,
                        chatType: chatType,
                        dropFile: dropFileInfo,

                        Type  : fileType,
                        Where : mcService.getCurrentChantTypeForFiles($rootScope.GetChatType()),
                        ID    : currentID
                    }
                ]);
            };
        },

        DirectReceive   : function DirectReceive($rootScope) {
            var fromUIN    = -1;
            var _list      = {};
            var _totalSize = 0;
            var _totalCnt  = 0;
            var TERMINATOR = mcConst.terminator;
            var self       = this;
            var DisplayName= "";
            var downloadPath = "";
            var drVisualisation = null;

            function parseList(list) {
                var files = list.split(TERMINATOR); // (idx + 1) + TERMINATOR + fileName + TERMINATOR + path + TERMINATOR + size + TERMINATOR + attr + TERMINATOR
                var cnt   = 0;

                _list = {};

                while (cnt++ < _totalCnt){
                    var idx      = files.shift();
                    var fileName = files.shift();
                    var path     = files.shift();
                    var size     = files.shift();
                    var attr     = files.shift();

                    _list[idx] = {
                        fileName: fileName,
                        path    : path,
                        size    : size,
                        attr    : attr
                    };
                }
            }

            function getList() {
                return mcService.convertObjToArray(_list, "idx", true);
            }

            function clear() {
                fromUIN    = -1;
                _list      = {};
                _totalCnt  = 0;
                _totalSize = 0;
                downloadPath = "";
            }

            self.clear = clear;

            self.setFilesList = function (filesInfo, _path) {
                if (!mcService.isObjectEmpty(_list)){
                    clear();
                }

                _totalSize = filesInfo.FilesSize;
                _totalCnt  = filesInfo.FilesCount;
                DisplayName= filesInfo.DisplayName;
                fromUIN    = filesInfo.UIN;
                downloadPath = _path;

                parseList(filesInfo.List);
            };

            self.getCurrentReceiveUIN = function () {
                return fromUIN;
            };

            self.getInfo = function () {
                return {
                    FilesList   : getList(),
                    DisplayName : DisplayName,
                    UIN         : fromUIN,
                    Size        : _totalSize,
                    Count       : _totalCnt,
                    DownloadPath: downloadPath
                };
            };

            self.reject = function (prepare) {
                $rootScope.$broadcast(window._messages_.chatWrapper.hideTool, [mcConst.dataModels.ReceiveFiles]);

                if (!prepare){
                    $rootScope.SendCMDToServer([
                        mcConst._CMD_.cs_files_transfer_deny,
                        mcConst.SessionID,

                        fromUIN
                    ]);
                }

                clear();
            };

            self.accept = function (path) {
                if (!$rootScope.customUserOptions.getOption(fromUIN, "autoReceive")) {
                    $rootScope.$broadcast(window._messages_.chatWrapper.hideTool, [mcConst.dataModels.ReceiveFiles]);
                    $rootScope.$broadcast("selectDialog", ["UIN-" + fromUIN]);
                }

                $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                    mcConst._CMD_.ce_file_direct_receive_start,
                    fromUIN,
                    path,

                    function (info) {
                        $rootScope.SendCMDToServer([
                            mcConst._CMD_.cs_files_transfer_accept,
                            mcConst.SessionID,

                            fromUIN        ,  // идентификатор отправителя файлов
                            info.port      ,  // TCP порт получателя, на который будут передаваться файлы
                            info.interfaces,  // список локальных сетевых интерфейсов получателя
                            ""             ,  // индексы файлов, которые получатель не хочет принимать. Может быть пустым. Индексы перечисляются в текстовой строке через запятую
                            512               // размер буфера для передачи файлов через сервер, если передача напрямую не удастся по техническим причинам
                        ]);

                        currentDuState = downloadConstants.DOWNLOADDIRECT;

                        drVisualisation._showProgressInfo();
                    }
                ]);

                $rootScope.$broadcast(window._messages_.dialogsList.OpenPrivate, [fromUIN]);
            };

            self.addReceiveFile = function (info) {
                if (info.UIN === fromUIN){
                    _list[info.FileIdx].received = true;
                }
            };

            self.setVisualisation = function (_visualisation) {
                drVisualisation = _visualisation;
            }
        }
    };

    // --- Direct Receive ===================================================

    var directReceive = new downloadTools.DirectReceive($rootScope);

    // --- Loading Images ===================================================

    var images = new downloadTools.LoadingImages($rootScope);

    // --- Draw Progress Bar ================================================

    var visualisation = new downloadTools.Visualisation($rootScope);

    // --- Upload Via Server And Direct =====================================

    var fileUploader = new downloadTools.FileUploaderViaServer($rootScope, doneCallBack, __opt);

    // --- Other Functions ==================================================

    directReceive.setVisualisation(visualisation);
    fileUploader .setVisualisation(visualisation);
    visualisation.setFileUploader (fileUploader);
    visualisation.setDirectReceive(directReceive);

    function _downloadUrl(url, fileInfo, auto) {
        if (!$rootScope.isWebClient) {
            $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                mcConst._CMD_.ce_file_download_url,
                url,
                fileInfo,
                auto
            ]);
        }
    }

    function _openDownloadUrl(url, fileInfo) {
        if (!$rootScope.isWebClient) {
            $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                mcConst._CMD_.ce_file_open_or_download,
                url,
                fileInfo
            ]);
        }
    }

    function _openInFolder(hash, uin) {
        $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
            mcConst._CMD_.ce_file_open_in_folder,
            hash,
            uin
        ]);
    }

    function _openFolder(path) {
        $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
            mcConst._CMD_.ce_file_open_folder,
            path
        ]);
    }

    function _isActive() {
        return currentDuState;
    }

    function _sendFilesToUser(fromBuffer) {
        var uin = $rootScope.GetChatID();

        if ($rootScope.GetChatType() === $rootScope.chatAliases.UIN && uin){
            $rootScope.$broadcast('getUserState', [$rootScope.GetChatID(), function (state) {
                if (mcConst.states.offline === state){
                    webix.alert(mcLang(585)); // "585":"Передавать файлы напрямую можно только пользователям онлайн!",
                } else {
                    fileUploader.setUINsend(uin, $rootScope.chatAliases.UIN);

                    if (!$rootScope.isWebClient) $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                        mcConst._CMD_.ce_file_direct_upload_prepare,
                        uin,
                        fromBuffer
                    ]);
                }
            }]);
        }
    }

    function _destroy(){
        images.destroy();

        directReceive = null;
        images        = null;
        visualisation = null;
        fileUploader  = null;

        for (var i in window._messages_.downloadUpload){
            if (i !== '---') $rootScope.$off(window._messages_.downloadUpload[i]);
        }
    }

    if (!$rootScope.isWebClient){
        $rootScope.ElectronErrors[mcConst._CMD_.errElectron.eFileDownload] = function (params) {
            webix.message(params.msg, 'error', 15000);

            console.warn(params);
        };
    }

    // =======================================================================
    // =======================================================================

    duManager.onPasteItemFromClipboard= fileUploader._onPasteItemFromClipboard;
    duManager.sendFilesToUser         = _sendFilesToUser;
    duManager.uploadFile              = fileUploader._uploadFile;
    duManager.abortUploading          = fileUploader.abortUploading;
    duManager.addImageToLoad          = images.addImageToLoad;
    duManager.loadThumbs              = images.loadThumbs;
    duManager.loadAllImages           = images.loadAllImages;
    duManager.loadAllThumbs           = images.loadAllThumbs;
    duManager.getViews                = visualisation._getViews;
    duManager.initViews               = visualisation._initViews;
    duManager.downloadUrl             = _downloadUrl;
    duManager.openDownloadUrl         = _openDownloadUrl;
    duManager.openInFolder            = _openInFolder;
    duManager.isActive                = _isActive;
    duManager.openFolder              = _openFolder;
    duManager.sendText                = function (cb){
        doneCallBack = cb;
    };
    duManager.destroy                 = _destroy;

    // ========================================================================
    // ========================================================================

    var _msg = window._messages_.downloadUpload = {
        changeStateForUser      : 'changeStateForUser',
        pastFilesFromClipboard  : 'pastFilesFromClipboard',
        acceptReceiveFiles      : 'acceptReceiveFiles',
        rejectReceiveFiles      : 'rejectReceiveFiles',
        sendFilesToUser         : 'sendFilesToUser',

        on_file_download_progress : 'on_file_download_progress',
        on_file_download_start    : 'on_file_download_start',
        on_file_download_complete : 'on_file_download_complete',
        on_file_download_aborted  : 'on_file_download_aborted',

        on_file_upload_prepare_progress: 'on_file_upload_prepare_progress',
        on_file_upload_start           : 'on_file_upload_start',
        on_file_upload_prepare_start   : 'on_file_upload_prepare_start',
        on_file_upload_aborted         : 'on_file_upload_aborted',
        on_file_upload_progress        : 'on_file_upload_progress',
        on_file_upload_complete        : 'on_file_upload_complete',

        on_file_check_exist         : 'on_file_check_exist',
        on_file_drop                : 'on_file_drop',
        on_files_transfer_progress  : 'on_files_transfer_progress',

        on_file_direct_upload_wait_accept         : 'on_file_direct_upload_wait_accept',
        on_file_direct_upload_accept              : 'on_file_direct_upload_accept',
        on_file_direct_upload_complete            : 'on_file_direct_upload_complete',
        on_file_direct_upload_no_files            : 'on_file_direct_upload_no_files',
        on_file_direct_download_complete          : 'on_file_direct_download_complete',
        on_file_direct_download_file_received     : 'on_file_direct_download_file_received',
        on_file_direct_receive_client_disconnected: 'on_file_direct_receive_client_disconnected',

        // on_file_direct_upload_file_sended   : 'on_file_direct_upload_file_sended',

        on_file_request_transfer            : 'on_file_request_transfer',


        '---':'---'
    };

    // =====================================================================

    $rootScope.$on(_msg.acceptReceiveFiles, function (e, args) {
        if (visualisation.active()){
            directReceive.accept.apply(directReceive, args);
        }
    });

    $rootScope.$on(_msg.rejectReceiveFiles, function () {
        if (visualisation.active()) {
            directReceive.reject();
        }
    });

    $rootScope.$on(_msg.changeStateForUser, function (e, args) {
        if (visualisation.active()) {
            var uin = args[0];
            var state = args[1];

            if (directReceive.getCurrentReceiveUIN() == uin && state == mcConst.states.offline) {
                directReceive.clear();

                $rootScope.$broadcast(window._messages_.chatWrapper.hideTool, [mcConst.dataModels.ReceiveFiles]);
            } else if (fileUploader.getUINsend() == uin) {
                fileUploader.abortUploading();
            }
        }
    });

    $rootScope.$on(_msg.pastFilesFromClipboard, function (e, args) {
        if (visualisation.active()) {
            var files = args[0];

            if (files && files.length) { //  && $rootScope.GetChatType() === $rootScope.chatAliases.UIN
                fileUploader._uploadFile(mcConst._CMD_.msgType.FILE, files, false);
            }
        }
    });

    $rootScope.$on(_msg.on_file_check_exist, function (e, args) {
        if (visualisation.active()) {
            var id = args[0].id;
            var info = args[0].info;

            if (id && info) {
                $rootScope.SendCMDToServer([
                    mcConst._CMD_.cs_is_file_exists,
                    mcConst.SessionID,

                    info.Hash, // SHA1 хэш файла
                    info.Type, // тип файла. 2 - изображение, 4 - обычный файл
                    info.FileName,
                    info.Where, // куда вставлять файл (priv, conf, bbs, broadcast, forum, kanban)
                    info.ID, // число-идентификатор, для кого отправлять файл:
                    mcService.fileTimeStamp(info.lastModifiedDate),

                    function (data) {
                        if (data.Present) {
                            fileUploader.sendFileMessage(info);
                        } else {
                            $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                                mcConst._CMD_.ce_file_check_exist,
                                id
                            ])
                        }
                    }
                ]);
            }
        }
    });

    $rootScope.$on(_msg.on_file_drop, function (e, args) {
        if (visualisation.active()) {
            var dataTransfer = args[0];

            fileUploader._uploadFile(mcConst._CMD_.msgType.FILE, true, dataTransfer);
        }
    });

    $rootScope.$on(_msg.on_files_transfer_progress, function (e, args) {
        if (visualisation.active()) {
            visualisation._updateProgress.apply(visualisation, args);
        }
    });

    // --- download ---

    $rootScope.$on(_msg.on_file_download_start, function () {
        if (visualisation.active()) {
            currentDuState = downloadConstants.DOWNLOAD;

            visualisation._showProgressInfo();
        }
    });

    $rootScope.$on(_msg.on_file_download_progress, function (e, args) {
        if (visualisation.active()) {
            visualisation._updateProgress.apply(visualisation, args);
        }
    });

    $rootScope.$on(_msg.on_file_download_aborted, function () {
        if (visualisation.active()) {
            visualisation._hideProgressInfo();
        }
    });

    $rootScope.$on(_msg.on_file_download_complete, function () {
        if (visualisation.active()) {
            visualisation._hideProgressInfo(true);
        }
    });

    // --- upload ---

    $rootScope.$on(_msg.on_file_upload_start, function () {
        if (visualisation.active()) {
            currentDuState = downloadConstants.UPLOADBUFFER;

            visualisation._showProgressInfo();
        }
    });

    $rootScope.$on(_msg.on_file_upload_progress, function (e, args) {
        if (visualisation.active()) {
            visualisation._updateProgress.apply(visualisation, args);
        }
    });

    $rootScope.$on(_msg.on_file_upload_aborted, function (e, args) {
        if (visualisation.active()) {
            var uin = args[0];

            fileUploader.abortUploading();

            if (uin) {
                $rootScope.$broadcast(window._messages_.chatFrame.addCustomMSG, [{
                    UIN: uin,
                    Msg: mcLang(584) // "584":"Передача файлов прервана",
                }]);

                webix.message(mcLang(584));

                $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                    mcConst._CMD_.ce_file_direct_upload_abort
                ]);
            }
        }
    });

    $rootScope.$on(_msg.on_file_upload_complete, function (e, args) {
        if (visualisation.active()) {
            var info = args[0];

            visualisation._hideProgressInfo(true);

            fileUploader.sendFileMessage(info);
        }
    });

    $rootScope.$on(_msg.on_file_upload_prepare_start, function () {
        if (visualisation.active()){
            currentDuState = downloadConstants.PREPARING;

            visualisation._showProgressInfo();
        }
    });

    $rootScope.$on(_msg.on_file_upload_prepare_progress, function (e, args) {
        if (visualisation.active()) {
            var percent = args[0].percent;

            visualisation._onPrepareProgress(percent);
        }
    });

    // --- upload direct ---

    $rootScope.$on(_msg.on_file_direct_upload_wait_accept, function (e, args) {
        if (visualisation.active()) {
            currentDuState = downloadConstants.WAITANSWER;

            visualisation._showProgressInfo();
        }
    });

    $rootScope.$on(_msg.on_file_direct_upload_accept, function (e, args) {
        if (visualisation.active()) {
            var info = args[0];

            currentDuState = downloadConstants.UPLOADIRECT;

            visualisation._showProgressInfo();

            $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                mcConst._CMD_.ce_file_direct_upload_start,
                info
            ]);
        }
    });

    $rootScope.$on(_msg.on_file_direct_upload_complete, function (e, args) {
        if (visualisation.active()) {
            var files = args[0];

            $rootScope.$broadcast(window._messages_.chatFrame.addCustomMSG, [{
                MsgType: mcConst._CMD_.msgType.SHOW_UPLOADED_FILES,
                UIN: fileUploader.getUINsend(),
                FilesList: files.FilesList,
                Count: files.FilesCount,
                Size: files.FilesSize,
                Path: files.filesPath
            }]);

            visualisation._hideProgressInfo(true);
        }
    });

    $rootScope.$on(_msg.sendFilesToUser, function (e, args) {
        if (visualisation.active()) {
            _sendFilesToUser.apply(null, args);
        }
    });

    // --- download direct ---

    $rootScope.$on(_msg.on_file_request_transfer, function (e, args) {
        if (visualisation.active()) {
            currentDuState = downloadConstants.DOWNLOADPREP;

            visualisation._showDownloadFileList.apply(visualisation, args);
        }
    });

    $rootScope.$on(_msg.on_file_direct_upload_no_files, function () {
        if (visualisation.active()) {
            visualisation._hideProgressInfo(true);
        }
    });

    $rootScope.$on(_msg.on_file_direct_download_complete, function () {
        if (visualisation.active()) {
            var files = directReceive.getInfo();

            $rootScope.$broadcast(window._messages_.chatFrame.addCustomMSG, [{
                MsgType: mcConst._CMD_.msgType.SHOW_RECEIVED_FILES,
                UIN: files.UIN,
                FilesList: files.FilesList,
                Count: files.Count,
                Size: files.Size,
                Path: files.DownloadPath
            }]);

            visualisation._hideProgressInfo(true);
        }
    });

    $rootScope.$on(_msg.on_file_direct_download_file_received, function (e, args) {
        if (visualisation.active()) {
            directReceive.addReceiveFile.apply(null, args);
        }
    });

    $rootScope.$on(_msg.on_file_direct_receive_client_disconnected, function (e, args) {
        if (visualisation.active() && directReceive.getCurrentReceiveUIN() === args[0]) {
            visualisation._abortUploading();
        }
    });
}

// ==============   DEFERRED LOAD IMAGES  =======================

function McDeferredLoadImages() {
    var items = {};

    this.addImage = function (idx, hash, src, href) {
        if (!items.hasOwnProperty(idx)) {
            items[idx] = [hash, src, href];
        }
    };

    this.load = function (cb) {
        var count      = Object.keys(items).length;
        var currentIdx = 0;

        Object.keys(items).forEach(function (idx) {
            var hash    = items[idx][0];
            var imgSrc  = items[idx][1];
            var lnkHref = items[idx][2];

            var _link   = document.getElementById('link_' + hash + idx);
            var _img    = document.getElementById('img_' + hash + idx);

            if (_img && _img.src && _link && _link.href){
                _img.src   = imgSrc;
                _link.href = lnkHref;

                console.log('loadAll: ' + imgSrc);

                _img.onload = function () {
                    currentIdx ++;
                    delete items[idx];

                    if (currentIdx === count && cb){
                        cb();
                    }
                };

                _img.onerror =_img.onabort = function (err) {
                    console.warn(err);
                }
            }
        });
    };
}
