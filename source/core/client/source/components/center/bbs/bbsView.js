"use strict";

function initBbsFrame($scope){
    var view = $$($scope.Name);

    function numberList(length) {
        return (new Array(length || 1)).join('.').split('.').map(function (itm, idx) { return idx.toString() })
    }

    if (!view){
        $$($scope.container).addView({
            id   : $scope.Name,
            rows : [
                { view: "button", type: "icon", icon: "chevron-down", id: "displayName" + $scope.Name, label: mcLang(556), // "556":"Доска объявлений",
                    click: $scope.titleMenu, css: "whiteBG imgBtn button_info frameTopBtnCenter",
                    on: { onItemClick: function () {
                        var btn = this.getNode();

                        setTimeout(function () {
                            $scope.clipPopupWindow.show(btn, {pos: 'bottom', x: 5, y: 10});
                        }, 100);
                    }}
                },

                { id: "bbsContent" + $scope.Name, view: "template", borderless: true, css: "myScroll selectable " + (!isMobile ? "scrollMenu" : ""),
                    scroll: false, template: '&nbsp;', gravity: 3},

                { id: "bbsResizer" + $scope.Name, view: "resizer", hidden: true},

                { id: "inputWrapper" + $scope.Name, gravity: 2, hidden: true, css: "whiteBG", rows: [

                    { view: "toolbar", height: 32, css: "borderTop", padding: 0, cols: [
                        { view:"datepicker",
                            id           : "bbsLifeTime" + $scope.Name,
                            value        : new Date(),
                            labelPosition: 'left',
                            labelAlign   : 'right',
                            label        : mcLang(559) + ":", // "559":"Актуально до",
                            labelWidth   : 110,
                            width        : 240,
                            suggest      : {
                                type : "calendar",
                                body : { minDate: new Date((new Date()).getTime() - mcConst.oneDay), maxDate: new Date("3000.01.01") }
                            }
                        },

                        { id: "bbsHours" + $scope.Name, view: "richselect", width: 55, value: 23, borderless: true,
                            suggest: { fitMaster: false, width: 65,
                                data: numberList(24)
                            }
                        },

                        { view: "label", label: ":", align: "center", width: 1, padding: 0},

                        { id: "bbsMinutes" + $scope.Name, view: "richselect", width: 55, value: 59, borderless: true,
                            suggest: { fitMaster: false, width: 65,
                                data: numberList(60)
                            }
                        },

                        { id: "bbsToTop" + $scope.Name, view: "checkbox", value: false, labelWidth: 0, labelRight: mcLang(560),  width: 20, css: "finger"}, // "560":"Поднять вверх",

                        {},

                        { view: "button", type: "icon", icon: "close", css: "noBG noBorderAll byCenter button_danger iconNoPadding", tooltip: mcLang(12), // "12" :"Закрыть",
                            click: $scope.closeBBS, width: 35
                        },

                        { width: 5},

                        { id: "btnSendText" + $scope.Name, view: "button", type: "icon", icon: "send", css: "noBG noBorderAll iconNoPadding byCenter", tooltip: mcLang(558), // "558":"Опубликовать",
                            click: $scope.sendBBS, width: 35
                        },

                        { width: 5}
                    ]},

                    { id: "enterBBSText" + $scope.Name, view: "textarea", css: "noBGColorAll borderTop", borderless: true, placeholder: mcLang(27)}, // "27" : "Введите ваше сообщение здесь",

                ]}
            ]
        });

        $scope.clipPopupWindow = webix.ui({
            view : "popup",
            id   : "topMenu" + $scope.Name,
            head : false,
            css  : "noUpperCase",
            width: 200,
            padding: 0,
            body : {  rows: [{
                view : "button",
                type : "icon",
                icon : "plus",
                css  : "icoButton",
                label: mcLang(557), // "557":"Новое объявление",
                click: function(){
                    this.getTopParentView().hide();

                    $scope.addNewBBS();
                }
            }]}
        });

        view = $$($scope.Name);

        $scope.bbsContent   = $$("bbsContent" + $scope.Name);
        $scope.enterBBSText = $$("enterBBSText" + $scope.Name);

        $scope.bbsResizer   = $$("bbsResizer" + $scope.Name);
        $scope.inputWrapper = $$("inputWrapper" + $scope.Name);
        $scope.btnSendText  = $$("btnSendText" + $scope.Name);

        $scope.bbsToTop     = $$("bbsToTop" + $scope.Name);
        $scope.bbsLifeTime  = $$("bbsLifeTime" + $scope.Name);
        $scope.bbsHours     = $$("bbsHours" + $scope.Name);
        $scope.bbsMinutes   = $$("bbsMinutes" + $scope.Name);
    } else {
        view.show();
    }

    return view;
}