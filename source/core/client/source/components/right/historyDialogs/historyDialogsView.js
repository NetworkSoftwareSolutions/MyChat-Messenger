"use strict";

function initHistoryDialogs($scope){
    var __view = $$($scope.Name);

    if (!__view){
        var filter = new mcService.FilterFiled({
            listName     : "historyList" + $scope.Name,
            css          : "noBorderAll",
            noClearBtn   : true,
            placeholder  : mcLang(48), // "48" :"Поиск...",
            filterParams : ['DisplayName']
        });

        $$($scope.container).addView({ id: $scope.Name, rows: [
            { cols: [
                { view: "label", label: mcLang(578), align: 'center'}, //  "578":"История диалогов",

                { view:"toggle", type:"iconButton", id: "pin" + $scope.Name, offIcon: "nezamok", onIcon: "lock", width: 30, css: "btnPaddingToggle4", paddingX: 3, on:{
                    onChange: $scope.pinTool
                }, tooltip: mcLang(511)} //  "511":"Закрепить/открепить",
            ]},

            filter,

            { view: "unitlist", css: "myScroll lineHeight20 noBGColor" + (!isMobile? " scrollMenuYX": ""),
                scroll: false,
                id: "historyList" + $scope.Name,
                uniteBy: function(obj){
                    return obj.date;
                },
                type: {
                    headerHeight:25,
                    height: 25
                },
                scheme:{
                    $sort: function(a, b){
                        return mcService.sortAB(b.sortDate, a.sortDate);
                    }
                },
                template: function (obj) {
                    return obj.DisplayName + " <span class='messageKanbanTime toRight'>(" + obj.time + ")</span>";
                },
                data: $scope.data,
                on: { onItemClick: $scope.openPrivate }
            }
        ]});

        __view = $$($scope.Name);

        $scope.historyList = $$("historyList" + $scope.Name);
    } else {
        __view.show();

        $$("pin" + $scope.Name).setValue(false);
    }

    return __view;
}