"use strict";

function commonFilesController($scope, $rootScope){
    $scope.Name = mcConst.dataModels.CommonFiles;

    var iFrame = null;

    function setFtpUrl(url) {
        if (iFrame && url.indexOf(mcService.getLocalHostPath($rootScope.isWebClient) === 0)){
            iFrame.define("src", url);
        } else {
            console.error("Wrong URL for iFrame:" + url);
        }
    }

    // ==================================

    $scope.pinTool = function(on){
        $rootScope.$broadcast( on ? 'pinTool' : 'unPinTool', [$scope.Name]);
    };

    $scope.getData = function(){
        var task = new mcService.TaskList();

        task.AddTask(function () {
            $rootScope.SendCMDToServer([
                mcConst._CMD_.cs_get_public_ftp_info,
                mcConst.SessionID,

                function (info) {
                    mcConst.FTP.CommonUser = info.Login;
                    mcConst.FTP.CommonPWD  = info.Pass;

                    task.Next();
                }
            ]);
        });

        task.AddTask(function () {
            $rootScope.$broadcast("sendCMDToElectron", [
                mcConst._CMD_.ce_ftp_login,
                mcConst.FTP.CommonUser,
                mcConst.FTP.CommonPWD,

                function () {
                    task.Next();
                }
            ]);
        });

        task.AddTask(function () {
            $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                mcConst._CMD_.ce_ftp_list,
                './',
                function (data) {
                    console.log(data);

                    $scope.fileList.clearAll();
                    $scope.fileList.parse(data);
                }
            ]);
        });

        task.Run();
    };

    $scope.show = function(){
        $rootScope.setTool($scope.Name);

        iFrame = initCommonFiles($scope);
    };

    // ==================================

    var _msg = _messages_.commonFiles = {
        openCommonFilesUrl  : 'openCommonFilesUrl'
    };

    $scope.$on(_msg.openCommonFilesUrl, function (e, args) {
        setFtpUrl.apply(null, args);
    });

    $scope.$on('hide' + $scope.Name, function(){
        iFrame.hide();
    });

    $scope.$on('show' + $scope.Name, function(e, args){
        $scope.container = args[0];

        $scope.pathFTP = mcService.getLocalHostPath(true);

        $scope.show();
        $scope.getData();
    });
}
