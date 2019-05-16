"use strict";

function mcCmdLoop (mcConnect, $rootScope){
    window.idMcPingTimer = null;

    function RunCMD(InBuf, debug) {
        var _inBuf = [].concat(InBuf);
        var _inBufLength = _inBuf.length;

        if (debug) console.log("InBuf:\n" + InBuf);

        if (_inBufLength > 0){
            if (debug) {
                console.log("RunCMD, inBuf Length:" + _inBufLength);
                console.log("_inBuf:\n" + _inBuf);
            }

            var CMD_Block = _inBuf.shift();

            if (CMD_Block && CMD_Block.length > 0){
                CMD_Block = mcService.StringToObj(CMD_Block);

                for (var CMD_Numb in CMD_Block){
                    if (debug) console.log("Receive CMD: " + CMD_Numb);

                    (function(aa, bb){
                        if (debug){
                            console.log("Receive CMD: " + aa);
                            console.log(bb);
                        }

                        setTimeout(function () {
                            $rootScope.ProcessCMD([aa, bb]);
                        }, 0);
                    })(CMD_Numb, CMD_Block[CMD_Numb]);
                }

                if (_inBuf.length > 0) {
                    RunCMD(_inBuf);
                }
            }
        }

    }

    function cmdPing (sID){
        $rootScope.SendCMDToServer([mcConst._CMD_.Ping, sID]);
    }

    return function StartPingTimer(_time, sID, opt){ // this.StartPingTimer =
        var self = this;
        var options =  opt || {
            onError : null,
            onStop  : null,
            onWarn  : null
        };

        mcConnect.ClearAllCallBackFunctionByCMD();
        mcConnect.LeaveCallBacks = true;

        mcConnect.SetCallBackFunctionByCMD(mcConst._CMD_.Ping, function(){
            if ((this != "{}") && (this.length > 0)) {
                RunCMD(this.split('\r'));
            }
        });

        window.idMcPingTimer = (function(_sID){
            return setInterval(function(){
                cmdPing(_sID);
            }, _time);
        })(sID);

        self.StopPingTimer = function(){
            if (window.idMcPingTimer !== null){
                clearInterval(window.idMcPingTimer);

                window.idMcPingTimer = null;

                mcConnect.ClearAllCallBackFunctionByCMD();

                if (options.onStop) {
                    options.onStop();
                }
            }
        };

        mcConnect.OnError = function(err){
            if (console) {
                console.warn('An error occurred: Ping-Timer has been Stopped');
            }

            self.StopPingTimer();
            
            if (options.onError){
                options.onError(err);
            }
        };

    }
}
