"use strict";

function initPrivateInfo($scope){
    var __view = $$($scope.Name);
    var uAct = "userActions";

    if (!__view){
        $$($scope.container).addView({ id: $scope.Name, rows: [
            { id: uAct + "SwitchTool", view: "segmented", css:"yellowSelect noBorderAll noCurve", value: 2, options: [
                { id: "1", value: mcLang(538)}, // "538":"Действия",
                { id: "2", value: mcLang(537)}  // "537":"Информация",
            ], on: { onChange: $scope.changeView }},

            { id: "userInfo" + $scope.Name, rows: [
                { id: 'uFoto', template: ' ', height: 175, css: "byCenter noBGColor framePaddingW10 fotoLineHeight", borderless: true},
                { height: 5 },

                { cols: [
                    { width: 4, css: "noBGColor"},

                    { view: "button", type: "icon", id: "startShareCall", click: function() {$scope.startShareCall()}, icon: "desktop", css: "icoButton byCenter button_primary icnBtnPd03", width: 35},
                    { view: "button", type: "icon", id: "startVoiceCall", click: function() {$scope.startVoiceCall()}, icon: "phone", label: mcService.Lang(21), css: "icoButton byCenter button_primary icnBtnPd03"}, // "21" : "Позвонить",
                    { view: "button", type: "icon", id: "startVideoCall", click: function() {$scope.startVideoCall()}, icon: "video-camera", label: mcService.Lang(22), css: "icoButton byCenter button_success icnBtnPd03"}, // "22" : "Видеозвонок",
                    { view: "button", type: "icon", id: "stopCall",       click: function() {$scope.stopCall()},       icon: "times", label: mcService.Lang(23), css: "icoButton byCenter button_danger button_raised icnBtnPd03", hidden: true}, // "23" : "Завершить звонок",

                    { width: 4, css: "noBGColor"}
                ]},

                {id: 'uPrivateInfo', template: 'User Info', scroll: "y", css: "myScroll noBGColor selectable", borderless: true},

                { height: 40, cols: [
                    { template: "<div id='uPrivateTypingNotify'><img id='animateTypingNotify' class='hidden' src='" + mcConst.imagesPath.all + "pero.gif' ></div>", width: 32, height: 30, padding: 0, borderless: true, css: "noBGColor"},
                    { rows: [
                        { id: 'uPrivateState', template: mcService.Lang(29), css: "noBGColor framePaddingW10", height: 18, borderless: true}, // "29" : "Не в сети",
                        { id: 'uPrivateTypingTextNotify', template: ' ', borderless: true, css: "noBGColor framePaddingW10", height: 24}
                    ]}
                ]}
            ]},

            { id: uAct + $scope.Name, hidden: true, rows:[
                { id: uAct + "DisplayName", view: "template", template: " ", borderless: true, autoheight: true},
                { height: 1, css: "borderBottom"},
                { height: 2 },

                { view: "scrollview", borderless: true, css: "noBGColor myScroll", body: { rows: [
                    { view: "button", type: "icon", icon: "exchange", label: mcLang(582), click: $scope.directSend,   css: "noUpperCase byCenter", height: 30}, // "582":"Передать файлы",
                    { id: uAct + "RedirectBtn", view: "button", type: "icon", icon: "reply",    label: mcLang(618), on: {onItemClick: $scope.showRedirect}, css: "noUpperCase byCenter", height: 30}, // "618":"Перенаправить",

                    { id: uAct + "RedirectUserWrap", hidden: true, rows: [
                        new mcService.FilterFiled({
                            listName     : uAct + "RedirectUserList",
                            css          : "noBorderAll",
                            clearID      : "RedirectUser",
                            id           : "FilterRedirectUser",
                            // noClearBtn   : true,
                            placeholder  : mcLang(48), // "48" :"Поиск...",
                            filterParams : ['DisplayName', 'UIN'],
                            keyEvents    : {
                                13: function (_item) {
                                    var item = _item || $scope.RedirectUserList.getSelectedItem() || $scope.RedirectUserList.getItem($scope.RedirectUserList.getFirstId());

                                    if (item){
                                        $scope.doRedirect(item);

                                        return true;
                                    }
                                },
                                27: function () {
                                    $scope.hideRedirectList();
                                }
                            }
                        }),

                        { id: uAct + "RedirectUserList", view: "list", css: "myScroll noBGColor",
                            template: function (obj) {
                                return obj.DisplayName;
                            },
                            on: {
                                onItemDblClick: function (id) {
                                    $scope.doRedirect($scope.RedirectUserList.getItem(id));
                                }
                            }
                        },
                        { view: "button", value: mcLang(33), click: function () { // "33" :"Отмена",
                            $scope.hideRedirectList();
                        }}
                    ]},

                    { height: 1, css: "borderBottom"},

                    { id: uAct + "ReceiveFiles", view: "checkbox", value: $scope.userConfig.autoReceive, opt: "autoReceive",
                        labelRight: mcLang(602), labelWidth: 0, css: "finger font14l", click: $scope.changeOptions}, // "602":"Принимать файлы не задавая вопросов",

                    {gravity:0},
                ]}},

                { view: "button", value: mcLang(552), click: $scope.removeUserFromDialogs} // "552":"Закрыть диалог",
            ]}
        ]});

        __view = $$($scope.Name);

        $scope.uPrivateInfo = $$("uPrivateInfo");
        $scope.uFoto = $$("uFoto");

        $scope.callBTN.startVoiceCall = $$("startVoiceCall");
        $scope.callBTN.startVideoCall = $$("startVideoCall");
        $scope.callBTN.startShareCall = $$("startShareCall");
        $scope.callBTN.stopCall       = $$("stopCall");
        $scope.userActionsDisplayName = $$("userActionsDisplayName");
        $scope.chckReceiveFiles       = $$(uAct + "ReceiveFiles");
        $scope.RedirectUserWrap       = $$(uAct + "RedirectUserWrap");
        $scope.RedirectUserList       = $$(uAct + "RedirectUserList");
        $scope.RedirectBtn            = $$(uAct + "RedirectBtn");
        $scope.SwitchTool             = $$(uAct + "SwitchTool");

        $scope.PrivateState = $$("uPrivateState");
        $scope.PrivateTypingTextNotify = $$("uPrivateTypingTextNotify");

        $scope.userActions  = $$("userActions" + $scope.Name);
        $scope.userInfo     = $$("userInfo" + $scope.Name);

        $scope.callBTN.startShareCall.getNode().title = mcLang(604); // "604":"Демонстрация экрана",
        $scope.callBTN.startVideoCall.getNode().title = mcLang(606); // "606":"Видео звонок",
        $scope.callBTN.startVoiceCall.getNode().title = mcLang(605); // "605":"Голосовой звонок",

        // mcService.disableContextMenu(__view);
    } else {
        __view.show();
    }

    return __view;
}