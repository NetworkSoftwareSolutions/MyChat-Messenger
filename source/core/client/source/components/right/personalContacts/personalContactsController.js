"use strict";

function personalContactsController($scope, $rootScope){
    $scope.Name = mcConst.dataModels.PersonalContacts;

    var _view = null;
    var state = null;
    var userStatuses = null;

    $scope._contextMenuList = window.mcWidgets.ButtonsListWithContext ? new window.mcWidgets.ButtonsListWithContext($rootScope) : null;
    // =======================================================

    function fillContactList(data){
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

    // =======================================================

    $scope.registerHotKeys = function () {
        $rootScope.hotKeyDispatcher.addPreset($scope.Name, [{
            lockPrev: true,
            key   : mcConst.keyCodes.esc,
            func  : function hidePopupPersonalContacts() {
                $scope.contextPersonalContacts.hideContext();
            }
        }], document, true);
    };

    $scope.removeHotKeys = function () {
        setTimeout(function () {
            $rootScope.hotKeyDispatcher.removePreset($scope.Name);
        }, 10);
    };
    
    $scope.onShowPopMenu = function () {
        var context = this.getContext();

        context.obj.select(context.id);

        var uu = context.obj.getItemNode(context.id);

        $scope.registerHotKeys();

        this.getChildViews()[0].getChildViews()[2][context.obj.getItem(context.id).IsGroup ? "enable" : "disable"]();

        this.blockEvent();

        this.show(uu, {y: 12}, "bottom");

        this.unblockEvent();
    };

    $scope.contextMenu = {
        addGroup: function (edit) {
            var form  = this;
            var value = mcService.trim(edit.getValue());

            if (form.validate() && value){
                state = _view.getState();

                $rootScope.SendCMDToServer([
                    mcConst._CMD_.cs_add_personal_contact_group,
                    mcConst.SessionID,
                    
                    value
                ]);
            } else {
                return true;
            }
        },
        addUser : function (edit, btns, item) {
            var form = this;
            var uin  = parseInt(edit.getValue());

            if (form.validate() && !isNaN(uin)){
                state = _view.getState();

                $rootScope.SendCMDToServer([
                    mcConst._CMD_.cs_add_new_contact,
                    mcConst.SessionID,

                    uin,
                    item.ParentID
                ]);
            } else {
                webix.message(mcLang(566)); // "566":"Укажите числовой UIN пользователя",

                setTimeout(function(){
                    edit.focus();
                }, 20);

                return true;
            }
        },
        del     : function (item) {
            state = _view.getState();

            $rootScope.SendCMDToServer([
                mcConst._CMD_.cs_delete_id_from_personal_contacts,
                mcConst.SessionID,

                item.id
            ]);
        },
        renameGroup: function (edit, btns, item) {
            var form  = this;
            var value = mcService.trim(edit.getValue());

            if (form.validate() && value){
                state = _view.getState();

                $rootScope.SendCMDToServer([
                    mcConst._CMD_.cs_rename_contacts_group,
                    mcConst.SessionID,

                    item.GroupID,
                    value
                ]);
            } else {
                return true;
            }
        }
    };

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
            mcConst._CMD_.cs_get_contacts_list,
            mcConst.SessionID,

            fillContactList
        ]);
    };

    $scope.show = function(){
        $rootScope.setTool($scope.Name);

        _view = initPersonalContacts($scope);
    };

    // =============================================

    var _msg = _messages_.personalContacts = {
        allUsersOnlineStatusesChanged   : 'allUsersOnlineStatusesChanged',
        fillPersonalContactList         : 'fillPersonalContactList'
    };

    $rootScope.$on(_msg.allUsersOnlineStatusesChanged, function(e, args){
        userStatuses = args[0];

        mcService.updateStatuses(userStatuses, $scope.data);

        if (_view){
            _view.refresh();
        }
    });

    $rootScope.$on(_msg.fillPersonalContactList, function(e, args){
        fillContactList.apply(null, args);
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
