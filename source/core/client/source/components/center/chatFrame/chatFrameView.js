"use strict";

function initChatFrame($scope){
    var chatFrame = {
        id   : $scope.Name,
        rows : [
            // -- Header --
            { view: "button", type: "icon", icon: "chevron-down", id: "displayName" + $scope.Name, label: "Elisa", css: "imgBtn frameTopBtnCenter",
                click: $scope.titleMenu},

            // -- Search --
            { id: "searchWrapper" + $scope.Name, hidden: true, padding: 0, css: "noBorderAll borderTopBottom", height: 30,cols: [
                { id: "searchChatText" + $scope.Name, view: "text", css: "noBGColorAll", borderless: true, placeholder: mcService.Lang(579) }, // "579":"Найти текст в чате...",

                { id: "btnCloseSearchText" + $scope.Name, view: "button", type: "icon", icon: "close", width: 35, css: "noBG iconNoPadding byCenter",
                    click: $scope.hideFindChatText}
            ]},

            // -- DownloadUpload --
            $scope.duViews.progressWrapper,
            $scope.duViews.downloadFilesQuestion,

            // -- MediaCall --
            { id: "videoFrameWrapper", hidden: true, css: "relative noBGColor byCenter", borderless: true, gravity: 2, minHeight: 90,
                template: '<div id="' + mcConst.videoContainer + '" style="height: 100%;"></div>'},
            
            { view: "resizer", id: "videoResizer", hidden: true},

            // -- Main Chat --
            { id: "chatTextOutput" + $scope.Name, view: "template", minHeight: 100, borderless: true, css: "myScroll noBGColorAll selectable " + (!isMobile ? "scrollMenu" : ""),
                scroll: false,
                template: '<div id="loadMoreHistory" class="right loadHistory hidden"><a href="#" class="selected">' + mcLang(577) + '</a></div>' + // "577":"Загузить еще сообщения",
                          '<div id="UIN-0" class="framePaddingР30x10"></div>'
            },

            { view: "resizer", id: "inputResizer" + $scope.Name, css: "noBGColorAll noBorder"},

            // -- Input Text --
            { id: "inputWrapper", height: 57, minHeight: 57, hidden: true, cols: [
                { id: "clipPopupButton", view: "button", type: "icon", icon: "paperclip", css : "ico30 borderTop",  hidden: false, width: 56,
                    on: { onItemClick: function () {
                        var btn = this.getNode();

                        setTimeout(function () {
                            $scope.clipPopupWindow.show(btn, {pos: 'top', x: 0, y: -10});
                        }, 100);
                    }
                }},

                { id: "enterChatText"  + $scope.Name, view: "textarea", css: "noBGColorAll borderTop", borderless: true, placeholder: mcService.Lang(27), // "27" : "Введите ваше сообщение здесь",
                    on: { onKeyPress: $scope.typingNotify }},

                { id: "btnSendText", view: "button", type: "icon", icon: "send", width: 35, css: "noBG noBorderAll iconNoPadding byCenter borderTop", click: function () {
                    $scope.sendText();

                    setTimeout(function () {
                        $scope.enterChatText.focus();
                    }, 50);
                }}
            ], on: { onViewResize: $scope.saveTextInputSize}}
        ]
    };

    $scope.clipPopupWindow = webix.ui({
        view : "context",
        id   : "clipPopup",
        head : false,
        css  : "noUpperCase",
        padding: 0,

        body : { width: 200, rows: [
            { view: "button", type: "icon", icon: "file-image-o", css: "icoButton",
                label: mcService.Lang(53), click: $scope.popupInsertImage }, // "53" : "изображение",
            { view: "button", type: "icon", icon: "files-o", css: "icoButton",
                label: mcService.Lang(568), click: $scope.popupInsertFile },  // "568":"Файл",
            // { view:"menu",
            //     subMenuPos:"right",
            //     layout:"y",
            //     height: 40,
            //     data:[
            //         { value: mcService.Lang(619), submenu: "quickMsgTempSubMenu", icon: "list", css: "icoButton"} // "619":"Фраза",
            //     ]
            // }
            // { view: "button", type: "icon", icon: "list", css: "icoButton",
            //     label: mcService.Lang(619), click: $scope.popupInsertPhrase }
        ]}
    });

    // $scope.visualMsgTempList = webix.ui({
    //     view:"submenu", id:"quickMsgTempSubMenu", data:[
    //         { id:"1.1", value:"English"},
    //         { id:"1.3", value:"German"}
    //     ]
    // });

    $$($scope.container).addView(chatFrame);

    // -- Header --
    $scope.displayName       = $$("displayName"    + $scope.Name);
    // -- Main Chat --
    $scope.chatTextOutputW   = $$("chatTextOutput" + $scope.Name);
    $scope.chatTextOutput    = $$("chatTextOutput" + $scope.Name).$view.lastChild;
    // -- Input Text --
    $scope.inputResizer      = $$("inputResizer"   + $scope.Name);
    $scope.inputWrapper      = $$("inputWrapper");
    $scope.enterChatText     = $$("enterChatText"  + $scope.Name);
    $scope.btnSendText       = $$("btnSendText");
    $scope.clipPopupButton   = $$("clipPopupButton");
    // -- Search --
    $scope.searchWrapper     = $$("searchWrapper"  + $scope.Name);
    $scope.searchChatText    = $$("searchChatText" + $scope.Name);
    // -- MediaCall --
    $scope.videoResizer        = $$('videoResizer');
    $scope.videoFrameWrapper   = $$('videoFrameWrapper');

    $scope.chatTextOutputW.getNode().onmousedown = $scope.scrollControl;
    
    $scope.loadMoreHistory          = document.getElementById("loadMoreHistory");
    $scope.loadMoreHistory.onclick  = $scope.addHistoryMessages;

    $scope.chatTextOutput.style.position = 'relative';

    // -- DownloadUpload --
    $scope.initDU();

    if (isMobile) {
        $scope.chatTextOutput.style.height = 'initial';
        $scope.chatTextOutputW.$view.id = 'forMobile';

        new TouchScroll().init({
            id: 'forMobile',
            draggable: true,
            wait: false
        });
    }

    return $$($scope.Name);
}