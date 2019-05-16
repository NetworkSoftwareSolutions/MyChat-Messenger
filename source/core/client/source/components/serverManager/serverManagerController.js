"use strict";

function serverManagerController ($scope, $rootScope){
    $scope.Name = mcConst.dataModels.ServerManager;
    $scope.serverList  = [];
    $scope.runCallBack = null;

    var serverManager = $rootScope.UNIT.ctrlServersManager;
    var _view        = null;
    var isNewServer  = false;

    var KP_EDIT_SERVER_INFO = 'edit_server_info';

    // == Electron Errors Handlers ===

    $rootScope.ElectronErrors[mcConst._CMD_.errElectron.eDuplicateServer] = function (error) {
        webix.alert(error.msg); // "1" : "Сервер с таким IP: \"%s\" и Port: \"%s\" уже существует!"

        // очищаем калбек на неудачное изменение или добавление сервера, сцуконах...
        $rootScope.customCallBack[isNewServer ? mcConst._CMD_.ce_add_server : mcConst._CMD_.ce_modify_server].shift();
    };

    $rootScope.ElectronErrors[mcConst._CMD_.errElectron.eUnknownServerID] = function (error) {
        webix.alert(error.msg); // "2" : "Неизвестный ServerID: %s, сервер не сохранен!"

        // очищаем калбек на неудачное изменение или добавление сервера, сцуконах...
        $rootScope.customCallBack[mcConst._CMD_.ce_modify_server].shift();
    };

    // ===============================

    function clearServerInfo() {
        $scope.servHost.setValue("");
        $scope.servPort.setValue(2004);
        $scope.servName.setValue("");
        $scope.servPass.setValue("");
        $scope.servSSL .setValue(false);
    }

    function fillServerInfo(id) {
        var info = serverManager.getServerInfoByID(id);

        if (info && !isNewServer) {
            $scope.servHost.setValue(info.ServHost);
            $scope.servPort.setValue(info.Port);
            $scope.servName.setValue(info.ServName || "");
            $scope.servPass.setValue(mcService.isString(info.ServPass) ? info.ServPass : "");
            $scope.servSSL .setValue(mcService.convertIntToBool(info.Secured));
        }
    }

    function hideOkAndCancel() {
        if ($scope.okAndCancel.isVisible()){
            $scope.okAndCancel.hide();
            $scope.addAndDel.show();
            $scope.mainServerInfo.hide();

            hideAdditionalInfo();

            $scope.loginSelectServer.show();
            $scope.logResult.hide();

            $scope.managerTitle.define("label", $scope.mainTitle);
            $scope.managerTitle.refresh();

            $rootScope.hotKeyDispatcher.removePreset(KP_EDIT_SERVER_INFO);
        }
    }

    function showOkAndCancel() {
        if ($scope.addAndDel.isVisible()){
            $scope.addAndDel.hide();
            $scope.okAndCancel.show();
            $scope.mainServerInfo.show();

            var bak =   $scope.loginSelectServer.getValue(); // webix при спрятывании списка фокусит предыдущий элемент списка, факиншыт
                        $scope.loginSelectServer.hide();
                        $scope.loginSelectServer.setValue(bak);

            $scope.logResult.hide();

            if ($scope.loginSelectServer.getList().isVisible()){
                $scope.loginSelectServer.getList().hide();
            }

            $rootScope.hotKeyDispatcher.addPreset(KP_EDIT_SERVER_INFO, [{
                key : mcConst.keyCodes.esc,
                func: $scope.cancelServerEdit
            }, {
                key : mcConst.keyCodes.enter,
                func: $scope.saveServerEdit
            }], document, true);
        } else {
            return true;
        }
    }

    function showAdditionalInfo() {
        if (!$scope.additionalServerInfo.isVisible()){
            $scope.additionalServerInfo.show();
        }
    }

    function hideAdditionalInfo() {
        if ($scope.additionalServerInfo.isVisible()){
            $scope.additionalServerInfo.hide();
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

            $scope.addBtn.enable();
            $scope.delBtn.enable();
        }
    }

    function getHost() {
        return mcService.trim($scope.servHost.getValue()).toLocaleLowerCase();
    }

    function getName() {
        return mcService.trim($scope.servName.getValue());
    }

    function getPwd() {
        return mcService.trim($scope.servPass.getValue());
    }

    function getPort(){
        var port = parseInt(mcService.trim($scope.servPort.getValue()));

        if (isNaN(port)){
            port = 2004;
        }

        if (port <=0 || port > 65535){
            port = 2004;
        }

        return port;
    }

    function getSSL() {
        return $scope.servSSL.getValue();
    }

    // ===============================

    $scope.changeServerHost = function (id) {
        serverManager.setCurrentServerByID(id);
    };

    $scope.editServer = function (langCode, clear) {
        showOkAndCancel();
        showAdditionalInfo();

        isNewServer = clear;

        clearServerInfo();

        fillServerInfo($scope.loginSelectServer.getValue());

        $scope.managerTitle.define("label", "<div style='text-align: center'>" + mcLang(langCode).toUpperCase() + "</div>"); // "526":"Добавление сервера", // "527":"Редактирование сервера",
        $scope.managerTitle.refresh();

        $scope.servHost.focus();
    };

    $scope.cancelServerEdit = function () {
        hideOkAndCancel();
    };

    $scope.saveServerEdit = function () {
        var newInfo  = mcService.Marge({}, isNewServer ? {} : serverManager.getServerInfoByID($scope.loginSelectServer.getValue()), {
            ServPass : getPwd(),
            ServName : getName(),
            Port     : getPort(),
            ServHost : getHost(),
            Secured  : getSSL()
        });

        if ($scope.formServerManager.validate()){
            $rootScope.$broadcast('sendCMDToElectron', [
                !newInfo.ServerID || isNewServer
                    ? mcConst._CMD_.ce_add_server
                    : mcConst._CMD_.ce_modify_server,

                newInfo.ServHost,
                newInfo.Port,
                newInfo.ServName,
                "",
                newInfo.ServPass,
                "",
                "",
                newInfo.Secured,
                newInfo.ServerID,

                function (data) { // если есть data, то был добавлен сервер, иначе - обновлен
                    if (data && data.ServerID){
                        newInfo.ServerID = data.ServerID;
                        newInfo.ID       = data.ID;
                        newInfo.id       = data.ID;
                    }

                    addServerToList(newInfo);

                    $scope.loginSelectServer.setValue(newInfo.ID);

                    $scope.cancelServerEdit();
                }
            ]);
        }
    };

    $scope.checkServerConnect = function () {
        var host = getHost();
        var port = getPort();

        if ($scope.formServerManager.validate()){
            $rootScope.$broadcast('sendCMDToElectron', [
                mcConst.lockInterface,
                mcConst._CMD_.ce_test_server_ip,
                host,
                port,
                function (_data) {
                    var err  = mcService.isObject(_data[0]) ? _data[0].message || _data[0].code : "";

                    $scope.logResult.show();
                    $scope.logResult.define('label', "<div style='text-align: center; color: " + (err ? "red" : "green") + ";'>" + (err ? "Error: " + err : mcLang(529)) + "</div>"); // "529":"Тест прошел успешно!
                    $scope.logResult.refresh();
                }
            ]);
        }
    };

    $scope.delServer = function () {
        var ID   = $scope.loginSelectServer.getValue();
        var text = $scope.loginSelectServer.getText();

        webix.confirm({
            type  : "confirm-warning",
            text  : mcLang(525, text), // "525":"Удалить сервер<br><b>%s</b>?",
            ok    : mcService.Lang(519), // "519":"Удалить",
            cancel: mcService.Lang(33),  // "33" :"Отмена",
            callback:function(yes){
                if (yes){
                    var list     = $scope.loginSelectServer.getList();
                    var serverID = serverManager.getServerInfoByID(ID).ServerID;

                    list.remove(ID);

                    if (list.count() == 0){
                        $scope.addBtn.disable();
                        $scope.delBtn.disable();
                    }

                    if (serverID){ // если удаляется сервер, который есть базе - отправляем команду
                        $rootScope.$broadcast('sendCMDToElectron', [
                            mcConst._CMD_.ce_del_server,
                            serverID
                        ]);
                    }

                    serverManager.removeServerByID(ID);

                    if (list.count() != 0){
                        $scope.loginSelectServer.setValue(serverManager.getServerIdByOrderPosition(0));
                    } else {
                        $scope.loginSelectServer.setValue(null);
                    }
                }
            }
        });
    };

    $scope.show = function(){
        _view = initServerManager($scope);
    };

    $scope.getMcList = function () {
        $scope.serverList = [];

        var saveCurrentServer = serverManager.getCurrentServer().ID;

        $scope.loginSelectServer.getList().clearAll();
        $scope.loginSelectServer.setValue();

        serverManager.mapServers(addServerToList);

        if (saveCurrentServer){
            $scope.loginSelectServer.setValue(saveCurrentServer);
        }

        $rootScope.$broadcast('sendCMDToElectron', [
            mcConst._CMD_.ce_get_server_list
        ]);
    };

    $scope.hideServerManager = function () {
        $scope.needHide = true;

        $$($scope.Name).hide();

        $rootScope.hotKeyDispatcher.removePreset(KP_EDIT_SERVER_INFO);

        if ($scope.runCallBack) {
            $scope.runCallBack();
        }
    };

    // =============================================

    var _msg = window._messages_.serversManager = {
        addServerHostToList         : 'addServerHostToList',
        addServerOnSuccessConnect   : 'addServerOnSuccessConnect'
    };

    $scope.$on(_msg.addServerHostToList, function (e, args) {
        if ($scope.loginSelectServer){
            for (var srv in args[0]){
                addServerToList.call(null, args[0][srv]);
            }

            if (mcConst.ServerInfo.ID) {
                $scope.loginSelectServer.setValue(mcConst.ServerInfo.ID);
            }

            $scope.changeServerHost(serverManager.getCurrentServer().ID || serverManager.getServerIdByOrderPosition(0));
        }
    });

    $scope.$on(_msg.addServerOnSuccessConnect, function (e, id) {
        var sInfo = serverManager.getServerInfoByID(id);

        if (sInfo && !sInfo.ServerID){
            $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                mcConst._CMD_.ce_add_server,

                sInfo.ServHost,
                sInfo.Port,
                sInfo.ServName,
                "",
                sInfo.ServPass,
                "",
                "",

                function (info) {
                    serverManager.addServerInfo(info);

                    $rootScope.$broadcast(window._messages_.clientData.saveCurrentServerID, [info.ServerID]);
                }
            ]);
        }
    });

    // ====================================

    $scope.$on('hide' + $scope.Name, function(){
        $scope.needHide = true;

        $$($scope.Name).destructor();
    });

    $scope.$on('show' + $scope.Name, function(e, args){
        $scope.needHide = false;

        $scope.mainTitle = "<div style='font-size: 11pt; text-align: center'>" + mcLang(520).toUpperCase() + "</div>";

        $scope.show();

        $scope.getMcList();

        $scope.runCallBack = args[0] || null;
    });
}