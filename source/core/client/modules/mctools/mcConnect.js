"use strict";

function mcConnect ($http) {
    var ipc          = require('electron').ipcRenderer;
    var self         = this;

    var _config = {
        CallBackFunctionPull : {},
        idError              : 0,
        AjaxInProgress       : false,
        _Timeout             : 30000,
        CRLF                 : "\r\n",
        CR                   : "\r",
        LF                   : "\n"
    };

    self.asyncType      = true;
    self.NoCMD          = false;
    self.CallBackNoCMD  = null;
    self.LeaveCallBacks = false;

    var __clearError = function(){
        clearTimeout(_config.idError);
        _config.idError = 0;
    };

    ipc.on('scPostParser', function (em, data){
        __clearError();

        _config.AjaxInProgress = false;

        RequestSuccess(data);
    });

    var __SendData = function (_data/*, sync*/){
        ipc.send('csPostParser', _data);
    };

    /**
     * @return {number}
     */
    var ErrorControl = function (timeout){
        return setTimeout(function(){
            if (console) console.error("AHTUNG! Reload page.");

            _config.CallBackFunctionPull = {};

            _config.AjaxInProgress = false;

            if (self.OnError){
                self.OnError('error');
            }
        }, timeout);
    };

    /**
     * @return {number}
     */
    self.SendDataToServer = function(_data){
        var _sendData = '';
        var ___data = {};

        if ((!_data) || (_data.length === 0)) {
            if (console) console.warn('SendDataToServer: _data is empty or undefined');

            if (self.OnWarning) self.OnWarning({
                type : 'noSendData',
                cmd  : (_data) ? _data.CMD : undefined
            });

            return 1;
        } else {
            switch (typeof _data){
                case "string":
                    _sendData = _data;
                break;

                case "object":
                     ___data = mcService.Marge({
                        CMD        : '',
                        Data       : '',
                        OnReceive  : undefined,
                        Terminator : '\r',
                        AfterSend  : undefined
                    }, _data || {});

                    if (___data.Data === ''){
                        console.warn('SendDataToServer: [_data : Object] field "Data" is empty or undefined');

                        return 2;
                    }

                    if (Object.prototype.toString.call( ___data.Data ) === '[object Object]'){
                        ___data.Data = JSON.stringify(___data.Data);
                    }

                    _sendData = ((___data.CMD !== '') ? (___data.CMD + ___data.Terminator) : '') + ___data.Data;

                    if (___data.CMD !== ''){
                        if (___data.OnReceive){
                            self.SetCallBackFunctionByCMD(___data.CMD, ___data.OnReceive);
                        }
                    }
                break;

                case "function":
                break;
            }

            if (___data.immediately){
                __SendData(_sendData, true);
            } else {
                var idSendDataToServer = setInterval(function(){
                    if (_config.AjaxInProgress === false) {
                        _config.AjaxInProgress = true;

                        _config.idError = ErrorControl(_config._Timeout + 2000);

                        __SendData(_sendData);

                        if (self.ExtendedCallBackFunctionAtSandData){
                            self.ExtendedCallBackFunctionAtSandData.apply();
                        }

                        clearInterval(idSendDataToServer);
                    }
                }, 100);
            }
        }
    };

    //=====================================================================
    var RequestSuccess = function(msg){
        var WEB_CR_IDX = msg.indexOf(_config.CR);

        if (WEB_CR_IDX === -1) WEB_CR_IDX = msg.length;

        var request = msg.slice(0, WEB_CR_IDX);
        var _msg    = msg.slice(WEB_CR_IDX + 1, msg.length + 1);

        if (self.NoCMD) {
            self.CallBackNoCMD.apply(msg);
        } else {
            self.RunCallBackFunctionByCMD(request, _msg);
        }
    };
    /*function RequestSuccess(msg){
        var CR_IDX = msg.length ? msg.indexOf(_config.CR) : -1;

        if (CR_IDX !== -1) {
            //CR_IDX = msg.length;

            var cmd  = msg.slice(0, CR_IDX);
            var data = msg.slice(CR_IDX + 1, msg.length + 1);

            if (self.NoCMD) {
                self.CallBackNoCMD.apply(msg);
            } else {
                self.RunCallBackFunctionByCMD(cmd, data);
            }
        } else {
            var cmd  = "ping";

            if (self.NoCMD) {
                self.CallBackNoCMD.apply(msg);
            } else {
                self.RunCallBackFunctionByCMD(cmd, msg);
            }
        }
    }*/
    //=====================================================================
    self.OnError   = undefined;
    self.OnWarning = undefined;

    //=====================================================================
    self.SetCallBackFunctionByCMD = function(CMD, callback){
        if (callback){
            if (!_config.CallBackFunctionPull.hasOwnProperty(CMD)) {
                _config.CallBackFunctionPull[CMD] = [];
            }

            _config.CallBackFunctionPull[CMD].push(callback);
        }
    };

    //=====================================================================
    self.SetCallBackFunctionByCMDOnlyOne = function(CMD, callback){
        if (callback){
            _config.CallBackFunctionPull[CMD]    = [];
            _config.CallBackFunctionPull[CMD][0] = callback;
        }
    };

    //=====================================================================
    self.DelCallBackFunctionByCMD = function(CMD){
        if (_config.CallBackFunctionPull.hasOwnProperty(CMD)) {
            delete _config.CallBackFunctionPull[CMD];
        }
    };

    //=====================================================================
    self.ClearAllCallBackFunctionByCMD = function(){
        for (var i in _config.CallBackFunctionPull){
            if (_config.CallBackFunctionPull.hasOwnProperty(i)) delete _config.CallBackFunctionPull[i];
        }
    };

    //=====================================================================
    self.RunCallBackFunctionByCMD = function(CMD, MSG){
        var _next = (_config.CallBackFunctionPull.hasOwnProperty(CMD)) ? (_config.CallBackFunctionPull[CMD].length > 0) : false;

        if (!_next) {
            if (CMD !== 'OK' && CMD !== 'ping') {
                console.warn("CMD: \"" + CMD + "\" not have request func");
            }

            if (self.OnWarning) {
                self.OnWarning({
                    type : 'NoRunCallback',
                    cmd  : CMD
                });
            }
        }

        while (_next){
            if (_config.CallBackFunctionPull[CMD]){
                _config.CallBackFunctionPull[CMD][0].apply(MSG);
            }

            if (!self.LeaveCallBacks){
                _config.CallBackFunctionPull[CMD].shift();

                if (_config.CallBackFunctionPull[CMD].length === 0) {
                    delete _config.CallBackFunctionPull[CMD];
                }

                _next = (_config.CallBackFunctionPull.hasOwnProperty(CMD)) ? (_config.CallBackFunctionPull[CMD].length > 0) : false;
            } else {
                _next = false;
            }
        }
    };

    //=====================================================================
    self.ExtendedCallBackFunctionAtSandData = undefined;
}
