/**
 * Created by Gifer on 11.08.2016.
 */

function confManagerController($scope, $rootScope) {
    $scope.Name = mcConst.dataModels.ConfManager;

    var viewConfManager  = null;
    var ZERO_CONF_RIGHTS = '0011101100';
    var confList = {};

    var PRESET_ENTER_PWD = 'preset_enter_pwd';

    //========================================================

    $scope.registerHotKeys = function () {
        $rootScope.hotKeyDispatcher.addPreset($scope.Name, [{
            key   : mcConst.keyCodes.esc,
            func  : function () {
                if ($scope.confFilter.getValue() === ""){
                    $scope.hideWnd();
                } else {
                    $scope.confFilter.$setValue("");
                }
            }
        }, {
            key  : mcConst.keyCodes.enter,
            func : function () {
                $scope.openOrCreate();
                
                $scope.confFilter.$setValue("");
            }
        }], document, true);
    };

    $scope.removeHotKeys = function () {
        $rootScope.hotKeyDispatcher.removePreset($scope.Name);
    };

    $scope.createNewConf = function(name){
        $rootScope.$broadcast('SendCMDToServer', [
            mcConst.lockInterface,
            mcConst._CMD_.cs_create_txt_channel,
            mcConst.SessionID,
            name,
            '',
            '',
            ZERO_CONF_RIGHTS,

            function (info) {
                $scope.openConf(info.UID, null, info.Secured);
            }
        ]);
    };

    $scope.openOrCreate = function(){
        if (!$scope.confName){
            $scope.confName = $scope.confFilter.getValue();
        }

        var id = mcService.findItemInArrayOfObj(confList, $scope.confName, 'Name');

        if (id === -1){
            $scope.createNewConf($scope.confName);
        } else {
            $scope.openConf(confList[id].id, null, confList[id].Secured);
        }

        $scope.hideWnd();
    };

    $scope.passEnter = function () {
        var pwdWindow = $$("confPassword" + $scope.Name);

        if (pwdWindow){
            pwdWindow.destructor();
        }

        pwdWindow = webix.ui({
            id      : "confPassword" + $scope.Name,
            view    : "window",
            modal   : true,
            position: 'center',
            head    : false,
            body    : { rows: [
                { view: "text", type: "password", placeholder: mcLang(2)}, // "2"  : "Пароль",
                { cols: [
                    { view: "button", value: mcLang(5), click: function() { // "5"  : "Войти",
                        $scope.openConf($scope.selectedConf, pwdWindow.getChildViews()[0].getChildViews()[0].getValue());

                        pwdWindow.closeWnd();
                    }},
                    { view: "button", value: mcLang(33), click: function(){ // "33" : "Отмена",
                        pwdWindow.closeWnd();
                    }}
                ]}
            ]},
            on: {
                onShow: function () {
                    var edit = pwdWindow.getChildViews()[0].getChildViews()[0];

                    $rootScope.hotKeyDispatcher.addPreset(PRESET_ENTER_PWD, [{
                        key: mcConst.keyCodes.enter,
                        func: function () {
                            var id   = mcService.findItemInArrayOfObj(confList, $scope.confName, 'Name');
                            var UID  = -1;
                            var password = edit.getValue();

                            if (id) {
                                UID = $scope.selectedConf || confList[id].id;
                            }

                            if (id && password){
                                $scope.openConf(UID, password);

                                pwdWindow.closeWnd();
                            }
                        }
                    }, {
                        key: mcConst.keyCodes.esc,
                        func: function () {
                            pwdWindow.closeWnd();
                        }
                    }], document, true);

                    edit.focus();
                },
                onDestruct: function () {
                    $rootScope.hotKeyDispatcher.removePreset(PRESET_ENTER_PWD);
                }
            }
        });

        pwdWindow.closeWnd = function () {
            pwdWindow.hide();
            pwdWindow.getChildViews()[0].getChildViews()[0].setValue('');
            pwdWindow.destructor();
        };

        pwdWindow.show();

        return pwdWindow;
    };

    $scope.openConf = function(uid, pass, secure){
        var UID = 'dUID-' + uid;

        $rootScope.$broadcast("changeCenterView", [mcConst.dataModels.ChatFrame, UID]);
        
        if (secure && !confList[UID]) {
            $rootScope.$broadcast("isConfOpen", [UID, function (here) {
                if (here){
                    $scope.hideWnd();

                    $rootScope.$broadcast('OpenConf', [uid]);
                } else {
                    $scope.passEnter();
                }
            }]);
        } else {
            $scope.hideWnd();

            $rootScope.$broadcast('OpenConf', [uid, pass]);
        }
    };

    $scope.getData = function(){
        $rootScope.$broadcast('SendCMDToServer', [
            mcConst._CMD_.cs_get_channels_list,
            mcConst.SessionID,
            function(data){
                confList = mcService.convertObjToArray(data, 'id');

                $scope.existingConfs.parse(confList);
            }
        ]);
    };

    $scope.hideWnd = function () {
        $scope.removeHotKeys();
        
        viewConfManager.hide();
    };

    $scope.show = function(){
        viewConfManager = initConfManagerView($scope);

        viewConfManager.show();

        setTimeout(function () {
            $scope.confFilter.focus();
        }, 800);
    };

    // ====================================================

    $scope.$on('hide' + $scope.Name, $scope.hideWnd);

    $scope.$on('show' + $scope.Name, function(){
        $scope.wndSize = $rootScope.wndSize;

        $scope.show();
        $scope.getData();
    });
}