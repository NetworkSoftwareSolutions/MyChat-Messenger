"use strict";

function bbsController($scope, $rootScope, mcPlaySound){
    $scope.Name = mcConst.dataModels.BBS;

    var view  = null;
    var deferredLoadImages = new McDeferredLoadImages();

    // =====================================

    function addMSG (bbs){
        // [{
        //     DisplayName: "Andrey Rakov",
        //     ID: 47,
        //     Msg: "sdfsdfsdfsdf",
        //     Top: false,
        //     UIN: 3,
        //     dtActualTo: "30.06.2017.23.59.00",
        //     dtCreated: "22.06.2017.17.11.16"
        // }]

        var div    = document.createElement('div');
        var text   = bbs.Msg.replace(/\u041e\u00ac/g, "");
        var uin    = bbs.UIN;
        var nick   = bbs.DisplayName;
        var time   = (bbs.dtCreated) ? bbs.dtCreated.split('.') : "";
        var date   = '';
        var target = $scope.bbsContent.getNode().firstChild;

        date = (time.length === 6) ? time[0] + "." + time[1] + "." + time[2] + "&nbsp;" : time; // dt[0] + "." + dt[1] + "." + dt[2] + "&nbsp;" +
        time = (time.length === 6) ? time[3] + ":" + time[4] + ":" + time[5] + "&nbsp;" : time; // dt[0] + "." + dt[1] + "." + dt[2] + "&nbsp;" +

        text = mcService.ReplaceURLs(text, { callback: function(text, link){
            var res = "";

            if (/png|jpg|jpeg$/.test(link)){
                res = '<br/><img class="thumbImage" src="' + link + '">';
            }

            return link ? '<a href="' + link + '" title="' + link + '" target="_blank">' + (res || text) + '</a>' : text;
        }}).replace(/\r\n/g, "<br>");

        div.className = bbs.Top ? "messageUser" : "messageMy";

        div.innerHTML = mcService.myReplaceFormated(
            "<div id='#{id}' class='bbsMessage'>" +
                "<div><span class='bbsTime brown'>#{time}</span> <span class='bbsDate gray'>#{date}</span> <span class='bbsName linkColor finger' uin='#{uin}' onclick='_userActions.openUserPrivate.apply(this)'>#{name}</span></div><br>" +
                "<div class='bbsText'>#{text}</div>" +
            "</div>",
            {
                id  : bbs.ID,
                time: time,
                date: date,
                name: nick,
                text: text,
                uin : uin
            }
        );
        
        div.setAttribute('uin', uin);
        div.setAttribute('Idx', bbs.ID);
        div.style.wordBreak = "break-word";

        target.insertBefore(document.createElement('br'), target.firstChild);
        target.insertBefore(div, target.firstChild);
    }

    function showFileLoadingImg(){
        $scope.clipPopupButton.hide();
        $scope.clipPopupLoaderImg.show();

        $scope.enterBBSText.disable();
    }

    function hideFileLoadingImg(){
        if (!$scope.clipPopupButton.isVisible()){
            $scope.clipPopupLoaderImg.hide();
            $scope.clipPopupButton.show();

            $scope.enterBBSText.enable();
        }
    }

    // =====================================
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

    $scope.addNewBBS = function () {
        $scope.inputWrapper.show();
        $scope.bbsResizer.show();

        $scope.enterBBSText.focus();
    };

    $scope.closeBBS = function () {
        $scope.inputWrapper.hide();
        $scope.bbsResizer.hide();

        setTimeout(function(){
            $scope.enterBBSText.setValue('');
            $scope.enterBBSText.$setValue('');
            $scope.enterBBSText.focus();
        }, 10);
    };

    $scope.sendBBS = function () {
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

    $scope.show = function(){
        view = initBbsFrame($scope);
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

    var _msg = _messages_.BBS = {
        refreshBBS  : 'refreshBBS'
    };

    $scope.$on(_msg.refreshBBS, function (e, args) {
        var showNotify = args[0];

        if (view){
            $scope.getData(showNotify);
        }
    });

    $scope.$on('hide' + $scope.Name, function(){
        if (view && view.isVisible()) {
            $scope.removeHotKeys();

            view.hide();
        }
    });

    $scope.$on('show' + $scope.Name, function(e, args){
        $scope.container = args[0];

        $scope.show();

        $scope.getData();

        $scope.registerHotKeys();
    });
}