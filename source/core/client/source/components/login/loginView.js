"use strict";

function initLogin($scope){
    var labelWidth = 140;
    var login = null;

    if ($$($scope.Name)) $$($scope.Name).destructor();

    var srvPwdPopup = webix.ui({
        view  : "popup",
        width : 300,
        height: 150,
        body  : { autoheight: true, css:"wrap", borderless: true,
            template: mcService.insertIco("fa-info-circle") + mcService.Lang(64)} // "64" : "Общий пароль, который проверяется перед авторизацией пользователя.<br><br>Устанавливается на сервере в разделе \"Настройки\" -&gt; \"Сетевые настройки\"",
    });

    var loginPopup = webix.ui({
        view  : "popup",
        width : 300,
        height: 120,
        body  : { autoheight: true, css:"wrap", borderless: true,
            template: mcService.insertIco("fa-info-circle") + mcService.Lang(175)} // "175":"Используйте для входа
    });

    var loginBody = {
        id   : 'loginForm',
        view : 'form',
        rules:{
            "loginField"    : webix.rules.isNotEmpty,
            "passwordField" : function (pass) {
                var login = $scope.loginField.getValue().toString().replace('\\', '/');

                return login.indexOf('/') !== -1 ? !!mcService.trim(pass) : true;
            }
        },
        elements:[ { rows: [
            { cols: [ // login
                { id: 'loginField', name: 'loginField', view: "text", labelWidth : labelWidth, value: $scope.login, required: true,
                    invalidMessage: "<span class='red h10'>" + mcService.Lang(66) + "</span>", // "66" : "Поле не может быть пустым",
                    placeholder: mcService.Lang(1), // "1" : "Логин"
                    on: {
                        onKeyPress : function (code) {
                            if (code === 13) {
                                if ($scope.passwordField.getValue() !== ""){
                                    $scope.loginBtnClick.call($scope.loginForm);
                                } else {
                                    $scope.passwordField.focus();
                                }

                                return false;
                            }
                        }
                    }
                },

                { view: "button", template : mcService.insertIco('fa-question'), width: 34, borderless: true, css: "finger webixBlue loginHelper", click: function(){
                    loginPopup.show(this.getNode());
                }}
            ]},

            { cols: [ // password
                { id: 'passwordField', name: 'passwordField', view: "text", labelWidth: labelWidth, type: 'password', /*required: true,*/ keyPressTimeout: 100,
                    invalidMessage: "<span class='red h10'>" + mcService.Lang(66) + "</span>", // "66" : "Поле не может быть пустым",
                    placeholder: mcService.Lang(2), // "2" : "Пароль"
                    on: {
                        onKeyPress      : $scope.keyLogin,
                        onTimedKeyPress : function() {
                            $scope.checkLangPass($scope.loginDispLang, $scope.passwordField);
                        }
                    }
                },

                { id: 'loginDispLang', template: 'EN', width: 34, css: 'loginHelper', borderless: true}
            ]},

            { height: 38}
        ]}]
    };

    var register = {
        id   : 'registrationForm',
        view : 'form',
        hidden: true,
        rules:{
            "regLoginField"    : webix.rules.registerLogin,
            "regPasswordField" : webix.rules.isNotEmpty,
            "regEmailField"    : webix.rules.isEmail
        },
        elements:[ { rows: [
            { id: 'regLoginField', name: 'regLoginField', view: "text", value: '', required: "true",
                placeholder: mcService.Lang(56), // "56" :"Ваш логин",
                invalidMessage: "<span class='red h10'>" + mcService.Lang(581) + "</span>", // "581":"Поле пустое или содержит недопустимые символы",
                on: {
                    onKeyPress: $scope.checkRegisterChars
                }
            },

            { id: 'regPasswordField', name: 'regPasswordField', view: "text", type: 'password', required: "true",
                placeholder: mcService.Lang(58), // "58" : "Введите ваш пароль",
                invalidMessage: "<span class='red h10'>" + mcService.Lang(66) + "</span>", // "66" : "Поле не может быть пустым",
                on: { onKeyPress : $scope.keyRegister }
            },

            { id: 'regEmailField', name: 'regEmailField', view: "text", type: 'email',
                placeholder: mcService.Lang(59), // "59" : "Введите ваш Email",
                invalidMessage: "<span class='red h10'>" + mcService.Lang(66) + "</span>", // "66" : "Поле не может быть пустым",
                on: { onKeyPress : $scope.keyRegister }
            }
        ]}]
    };

    var serverList = { view: "form",
        rows: []
        .concat(!$scope.isWebClient ? { cols: [
            { id: "loginSelectServer"  + $scope.Name, view: "richselect", options: $scope.serverList, value: $scope.serverList.length ? $scope.serverList[0].id : 0 ,
                placeholder   : mcLang(515), // "515":"Не найден сервер для подключения",
                on: {
                    onFocus    : function () {
                        $scope.loginSelectServer.blur();
                    },
                    onItemClick: $scope.checkEmptyList,
                    onChange   : $scope.changeServerHost
                }
            },

            { id: "toggleServerInfo", view: "button", type: "icon", icon: "gear", width: 34, css: "iconNoPadding", tooltip: mcLang(516), // "516":"Настроить сервер для подключения",
                click: $scope.showServerManager
            }
        ]} : {
            hidden: !$scope.isWebClient, cols: [ // server password
                { id: 'servPassField', view: "text", type: 'password', //labelWidth: labelWidth,
                    placeholder: mcService.Lang(3), // "3" : "Пароль к серверу"
                    on   : {
                        onKeyPress : $scope.keyLogin
                    }
                },

                { view: "button", template: mcService.insertIco('fa-question'), width: 34, borderless: true, css: "finger webixBlue loginHelper", click: function(){
                    srvPwdPopup.show(this.getNode());
                }}
            ]})
        .concat(
            { id: "rememberField", view : "checkbox", labelWidth: 0, value: $scope.remember, css: "finger",
                labelRight: $scope.isWebClient ? mcLang(4) : mcLang(533), // "4":"Запомнить меня на этом компьютере", "533":"Автоматически подключаться",
                on  : { onChange: function(newV){
                    $scope.remember = mcService.convertIntToBool(newV);
                }}
            },

            { view: "button", value: mcService.Lang(13), id: "loginBtn", click: function () { // "5" : "Войти" "13" :"Ок",
                var valid = this.getFormView().validate() || $scope.isWebClient;

                if (valid) {
                    if ($$("_loginType").getValue() == "loginForm"){
                        $scope.loginBtnClick.call($scope.loginForm);
                    } else {
                        $scope.registerBtnClick.call($scope.registrationForm);
                    }
                }
            }}
        )
    };

    if (isMobile){
        loginBody.maxWidth = 550;
        loginBody.minWidth = 300;
        register.maxWidth  = 550;
        register.minWidth  = 300;

        login = webix.ui({
            id       : $scope.Name,
            view     : "scrollview",
            css      : "noBGColor",
            body     : { rows: [
                { view: "tabview", id: "_loginType", borderless: true, cells: [
                    { header: mcLang(5),  body: loginBody}, // "5" : "Войти"
                    { header: mcLang(55), body: register }  // "55" : "Регистрация",
                ]},

                serverList
            ]}
        });
    } else {
        if (!$$("loginLang")){
            webix.ui({
                view    : "richselect",
                id      : "loginLang",
                container: "languageChanger",
                value   : $scope.lang,
                css     : "noBGColorAll",
                options : {
                    template : "#value#",
                    data     : [
                        { id : 'en', value : '<img src="' + mcConst.imagesPath.flags + 'en32.png" align="left">&nbsp; english'},
                        { id : 'uk', value : '<img src="' + mcConst.imagesPath.flags + 'uk32.png" align="left">&nbsp; українська'},
                        { id : 'ru', value : '<img src="' + mcConst.imagesPath.flags + 'ru32.png" align="left">&nbsp; русский'}
                    ]
                },
                on : {
                    onChange: $scope.changeLang
                }
            });
        }

        login = webix.ui({
            id       : $scope.Name,
            view     : "window",
            width    : 370,
            position : "center",
            head     : false,
            body     : { rows: [
                { view: "tabview", id: "_loginType", borderless: true, cells: [
                    { header: mcLang(5),  body: loginBody}, // "5" : "Войти"
                    { header: mcLang(55), body: register }  // "55" : "Регистрация",
                ]},

                serverList
            ]},
            on : {
                onHide: function () {
                    if (!$scope.doLogin) { // todo: mazafaka fix  окно прячется при нажатии на ESC баг вебикса
                        login.show();
                    }
                }
            }
        });
    }

    //webix.debug = true;

    $scope.loginForm     = $$('loginForm');
    $scope.passwordField = $$('passwordField');
    $scope.loginDispLang = $$('loginDispLang');
    $scope.loginField    = $$("loginField");
    $scope.servPassField = $$("servPassField");
    $scope.loginBtn      = $$("loginBtn");

    $scope.registrationForm = $$('registrationForm');
    $scope.regLoginField    = $$("regLoginField");
    $scope.regPasswordField = $$("regPasswordField");
    $scope.regEmailField    = $$("regEmailField");

    $scope.loginSelectServer = $$("loginSelectServer" + $scope.Name);

    setTimeout(function () {
        $scope.loginField.focus();
    }, 10);

    login.show();

    return login;
}
