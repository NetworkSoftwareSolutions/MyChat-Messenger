"use strict";

function updateController($scope, $rootScope){
    $scope.Name       = mcConst.dataModels.Update;
    $scope.containers = mcConst.containers;

    var view       = null;
    var serverInfo = {};
    var startDownloadUpdate   = false;
    var downloadUploadManager = new DownloadUploadManager($rootScope, function () {    });

    function hide() {
        startDownloadUpdate = false;

        if (view && view.isVisible()) {
            view.close();
        }
    }
    
    //================================================

    $scope.download = function(){
        startDownloadUpdate = true;

        downloadUploadManager.initViews();

        downloadUploadManager.downloadUrl(mcService.getLocalHostPath(false), {
            downloadUpdate: true
        }, true);
    };

    //================================================

    var _msg = window._messages_.clientUpdate = {
        DownloadClientUpdate        : "DownloadClientUpdate",
        on_file_download_aborted    : "on_file_download_aborted",
        on_file_download_complete   : "on_file_download_complete",
        on_file_download_file_no_found: "on_file_download_file_no_found"
    };

    $scope.$on(_msg.on_file_download_aborted, function(){
        if (startDownloadUpdate){
            $rootScope.$broadcast('show' + mcConst.dataModels.Login, []);
        }
    });
    $scope.$on(_msg.on_file_download_file_no_found, function(){
        if (startDownloadUpdate){
            $rootScope.$broadcast('ErrorMsg', [mcConst._CMD_.Errors.WrongServerVersion, mcConst.ErrorText[mcConst._CMD_.Errors.WrongServerVersion], '', function(){
                $rootScope.$broadcast('show' + mcConst.dataModels.Login, []);
            }]);
        }
    });
    
    $scope.$on(_msg.on_file_download_complete, function(){
        if (startDownloadUpdate){
            hide();

            $scope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                mcConst._CMD_.ce_restart_client
            ]);
        }
    });

    $scope.$on(_msg.DownloadClientUpdate, function(e, args){
        serverInfo = args[0];

        mcConst.UserInfo.PortNode = serverInfo.NodePort;
        mcConst.UserInfo.HTTPS    = serverInfo.HTTPS;

        $scope.duViews = downloadUploadManager.getViews();

        view = initUpdateWrapper($scope);
    });

    $scope.$on('hide' + $scope.Name, hide);
}
