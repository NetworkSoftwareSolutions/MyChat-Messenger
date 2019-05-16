/**
 * Created by Gifer on 12.07.2016.
 */

"use strict";

(function () {
    if (window.mcWidgets){
        window.mcWidgets.UsersOfGroups = function UsersOfGroups($rootScope, _groups, w, h) {
            var view       = null;
            var presetName = mcService.RandomHash(15);
            var userList   = {};
            var groups     = [];
            var textSource = {
                title : "",
                cancel: mcLang(12)  // "12" : "Закрыть",
            };
            var userListID = mcService.RandomHash(10);
            var filterField= null;
            var filterOptions = {
                listName     : userListID,
                filterParams : [
                    "DisplayName",
                    "groupNames",
                    "UIN"
                ]
            };

            function close() {
                if (view){
                    view.hide();
                }

                $rootScope.hotKeyDispatcher.removePreset(presetName);
            }

            function concatUsersList(list, group) {
                list.forEach(function (user) {
                    var uin = user.UIN;

                    if (!userList[uin]){
                        userList[uin] = user;
                    }

                    if (!userList[uin].groupNames){
                        userList[uin].groupNames = [];
                    }

                    if (userList[uin].groupNames.indexOf(group.Name) == -1){
                        userList[uin].groupNames.push(group.Name);
                    }
                });
            }

            // =======================================================

            this.init = function (_groups) {
                if (!mcService.isArray(_groups)){
                    groups = [_groups];
                } else {
                    groups = _groups;
                }
            };

            this.initTextSource = function (source) {
                textSource = mcService.Marge(textSource, source);
            };

            this.close = close;

            this.show = function () {
                if (view){
                    view.destructor();
                }

                userList = {};

                var task = new mcService.TaskList();

                task.AddTask(function () {
                    $rootScope.hotKeyDispatcher.addPreset(presetName, [{
                        key    : mcConst.keyCodes.esc,
                        func   : function () {
                            if (!filterOptions.nowCleared){
                                close();
                            }

                            filterOptions.nowCleared = false;
                        }
                    }], document, true);

                    task.Next();
                });

                groups.forEach(function (group) {
                    task.AddTask(function () {
                        $rootScope.$broadcast('SendCMDToServer', [
                            mcConst.lockInterface,
                            mcConst._CMD_.cs_adm_get_group_users_list,
                            mcConst.SessionID,
                            group.ID,
                            function( data ){
                                data.forEach(function(item){
                                    item.id = item.UIN;
                                });

                                concatUsersList(data, group);

                                task.Next();
                            }
                        ]);
                    });
                });

                task.AddTask(function () {
                    filterField = new mcService.FilterFiled(filterOptions);

                    view = webix.ui({
                        view    : "window",
                        position: "center",
                        modal   : true,
                        head    : textSource.title || false,
                        width   : w || 400,
                        height  : h || 500,
                        css     : "autoheightTitle",
                        body    : { rows: [
                            { padding: 4, rows: [
                                filterField
                            ]},

                            { view      : "list", id: userListID,
                                type    : { height:"auto" },
                                data    : mcService.convertObjToArray(userList),
                                template: function (obj) {
                                    return "<b>" + obj.DisplayName + "</b><span class='toRight'>(UIN: <b>" + obj.UIN + "</b>)</span><br><div class='byRight'>" + obj.groupNames.join(' | ') + "</div>";
                                }
                            },

                            { height: 4},
                            { height: 30, cols: [
                                {},
                                { view: "button", width: 120, value: textSource.cancel, click: close },
                                {}
                            ]},
                            { height: 4}
                        ]}
                    });

                    view.show();

                    $rootScope.$broadcast('addShowedWindow', [presetName, view]);
                });

                task.Run();
            };

            this.init(_groups);
        }
    } else {
        console.error('window.mcWidgets is not defined!');
    }
})();
