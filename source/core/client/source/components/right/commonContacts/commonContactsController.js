"use strict";

function commonContactsController($scope, $rootScope){
    $scope.Name = mcConst.dataModels.CommonContacts;

    var _view = null;
    var state = null;
    var userStatuses = null;

    function fillContacts(data){
        _view.clearAll();
        _view.parse(mcService.convertDataToTree(data));

        $scope.data = _view.data;

        if (userStatuses){
            mcService.updateStatuses(userStatuses, $scope.data);
        }

        if (state) {
            _view.setState(state);
        } else {
            state = _view.getState();
        }
    }

    // ==================================

    $scope.openPrivate = function(id){
        var uin = $$(this).getItem(id).UIN;

        if (uin){
            $rootScope.$broadcast('OpenPrivate', [uin]);
        }
    };

    $scope.pinTool = function(on){
        $rootScope.$broadcast( on ? 'pinTool' : 'unPinTool', [$scope.Name]);
    };

    $scope.getData = function(){
        $rootScope.$broadcast('SendCMDToServer' , [
            mcConst._CMD_.cs_get_common_contacts_list,
            mcConst.SessionID,
            fillContacts
        ]);
    };

    $scope.show = function(){
        $rootScope.setTool($scope.Name);

        _view = initCommonContacts($scope);
    };

    // ==================================

    $scope.$on('allUsersOnlineStatusesChanged', function(e, args){
        userStatuses = args[0];

        mcService.updateStatuses(userStatuses, $scope.data);

        if (_view){
            _view.refresh();
        }
    });

    $scope.$on('newCommonContactList', function(e, args){
        if (_view){
            state = _view.getState();

            fillContacts.apply(null, args);
        }
    });

    $scope.$on('hide' + $scope.Name, function(){
        state = _view.getState();
        
        _view.getParentView().hide();
    });

    $scope.$on('show' + $scope.Name, function(e, args){
        $scope.container = args[0];

        $scope.show();
        $scope.getData();
    });
}
