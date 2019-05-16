/**
 * Created by Gifer on 22.08.2017.
 */

function MCPrivatesList($rootScope, _drawMessage, _historyList, __statuses) {
    var __list     = {};
    var megaIdx    = 999999999;
    var DlgIdx     = 0;
    // var __offlineMsgList = [];

    __statuses.onStatesChange("privates", function (states) {
        Object.keys(__list).forEach(function (uin) {
            __setState(uin, states[uin]);
        });

        // __notifyOfflineMessages();
    });

    function __getPrivate(uin, noCopy) {
        var res = null;

        if (__list.hasOwnProperty(uin)){
            res = noCopy ? __list[uin] : mcService.Marge({}, __list[uin]);
        } else {
            console.warn("getPrivate: Privates list hasn't a private with UIN: " + uin);
        }

        return res;
    }

    function __needHistory(uin) {
        if (__list.hasOwnProperty(uin)){
            return __list[uin].needHistory;
        }
    }

    function __noHistory(uin) {
        if (__list.hasOwnProperty(uin)){
            __list[uin].needHistory = false;
        }
    }

    function __hasMessage(uin, idx) {
        var res  = __getPrivate(uin, true);

        if (res){
            res = res.hasMsgIdx(idx);
        }

        return res;
    }

    function __hasPrivate(uin) {
        return __list.hasOwnProperty(uin);
    }

    function __openPrivate(uin) {
        if (__hasPrivate(uin)) __getPrivate(uin, true).isOpen = true;
    }

    function __closePrivate(uin) {
        if (__hasPrivate(uin)) __getPrivate(uin, true).isOpen = false;
    }

    function __isOpen(uin) {
        if (__hasPrivate(uin)) return __getPrivate(uin, true).isOpen;
    }

    function __eachUser(func) {
        Object.keys(__list).forEach(function (uin) {
            func(uin, __list[uin]);
        });
    }

    function __addPrivateMessage(uin, Idx, read) {
        var res = false;

        if (__hasPrivate(uin)){
            var user = __getPrivate(uin, true);

            if (user.messagesList.indexOf(Idx) === -1) {
                user.messagesList.push(Idx);
            }

            if (user.IDMsgLast <= Idx){ // новый месадж || (user.IDMsgLast === -1 && Idx !== -1)) {
                user.IDMsgLast = Idx;

                if (user.IDMsgGot <= Idx) {
                    user.IDMsgGot = Idx;

                    if (read){
                        user.IDMsgRead = Idx;
                    }

                    res = true;
                }
            }

            if (user.firstMsgIdx >= Idx || (user.firstMsgIdx === megaIdx && Idx !== -1)) {
                user.firstMsgIdx = Idx;
            }
        }

        return res;
    }

    function __getTopInListMsgIdx(uin) {
        return __hasPrivate(uin) ? __list[uin].firstMsgIdx : megaIdx;
    }

    function __getBottomInListMsgIdx(uin) {
        return __hasPrivate(uin) ? __list[uin].IDMsgLast : -1;
    }

    function __getLastGotMsgIdx(uin) {
        return __hasPrivate(uin) ? __list[uin].IDMsgGot : 0;
    }

    function __getUpSyncCount(uin) {
        return __hasPrivate(uin) ? __list[uin].upSync : 0;
    }

    function __getLastReadMsgIdx(uin) {
        return __hasPrivate(uin) ? __list[uin].IDMsgRead : -1;
    }

    function __getMsgIdx(uin, idx) {
        return !__list.hasOwnProperty(uin) || !__list[uin].hasMsgIdx(idx);
    }

    function __drawHistoryMessages(inData){
        //                                                       //     "UINWith" : 17, // (5.24+) пользователь, с которым был приватный разговор
        // [{                                                    //     "Data"    :[{
        //     Idx: 57435                                        //         "UIN"     : 98,                   // кто отправил сообщение
        //     Msg: "L$люди реально есть: *6-220915110051.jpg"   //         "dtUTC"   : "2015.09.01.17.18.35" // когда (UTC)
        //     MsgType: 1                                        //         "MsgType" : 1,                    // тип сообщения
        //     State: 3                                          //         "State"   : 3,                    // статус сообщения
        //     UIN: 6                                            //         "Idx"     : 75,                   // уникальный индекс разговора (пары uin1/uin2)
        //     dt: "22.09.2015.12.10.26"                         //         "Msg"     : "Hello!"              // тело сообщения
        // }]                                                    //     }]
        var source = inData.Data;
        var uin    = inData.UINWith;

        if (source && source.length){
            for ( var i = source.length - 1; i >= 0; i-- ) {
                var UINFrom = source[i].UIN;

                if (source[i].Mod !== mcConst._CMD_.msgMods.DELETED && __getMsgIdx(UINFrom, source[i].Idx)){
                    var user    = source[i].UIN == mcConst.UserInfo.UIN ? mcConst.UserInfo : __getPrivate(source[i].UIN, true);
                    var UINTo   = source[i].UIN == mcConst.UserInfo.UIN ? uin              : mcConst.UserInfo.UIN;

                    if (user){
                        var out     = {
                            UINFrom   : UINFrom,
                            UINTo     : UINTo,
                            Nick      : user.Nick || user.DisplayName,
                            StateFrom : user.State,
                            Sex       : user.Sex,
                            Mod       : source[i].Mod,
                            Idx       : source[i].Idx,
                            Msg       : source[i].Msg,
                            dtUTC     : source[i].dtUTC || source[i].dt,
                            MsgType   : source[i].MsgType,
                            noNotify  : true,
                            History   : true  
                        };

                        __privateMessage(out);
                    } else {
                        console.warn("User UIN: " + source[i].UIN + " closed. History skipped.");

                        break;
                    }
                }
            }
        }
    }

    function __drawUpSyncHistoryMessages(inData){
        //     "UINWith" : 17,                       // (5.24+) пользователь, с которым был приватный разговор
        //     "Data"    :[{
        //         "UIN"     : 98,                   // кто отправил сообщение
        //         "dtUTC"   : "2015.09.01.17.18.35" // когда (UTC)
        //         "MsgType" : 1,                    // тип сообщения
        //         "State"   : 3,                    // статус сообщения
        //         "Idx"     : 75,                   // уникальный индекс разговора (пары uin1/uin2)
        //         "Msg"     : "Hello!"              // тело сообщения
        //     }]
        
        var source = inData.Data;
        var uin    = inData.UINWith;

        if (source && source.length){
            for ( var i = 0; i <= source.length - 1; i++ ) {
                var UINFrom = source[i].UIN;

                if (source[i].Mod !== mcConst._CMD_.msgMods.DELETED && __getMsgIdx(UINFrom, source[i].Idx)){
                    var user     = source[i].UIN == mcConst.UserInfo.UIN ? mcConst.UserInfo    : __getPrivate(source[i].UIN, true);
                    var UINTo    = source[i].UIN == mcConst.UserInfo.UIN ? uin                 : mcConst.UserInfo.UIN;
                    var lastRead = source[i].UIN != mcConst.UserInfo.UIN ? __getMyMsgRead(uin) : false;

                    if (user){
                        var out     = {
                            UINFrom   : UINFrom,
                            UINTo     : UINTo,
                            Nick      : user.Nick || user.DisplayName,
                            StateFrom : user.State,
                            Sex       : user.Sex,
                            Mod       : source[i].Mod,
                            Idx       : source[i].Idx,
                            Msg       : source[i].Msg,
                            dtUTC     : source[i].dtUTC || source[i].dt,
                            MsgType   : source[i].MsgType,
                            noNotify  : lastRead && source[i].Idx <= lastRead, // false,
                            History   : false,
                            UpSync    : lastRead && source[i].Idx <= lastRead
                        };

                        __privateMessage(out);
                    } else {
                        console.warn("User UIN: " + source[i].UIN + " closed. History skipped.");

                        break;
                    }
                }
            }
        }
    }

    function __getPrivateHistory(uin, count){
        if ($rootScope.isWebClient || (mcConst.ClientSettings.SysEventsLoadHistoryType && mcConst.ClientSettings.LoadHistoryToPrivate)){
            __noHistory(uin);

            $rootScope.$broadcast('SendCMDToServer', [
                mcConst._CMD_.cs_sync_private_history_last,
                mcConst.SessionID,
                uin,
                count || mcConst.countHistoryMessagesLoad
            ]);
        }
    }

    function __syncPrivateHistory(uin) {
        var range = __getTopInListMsgIdx(uin);

        if (range.toString() !== '-1'){
            if (range > mcConst.countHistoryMessagesLoad) {
                range = (range - mcConst.countHistoryMessagesLoad) + "-" + range;
            } else {
                range = "1-" + range;
            }

            $rootScope.$broadcast('SendCMDToServer', [
                mcConst._CMD_.cs_sync_private_history,
                mcConst.SessionID,

                uin,
                range
            ]);
        }
    }

    function __upSyncPrivateHistory(uin, next) {
        var range = __getBottomInListMsgIdx(uin);

        if (range.toString() !== '-1'){
            var got    = __getLastGotMsgIdx(uin);
            var upSync = __getUpSyncCount(uin);

            if (upSync){
                range = upSync;
            } else
            if (range === got){
                return; //
            } else
            if (range > got) {
                range = (got + 1) + "-" + range;
            } else {
                range = "1-" + range;
            }


            $rootScope.$broadcast('SendCMDToServer', [
                mcConst._CMD_.cs_sync_private_history,
                mcConst.SessionID,

                uin,
                range,
                next || __drawUpSyncHistoryMessages
            ]);
        }
    }

    // === My Messages ====

    function __setMyMsgReadState(uin, state) {
        if (__hasPrivate(uin)){
            var user = __getPrivate(uin, true);

            user.myMsg = mcService.Marge(user.myMsg, state);
        }
    }

    function __setMyMsgRead(uin, idx) {
        if (__hasPrivate(uin)){
            __getPrivate(uin, true).myMsg.IDMyMsgRead = idx;
            __getPrivate(uin, true).myMsg.IDMyMsgGot  = idx;
        }
    }

    function __setMyMsgGot(uin, idx) {
        if (__hasPrivate(uin)){
            __getPrivate(uin, true).myMsg.IDMyMsgGot = idx;
        }
    }

    function __getMyMsgReadState(uin) {
        if (__hasPrivate(uin)){
            return __getPrivate(uin, true).myMsg;
        }
    }

    function __getMyMsgRead(uin) {
        return __hasPrivate(uin) ? __getPrivate(uin, true).myMsg.IDMyMsgRead : 0;
    }

    function __getMyMsgGot(uin) {
        return __hasPrivate(uin) ? __getPrivate(uin, true).myMsg.IDMyMsgGot : 0;
    }

    // ====================

    function __getPrivateNick(uin) {
        return __list[uin].DisplayName;
    }

    function __showPrivate(uin) {
        if ($rootScope.GetChatTypeID() !== $rootScope.createUIN(uin) && !__getMyMsgGot()){
            __openPrivate(uin);

            $rootScope.SendCMDToServer([
                mcConst._CMD_.cs_private_get_dialog_msg_states,
                mcConst.SessionID,

                uin,
                function (data) {
                    __setMyMsgReadState(data.UIN, {
                        UIN        : data.UIN,
                        IDMyMsgGot : data.IDMsgGot,
                        IDMyMsgRead: data.IDMsgRead
                    });

                    $rootScope.$broadcast("updateMessagesState", [data.UIN]);
                }
            ]);

            $rootScope.SetPrivate(uin);

            $rootScope.needFoto = !!__list[uin].FotoCRC32;

            $rootScope.$broadcast('addNewPrivateDialog', [uin.toString(), __getPrivateNick(uin), __statuses.getUserState(uin)]);
            $rootScope.$broadcast('fillChatFrame',       [__getPrivateNick(uin), "", (__getTopInListMsgIdx(uin) !== megaIdx) || __needHistory(uin)]);
            $rootScope.$broadcast("changeCenterView",    [mcConst.dataModels.ChatFrame]);
            $rootScope.$broadcast('selectTool',          [mcConst.dataModels.PrivateInfo]);

            if (__needHistory(uin)) {
                __getPrivateHistory(uin);
            }
        }

        var lastID = __getBottomInListMsgIdx(uin);
        var readID = __getPrivate(uin, true).IDMsgRead;

        if (lastID > 0 && lastID !== readID && mcConst.isWindowFocused){
            __getPrivate(uin, true).IDMsgRead = lastID;

            $rootScope.SendCMDToServer([
                mcConst._CMD_.cs_private_msg_read,
                mcConst.SessionID,

                uin,
                lastID
            ]);
        }
    }

    function __addPrivate(userPrivate) {
        var res = false;

        if (userPrivate && userPrivate.UIN != mcConst.UserInfo.UIN){
            if (__hasPrivate(userPrivate.UIN)){
                userPrivate = mcService.Marge(__list[userPrivate.UIN], userPrivate);
            } else {
                res = true;
                // DlgIdx
                userPrivate.needHistory  = true;
                userPrivate.isOpen       = false;
                userPrivate.messagesList = [];
                userPrivate.firstMsgIdx  = megaIdx;
                userPrivate.IDMsgGot     = userPrivate.IDMsgGot  || 0;
                userPrivate.IDMsgLast    = userPrivate.IDMsgLast || 0;
                userPrivate.IDMsgRead    = userPrivate.IDMsgRead || 0;
                userPrivate.hasMsgIdx    = function (idx) {
                    return userPrivate.messagesList.indexOf(idx) !== -1;
                };
            }

            userPrivate.DisplayName = userPrivate.Nick || userPrivate.DisplayName;
            userPrivate.myMsg       = {
                IDMyMsgRead : userPrivate.IDMyMsgRead || 0,
                IDMyMsgGot  : userPrivate.IDMyMsgGot  || 0
            };

            // console.log(userPrivate);

            __list[userPrivate.UIN] = userPrivate;

            if (userPrivate.hasOwnProperty('State')){
                __statuses.setUserState(userPrivate.UIN, userPrivate.State);
            }
        }

        return res;
    }

    function __removePrivate(uin) {
        if (__hasPrivate(uin)){
            delete __list[uin];

            $rootScope.SendCMDToServer([
                mcConst._CMD_.cs_del_private_dialog,
                mcConst.SessionID,

                uin
            ]);

            return true;
        }
    }

    function __setState(uin, state) {
        if (__hasPrivate(uin)){
            __getPrivate(uin, true).State = __statuses.setUserState(uin, state);

            $rootScope.$broadcast('changeStateForUser', [uin, state]);

            return true;
        }
    }

    function __loadPrivatesFromStorage(){
        var userList = null;
        var task     = new mcService.TaskList();
        var isReconnect = false;

        task.AddTask(function () {
            $rootScope.$broadcast('SendCMDToServer', [
                mcConst._CMD_.cs_get_private_dialogs,
                mcConst.SessionID,

                function (data) {
                    userList = data;

                    task.Next();
                }
            ]);
        });

        task.AddTask(function () {
            //"DlgIdx" : 7145, // индекс последнего изменения приватных диалогов
            //"Data"   : [
            //    {
            //        "UIN"         : 17,                    // идентификатор собеседника
            //        "IDMsgLast"   : 4567,                  // ID последнего отправленного сообщения
            //        "IDMsgGot"    : 4560,                  // ID последнего полученного сообщения
            //        "IDMsgRead"   : 4560,                  // ID последнего прочитанного сообщения
            //        "dt"          : "26.11.2012.09.18.31", // дата и время последнего сообщения в UTC в формате dd.mm.yyyy.hh.nn.ss.zzz
            //        "DisplayName" : "John Smith",          // отображаемое имя собеседника в чате
            //        "Avatar"      : 1234245435,            // CRC32 контрольная сумма фотографии пользователя
            //        "Sex"         : 1                      // пол пользователя, 0 - unknown, 1 - male, 2 - female
            //    },

            isReconnect = !mcService.isObjectEmpty(__list);

            __closeAllPrivates();

            while (userList.Data.length){
                var user = userList.Data.pop();

                if (user) {
                    user.State = mcConst.states.offline;

                    if (isReconnect && DlgIdx && userList.DlgIdx > DlgIdx && __hasPrivate(user.UIN) &&
                        __getBottomInListMsgIdx(user.UIN) < user.IDMsgLast && __getMyMsgRead(user.UIN) < user.IDMsgRead)
                    {
                        user.upSync      = (__getBottomInListMsgIdx(user.UIN) + 1) + "-" + user.IDMsgLast;
                        user.IDMyMsgRead = user.IDMsgRead;
                        user.IDMyMsgGot  = user.IDMsgGot;
                    } else {
                        user.upSync = "";
                    }

                    __addPrivate(user);

                    if (!isReconnect) {
                        $rootScope.$broadcast('updateCounter', [user, true]); // true - не увеличивать счетчик, а взять только разницу msg.IDMsgLast - msg.IDMsgRead
                    }
                }
            }

            DlgIdx = userList.DlgIdx;
            
            __statuses.loadUserStatuses();

            task.Next();
        });

        task.AddTask(function () {
            __eachUser(function (uin, user) {
                if (isReconnect) {
                    __upSyncPrivateHistory(uin);
                }

                if (user.IDMsgGot < user.IDMsgLast) {
                    $rootScope.SendCMDToServer([
                        mcConst._CMD_.cs_private_msg_got,
                        mcConst.SessionID,

                        user.UIN,
                        user.IDMsgLast
                    ]);

                    user.IDMsgGot = user.IDMsgLast;
                }
            });

            task.Next();
        });

        task.Run();
    }

    function __privateMessage(msg){
        if (msg.hasOwnProperty('UIN') && !msg.hasOwnProperty('UINFrom')){
            msg.UINFrom = msg.UIN;

            delete msg.UIN;
        }

        msg.UINTo   = msg.UINTo.toString();
        msg.UINFrom = msg.UINFrom.toString();
        msg.dt      = mcService.utcTime(msg);

        if (msg.hasOwnProperty('UINFrom')) {
            msg.Idx = msg.Idx || msg.MsgIdx;

            if (msg.UINFrom != mcConst.UserInfo.UIN && !__hasPrivate(msg.UINFrom)) {
                __addPrivate({
                    UIN      : msg.UINFrom.toString(),
                    Nick     : msg.Nick,
                    IDMsgLast: msg.Idx
                });
            }

            var _priv = __getPrivate(msg.UINFrom != mcConst.UserInfo.UIN ? msg.UINFrom : msg.UINTo);

            if (_priv){
                _drawMessage(msg);

                if (!msg.History){
                    _historyList.addOrUpdateUser(_priv, msg.dt);
                }
            }
        } else {
            console.error('No user info in message: ');
            console.log(msg);
        }
    }

    function __clearPrivates() {
        __list = {};
    }
    
    function __closeAllPrivates() {
        __eachUser(__closePrivate);
    }

    // ==========================================

    this.showPrivate = __showPrivate;

    this.addPrivate = function (info) { // onlyAdd используется при вычитке списка приватов с хранилища, поэтому не нужно его дабвлять в историю или сразу показывать в окне
        if (__addPrivate(info)) {
            if (info && info.UIN != mcConst.UserInfo.UIN){
                _historyList.addOrUpdateUser(info, mcService.formatDate(new Date(), 'dd.mm.yyyy.hh.nn.ss'));
            }
        }

        __showPrivate(info.UIN);
    };

    this.updateUserInfo = function (uin, info) {
        if (__list.hasOwnProperty(uin)){
            __list[uin] = mcService.Marge(__list[uin], info);

            __setState(info.UIN, info.State);
        } else
        if (uin != mcConst.UserInfo.UIN){
            console.warn("updateUserInfo: Can't update user info for UIN: " + uin)
        }
    };

    this.getPrivateHistory = __getPrivateHistory;

    this.hasPrivate = __hasPrivate;

    this.hasMessage = __hasMessage;

    this.addMessage = __addPrivateMessage;

    this.isOpen = __isOpen;

    this.closeAllPrivates = __closeAllPrivates;

    this.getPrivateInfo = function (uin) {
        return __getPrivate(uin);
    };

    this.removePrivate = function (uin) {
        if (__removePrivate(uin)){
            // __savePrivatesToStorage();
        }
    };

    this.setState = __setState;

    this.getFirstIdx = __getTopInListMsgIdx;

    this.getLastIdx = __getBottomInListMsgIdx;

    this.getReadIdx = __getLastReadMsgIdx;

    this.setMyMsgGot = __setMyMsgGot;

    this.setMyMsgRead = __setMyMsgRead;

    this.getMyMsgReadState = __getMyMsgReadState;

    this.loadFromStorage = __loadPrivatesFromStorage;

    this.statuses = {
        get: __statuses.getUserState,
        set: __setState,
        getAll: __statuses.getAllState
    };

    this.sendMessage = __privateMessage;

    this.clearPrivates = __clearPrivates;

    //this.offlineMessage = __offlineMessage;  // 7.2 офлайн мессаджей больше нет

    this.getHistoryMsgRange = __syncPrivateHistory;

    this.drawHistoryMessages = __drawHistoryMessages;

    this.upSyncPrivateHistory = __upSyncPrivateHistory;
}
