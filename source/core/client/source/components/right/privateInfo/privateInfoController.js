"use strict";

function privateInfoController($scope, $rootScope, mcMedia, mcSound){
    $scope.Name = mcConst.dataModels.PrivateInfo;

    var view       = null;
    var what       = "DISPLAYNAME,SEX,UIN,EMAIL,WORK_PHONE,WORK_DIVDEPT,HOME_BIRTHDAY,WORK_POSITION,WORK_COMPANYNAME,CLIENTVERSION,ROLE";
    var currentUIN = 0;
    var fieldInfo  = {
        UIN             : '<i class="fa fa-asterisk"></i>&nbsp;',
        EMAIL           : '<i class="fa fa-envelope-o"></i>&nbsp;',
        WORK_PHONE      : '<i class="fa fa-phone"></i>&nbsp;',
        WORK_DIVDEPT    : '<i class="fa fa-sitemap"></i>&nbsp;',
        HOME_BIRTHDAY   : '<i class="fa fa-birthday-cake"></i>&nbsp;',
        WORK_POSITION   : '<i class="fa fa-briefcase"></i>&nbsp;',
        WORK_COMPANYNAME: '<i class="fa fa-building-o"></i>&nbsp;',
        CLIENTVERSION   : '<i class="fa fa-comments"></i>&nbsp;',
        ROLE            : '<i class="fa fa-users"></i>&nbsp;',
        IGNORE          : '<i class="fa fa-ban red"></i>&nbsp;'
    };
    var sexIcon    = {
        0: "<span class='fa fa-user'></span>",
        1: "<span class='fa fa-male'></span>",
        2: "<span class='fa fa-female'></span>"
    };

    var timerTypingNotify = null;
    var isWebSupportUser = false;

    $scope.PrivateTypingTextNotify = null;
    $scope.noImage      = '<img id="uFotoCanvas" src="' + mcConst.imagesPath.all + 'noimage.png" border="0">';
    $scope.uPrivateInfo = null;
    $scope.uFoto        = null;
    $scope.PrivateState = null;
    $scope.userConfig   = {};
    $scope.callBTN      = {
        startVoiceCall: null,
        startVideoCall: null,
        stopCall      : null
    };

    window._userActions.openUserProfile = function (uin, name){
        $rootScope.$broadcast("changeCenterView", [mcConst.dataModels.UserProfile, uin]);
        $rootScope.$broadcast("selectTool");
    };

    webix.ready(function(){
        mcMedia.prepare();

        mcMedia.onShowMedia = function(data){
            $rootScope.$broadcast('showVideoFrame', [data]);
        };

        mcMedia.onCloseCall = function(data){
            $scope.hideStopCall();

            $rootScope.$broadcast('hideVideoFrame',  [data]);
            $rootScope.$broadcast('SendCMDToServer', [ mcConst._CMD_.cs_media_exit_from_mid, mcConst.SessionID, data.MID]);
        };

        mcMedia.infoMessage = function(txt){
            $rootScope.$broadcast('addCustomMSG', [txt])
        };
    });

    //=======================================

    function fillUserInfo(data, uin){
        $scope.data = data;

        var list = $scope.data.What.split(',');
        var res = [
            mcService.myReplaceFormated(
                '<div class="byCenter bolder brown lHeight30 finger" onclick="window._userActions.openUserProfile(#{uin},\'#{name}\')">#{sex}#{name}</div>',
                {
                    uin         : currentUIN,
                    name        : $scope.data.DISPLAYNAME,
                    sex         : sexIcon[$scope.data.SEX]
                }
            ),

            fieldInfo.UIN + uin
        ];

        $scope.userActionsDisplayName.define('template', res[0]);
        $scope.userActionsDisplayName.refresh();

        $scope.data.HOME_BIRTHDAY = mcService.toNormalDate($scope.data.HOME_BIRTHDAY);

        for (var i = 2; i < list.length; i++)
            if ( $scope.data[list[i]] !== ''){
                if ((list[i] === "HOME_BIRTHDAY" && $scope.data[list[i]] !== "01.01.1900") || (list[i] !== "HOME_BIRTHDAY"))
                    res.push("&nbsp;" + fieldInfo[list[i]] + $scope.data[list[i]]);
            }

        $scope.uPrivateInfo.setHTML(res.join('<br>'));
    }

    function fillPrivateInfo (data, uin){
        $rootScope.$broadcast('getUserIgnoreInfo', [uin, function(ignores){
            if (ignores && ignores.Ignores[1] == '1'){
                data.What += ',IGNORE';

                data.IGNORE = mcService.Lang(50); // "50" : "В игноре",
            }
        }]);

        fillUserInfo(data, uin);

        $rootScope.$broadcast('getUserState', [uin, changeState]);

        $scope.userConfig = $rootScope.customUserOptions.getUser(uin);

        $scope.chckReceiveFiles.setValue($scope.userConfig.autoReceive);
    }

    function startDrawTypingNotify(){
        if (view && view.isVisible()){
            var notifyView = mcService.getFrame('uPrivateTypingNotify');

            if (notifyView && notifyView.className.indexOf('noBG') === -1) {
                notifyView.className += ' noBG';
            }
            mcService.showFrame('animateTypingNotify');

            $scope.PrivateTypingTextNotify.define('template', mcService.Lang(49)); // "49" : "пишет...",
            $scope.PrivateTypingTextNotify.refresh();
        }
    }

    function stopDrawTypingNotify(){
        // var notifyView = mcService.getFrame('uPrivateTypingNotify');

        clearTimeout(timerTypingNotify);

        timerTypingNotify = null;

        mcService.hideFrame('animateTypingNotify');

        if (view && view.className && view.className.indexOf('noBG') !== -1) {
            view.className = view.className.replace(' noBG', "");
        }

        $scope.PrivateTypingTextNotify.define('template', ' ');
        $scope.PrivateTypingTextNotify.refresh();
    }

    function changeState(state){
        if ($scope.PrivateState){
            switch (parseInt(state)){
                case mcConst.states.offline:
                    $scope.PrivateState.define('template', mcService.Lang(29)); break; // "29" : "Не в сети",

                case mcConst.states.online:
                    $scope.PrivateState.define('template', '<span class="green">' + mcService.Lang(30) + '</span>'); break; // "30" : "В сети",

                case mcConst.states.webOnline:
                    $scope.PrivateState.define('template', '<span class="green">' + mcService.Lang(30) + '</span>'); break; // "30" : "В сети",

                case mcConst.states.away:
                    $scope.PrivateState.define('template', '<span class="blue">' + mcService.Lang(31) + '</span>'); break; // "31" : "Нет на месте",

                case mcConst.states.dnd:
                    $scope.PrivateState.define('template', '<span class="red">' + mcService.Lang(32) + '</span>'); break; // "32" : "Не беспокоить",
            }

            $scope.PrivateState.refresh();

            if (mcConst.states.offline == state){
                $scope.callBTN.startShareCall.disable();
                $scope.callBTN.startVideoCall.disable();
                $scope.callBTN.startVoiceCall.disable();
            } else {
                $scope.callBTN.startShareCall.enable();
                $scope.callBTN.startVideoCall.enable();
                $scope.callBTN.startVoiceCall.enable();
            }
        }
    }

    // ======================================

    $scope.showStopCall   = function() {
        if ($scope.callBTN.startVideoCall){
            $scope.callBTN.startShareCall.hide();
            $scope.callBTN.startVideoCall.hide();
            $scope.callBTN.startVoiceCall.hide();

            $scope.callBTN.stopCall.show();
        }
    };

    $scope.hideStopCall   = function() {
        if ($scope.callBTN.stopCall){
            $scope.callBTN.stopCall.hide();

            $scope.callBTN.startShareCall.show();
            $scope.callBTN.startVideoCall.show();
            $scope.callBTN.startVoiceCall.show();
        }
    };

    $scope.startVoiceCall = function() {
        $scope.showStopCall();

        mcMedia.myCall(currentUIN, false, false, $scope.hideStopCall);
    };

    $scope.startVideoCall = function() {
        $scope.showStopCall();

        mcMedia.myCall(currentUIN, true, false, $scope.hideStopCall);
    };

    $scope.startShareCall = function() {
        $scope.showStopCall();

        mcMedia.myCall(currentUIN, false, true, $scope.hideStopCall);
    };

    $scope.stopCall       = function(){
        if (mcMedia.nowCalling()){
            $rootScope.$broadcast('SendCMDToServer', [ mcConst._CMD_.cs_media_call_close, mcConst.SessionID, mcMedia.getUIN()]);

            mcMedia.CloseCall(mcMedia.callStates.stopCall, { DisplayName: $scope.data.DISPLAYNAME });

            mcSound.PlaySound(mcSound.Sounds.End);

            if (!$rootScope.isWebClient) {
                $rootScope.$broadcast(window._messages_.clientData.toggleKioskMode, [false]);
            }
        }
    };

    // -----------------------

    $scope.showRedirect = function(){
        isWebSupportUser = false;
        
        if ($rootScope.GetChatType() === $rootScope.chatAliases.UIN && $rootScope.GetChatID()){
            $scope.RedirectBtn.disable();

            $rootScope.$broadcast('SendCMDToServer', [
                mcConst.lockInterface,
                mcConst._CMD_.cs_get_users_for_redirect_dialog,
                mcConst.SessionID,
                $rootScope.GetChatID(),

                function (list) {
                    // "UIN"        : 8517,                    // пользователь, которого будем редиректить
                    // "WebSupport" : true,                    // true, если это список людей из websupport-а, false - если полный список людей с сервера, кроме Web Guests
                    // "Users"      :                          // список пользователей для редиректа. Массив объектов, в массиве может быть UIN отправителя запроса, его следует пропустить при рендеринге
                    // [{
                    //         "UIN"         : 17,               // UIN пользователя
                    //         "DisplayName" : "Terminator",     // отображаемое в чате имя
                    //         "Avatar"      : 21,               // аватар пользователя
                    //         "Sex"         : 1,                // пол пользователя
                    //         "State"       : 0                 // текущий статус пользователя (0 - свободен)
                    // }]
                    isWebSupportUser = list.WebSupport;

                    $scope.RedirectUserWrap.show();
                    $scope.RedirectUserList.parse(list.Users);
                    
                    $$("FilterRedirectUserEditor").focus();
                }
            ]);
        }
    };

    $scope.hideRedirectList = function(){
        $$("clearBtnRedirectUser").callEvent("onItemClick");

        $scope.RedirectUserWrap.hide();
        $scope.RedirectUserList.clearAll();
        $scope.RedirectBtn.enable();
    };

    $scope.doRedirect = function(userTo){
        if (userTo && $rootScope.GetChatType() === $rootScope.chatAliases.UIN){
            $scope.hideRedirectList();

            $rootScope.$broadcast('SendCMDToServer', [
                mcConst._CMD_.cs_redirect_private_talk,
                mcConst.SessionID,
                
                $rootScope.GetChatID(),
                userTo.UIN
            ]);

            if (isWebSupportUser){
                $rootScope.$broadcast(_messages_.dialogsList.removeDialogFromList, [$rootScope.GetChatID()]);
            }
        }
    };

    $scope.changeOptions  = function() {
        var val = this.getValue();
        var opt = this.config.opt;

        $scope.userConfig[opt] = val;

        $rootScope.customUserOptions.setUserOption(currentUIN, opt, val);
    };

    $scope.directSend     = function() {
        $rootScope.$broadcast(window._messages_.downloadUpload.sendFilesToUser);
    };

    $scope.drawFoto       = function(fotoData){
        if (fotoData && fotoData.CRC32){
            $scope.uFoto.define('template', '<img id="uFotoCanvas" src="data:image/jpg;base64,' + fotoData.Foto +'">');
            $scope.uFoto.refresh();
        }
    };

    $scope.changeView     = function (newView) {
        if (newView === '1'){
            $scope.userInfo.hide();
            $scope.userActions.show();
        } else {
            $scope.userActions.hide();
            $scope.userInfo.show()
        }
    };

    $scope.removeUserFromDialogs = function () {
        $rootScope.$broadcast('removeDialogFromList', [$rootScope.GetChatID()]);
    };

    $scope.getData        = function(uin){
        if (currentUIN != uin){
            $rootScope.$broadcast('SendCMDToServer', [
                mcConst._CMD_.cs_get_uin_foto,
                mcConst.SessionID,
                uin,
                $scope.drawFoto
            ]);

            $rootScope.$broadcast('SendCMDToServer' , [
                mcConst._CMD_.cs_get_private_info,
                mcConst.SessionID,
                uin,
                what,
                function( data ){
                    fillPrivateInfo(data, uin);
                }
            ]);

            $rootScope.setTool($scope.Name);
        }
    };

    $scope.show           = function(uin){
        view = initPrivateInfo($scope);

        if (currentUIN != uin){
            $scope.uPrivateInfo.define('template', "");
            $scope.uPrivateInfo.refresh();

            $scope.uFoto.define('template', ($rootScope.needFoto == 0) ? $scope.noImage : ' ');
            $scope.uFoto.refresh();
        }
    };

    // ===== RECEIVE ====

    $rootScope.$on('sc_media_call',         function Receive_Call(e, args) {
        var obj = args[0];

        mcSound.PlaySound(mcSound.Sounds.Receive);

        if (!$rootScope.isWebClient){
            $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                mcConst._CMD_.ce_show_on_top
            ]);
        }

        mcMedia.callQuestions(obj, function () {
            $rootScope.$broadcast('OpenPrivate', [obj.UIN]);

            $scope.showStopCall();
        });
    });
    $rootScope.$on('sc_media_call_accept',  function Receive_Accept(e, args) { // my call
        var obj = args[0];

        mcMedia.setInfo(obj, obj.Video, false);
        mcMedia.preShow(obj.Video);

        // $rootScope.$broadcast('showVideoFrame', [mcMedia.withVideo(), mcMedia.withSharing()]);
    });
    $rootScope.$on('sc_media_call_reject',  function Receive_Reject(e, args) {
        var obj = args[0];

        if (obj.UIN == mcMedia.getUIN()){
            mcMedia.CloseCall(mcMedia.callStates.reject);
        }
    });
    $rootScope.$on('sc_media_call_close',   function Receive_Close(e, args){
        var obj = args[0];

        if (obj.UIN == mcMedia.getUIN() && mcMedia.nowCalling()){
            mcMedia.CloseCall(mcMedia.callStates.close, { DisplayName: $scope.data.DISPLAYNAME });

            mcSound.PlaySound(mcSound.Sounds.End);
        }
    });
    $rootScope.$on('sc_media_call_error',   function Receive_Error(e, args){
        var _data = args[0];
        var err   = mcService.isObject(_data) ? JSON.stringify(_data) : _data;

        console.warn('Media error code: ' + err);

        if (mcMedia.nowCalling()){
            mcMedia.CloseCall(mcMedia.callStates.error);

            mcSound.PlaySound(mcSound.Sounds.End);
        }
    });
    $rootScope.$on('sc_media_call_busy',    function Receive_Busy() {
        mcMedia.CloseCall(mcMedia.callStates.busy);
    });
    $rootScope.$on('sc_media_ready',        function Receive_Ready(e, args) {
        if (args[0].UIN == mcMedia.getUIN()){    // irrorContainer undefined! Use "setMirror" first!
            mcMedia.recvReady(args[0].UIN);
        }
    });
    $rootScope.$on('sc_media_offer',        function Receive_Offer(e, args) { // call to me
        mcMedia.preShow();
        mcMedia.recvOffer(args[0]);

        // $rootScope.$broadcast('showVideoFrame', [mcMedia.withVideo(), mcMedia.withSharing()]);
    });
    $rootScope.$on('sc_media_answer',       function Receive_Answer(e, args) {
        mcMedia.recvAnswer(args[0]);
    });
    $rootScope.$on('sc_media_ice_candidate',function Receive_Ice_Candidate(e, args) {
        mcMedia.recvCandidate(args[0]);
    });
    $rootScope.$on('sc_media_incoming_call_missed',function Receive_Incoming_Call_Missed(e, args) {
        
    });

    // ================================================

    var _msg = _messages_.privateInfo = {
        stopCurrentCall             : "stopCurrentCall",
        addIgnoreInPrivateInfo      : "addIgnoreInPrivateInfo",
        removeIgnoreInPrivateInfo   : "removeIgnoreInPrivateInfo",
        fillPrivateInfo             : "fillPrivateInfo",
        onlineOfflineUsers          : "onlineOfflineUsers",
        onTypingNotify              : "onTypingNotify",
        HideStopCall                : "HideStopCall",
        redirectUserTo              : "redirectUserTo"
    };

    $scope.$on(_msg.stopCurrentCall, function(){
        $scope.stopCall();
    });

    $scope.$on(_msg.addIgnoreInPrivateInfo, function(e, args){
        var uin = args[0];

        if (uin == currentUIN){
            $scope.data.What += ',IGNORE';
            $scope.data.IGNORE = mcService.Lang(50); // "50" : "В игноре",

            fillUserInfo($scope.data, currentUIN);
        }
    });

    $scope.$on(_msg.removeIgnoreInPrivateInfo, function(e, args){
        var uin = args[0];

        if (uin == currentUIN){
            $scope.data.What = $scope.data.What.toString().replace(',IGNORE', '');

            if ($scope.data.IGNORE) delete $scope.data.IGNORE;

            fillUserInfo($scope.data, currentUIN);
        }
    });

    $scope.$on(_msg.fillPrivateInfo, function(e, args){
        fillPrivateInfo(args[0], currentUIN);
    });

    $scope.$on(_msg.onlineOfflineUsers, function(e, args){
        var Statuses = mcService.getStateStatuses(args[0]);

        if (mcService.inArrayNoStrict(currentUIN, Statuses.Online) >= 0){
            changeState(mcConst.states.online);
        } else
        if (mcService.inArrayNoStrict(currentUIN, Statuses.Offline) >= 0){
            changeState(mcConst.states.offline);

            $scope.stopCall();
        }
    });

    $scope.$on(_msg.onTypingNotify, function(e, args){
        var uin = args[0].UIN;

        if (uin == currentUIN){
            if (!timerTypingNotify){
                startDrawTypingNotify();

                timerTypingNotify = setTimeout(function(){
                    stopDrawTypingNotify();
                }, 5800);
            }
        }
    });

    $scope.$on(_msg.HideStopCall, function(){
        $scope.hideStopCall();
    });

    $scope.$on(_msg.redirectUserTo, function(){
        if ($rootScope.GetChatType() === $rootScope.chatAliases.UIN && $rootScope.GetChatID){
            $rootScope.$broadcast("selectTool", [mcConst.dataModels.PrivateInfo, !$rootScope.$broadcast(_messages_.chatWrapper.isVisibleRightSide)]);

            $scope.SwitchTool.setValue('1');

            $scope.RedirectBtn.callEvent("onItemClick");
        }
    });

    $scope.$on('hide' + $scope.Name, function(){
        view.hide();
        currentUIN = -1;
    });

    $scope.$on('show' + $scope.Name, function(e, args){
        $scope.container = args[0];

        var uin = $rootScope.GetChatID();

        if (uin != currentUIN || $rootScope.getTool() != $scope.Name) {
            $scope.show(uin);
            $scope.getData(uin);

            currentUIN = uin;

            if (mcMedia.nowCalling()){
                $scope.showStopCall();
            }
        }
    });
}
