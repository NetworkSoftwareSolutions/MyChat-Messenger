"use strict";

function initSendBroadcastView($scope, broadcasts){
    var view = $$($scope.Name);

    function numberList(length) {
        return (new Array(length || 1)).join('.').split('.').map(function (itm, idx) { return idx.toString() })
    }

    if (!view){
        view = webix.ui({
            id      : $scope.Name,
            view    : "window",
            position: "center",
            modal   : true,
            width   : document.body.offsetWidth  - 60,
            height  : document.body.offsetHeight - 60,
            head    : false,
            body    : { rows: [
                { template: res, borderless: true, scroll: "y" },
                { view: "button", value: mcLang(12), click: function(){
                    this.getTopParentView().hide();
                    this.getTopParentView().destructor();
                }} //"12" : "Закрыть",
            ]}
        });
    }

    view.show();

    return view;
}