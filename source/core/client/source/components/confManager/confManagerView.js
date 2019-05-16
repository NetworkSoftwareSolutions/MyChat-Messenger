"use strict";

function initConfManagerView($scope){
    var view = $$($scope.Name);

    if (!view){
        var filter = new mcService.FilterFiled({
            listName     : 'existingConfs' + $scope.Name,
            placeholder  : mcLang(35), // "35" : "Название конференции",
            css          : "noBorder",
            noClearBtn   : true,
            filterParams : ['Name', 'Topic'],
            id           : "conManagerFilterField",
            OnEnterText  : function(text){
                text === '' ? $scope.createNewConfBtn.disable() : $scope.createNewConfBtn.enable();

                $scope.confName = text;
            }
        });

        view = webix.ui({
            view    : "window",
            modal   : true,
            position: 'center',
            id      : $scope.Name,
            width   : isMobile ? $scope.wndSize.width : 400,
            height  : $scope.wndSize.height,
            head    : { cols:[
                { width: 42},
                { view: "label",  label:'<div class="byCenter toUpper">' + mcService.Lang(25) + "</div>"}, // "25" : "Добавить конференцию",
                { view: "button", type: 'icon', width: 42, icon: 'times', css: "button_transparent", click: function () {
                    view.hide();
                }}
            ]},
            body    : { rows: [
                filter,

                { view : 'list', id: 'existingConfs' + $scope.Name, maxHeight: 300, scroll: true, data: [],
                    template  : function(obj) {
                        return "<b>" + mcService.insertIco(obj.Secured ? "fa-key" : "fa-users", 12) + obj.Name + "</b>" +
                               (obj.Topic == "" ? "" : " (<i>" + obj.Topic + "</i>)");
                    },
                    on: { onItemClick: function(id){
                        $scope.selectedConf = id;

                        $scope.openConf(id, null, $scope.existingConfs.getItem(id).Secured);
                    }}
                },

                { view: "button", id: 'createNewConfBtn', value: mcLang(5), disabled: true, click: $scope.openOrCreate } // "5" : "Войти",
            ]},
            on: {
                onShow: $scope.registerHotKeys,
                onDestruct: $scope.hideWnd
            }
        });

        $scope.existingConfs    = $$("existingConfs" + $scope.Name);
        $scope.createNewConfBtn = $$("createNewConfBtn");
        $scope.confFilter       = $$(filter.EDITOR);
    } else {
        $scope.createNewConfBtn.disable();
        $scope.existingConfs.clearAll();
    }

    return view;
}