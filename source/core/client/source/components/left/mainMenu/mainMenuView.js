"use strict";

function initMainMenu($scope){
    var __view = $$($scope.Name);

    if (!__view){
        var statuses = [
            { id: "0", value: "<span class='green'>" + mcLang(534) + "</span>" }, // "534":"В сети",
            { id: "1", value: "<span class='red'>" + mcLang(535) + "</span>" }  // "535":"Не беспокоить",
        ];

        var menu = { id: $scope.Name, css: "darkenNavBG", rows: [
            { view: "button", label: mcLang(45), click: $scope.profile, css: "imgBtn icoButton button_transparent", type: "icon", icon: "book"}, // "45" : "Профиль",
            //{ view: "segmented", options: statuses, value: mcConst.UserInfo.Status, css: "whiteBG yellowSelect", on: { onChange: $scope.changeStatus }, autowidth: true },
            //{ view: "button", label: mcLang(15), click: $scope.settings, css: "imgBtn icoButton button_transparent", type: "icon", icon: "gear"}, // "15" :"Настройки",

            { view: "button", label: mcLang(586), click: $scope.logs, css: "imgBtn icoButton button_transparent", hidden: $scope.isWebClient, type: "icon", icon: "file-text-o"}, // "586":"Протоколы",

            { view: "button", label: mcLang(15), click: $scope.settings, css: "imgBtn icoButton button_transparent", hidden: $scope.isWebClient, type: "icon", icon: "cog"}, // "15" :"Настройки",

            {},

            { view: "button", label: mcLang(536), click: $scope.logout, css: "imgBtn icoButton button_transparent", type: "icon", icon: "sign-out"}, // "536":"Сменить пользователя",
            { view: "button", label: mcLang(47), hidden: $scope.isWebClient, click: $scope.quit, css: "imgBtn icoButton button_warning button_transparent", type: "icon", icon: "power-off"} // "47" : "Выйти",
        ]};

        $$($scope.container).addView(menu);

        __view = $$($scope.Name);

        mcService.disableContextMenu(__view);
    } else {
        __view.show();
    }

    return __view;
}