"use strict";

function receiveFilesController($scope, $rootScope){
    $scope.Name = mcConst.dataModels.ReceiveFiles;

    var _view = null;

    $scope.data = null;

    // =======================================================
    
    function setData(data) {
        // FilesList
        // DisplayName
        // UIN
        // Size
        // Count

        $scope.data = data;

        $scope.receiveInfo.define('template', mcService.myReplaceFormated(
            "<div class='borderBottom lHeight28'>" +
                "#{tFrom} <span class='bolder brown'>#{from}</span><br>" +
                "#{tSize} <span class='bolder brown'>#{size}</span><br>" +
            "</div>",
            {
                tFrom : mcLang(593), // "593":"От:",
                tSize : mcLang(594), // "594":"Объем:",

                from  : $scope.data.DisplayName,
                size  : mcService.formatFileSize($scope.data.Size),
                count : $scope.data.Count
            }
        ));
        $scope.receiveInfo.refresh();

        $scope.receiveFolder.define("template", $scope.data.DownloadPath);
        $scope.receiveFolder.refresh();

        $scope.filesList.clearAll();
        $scope.filesList.parse($scope.data.FilesList);
    }
    
    // =======================================================

    $scope.pinTool = function(on){
        $rootScope.$broadcast( on ? 'pinTool' : 'unPinTool', [$scope.Name]);
    };

    $scope.changeReceiveFolder = function () {
        $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
            mcConst._CMD_.ce_file_set_new_folder_for_user,
            $scope.data.DownloadPath,
            
            function (newPath) {
                $scope.data.DownloadPath = newPath;
                
                $scope.receiveFolder.define("template", $scope.data.DownloadPath);
                $scope.receiveFolder.refresh();
            }
        ]);
    };

    $scope.startReceive = function () {
        $rootScope.$broadcast(window._messages_.downloadUpload.acceptReceiveFiles, [$scope.data.DownloadPath]);
    };

    $scope.cancelReceive = function () {
        $rootScope.$broadcast(window._messages_.downloadUpload.rejectReceiveFiles);
    };

    $scope.show = function(){
        $rootScope.setTool($scope.Name);

        _view = initReceiveFiles($scope);

        if (!$scope.pinFiles.getValue()){
            $scope.pinFiles.callEvent("onItemClick");
        } else {
            $scope.pinTool(true);
        }
    };

    // =============================================

    var _msg = _messages_.receiveFiles = {
        setReceiveFilesInfo : 'setReceiveFilesInfo',
    };

    $scope.$on(_msg.setReceiveFilesInfo, function (e, args) {
        setData.apply(null, args);
    });

    $scope.$on('hide' + $scope.Name, function(){
        _view.hide();
    });

    $scope.$on('show' + $scope.Name, function(e, args){
        $scope.container = args[0];

        $scope.show();
    });
}
