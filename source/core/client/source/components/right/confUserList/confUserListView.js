"use strict";

function initConfUserList($scope){
    var __view = $$($scope.Name);

    if (!__view){
        var contacts = { id: $scope.Name, rows: [
            { cols: [
                { view: "label", label: mcLang(26), align: 'center'}, // "26" :"Люди в конференции",
                { view:"button", type:"icon", icon: "sign-out", width: 30, css: "btnPaddingToggle4", paddingX: 1,
                    click: $scope.leaveConf,
                    tooltip: mcLang(28)} // "28" :"Выйти из конференции",
            ]},

            new mcService.FilterFiled({
                listName     : "userList" + $scope.Name,
                css          : "noBorderAll",
                noClearBtn   : true,
                placeholder  : mcLang(48), // "48" :"Поиск...",
                filterParams : ['DisplayName']
            }),

            {
                view    : "list",
                id      : "userList" + $scope.Name,
                data    : $scope.data,
                css     : "myScroll noBGColor lineHeight20" + (isMobile ? "" : " scrollMenu"),
                select  : true,
                scroll  : isMobile,
                borderless: true,
                template: function(obj){
                    return mcService.myReplaceFormated(
                        "<span class='webix_icon fa-user smaller #{status}' style='#{statusColor}'></span>#{name}",
                        {
                            status     : mcConst.storageOpts.STATUSICO + obj.UIN,
                            statusColor: "color:" + mcService.getColorForStatus(obj.State),
                            name       : obj.DisplayName
                        }
                    )
                },
                type    : {
                    height: 24
                },
                on : {
                    onItemClick: $scope.openPrivate
                }
            }
        ]};

        $$($scope.container).addView(contacts);

        __view = $$($scope.Name);

        $scope.confUserList = $$("userList" + $scope.Name);

        mcService.disableContextMenu(__view);
    } else {
        __view.show();

        $scope.confUserList.clearAll();
        $scope.confUserList.parse($scope.data);
    }

    $scope.confUserList.sort('DisplayName', 'asc');

    return __view;
}