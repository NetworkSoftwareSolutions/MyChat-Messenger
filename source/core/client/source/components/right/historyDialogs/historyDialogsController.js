"use strict";

function historyDialogsController($scope, $rootScope){
    $scope.Name = mcConst.dataModels.HistoryDialogs;

    var _view = null;

    $scope.data = [];

    // =======================================================

    function historyUser(_user) {
        var dt = _user.dtLastMessage.split('.');

        if (dt){
            _user.date = mcService.myReplaceFormated(
                "#{day} #{month}, #{year}",
                {
                    day  : dt[0],
                    month: webix.i18n.calendar.monthShort[dt[1] - 1],
                    year : dt[2]
                }
            );

            _user.time = mcService.myReplaceFormated(
                "#{hour}:#{min}:#{sec}",
                {
                    hour: dt[3],
                    min : dt[4],
                    sec : dt[5]
                }
            );
        }

        _user.sortDate = mcService.sortableDate(_user.dtLastMessage);

        return _user;
    }

    function fillDialogsHistory(data){
        $scope.data = mcService.convertObjToArray(data || $scope.data);

        $scope.data.forEach(function (val) {
            historyUser(val);

            val.id = "hs_" + val.UIN;
        });

        if ($scope.historyList){
            $scope.historyList.clearAll();
            $scope.historyList.parse($scope.data);
        }
    }

    function addOrMove(user) {
        if (user && user.UIN !== undefined){
            var __id = "hs_" + user.UIN;

            user.id = __id;

            if ($scope.historyList){
                var item = $scope.historyList.getItem(__id);

                if (item) {
                    item = mcService.Marge(item, historyUser(user));

                    $scope.historyList.updateItem(__id, item);
                    $scope.historyList.moveTop(__id);
                } else {
                    $scope.historyList.add(historyUser(user), 0);
                }
            } else {
                var idx = mcService.findItemInArrayOfObj($scope.data, user.UIN, "UIN");

                if (idx === -1){
                    $scope.data.unshift(historyUser(user));
                } else {
                    $scope.data[idx] = historyUser(user);
                }
            }
        }
    }

    function removeUser(uin) {
        // todo: если нужно добавить возможность удалять пользователей из истории
    }

    // =======================================================

    $scope.openPrivate = function(id){
        var user = $scope.historyList.getItem(id);

        if (user) {
            $rootScope.$broadcast('OpenPrivate', [user.UIN]);
        }
    };

    $scope.pinTool = function(on){
        $rootScope.$broadcast( on ? 'pinTool' : 'unPinTool', [$scope.Name]);
    };

    $scope.show = function(){
        $rootScope.setTool($scope.Name);

        _view = initHistoryDialogs($scope);
    };

    // =============================================

    var _msg = _messages_.historyDialogs = {
        dListAddOrModifyUser    : 'dListAddOrModifyUser',
        dListFillHistory        : 'dListFillHistory',
        dListHistoryRemoveUser  : 'dListHistoryRemoveUser',
    };

    $scope.$on(_msg.dListHistoryRemoveUser, function (e, args) {
        removeUser.apply(null, args);
    });

    $scope.$on(_msg.dListAddOrModifyUser, function (e, args) {
        addOrMove.apply(null, args);
    });

    $scope.$on(_msg.dListFillHistory, function (e, args) {
        fillDialogsHistory.apply(null, args);
    });

    $scope.$on('hide' + $scope.Name, function(){
        _view.hide();
    });

    $scope.$on('show' + $scope.Name, function(e, args){
        $scope.container = args[0];

        $scope.show();
    });
}
