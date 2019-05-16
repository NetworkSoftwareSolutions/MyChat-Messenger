/**
 * Created by Gifer on 22.08.2017.
 */

function MCConferenceList($rootScope, _drawMessage, __statuses, mcPlaySound) {
    var __list = {};
    var __timerShowConf = null;
    var __uidToShow = null;
    var megaIdx    = 999999999;
    var getConfHistoryTimeout = null;

    __statuses.onStatesChange("confs", function () {
        var currentChat = $rootScope.GetChatType();
        var currentID   = $rootScope.GetChatID();

        __getConfList().forEach(function (uid) {
            var offline = [];

            __getConfUsers(uid, true).forEach(function (user) {
                if (user.UIN.toString() !== "0" && __statuses.getUserState(user.UIN) == mcConst.states.offline) {
                    var users = __getConfUsers(user.UIN, true);
                    var idx   = mcService.findItemInArrayOfObj(users, user.UIN, "UIN");

                    offline.push(user.UIN);

                    users.splice(idx, 1);
                }
            });

            if (currentChat === $rootScope.chatAliases.UID && currentID == uid){
                $rootScope.$broadcast(window._messages_.confUsers.removeUserFromConf, [offline]);
            }
        });
    });

    function __hasConf(uid){
        return __list.hasOwnProperty(uid);
    }

    function __getConfList() {
        return Object.keys(__list) || [];
    }

    function __getConf(uid, noCopy) {
        var res = null;

        if (__hasConf(uid)){
            res = noCopy ? __list[uid] : mcService.Marge({}, __list[uid]);
        } else {
            console.warn("getConf: Conference list hasn't a conf with UID: " + uid);
        }

        return res;
    }

    function __getConfUsers(uid, noCopy) {
        var res = [];

        if (__hasConf(uid)){
            if (noCopy){
                res = __list[uid].users;
            } else {
                __list[uid].users.forEach(function (user) {
                    res.push(mcService.Marge({}, user));
                });
            }
        } else {
            console.warn("getConfUsers: Conference list hasn't a conf with UID: " + uid);
        }

        return res;
    }

    function __getConfName(uid) {
        return __list[uid].Name || "";
    }

    function __showConf(uid, pass){
        if (__hasConf(uid)){
            $rootScope.SetConf(uid);

            $rootScope.$broadcast('fillChatFrame',    [__getConf(uid, true).Name, __getConf(uid, true).Topic, true]);
            $rootScope.$broadcast("changeCenterView", [mcConst.dataModels.ChatFrame]);
            $rootScope.$broadcast('selectTool',       [mcConst.dataModels.ConfUserList]);

            if (!__list[uid].hasHistory){
                __getConfHistory(uid);
            }
        } else {
            $rootScope.$broadcast('SendCMDToServer', [
                mcConst.lockInterface,
                mcConst._CMD_.cs_join_txt_channel,
                mcConst.SessionID,
                uid,
                pass || "",

                function (data) {
                    $rootScope.$broadcast("selectDialog",     ["UID-" + data.UID]);
                }
            ]);
        }
    }

    function __addConf(newConf){
        var uid = newConf.UID;

        if (getConfHistoryTimeout){
            clearTimeout(getConfHistoryTimeout);
            getConfHistoryTimeout = null;
        }

        if (!__hasConf(uid)){
            __list[uid] = mcService.Marge(newConf, {
                users       : [],
                messagesList: [],
                hasHistory  : false,
                firstConvID : megaIdx,
                lastConvID  : 0,
                hasMsgIdx   : function (idx) {
                    return this.messagesList.indexOf(idx) !== -1;
                }
            });

            $rootScope.$broadcast('addNewConfToDialogs', [uid, __getConfName(uid)]);

            if (!getConfHistoryTimeout){
                getConfHistoryTimeout = setTimeout(function () {
                    __getConfHistory(uid);

                    getConfHistoryTimeout = null;
                }, 100);
            }
        } else {
            var delta = newConf.ConvID - __getLastMsgIdx(uid);

            __list[uid] = mcService.Marge(newConf, __list[uid]);

            __getConfHistory(uid, delta);
        }

        __addUsersToConf(uid, [{
            UIN        : mcConst.UserInfo.UIN,
            DisplayName: mcConst.UserInfo.Nick,
            Sex        : mcConst.UserInfo.Sex,
            State      : mcConst.UserInfo.State
        }]);

        if ($rootScope.GetChatType() !== $rootScope.chatAliases.UID) {
            __showConf(uid);
        }
    }

    function __removeConf(uid) {
        if (__hasConf(uid)){
            delete __list[uid];

            return true;
        }
    }

    function __addUsersToConf (uid, users){
        if (__hasConf(uid)){
            var userList = __getConfUsers(uid, true);

            while (users.length > 0) {
                var currentUser = users[0];

                currentUser.id = currentUser.UIN.toString();

                if (!currentUser.DisplayName){
                    currentUser.DisplayName = currentUser.Nick;
                }

                var idx = mcService.findItemInArrayOfObj(userList, currentUser.UIN, 'UIN');

                if (idx < 0){
                    userList.push(currentUser);
                } else {
                    userList[idx] = currentUser;
                }

                users.shift();
            }

            if ($rootScope.GetChatID() == uid && $rootScope.GetChatType() === $rootScope.chatAliases.UID){
                $rootScope.$broadcast(window._messages_.confUsers.addUserToConf, [__getConfUsers(uid)]);
            }

            if ($rootScope.isWebClient || mcConst.ClientSettings.SoundsSndJoin) {
                mcPlaySound.PlaySound(mcPlaySound.Sounds.JoinConf);
            }

            $rootScope.$broadcast(window._messages_.dialogsCtrl.updateChUserCount, [uid, userList.length]);
        } else {
            console.log('__addUsersToConf: uid=' + uid + ' not in list');
        }
    }

    function __removeUsersFromConf(uid, uin){
        if (__hasConf(uid)){
            var userList = __getConfUsers(uid, true);

            userList.splice(mcService.findItemInArrayOfObj(userList, uin, 'UIN'), 1);

            if ($rootScope.GetChatID() == uid && $rootScope.GetChatType() === $rootScope.chatAliases.UID) {
                $rootScope.$broadcast(window._messages_.confUsers.removeUserFromConf, [uin.toString()]);
            }

            if ($rootScope.isWebClient || mcConst.ClientSettings.SoundsSndLeave) {
                mcPlaySound.PlaySound(mcPlaySound.Sounds.LeaveConf);
            }

            if (uin == mcConst.UserInfo.UIN){
                $rootScope.$broadcast(window._messages_.dialogsCtrl.removeConfFromDialogs, [uid]);

                __removeConf(uid);
            } else {
                $rootScope.$broadcast(window._messages_.dialogsCtrl.updateChUserCount, [uid, userList.length]);
            }
        }
    }

    function __leaveConf(uid){
        if (__hasConf(uid)) {
            $rootScope.$broadcast('SendCMDToServer', [
                mcConst._CMD_.cs_leave_txt_channel,
                mcConst.SessionID,
                uid
            ]);
        }
    }

    function __getConfHistory(uid, count, more){
        if (__hasConf(uid) && ($rootScope.isWebClient || (mcConst.ClientSettings.SysEventsLoadHistoryType && mcConst.ClientSettings.LoadHistoryToConf))) {
            if (!count) {
                __getConf(uid, true).noNeedHistory = true;
            }

            __list[uid].hasHistory = true;

            if (more){
                var range = (__getFirstMsgIdx(uid) - mcConst.countHistoryMessagesLoad) + "-" + (__getFirstMsgIdx(uid) - 1);

                $rootScope.$broadcast('SendCMDToServer' , [
                    mcConst._CMD_.cs_sync_conf_history,
                    mcConst.SessionID,

                    uid,
                    range,

                    function (data) {
                        data.Users = mcService.convertArrayToObj(data.Users, "UIN");
                        
                        __showConfHistory(data, false);
                    }
                ]);
            } else {
                $rootScope.$broadcast('SendCMDToServer' , [
                    mcConst._CMD_.cs_get_channel_history_messages,
                    mcConst.SessionID,

                    uid,
                    mcConst.historyTypes.count,
                    count || mcConst.countHistoryMessagesLoad,
                    "", "", "", // >From >To >List

                    function (data) {
                        __showConfHistory(data, !!count);
                    }
                ]);
            }
        }
    }

    function __showConfHistory(source, notHistory){
        function _inner_showMessage(msg) {
            if (msg.Mod != mcConst._CMD_.msgMods.DELETED) {

                msg.DisplayName = msg.DisplayName || source.Users[msg.UIN].DisplayName;
                msg.Idx  = msg.Idx || msg.MsgIdx;
                msg.UIN  = msg.UIN.toString();
                msg.Nick = msg.DisplayName;
                msg.UID  = uid;
                msg.dt   = mcService.utcTime(msg);
                msg.History = !notHistory;

                _drawMessage(msg, true);
            }

            setTimeout(function () {
                currentCnt = currentCnt >= sleepCount ? 0 : currentCnt;

                var first = !notHistory ? messages.pop() : messages.shift();

                if (first) {
                    _inner_showMessage(first);
                }
            }, currentCnt >= sleepCount ? 200 : 2);
        }

        var messages   = mcService.isString(source.Data) ? JSON.parse(source.Data.replace(/\r\n/g, "\\r\\n")) : source.Data;
        var uid        = source.UID;
        var sleepCount = 100;
        var currentCnt = 0;

        var first = !notHistory ? messages.pop() : messages.shift();

        if (first) {
            _inner_showMessage(first);
        }
    }

    function __confMessage(msg) {
        var uid = msg.UID;

        if (__hasConf(uid)){
            var userList = __getConfUsers(uid, true);

            msg.Nick = userList[mcService.findItemInArrayOfObj(userList, msg.UIN, 'UIN')].DisplayName;
            msg.Idx  = msg.Idx || msg.MsgIdx;
            msg.UIN  = msg.UIN.toString();
            msg.dt   = mcService.utcTime(msg);

            _drawMessage(msg);

            if (msg.MsgType !== mcConst._CMD_.msgType.ADM_DELETE_MESSAGE && ($rootScope.isWebClient || mcConst.ClientSettings.SoundsSndChat)){
                mcPlaySound.PlaySound(mcPlaySound.Sounds.ConfMsg);
            }
        }
    }

    function __hasMessage(uid, idx) {
        var res  = __getConf(uid, true);

        if (res){
            res = res.hasMsgIdx(idx);
        }

        return res;
    }

    function __addMessage(uid, idx) {
        if (__hasConf(uid)){
            var conf = __getConf(uid, true);

            if (conf.messagesList.indexOf(idx) === -1) {
                conf.messagesList.push(idx);
            }

            if (conf.lastConvID <= idx){
                conf.lastConvID = idx;
            }

            if (conf.firstConvID >= idx){
                conf.firstConvID = idx;
            }
        }
    }

    function __getLastMsgIdx(uid) {
        return __hasConf(uid) ? __list[uid].lastConvID : 0;
    }

    function __getFirstMsgIdx(uid) {
        return __hasConf(uid) ? __list[uid].firstConvID : megaIdx;
    }

    function __clearUserList() {
        for (var uid in __list){
            __list[uid].users = [];
        }
    }

    // ----------------------------

    this.showConf = __showConf;

    this.addConf = __addConf;

    this.addUsersToConf = __addUsersToConf;

    this.removeUsersFromConf = __removeUsersFromConf;

    this.leaveConf = __leaveConf;

    this.getConfHistory = __getConfHistory;

    this.showConfHistory = __showConfHistory;

    this.confMessage = __confMessage;

    this.getConf = __getConf;

    this.clearUserList = __clearUserList;

    this.hasMessage = __hasMessage;

    this.addMessage = __addMessage;

    this.getConfList = __getConfList;

    this.getConfUsers = __getConfUsers;

    this.getConfName = __getConfName;
}
