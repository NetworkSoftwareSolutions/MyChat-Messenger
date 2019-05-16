"use strict";

function initServerManager($scope){
    var _view = null;
    var labelWidth = 160;

    if ($$($scope.Name)) $$($scope.Name).destructor();

    _view = webix.ui({
        id       : $scope.Name,
        view     : "window",
        width    : 370,
        position : "center",
        //modal    : true,
        head     : {
            view:"toolbar", margin: -4, cols:[
                { id: "managerTitle" + $scope.Name,  view: "label", label: $scope.mainTitle}, // "520":"Менеджер серверов",
                { view:"icon", icon:"times-circle", click: $scope.hideServerManager, tooltip: mcLang(528)} // "528":"Закрыть менеджер серверов",
            ]
        },
        body     : { id: "formServerManager" + $scope.Name, view: "form", padding: 4, rules:{
            "servHost" : mcService.isValidHostName,
            "servPort" : webix.rules.isNumber
        }, rows: [{ rows: [
            { id: "loginSelectServer" + $scope.Name, view: "richselect", options: $scope.serverList, placeholder: mcLang(531), // "531":"Нет серверов",
                value: $scope.serverList.length ? $scope.serverList[0].id : 0,
                on: {
                    onChange: $scope.changeServerHost,
                    onFocus : function () {
                        $scope.loginSelectServer.blur();
                    }
                }
            },

            { id: "mainServerInfo", padding: 4, hidden: true, rows: [
                { cols: [
                    { id: 'servHost', name: "servHost", view: "text", label: mcService.Lang(512), labelWidth: labelWidth,
                        invalidMessage: "<span class='red h10'>" + mcService.Lang(532) + "</span>", // "532":"Некорректный адрес сервера",
                        labelAlign: "right", required: true},// "512":"Адрес сервера",

                    { id: "checkConnect" + $scope.Name, view: "button", type: "icon", icon: "bolt", css: "iconNoPadding green byCenter",
                        width: 36, click: $scope.checkServerConnect, tooltip: mcLang(523)} // "523":"Тест",
                ]},

                { id: 'servPort', name: "servPort", view: "text", label: mcService.Lang(513), labelWidth: labelWidth, value: 2004,
                    invalidMessage: "<span class='red h10'>" + mcService.Lang(524) + "</span>", // "524":"Порт должен быть числом от 1 до 65535",
                    labelAlign: "right", required: true} // "513":"Порт сервера",
            ]},

            { id: "additionalServerInfo", padding: 4, hidden: true, rows: [
                { id: 'servName', view: "text", labelWidth: labelWidth, labelAlign: "right",
                    label: mcService.Lang(514)}, // "514":"Название сервера",

                { id: 'servPass', view: "text", type: 'password', labelWidth: labelWidth, labelAlign: "right",
                    label: mcService.Lang(3) }, // "3" : "Пароль к серверу"

                { id: "servSSL",  view : "checkbox", labelWidth: 0, value: $scope.remember, css: "finger",
                    labelRight: mcService.Lang(522)} // "522":"Использовать шифрование",
            ]},

            { id: "addAndDel", height: 40, cols: [
                { view: "button", type: "icon", icon: "plus-square", css: "iconNoPadding",
                    label: mcLang(518), click: function() { // "518":"Добавить",
                        $scope.editServer(526, true); // "526":"Добавление сервера",
                    }},

                { id: "addBtn" + $scope.Name, view: "button", type: "icon", icon: "pencil-square", css: "iconNoPadding", disabled: true,
                    label: mcLang(521), click: function() { // "521":"Изменить",
                        $scope.editServer(527); // "527":"Редактирование сервера",
                    }},

                { id: "delBtn" + $scope.Name, view: "button", type: "icon", icon: "minus-square", css: "iconNoPadding", disabled: true,
                    label: mcLang(519), click: $scope.delServer} // "519":"Удалить",
            ]},

            { height: 1},

            { id: "logResult", view: "label", hidden: true, css: "red"},

            { id: "okAndCancel", hidden: true, height: 40, cols: [
                { id: "saveServer" + $scope.Name, view: "button", type: "icon", icon: "check-circle", css: "iconNoPadding green byCenter",
                    label: mcLang(77), click: $scope.saveServerEdit}, // "77" :"Сохранить",

                { view: "button", type: "icon", icon: "times-circle", css: "iconNoPadding red byCenter",
                    label: mcLang(33), click: $scope.cancelServerEdit} // "33" :"Отмена",
            ]},

            { height: 3 }
        ]}]},
        on : {
            onHide: function () {
                if (!$scope.needHide) { // todo: mazafaka fix  окно прячется при нажатии на ESC баг вебикса
                    _view.show();
                }
            }
        }
    });

    // =============================

    $scope.servHost = $$("servHost");
    $scope.servPort = $$("servPort");
    $scope.servName = $$("servName");
    $scope.servPass = $$("servPass");
    $scope.servSSL  = $$("servSSL");

    $scope.addBtn = $$("addBtn" + $scope.Name);
    $scope.delBtn = $$("delBtn" + $scope.Name);

    $scope.checkConnect = $$("checkConnect" + $scope.Name);
    $scope.saveServer   = $$("saveServer" + $scope.Name);

    $scope.logResult = $$("logResult");

    $scope.addAndDel   = $$("addAndDel");
    $scope.okAndCancel = $$("okAndCancel");

    $scope.loginSelectServer = $$("loginSelectServer"  + $scope.Name);
    $scope.formServerManager = $$("formServerManager" + $scope.Name);

    $scope.additionalServerInfo = $$("additionalServerInfo");
    $scope.mainServerInfo       = $$("mainServerInfo");

    $scope.managerTitle = $$("managerTitle" + $scope.Name);

    _view.show();

    return _view;
}
