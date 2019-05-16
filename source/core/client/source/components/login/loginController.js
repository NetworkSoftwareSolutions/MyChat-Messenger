"use strict";

function loginController ($scope, $rootScope, $location){
    $scope.Name = mcConst.dataModels.Login;
    $scope.remember   = false;
    $scope.serverList = [];
    $scope.doLogin    = false;

    var serverManager = $rootScope.isWebClient ? null : $rootScope.UNIT.ctrlServersManager;
    var _view         = null;

    // ======= Error Actions ==========

    function restoreByError() {
        mcService.SaveSessionSettings(mcConst.LoginInfo.login, "", "", false);

        mcConst.LoginInfo.pwd     = "";
        mcConst.LoginInfo.servPwd = "";
        mcConst.LoginInfo.rm      = false;

        $scope.show($scope.lang);
    }

    $rootScope.ErrorActions[14] = function(){ // "14"  : "Неверный пароль пользователя",
        if ($rootScope.isWebClient){
            $rootScope.loginFormNotShowed = false;

            mcService.SaveSessionSettings(mcConst.LoginInfo.login, "", "", false);

            mcConst.LoginInfo.pwd     = "";
            mcConst.LoginInfo.servPwd = "";
            mcConst.LoginInfo.rm      = false;

            if (!_view){
                initLogin($scope);
            }

            webix.ready(function(){
                setTimeout(function(){
                    $scope.passwordField.focus();
                }, 100);
            });
        } else {
            restoreByError();
        }
    };

    $rootScope.ErrorActions[80] = function () {
        if ($rootScope.isWebClient){
            $rootScope.ErrorActions[14]();  // остался мусор в локал сторажде от предыдущего логина
        } else {
            restoreByError();
        }
    };

    $rootScope.ErrorActions[81] = function (params) {
        $rootScope.$broadcast('ErrorMsg', [81, mcConst.ErrorText[81], params, function(){
            $rootScope.ErrorActions[14]();
        }]);
    };

    // ===============================

    function selectCurrentServer() {
        var ID = serverManager.getCurrentServer().ID || serverManager.getServerIdByOrderPosition(0);

        if (ID) {
            $scope.loginSelectServer.setValue(ID);
        }
    }

    function addServerToList(info) {
        var idx = mcService.findItemInArrayOfObj($scope.serverList, info.ID, "id");

        info = serverManager.addServerInfo(info);

        if (info){
            $scope.serverList[idx === -1 ? $scope.serverList.length : idx] = {
                id   : info.ID,
                ord  : mcService.convertBool(!!info.ServerID),
                value: "<span class='" + (info.ServerID ? "green" : "linkColor") + "'>" + (info.ServName ? info.ServName + ", " : "") + info.ServHost + ": " + info.Port + "</span>"
            };

            if (idx === -1){
                $scope.loginSelectServer.getList().add($scope.serverList[$scope.serverList.length - 1]);
            } else {
                $scope.loginSelectServer.define('options', $scope.serverList);
                $scope.loginSelectServer.refresh();
            }

            $scope.loginSelectServer.getList().sort("ord", "dsc", "int");
        }
    }

    function hideLoginForm() {
        $scope.doLogin = true;

        _view = $$($scope.Name);

        if (_view && _view.isVisible && _view.isVisible()){
            _view.hide();
        }

        $rootScope.loginFormNotShowed = true;

        mcService.hideFrame("languageChanger");
    }

    function showLoginForm(args) {
        var lang = args ? args[0] : mcConst.Lang;
        var onlyChangeLang = $scope.lang != undefined && $scope.lang != lang;

        var token = $location.param('token');

        webix.storage.local.put('admLang', $scope.lang);

        if (token){
            $rootScope.SendCMDToServer([
                mcConst.lockInterface,
                mcConst._CMD_.cs_login_by_token,
                token
            ]);

            window.history.pushState(null, document.title, window.location.pathname + window.location.hash.replace("token=" + token, ""));
        } else

        if (_view && _view.show && !onlyChangeLang){
            $scope.doLogin = false;

            _view.show();

            $rootScope.loginFormNotShowed = false;
        } else

        if (!_view || (_view && _view.isVisible && !_view.isVisible()) || (args[0] && $scope.lang != args[0])){
            $scope.doLogin = false;

            $scope.isWebClient = $rootScope.isWebClient;

            var _login  = "";
            var _pwd    = "";
            var _rLogin = "";
            var _rPwd   = "";
            var _rEmail = "";

            if (_view){
                _login  = $scope.loginField      .getValue() || mcConst.LoginInfo.login;
                _pwd    = $scope.passwordField   .getValue();
                _rLogin = $scope.regLoginField   .getValue();
                _rPwd   = $scope.regPasswordField.getValue();
                _rEmail = $scope.regEmailField   .getValue();
            }

            $scope.show.apply(null, args);

            if ($scope.loginField){
                $scope.loginField      .setValue($scope.login || _login);
                $scope.passwordField   .setValue(_pwd   );
                $scope.regLoginField   .setValue(_rLogin);
                $scope.regPasswordField.setValue(_rPwd  );
                $scope.regEmailField   .setValue(_rEmail);
            }
        }
    }

    function acPreLogin(doLogin) {
        var ID = $scope.loginSelectServer.getValue();

        if (ID){
            var server  = serverManager.getServerInfoByID(ID);
            var needPwd = server ? server.ServPass : "";
            var srv_pwd = needPwd && mcService.isString(server.ServPass) ? server.ServPass : "";

            if (needPwd === true && srv_pwd == ""){
                webix.ui({
                    view    : "window",
                    width   : 240,
                    head    : false,
                    position: "center",
                    modal   : true,
                    body: { view  : "form",
                        rules : { "goServPwd" : webix.rules.isNotEmpty },
                        rows  : [
                            { view: "text", type: "password", placeholder: mcLang(3), name: "goServPwd", require: true}, // "3"  :"Пароль к серверу",
                            { cols: [
                                { view: "button", value: mcLang(13), hotkey: "enter", click: function () {// "13" :"Ок",
                                    if (this.getFormView().validate()){
                                        srv_pwd = this.getFormView().getValues()["goServPwd"];

                                        server.ServPass = srv_pwd;

                                        serverManager.addServerInfo(server);

                                        doLogin(srv_pwd);

                                        this.getTopParentView().close();
                                    }
                                }},

                                { view: "button", value: mcLang(33), click: function () {// "33" :"Отмена",
                                    this.getTopParentView().close();
                                }}
                            ]}
                        ]
                    },
                    on: {
                        onShow: function () {
                            this.getChildViews()[0].focus("goServPwd");
                        }
                    }
                }).show();
            } else {
                doLogin(srv_pwd);
            }
        } else {
            webix.alert(mcLang(530)); // "530":"Выберите сервер для подключение!",
        }
    }

    // ===============================

    $scope.checkRegisterChars = function (key, e) {
        return $rootScope.restrictedSymbols.indexOf(e.key) === -1;
    };

    $scope.keyLogin = function(code , e){
        if (code === 13 && !e.ctrlKey && !e.shiftKey && !e.altKey) {
            if ($$("_loginType").getValue() == "loginForm"){
                $scope.loginBtnClick.call($scope.loginForm);
            } else {
                $scope.registerBtnClick.call($scope.registrationForm);
            }

            return false;
        }
    };

    $scope.keyRegister = $scope.keyLogin;

    $scope.checkEmptyList = function () {
        if ($scope.loginSelectServer.getList().count() == 0){
            $scope.showServerManager();
        }
    };

    $scope.checkLangPass = function(displayLang, field){
        var lng      = displayLang;
        var lastChar = field.getValue()[field.getValue().length - 1];

        if (lastChar){
            if (lastChar.match(/[a-zA-Z]/)) {
                lng.define('template', 'EN');
                lng.refresh();
            } else
            if (lastChar.match(/[а-яА-Я]/)){
                lng.define('template', 'RU');
                lng.refresh();
            } else
            if (lastChar.match(/[їЇіІєЄ]/)){
                lng.define('template', 'UA');
                lng.refresh();
            }
        }
    };

    $scope.loginBtnClick = function (){
        function _go(srv_pwd) {
            var login = $scope.loginField   .getValue().toString().replace('\\', '/');
            var pass  = $scope.passwordField.getValue();

            if (login.indexOf('/') !== -1 && !pass){
                webix.message({ type:"error", text: mcService.Lang(7) , expire : mcConst.errMessageExpire}); // "7" : "Ошибка входа: неправильно введены данные"
            } else

            $rootScope.$broadcast('SendCMDToServer' , [
                mcConst.lockInterface,
                mcConst._CMD_.Login,

                login,
                pass,
                srv_pwd,

                mcConst.LoginInfo.rm  
            ]);
        }

        var isValid = this.validate();

        if (isValid) {
            if ($scope.isWebClient){
                mcConst.LoginInfo.servPwd = $scope.servPassField.getValue();

                _go(mcConst.LoginInfo.servPwd);
            } else {
                acPreLogin(function (pwd) {
                    _go(pwd);
                })
            }

            mcConst.LoginInfo.login = $scope.loginField.getValue();
            mcConst.LoginInfo.rm    = $scope.remember;
        } else {
            webix.message({ type:"error", text: mcService.Lang(7) , expire : mcConst.errMessageExpire}); // "7" : "Ошибка входа: неправильно введены данные"
        }
    };

    $scope.registerBtnClick = function(){
        function _go(pwd) {
            $rootScope.$broadcast('SendCMDToServer' , [
                mcConst.lockInterface,
                mcConst._CMD_.Register,

                $scope.regLoginField   .getValue(), //mcConst.LoginInfo.login  ,
                $scope.regPasswordField.getValue(), //mcConst.LoginInfo.pwd    ,
                //$scope.servPassField   .getValue(), //mcConst.LoginInfo.servPwd,
                pwd,

                mcConst.LoginInfo.rm,                //mcConst.LoginInfo.rm
                $scope.regEmailField   .getValue(),
                0
            ]);
        }

        var isValid = this.validate();

        if (isValid) {
            if ($scope.isWebClient){
                _go($scope.servPassField.getValue());
            } else {
                acPreLogin(function (pwd) {
                    _go(pwd);
                })
            }

            mcConst.LoginInfo.login = $scope.regLoginField.getValue();
            mcConst.LoginInfo.rm    = $scope.remember;
        }/*else {
            webix.message({ type:"error", text: mcService.Lang(580) , expire : mcConst.errMessageExpire}); // "580":"Логин не может быть пустым и не должен содержать символы: \"\/\\[]:;|=,+*?<>",
        }*/
    };

    $scope.changeLang = function(lang){
        $rootScope.$broadcast('ChangLanguage', mcService.detectLang(lang));
    };

    $scope.changeServerHost = function (val) {
        serverManager.setCurrentServerByID(val);
    };

    $scope.showServerManager = function () {
        hideLoginForm();

        $rootScope.$broadcast('show' + mcConst.dataModels.ServerManager, [function () {
            showLoginForm();

            mcService.showFrame("languageChanger");

            $scope.loginSelectServer.setValue(null);

            $scope.getMcList();
            //selectCurrentServer();
        }]);
    };

    $scope.show = function(lang, reconn){
        var onlyChangeLang = $scope.lang != undefined && $scope.lang != lang;

        $scope.lang  = lang || mcConst.Lang;
        $scope.login = mcConst.LoginInfo.login || "";

        $scope.remember = mcConst.LoginInfo.rm; 

        webix.storage.local.put(mcConst.storageFields.lang, $scope.lang);

        if (!onlyChangeLang && $scope.remember) {
            $rootScope.loginFormNotShowed = !_view || (_view && _view.isVisible && !_view.isVisible());

            if (reconn){
                // $rootScope.$broadcast('ErrorMsg', [-1, mcLang(18) + "<br><br>" + mcConst.loadGif, '', function(){ // "18" :"Обработка запроса",
                $rootScope.$broadcast('ErrorMsg', ['223', mcConst.ErrorText['223'] + "<br>" + mcLang(539) + "<br><br>" + mcConst.loadGif, '', function(){ // "539":"Восстанавливаем связь!",
                    $rootScope.$broadcast('show' + mcConst.dataModels.Login, []);
                }]);
            }

            setTimeout(function () {
                $rootScope.$broadcast('SendCMDToServer' , [
                    mcConst.lockInterface,
                    mcConst._CMD_.Login,
                    mcConst.LoginInfo.login  ,
                    mcConst.LoginInfo.pwd    ,
                    mcConst.LoginInfo.servPwd,
                    mcConst.LoginInfo.rm
                ]);
            }, reconn ? 500 : 10);
        } else {
            webix.ready(function () {
                _view = initLogin($scope);

                $scope.getMcList(); // reloadServersList

                $rootScope.loginFormNotShowed = false;
            });
        }
    };

    $scope.getMcList = function () { // reloadServersList
        if (!$scope.isWebClient){
            $scope.serverList = [];

            var saveCurrentServer = serverManager.getCurrentServer().ID;

            $scope.loginSelectServer.getList().clearAll();
            $scope.loginSelectServer.setValue();

            serverManager.mapServers(addServerToList);

            if (saveCurrentServer){
                $scope.loginSelectServer.setValue(saveCurrentServer);
            } else {
                var val= serverManager.getServerIdByServID(mcConst.ClientSettings.ServID);

                if (val){
                    $scope.loginSelectServer.setValue(val);
                } else {
                    $rootScope.$broadcast('sendCMDToElectron', [
                        mcConst._CMD_.ce_get_server_list
                    ]);
                }
            }
        }
    };

    // =============================================

    $scope.$on('addServerHostToList', function (e, args) {
        if (_view && $scope.loginSelectServer){
            for (var srv in args[0]){
                addServerToList.call(null, args[0][srv]);
            }

            selectCurrentServer();
        }
    });

    $scope.$on('enable' + $scope.Name, function enableForm (){
        if (_view) _view.enable();
    });

    // ====================================

    $scope.$on('hide' + $scope.Name, function () {
        hideLoginForm();
    });

    $scope.$on('show' + $scope.Name, function(e, args){
        showLoginForm(args);
    });

    $rootScope.$broadcast('windowResize', [function(){
        if (isMobile && _view){
            _view.resize();
        }
    }]);
}
