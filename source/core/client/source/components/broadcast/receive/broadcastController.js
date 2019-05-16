"use strict";

function broadcastController($scope, $rootScope, mcPlaySound){
    $scope.Name = mcConst.dataModels.Broadcast;

    var view               = null;
    var deferredLoadImages = new McDeferredLoadImages();
    var currentBrID        = null;
    var readBroadcasts     = {};
    var broadcasts         = [];
    var canChangeCkb       = true;
    var downloadUploadManager = null;

    $scope.msgType = {
        regular   : 0, // 0 - обычное оповещение,
        needRead  : 1, // 1 - оповещение обязательно к прочтению. Окошко у получателя не закроется, пока тот не подтвердит, что он действительно прочитал сообщение
        needAnswer: 2  // 2 - оповещение требует специального ответа от получателя, и не закроется, пока тот не даст ответ
    };

    function close() {
        var list     = mcService.ObjToString(readBroadcasts);
        var canClose = true;
        var notifyList = {};

        broadcasts.forEach(function (item) {
            if (!((item.msg_type === $scope.msgType.needRead   && readBroadcasts[item.ID] && readBroadcasts[item.ID].read) ||
                  (item.msg_type === $scope.msgType.needAnswer && readBroadcasts[item.ID] && readBroadcasts[item.ID].ReplyText) ||
                  (item.msg_type === $scope.msgType.regular    && readBroadcasts[item.ID])
                )) {
                
                $rootScope.$broadcast('ErrorMsg', [-1, mcLang(612), "", function(){ // "612":"Вы не прочитала все оповещения или не ответили",
                    
                }]);

                canClose = false;
            }

            if (item.read_notify){
                notifyList[item.ID] = {
                    UIN: item.uinOwner
                };
            }
        });

        if (canClose && $scope.brUserList){
            $rootScope.SendCMDToServer([
                mcConst._CMD_.cs_broadcast_just_readed,
                mcConst.SessionID,

                list
            ]);

            $rootScope.SendCMDToServer([
                mcConst._CMD_.cs_broadcast_readed_notify,
                mcConst.SessionID,

                mcService.ObjToString(notifyList)
            ]);

            if (view && view.isVisible()) {
                $scope.removeHotKeys();

                view.hide();
            }

            broadcasts     = [];
            readBroadcasts = {};
            currentBrID    = null;
            
            $scope.brUserList.clearAll();

            if (!$rootScope.isWebClient){
                $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                    mcConst._CMD_.ce_disable_always_on_top
                ]);
            }
        } else {

        }
    }

    // =====================================

    $scope.readMsg = function(val){
        if (currentBrID && canChangeCkb){
            readBroadcasts[currentBrID].read = mcService.convertIntToBool(val);
        }
    };

    $scope.registerHotKeys = function () {
        // $rootScope.hotKeyDispatcher.addPreset(mcConst.dataModels.Broadcast + "global", [{
        //     key   : mcConst.keyCodes.n,
        //     func  : function () {
        //
        //     }
        // }], document, true);
    };

    $scope.removeHotKeys = function () {
        // $rootScope.hotKeyDispatcher.removePreset(mcConst.dataModels.Broadcast + "global");
    };

    $scope.closeBroadcast = function () {
        var item = $scope.brUserList.getItem(currentBrID);

        if (readBroadcasts[currentBrID] && item && item.msg_type === $scope.msgType.needAnswer){
            readBroadcasts[currentBrID].ReplyText = $scope.answer.getValue();
        }

        close();
    };

    $scope.downloadFile = function(id){
        var item = $scope.brFileList.getItem(id);

        if (item && item.Hash){
            var broadcastItem = broadcasts[mcService.findItemInArrayOfObj(broadcasts, currentBrID, "ID")];
            var url           = mcService.getLocalHostPath($rootScope.isWebClient) + "/" + mcConst.pathAliases.AliasFiles + "/" + item.Hash + "/" + encodeURI(item.OriginalFileName);
            var fileInfo      = {
                uin        : broadcastItem.uinOwner,
                displayName: broadcastItem.DisplayName,
                filePath   : "",
                fileDT     : item.UTCWriteTime,
                hash       : item.Hash
            };

            if ($rootScope.isWebClient){
                // window.open(url);
            } else {
                downloadUploadManager.openDownloadUrl(url, fileInfo);
            }
        }
    };

    $scope.selectBroadcast = function (id) {
        var item = $scope.brUserList.getItem(id);

        canChangeCkb = false;
        currentBrID  = id;

        $scope.brTitle     .define("template", mcLang(611) + item.DisplayName + " <span class='Gray monospaceAll'>" + mcService.formatDate(mcService.utcTime(item.dtCreatedUTC), "[hh:nn dd.mm.yyyy]") + "</span>"); // "611":"Оповещение от: ",
        $scope.brMsgContent.define("template", item.msg.split('L$').join("<br>"));

        $scope.brTitle     .refresh();
        $scope.brMsgContent.refresh();

        $scope.brImReadMsg   [item.msg_type === $scope.msgType.needRead   ? "show" : "hide"]();
        $scope.answerResizer [item.msg_type === $scope.msgType.needAnswer ? "show" : "hide"]();
        $scope.answer        [item.msg_type === $scope.msgType.needAnswer ? "show" : "hide"]();
        $scope.brFileListWrap[item.files_list && item.files_list.length ? "show" : "hide"]();
        $scope.brFilesResizer[item.files_list && item.files_list.length ? "show" : "hide"]();

        $scope.brFileList.clearAll();
        $scope.currentFilesCount = 0;

        if (item.files_list){
            $scope.brFileList.parse(item.files_list);
            $scope.currentFilesCount = item.files_list.length;

            $scope.brFilesCount.define("template", mcLang(622) + " [" + $scope.currentFilesCount + "]");
            $scope.brFilesCount.refresh();
        }

        if (!readBroadcasts.hasOwnProperty(currentBrID)){
            readBroadcasts[currentBrID] = {
                ReplyText: "",
            };
        }

        if (item.msg_type === $scope.msgType.needRead) {
            $scope.brImReadMsg.setValue(readBroadcasts[currentBrID].read);
        } else
        if (item.msg_type === $scope.msgType.needAnswer){
            $scope.answer.setValue(readBroadcasts[currentBrID].ReplyText);
        }

        canChangeCkb = true;
    };

    $scope.backupAnswer = function () {
        var item = $scope.brUserList.getItem(currentBrID);

        if (readBroadcasts[currentBrID] && item && item.msg_type === $scope.msgType.needAnswer){
            readBroadcasts[currentBrID].ReplyText = $scope.answer.getValue();

            $scope.answer.setValue("");
        }
    };

    $scope.show = function(_broadcasts){
        broadcasts = _broadcasts;

        if (!downloadUploadManager){
            downloadUploadManager = new DownloadUploadManager($rootScope, function (chatType, ID, info, Type, fType) {
                    
            });

            $scope.initDU     = downloadUploadManager.initViews;
            $scope.dwlMngr    = downloadUploadManager.getViews(mcLang(33)); // "33" :"Отмена",
        }

        view = initBroadcastView($scope, broadcasts);
    };

    //========================================

    var _msg = _messages_.Broadcast = {
        onReceiveBroadcast  : 'onReceiveBroadcast'
    };

    $scope.$on(_msg.onReceiveBroadcast, function (e, args) {
        $scope.show.apply(null, args);

        $scope.registerHotKeys();
    });

    $scope.$on('hide' + $scope.Name, function(){
        close();
    });
}

