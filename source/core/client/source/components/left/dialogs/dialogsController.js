"use strict";

function dialogsController($scope, $rootScope, mcPlaySound){
    $scope.Name = mcConst.dataModels.Dialogs;
    $scope.data = [];

    var contacts       = null;
    var confList       = {};
    var privatList     = {};
    var privateSequence= [];
    var prevID         = 0;
    var userStatuses   = null;
    var toolSuffix     = "-tool";
    var saveTimerOption= null;

    var tabList        = [];
    var tabSelect      = null;
    var tabTimer       = null;
    // var idRemove       = -1;

    $scope.sizes = {
        conf : 120,
        tool : 120,

        open: {
            conf: true,
            tool: false,
            priv: true
        }
    };

    //=================================================

    window._userActions.openUserPrivate = function () {
        var uin = this.getAttribute('uin');

        if (uin != mcConst.UserInfo.UIN){
            $rootScope.$broadcast(window._messages_.dialogsList.OpenPrivate, [uin]);
        }
    };

    //=================================================

    var Badges = new function () {
        var list = {};

        this.update = function updateBadge(view, count){
            if (!count){
                mcService.hideFrame('badge' + view);

                if (list[view]){
                    delete list[view];
                }

                if (!$rootScope.isWebClient && Object.keys(list).length === 0){
                    $rootScope.$broadcast('sendCMDToElectron', [
                        mcConst._CMD_.ce_break_blink
                    ]);
                }
            } else {
                var itm = mcService.getFrame('badge' + view);

                if (itm){
                    itm.innerHTML = count;
                    mcService.showFrame('badge' + view);
                }

                list[view] = count;
            }
        };

        this.checkBadges = function (clearBlink) {
            var count = Object.keys(list).length;

            if (!count && clearBlink && !$rootScope.isWebClient){
                $rootScope.$broadcast('sendCMDToElectron', [
                    mcConst._CMD_.ce_break_blink
                ]);
            }

            return count
        };

        this.clearAll = function () {
            Object.keys(list).forEach(function (view) {
                mcService.hideFrame('badge' + view);
            });

            list = {};
        }
    };

    //=================================================

    function getPrivateSequence(){
        var list = $scope.dialogsList.serialize();
        var res  = [];

        for (var i = 0; i < list.length; i++){
            res.push(list[i].UIN);
        }

        return res;
    }

    function fillTabList() {
        tabList = []
            .concat($scope.sizes.open.conf ? $scope.channelsList.serialize() : [])
            .concat($scope.sizes.open.priv ? $scope.dialogsList.serialize()  : []);
    }

    function addPrivate(uin, nick, state, badge){
        var UIN = 'dUIN-' + uin;
        var item = $scope.dialogsList.getItem(UIN);

        if (!item && uin){
            var user = {
                isPrivate: true,
                id    : UIN,
                UIN   : uin,
                Name  : nick,
                badge : badge || 0,
                State : state //(userStatuses && userStatuses.hasOwnProperty(UIN)) ? userStatuses[UIN] : '-1',
            };

            $scope.data.push(user);

            $scope.dialogsList.add(user, 0);
            $scope.dialogsList.refresh();

            privatList[UIN] = user;

            privateSequence = getPrivateSequence();

            fillTabList();
        } else

        if (badge){
            item.badge = badge;

            $scope.dialogsList.updateItem(UIN, item);
            // $scope.dialogsList.refresh();
        }
    }

    function removePrivate(_uin){
        var uin = 0;
        
        if (!isNaN(parseInt(_uin))){
            uin = "dUIN-" + _uin;
        }

        var selected = $scope.dialogsList.getItem(uin);
        var position = $scope.dialogsList.getIndexById(uin);

        if (privatList.hasOwnProperty(uin) && selected){
            delete privatList[uin];

            $scope.dialogsList.remove(selected.id);
            $scope.dialogsList.refresh();

            privateSequence = getPrivateSequence();

            fillTabList();

            $rootScope.$broadcast('removeFrameChat', [$rootScope.chatAliases.UIN, _uin]);
        }

        var count = $scope.dialogsList.count();

        if (count === 0){
            $scope.$broadcast(window._messages_.dialogsList.OpenPrivate, ['0']);
        } else {
            if (position === count) {
                position--;
            }

            if (position !== -1){
                position = 0
            }

            setTimeout(function () {
                $scope.dialogsList.select($scope.dialogsList.getIdByIndex(position));
            }, 100);
        }

        // idRemove = -1;
    }

    function addConf(UID, name){
        var uid = 'dUID-' + UID;
        var data = {};

        data.id     = uid;
        data.UID    = UID;
        data.badge  = 0;
        data.isConf = true;
        // data.dType  = mcService.Lang(24); // "24" : "Конференции",
        data.Name   = name;

        confList[uid] = data;

        $scope.channelsList.add(confList[uid], 0);

        fillTabList();
    }

    function removeConf(UID){
        var uid = 'dUID-' + UID;

        if (confList[uid]){
            delete confList[uid];

            $scope.channelsList.remove(uid);
            $rootScope.$broadcast('removeFrameChat', [$rootScope.chatAliases.UID, UID]);

            fillTabList();

            var id = $scope.channelsList.getFirstId(uid);

            if (id){
                $scope.channelsList.select(id);
            } else {
                var uin = $scope.dialogsList.getFirstId();
                
                if (uin) {
                    $scope.dialogsList.select(uin);
                } else {
                    $rootScope.SetPrivate(0);
                    $rootScope.$broadcast('fillChatFrame', ['Elisa']);
                }

                $rootScope.$broadcast('selectTool', [mcConst.dataModels.CommonContacts]);
            }
        }
    }

    function selectDialogByType(dialog) {
        if (dialog.indexOf('UIN') === 0 && $scope.arcDialogsList) {
            $scope.arcDialogsList.expand();

            if ($scope.dialogsList.getItem('d' + dialog)){
                var selected = $scope.dialogsList.getSelectedItem();

                if (selected && selected.id === ('d' + dialog)) {
                    $rootScope.$broadcast('OpenPrivate', [$rootScope.GetChatID()]);
                } else {
                    $scope.dialogsList.select('d' + dialog);
                }
            }
        } else
            
        if (dialog.indexOf('UID') === 0 && $scope.arcChannelsList) {
            $scope.arcChannelsList.expand();
            
            $scope.channelsList.select('d' + dialog);
        } else

        if ($scope.arcToolsList) {
            $scope.arcToolsList.expand();

            $scope.toolsList.select(dialog.split("-")[0] + toolSuffix);
        }
    }

    function selectNextTab(id) {
        if (tabList.length){
            $scope.channelsList.unselectAll();
            $scope.dialogsList. unselectAll();
            $scope.toolsList.   unselectAll();

            if (tabList[id].isConf) {
                $scope.channelsList.select(tabList[id].id);
            } else

            if (tabList[id].isPrivate){
                $scope.dialogsList.select(tabList[id].id);
            }

            $scope.clickOnDialogItem(tabList[id].id);
        }
    }

    function nextDialog(revert) {
        if (!tabTimer){
            var tab = revert ? (tabList.length ? tabList.length - 1 : 0) : 0;

            if (tabSelect) {
                switch ($rootScope.GetChatType()) {
                    case $rootScope.chatAliases.UIN:
                    case $rootScope.chatAliases.UID:
                        tab = mcService.findItemInArrayOfObj(tabList, tabSelect, "id");

                        if (revert) {
                            tab = tab > 0 ? tab - 1 : tabList.length - 1;
                        } else {
                            tab = tab < tabList.length - 1 ? tab + 1 : 0;
                        }
                    break;

                    case $rootScope.chatAliases.BBS:
                    case $rootScope.chatAliases.Kanban:
                        tab = revert ? (tabList.length ? tabList.length - 1 : 0) : 0;
                    break;
                }
            }

            selectNextTab(tab);

            tabTimer = setTimeout(function () {
                tabTimer = null;
            }, 70);
        }
    }

    function updateChUserCount(uid, count) {
        var conf = 'dUID-' + uid;

        if (confList.hasOwnProperty(conf)){
            var item = $scope.channelsList.getItem(conf);

            item.userCount = count;
            confList[conf].userCount = count;

            $scope.channelsList.updateItem(conf, item);
        }
    }

    //===================================================

    $scope.registerHotKeys = function () {
        $rootScope.hotKeyDispatcher.addPreset($scope.Name, [{
            key   : mcConst.keyCodes.tab,
            ctrlKey: true,
            func  : function () { nextDialog(); }
        }, {
            key   : mcConst.keyCodes.pagedown,
            ctrlKey: true,
            func  : function () { nextDialog(); }
        }, {
            key   : mcConst.keyCodes.pageup,
            ctrlKey: true,
            func  : function () { nextDialog(true); }
        }, {
            key   : mcConst.keyCodes.tab,
            shiftKey: true,
            func  : function () { nextDialog(true); }
        }], document);
    };

    $scope.removeHotKeys = function () {
        $rootScope.hotKeyDispatcher.removePreset($scope.Name);
    };

    $scope.saveOptions = function () {
        if (!saveTimerOption) {
            saveTimerOption = setTimeout(function () {
                $rootScope.Storage.dialogs.save(null, null, mcConst.storageOpts.DIALOGOPT, JSON.stringify({
                    sizes: $scope.sizes
                }), function () {
                    saveTimerOption = null;
                });

                fillTabList();
            }, 300);
        }
    };

    $scope.setHeightConf = function (height) {
        $scope.arcChannelsList.define("height", height);
        $scope.arcChannelsList.resize();

        $scope._accor2.resizeChildren();
    };

    $scope.setHeightTool = function (height) {
        $scope._accor1.define("height", height);
        $scope._accor1.resize();

        $scope._accor1.resizeChildren();
    };

    $scope.beforeSelect = function(){
        prevID = $scope.dialogsList.getSelectedId();
    };

    $scope.openChannelsManager = function () {
        $rootScope.$broadcast('show' + mcConst.dataModels.ConfManager, []);
    };

    $scope.selectTools = function(id){
        $scope.dialogsList.unselectAll();
        $scope.channelsList.unselectAll();

        switch (id){
            case mcConst.dataModels.Forum + toolSuffix:

            break;

            case mcConst.dataModels.BBS + toolSuffix:
                $rootScope.SetBBS();
            break;

            case mcConst.dataModels.Kanban + toolSuffix:
                $rootScope.SetKanban();
            break;
        }

        tabSelect = null;

        $rootScope.$broadcast("changeCenterView", [id.replace(toolSuffix, '')]);
        $rootScope.$broadcast('selectTool');
    };

    $scope.clickOnDialogItem = function (id) {
        var item   = $scope.dialogsList.getItem(id);

        if (item/* && idRemove === -1*/) {
            $rootScope.$broadcast("changeCenterView", [mcConst.dataModels.ChatFrame, id]);
        }
    };

    $scope.openPrivateDialog = function(id){
        var item   = $scope.dialogsList.getItem(id);

        if (item/* && idRemove === -1*/){
            var _badge = privatList[id] ;

            if (_badge.badge !== 0) {
                _badge.badge = 0;

                Badges.update(id, _badge.badge);
            }

            $scope.channelsList.unselectAll();
            $scope.toolsList.unselectAll();

            tabSelect = id;

            $rootScope.$broadcast('OpenPrivate', [item.UIN]);
        }
    };

    $scope.openChannelDialog = function(id){
        var item = $scope.channelsList.getItem(id);

        var _badge = confList[id];

        if (_badge.badge !== 0) {
            _badge.badge = 0;

            Badges.update(id, _badge.badge);
        }

        tabSelect = id;

        $scope.dialogsList.unselectAll();
        $scope.toolsList.unselectAll();

        $rootScope.$broadcast('OpenConf', [item.UID]);
    };

    $scope.updateCounter = function(msg, dontInc){
        var UID  = msg.UID;
        var UIN  =(msg.UINFrom || msg.UIN).toString();
        var nick = msg.Nick || msg.DisplayName;

        if (mcConst.UserInfo.UIN != UIN){
            var itemID = UID !== undefined ? 'dUID-' + UID : 'dUIN-' + UIN;
            var list   = UID !== undefined ? $scope.channelsList : $scope.dialogsList ;

            if (UIN && !msg.UID){
                // "IDMsgLast"   : 4567,                  // ID последнего отправленного сообщения
                // "IDMsgGot"    : 4560,                  // ID последнего полученного сообщения
                // "IDMsgRead"   : 4560,                  // ID последнего прочитанного сообщения
                addPrivate(UIN, nick, msg.State, msg.hasOwnProperty("IDMsgLast") ? msg.IDMsgLast - msg.IDMsgRead : 0);
            }

            list.moveTop(itemID);

            privateSequence = getPrivateSequence();

            if (list.getSelectedId() !== itemID){
                var dialogItem = privatList[itemID] || confList[itemID];

                if (dialogItem){
                    if (!dontInc) dialogItem.badge ++;

                    Badges.update(itemID, dialogItem.badge);

                    fillTabList();
                }
            }
        }
    };

    $scope.show = function(){
        mcService.updateStatuses(userStatuses, $scope.data);

        contacts = initDialogs($scope);

        $scope.registerHotKeys();
    };

    $scope.removePrivateDialog = function (id) {
        if (id && ($rootScope.isWebClient || mcConst.ClientSettings.GeneralDoubleClickPagesClose)) {
            // idRemove = id;
            
            $rootScope.$broadcast('removeDialogFromList', [id.split('-')[1]]);
        }
    };

    //==================================================

    var _msg = _messages_.dialogsCtrl = {
        allUsersOnlineStatusesChanged   : 'allUsersOnlineStatusesChanged',
        getUserSequence                 : 'getUserSequence',
        isConfOpen                      : 'isConfOpen',
        addNewConfToDialogs             : 'addNewConfToDialogs',
        removePrivateFromDialogs        : 'removePrivateFromDialogs',
        removeConfFromDialogs           : 'removeConfFromDialogs',
        addNewPrivateDialog             : 'addNewPrivateDialog',
        selectDialog                    : 'selectDialog',
        updateCounter                   : 'updateCounter',
        receiveBBS                      : 'receiveBBS',
        updateChUserCount               : 'updateChUserCount',
        on_mainWindowFocused            : 'on_mainWindowFocused',
        clearDialogsList                : 'clearDialogsList'
    };

    $scope.$on(_msg.allUsersOnlineStatusesChanged, function(e, args){
        userStatuses = args[0];

        mcService.updateStatuses(userStatuses, $scope.data);

        if ($scope.dialogsList){
            $scope.dialogsList.refresh();
        }
    });

    $scope.$on(_msg.on_mainWindowFocused, function(){
        if (mcConst.LoggedIn){
            Badges.checkBadges(true);

            selectDialogByType($rootScope.GetChatTypeID());
        }
    });

    $scope.$on(_msg.getUserSequence, function(e, args){
        var callback = args[0];

        if (callback) {
            callback(privateSequence);
        }
    });

    $scope.$on(_msg.isConfOpen, function(e, args){
        var uid = args[0];
        var callback = args[1];

        if (callback) callback(confList.hasOwnProperty(uid));
    });

    $scope.$on(_msg.addNewConfToDialogs, function(e, args){
        addConf.apply(null, args);
    });

    $scope.$on(_msg.clearDialogsList, function(){
        privatList     = {};
        privateSequence= [];
        prevID         = 0;
        userStatuses   = null;
        tabList        = [];

        $scope.dialogsList.clearAll();

        $rootScope.$broadcast(_messages_.dialogsList.clearPrivatesOnReconnect);
    });

    $scope.$on(_msg.removePrivateFromDialogs, function(e, args){
        removePrivate.apply(null, args);
    });

    $scope.$on(_msg.removeConfFromDialogs, function(e, args){
        removeConf.apply(null, args);
    });

    $scope.$on(_msg.addNewPrivateDialog, function(e, args){
        addPrivate.apply(null, args);
    });

    $scope.$on(_msg.receiveBBS, function(){
        if (!$rootScope.isWebClient && mcConst.ClientSettings.EventsPopupOnNewBBS){
            $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                mcConst._CMD_.ce_show_on_top
            ]);
        }

        mcPlaySound.Play(mcPlaySound.Sounds.BBS);

        setTimeout(function () {
            $scope.arcToolsList.expand();
            $scope.toolsList.select(mcConst.dataModels.BBS + toolSuffix);
            
            $rootScope.$broadcast(window._messages_.BBS.refreshBBS, [mcConst.ClientSettings.EventsTrayBBSMsg]);
        }, 10);
    });

    $scope.$on(_msg.selectDialog, function(e, args){
        selectDialogByType.apply(null, args);
    });

    $scope.$on(_msg.updateCounter, function(e, args){
        $scope.updateCounter.apply(null, args);
    });

    $scope.$on(_msg.updateChUserCount, function(e, args){
        updateChUserCount.apply(null, args);
    });

    $scope.$on('hide' + $scope.Name, function(){
        contacts.hide();

        $scope.removeHotKeys();
    });

    $scope.$on('show' + $scope.Name, function(e, args){
        $scope.container = args[0];

        $scope.wndSize = $rootScope.wndSize;

        $scope.show();

        $rootScope.Storage.dialogs.load(null, null, mcConst.storageOpts.DIALOGOPT, function (data) {
            var info = mcService.StringToObj(data);

            if (mcService.isObject(info)) {
                $scope.sizes = info.sizes;

                $scope.setHeightConf($scope.sizes.conf);
                $scope.setHeightTool($scope.sizes.tool);

                $scope.arcDialogsList [$scope.sizes.open.priv ? "expand" : "collapse"]();
                $scope.arcToolsList   [$scope.sizes.open.tool ? "expand" : "collapse"]();
                $scope.arcChannelsList[$scope.sizes.open.conf ? "expand" : "collapse"]();
            }
        });
    });
}
