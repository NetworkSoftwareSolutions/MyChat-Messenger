"use strict";

function confUserListController($scope, $rootScope){
    $scope.Name = mcConst.dataModels.ConfUserList;

    var _view = null;

    $scope.data = [];

    function removeUsers(uins) {
        uins = mcService.isArray(uins) ? uins : uins.toString().split(',');

        uins.forEach(function (uin) {
            if ($scope.confUserList.getItem(uin)) {
                $scope.confUserList.remove(uin);
            }

            mcService.delArrayItem($scope.data, mcService.findItemInArrayOfObj($scope.data, uin, "UIN"));
        });
    }

    function clearUser() {
        if ($scope.confUserList){
            $scope.confUserList.clearAll();
        }
    }

    // =============================================================

    $scope.openPrivate = function(id){
        var uin = $$(this).getItem(id).UIN;

        if (uin != mcConst.UserInfo.UIN){
            $rootScope.$broadcast('OpenPrivate', [uin]);
        }

        return false;
    };

    $scope.leaveConf = function () {
        $rootScope.$broadcast('leaveConf', [$rootScope.GetChatID()]);
    };

    $scope.getData = function(){
        $rootScope.$broadcast('getConfUsersList', [
            $rootScope.GetChatID(),
            function(data){
                $scope.data = data;
                
                // console.log(data);

                $scope.show();
            }
        ]);
    };

    $scope.show = function(){
        if ($rootScope.GetChatType() === 'UID'){
            $rootScope.setTool($scope.Name);

            _view = initConfUserList($scope);
        }
    };

    // =====================================================

    var _msg = window._messages_.confUsers = {
        removeUserFromConf  : 'removeUserFromConf',
        addUserToConf       : 'addUserToConf',
        clearUserForUID     : 'clearUserForUID',
        allUsersOnlineStatusesChanged: 'allUsersOnlineStatusesChanged'
    };

    $scope.$on(_msg.clearUserForUID, function () {
        clearUser();
    });

    $rootScope.$on(_msg.allUsersOnlineStatusesChanged, function(e, args){
        var forRemove = [];
        var newState  = args[0];

        $scope.data.forEach(function (user) {
            if (user.UIN != mcConst.UserInfo.UIN && (user.State == mcConst.states.offline || user.State === undefined)){
                forRemove.push(user.UIN);
            }
        });

        removeUsers(forRemove);

        mcService.updateStatuses(newState, $scope.data);
    });

    $scope.$on(_msg.addUserToConf, function(e, args){
        if (_view){
            var users = args[0];

            $scope.confUserList.parse(users);
            $scope.confUserList.sort('DisplayName', 'asc');
        }
    });

    $scope.$on(_msg.removeUserFromConf, function(e, args){
        removeUsers.apply(null, args);
    });

    $scope.$on('hide' + $scope.Name, function(){
        if (_view){
            _view.hide();
        }
    });

    $scope.$on('show' + $scope.Name, function(e, args){
        $scope.container = args[0];

        $scope.getData();
    });
}
