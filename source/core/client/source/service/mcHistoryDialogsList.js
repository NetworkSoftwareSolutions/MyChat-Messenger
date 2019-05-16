/**
 * Created by Gifer on 22.08.2017.
 */

function MCHistoryDialogsList($rootScope) {
    var __list = {};

    function getList() {
        var res = {};

        Object.keys(__list).forEach(function (uin) {
            res[uin] = mcService.Marge({}, __list[uin]);
        });

        return res;
    }

    function getItem(uin) {
        var res = null;

        if (__list.hasOwnProperty(uin)){
            res = mcService.Marge({}, __list[uin]);
        }

        return res;
    }

    function updateItem(uin, name, dt) {
        if (!__list.hasOwnProperty(uin)){
            __list[uin] = {
                DisplayName  : name,
                UIN          : uin
            };
        }

        __list[uin].dtLastMessage = dt;
    }

    // ----------------------------

    this.load = function () {
        $rootScope.Storage.historyDialogs.load(mcConst.UserInfo.UIN, mcConst.storageOpts.HISTORYDLG, function (data) {
            if (data){
                __list = mcService.StringToObj(data);

                $rootScope.$broadcast(window._messages_.historyDialogs.dListFillHistory, [getList()]);
            }
        });
    };

    this.addOrUpdateUser = function(userInfo, dt) {
        var uin = userInfo.UINFrom || userInfo.UIN;

        updateItem(uin, userInfo.DisplayName, dt);

        $rootScope.Storage.historyDialogs.save(mcConst.UserInfo.UIN, mcConst.storageOpts.HISTORYDLG, __list, function () {
            $rootScope.$broadcast(window._messages_.historyDialogs.dListAddOrModifyUser, [
                getItem(uin)
            ]);
        });
    };

    this.removeUser = function (uin) {
        if (__list.hasOwnProperty(uin)){
            delete __list[uin];

            $rootScope.Storage.historyDialogs.save(mcConst.UserInfo.UIN, mcConst.storageOpts.HISTORYDLG, __list);
        } else {
            console.error("History list has't UIN: " + uin);
        }

        $rootScope.$broadcast(window._messages_.historyDialogs.dListHistoryRemoveUser, [uin]);
    };

    this.getHistoryList = function () {
        return getList();
    }
}
