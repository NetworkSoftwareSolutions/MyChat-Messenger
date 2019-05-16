"use strict";

function initReceiveFiles($scope){
    var __view = $$($scope.Name);

    if (!__view){
        $$($scope.container).addView({ id: $scope.Name, rows: [
            { cols: [
                { view: "label", label: mcLang(588), align: 'center'}, //  "588":"Прием файлов",

                { view:"toggle", type:"iconButton", id: "pin" + $scope.Name, offIcon: "nezamok", onIcon: "lock", width: 30, css: "btnPaddingToggle4", paddingX: 3, on:{
                    onChange: $scope.pinTool
                }, tooltip: mcLang(511)} //  "511":"Закрепить/открепить",
            ]},


            { id: "receiveInfo" + $scope.Name, view: "template", template: "&nbsp;", borderless: true, padding: 2, css: "noBGColor", autoheight: true},

            { height: 5},

            { id: "filesList" + $scope.Name, view: "list", css: "lineHeight20 noBGColor borderBottom",
                type: {
                    height: "auto"
                },
                template: function (obj) {
                    return obj.fileName + " <span class='messageKanbanTime'>(" + mcService.formatFileSize(obj.size) + ")</span>";
                },
                data: $scope.data
            },

            { height: 5},

            { css: "borderBottom", rows: [
                { view: "button", type: "icon", icon: "folder", label: mcLang(595), click: $scope.changeReceiveFolder, tooltip: mcLang(596), css: "noUpperCase"}, // "596":"Сменить папку для приема фалов",
                { id: "receiveFolder" + $scope.Name, view: "template", template: "&nbsp;", borderless: true, autoheight: true, css: "noBGColor brown"},
                { height: 5}
            ]},

            { height: 5},

            { height: 30, cols: [
                { view: "button", value: mcLang(592), click: $scope.startReceive}, // "592":"Принять",
                { view: "button", value: mcLang(33),  click: $scope.cancelReceive, type: "danger"}, // "33" :"Отмена",
            ]},

            { height: 5}
        ]});

        __view = $$($scope.Name);

        $scope.pinFiles      = $$("pin" + $scope.Name);
        $scope.filesList     = $$("filesList" + $scope.Name);
        $scope.receiveInfo   = $$("receiveInfo" + $scope.Name);
        $scope.receiveFolder = $$("receiveFolder" + $scope.Name);
    } else {

    }

    __view.show();

    return __view;
}