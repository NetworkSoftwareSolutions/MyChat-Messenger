
function UsersCustomOptions($rootScope) {
    var uOptionList = {
        // 3: {
        //     autoReceive: true
        // }
    };
    var saveTimeout = null;

    // ------------------------------
    
    function __hasUin(uin) {
        return uOptionList.hasOwnProperty(uin);
    }
    
    function __save() {
        // uOptionList[uin] = data;

        $rootScope.Storage.dialogs.save(mcConst.ServerInfo.ID, mcConst.UserInfo.UIN, mcConst.storageOpts.cUserOpt, JSON.stringify(uOptionList));
    }

    // ------------------------------

    this.load = function () {
        $rootScope.Storage.dialogs.load(mcConst.ServerInfo.ID, mcConst.UserInfo.UIN, mcConst.storageOpts.cUserOpt, function (data) {
            uOptionList = mcService.StringToObj(data) || {};
        });
    };

    this.saveAll = __save;

    this.getUser = function (uin) {
        return __hasUin(uin) ? uOptionList[uin] : {};
    };

    this.getOption = function (uin, name) {
        return __hasUin(uin) ? uOptionList[uin][name] : null;
    };

    this.setUser = function (uin, opt) {
        if (mcService.isObject(opt)){
            uOptionList[uin] = opt;
        } else {
            console.warn("UsersCustomOptions.setUser: can't save options, is not an object!");
        }
    };

    this.setUserOption = function (uin, name, val) {
        if (!__hasUin(uin)){
            uOptionList[uin] = {};
        }

        uOptionList[uin][name] = val;

        if (!saveTimeout){
            saveTimeout = setTimeout(function () {
                __save();
            }, 100);
        }
    }
}