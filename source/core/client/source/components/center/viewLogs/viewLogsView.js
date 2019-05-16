"use strict";

function initViewLogsFrame($scope){
    var view = $$($scope.Name);

    if (!view){
        $$($scope.container).addView({
            id   : $scope.Name,
            rows : [
                { css: "header", cols: [
                    { view: "template", template: mcLang(586), autoheight: true, borderless: true, height: 34, css: "byCenter myScroll"}, // "586":"Протоколы",
                    /*{ view: "button", id: "displayName" + $scope.Name, label: mcLang(586),
                        click: $scope.titleMenu, css: "whiteBG imgBtn button_info frameTopBtnCenter",
                        on: { onItemClick: function () {
                            var btn = this.getNode();

                            /!*setTimeout(function () {
                             $scope.clipPopupWindow.show(btn, {pos: 'bottom', x: 5, y: 10});
                             }, 100);*!/
                        }}
                    },*/

                    { id: "logsCalendar" + $scope.Name, view: "daterangepicker", css: "finger", value: {start: new Date(), end: new Date()},
                        on: { onChange: $scope.selectLogsRange },
                        suggest: {
                            view: "daterangesuggest",
                            body: { calendarCount: 1}
                        }
                    }
                ]},

                { id: "logsContent" + $scope.Name, view: "template", borderless: true, css: "selectable scrollMenu myScroll", scroll: false, template: '<div></div>', gravity: 3}
            ]
        });

        view = $$($scope.Name);

        // $scope.fileTree     = $$("fileTree" + $scope.Name);
        $scope.logsCalendar = $$("logsCalendar" + $scope.Name);
        $scope.logsContent  = $$("logsContent" + $scope.Name);
    } else {
        view.show();
    }

    return view;
}