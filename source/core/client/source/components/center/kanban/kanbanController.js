"use strict";

function kanbanController($scope, $rootScope, mcPlaySound){
    $scope.Name = mcConst.dataModels.Kanban;

    var iFrame = null;
    var goUrl  = null;

    $scope.token     = null;
    $scope.kanbanURL = "";

    function setKanbanUrl(url) {
        if (!$scope.token){
            $rootScope.SendCMDToServer([
                mcConst._CMD_.cs_create_token,
                mcConst.SessionID,

                $rootScope.chatAliases.Kanban.toLowerCase(),
                $scope.kanbanURL,

                function (data) {
                    $scope.token     = data.Token;

                    if (url){

                    }
                    $scope.kanbanURL = url || $scope.kanbanURL; //(mcService.getLocalHostPath($rootScope.isWebClient) + "/" + mcConst.pathAliases.AliasKanban + "/");

                    if (!iFrame.config.src) {
                        iFrame.define("src", $scope.kanbanURL + $scope.getToken($scope.kanbanURL));
                    }
                }
            ]);
        } else {
            goUrl = url.indexOf($scope.token) > 0 ? url : (url + $scope.getToken(url));

            if (iFrame && url.indexOf(mcService.getLocalHostPath($rootScope.isWebClient) === 0)){
                iFrame.define("src", goUrl);

                goUrl = null;
            } else {
                console.warn("Wrong URL for iFrame:" + goUrl);
            }
        }
    }

    // =====================================
    // =====================================

    $scope.getToken = function (url) {
        return $scope.token ? (url.indexOf("?") === -1 && url.indexOf("#") === -1 ? "?" : "&") + "token=" + $scope.token : "";
    };

    $scope.registerHotKeys = function () {
        // $rootScope.hotKeyDispatcher.addPreset(mcConst.dataModels.Kanban, [{
        //     key   : mcConst.keyCodes.enter,
        //     func  : function () {
        //     }
        // }], document);
    };

    $scope.removeHotKeys = function () {
        // $rootScope.hotKeyDispatcher.removePreset(mcConst.dataModels.Kanban);
    };

    $scope.show = function(){
        iFrame = initKanbanFrame($scope);
    };

    // $scope.onLoadKanban = function () {
    //     if (goUrl){
    //         setTimeout(function () {
    //             setKanbanUrl(goUrl);
    //         }, 200);
    //     }
    // };

    //========================================

    var _msg = _messages_.kanban = {
        openKanbanUrl  : 'openKanbanUrl',
        closeKanban    : 'closeKanban'
    };

    $scope.$on(_msg.openKanbanUrl, function (e, args) {
        setKanbanUrl.apply(null, args);
    });

    $scope.$on(_msg.closeKanban, function () {
        if (iFrame){
            $scope.token = null;
            $scope.kanbanURL = null;

            iFrame.define('src', "");
        }
    });

    $scope.$on('hide' + $scope.Name, function(){
        $scope.removeHotKeys();

        if (iFrame && iFrame.isVisible()) {
            iFrame.hideFrame();
        }
    });

    $scope.$on('show' + $scope.Name, function(e, args){
        $scope.container = args[0];

        if (!$scope.kanbanURL) {
            $rootScope.SendCMDToServer([
                mcConst._CMD_.cs_create_token,
                mcConst.SessionID,

                $rootScope.chatAliases.Kanban.toLowerCase(),
                $scope.kanbanURL,

                function (data) {
                    $scope.token = data.Token;

                    $scope.show();

                    if (!iFrame.config.src) {
                        $scope.kanbanURL = mcService.getLocalHostPath($rootScope.isWebClient) + "/" + mcConst.pathAliases.AliasKanban + "/";

                        iFrame.define("src", $scope.kanbanURL + $scope.getToken($scope.kanbanURL));
                    }
                }
            ]);
        }

        // if ($scope.token){
        // } else {
            $scope.show();
        // }
    });
}