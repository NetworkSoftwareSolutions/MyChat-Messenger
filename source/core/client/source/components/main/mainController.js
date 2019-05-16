
function mainController($scope, $rootScope, mcCmdParser, mcCmdLoop, $http, $location, mcStatistics){
    var resizeWndCb = [];

    // ============================================================

    function initLockWindow(){
        if (lockWindow){
            lockWindow.destructor();
        }

        lockWindow = webix.ui({
            view     : "window",
            modal    : true,
            head     : mcService.Lang(18), // "18" : "Обработка запроса",
            position : "center",
            width    : 220,
            height   : mcConst.lockWindowHeight, // 65
            body     : {
                template : "<div align='center'><img src='" + mcConst.imagesPath.loading + "'></div>"
            }
        });
    }

    function displayError(txtCode, txt, txtParam, callback, okText){
        $scope.errorMessagesIsShowed = true;

        $rootScope.errorDialog = webix.alert({
            title: txtCode === -1 ? "" : mcService.Lang(11, txtCode), // mcService.Lang(11, err.ErrNum), // "11" : "Ошибка #"
            ok   : okText || mcService.Lang(12),          // "12" : "Закрыть",
            type : "alert-error",
            width: 400,
            text : mcService.myReplace(txt, txtParam),
            callback: function(){
                if (callback){
                    callback();
                }

                $rootScope.lastError = txtCode;

                var args = $scope.errorMessages.shift();

                if (args !== undefined){
                    setTimeout(function(){
                        displayError.apply(null, args);
                    }, 20);
                }

                $scope.errorMessagesIsShowed = false;

                $rootScope.errorDialog = null;
            }
        });
    }

    function runCmd(cmd, args){
        if (mcService.isArray(args)){
            var cmdNumb = args.shift();

            if (mcCmdParser[cmd][cmdNumb]){
                mcCmdParser[cmd][cmdNumb].apply(null, args);
            } else {
                console.warn(mcService.myReplace(mcService.Lang(9), [cmd.toString(), cmdNumb.toString()])); // "10" : "%s: %s not found!"
            }
        } else {
            throw new Error(mcService.myReplace(mcService.Lang(8), [cmd])); // "8" : "%s: нет входящих аргументов"
        }
    }

    function sendCMD(args, toElectron){
        if (args[0] === mcConst.lockInterface){
            args.shift();

            $scope.$emit(mcConst.lockInterface, []);
        }

        if (mcService.isFunction(args[args.length - 1])){
            if (!$rootScope.customCallBack[args[0]]){
                $rootScope.customCallBack[args[0]] = [];
            }

            $rootScope.customCallBack[args[0]].push(args.pop());
        }

        if (toElectron){
            mcCmdParser.internalSender(args);
        } else {
            if (mcStatistics){
                mcStatistics.setValueByCMD.apply(null, args);
            }

            if (mcCmdParser.MultiSender.apply(null , args)){
                runCmd('SendCMDToServer', args);
            }
        }
    }

    function setWindowSize() {
        $rootScope.wndSize = mcService.getWindowSize();

        for (var i = 0; i < resizeWndCb.length; i++){
            resizeWndCb[i]($rootScope.wndSize.width, $rootScope.wndSize.height);
        }
    }

    function receiveCMD(args) {
        if (mcStatistics){
            mcStatistics.setValueByCMD.apply(null, args);
        }

        if (mcCmdParser.MultiParser.apply(null, args)){
            runCmd('ProcessCMD', args);
        }
    }

    function startPingTimer (){
        mcConst.PingTimer = new mcCmdLoop(mcConst.PingInterval, mcConst.SessionID, {
            onError : function(){
                if ($rootScope.isWebClient){
                    mcConst.LoggedIn = false;

                    $scope.$emit('ErrorMsg', ['223', mcConst.ErrorText['223'], '', function(){
                        location.search = "";
                        location.reload();
                    }]);
                } else {
                    $rootScope.restoreConnection = false;

                    $rootScope.$broadcast('ReconnectLoop');

                    $rootScope.$broadcast('ErrorMsg', ['223', mcConst.ErrorText['223'] + "<br>" + mcLang(539) + "<br><br>" + mcConst.loadGif, '', function(){ // "539":"Восстанавливаем связь!",
                        mcService.ClearSessionSettings(true, true);

                        location.search = "";
                        location.reload();
                    }, mcLang(540)]); // "540":"Прервать",
                }
            },
            onStop: function () {
                mcConst.LoggedIn  = false;
                mcConst.PingTimer = null;
                mcConst.SessionID = '';

                $rootScope.destroySocketIo();

                if (!$rootScope.isWebClient){
                    $rootScope.$broadcast("disableGlobalHotKeys");
                }
            }
        });
    }

    // ========= Отправка клиентских логов (browser) на сервер ===========
    if (window.cLog){
        cLog(mcConst._CMD_.ce_console_log, sendCMD);
    }
    // ===================================================================

    var lockWindow = null;
    var reconnectTimer = null;

    $scope.lockCount = 0;
    $scope.lockTimer = null;
    $scope.errorMessages = [];
    $scope.errorMessagesIsShowed = false;

    // ====================================================

    if (window.McTextFinder) {
        McTextFinder($rootScope);
    }

    $rootScope.hotKeyDispatcher = new mcService.HotkeyManager();

    mcService._hotkeys = $rootScope.hotKeyDispatcher;

    $rootScope.acConfig = {
        serversInfo: {}
    };
    $rootScope.restrictedSymbols = '"\/\\[]:;|=,+*?<>';

    $rootScope.thumbsSize     = mcConst.imageSize.big;

    $rootScope.mcStorage      = mcService.Marge({}, mcConst.dataModels);
    $rootScope.customCallBack = {};
    $rootScope.needFoto       = false;
    $rootScope.errorDialog    = null;
    $rootScope.Purl           = purl();                        
    $rootScope.customUserOptions = null;

    $rootScope.chatAliases = {
        Conf  : mcConst.dataModels.ConfUserList,
        UIN   : "UIN",
        UID   : "UID",
        Forum : mcConst.dataModels.Forum,
        Privat: mcConst.dataModels.PrivateInfo,
        Kanban: mcConst.dataModels.Kanban,
        BBS   : mcConst.dataModels.BBS
    };

    $rootScope.wndSize = mcService.getWindowSize();

    $rootScope.isWebClient = location.protocol !== 'file:';

    $rootScope.SendCMDToServer = sendCMD;
    $rootScope.ProcessCMD      = receiveCMD;

    if (!$rootScope.isWebClient){
        try {
            initClientData.apply(null, [$scope, $rootScope, sendCMD, mcStatistics]);
        } catch (e){}
    }

    // ====================================================

    var toolShowed     = null;

    $rootScope.setTool = function(name){
        if (toolShowed !== name) {
            $rootScope.hidePrevTool(toolShowed);

            toolShowed = name;
        }
    };

    $rootScope.getTool = function(){
        return toolShowed;
    };

    $rootScope.hidePrevTool = function(){
        if (toolShowed)
            $rootScope.$broadcast('hide' + toolShowed, []);
    };

    // ====================================================

    var rightCheck  = {
        // where: function()
    };

    var CurrentDialog = {
        id   : '-1',
        type : $rootScope.chatAliases.UIN,
        alias: mcConst.dataModels.PrivateInfo
    };

    /**
     * @return {string}
     */
    $rootScope.GetChatID = function(){
        return CurrentDialog.id;
    };

    /**
     * @return {string}
     */
    $rootScope.GetChatType = function(){
        return CurrentDialog.type;
    };

    $rootScope.GetChatAlias = function(){
        return CurrentDialog.alias;
    };

    /**
     * @return {string}
     */
    $rootScope.GetChatTypeID = function(){
        return CurrentDialog.type + "-" + CurrentDialog.id;
    };

    $rootScope.createUIN = function(uin){
        return $rootScope.chatAliases.UIN + "-" + uin;
    };

    $rootScope.createUID = function(uid){
        return $rootScope.chatAliases.UID + "-" + uid;
    };

    $rootScope.SetPrivate = function(UIN){ // PRIVATE
        CurrentDialog = {
            id: UIN, type: $rootScope.chatAliases.UIN, alias: mcConst.dataModels.PrivateInfo
        };
    };

    $rootScope.SetKanban = function(){ // KANBAN
        CurrentDialog = {
            id: '0', type: $rootScope.chatAliases.Kanban, alias: mcConst.dataModels.Kanban
        };
    };

    $rootScope.SetBBS = function(){ // BBS
        CurrentDialog = {
            id: '0', type: $rootScope.chatAliases.BBS, alias: mcConst.dataModels.BBS
        };
    };

    $rootScope.SetConf = function(UID){ // CHANNEL
        CurrentDialog = {
            id: UID, type: $rootScope.chatAliases.UID, alias: mcConst.dataModels.ConfUserList
        };
    };

    $rootScope.checkAbilityByRights = function (where) {
        if (where){
            if (rightCheck[where]) {
                rightCheck[where]()
            } else {
                console.error("Was't set rights check for the \"" + where + "\"");
            }
        } else {
            for (var item in rightCheck){
                rightCheck[item]();
            }
        }
    };

    $rootScope.registerRightsCheck = function (where, cb) {
        rightCheck[where] = cb;
    };

    $rootScope.startUrlOptions = function () {
        var uin = $rootScope.Purl.param('uin');

        if (uin){
            $rootScope.$broadcast('OpenPrivate', [uin]);
        }
    };

    $rootScope.spellCheckManager = null;

    $rootScope.initSocketIo = function () {
        if (window.hasOwnProperty("io") && mcService.isFunction(window.io) && !mcConst.socketIO){
            mcConst.socketIO = io({
                'reconnection': true,
                'reconnectionAttempts': 5,
                'timeout' : 10000
            });

            mcConst.initWS(mcConst.socketIO);
        }
    };

    $rootScope.destroySocketIo = function () {
        if (mcConst.socketIO){
            mcConst.socketIO.disconnect();
            mcConst.socketIO = null;
        }
    };

    // ====================================================

    window._userActions = {};
    window.moment       = moment || {};
    window.isMobile     = browserDetect.mobile;
    
    webix.Date.startOnMonday = true;

    mcService.clearPlaneObj($rootScope.mcStorage);
    mcConst.LoginInfo = mcService.LoadSessionSettings();

    // ====================================================

    var _msg = _messages_.main = {
        SendCMDToServer : 'SendCMDToServer',
        ProcessCMD      : 'ProcessCMD',
        StartPingTimer  : 'StartPingTimer',
        StopPingTimer   : 'StopPingTimer',
        ReconnectLoop   : 'ReconnectLoop',
        ChangLanguage   : 'ChangLanguage',
        ErrorMsg        : 'ErrorMsg',
        hideAllErrors   : 'hideAllErrors',
        windowResize    : 'windowResize',
        confirmExit     : 'confirmExit'
    };

    $scope.$on(_msg.confirmExit, function (e, args) {
        var cb = args[0];

        if (cb){
            webix.confirm({
                type  : "confirm-error",
                text  : mcLang(603), // "603":"Выйти из чата?",
                ok    : mcLang(43),  // "43" :"Да",
                cancel: mcLang(44),  // "44" :"Нет",
                callback:function(yes){
                    if (yes){
                        cb();
                    }
                }
            });
        }
    });

    $scope.$on(_msg.SendCMDToServer, function(e, args){
        sendCMD(args);
    });

    $scope.$on(_msg.ProcessCMD, function(e, args){
        receiveCMD(args);
    });

    $scope.$on(_msg.StartPingTimer, startPingTimer);

    $scope.$on(_msg.StopPingTimer, function(){
        if (mcConst.PingTimer) {
            if (mcConst.LoggedIn && mcStatistics && mcStatistics.saveStat){
                mcStatistics.saveStat(mcConst.ServerInfo.ID, mcConst.UserInfo.UIN);
            }

            mcConst.PingTimer.StopPingTimer();

            mcConst.PingTimer = null;
        }
    });

    $scope.$on(_msg.ReconnectLoop, function () {
        if (!mcConst.PingTimer && !$rootScope.restoreConnection && $rootScope.loginFormNotShowed && !$rootScope.systemSuspened) {
            $rootScope.restoreConnection = true;

            if (!reconnectTimer){
                reconnectTimer = setTimeout(function () {
                    reconnectTimer = null;

                    $rootScope.SetPrivate(-1);

                    $rootScope.$broadcast(window._messages_.confUsers.clearUserForUID);
                    $rootScope.$broadcast(window._messages_.dialogsList.clearConfOnReconnect);
                    // $rootScope.$broadcast(window._messages_.dialogsCtrl.clearDialogsList);

                    $rootScope.$broadcast('SendCMDToServer' , [
                        mcConst.lockInterface,
                        mcConst._CMD_.Login,

                        mcConst.LoginInfo.login,
                        mcConst.LoginInfo.pwd,
                        mcConst.LoginInfo.servPwd,
                        mcConst.LoginInfo.rm
                    ]);
                }, !$rootScope.isWebClient && mcConst.ClientSettings.NetworkReconnectTime ? mcConst.ClientSettings.NetworkReconnectTime * 1000 : mcConst.reconnectTime);
            }
        }
    });

    $scope.$on(_msg.ChangLanguage, function(e, args){
        (function(locale, lang){
            setLocalizations();

            lang = $location.param('lang') || lang;

            if (lang.toLowerCase() === 'ua') {
                lang = 'uk';
            }

            moment.locale(lang);

            mcConst.Lang = lang;

            webix.Date.startOnMonday = mcConst.Lang !== 'en';

            webix.skin.set('material');
            webix.skin.material.optionHeight = 30;

            $http(MC_RESOURCE.TextSource.smileys + 'smileys.json').success(function(txt){
                mcConst.SmileysSet = mcService.isObject(txt) ? txt : JSON.parse(txt);
            });

            $http(MC_RESOURCE.TextSource.languages + lang + '.languages.json').success(function(txt){
                mcConst.LanguagesList = mcService.isObject(txt) ? txt : JSON.parse(txt);
            });

            $http(MC_RESOURCE.TextSource.errors.client + lang + '.errors.json').success(function(txt){
                mcConst.ErrorText = mcService.isObject(txt) ? txt : JSON.parse(txt);
            });

            $http(MC_RESOURCE.TextSource.www.admin + lang + '.json').success(function(txt){
                mcConst.LMSG_admin = mcService.isObject(txt) ? txt : JSON.parse(txt);
            });

            $http(MC_RESOURCE.TextSource.www.chat + lang + '.json').success(function(txt){
                mcConst.LMSG = mcService.isObject(txt) ? txt : JSON.parse(txt);

                if ($rootScope.isWebClient){
                    $scope.$broadcast('show' + mcConst.dataModels.Login, [lang]);
                } else {
                    $scope.prepareActions(lang);
                }

                initLockWindow();

                mcService.CheckNotification();

                webix.i18n.setLocale(lang);
            });

            if (window.McSpellChecker){
                $rootScope.spellCheckManager = new McSpellChecker();
            }
        }).apply(null, args)
    });

    $scope.$on(mcConst.lockInterface, function(){
        if ($scope.lockCount === 0){
            $scope.lockTimer = setTimeout(function(){
                lockWindow.show();

                mcService.getElementByClass('webix_modal')[0].className += ' noLockScreen';
            }, 100);
        }

        $scope.lockCount ++;
    });

    $scope.$on('hide' + mcConst.lockInterface, function(e, args){
        if (args[0] == 'all'){
            $scope.lockCount = 0;
        }

        if ($scope.lockCount > 0) {
            $scope.lockCount --;
        }

        if ($scope.lockCount === 0 || !mcConst.PingTimer) {
            clearTimeout($scope.lockTimer);

            lockWindow.hide();
        }
    });

    $scope.$on(_msg.ErrorMsg, function(e, args){
        if ($scope.errorMessagesIsShowed){
            if ($scope.errorMessages.length && $scope.errorMessages[$scope.errorMessages.length - 1][0] !== args[0]){
                $scope.errorMessages.push(args);
            }
        } else {
            displayError.apply(null, args);
        }
    });

    $scope.$on(_msg.hideAllErrors, function(){
        $scope.errorMessagesIsShowed = [];

        if ($rootScope.errorDialog) {
            webix.modalbox.hide($rootScope.errorDialog);
        }

        $rootScope.errorDialog = null;

        $scope.errorMessagesIsShowed = false;
    });

    $scope.$on(_msg.windowResize, function(e, args){
        if (mcService.isFunction(args[0])){
            resizeWndCb.push(args[0]);
        }
    });

    // =============================================================
         
    $scope.$emit(_msg.ChangLanguage, mcService.detectLang(webix.storage.local.get(mcConst.storageFields.lang)));

    webix.rules.isNotEmpty = function(val){
        return mcService.trim(val) != '';
    };

    webix.rules.registerLogin = function(val){
        var res = false;
        var str = mcService.trim(val);

        if (str !== ""){
            for (var i = 0; i < str.length; i++){
                if ($rootScope.restrictedSymbols.indexOf(str[i]) !== -1){
                    res = false;
                    
                    break;
                } else {
                    res = true;
                }
            }
        }

        return res;
    };

    webix.rules.isNumber = function(val){
        return /^\d+$/ig.test(val);// && !isNaN(parseInt(mcService.trim(val)));
    };

    webix.protoUI({
        name:"activeList"
    }, webix.ui.unitlist, webix.ActiveContent);

    webix.protoUI({
        name:"moveTemplate"
    }, webix.ui.view, webix.Movable, webix.EventSystem);

    webix.protoUI({
        name:"suggest",
        defaults:{
            filter:function(item,value){
                return item.value.toString().toLowerCase().indexOf(value.toLowerCase()) !== -1;
            }
        }
    }, webix.ui.suggest);

    webix.ready(function(){
        if (!webix.env.touch && webix.ui.scrollSize) {
            webix.CustomScroll.init();
        }
    });

    // ========================================================

    window.onbeforeunload = function() {
        if (!$rootScope.isWebClient){
            sendCMD([
                mcConst._CMD_.cs_quit,
                mcConst.SessionID
            ]);
        } else
        if (mcConst.LoggedIn){
            return mcService.Lang(40); // "40" : "Вы хотите завершить сеанс?",
        }
    };

    window.onunload = function(){
        if (mcConst.LoggedIn) {
            sendCMD([
                mcConst._CMD_.cs_quit,
                mcConst.SessionID
            ]);
        }
    };

    mcService.addEvent(window, "resize", setWindowSize);

}
