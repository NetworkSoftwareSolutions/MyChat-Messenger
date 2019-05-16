"use strict";

function mainMenuController($scope, $rootScope){
    $scope.Name = mcConst.dataModels.MainMenu;

    var variants = {
        PROFILE  : 1,
        SETTINGS : 2,
        LOGS     : 3,
    };

    var view = null;
    var MAIN_MENU = 'MAIN_MENU';
    var currentMenu = 0;

    //===================================================

    $scope.profile = function(){
        $rootScope.$broadcast("changeCenterView", [mcConst.dataModels.UserProfile, mcConst.UserInfo.UIN]);

        currentMenu = variants.PROFILE;
    };

    $scope.logs = function () {
        $rootScope.$broadcast("changeCenterView", [mcConst.dataModels.ViewLogs, mcConst.UserInfo.UIN]);

        currentMenu = variants.LOGS;
    };

    $scope.settings = function () {
        $rootScope.$broadcast("changeCenterView", [mcConst.dataModels.Settings]);

        currentMenu = variants.SETTINGS;
    };

    // ------------

    $scope.registerHotKeys = function () {
        $rootScope.hotKeyDispatcher.addPreset(MAIN_MENU, [{
            key     : mcConst.keyCodes.esc,
            lockPrev: true,
            func    : function () {
                $rootScope.$broadcast('showHideMenu');
            }
        }], document);
    };

    $scope.changeStatus = function (newStatus) {

    };

    $scope.removeHotKeys = function () {
        $rootScope.hotKeyDispatcher.removePreset(MAIN_MENU);
    };

    $scope.logout = function(){
        mcService.ClearSessionSettings(true, true);

        $rootScope.$broadcast('SendCMDToServer' , [
            mcConst.lockInterface,
            mcConst._CMD_.cs_quit,
            mcConst.SessionID
        ]);

        setTimeout(function(){
            $rootScope.$broadcast('StopPingTimer');

            location.search = "";
            location.reload();
        }, 200);
    };

    $scope.quit = function(){
        $rootScope.$broadcast("quitFromProgram");
    };

    $scope.show = function(){
        $scope.isWebClient =  $rootScope.isWebClient;

        view = initMainMenu($scope);

        $scope.registerHotKeys();
    };

    //==================================================

    var _msg = _messages_.mainMenu = {
        logoutMenu  : 'logoutMenu'
    };

    $scope.$on(_msg.logoutMenu, $scope.logout);

    $scope.$on('hide' + $scope.Name, function(){
        $scope.removeHotKeys();

        view.hide();

        switch (currentMenu){
            case variants.PROFILE:
            break;

            case variants.LOGS: case variants.SETTINGS:
                $rootScope.$broadcast("changeCenterView", [mcConst.dataModels.ChatFrame, 'd' + $rootScope.GetChatTypeID()]);
            break;
        }
    });

    $scope.$on('show' + $scope.Name, function(e, args){
        $scope.container = args[0];

        $scope.wndSize = $rootScope.wndSize;

        $scope.show();
    });
}
