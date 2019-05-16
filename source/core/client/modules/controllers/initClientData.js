/**
 * Created by Gifer on 28.08.2016.
 */

function initClientData($scope, $rootScope, sendCMD, mcStatistics) {
    mcConst.ClientSettings = {
        "NetworkReconnectTime" : "10",
        "GeneralShowSendButton" : "1",
        "GeneralConfirmExit" : "1",
        "GeneralMainWindow" : "0",
        "GeneralCtrlEnterSend" : "0",
        "GeneralSpellCheck" : "1",
        "GeneralDoubleClickPagesClose" : "1",
        "SpecialMessagesFontSize" : "1",
        "SoundsAllSoundsOff" : "0",
        "EventsPopupOnNewBBS" : "1",
        "EventsPopupOnChannelMessage" : "0",
        "EventsPopupOnPrivateMessage" : "0",
        "EventsTimeStamp" : "1",
        "EventsShowPopupTrayWindow" : "1",
        "EventsTrayBBSMsg" : "1",
        "EventsTrayChMsg" : "1",
        "EventsTrayPvMsg" : "1",
        "EventsTrayBlinkOnTaskBar" : "1",
        "EventsTrayDontHide" : "0",

        "SoundsSndNewMsg" : "1",
        "SoundsSndBadWord" : "1",
        "SoundsSndLeave" : "1",
        "SoundsSndJoin" : "1",
        "SoundsSndChatType" : "1",
        "SoundsSndChatBS" : "1",
        "SoundsSndStatus" : "1",
        "SoundsSndError" : "1",
        "SoundsSndPrivate" : "1",
        "SoundsSndChatRet" : "1",
        "SoundsSndSignal" : "1",
        "SoundsSndChat" : "1",
        "SoundsSndBroadcast" : "1",
        "SoundsSndFilesExchangeRequest" : "1",
        "SoundsSndFilesExchangeDone" : "1",
        "SoundsSndScreenShot" : "1",
        "SoundsSndMediaBusy" : "1",
        "SoundsSndMediaCall" : "1",
        "SoundsSndMediaCallReject" : "1",
        "SoundsSndMediaEndCall" : "1",
        "SoundsSndMediaIncomingCall" : "1",

        "SoundsSndNewMsgFile" : "newmsg.mp3",
        "SoundsSndBadWordFile" : "badword.mp3",
        "SoundsSndLeaveFile" : "leave.mp3",
        "SoundsSndJoinFile" : "join.mp3",
        "SoundsSndChatTypeFile" : "chattype.mp3",
        "SoundsSndChatBSFile" : "chatbs.mp3",
        "SoundsSndStatusFile" : "status.mp3",
        "SoundsSndErrorFile" : "error.mp3",
        "SoundsSndPrivateFile" : "private.mp3",
        "SoundsSndChatRetFile" : "chatret.mp3",
        "SoundsSndSignalFile" : "signal.mp3",
        "SoundsSndChatFile" : "chat.mp3",
        "SoundsSndBroadcastFile" : "broadcast.mp3",
        "SoundsSndScreenShotFile" : "screenshot.mp3",
        "SoundsSndFilesExchangeRequestFile" : "filesrequest.mp3",
        "SoundsSndFilesExchangeDoneFile" : "filesdone.mp3",
        "SoundsSndMediaBusyFile" : "mediabusy.mp3",
        "SoundsSndMediaCallFile" : "mediacall.mp3",
        "SoundsSndMediaCallRejectFile" : "mediacallreject.mp3",
        "SoundsSndMediaEndCallFile" : "mediaendcall.mp3",
        "SoundsSndMediaIncomingCallFile" : "mediaincomingcall.mp3",

        // ------------------------------------------

            "NetworkSecured" : "0",
            "NetworkProxyType" : "0",
            "NetworkProxyHost" : "",
            "NetworkProxyPort" : "1080",
            "NetworkProxyAuth" : "0",
            "NetworkProxyUserName" : "",
            "NetworkProxyUserPass" : "",

            "GeneralWindowsStart" : "1",
            "GeneralStartPassword" : "0",
            "GeneralDailyUpdatesCheck" : "1",
            "GeneralOpenPrivateByOneClick" : "1",
            "GeneralFadeWindows" : "1",

        "GeneralShowUsersCounterOnTheTabs" : "1",
            "GeneralShowMainToolsPanel" : "1",


            "GeneralTipOfTheDayNum" : "3",
            "GeneralShowTipOfTheDay" : "0",
            "GeneralDisableAvatars" : "1",
        "GeneralQuickMsgAutoSend" : "0",

            "GeneralAutoHideMainWindow" : "0",
        "GeneralRememberOpenContactGroups" : "",

            "EventsDateTimeStampFormat" : "[hh:nn:ss]",
        "EventsTrayWindowDuration" : "5",
        "EventsOpenPrivateOnPersonalOrAlert" : "0",

        "HotKeysHotKeyMyChat" : "<Win>+F12",
        "HotKeysHotKeyMyChatScreenShot" : "<Win>+F9",
        "HotKeysUseGlobalHotKeys" : "1",
        "HotKeysEscHide" : "1",

        "SmileysSmileysSet" : "classic",

        "SysEventsShowSysEvents" : "1",
        "SysEventsEnterTxtxCh" : "1",
        "SysEventsLeaveTxtxCh" : "1",
        "SysEventsQuitChat" : "1",
        "SysEventsChangeTheme" : "1",
        "SysEventsBanUser" : "1",
        "SysEventsTurnOut" : "1",
        "SysEventsIgnore" : "1",
        "SysEventsConnectionLost" : "1",
        "SysEventsConnectionRestored" : "1",
        "SysEventsDisableEmotions" : "0",
        "SysEventsEnableSmileysAnimation" : "1",
        "SysEventsAutoreplaceSmileys" : "1",
        "SysEventsUseMessagesFontLayouts" : "1",
        "SysEventsLoadHistoryType" : "1",
        "SysEventsHistory_1_Num" : "50",
        "SysEventsAutoFillBroadcastUsersList" : "1",
        "SysEventsShowImagesInChat" : "1",
        "SysEventsImagesThumbsSize" : "2",

        "LogsServer" : "1",
        "LogsTxtChannels" : "1",
        "LogsPrivates" : "1",
        "LogsFiles" : "1",

        "SecurityOptionsPassword" : "",
        "LanguagesLanguage" : "russian.ini",

        // "SendFilesInputFilesDir" : "%s\\Documents\\MyChat\\",
        "SendFilesInputFilesDir" : "",
        "SendFilesBasePort" : "10000",
        "SendFilesDataPort" : "10001",
        "SendFilesBufferSize" : "3",
        "SendFilesSayYes" : "0",
        "SendFilesRememberSelectInputFilesFolder" : "1",
        "SendFilesRandomPorts" : "1",
        "SendFilesRandomPortStart" : "10000",
        "SendFilesRandomPortEnd" : "20000",
        "SendFilesRenameRecievedDuplicates" : "",

        "Colorscolor_ch_pv_back" : "13758972",
        "Colorscolor_inp_back" : "13758972",
        "Colorscolor_userslist_back" : "13758972",
        "Colorscolor_userslist_text" : "0",
        "Colorscolor_own_nick_text" : "255",
        "Colorscolor_active_link" : "255",
        "Colorscolor_visited_link" : "8388736",
        "Colorscolor_timestamp" : "10526880",
        "Colorscolor_hello_nick" : "13209",
        "Colorscolor_users_nick_text" : "16711680",

        "UpdateUseAccountForUpdates" : "0",
        "UpdateUpdateLogin" : "",
        "UpdateUpdatePassword" : "",
        "UpdateUpdateDomain" : "",
        "UpdateForceUpdateFromMyChatServerInActiveDirectory" : "0",


        "SpecialToolsPanelType" : "1",
        "SpecialPagesPanel" : "3",

        "AdditionalPrivateInfoFields" : "EMAIL,WORK_PHONE,WORK_DIVDEPT,HOME_BIRTHDAY",
        "AdditionalProgramCaption" : "%program% %ver% - %nickname% %company% (%state%)",
        "AdditionalSystemTrayText" : "",

        "InterfaceTrayIconListNumber" : "0",
        "InterfaceCommonBackground" : "",
        "InterfaceBackgroundPlacement" : "",

        "MediaNetworkTransportTCP" : "1",
        "MediaNetworkTransportUDP" : "1",
        "IceTransportPolicy" : "all",

        "LoadHistoryToConf" : "1",
        "LoadHistoryToPrivate" : "1"
    };

    function quitFromMyChat() {
        if (mcConst.LoggedIn) {
            removeHotKeys();
            
            sendCMD([mcConst._CMD_.ce_hide_window], true);

            if (mcStatistics && mcStatistics.saveStat) {
                mcStatistics.saveStat(mcConst.ServerInfo.ID, mcConst.UserInfo.UIN, function () {
                    sendCMD([mcConst._CMD_.ce_quit_from_program], true);
                });
            }

            mcConst.LoggedIn = false;

            sendCMD([
                mcConst._CMD_.cs_quit,
                mcConst.SessionID
            ]);
        } else {
            setTimeout(function () {
                sendCMD([mcConst._CMD_.ce_quit_from_program], true);
            }, 10);
        }
    }

    function hideMyChat() {
        sendCMD([mcConst._CMD_.ce_hide_program], true);
    }

    function logout() {
        $rootScope.$broadcast(window._messages_.mainMenu.logoutMenu);
    }

    function toggleMinMaxScreen() {
        sendCMD([mcConst._CMD_.ce_toggle_min_max], true);
    }

    function toggleKioskScreen(value) {
        sendCMD([mcConst._CMD_.ce_toggle_kiosk, value], true);
    }

    function registerHotKeys() {
        $rootScope.hotKeyDispatcher.addPreset(SYSTEM_PRESET, [{
            key   : mcConst.keyCodes.x,
            altKey: true,
            func  : function () {
                if (mcConst.ClientSettings.GeneralConfirmExit){
                    $rootScope.$broadcast(window._messages_.main.confirmExit, [quitFromMyChat]);
                } else {
                    quitFromMyChat();
                }
            }
        }, {
            key   : mcConst.keyCodes.esc,
            func  : hideMyChat
        }, {
            key   : mcConst.keyCodes.f11,
            func  : toggleMinMaxScreen
        }, {
            key   : mcConst.keyCodes.a,
            altKey: true,
            func  : logout
        }], document);

        sendCMD([
            mcConst._CMD_.ce_hide_or_close_by_x,
            false // hide window by click close btn
        ], true);
    }

    function removeHotKeys() {
        $rootScope.hotKeyDispatcher.removePreset(SYSTEM_PRESET);
    }

    function getClientConnectInfo(cb) {
        sendCMD([
            mcConst._CMD_.ce_get_client_settings,

            function (data) {
                mcConst.ClientSettings     = mcService.Marge(mcConst.ClientSettings, mcService.StringToObj(data.client_settings) || {});
                mcConst.ClientDbVer        = data.verdb;
                mcConst.ClientSettingsData = data;
                mcConst.settingsCRC32      = data.settings_crc32;

                $rootScope.UNIT.ctrlServersManager.setCurrentServerByID($rootScope.UNIT.ctrlServersManager.getServerIdByServID(mcConst.ClientSettings.ServID));

                if (mcConst.ClientSettings.ServID === null) {
                    mcConst.LoginInfo.rm = false;
                }

                if (cb){
                    cb();
                }
            }
        ], true);
    }

    function applyClientSettings() {
        // --- SpecialMessagesFontSize ---

        var cssStyle  = document.styleSheets[document.styleSheets.length - 1];
        var styleName = "._messagesFontSize .messageText, ._messagesFontSize .messageUserName, ._messagesFontSize .messageKanban";

        if (cssStyle.cssRules.length > 1){
            cssStyle.removeRule(0);
        }

        switch (mcConst.ClientSettings.SpecialMessagesFontSize){
            case "0":
                cssStyle.addRule(styleName, "font-size: 85%", 0);
            break;

            case "1":
                cssStyle.addRule(styleName, "font-size: 100%", 0);
            break;

            case "2":
                cssStyle.addRule(styleName, "font-size: 110%", 0);
            break;
            
            case "3":
                cssStyle.addRule(styleName, "font-size: 120%", 0);
            break;
        }

        // --- GeneralShowSendButton ---

        var sendBtn = $$("btnSendText");

        if (sendBtn){
            sendBtn[mcConst.ClientSettings.GeneralShowSendButton ? "show" : "hide"]();
        }

        // --- GeneralSpellCheck ---

        if ($rootScope.spellCheckManager){
            if (mcConst.ClientSettings.GeneralSpellCheck){
                if (!$rootScope.spellCheckManager.stat()) {
                    $rootScope.spellCheckManager.start(mcConst.Lang);
                }
            } else {
                $rootScope.spellCheckManager.stop();
            }
        }

        // --- GeneralDoubleClickPagesClose ---


        // --- SysEventsImagesThumbsSize ---
        
        $rootScope.thumbsSize = mcConst.imageSize[mcConst.ClientSettings.SysEventsImagesThumbsSize];

        // --- SysEventsHistory_1_Num ---

        mcConst.countHistoryMessagesLoad = mcConst.ClientSettings.SysEventsHistory_1_Num;
    }

    // ==================================================

    var SYSTEM_PRESET = "SYSTEM_EVENTS";

    $rootScope.UNIT     = {
        ctrlServersManager : new CtrlServersManager($rootScope)
    };
    $rootScope.clientSysInfo = {};

    $rootScope.$broadcast('prepareElectron');

    //===================================================

    $scope.prepareActions = function (lang) {
        // == GET CLIENT SETTINGS ===============================
        var task = new mcService.TaskList();

        sendCMD([
            mcConst._CMD_.ce_set_language,
            lang
        ], true);

        if (!webix.storage.local.get(mcConst.storageFields.AutoRld)){
            task.AddTask(function () {
                sendCMD([
                    mcConst._CMD_.ce_load_autoconnect_server,
                    function (info) {
                        mcConst.LoginInfo.login   = info.nick || info.uin;
                        mcConst.LoginInfo.pwd     = info.pwd;
                        mcConst.LoginInfo.servPwd = info.srvpwd;
                        mcConst.LoginInfo.rm      = mcService.convertIntToBool(info.autoconnect);

                        task.Next();
                    }
                ], true)
            });
        } else {
            mcService.ClearSessionSettings(true);
        }

        task.AddTask(function () {
            sendCMD([
                mcConst._CMD_.ce_get_server_list,
                function (servers) {
                    for (var srv in servers) {
                        $rootScope.UNIT.ctrlServersManager.addServerInfo(servers[srv]);
                    }

                    task.Next();
                }
            ], true);
        });

        task.AddTask(function () {
            getClientConnectInfo(task.Next);
        });

        task.AddTask(function () {
            $scope.$broadcast('show' + mcConst.dataModels.Login, [lang]);

            applyClientSettings();
        });

        task.Run();
        // ======================================================
    };

    //===================================================

    var _msg = window._messages_.clientData = {
        sendCMDToElectron   : 'sendCMDToElectron',
        enableGlobalHotKeys : 'enableGlobalHotKeys',
        disableGlobalHotKeys: 'disableGlobalHotKeys',
        saveCurrentServerID : 'saveClientSettings',
        saveClientSettings  : 'saveClientSettings',
        quitFromProgram     : 'quitFromProgram',
        getSystemInfo       : 'getSystemInfo',
        getClientConnectInfo: 'getClientConnectInfo',
        toggleKioskMode      : 'toggleKioskMode'
    };

    $scope.$on(_msg.getClientConnectInfo, function (e, args) {
        var cb = args[0];

        getClientConnectInfo(cb);
    });

    $scope.$on(_msg.toggleKioskMode, function (e, args) {
        toggleKioskScreen.apply(null, args);
    });

    $scope.$on(_msg.sendCMDToElectron, function (e, args) {
        sendCMD(args, true);
    });

    $scope.$on(_msg.enableGlobalHotKeys, registerHotKeys);

    $scope.$on(_msg.disableGlobalHotKeys, function () {
        removeHotKeys();

        sendCMD([
            mcConst._CMD_.ce_hide_or_close_by_x,
            true // close program by click close btn
        ], true);
    });

    $scope.$on(_msg.saveCurrentServerID, function (e, args) {
        mcConst.ClientSettings.ServID = args && args.length ? args[0] : mcConst.ClientSettings.ServID;

        sendCMD([
            mcConst._CMD_.ce_set_client_settings,
            mcConst.ClientSettings
        ], true);

        applyClientSettings();
    });

    $scope.$on(_msg.getSystemInfo, function (e, cb) {
        sendCMD([
            mcConst._CMD_.ce_get_mc_client_info,
            function (info) {
                $rootScope.clientSysInfo = info;

                if (cb) {
                    cb();
                }
            }
        ], true);
    });

    $scope.$on(_msg.quitFromProgram, function (e, halt) {
        if (mcConst.ClientSettings.GeneralConfirmExit && !halt){
            $rootScope.$broadcast(window._messages_.main.confirmExit, [quitFromMyChat]);
        } else {
            quitFromMyChat();
        }
    } );
}