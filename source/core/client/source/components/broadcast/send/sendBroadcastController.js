"use strict";

function sendBroadcastController($scope, $rootScope, mcPlaySound){
    $scope.Name = mcConst.dataModels.Broadcast;

    var view  = null;
    var deferredLoadImages = new McDeferredLoadImages();

    // =====================================

    $scope.registerHotKeys = function () {
        $rootScope.hotKeyDispatcher.addPreset(mcConst.dataModels.BBS, [{
            key   : mcConst.keyCodes.enter,
            func  : $scope.sendText
        }, {
            key   : mcConst.keyCodes.esc,
            func  : $scope.closeBBS
        }], $scope.enterBBSText.getNode());

        $rootScope.hotKeyDispatcher.addPreset(mcConst.dataModels.BBS + "global", [{
            key   : mcConst.keyCodes.n,
            altKey: true,
            func  : $scope.addNewBBS
        }], document);
    };

    $scope.removeHotKeys = function () {
        $rootScope.hotKeyDispatcher.removePreset(mcConst.dataModels.BBS);
        $rootScope.hotKeyDispatcher.removePreset(mcConst.dataModels.BBS + "global");
    };

    $scope.addNewBroadcast = function () {
        $scope.inputWrapper.show();
        $scope.bbsResizer.show();

        $scope.enterBBSText.focus();
    };

    $scope.closeBroadcast = function () {
        $scope.inputWrapper.hide();
        $scope.bbsResizer.hide();

        setTimeout(function(){
            $scope.enterBBSText.setValue('');
            $scope.enterBBSText.$setValue('');
            $scope.enterBBSText.focus();
        }, 10);
    };

    $scope.sendBroadcast = function () {
        var msg    = mcService.trim($scope.enterBBSText.getValue());
        var expire = mcService.formatDate($scope.bbsLifeTime.getValue(), "dd.mm.yyyy.") +
                     $scope.bbsHours.getValue() + "." + $scope.bbsMinutes.getValue() + ".00";
        var sticky = mcService.convertIntToBool($scope.bbsToTop.getValue());

        if ($rootScope.isWebClient || mcConst.ClientSettings.SoundsSndChatRet) {
            mcPlaySound.PlaySound(mcPlaySound.Sounds.EnterBtn);
        }

        if (msg !== ''){
            msg = msg.replace(/\n/g, '\r\n');

            $rootScope.SendCMDToServer([
                mcConst._CMD_.cs_add_new_bbs,
                mcConst.SessionID,
                JSON.stringify({
                    Expired: expire, // 12.01.2013.14.15.00 до какого времени объявление будет актуально
                    Sticky : sticky, // Sticky "прилепленное" объявление (в самом верху) или обычное
                    Msg    : msg     // содержимое объявления
                })
            ]);

            setTimeout($scope.closeBBS, 50);
        }

        return false;
    };

    $scope.show = function(broadcasts){
        view = initBroadcastView($scope, broadcasts);
    };

    $scope.getData = function (showNotify) {
        $rootScope.SendCMDToServer([
            mcConst._CMD_.cs_get_bbs,
            mcConst.SessionID,
            function (listBBS) {
                $scope.bbsContent.getNode().firstChild.innerHTML = "&nbsp;";
                
                if (listBBS && listBBS.length > 0){
                    var sticked = [];
                    var ordinary = [];
                    var first = listBBS[0];

                    if (showNotify && first){
                        var text = first.Msg.replace(/\u041e\u00ac/g, "");
                        var textForNotify = text.slice(0, 100) + ((text.length > 100) ? '...' : "" );

                        $rootScope.$broadcast('sendCMDToElectron', [
                            mcConst._CMD_.ce_show_notify,

                            first.DisplayName.slice(0, 30) + ((first.DisplayName.length > 30) ? '..' : "" ) + ":",
                            textForNotify,
                            first.ID
                        ]);
                    }

                    listBBS.forEach(function (bbs) {
                        if (bbs.Top) {
                            sticked.push(bbs);
                        } else {
                            ordinary.push(bbs);
                        }
                    });

                    sticked.sort(function (a, b) {
                        return mcService.sortAB(a.dtCreated, b.dtCreated);
                    });

                    ordinary.sort(function (a, b) {
                        return mcService.sortAB(a.dtCreated, b.dtCreated);
                    });

                    ordinary.forEach(function (bbs) {
                        addMSG(bbs);
                    });
                    
                    sticked.forEach(function (bbs) {
                        addMSG(bbs);
                    });
                }
            }
        ]);
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
        if (view && view.isVisible()) {
            $scope.removeHotKeys();

            view.hide();
        }
    });

    // $scope.$on('show' + $scope.Name, function(e, args){
    //
    //     $scope.getData();
    //
    // });
}