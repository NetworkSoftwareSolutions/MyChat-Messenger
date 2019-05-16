"use strict";

function initDialogs($scope){
    function chView(obj){
        var badge = mcService.myReplaceFormated(
            "<span class='webixtype_base webix_badge' id='badge#{id}' style='#{show};'>#{value}</span>",
            {
                id   : obj.id,
                show : "display:" + (!obj.badge ? "none" : "block"),
                value: obj.badge
            }
        );

        return "<span style='margin-left: -5px; margin-right: -5px'>" +
                    (obj.userCount ? "<span class='userCount'>(" + obj.userCount + ")</span> " : "") + obj.Name + badge +
               "</span>";
    }

    function cnView(obj){
        var badge = mcService.myReplaceFormated(
            "<span class='webixtype_base webix_badge' id='badge#{id}' style='#{show};'>#{value}</span>",
            {
                id   : obj.id,
                show : "display:" + (!obj.badge ? "none" : "block"),
                value: obj.badge
            }
        );

        var privateIcon = mcService.myReplaceFormated(
            "<span class='webix_icon fa-user smaller #{icon}' style='#{color}'></span>",
            {
                icon : mcConst.storageOpts.STATUSICO + obj.UIN,
                color: "color:" + mcService.getColorForStatus(obj.State)
            }
        );

        return "<span style='margin-left: -5px; margin-right: -5px'>" +
                    privateIcon + obj.Name + badge +
               "</span>";
    }

    function hideShowResizer(id, check1, check2) {
        switch (id){
            case "arcToolsList" + $scope.Name:
                check1(id, true);
            break;

            case "arcChannelsList" + $scope.Name:
            case "arcDialogsList" + $scope.Name:
                check1(id);
                
                check2(id);
            break;
        }
    }

    function check1Expand(id) {
        if (!$scope.resizer_1.config.opened.hasOwnProperty(id)) {
            $scope.resizer_1.config.opened[id] = true;
        }

        if (Object.keys($scope.resizer_1.config.opened).length >= 2 && $scope.resizer_1.config.opened.hasOwnProperty("arcToolsList" + $scope.Name)) {
            $scope.resizer_1.show();

            $scope.setHeightTool($scope.sizes.tool);
        }
    }

    function check2Expand(id) {
        if (!mcService.checkRights(mcConst._CMD_.RS.QMessengerStyle)){
            if (!$scope.resizer_2.config.opened.hasOwnProperty(id)) {
                $scope.resizer_2.config.opened[id] = true;
            }

            if (Object.keys($scope.resizer_2.config.opened).length === 2) {
                $scope.resizer_2.show();

                $scope.setHeightConf($scope.sizes.conf);
            }
        }
    }

    function check1Collapse(id) {
        if ($scope.resizer_1.config.opened.hasOwnProperty(id)) {
            delete $scope.resizer_1.config.opened[id];
        }

        if (Object.keys($scope.resizer_2.config.opened).length <= 1 || !$scope.resizer_1.config.opened.hasOwnProperty("arcToolsList" + $scope.Name)) {
            $scope.resizer_1.hide();

            $scope.setHeightTool();
        }
    }

    function check2Collapse(id) {
        if (!mcService.checkRights(mcConst._CMD_.RS.QMessengerStyle)) {
            if ($scope.resizer_2.config.opened.hasOwnProperty(id)) {
                delete $scope.resizer_2.config.opened[id];
            }

            $scope.resizer_2.hide();

            $scope.setHeightConf();
        }
    }

    var __view = $$($scope.Name);
    var hHeight = 24;

    if (!__view){
        var contacts = {
            id        : "arcDialogsList" + $scope.Name,
            view      : "accordionitem",
            css       : "lineHeight24 accordionListHeader",
            header    : mcLang(20), // "20" : "Мои диалоги",
            minHeight : 100,
            borderless: true,
            headerHeight: hHeight,
            headerAltHeight: hHeight,
            body      : { rows: [{
                id      : "dialogsList" + $scope.Name,
                view    : "list",
                data    : $scope.data || [],
                css     : "noBGColor listColorWhite lineHeight20 myScroll scrollMenu",
                borderless: true,
                select  : true,
                template: cnView,
                scroll  : "y",
                type    : {
                    headerHeight:30,
                    height: 24
                },
                on: {
                    onItemClick   : $scope.clickOnDialogItem,
                    onAfterSelect : $scope.openPrivateDialog,
                    onBeforeSelect: $scope.beforeSelect,
                    onItemDblClick: $scope.removePrivateDialog
                }
            }, { height: 10}]}
        };

        var tools    = {
            id        : "arcToolsList" + $scope.Name,
            view      : "accordionitem",
            css       : "lineHeight24 accordionListHeader",
            borderless     : true,
            headerHeight   : hHeight,
            headerAltHeight: hHeight,
            collapsed : true,
            header    : mcLang(541), // "541":"Инструменты",
            body      : {
                id      : "toolsList" + $scope.Name,
                view    : "list",
                css     : "noBGColor listColorWhite lineHeight20 myScroll scrollMenu",
                borderless: true,
                select  : true,
                scroll  : "y",
                data    : [
                    { Name: "Kanban",    badge: 0, id: mcConst.dataModels.Kanban + '-tool'},
                    { Name: mcLang(556), badge: 0, id: mcConst.dataModels.BBS + '-tool'} // "556":"Доска объявлений",
                    // { Name: "Forum",  badge: 0, id: mcConst.dataModels.Forum + '-tool'}
                ],
                template: "<span style='margin-left: -5px; margin-right: -5px'>#Name#</span>",
                type    : {
                    headerHeight:30,
                    height: 24
                },
                on: {
                    onAfterSelect: $scope.selectTools
                }
            }
        };

        var channels = {
            id        : "arcChannelsList" + $scope.Name,
            view      : "accordionitem",
            css       : "lineHeight24 accordionListHeader",
            minHeight : 90,
            borderless: true,
            headerHeight: hHeight,
            headerAltHeight: hHeight,
            collapsed : true,
            hidden    : !!mcService.checkRights(mcConst._CMD_.RS.QMessengerStyle),
            header    : mcLang(24), // "24" : "Конференции",
            body      : { rows: [{
                id      : "channelsList" + $scope.Name,
                view    : "list",
                css     : "noBGColor listColorWhite lineHeight20 myScroll scrollMenu",
                borderless: true,
                select  : true,
                scroll  : "y",
                type    : {
                    headerHeight:30,
                    height: 24
                },
                template: chView,
                on: {
                    onItemClick  : $scope.clickOnDialogItem,
                    onAfterSelect: $scope.openChannelDialog
                }
            }, {
                id    : "channelManager",
                view  : "button",
                css   : "imgBtn icoButton noBorderAll button_transparent textUnderline",
                value : mcLang(25), // "25" : "Создать конференцию...",
                click : $scope.openChannelsManager
            }]},
            on: {
                onViewResize: function () {
                    $scope.sizes.conf = this.getNode().offsetHeight;

                    $scope.saveOptions();

                    $scope.arcDialogsList.refresh();
                }
            }
        };

        $$($scope.container).addView({
            id  : $scope.Name,
            minHeight: 80,
            rows: [
            { id: "_accor1",
                view      : "accordion",
                multi     : true,
                borderless: true,
                rows      :[
                    tools
                ],
                on: {
                    onViewResize: function () {
                        $scope.sizes.tool = this.$getSize()[3];

                        $scope.saveOptions();
                    }
                }
            },

            { id: "resizer_1" + $scope.Name, view: "resizer", borderless: true, hidden: true, opened: {}},

            { id: "_accor2",
                view      : "accordion",
                multi     : true,
                borderless: true,
                rows      :[
                    channels,

                    { id: "resizer_2" + $scope.Name, view: "resizer", borderless: true, hidden: true, opened: {}},

                    contacts
                ]
            }]
        });

        __view = $$($scope.Name);

        $scope.dialogsList     = $$("dialogsList" + $scope.Name);
        $scope.arcDialogsList  = $$("arcDialogsList" + $scope.Name);

        $scope.toolsList       = $$("toolsList" + $scope.Name);
        $scope.arcToolsList    = $$("arcToolsList" + $scope.Name);

        $scope.channelsList    = $$("channelsList" + $scope.Name);
        $scope.arcChannelsList = $$("arcChannelsList" + $scope.Name);

        $scope.resizer_1       = $$("resizer_1" + $scope.Name);
        $scope.resizer_2       = $$("resizer_2" + $scope.Name);

        $scope._accor1         = $$("_accor1");
        $scope._accor2         = $$("_accor2");

        $scope._accor1.attachEvent("onAfterExpand", function (id) {
            $scope.sizes.open.tool = true;

            hideShowResizer(id, check1Expand, check2Expand);

            $scope.saveOptions();
        });

        $scope._accor1.attachEvent("onAfterCollapse", function (id) {
            $scope.sizes.open.tool = false;

            hideShowResizer(id, check1Collapse, check2Collapse);

            $scope.saveOptions();
        });

        $scope._accor2.attachEvent("onAfterExpand", function (id) {
            switch (id){
                case "arcChannelsList" + $scope.Name:
                    $scope.sizes.open.conf = true;
                break;

                case "arcDialogsList" + $scope.Name:
                    $scope.sizes.open.priv = true;
                break;
            }

            hideShowResizer(id, check1Expand, check2Expand);

            $scope.saveOptions();
        });

        $scope._accor2.attachEvent("onAfterCollapse", function (id) {
            switch (id){
                case "arcChannelsList" + $scope.Name:
                    $scope.sizes.open.conf = false;
                break;

                case "arcDialogsList" + $scope.Name:
                    $scope.sizes.open.priv = false;
                break;
            }

            hideShowResizer(id, check1Collapse, check2Collapse);

            $scope.saveOptions();
        });

        mcService.disableContextMenu(__view);
    } else {
        __view.show();
    }

    hideShowResizer("arcDialogsList" + $scope.Name, check1Expand, check2Expand);
    hideShowResizer("arcChannelsList" + $scope.Name, check1Expand, check2Expand);

    return __view;
}