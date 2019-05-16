"use strict";

function mcDialogsList($rootScope, mcPlaySound){

    var ignoreList  = {};
    var statuses    = new MCStatusesList($rootScope);
    var historyList = new MCHistoryDialogsList($rootScope);
    var privateList = new MCPrivatesList($rootScope, drawMessage, historyList, statuses);
    var confList    = new MCConferenceList($rootScope, drawMessage, statuses, mcPlaySound);

    // =================================================

    function drawMessage(msg, noUpdateCounter){
        var currentID   = $rootScope.GetChatID();
        var currentType = $rootScope.GetChatType();
        var uid         = msg.UID;

        if ((uid && !confList.hasMessage(uid, msg.Idx)) ||
            (!uid && (
                (msg.UINFrom && privateList.hasPrivate(msg.UINFrom) && !privateList.hasMessage(msg.UINFrom, msg.Idx)) ||
                (msg.UINTo   && privateList.hasPrivate(msg.UINTo)   && !privateList.hasMessage(msg.UINTo, msg.Idx))
            ))
        ) { // чтобы не отображались офлайн сообщения, которые уже есть в чате

            $rootScope.$broadcast(window._messages_.chatFrame.addChatMessage, [msg]);

            if (msg.UID){
                confList.addMessage(uid, msg.Idx);
            } else

            if (privateList.hasPrivate(msg.UINFrom)){
                var read = (currentID == msg.UINFrom && currentType === 'UIN') && mcConst.isWindowFocused;

                if (privateList.addMessage(msg.UINFrom, msg.Idx, read) &&
                    (!(currentID == msg.UINFrom && currentType === 'UIN') || !(mcConst.isWindowFocused)) ) {
                    
                    $rootScope.SendCMDToServer([
                        mcConst._CMD_.cs_private_msg_got,
                        mcConst.SessionID,

                        msg.UINFrom,
                        msg.Idx
                    ]);
                }

                if (currentID == msg.UINFrom && currentType === 'UIN' && msg.Idx >= privateList.getReadIdx(currentID) && read){
                    
                    $rootScope.SendCMDToServer([
                        mcConst._CMD_.cs_private_msg_read,
                        mcConst.SessionID,

                        currentID,
                        msg.Idx
                    ]);
                }
            } else

            if (privateList.hasPrivate(msg.UINTo)){
                privateList.addMessage(msg.UINTo, msg.Idx);
            }

            if (!msg.History && !msg.UpSync){
                msg.State = privateList.statuses.get(msg.UIN || msg.UINFrom);

                if ( ([$rootScope.chatAliases.Kanban, $rootScope.chatAliases.BBS].indexOf(currentType) >= 0) ||
                    (currentType === 'UID' && currentID != msg.UID && !noUpdateCounter) ){

                    $rootScope.$broadcast('updateCounter', [msg]);
                } else
                if ( (currentType === 'UIN' && msg.UINFrom != mcConst.UserInfo.UIN && !noUpdateCounter) &&
                    ( (currentID != msg.UINFrom && currentID != msg.UINTo) ||
                    (msg.UID != undefined && currentType === 'UID' && currentID != msg.UID)) ){

                    $rootScope.$broadcast('updateCounter', [msg]);
                }
            }
        }
    }

    function changeUserStatuses(_state){
        if (mcConst.LoggedIn){
            var Statuses     = mcService.getStateStatuses(_state);
            var myOfflineIdx = mcService.inArrayNoStrict(mcConst.UserInfo.UIN, Statuses.Offline);

            var UID = $rootScope.GetChatType() == 'UID' ? $rootScope.GetChatID() : -1;

            if (myOfflineIdx != -1) {
                Statuses.Offline.splice(myOfflineIdx, 1);
            }

            for (var i = 0; i < Statuses.Online.length; i ++){
                privateList.setState(Statuses.Online[i], Statuses.States[i]);
            }

            for (var i = 0; i < Statuses.Offline.length; i ++){
                privateList.setState(Statuses.Offline[i], mcConst.states.offline);

                confList.getConfList().forEach(function (uid) {
                    var id = mcService.findItemInArrayOfObj(confList.getConfUsers(uid), Statuses.Offline[i], 'UIN');

                    if (id >= 0 ) {
                        confList.removeUsersFromConf(uid, Statuses.Offline[i]);
                    }
                });
            }

            if (Statuses.Online && Statuses.Online.length > 0){
                Statuses.Online.forEach(function (uin, id) {
                    if (Statuses.States[id] !== undefined){
                        if (!privateList.statuses.set(uin, Statuses.States[id])){
                            statuses.setUserState(uin, Statuses.States[id]);
                        }
                    }
                });
            }

            if (Statuses.Offline){
                Statuses.Offline.forEach(function (uin) {
                    if (!privateList.statuses.set(uin, mcConst.states.offline)){
                        statuses.setUserState(uin, mcConst.states.offline);
                    }
                });
            }

            $rootScope.$broadcast('allUsersOnlineStatusesChanged', [statuses.getAllState()]);
        }
    }

    function getIgnoreList(list){
        list = list.Data.split(mcConst.terminator);

        var count = list.shift();
        var uin, nick, ignores;
        var res = {};

        while (count > 0){
            uin = list.shift();
            nick = list.shift();
            ignores = list.shift();

            res[uin] = {
                UIN: uin,
                DisplayName: nick,
                Ignores: ignores
            };

            count --;
        }

        return res;
    }

    function openPrivate(info){
        var isOpen = privateList.isOpen(info.UIN);

        privateList.addPrivate(info);

        if (info.UIN == 0){
            $rootScope.$broadcast('selectTool');
        }

        if (info.HelloMsg && !isOpen) {
            $rootScope.$broadcast('addCustomMSG', [{
                UIN : info.UIN,
                Text: info.HelloMsg
            }]);
        }
    }
    // =================================================

    var _msg = _messages_.dialogsList = {
        getConfHistory          : 'getConfHistory',
        getQuickUserInfo        : 'getQuickUserInfo',
        OpenConf                : 'OpenConf',
        OpenPrivate             : 'OpenPrivate',
        OpenPrivateRequest      : 'OpenPrivateRequest',
        OnPrivateMessage        : 'OnPrivateMessage',
        OnConfMessage           : 'OnConfMessage',
        addNewConfData          : 'addNewConfData',
        confUserList            : 'confUserList',
        confLeaveUser           : 'confLeaveUser',
        confKickUser            : 'confKickUser',
        onlineOfflineUsers      : 'onlineOfflineUsers',
        getConfUsersList        : 'getConfUsersList',
        leaveConf               : 'leaveConf',
        onConfHistory           : 'onConfHistory',
        getPrivateHistory       : 'getPrivateHistory',
        getIgnoreList           : 'getIgnoreList',
        getUserIgnoreInfo       : 'getUserIgnoreInfo',
        getUserState            : 'getUserState',
        loadUserStatuses        : 'loadUserStatuses',
        getLastUserStates       : 'getLastUserStates',
        removeDialogFromList    : 'removeDialogFromList',
        loadPrivatesFromStorage : 'loadPrivatesFromStorage',
        loadHistoryDialogsList  : 'loadHistoryDialogsList',
        historyRemoveUser       : 'historyRemoveUser',
        updateSmallUserInfo     : 'updateSmallUserInfo',
        // OnOfflineMessage     : 'OnOfflineMessage',
        changeUserState         : 'changeUserState',
        getHistoryMsgRange      : 'getHistoryMsgRange',
        drawHistoryMessages     : 'drawHistoryMessages',
        clearConfOnReconnect    : 'clearConfOnReconnect',
        clearPrivatesOnReconnect: 'clearPrivatesOnReconnect',
        getFirstLastMsg         : 'getFirstLastMsg',
        getMyMessagesState      : 'getMyMessagesState',
        on_private_read_notify  : 'on_private_read_notify',
        on_private_got_notify   : 'on_private_got_notify',

        '----':'----'
    };

    // --- Privates ---

    $rootScope.$on(_msg.updateSmallUserInfo, function(e, args){
        var info = args[0];
        var uin  = info.UIN;

        info.DisplayName = info.Nick;

        privateList.updateUserInfo(uin, info);
    });

    $rootScope.$on(_msg.OpenPrivate, function(e, args){
        var uin = args[0];

        if (uin != mcConst.UserInfo.UIN){
            if (privateList.hasPrivate(uin) && privateList.isOpen(uin)){
                privateList.showPrivate(uin);
            } else

            if (uin.toString()){
                $rootScope.$broadcast('SendCMDToServer' , [
                    mcConst._CMD_.cs_private_request,
                    mcConst.SessionID,
                    uin,
                    mcConst.Lang
                ]);
            }
        }
    });

    $rootScope.$on(_msg.OpenPrivateRequest, function (e, args) {
        openPrivate.apply(null, args);
    });

    $rootScope.$on(_msg.on_private_got_notify, function (e, args) {
        var UIN = args[0].UIN;
        var ID  = args[0].ID;

        privateList.setMyMsgGot(UIN, ID);
    });

    $rootScope.$on(_msg.on_private_read_notify, function (e, args) {
        var UIN = args[0].UIN;
        var ID  = args[0].ID;

        privateList.setMyMsgRead(UIN, ID);
    });

    $rootScope.$on(_msg.OnPrivateMessage, function(e, args){
        privateList.sendMessage.apply(null, args);
    });

    $rootScope.$on(_msg.getMyMessagesState, function(e, args){
        var uin = args[0];

        return privateList.getMyMsgReadState(uin);
    });

    $rootScope.$on(_msg.getPrivateHistory, function(e, args){
        privateList.getPrivateHistory.apply(null, args);
    });

    $rootScope.$on(_msg.clearPrivatesOnReconnect, function(e, args){
        privateList.clearPrivates.apply(null, args);
    });

    $rootScope.$on(_msg.getQuickUserInfo, function(e, args){
        var uin = args[0];
        var cb = args[1];

        if (cb) {
            cb(privateList.getPrivateInfo(uin));
        }
    });

    $rootScope.$on(_msg.loadPrivatesFromStorage, function(){
        privateList.loadFromStorage();
    });

    $rootScope.$on(_msg.getHistoryMsgRange, function(e, args){
        var id   = args[0];
        var type = args[1];

        if (type === $rootScope.chatAliases.UIN){
            privateList.getHistoryMsgRange(id);
        } else {
            confList.getConfHistory(id, mcConst.countHistoryMessagesLoad, true);
        }
    });

    $rootScope.$on(_msg.drawHistoryMessages, function(e, args){
        privateList.drawHistoryMessages.apply(null, args);
    });

    $rootScope.$on(_msg.getFirstLastMsg, function(e, args){
        var uin   = args[0];
        var first = args[1];

        return first ? privateList.getFirstIdx(uin) : privateList.getLastIdx(uin);
    });

    // --- Channels ---

    $rootScope.$on(_msg.getConfHistory, function(e, args){
        confList.getConfHistory.apply(null, args);
    });

    $rootScope.$on(_msg.OpenConf, function(e, args){
        $rootScope.$broadcast('hide' + mcConst.dataModels.BBS);

        confList.showConf.apply(null, args);
    });

    $rootScope.$on(_msg.OnConfMessage, function(e, args){
        confList.confMessage.apply(null, args);
    });

    $rootScope.$on(_msg.addNewConfData, function(e, args){
        confList.addConf.apply(null, args);
    });

    $rootScope.$on(_msg.confUserList, function(e, args){
        confList.addUsersToConf.apply(null, args);
    });

    $rootScope.$on(_msg.confLeaveUser, function(e, args){
        confList.removeUsersFromConf(args[0].UID, args[0].UIN);
    });

    $rootScope.$on(_msg.confKickUser, function(e, args){
        if (args[0].UIN == mcConst.UserInfo.UIN){
            webix.message(mcLang(550, [confList.getConfName(args[0].UID), args[0].ModerDisplayName])); // "550":"Вас изгнали из текстовой конференции \"%s\", модератор \"%s\"",

            confList.removeUsersFromConf(args[0].UID, args[0].UIN);
        } else {
            $rootScope.$broadcast('addCustomMSG', [mcLang(551, [args[0].ModerDisplayName, args[0].UserDisplayName])]); // "551":"Пользователь \"%s\" выгнал пользователя \"%s\" из конференции.",

            confList.removeUsersFromConf(args[0].UID, args[0].UIN);
        }
    });

    $rootScope.$on(_msg.getConfUsersList, function(e, args){
        var uid = args[0];
        var cb  = args[1];

        if (cb){
            cb(confList.getConfUsers(uid));
        }
    });

    $rootScope.$on(_msg.leaveConf, function(e, args){
        confList.leaveConf.apply(null, args);
    });

    $rootScope.$on(_msg.onConfHistory, function(e, args){
        confList.showConfHistory.apply(null, args);
    });

    $rootScope.$on(_msg.clearConfOnReconnect, function () {
        confList.clearUserList();
    });

    // --- History ---

    $rootScope.$on(_msg.historyRemoveUser, function (e, args) {
        historyList.removeUser.apply(null, args);
    });

    $rootScope.$on(_msg.loadHistoryDialogsList, function () {
        historyList.load();
    });

    // --- States ---

    $rootScope.$on(_msg.changeUserState, function (e, args) {
        var user = args[0];

        statuses.setUserState(user.UIN, user.State);

        privateList.statuses.set(user.UIN, user.State);
    });

    $rootScope.$on(_msg.getUserState, function(e, args){
        var uin = args[0];
        var cb  = args[1];

        if (cb) {
            cb(privateList.statuses.get(uin));
        }
    });

    $rootScope.$on(_msg.loadUserStatuses, function(){
        statuses.loadUserStatuses();
    });

    /* - Not Used - */ $rootScope.$on(_msg.getLastUserStates, function(e, args){
        var cb = args[0];

        if (cb) {
            cb(privateList.statuses.getAll());
        }
    });

    $rootScope.$on(_msg.onlineOfflineUsers, function(e, args){
        changeUserStatuses.apply(null, args);
    });

    // --- Other ---

    $rootScope.$on(_msg.getIgnoreList, function(e, args){
        $rootScope.$broadcast("SendCMDToServer", [
            mcConst._CMD_.cs_get_ignores_list,
            mcConst.SessionID,
            
            function( data ){
                var cb = args[0];

                ignoreList = getIgnoreList(data);

                if (cb){
                    cb(ignoreList);
                }
            }
        ])
    });

    $rootScope.$on(_msg.getUserIgnoreInfo, function(e, args){
        var uin = args[0].toString();
        var cb  = args[1];
        var res = null;

        if (ignoreList[uin]){
            res = ignoreList[uin];
        }

        if (cb) {
            cb(res);
        }
    });

    $rootScope.$on(_msg.removeDialogFromList, function(e, args){
        var uin = args[0];

        if (uin !== void(0)){
            $rootScope.$broadcast(window._messages_.dialogsCtrl.removePrivateFromDialogs, [uin]);

            privateList.removePrivate(uin);
        }
    });
}
