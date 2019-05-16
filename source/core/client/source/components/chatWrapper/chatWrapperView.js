"use strict";

function initChatWrapper($scope){
    var view = null;

    // === LEFT VIEW =====================================

    var leftView = [
        { id: "mainMenu" + $scope.Name,  view: "toggle", type: "icon", css: "ico20 button_warning button_transparent noUpperCase", //popup: "mainMenuPopup", //
            offIcon: "bars",  onIcon:"close", offLabel: $scope.myName, onLabel: $scope.myName,
            on: { onChange: $scope.showMainMenu }
        },

        { id: $scope.containers.left, css: "noBGColorAll", rows: [ { gravity: 0} ]}
    ];

    // === RIGHT VIEW ====================================

    var rightView = [
        { id: $scope.containers.right, rows: [
            { gravity: 0}
        ]}
    ];

    // === TOOLS VIEW ====================================

    var toolBarView = { view: "toolbar", padding: 0};

    var btnList     = [
        {  id: "btn_" + mcConst.dataModels.CommonContacts,   view: "toggle", type: "icon", icon: "sitemap", width: 34, css: "iconNoPadding",
            tooltip: mcLang(10), on: {onItemClick: $scope.clickToolBtn} //  "10" :"Общие контакты",
        },
        {  id: "btn_" + mcConst.dataModels.PersonalContacts, view: "toggle", type: "icon", icon: "users",   width: 34, css: "iconNoPadding",
            tooltip: mcLang(17), on: {onItemClick: $scope.clickToolBtn} // "17" :"Личные контакты",
        },
        {  id: "btn_" + mcConst.dataModels.HistoryDialogs,   view: "toggle", type: "icon", icon: "history",width: 34, css: "iconNoPadding",
            tooltip: mcLang(578), on: {onItemClick: $scope.clickToolBtn} // "578":"История диалогов",
        },

        {  id: "btn_" + mcConst.dataModels.PrivateInfo,      view: "toggle", type: "icon", icon: "comment", width: 34, css: "iconNoPadding",
            tooltip: mcLang(46), hidden: true, on: {onItemClick: $scope.clickToolBtn} // "46" :"Приватный разговор",
        },
        {  id: "btn_" + mcConst.dataModels.ConfUserList,     view: "toggle", type: "icon", icon: "comments",width: 34, css: "iconNoPadding",
            tooltip: mcLang(26), hidden: true, on: {onItemClick: $scope.clickToolBtn} // "26" :"Люди в конференции",
        },
        {  id: "btn_" + mcConst.dataModels.CommonFiles,      view: "toggle", type: "icon", icon: "files-o",width: 34, css: "iconNoPadding",
            tooltip: mcLang(567), hidden: true, on: {onItemClick: $scope.clickToolBtn} // "567":"Общие файлы на сервере",
        },
        {  id: "btn_" + mcConst.dataModels.ReceiveFiles,     view: "toggle", type: "icon", icon: "exchange",width: 34, css: "iconNoPadding",
            tooltip: mcLang(588), hidden: true, on: {onItemClick: $scope.clickToolBtn} // "588":"Прием файлов",
        }
    ];

    // ====================================================

    if (isMobile){
        toolBarView.height = 37;
        toolBarView.css = "bgDarkness WhiteMenu";

        toolBarView.cols = [{}].concat(btnList);

        view = webix.ui({ view: "carousel", scrollSpeed:"600ms", navigation:{
            type   : "flip",
            items  : false,
            buttons: false
        }, cols:[
            { id: "leftSide", width: $scope.wndSize.width, css: "bgDarkness", rows: leftView},

            { id: $scope.containers.center, width: $scope.wndSize.width, css: "noMargin gradient", rows: [ { gravity: 0} ]},

            { id: "rightSideResizer", width: 0, hidden: true}, // bgMC

            { rows: [
                toolBarView,
                { id: "rightSide", width: $scope.wndSize.width, css: "bgMC noMargin", rows: rightView}
            ]}
        ]});

        view.getChildViews()[0].attachEvent("onAfterScroll", $scope.scrollView);
        view.setActive($scope.containers.center);

        webix.attachEvent("onTouchEnd", $scope.correctSwipe);
    } else {
        toolBarView.width = 34;

        toolBarView.rows = btnList.concat({});

        view = webix.ui({ type: "layout", rows:[
            { cols:[
                { id: "leftSide", width: 210, css: "bgDarkness", rows: leftView, minWidth: 210, maxWidth: 250},

                { id: "leftSideResizer", view: "resizer", css: "noBorder bgDarkness"},

                { id: $scope.containers.center, css: "noMargin gradient", cols: [ { gravity: 0} ]},

                { id: "rightSideResizer", view: "resizer", css: "noBorder bgMC noMargin", hidden: true}, // bgMC

                { id: "rightSide", width: 250, css: "bgMC noMargin", minWidth: 210, maxWidth: 350, hidden: true, rows: rightView}
            ].concat(toolBarView)}
        ]});
    }

    $scope.toolBtn.CommonContacts   = $$("btn_" + mcConst.dataModels.CommonContacts);
    $scope.toolBtn.PersonalContacts = $$("btn_" + mcConst.dataModels.PersonalContacts);
    $scope.toolBtn.PrivateInfo      = $$("btn_" + mcConst.dataModels.PrivateInfo);
    $scope.toolBtn.ConfUserList     = $$("btn_" + mcConst.dataModels.ConfUserList);
    $scope.toolBtn.CommonFiles      = $$("btn_" + mcConst.dataModels.CommonFiles);
    $scope.toolBtn.HistoryDialogs   = $$("btn_" + mcConst.dataModels.HistoryDialogs);
    $scope.toolBtn.ReceiveFiles     = $$("btn_" + mcConst.dataModels.ReceiveFiles);

    $scope.mainMenu         = $$("mainMenu" + $scope.Name);

    $scope.leftSide         = $$("leftSide");
    $scope.leftSideResizer  = $$("leftSideResizer");

    $scope.rightSide        = $$("rightSide");
    $scope.rightSideResizer = $$("rightSideResizer");
    //$scope.selectToolList   = $$("selectToolList");

    $scope.centerBlock = $$($scope.containers.center).getNode();
    $scope.rightSideBlock = $scope.rightSide.getNode();

    return view;
}