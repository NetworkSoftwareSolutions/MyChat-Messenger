"use strict";

function viewLogsController($scope, $rootScope, mcPlaySound){
    $scope.Name = mcConst.dataModels.ViewLogs;

    var view   = null;
    var bakCss = "";

    // =====================================

    function addLogDay(text, dt) {
        var div = document.createElement('div');

        div.setAttribute('day', dt);

        text = text.replace(/\r\n/gi, '<br/>');
        
        div.className       = "monospaceAll font85 framePaddingР10";
        div.style.wordBreak = "break-word";
        div.innerHTML       = text;

        $scope.logsContent.$view.firstChild.appendChild(div);

        $scope.logsContent.$view.scrollTop = $scope.logsContent.$view.scrollHeight;
    }

    function clear() {
        $scope.logsContent.define('template', "<div></div>");
        $scope.logsContent.refresh();
    }

    function getLogs(from, to) {
        clear();

        $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
            mcConst._CMD_.ce_get_logs_files,
            from,
            to,

            function (list) {
                Object.keys(list).forEach(function (day) {
                    addLogDay(list[day], day);
                });
            }
        ]);
    }

    // =====================================

    $scope.registerHotKeys = function () {
        // $rootScope.hotKeyDispatcher.addPreset(mcConst.dataModels.ViewLogs + "global", [{
        //     key   : mcConst.keyCodes.n,
        //     altKey: true,
        //     func  : $scope.addNewBBS
        // }], document);
    };

    $scope.selectLogsRange = function () {
        var dt   = $scope.logsCalendar.getValue();
        var from = dt.start;
        var to   = dt.end;

        getLogs(from, to);
    };

    $scope.removeHotKeys = function () {
        // $rootScope.hotKeyDispatcher.removePreset(mcConst.dataModels.ViewLogs + "global");
    };

    $scope.show = function(){
        view = initViewLogsFrame($scope);

        bakCss = $$($scope.container).getNode().className;
        
        $$($scope.container).getNode().className = "webix_view noMargin webix_layout_line";
    };

    $scope.getData = function () {
        $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
            mcConst._CMD_.ce_get_logs_list,
            
            function (data) {
                var calendars = $scope.logsCalendar.getPopup().getBody().getChildViews()[0].getChildViews();
                var from      = new Date(data.minDate.split('.'));
                var to        = new Date(data.maxDate.split('.'));

                calendars[0].define("minDate", from);
                calendars[0].define("maxDate", to);

                getLogs(to, to);
            }
        ]);
    };

    //========================================

    var _msg = _messages_.VievLogs = {

    };

    $scope.$on('hide' + $scope.Name, function(){
        if (view && view.isVisible()) {
            $scope.removeHotKeys();

            view.hide();

            clear();

            $$($scope.container).getNode().className = bakCss;
        }
    });

    $scope.$on('show' + $scope.Name, function(e, args){
        $scope.container = args[0];

        $scope.show();

        $scope.getData();

        $scope.registerHotKeys();
    });
}