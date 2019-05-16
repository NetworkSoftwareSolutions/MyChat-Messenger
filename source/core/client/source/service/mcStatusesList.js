/**
 * Created by Gifer on 22.08.2017.
 */

function MCStatusesList($rootScope) {
    var __userOnlineStatuses = {};
    var __onChange = {};

    function __clearState() {
        __userOnlineStatuses = {};
    }

    function __getAllStates() {
        return mcService.Marge({}, __userOnlineStatuses);
    }

    function __setUserState(uin, state) {
        if (uin.toString() === '0'){
            __userOnlineStatuses[uin] = mcConst.states.online;
        } else {
            __userOnlineStatuses[uin] = state === undefined ? mcConst.states.offline : parseInt(state);
        }

        mcService.setStatusForUser(uin, __userOnlineStatuses[uin]);

        return __userOnlineStatuses[uin];
    }

    function __loadUserStatuses(){
        $rootScope.$broadcast('SendCMDToServer', [
            mcConst._CMD_.cs_get_online_users_states,
            mcConst.SessionID,

            function (states){
                if (states.Users && states.Statuses) {
                    states.Users    = states.Users.split(',');
                    states.Statuses = states.Statuses.split(',');

                    __clearState();

                    states.Users.forEach(function (uin, id) {
                        __setUserState(uin, states.Statuses[id]);
                    });

                    __setUserState(0, mcConst.states.online);

                    Object.keys(__onChange).forEach(function (name) {
                        __onChange[name](__getAllStates());
                    });

                    $rootScope.$broadcast('allUsersOnlineStatusesChanged', [__getAllStates()]);
                }
            }
        ]);
    }

    function __getUserState(uin) {
        return __userOnlineStatuses.hasOwnProperty(uin) ? __userOnlineStatuses[uin] : mcConst.states.offline;
    }

    function __removeState(uin) {
        if (__userOnlineStatuses.hasOwnProperty(uin)){
            delete __userOnlineStatuses[uin];

            return true;
        }
    }

    function __onStatesChange(name, func) {
        __onChange[name] = func;
    }

    function __removeChangeHandler(name) {
        if (__onChange.hasOwnProperty(name)){
            delete __onChange[name];
        } else {
            console.warn('removeChangeHandler: Not found name: ' + name);
        }
    }

    // ----------------------------

    this.setUserState = __setUserState;

    this.getUserState = __getUserState;

    this.removeState  = __removeState;

    this.getAllState  = __getAllStates;

    this.clearState   = __clearState;

    this.loadUserStatuses = __loadUserStatuses;

    this.onStatesChange = __onStatesChange;

    this.removeChangeHandler = __removeChangeHandler;
}
