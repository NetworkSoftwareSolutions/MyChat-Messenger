"use strict";

function chatWrapperController($scope, $rootScope){
    $scope.Name       = mcConst.dataModels.ChatWrapper;
    $scope.toolBtn    = {};
    $scope.containers = mcConst.containers;

    var view                     = null;
    var oldFrame                 = mcConst.dataModels.ChatFrame;
    var currentFrame             = mcConst.dataModels.ChatFrame;
    var pinTool                  = '';
    var activeView               = 1;
    var notShowRightSide         = false;
    var currentTool              = null;
    var automaticClosedRightTool = false;
    var addingWidth              = 0;
    var selectToolList           = {
        data: {},

        currentTool: null,

        setValue: function (val, skipOnChange) {
            var prev = this.currentTool;

            this.currentTool = this.data.hasOwnProperty(val) ? val : null;

            if (this.currentTool && this.onChange && this.currentTool !== prev && !skipOnChange){
                this.onChange(this.currentTool, prev);
            }
        },

        getValue: function () {
            return this.currentTool;
        },

        onChange: null
    };
    var restoreTool              = null;
    var restoreValue             = null;
    var toolList                 = [
        mcConst.dataModels.CommonContacts,
        mcConst.dataModels.HistoryDialogs,
        mcConst.dataModels.PersonalContacts,
        mcConst.dataModels.PrivateInfo,
        mcConst.dataModels.ConfUserList,
        mcConst.dataModels.CommonFiles,
        mcConst.dataModels.ReceiveFiles
    ];

    function unPinTool(){
        pinTool = '';
    }

    function PinTool(tool) {
        pinTool = tool;
    }

    function switchToolBtnVisible(tool) {
        switch (tool){
            case mcConst.dataModels.PrivateInfo:
                if ($rootScope.GetChatTypeID() === "UIN-0"){
                    $scope.toolBtn.PrivateInfo.hide();
                } else {
                    $scope.toolBtn.PrivateInfo.show();
                }
                
                $scope.toolBtn.ConfUserList.hide();

                paintBG('privateBg');
            break;

            case mcConst.dataModels.ConfUserList:
                $scope.toolBtn.PrivateInfo.hide();
                $scope.toolBtn.ConfUserList.show();

                paintBG('bgMC');
            break;

            case mcConst.dataModels.CommonContacts:
            case mcConst.dataModels.HistoryDialogs:
            case mcConst.dataModels.PersonalContacts:
            case mcConst.dataModels.CommonFiles:

            break;

            case mcConst.dataModels.ReceiveFiles:
                $scope.toolBtn[mcConst.dataModels.ReceiveFiles].show();
            break;

            default:
                $scope.toolBtn.PrivateInfo.hide();
                $scope.toolBtn.ConfUserList.hide();

                if (!pinTool) {
                    $scope.rightSide.hide();
                    $scope.rightSideResizer.hide();
                }
        }
    }

    function selectToolView(tool, needClick) {
        if (pinTool === '') {
            $scope.changeTool(tool);

            if (needClick && tool){
                $scope.toolBtn[tool].callEvent("onItemClick");
            }
        } else {
            switchToolBtnVisible(tool, pinTool);
        }

        $rootScope.$broadcast(window._messages_.chatFrame.focusToEnterChat);
    }

    function toggleRightToolBarByWndSize() {
        var chkWidth = (!automaticClosedRightTool ? mcConst.minChatFrameWidth : mcConst.minChatFrameWidth + addingWidth + 40);

        if (!automaticClosedRightTool && $scope.centerBlock.offsetWidth <= chkWidth && $scope.rightSide.isVisible()) {
            addingWidth = $scope.rightSideBlock.offsetWidth;

            selectToolView(currentTool, true);

            automaticClosedRightTool = true;
        } else
        if (automaticClosedRightTool && $scope.centerBlock.offsetWidth > chkWidth) {
            selectToolView(currentTool, true);

            addingWidth = 0;

            automaticClosedRightTool = false;
        }
    }

    function __config() {
        $scope.containers[mcConst.dataModels.CommonContacts]   = mcConst.containers.right;
        $scope.containers[mcConst.dataModels.PersonalContacts] = mcConst.containers.right;
        $scope.containers[mcConst.dataModels.PrivateInfo]      = mcConst.containers.right;
        $scope.containers[mcConst.dataModels.ConfUserList]     = mcConst.containers.right;
        $scope.containers[mcConst.dataModels.CommonFiles]      = mcConst.containers.right;
        $scope.containers[mcConst.dataModels.HistoryDialogs]   = mcConst.containers.right;
        $scope.containers[mcConst.dataModels.ReceiveFiles]     = mcConst.containers.right;

        $scope.containers[mcConst.dataModels.Dialogs]          = mcConst.containers.left;
        $scope.containers[mcConst.dataModels.MainMenu]         = mcConst.containers.left;

        $scope.containers[mcConst.dataModels.ChatFrame]        = mcConst.containers.center;
        $scope.containers[mcConst.dataModels.UserProfile]      = mcConst.containers.center;
        $scope.containers[mcConst.dataModels.BBS]              = mcConst.containers.center;
        $scope.containers[mcConst.dataModels.Kanban]           = mcConst.containers.center;
        $scope.containers[mcConst.dataModels.ViewLogs]         = mcConst.containers.center;
        $scope.containers[mcConst.dataModels.Settings]         = mcConst.containers.center;

        selectToolList.data[mcConst.dataModels.CommonContacts  ] = mcService.Lang(10);  //"10" : "Контакты",
        selectToolList.data[mcConst.dataModels.PersonalContacts] = mcService.Lang(17);  //"17" : "Личные контакты",
        selectToolList.data[mcConst.dataModels.PrivateInfo     ] = mcService.Lang(46);  //"46" : "Приватный разговор",
        selectToolList.data[mcConst.dataModels.ConfUserList    ] = mcService.Lang(26);  //"26" : "Люди в конференции",
        selectToolList.data[mcConst.dataModels.CommonFiles     ] = mcService.Lang(567); //"567":"Общие файлы на сервере",
        selectToolList.data[mcConst.dataModels.HistoryDialogs  ] = mcService.Lang(578); //"578":"История диалогов",
        selectToolList.data[mcConst.dataModels.ReceiveFiles    ] = mcService.Lang(588); //"588":"Прием файлов",

        selectToolList.onChange = $scope.changeTool;
    }

    function restoringTool(newFrame) {
        if (newFrame &&
            [
                mcConst.dataModels.Settings,
                mcConst.dataModels.ViewLogs,
                mcConst.dataModels.BBS,
                mcConst.dataModels.UserProfile,
                mcConst.dataModels.Kanban
            ].indexOf(newFrame) === -1){
            
            switch (restoreTool){
                case mcConst.dataModels.CommonContacts:
                case mcConst.dataModels.PersonalContacts:
                case mcConst.dataModels.HistoryDialogs:
                    switch ($rootScope.GetChatAlias()){
                        case $rootScope.chatAliases.Conf:
                            $scope.toolBtn[mcConst.dataModels.ConfUserList].show();
                        break;

                        case $rootScope.chatAliases.Privat:
                            $scope.toolBtn[mcConst.dataModels.PrivateInfo].show();
                        break;
                    }
                break;

                default:
                    var __rTool = $scope.toolBtn[restoreTool];

                    if (restoreTool) {
                        __rTool.show();
                    }

                    if (restoreTool && __rTool.getValue() !== restoreValue) {
                        __rTool.callEvent("onItemClick");
                    } else {
                        selectToolView(restoreTool);
                    }
            }
        } else {
            selectToolView();
        }
    }

    function changeCenterView(newFrame, params){
        if (newFrame && newFrame !== currentFrame){
            $rootScope.$broadcast('hide' + currentFrame);

            oldFrame = currentFrame;

            currentFrame = newFrame;

            $rootScope.$broadcast('show' + newFrame, [$scope.containers[newFrame], params]);

            if (!params || params !== "dUIN-0") {
                restoringTool(newFrame);
            }
        } else

        if (!newFrame && oldFrame){
            $rootScope.$broadcast('hide' + currentFrame);

            currentFrame = oldFrame;

            $rootScope.$broadcast('show' + oldFrame, [$scope.containers[oldFrame], params]);

            if (!params || params !== "dUIN-0") {
                restoringTool(oldFrame);
            }
        } else

        if (newFrame === mcConst.dataModels.UserProfile){
            currentFrame = newFrame;

            $rootScope.$broadcast('show' + newFrame, [$scope.containers[newFrame], params]);
        }
    }

    function paintBG(color) {
        $scope.rightSideResizer.getNode().className = "webix_view webix_resizer_x noBorder noMargin " + color;
        $scope.rightSide.getNode().className = "webix_view noMargin webix_layout_line " + color;
    }

    function hideTool(tool) {
        switch (tool){
            case mcConst.dataModels.ReceiveFiles:
                if ($scope.toolBtn[tool].isVisible()){
                    $scope.toolBtn[tool].setValue(false);
                    $scope.toolBtn[tool].hide();

                    if (currentTool === tool){
                        if ($rootScope.GetChatType() === $rootScope.chatAliases.UIN){
                            $scope.changeTool(mcConst.dataModels.PrivateInfo);
                        } else
                        if ($rootScope.GetChatType() === $rootScope.chatAliases.UID){
                            $scope.changeTool(mcConst.dataModels.ConfUserList);
                        } else {
                            $scope.rightSide.hide();
                            $scope.rightSideResizer.hide();
                        }
                    }
                }
            break;
        }
    }

    // ===============================================

    $scope.registerHotKeys = function () {
        $rootScope.hotKeyDispatcher.addPreset($scope.Name, [{
            key   : mcConst.keyCodes.esc,
            shiftKey: true,
            func  : function () {
                selectToolView(currentTool, true);
            }
        }], document);
    };

    $scope.removeHotKeys = function () {
        $rootScope.hotKeyDispatcher.removePreset($scope.Name);
    };

    $scope.showMainMenu = function () {
        var val = $scope.mainMenu.getValue();

        if (val){
            webix.html.addCss( $scope.mainMenu.getNode(), "darkenNavBG");

            webix.html.removeCss( $scope.leftSideResizer.getNode(), "bgDarkness");
            webix.html.addCss( $scope.leftSideResizer.getNode(), "darkenNavBG");

            $rootScope.$broadcast('hide' + mcConst.dataModels.Dialogs);
            $rootScope.$broadcast('show' + mcConst.dataModels.MainMenu, [$scope.containers[mcConst.dataModels.MainMenu]]);

            if (!pinTool && [$rootScope.chatAliases.Conf, $rootScope.chatAliases.Privat].indexOf($rootScope.GetChatAlias()) === -1){
                restoreTool = null;
            }
        } else {
            webix.html.removeCss( $scope.mainMenu.getNode(), "darkenNavBG");

            webix.html.addCss( $scope.leftSideResizer.getNode(), "bgDarkness");
            webix.html.removeCss( $scope.leftSideResizer.getNode(), "darkenNavBG");

            $rootScope.$broadcast('hide' + mcConst.dataModels.MainMenu);
            $rootScope.$broadcast('show' + mcConst.dataModels.Dialogs, [$scope.containers[mcConst.dataModels.Dialogs]]);
        }

        //$scope.mainMenu.refresh();
    };

    $scope.changeTool = function(tool, oldTool){
        var currentType = $rootScope.GetChatType();

        oldTool = oldTool || selectToolList.getValue();

        currentTool = tool;

        if ($rootScope.GetChatTypeID() === 'UIN-0' && tool === mcConst.dataModels.PrivateInfo){
            switchToolBtnVisible();
        }

        if (($rootScope.GetChatTypeID() === 'UIN-0' && tool === mcConst.dataModels.PrivateInfo) ||
            (tool === mcConst.dataModels.ConfUserList && currentType === $rootScope.chatAliases.UIN) ||
            (tool === mcConst.dataModels.PrivateInfo  && currentType === $rootScope.chatAliases.Conf)){

            selectToolList.setValue(oldTool);

            $scope.changeToolBtn.apply($scope.toolBtn[oldTool]);
        } else {
            unPinTool();

            selectToolList.setValue(tool, true);

            if (!notShowRightSide && tool){
                $scope.changeToolBtn.apply($scope.toolBtn[tool]);
                $scope.rightSide.show();
                $scope.rightSideResizer.show();
            }

            switchToolBtnVisible(tool);

            if (tool){
                $rootScope.$broadcast('show' + tool, [$scope.containers[tool]]);
            }
        }

        if ($scope.rightSide.isVisible()){
            automaticClosedRightTool = false;
        }

    };

    $scope.changeToolBtn = function(){
        toolList.forEach(function (itm) {
            $scope.toolBtn[itm].setValue(false);
        });
        
        if (this && this.setValue){
            this.setValue(true);

            restoreTool  = this.config.id.split('_')[1];
            restoreValue = this.getValue();
        }
    };

    $scope.clickToolBtn = function(){
        var oldTool = selectToolList.getValue();

        restoreTool  = this.config.id.split('_')[1];
        restoreValue = this.getValue();

        if (oldTool === restoreTool && !restoreValue){ // !this.getValue() - unpressed
            if (!isMobile){
                $scope.rightSide.hide();
                $scope.rightSideResizer.hide();

                $rootScope.$broadcast('hide' + oldTool);

                notShowRightSide = true;
            } else {
                return false;
            }
        } else {
            notShowRightSide = false;

            $scope.changeTool(restoreTool);
        }
    };

    $scope.scrollView = function(){
        $rootScope.$broadcast('blurChatTextOutput', []);
    };

    $scope.correctSwipe = function (c1, c2){
        if (c1 && c2){
            var directionX = c2.x - c1.x;

            if (directionX > 100){ // left
                activeView = (activeView === 0) ? 0 : activeView - 1;
            } else
            if (directionX < -100){ // right
                activeView = (activeView === 2) ? 2 : activeView + 1;
            }

            if (view.getActiveIndex() !== activeView) {
                view.setActiveIndex(activeView);
            }
        }
    };

    //================================================

    var _msg = _messages_.chatWrapper = {
        carouselChange  : "carouselChange",
        showHideMenu    : "showHideMenu",
        selectTool      : "selectTool",
        changeCenterView: "changeCenterView",
        pinTool         : "pinTool",
        unPinTool       : "unPinTool",
        hideTool        : "hideTool",
        hideAllTools    : "hideAllTools",
        isVisibleRightSide: "isVisibleRightSide"
    };

    $scope.$on(_msg.hideAllTools, function () {
        toolList.forEach(function (tool) {
            if ($scope.toolBtn[tool].getValue()){
                $scope.toolBtn[tool].callEvent("onItemClick");
            }
        });
    });

    $scope.$on(_msg.isVisibleRightSide, function () {
        return $scope.rightSide.isVisible();
    });

    $scope.$on(_msg.hideTool, function (e, args) {
        hideTool.apply(null, args);
    });

    $scope.$on(_msg.carouselChange, function(e, args){
        var id = args[0];

        view.setActive(id);
    });

    $scope.$on(_msg.showHideMenu, function () {
        $scope.mainMenu.toggle();
    });

    $scope.$on(_msg.selectTool, function(e, args){
        selectToolView.apply(null, args);
    });

    $scope.$on(_msg.changeCenterView, function(e, args){
        changeCenterView.apply(null, args);
    });

    $scope.$on(_msg.pinTool, function(e, args){
        PinTool.apply(null, args);
    });

    $scope.$on(_msg.unPinTool, function(){
        unPinTool();
    });

    $scope.$on('hide' + $scope.Name, function(){
        view.hide();
    });

    $scope.$on('show' + $scope.Name, function(){
        $scope.wndSize = mcService.getWindowSize();
        $scope.myName  = mcConst.UserInfo.Nick;

        __config();

        view = initChatWrapper($scope);

        $rootScope.$broadcast('show' + mcConst.dataModels.Dialogs, [$scope.containers[mcConst.dataModels.Dialogs]]);

        setTimeout(toggleRightToolBarByWndSize, 200);

        $rootScope.registerRightsCheck('_warpper', function () {
            $scope.toolBtn.CommonContacts  [mcService.checkRights(mcConst._CMD_.RS.QShowCommonContactsList)  ? 'show' : 'hide']();
            $scope.toolBtn.PersonalContacts[mcService.checkRights(mcConst._CMD_.RS.QAllowContactsListsTotal) ? 'show' : 'hide']();

            $scope.leftSide       [mcService.checkRights(mcConst._CMD_.RS.QCommonAllowDialogs) ? 'show' : 'hide']();
            $scope.leftSideResizer[mcService.checkRights(mcConst._CMD_.RS.QCommonAllowDialogs) ? 'show' : 'hide']();
        });

        $scope.registerHotKeys();

        var left  = $scope.leftSide.getNode();
        var right = $scope.rightSide.getNode();

        left.ondragover = right.ondragover = left.ondrop = right.ondrop = $scope.centerBlock.ondragover = function(e) {
            /** @namespace e.dataTransfer */
            if (e.dataTransfer.files.length){
                e.preventDefault();
            }
        };

        $scope.centerBlock.ondrop = function(e) {
            var dataTransfer = e.dataTransfer;

            if (dataTransfer.files.length) {
                $rootScope.$broadcast(window._messages_.downloadUpload.on_file_drop, [dataTransfer]);

                e.preventDefault();
            }
        };
    });

    $rootScope.$broadcast('windowResize', [function(w, h){
        if (view){
            if (isMobile){
                $scope.wndSize.width = w;
                $scope.wndSize.height = h;

                view.define('height', h);
                view.define('width', w);

                $scope.leftSide.define('width', w);
                $$($scope.containers.center).define('width', w);
                $scope.rightSide.define('width', w);

                $scope.leftSide.resize();
                $$($scope.containers.center).resize();
                $scope.rightSide.resize();

                view.resize();
            } else {
                toggleRightToolBarByWndSize();
            }
        }
    }]);
}

// var tt = [
//     {
//         "_id": "5c361f26a72decf7729f67b7",
//         "name": "sampleRoom",
//         "notifying": {
//             "streamChange": true,
//             "participantActivities": true
//         },
//         "transcoding": {
//             "video": {
//                 "parameters": {
//                     "keyFrameInterval": true,
//                     "bitrate": true,
//                     "framerate": true,
//                     "resolution": true
//                 },
//                 "format": true
//             },
//             "audio": true
//         },
//         "mediaOut": {
//             "video": {
//                 "parameters": {
//                     "keyFrameInterval": [100, 30, 5, 2, 1],
//                     "bitrate": ["x0.8", "x0.6", "x0.4", "x0.2"],
//                     "framerate": [6, 12, 15, 24, 30, 48, 60],
//                     "resolution": ["x3/4", "x2/3", "x1/2", "x1/3", "x1/4", "hd1080p", "hd720p", "svga", "vga", "cif"]
//                 },
//                 "format": [
//                     { "codec": "h264", "profile": "CB" },
//                     { "codec": "vp9" }
//                 ]},
//             "audio": [
//                 { "codec": "opus", "sampleRate": 48000, "channelNum": 2 },
//                 { "codec": "isac", "sampleRate": 16000 },
//                 { "codec": "isac", "sampleRate": 32000 },
//                 { "codec": "g722", "sampleRate": 16000, "channelNum": 1 },
//                 { "codec": "pcma" },
//                 { "codec": "pcmu" },
//                 { "codec": "aac",  "sampleRate": 48000, "channelNum": 2 },
//                 { "codec": "ac3"  },
//                 { "codec": "nellymoser" },
//                 { "codec": "ilbc" }
//             ]},
//         "mediaIn": {
//             "video": [
//                 { "codec": "h264" },
//                 { "codec": "vp9"  }
//             ],
//             "audio": [
//                 { "codec": "opus", "sampleRate": 48000, "channelNum": 2 },
//                 { "codec": "isac", "sampleRate": 16000 },
//                 { "codec": "isac", "sampleRate": 32000 },
//                 { "codec": "g722", "sampleRate": 16000, "channelNum": 1 },
//                 { "codec": "pcma" },
//                 { "codec": "pcmu" },
//                 { "codec": "aac" },
//                 { "codec": "ac3" },
//                 { "codec": "nellymoser" },
//                 { "codec": "ilbc" }
//             ]},
//         "views": [
//             { "video": {
//                 "layout": {
//                     "templates": {
//                         "custom": [
//                             { "region": [
//                                 {
//                                     "id": "1",
//                                     "area": {
//                                         "left": "0", "top": "0", "width": "1", "height": "1"
//                                     },
//                                     "shape": "rectangle" }]
//                             },
//                             { "region": [
//                                 {
//                                     "id": "1",
//                                     "area": {
//                                         "left": "0", "top": "0", "width": "1/3", "height": "1/3"
//                                     },
//                                     "shape": "rectangle"
//                                 },
//                                 {
//                                     "id": "2",
//                                     "area": {
//                                         "left": "1/3", "top": "0", "width": "1/5", "height": "1/5"
//                                     }, "shape": "rectangle"
//                                 }
//                             ]}
//                         ],
//                         "base": "fluid"
//                     },
//                     "fitPolicy": "crop"
//                 },
//                 "keepActiveInputPrimary": false,
//                 "bgColor": {
//                     "b": 0, "g": 0, "r": 0
//                 },
//                 "motionFactor": 0.8,
//                 "maxInput": 16,
//                 "parameters": {
//                     "keyFrameInterval": 100,
//                     "framerate": 30,
//                     "resolution": {
//                         "height": 600, "width": 800
//                     }
//                 },
//                 "format": { "codec": "vp9" }
//             },
//             "audio": {
//                 "vad": true,
//                 "format": { "channelNum": 2, "sampleRate": 48000, "codec": "opus" }
//             },
//             "label": "common"
//         }],
//
//         "roles": [
//             {
//                 "subscribe": { "video": true, "audio": true },
//                 "publish": { "video": true, "audio": true },
//                 "role": "presenter"
//             },
//             {
//                 "subscribe": { "video": true, "audio": true },
//                 "publish": { "video": false, "audio": false },
//                 "role": "viewer"
//             },
//             {
//                 "subscribe": { "video": false, "audio": true },
//                 "publish": { "video": false, "audio": true },
//                 "role": "audio_only_presenter"
//             },
//             {
//                 "subscribe": { "video": true, "audio": false },
//                 "publish": { "video": false, "audio": false },
//                 "role": "video_only_viewer"
//             },
//             {
//                 "subscribe": { "video": true, "audio": true },
//                 "publish": { "video": true, "audio": true },
//                 "role": "sip"
//             }
//         ],
//         "participantLimit": -1,
//         "inputLimit": -1,
//         "__v": 5
//     }
// ];




















