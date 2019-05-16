"use strict";

function __treeContacts($scope, title){
    var __view = $scope.__view || $$($scope.Name);

    if (!__view){
        var contacts = { id: $scope.Name + "_parent", rows: [
            { cols: [
                { hidden: !title, view: "label", label: title, align: 'center'},

                { view:"toggle", type:"iconButton", id: "pin" + $scope.Name, offIcon: "nezamok", onIcon: "lock", width: 30, css: "btnPaddingToggle4", paddingX: 3, on:{
                    onChange: $scope.pinTool
                }, tooltip: mcLang(511)} //  "511":"Закрепить/открепить",
            ]},

            new mcService.FilterFiled({
                listName     : $scope.Name,
                css          : "noBorderAll",
                noClearBtn   : true,
                placeholder  : mcLang(48), // "48" :"Поиск...",
                filterParams : ['DisplayName']
            }),

            { id: $scope.Name, view: "tree", type: "lineTree", select: true, scroll: isMobile, borderless: true, activeTitle: true,
                data    : $scope.data || [],
                css     : "myScroll noBGColor" + (!isMobile? " scrollMenuYX": ""),
                on      : { onItemClick: $scope.openPrivate },
                template: function(obj, common){
                    var name = "";

                    if (obj.folder) {
                        obj.fName = obj.fName || obj.DisplayName;
                        
                        if (obj.hasOwnProperty("DisplayName")) delete obj.DisplayName;

                        name = mcService.insertIco("fa-users", "smaller") + "<span style='color:#00720d;'>" + obj.fName + "</span>"
                    } else
                    if (obj.TeamLead) {
                        name = "<span class='webix_icon fa-user smaller " + mcConst.storageOpts.STATUSICO + obj.UIN + "' style='color:" + mcService.getColorForStatus(obj.State) + "'></span>" +
                               "<span style='color: rgb(12, 132, 228)'>" + obj.DisplayName + "</span>";
                    } else {
                        name = "<span class='webix_icon fa-user smaller " + mcConst.storageOpts.STATUSICO + obj.UIN + "' style='color:" + mcService.getColorForStatus(obj.State) + "'></span>" +
                               obj.DisplayName
                        ;
                    }

                    return common.icon(obj,common) + "<span style='cursor: pointer;'>" + name + "</span>";
                }
            }
        ]};

        $$($scope.container).addView(contacts);

        __view = $$($scope.Name);
        __view.parentContainer = $$($scope.Name + "_parent");
        $scope.__view = __view;

        mcService.disableContextMenu(__view);
    } else {
        __view.getParentView().show();

        $$("pin" + $scope.Name).setValue(false);
    }

    return __view;
}