"use strict";

function mcCmdParser (mcConnect, $rootScope, mcPlaySound, mcStatistics){
    var SendCMDToServer = {};
    var ProcessCMD      = {};
    var pCmd = {};
    var eCmd = {};
    var lastError = 0;

    this.ProcessCMD = ProcessCMD;
    this.SendCMDToServer = SendCMDToServer;

    $rootScope.ErrorActions   = {};
    $rootScope.ElectronErrors = {};

    var _CMD_ = mcConst._CMD_;

    // ======= Error Actions ==========

    $rootScope.ErrorActions[17] = function(params){ // "17"  : "Пользователь с таким UIN (%s) не зарегистрирован на сервере",
        // var res = true;

        if (mcConst.LoggedIn){
            $rootScope.$broadcast('removeDialogFromList', params);

            // res = false;
        } else {
            if (!$rootScope.isWebClient){
                $rootScope.UNIT.ctrlServersManager.setAutoConnectInfo("", false, "");
            }

            $rootScope.$broadcast('show' + mcConst.dataModels.Login, []);

            // res = false;
        }

        // return res;
    };

    $rootScope.ErrorActions[11] = $rootScope.ErrorActions[17];

    // ===================================

    function customCallBack (cmd, data){
        if ($rootScope.customCallBack[cmd] && $rootScope.customCallBack[cmd].length > 0){

            $rootScope.customCallBack[cmd].shift()(data);

            return true;
        }
    }

    function initSocketIo() {
        return $rootScope.initSocketIo();
    }

    function destroySocketIo() {
        return $rootScope.destroySocketIo();
    }

    // === Electron ======================

    var electronHandler = null;

    this.internalSender = function (args) {   // client => electron "ce_"
        if (electronHandler){
            electronHandler.send('ce_CMD', args); // args = [cmd, ...]
        } else {
            throw new Error('Electron handler not initialized!')
        }
    };

    // ===================================

    /**
     * @return {boolean}
     */
    this.MultiSender = function(){
        var cmd  = arguments[0];
        var sID  = arguments[1];
        var next = true;

        if ((mcConst.socketIO || !$rootScope.isWebClient) && !SendCMDToServer[cmd] && mcService.InObject(cmd, _CMD_)){
            var data = "";

            for (var i = 1; i < arguments.length; i++){
                data += arguments[i] + (i !== arguments.length-1 ?  mcConst.CR : "");
            }

            mcConnect.SendDataToServer({
                CMD  : cmd,
                Data : data
            });

            sendPing(sID);

            next = false;
        }

        return next;
    };

    /**
     * @return {boolean}
     */
    this.MultiParser = MultiParser;

    function MultiParser(cmd, data) {
        if (!pCmd.hasOwnProperty(cmd)){
            return true;
        }

        $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

        customCallBack(pCmd[cmd], mcService.StringToObj(data));
    }

    function criticalError (err){
        return ((mcService.inArray(err, [3, 4, 14, 15,/* 17,*/ 21, 23, 24, 44, 60, 71, 79, 80, 81, 82, 92]) !== -1) && mcConst.LoggedIn) || !mcConst.LoggedIn;
    }

    function runError(numb, params){
        if ($rootScope.ErrorActions[numb]){
            $rootScope.ErrorActions[numb](params);
        } else {
            return false;
        }
    }

    function runElectronError(err){
        if ($rootScope.ElectronErrors[err.code]){
            $rootScope.ElectronErrors[err.code](err);
        } else {
            return false;
        }
    }

    function authRequestList(_data){
        mcConst.UserInfo = mcService.Marge(mcConst.UserInfo, _data || {
            UIN             : 17,        // UIN пользователя, который залогинен в системе
            Nick            : "Chapay",  // ник пользователя, который сообщил ему сервер
            Sex             : 1,         // пол пользователя
            Avatar          : 54,        // номер аватара пользователя
            LoginStyle      : "login",   // тип логина: "login" - обычный логин, "domain" - доменная авторизация
            AutoAwayTime    : 15,        // время в минутах, после которого будет считаться, что пользователь неактивен за компьютером, если он не нажимал ничего на клавиатуре и не шевелил мышкой
            ServerSignature : "MyChat4/16....", // специальная сигнатура сервера MyChat, нужна для системы статистики
            OptionsPresetID : 0,
            OptionsPresetCRC32: 0,
            FotoCRC32       : 0,
            Domain          : "" // если доменная авторизация, "LoginStyle" = "domain", то в этом параметре передаётся ещё и имя домена, с которого проходит аторизация.
            // Если доменной авторизации нет - этот параметр не передаётся
        });

        if (!$rootScope.isWebClient &&
            mcConst.UserInfo.OptionsPresetCRC32 &&
            (mcConst.settingsCRC32 !== mcConst.UserInfo.OptionsPresetCRC32))
        {
            mcConst.settingsCRC32 = mcConst.UserInfo.OptionsPresetCRC32;

            $rootScope.SendCMDToServer([
                mcConst._CMD_.cs_get_options_preset,
                mcConst.SessionID,
                mcConst.UserInfo.OptionsPresetID
            ]);
        }

        mcConst.UserInfo.State = mcConst.states.online;

        mcConst.LoggedIn = true;

        mcService.SaveSessionSettings(mcConst.LoginInfo);

        $rootScope.$broadcast('hide' + mcConst.lockInterface, ["all"]); // unlock

        if (!$rootScope.isWebClient){
            $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                mcConst._CMD_.ce_client_connected,

                mcConst.UserInfo
            ]);
        }

        if ($rootScope.restoreConnection){
            return;
        }

        mcConst.settingsCRC32 = mcConst.UserInfo.OptionsPresetCRC32;

        $rootScope.$broadcast('hide' + mcConst.dataModels.Login, []);

        console.log('Logged in!');
    }

    // ==================================================

    function __reconnect(clear) {
        $rootScope.restoreConnection = false;

        $rootScope.$broadcast('ReconnectLoop');

        // if (mcConst.LoggedIn){
        //     $rootScope.$broadcast(window._messages_.confUsers.clearUserForUID);
        //     $rootScope.$broadcast(window._messages_.dialogsList.clearConfOnReconnect);
        //     $rootScope.$broadcast(window._messages_.dialogsCtrl.clearDialogsList);
        // }

        if (!$rootScope.errorDialog){
            $rootScope.$broadcast('ErrorMsg', [_CMD_.Errors.Disconnected, mcConst.ErrorText[_CMD_.Errors.Disconnected] + "<br>" + mcLang(539) + "<br><br>" + mcConst.loadGif, '', function(){ // "539":"Восстанавливаем связь!",
                if (clear){
                    mcService.ClearSessionSettings(true, true);
                }
                
                location.search = "";
                location.reload();
            }, mcLang(540)]); // "540":"Прервать",
        }
    }

    function loadHistoryLists() {
        $rootScope.$broadcast(window._messages_.dialogsList.loadPrivatesFromStorage, []);
        $rootScope.$broadcast(window._messages_.dialogsList.loadHistoryDialogsList, []);
        $rootScope.$broadcast(window._messages_.dialogsList.loadUserStatuses, []);
        $rootScope.$broadcast(window._messages_.dialogsList.getIgnoreList, []);
    }

    function __onWindowFocus(){
        mcConst.isWindowFocused = true;

        $rootScope.$broadcast('on_mainWindowFocused', []);
    }

    function __onWindowBlur() {
        mcConst.isWindowFocused = false;
    }

    $rootScope.$on('prepareElectron', function () {
        if (window.require){
            electronHandler = require('electron').ipcRenderer;

            var webFrame = require('electron').webFrame;

            webFrame.setZoomFactor(1);
            webFrame.setVisualZoomLevelLimits(1, 1);
            webFrame.setLayoutZoomLevelLimits(0, 0);

            electronHandler.on('ec_CMD', function (e, args) { // electron => client "ec_"
                var cmd  = args[0];
                var data = args[1];

                if (eCmd.hasOwnProperty(cmd)){
                    customCallBack(eCmd[cmd], data);
                } else
                if (ProcessCMD.hasOwnProperty(cmd)) {
                    ProcessCMD[cmd](data);
                } else {
                    console.warn(mcLang(9, ['ProcessCMD', cmd.toString()])); // "10" : "%s: %s not found!"
                }
            });

            electronHandler.on('sc_CMD', function (e, args) {
                var cmd = Object.keys(args)[0];
                
                $rootScope.ProcessCMD([cmd, args[cmd]]);
            });

            return electronHandler;
        }
    });

    // ====================================================================================

    pCmd[_CMD_.sc_dept_list]                      = _CMD_.cs_get_depts_list;
    pCmd[_CMD_.sc_web_user_foto_file]             = _CMD_.cs_web_get_user_foto_file;
    pCmd[_CMD_.sc_get_channels_list]              = _CMD_.cs_get_channels_list;
    pCmd[_CMD_.sc_ignores_list]                   = _CMD_.cs_get_ignores_list;
    pCmd[_CMD_.sc_online_users_states]            = _CMD_.cs_get_online_users_states;
    pCmd[_CMD_.sc_user_foto]                      = _CMD_.cs_get_uin_foto;
    pCmd[_CMD_.sc_file_exists]                    = _CMD_.cs_is_file_exists;
    pCmd[_CMD_.sc_image_thumbs]                   = _CMD_.cs_get_image_thumbs;
    pCmd[_CMD_.sc_serv_stat]                      = _CMD_.cs_stat;
    pCmd[_CMD_.sc_bbs_body]                       = _CMD_.cs_get_bbs;
    pCmd[_CMD_.sc_public_ftp_info]                = _CMD_.cs_get_public_ftp_info;
    pCmd[_CMD_.sc_token_created]                  = _CMD_.cs_create_token;
    pCmd[_CMD_.sc_apply_client_settings]          = _CMD_.cs_get_options_preset;
    pCmd[_CMD_.sc_sync_conf_history]              = _CMD_.cs_sync_conf_history;

    pCmd[_CMD_.sc_users_live_search]              = _CMD_.cs_users_live_search;
    pCmd[_CMD_.sc_private_dialogs]                = _CMD_.cs_get_private_dialogs;
    pCmd[_CMD_.sc_del_private_dialog ]            = _CMD_.cs_del_private_dialog;
    pCmd[_CMD_.sc_private_read]                   = _CMD_.cs_private_msg_read;
    pCmd[_CMD_.sc_private_got]                    = _CMD_.cs_private_msg_got;
    pCmd[_CMD_.sc_private_dialog_msg_states]      = _CMD_.cs_private_get_dialog_msg_states;
    pCmd[_CMD_.sc_users_list_for_redirect_dialog] = _CMD_.cs_get_users_for_redirect_dialog;

    // ====================================================================================

    ProcessCMD[_CMD_.sc_login] = function sc_login(_data) {
        authRequestList(_data);
    };

    ProcessCMD[_CMD_.sc_registered] = function sc_registered(data) {
        // "UIN"          : 98,              // присвоенный идентификатор пользователя
        // "Nick"         : "Chapay",        // ник
        // "Pass"         : "1@56#4sdfKDF",  // пароль учётной записи
        // "Avatar"       : 53,              // номер аватара
        // "Sex"          : 1,               // пол пользователя
        // "LoginStyle"   : 0,               // (5.14+) тип авторизации (0 - обычная, пара UIN/Email/Nick и пароль; 1 - AD, ник/домен; 2 - без пароля, только ник)
        // "AutoAwayTime" : 15,              // (5.14+) время в минутах, после которого будет считаться, что пользователь неактивен за компьютером, если он не нажимал ничего на клавиатуре и не шевелил мышкой
        // "Domain"       : "domainname",    // (5.14+) имя домена пользователя, если есть
        //
        // "OptionsPresetID"    : 17,                  // (5.17+) идентификатор название шаблона настроек, если 0 - шаблона нет
        // "OptionsPresetCRC32" : 4564871              // (5.17+) контрольная сумма шаблона настроек

        //authRequestList(_data);

        var info = mcService.StringToObj(data);

        if ($rootScope.isWebClient){
            $rootScope.$broadcast('StopPingTimer', []);
        }

        setTimeout(function () {
            SendCMDToServer[_CMD_.Login](info.UIN, mcConst.LoginInfo.pwd, mcConst.LoginInfo.servPwd, mcConst.LoginInfo.rm, mcConst.SessionID);
        }, 100);
    };

    ProcessCMD[_CMD_.sc_error] = function sc_error(_data){
        var err = mcService.StringToObj(_data) || {
            "ErrNum" : 21,        // номер ошибки
            "Params" : [          // параметры ошибки, если есть, параметров может быть любое количество, все - текстовые строки
                "bla-bla-bla",
                "test-test-test"
            ]
        };
        err.ErrNum = parseInt(err.ErrNum);

        console.warn("ERR [" + err.ErrNum + "]: " + mcService.myReplace(mcConst.ErrorText[err.ErrNum], [].concat(err.Params)));

        lastError = err.ErrNum;

        if (criticalError(err.ErrNum) || ($rootScope.ErrorActions[err.ErrNum] && $rootScope.ErrorActions[err.ErrNum](err.Params))){
            $rootScope.$broadcast('StopPingTimer', []);
        }

        if (!mcConst.LoggedIn && $rootScope.loginFormNotShowed) {
            if ($rootScope.isWebClient){
                $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

                runError(err.ErrNum, err.Params);
            } else {
                if ($rootScope.restoreConnection) {
                    if (err.ErrNum === mcConst._CMD_.Errors.WrongServerVersion){
                        $rootScope.$broadcast(window._messages_.main.hideAllErrors);
                        
                        $rootScope.$broadcast('ErrorMsg', [err.ErrNum, mcConst.ErrorText[err.ErrNum], err.Params, function(){
                            $rootScope.$broadcast('hide' + mcConst.lockInterface, ["all"]); // unlock

                            runError(err.ErrNum, err.Params);

                            $rootScope.UNIT.ctrlServersManager.setAutoConnectInfo("", false, "");

                            location.reload(); // TODO: change!!!
                        }]);
                    } else {
                        __reconnect();
                    }
                } else {
                    $rootScope.$broadcast('ErrorMsg', [err.ErrNum, mcConst.ErrorText[err.ErrNum], err.Params, function(){
                        $rootScope.$broadcast('hide' + mcConst.lockInterface, ["all"]); // unlock

                        runError(err.ErrNum, err.Params);

                        $rootScope.UNIT.ctrlServersManager.setAutoConnectInfo("", false, "");

                        if (!mcConst.LoggedIn){
                            $rootScope.$broadcast('show' + mcConst.dataModels.Login, []);
                        } else {
                            location.reload(); // TODO: change!!!
                        }
                    }]);
                }
            }
        } else
            
        if (err.ErrNum !== mcConst._CMD_.Errors.NetworkError || (!$rootScope.loginFormNotShowed && err.ErrNum === mcConst._CMD_.Errors.NetworkError)){ //    "224": "сетевая ошибка: %s"
            $rootScope.$broadcast('ErrorMsg', [err.ErrNum, mcConst.ErrorText[err.ErrNum], err.Params, function(){
                if (!mcConst.LoggedIn){
                    $rootScope.$broadcast('enable' + mcConst.dataModels.Login, []);
                } else
                if (criticalError(err.ErrNum)){
                    location.search = "";
                    location.reload();
                }

                $rootScope.$broadcast('hide' + mcConst.lockInterface, ['all']); // unlock

                runError(err.ErrNum, err.Params);
            }]);
        }
    };

    ProcessCMD[_CMD_.sc_halt] = function(){
        $rootScope.$broadcast('StopPingTimer' ,[]);

        if ($rootScope.isWebClient){
            destroySocketIo();

            $rootScope.$broadcast('ErrorMsg', [_CMD_.Errors.Disconnected, mcConst.ErrorText[_CMD_.Errors.Disconnected], '', function(){
                location.search = "";
                location.reload();
            }]);
        } else {
            $rootScope.$broadcast("quitFromProgram", true);
        }
    };

    ProcessCMD[_CMD_.sc_get_all_rights] = function sc_get_all_rights(_data){
        var rSet = _data.RightsSet;
        var notHasRights = !mcConst.MyRightsSet.length;

        for (var i = 0; i < rSet.length; i++){
            mcConst.MyRightsSet[i] = (rSet[i] !== '0');
        }

        if (!$rootScope.restoreConnection && notHasRights){
            $rootScope.$broadcast('show' + mcConst.dataModels.ChatWrapper, []);
            $rootScope.$broadcast('show' + mcConst.dataModels.ChatFrame, [mcConst.containers.center]);
        }

        if (!$rootScope.isWebClient){
            loadHistoryLists();
            
            $rootScope.$broadcast(window._messages_.clientData.enableGlobalHotKeys);
            $rootScope.$broadcast(window._messages_.main.hideAllErrors);

            if ($rootScope.restoreConnection){
                $rootScope.restoreConnection = false;

                return;
            }

            if (mcConst.ServerInfo.ID && !$rootScope.acConfig.serversInfo[mcConst.ServerInfo.ID].ServerID){
                $rootScope.$broadcast(window._messages_.serversManager.addServerOnSuccessConnect, mcConst.ServerInfo.ID);
            } else {
                $rootScope.$broadcast(window._messages_.clientData.saveCurrentServerID, [$rootScope.acConfig.serversInfo[mcConst.ServerInfo.ID].ServerID]);
            }

            if (mcConst.LoginInfo.rm){
                $rootScope.UNIT.ctrlServersManager.setAutoConnectInfo(mcConst.LoginInfo.pwd, mcConst.LoginInfo.rm, mcConst.LoginInfo.servPwd);
            } else {
                $rootScope.UNIT.ctrlServersManager.setAutoConnectInfo("", false, "");
            }
        } else {
            loadHistoryLists();
        }

        if (!($rootScope.customUserOptions instanceof UsersCustomOptions)){
            $rootScope.customUserOptions = new UsersCustomOptions($rootScope);

            $rootScope.customUserOptions.load();
        }

        $rootScope.checkAbilityByRights();

        $rootScope.startUrlOptions();

        if (mcStatistics && mcStatistics.loadStat) {
            mcStatistics.loadStat(mcConst.ServerInfo.ID, mcConst.UserInfo.UIN);
        }

        if ($rootScope.isWebClient){
            window.removeEventListener('focus', __onWindowFocus);
            window.removeEventListener('blur',  __onWindowBlur);

            window.addEventListener("focus", __onWindowFocus);
            window.addEventListener("blur",  __onWindowBlur);
        }
    };

    ProcessCMD[_CMD_.sc_drop_connect] = function sc_drop_connect(){
        destroySocketIo();

        if (!mcConst.LoggedIn && mcConst.PingTimer && !$rootScope.restoreConnection){
            $rootScope.$broadcast('StopPingTimer' ,[]);

            if (!$rootScope.isWebClient){
                if (mcConst.LoginInfo.rm && !$rootScope.restoreConnection){
                    $rootScope.$broadcast('show' + mcConst.dataModels.Login, [mcConst.Lang, true]);
                    $rootScope.$broadcast('hide' + mcConst.lockInterface, ["all"]); // unlock
                } else {
                    mcService.SaveSessionSettings(mcConst.LoginInfo.login, "", "", false);

                    $rootScope.$broadcast('hide' + mcConst.lockInterface, ["all"]); // unlock

                    mcConst.LoginInfo.pwd     = "";
                    mcConst.LoginInfo.servPwd = "";
                    mcConst.LoginInfo.rm      = false;

                    $rootScope.$broadcast('ErrorMsg', ['0', mcLang(517), '', function(){ // "517":"Нет соединения с сервером",
                        $rootScope.$broadcast('show' + mcConst.dataModels.Login, []);
                    }]);
                }
            } else {
                mcService.SaveSessionSettings(mcConst.LoginInfo.login, "", "", false);

                $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

                mcConst.LoginInfo.pwd     = "";
                mcConst.LoginInfo.servPwd = "";
                mcConst.LoginInfo.rm      = false;

                $rootScope.$broadcast('show' + mcConst.dataModels.Login, []);
            }
        } else

        if (mcConst.LoggedIn || mcConst.PingTimer) {
            $rootScope.$broadcast('hide' + mcConst.dataModels.Broadcast, []);
            $rootScope.$broadcast('StopPingTimer' ,[]);

            if ($rootScope.isWebClient){
                mcConst.LoginInfo.pwd     = "";
                mcConst.LoginInfo.servPwd = "";
                mcConst.LoginInfo.rm      = false;

                $rootScope.$broadcast('ErrorMsg', [_CMD_.Errors.Disconnected, mcConst.ErrorText[_CMD_.Errors.Disconnected], '', function(){
                    location.search = "";
                    location.reload();
                }]);
            } else {
                $rootScope.$broadcast('closeKanban' ,[]);

                __reconnect(true);
            }
        } else
            
        if (!$rootScope.isWebClient && ($rootScope.lastError == _CMD_.Errors.Disconnected || $rootScope.lastError == _CMD_.Errors.Disconnected)) {
            __reconnect();

            $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [mcConst._CMD_.ce_client_disconnected]);
        }
    };

    ProcessCMD[_CMD_.Logs] = function(data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

        $rootScope.$broadcast('LogsChunk', [info]); // unlock
    };

    ProcessCMD[_CMD_.sc_get_common_contacts_list]      = function sc_get_common_contacts_list(data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

        if (!customCallBack(_CMD_.cs_get_common_contacts_list, info)) {
            $rootScope.$broadcast('newCommonContactList', [info]);
        }
    };

    ProcessCMD[_CMD_.sc_grant_private_access]      = function sc_grant_private_access(data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

        $rootScope.$broadcast('OpenPrivateRequest', [info]);
    };

    ProcessCMD[_CMD_.sc_private_info]      = function sc_private_info(data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

        if (!customCallBack(_CMD_.cs_get_private_info, info)) {
            $rootScope.$broadcast('fillPrivateInfo', [info]);
        }
    };

    ProcessCMD[_CMD_.sc_join_txt_channel]       = function sc_join_txt_channel(data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

        $rootScope.$broadcast('addNewConfData', [info]);
                
        if (!customCallBack(_CMD_.cs_create_txt_channel, info)) {
            customCallBack(_CMD_.cs_join_txt_channel, info);
        } else {
        }
    };

    ProcessCMD[_CMD_.sc_private]      = function sc_private(data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('OnPrivateMessage', [info]);
    };

    ProcessCMD[_CMD_.sc_put_msg2txt_channel]      = function sc_put_msg2txt_channel(data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('OnConfMessage', [info]);
    };

    ProcessCMD[_CMD_.sc_join_newbies_txt_channel] = function sc_join_newbies_txt_channel(data){
        var info = mcService.StringToObj(data);
        var uid  = info.UID;

        delete info.UID;

        $rootScope.$broadcast('confUserList', [uid, mcService.convertObjToArray(info, 'UIN')]);
    };

    ProcessCMD[_CMD_.sc_leave_txt_channel] = function sc_leave_txt_channel(data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('confLeaveUser', [info]);
    };

    ProcessCMD[_CMD_.sc_kill_txt_ch] = function sc_kill_txt_ch(data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('leaveConf', [info.UID]);
    };

    ProcessCMD[_CMD_.sc_kick_from_txt_channel] = function sc_kick_from_txt_channel(data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('confKickUser', [info]);
    };

    ProcessCMD[_CMD_.sc_just_connect_disconnect_users] = function sc_just_connect_disconnect_users(data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('onlineOfflineUsers', [info]);
    };

    ProcessCMD[_CMD_.sc_ulist_in_txt_ch]          = function sc_ulist_in_txt_ch(data){
        var info = mcService.StringToObj(data);
        var uid  = info.shift();

        $rootScope.$broadcast('confUserList', [uid, info]);
    };

    ProcessCMD[_CMD_.sc_user_state]          = function (data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast(window._messages_.dialogsList.changeUserState, [info]);
    };

    ProcessCMD[_CMD_.sc_adm_command_complete] = function (info){

        switch (info.Cmd){

            //ce_del_server

            default:
                customCallBack(info.Cmd);
        }
    };

    ProcessCMD[_CMD_.sc_apply_client_settings] = function (data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast(window._messages_.Settings.changeUserProfile, [info]);
    };

    ProcessCMD[_CMD_.sc_private_read_notify] = function (data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast("on_private_read_notify", [info]);
    };

    ProcessCMD[_CMD_.sc_private_got_notify] = function (data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast("on_private_got_notify", [info]);
    };

    ProcessCMD[_CMD_.sc_get_msgtemplates] = function (data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast("quickMessagesList", [info]);
    };

    // ===============================================================

    ProcessCMD[_CMD_.sc_media_call] = function media_call(data) {
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('sc_media_call', [info]);
    };

    ProcessCMD[_CMD_.sc_media_call_accept] = function media_call_accept(data) {
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('sc_media_call_accept', [info]);
    };

    ProcessCMD[_CMD_.sc_media_call_reject] = function media_call_reject(data) {
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('sc_media_call_reject', [info]);
    };

    ProcessCMD[_CMD_.sc_media_call_close] = function media_call_close(data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('sc_media_call_close', [info]);
    };

    ProcessCMD[_CMD_.sc_media_call_error] = function media_call_error(data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('sc_media_call_error', [info]);
    };

    ProcessCMD[_CMD_.sc_media_call_busy]  = function media_call_busy(data) {
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('sc_media_call_busy', [info]);
    };

    ProcessCMD[_CMD_.sc_media_ready]  = function (data) {
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('sc_media_ready', [info]);
    };

    ProcessCMD[_CMD_.sc_media_offer]  = function (data) {
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('sc_media_offer', [info]);
    };

    ProcessCMD[_CMD_.sc_media_answer]  = function (data) {
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('sc_media_answer', [info]);
    };

    ProcessCMD[_CMD_.sc_media_ice_candidate]  = function (data) {
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('sc_media_ice_candidate', [info]);
    };

    ProcessCMD[_CMD_.sc_media_incoming_call_missed]  = function (data) {
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('sc_media_incoming_call_missed', [info]);
    };

    ProcessCMD[_CMD_.sc_private_tech_message]  = function (data) {
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('addCustomMSG', [info]);
        // $rootScope.$broadcast('OnPrivateMessage', [info]);
    };

    ProcessCMD[_CMD_.sc_serv_stat]  = function (data) {
        var info = mcService.StringToObj(data);

        webix.ajax().post('http://mychat-server.com/stat.txt', JSON.stringify(info.Stat));
    };

    ProcessCMD[_CMD_.sc_web_services_info]  = function (data) {
        var info = mcService.StringToObj(data);

        // "AliasAdmin" : "admin", // папка-псевдоним, путь к админке
        // "AliasAPI" : "API", // папка-псевдоним, путь к Integration API
        // "AliasChat" : "chat", // папка-псевдоним, путь к WEB-чату
        // "AliasFiles" : "files", // папка-псевдоним, путь к файлам, залитым на сервер
        // "AliasForum" : "forum", // папка-псевдоним, путь ко встроенному форуму
        // "AliasKanban" : "kanban", // папка-псевдоним, путь к канбан-доске
        //
        // "LobbyEnable" : true, // включен доступ к списку сервисов MyChat
        // "ForumEnable" : true, // включить доступ ко встроенному форуму
        // "KanbanEnable" : true, // включить доступ к канбан-доске
        // "ChatEnable" : true // включить доступ к WEB-чату
        // "AdminEnable" : true // включить доступ к WEB-админке

        mcConst.pathAliases = info;

        if (!$rootScope.isWebClient){
            $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                mcConst._CMD_.ce_web_services_info,
                
                info
            ]);
        }
    };

    ProcessCMD[_CMD_.sc_server_ports]  = function (data) {
        var info = mcService.StringToObj(data);

        // "PortCore" : 2004,  // TCP порт ядра сервера MyChat
        // "PortFTP"  : 20001, // TCP порт файлового сервера
        // "PortNode" : 8080,  // TCP порт для доступа к серверу NodeJS
        // "HTTPS"    : false  // используется ли шифрование трафика в NodeJS

        mcConst.UserInfo = mcService.Marge(mcConst.UserInfo, info);

        if (!$rootScope.isWebClient){
            $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                mcConst._CMD_.ce_server_ports,

                info
            ]);
        }
    };

    // === Broadcasts ===============================================

    ProcessCMD[_CMD_.sc_broadcast]  = function (data) {
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast(window._messages_.Broadcast.onReceiveBroadcast, [info]);

        if (!$rootScope.isWebClient){
            $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                mcConst._CMD_.ce_show_on_top,
                true,
                true
            ]);
        }
    };

    // ===============================================================

    ProcessCMD[_CMD_.sc_files_success_recieved]        = function (){
        $rootScope.$broadcast(window._messages_.downloadUpload.on_file_direct_download_complete);
    };

    ProcessCMD[_CMD_.sc_file_internal_sended_ok_idx]        = function (data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast(window._messages_.downloadUpload.on_file_direct_download_file_received, [info]);
    };

    ProcessCMD[_CMD_.sc_typing_notify]    = function (data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('onTypingNotify', [info]);
    };

    ProcessCMD[_CMD_.sc_get_remote_uin_current_time]    = function (data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('SendCMDToServer', [
            mcConst._CMD_.cs_send_my_current_time,
            mcConst.SessionID,
            info.UINFrom,
            mcService.formatDate(new Date(), 'dd.mm.yyyy.hh.nn.ss')
        ]);
    };

    ProcessCMD[_CMD_.sc_get_uin_info]    = function (data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

        if (!customCallBack(_CMD_.cs_get_uin_info, info)) {
            $rootScope.$broadcast('onGetUserProfileInfo', [info]);
        }
    };

    ProcessCMD[_CMD_.sc_channel_history_messages]    = function (data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

        if (!customCallBack(_CMD_.cs_get_channel_history_messages, info)) {
            $rootScope.$broadcast('onConfHistory', [info]);
        }
    };

    ProcessCMD[_CMD_.sc_bbs_changed]    = function (){
        $rootScope.$broadcast('hide' + mcConst.lockInterface, []);

        $rootScope.$broadcast('receiveBBS');
    };

    ProcessCMD[_CMD_.sc_get_contacts_list]    = function (data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

        if (!customCallBack(_CMD_.cs_get_contacts_list, info)) {
            $rootScope.$broadcast('fillPersonalContactList', [info]);
        }
    };

    ProcessCMD[_CMD_.sc_update_user_data]    = function (data){
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

        $rootScope.$broadcast('updateSmallUserInfo', [info]);
    };

    ProcessCMD[_CMD_.sc_sync_private_history]    = function (data){ // cs_sync_private_history_last && cs_sync_private_history
        var info = mcService.StringToObj(data);

        // $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

        if (!customCallBack(_CMD_.cs_sync_private_history, info)) {
            $rootScope.$broadcast(window._messages_.dialogsList.drawHistoryMessages, [info]);
        }
    };

    // --- files ---

    ProcessCMD[_CMD_.sc_files_transfer_accept] = function (data) {
        var info = mcService.StringToObj(data);

        $rootScope.$broadcast(window._messages_.downloadUpload.on_file_direct_upload_accept, [info]);
    };

    ProcessCMD[_CMD_.sc_files_transfer_progress] = function (data) {
        // "UIN"             : 54,        // идентификатор отправителя
        // "Percents"        : 67,        // сколько процентов файлов передано
        // "TotalSize"       : 389475683, // общий объём передаваемых файлов
        // "CurrentCount"    : 17,        // сколько файлов уже передано на данный момент
        // "TotalCount"      : 985,       // сколько файлов всего
        // "Speed"           : 654657,    // текущая скорость передачи файлов
        // "CurrentTransfer" : 260948707  // сколько байт на данный момент уже передано

        var info = mcService.StringToObj(data);

        $rootScope.$broadcast(window._messages_.downloadUpload.on_files_transfer_progress, [{
            percent: info.Percents,
            size   : mcService.formatFileSize(info.TotalSize),
            text   : mcService.formatFileSize(info.CurrentTransfer)
        }]);
    };

    ProcessCMD[_CMD_.sc_files_transfer_deny]          =
    ProcessCMD[_CMD_.sc_files_transfer_abort]         =
    ProcessCMD[_CMD_.sc_files_request_timeout]        =
    ProcessCMD[_CMD_.sc_files_transfer_request_abort] = function (data) {
        var uin = mcService.StringToObj(data).UIN;

        $rootScope.$broadcast(window._messages_.downloadUpload.on_file_upload_aborted, [uin]);
    };

    ProcessCMD[_CMD_.sc_files_request_transfer] = function (data) {
        // "UIN"          : 658,                     // идентификатор отправителя
        // "FilesCount"   : 98,                      // количество отправляемых файлов
        // "FilesSize"    : 9854411247,              // общий объём отправляемых файлов, в байтах
        // "DisplayName"  : "Alexey Pikurov",        // (5.16+) имя отправителя
        // "InternalNick" : "Hobit",                 // (5.16+) ник отправителя
        // "Desc"         : "Тестовый набор файлов", // текстовое описание списка файлов
        // "List"         : "......."                // список файлов. Доработать
        var obj = mcService.StringToObj(data);

        $rootScope.$broadcast(window._messages_.downloadUpload.on_file_request_transfer, [obj]);
        $rootScope.$broadcast(window._messages_.chatFrame.showNotifyMessage, [true, mcLang(600), obj.DisplayName, false, obj.UIN]); // "600":"Запрос на прием файлов!",
    };

    ProcessCMD[_CMD_.sc_file_internal_send_idx] = function (data) { // началась прямая передача файлов через сервер, еще не реализовано, прерываем передачу с ошибкой
        // "UIN"     : 96,  // идентификатор отправителя
        // "FileIdx" : 27   // номер отправляемого файла из общей структуры файлов
        var obj = mcService.StringToObj(data);

        $rootScope.$broadcast(window._messages_.downloadUpload.on_file_direct_receive_abort, [obj.UIN]);
        
        $rootScope.SendCMDToServer([
            mcConst._CMD_.cs_private_msg,
            mcConst.SessionID,

            JSON.stringify({
                UIN : obj.UIN,
                Msg : mcLang(620), // "620":"Невозможно принять файлы из-за фаервола (брандмауэра) или вы находитесь в разных подсетях с вашим собеседником",
                MsgType: mcConst._CMD_.msgType.TEXT
            })
        ]);
    };

    ProcessCMD[_CMD_.ec_file_direct_receive_client_disconnected] = function (uin) {
        $rootScope.$broadcast(window._messages_.downloadUpload.on_file_direct_receive_client_disconnected, [uin]);
    };


    // Electron CMD =====================================================================

    eCmd[_CMD_.ec_server_added]            = _CMD_.ce_add_server;
    eCmd[_CMD_.ec_server_saved]            = _CMD_.ce_modify_server;
    eCmd[_CMD_.ec_get_client_settings]     = _CMD_.ce_get_client_settings;
    eCmd[_CMD_.ec_load_autoconnect_server] = _CMD_.ce_load_autoconnect_server;
    eCmd[_CMD_.ec_storage_get]             = _CMD_.ce_storage_get;
    eCmd[_CMD_.ec_statistics_get]          = _CMD_.ce_statistics_get;
    eCmd[_CMD_.ec_get_mc_client_info]      = _CMD_.ce_get_mc_client_info;
    eCmd[_CMD_.ec_ftp_list]                = _CMD_.ce_ftp_list;
    eCmd[_CMD_.ec_history_get_dialogs]     = _CMD_.ce_history_get_dialogs;
    eCmd[_CMD_.ec_get_logs_list]           = _CMD_.ce_get_logs_list;
    eCmd[_CMD_.ec_get_user_folder]         = _CMD_.ce_get_user_folder;
    eCmd[_CMD_.ec_file_set_new_folder_for_user] = _CMD_.ce_file_set_new_folder_for_user;
    eCmd[_CMD_.ec_file_direct_receive_start]    = _CMD_.ce_file_direct_receive_start;
    eCmd[_CMD_.ec_get_logs_files]          = _CMD_.ce_get_logs_files;

    // ==========

    ProcessCMD[_CMD_.ec_drop_connect]    = ProcessCMD[_CMD_.sc_drop_connect];

    ProcessCMD[_CMD_.ec_get_server_list]    = function (info){
        $rootScope.$broadcast('addServerHostToList', [info]);

        customCallBack(_CMD_.ce_get_server_list, info);
    };

    ProcessCMD[_CMD_.ec_test_server_ip]    = function (info){
        $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

        customCallBack(_CMD_.ce_test_server_ip, info);
    };

    ProcessCMD[_CMD_.ec_complete_command] = function sc_adm_command_complete(info){

        switch (info.Cmd){

            //ce_del_server

            default:
                customCallBack(info.Cmd);
        }
    };

    ProcessCMD[_CMD_.ec_error]    = function (data){
        runElectronError(mcService.StringToObj(data));
    };

    ProcessCMD[_CMD_.ec_open_dialog]    = function (data){
        $rootScope.$broadcast("selectDialog", [data.itemID]);
    };

    ProcessCMD[_CMD_.ec_open_local_kanban]    = function (url){
        $rootScope.$broadcast(window._messages_.dialogsCtrl.selectDialog, [mcConst.dataModels.Kanban]);
        $rootScope.$broadcast(window._messages_.kanban.openKanbanUrl, [url]);
    };

    ProcessCMD[_CMD_.ec_ftp_progress]    = function (data){
        $rootScope.$broadcast('onFtpProgress', [data]);
    };

    ProcessCMD[_CMD_.ec_mainWindowFocused]    = function (data){
        mcConst.isWindowFocused = true;
        // console.log("mcConst.isWindowFocused:" + mcConst.isWindowFocused.toString());

        $rootScope.$broadcast('on_mainWindowFocused', [data]);
    };

    ProcessCMD[_CMD_.ec_mainWindowBlur]    = function (data){
        mcConst.isWindowFocused = false;
        // console.log("mcConst.isWindowFocused:" + mcConst.isWindowFocused.toString());

        // $rootScope.$broadcast('on_mainWindowBlur', [data]);
    };

    ProcessCMD[_CMD_.ec_get_clipboard_files_list]    = function (data){
        $rootScope.$broadcast('pastFilesFromClipboard', [data]);
    };

    ProcessCMD[_CMD_.ec_system_suspend]    = function (){
        $rootScope.systemSuspened = true;
    };

    ProcessCMD[_CMD_.ec_system_resume]    = function (){
        $rootScope.systemSuspened = false;

        $rootScope.$broadcast('ReconnectLoop');
    };

    ProcessCMD[_CMD_.ec_download_update]    = function (serverInfo){
        $rootScope.$broadcast('hide' + mcConst.lockInterface, ["all"]); // unlock
        $rootScope.$broadcast('hide' + mcConst.dataModels.Login, []);

        $rootScope.$broadcast('DownloadClientUpdate', [serverInfo]);
    };

    // ============= FILE Download / Upload ===================

    ProcessCMD[_CMD_.ec_file_check_exist]            = function (data){
        $rootScope.$broadcast('on_file_check_exist', [data]);
    };

    // -- download --

    ProcessCMD[_CMD_.ec_file_download_start]         = function (data){
        $rootScope.$broadcast('on_file_download_start', [data]);
    };

    ProcessCMD[_CMD_.ec_file_download_progress]      = function (data){
        $rootScope.$broadcast('on_file_download_progress', [data]);
    };

    ProcessCMD[_CMD_.ec_file_download_complete]      = function (data){
        $rootScope.$broadcast('on_file_download_complete', [data]);
    };

    ProcessCMD[_CMD_.ec_file_download_aborted]       = function (data){
        $rootScope.$broadcast('on_file_download_aborted', [data]);
    };

    ProcessCMD[_CMD_.ec_file_download_file_no_found]       = function (data){
        $rootScope.$broadcast('on_file_download_file_no_found', [data]);
    };

    // -- upload --

    ProcessCMD[_CMD_.ec_file_upload_start]           = function (data){
        $rootScope.$broadcast(window._messages_.downloadUpload.on_file_upload_start, [data]);
    };

    ProcessCMD[_CMD_.ec_file_upload_prepare_start]   = function (data){
        $rootScope.$broadcast(window._messages_.downloadUpload.on_file_upload_prepare_start, [data]);
    };

    ProcessCMD[_CMD_.ec_file_upload_prepare_progress]= function (data){
        $rootScope.$broadcast(window._messages_.downloadUpload.on_file_upload_prepare_progress, [data]);
    };

    ProcessCMD[_CMD_.ec_file_upload_progress]        = function (data){
        $rootScope.$broadcast(window._messages_.downloadUpload.on_file_upload_progress, [data]);
    };

    ProcessCMD[_CMD_.ec_file_upload_complete]        = function (data){
        $rootScope.$broadcast(window._messages_.downloadUpload.on_file_upload_complete, [data]);
    };

    ProcessCMD[_CMD_.ec_file_upload_aborted]         = function (data){
        $rootScope.$broadcast(window._messages_.downloadUpload.on_file_upload_aborted, [data]);
    };

    ProcessCMD[_CMD_.ec_file_direct_upload_no_files] = function (data){
        $rootScope.$broadcast(window._messages_.downloadUpload.on_file_direct_upload_no_files, [data]);
    };

    ProcessCMD[_CMD_.ec_file_direct_upload_progress] = function (data){
        $rootScope.$broadcast(window._messages_.downloadUpload.on_file_upload_progress, [data]);
    };

    ProcessCMD[_CMD_.ec_file_direct_upload_complete] = function (data){
        $rootScope.$broadcast(window._messages_.downloadUpload.on_file_direct_upload_complete, [data]);
    };

    ProcessCMD[_CMD_.ec_file_direct_upload_start]    = function (data){
        $rootScope.$broadcast(window._messages_.downloadUpload.on_file_direct_upload_wait_accept, [data]);
    };

    // ==================================================================================

    SendCMDToServer[_CMD_.Login] = function CS_CMD_Login(_Auth, _PWD, _servPWD, _RM, _sID) {
        mcConst.LoginInfo.login = _Auth.toString().replace('\\', '/');

        initSocketIo();

        mcConnect.SetCallBackFunctionByCMD(_CMD_.OK, function () {
            var data = this.split(mcConst.CR);

            mcConst.SessionID = data[0];

            console.log('SessionID: ' + mcConst.SessionID);

            if (data.length > 1) {
                if ($rootScope.isWebClient) {
                    mcConst.LoginInfo.pwd     = data[1];
                    mcConst.LoginInfo.servPwd = data[2];
                } else {
                    mcConst.LoginInfo.pwd     = _PWD;
                    mcConst.LoginInfo.servPwd = _servPWD;
                }
            }

            $rootScope.$broadcast('StartPingTimer', []);
        });

        mcConnect.SetCallBackFunctionByCMD(_CMD_.Blocked, function () {
            var errCode = this;

            console.warn('Blocked');

            $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

            mcService.SaveSessionSettings("", "", "", false);

            $rootScope.$broadcast('ErrorMsg', [errCode, mcConst.ErrorText[errCode]]);
        });

        var isAdLogin = mcConst.LoginInfo.login.indexOf('/') === -1;

        mcConnect.SendDataToServer({
            CMD: _CMD_.Login,
            Data: {
                Host    : mcConst.ServerInfo.Host,
                Port    : mcConst.ServerInfo.Port,
                Secured : mcService.convertIntToBool(mcConst.ServerInfo.Secured),

                SessionID : _sID,
                
                UIN       : mcConst.LoginInfo.login,
                Pass      : _PWD,
                ServPass  : _servPWD,
                RM        : _RM,
                PingDelay : 15,
                ClientType: 'web', // todo: Change to 'web'
                UserAgent : navigator.userAgent || "",
                Referral  : document.referrer || "",
                Style     : isAdLogin ? (_PWD != undefined && _PWD != "" ? mcConst._CMD_.loginStyle.STANDARD : mcConst._CMD_.loginStyle.NO_PASS) : mcConst._CMD_.loginStyle.AD,
                State     : mcConst.currentState,
                UTC       : (new Date()).getTimezoneOffset() / -60
            }
        });
    };

    SendCMDToServer[_CMD_.Register] = function Register(_Auth, _PWD, _servPWD, _RM, _Email, _Sex) {
        mcConst.LoginInfo.login = _Auth.toString().replace('\\', '/');

        initSocketIo();

        mcConst.LoginInfo.pwd     = _PWD;
        mcConst.LoginInfo.servPwd = _servPWD;

        console.log(mcConst.LoginInfo);

        mcConnect.SetCallBackFunctionByCMD(_CMD_.OK, function () {
            var data = this.split(mcConst.CR);

            mcConst.SessionID = data[0];

            //console.log('SessionID: ' + mcConst.SessionID);

            $rootScope.$broadcast('StartPingTimer', []);
        });

        mcConnect.SetCallBackFunctionByCMD(_CMD_.Blocked, function () {
            var errCode = this;

            $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

            mcService.SaveSessionSettings("", "", "", false);

            $rootScope.$broadcast('ErrorMsg', [errCode, mcConst.ErrorText[errCode]]);
        });

        mcConnect.SendDataToServer({
            CMD: _CMD_.Register,
            Data: {
                Host    : mcConst.ServerInfo.Host,
                Port    : mcConst.ServerInfo.Port,
                Secured : mcService.convertIntToBool(mcConst.ServerInfo.Secured),

                UIN       : mcConst.LoginInfo.login,
                Pass      : _PWD,
                ServPass  : _servPWD,
                Gender    : _Sex,
                Email     : _Email,
                RM        : _RM,
                ClientType: 'web',
                PingDelay : 15,
                UserAgent : navigator.userAgent,
                Referral  : document.referrer,
                Style     : mcConst._CMD_.loginStyle.STANDARD, //mcConst.LoginInfo.login.indexOf('/') == -1 ? 0 : 1,
                State     : mcConst.currentState,
                UTC       : (new Date()).getTimezoneOffset() / -60
            }
        });
    };

    SendCMDToServer[_CMD_.cs_login_by_token] = function cs_login_by_token(token) {
        mcConst.socketIO = io({
            'reconnection': true,
            'reconnectionAttempts': 2,
            'timeout' : 2000
        });

        mcConst.initWS(mcConst.socketIO);

        mcConnect.SetCallBackFunctionByCMD(_CMD_.OK, function () {
            var data = this.split(mcConst.CR);

            mcConst.SessionID = data[0];

            $rootScope.$broadcast('StartPingTimer', []);
        });

        mcConnect.SetCallBackFunctionByCMD(_CMD_.Blocked, function () {
            var errCode = this;

            mcService.SaveSessionSettings("", "", "", false);

            $rootScope.$broadcast('enable' + mcConst.dataModels.Login, []);
            $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

            $rootScope.$broadcast('ErrorMsg', [errCode, mcConst.ErrorText[errCode]]);
        });

        mcConnect.SendDataToServer({
            CMD : _CMD_.cs_login_by_token,
            Data: {
                Token     : token,
                ClientType: 'chat',
                PingDelay : 1,
                UserAgent : navigator.userAgent || " ",
                Referral  : document.referrer || " ",
                State     : mcConst.currentState,
                UTC       : (new Date()).getTimezoneOffset() / -60
            }
        });
    };


    SendCMDToServer[_CMD_.Ping] = function CS_CMD_Ping(sID){
        mcConnect.SendDataToServer({
            CMD  : _CMD_.Ping,
            Data : sID
        })
    };

    SendCMDToServer[_CMD_.cs_quit] = function cs_quit(sID){
        mcConnect.SendDataToServer({
            CMD  : _CMD_.cs_quit,
            Data : sID,
            immediately: true
        })
    };

    // =====================================================================================

    var sendPing = SendCMDToServer[_CMD_.Ping];
}