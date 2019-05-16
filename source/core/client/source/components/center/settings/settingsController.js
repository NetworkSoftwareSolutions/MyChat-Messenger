"use strict";

function settingsController($scope, $rootScope){
    $scope.Name = mcConst.dataModels.Settings;

    var view   = null;
    var bakCss = "";
    var canChange = true;

    // ===================================== AutoLoadBroadcastFiles

    var conformity = {
        "EventsTrayDontHide" : {
            set : function(val){
                $$("rcitm_EventsTrayDontHide").setValue(mcService.convertBool(val));
            },
            get : function(){
                return mcService.convertIntToBool($$("rcitm_EventsTrayDontHide").getValue());
            }
        },
        "SendFilesRandomPorts" : {
            set : function(val){
                $$("rcitm_SendFilesRandomPorts").setValue(mcService.convertBool(val));
            },
            get : function(){
                return mcService.convertIntToBool($$("rcitm_SendFilesRandomPorts").getValue());
            }
        },
        "SoundsAllSoundsOff" : {
            set : function(val){
                $$("sub_SoundsAllSoundsOff").setValue(mcService.convertBool(val));
            },
            get : function(){
                return $$("rcitm_SoundsAllSoundsOff").config.hidden ? null : mcService.convertIntToBool($$("sub_SoundsAllSoundsOff").getValue());
            }
        },
        "SysEventsHistory_1_Num": {
            set : function(val){
                $$("rcitm_SysEventsHistory_1_Num").setValue(val);
            },
            get : function(){
                return $$("rcitm_SysEventsHistory_1_Num").getValue();
            }
        },
        "SysEventsLoadHistoryType": {
            set : function(val){
                $$("rcitm_SysEventsLoadHistoryType").setValue(mcService.convertBool(val));
            },
            get : function(){
                return $$("rcitm_SysEventsLoadHistoryType").getValue();
            }
        },
        "SendFilesInputFilesDir": {
            set : function(val){
                $$("rcitm_SendFilesInputFilesDir").setValue(val);
            },
            get : function(){
                return $$("rcitm_SendFilesInputFilesDir").getValue();
            }
        }
    };

    ["SendFilesBasePort","SendFilesDataPort","SendFilesRandomPortStart","SendFilesRandomPortEnd"].forEach(function(elem){
        conformity[elem] = {
            set : function(val){
                $$("rcitm_" + elem).setValue(val);
            },
            get : function(){
                return $$("rcitm_" + elem).getValue();
            }
        }
    });

    ["LoadHistoryToConf", "LoadHistoryToPrivate"].forEach(function(elem){
        conformity[elem] = {
            set : function(val){
                $$("rcitm_" + elem).setValue(mcService.convertBool(val));
            },
            get : function(){
                return $$("rcitm_57").config.hidden ? null : mcService.convertIntToBool($$("rcitm_" + elem).getValue());
            }
        };
    });

    ["MediaNetworkTransportTCP", "MediaNetworkTransportUDP"].forEach(function(elem){
        conformity[elem] = {
            set : function(val){
                $$("rcitm_" + elem).setValue(mcService.convertBool(val));
            },
            get : function(){
                return $$("rcitm_Transport").config.hidden ? null :  mcService.convertIntToBool($$("rcitm_" + elem).getValue());
            }
        };
    });

    ["SoundsSndError","SoundsSndJoin","SoundsSndLeave","SoundsSndChat","SoundsSndStatus","SoundsSndSignal",
        "SoundsSndChatType","SoundsSndChatBS","SoundsSndChatRet","SoundsSndNewMsg","SoundsSndPrivate",
        "SoundsSndBadWord","SoundsSndBroadcast","SoundsSndScreenShot","SoundsSndFilesExchangeRequest",
        "SoundsSndFilesExchangeDone","SoundsSndMediaCall","SoundsSndMediaBusy","SoundsSndMediaCallReject",
        "SoundsSndMediaIncomingCall","SoundsSndMediaEndCall"].forEach(function(elem){
        conformity[elem] = {
            set : function(val){
                $$("rcitm_" + elem).setValue(mcService.convertBool(val));
            },
            get : function(){
                return $$("rcitm_SoundsAllSoundsOffCustom").config.hidden ? null : mcService.convertIntToBool($$("rcitm_" + elem).getValue());
            }
        };
    });

    ["SoundsSndNewMsgFile","SoundsSndBadWordFile","SoundsSndLeaveFile","SoundsSndJoinFile","SoundsSndChatTypeFile",
        "SoundsSndChatBSFile","SoundsSndStatusFile","SoundsSndErrorFile","SoundsSndPrivateFile","SoundsSndChatRetFile",
        "SoundsSndSignalFile","SoundsSndChatFile","SoundsSndBroadcastFile","SoundsSndScreenShotFile",
        "SoundsSndFilesExchangeRequestFile","SoundsSndFilesExchangeDoneFile","SoundsSndMediaBusyFile","SoundsSndMediaCallFile",
        "SoundsSndMediaCallRejectFile","SoundsSndMediaEndCallFile","SoundsSndMediaIncomingCallFile"].forEach(function(elem){
        conformity[elem] = {
            set : function(val){
                $$("rcitm_" + elem).setValue(val);
            },
            get : function(){
                return $$("rcitm_SoundsFilesCustom").config.hidden ? null : $$("rcitm_" + elem).getValue();
            }
        };
    });

    // =====================================

    $scope.registerHotKeys = function () {
        // $rootScope.hotKeyDispatcher.addPreset(mcConst.dataModels.ViewLogs + "global", [{
        //     key   : mcConst.keyCodes.n,                                   
        //     altKey: true,
        //     func  : $scope.addNewBBS
        // }], document);
    };

    $scope.checkNumbers = function(code){
        if (this.config.view === "counter" && mcService.inArray(code, mcConst.keyCodes.Digits.concat(mcConst.keyCodes.EditSymbols)) === -1){
            return false;
        }
    };

    $scope.universalChanger = function () {
        var val     = null;
        var element = null;
        var changed = false;

        if (canChange){
            for (var item in mcConst.ClientSettings){
                val = null;

                if (conformity.hasOwnProperty(item)){
                    val = conformity[item].get();

                    if (val !== null && val != mcConst.ClientSettings[item]) {
                        mcConst.ClientSettings[item] = val;

                        changed = true;
                    }
                } else {
                    element = $$("rcitm_" + item);

                    if (element && !element.config.hidden){
                        if (element.config.view === "checkbox") {
                            val = mcService.convertIntToBool(element.getValue());
                        } else {
                            val = element.getValue();
                        }

                        if (val !== null && val != mcConst.ClientSettings[item]) {
                            mcConst.ClientSettings[item] = val;

                            changed = true;
                        }
                    }
                }
            }

            if (changed) {
                $rootScope.$broadcast(window._messages_.clientData.saveClientSettings);
            }
        }
    };

    $scope.removeHotKeys = function () {
        // $rootScope.hotKeyDispatcher.removePreset(mcConst.dataModels.ViewLogs + "global");
    };

    $scope.show = function(){
        view = initSettingsView($scope);

        bakCss = $$($scope.container).getNode().className;
        
        $$($scope.container).getNode().className = "webix_view noMargin webix_layout_line";
    };

    $scope.getData = function () {
        var element = null;

        canChange = false;

        Object.keys(mcConst.ClientSettings).forEach(function (stng) {
            if (conformity.hasOwnProperty(stng)) {
                conformity[stng].set(mcConst.ClientSettings[stng]);
            } else {
                element = $$("rcitm_" + stng);

                if (element && !element.config.hidden){
                    if (element.config.view === "checkbox") {
                        element.setValue(mcService.convertIntToBool(mcConst.ClientSettings[stng]));
                    } else {
                        element.setValue(mcConst.ClientSettings[stng]);
                    }
                }
            }
        });

        canChange = true;
    };

    //========================================

    var _msg = _messages_.Settings = {
        changeUserProfile   : 'changeUserProfile'
    };

    $scope.$on(_msg.changeUserProfile, function (e, args) {
        mcConst.ClientSettings = mcService.Marge(mcConst.ClientSettings, args[0]);

        $rootScope.$broadcast(window._messages_.clientData.saveClientSettings);

        $scope.getData();
    });

    $scope.$on('hide' + $scope.Name, function(){
        if (view && view.isVisible()) {
            $scope.removeHotKeys();

            view.hide();

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
