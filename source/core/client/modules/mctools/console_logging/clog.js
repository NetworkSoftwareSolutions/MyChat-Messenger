/**
 * Created by Gifer on 21.07.2017.
 */

var ___native_console = window.console;

function cLog(CMD, sendCMD, needSessionID) {
    var isObject = function (obj) {
        return Object.prototype.toString.call( obj ) === '[object Object]';
    };

    if (CMD && sendCMD){
        window.console = {
            log : function log(){
                try{
                    ___native_console.log.apply(null, arguments);
                } catch (e){
                    Function.prototype.bind.apply(___native_console.log, [null].concat(arguments));
                }

                var data = isObject(arguments[0]) ? JSON.stringify(arguments[0]) : arguments[0];

                sendCMD( [CMD]. concat(needSessionID ? [mcConst.SessionID] : []). concat(['log ', data]), !needSessionID);
            },

            error: function error(){
                try {
                    ___native_console.error.apply(null, arguments);
                } catch (e){
                    Function.prototype.bind.apply(___native_console.error, [null].concat(arguments));
                }

                var data = isObject(arguments[0]) ? JSON.stringify(arguments[0]) : arguments[0];
                var _err = {};

                try{
                    Error.captureStackTrace(_err);
                } catch (e){}

                sendCMD([CMD].concat(needSessionID ? [mcConst.SessionID] : []).concat(['err ', data + "\n" + _err.stack]), !needSessionID);
            },

            err: function err(){
                try {
                    ___native_console.error.apply(null, arguments);
                } catch (e){
                    Function.prototype.bind.apply(___native_console.error, [null].concat(arguments));
                }

                var data = isObject(arguments[0]) ? JSON.stringify(arguments[0]) : arguments[0];
                var _err = {};

                try{
                    Error.captureStackTrace(_err);
                } catch (e){}

                sendCMD([CMD].concat(needSessionID ? [mcConst.SessionID] : []).concat(['err ', data + "\n" + _err.stack]), !needSessionID);
            },

            warn: function warn(){
                try {
                    ___native_console.warn.apply(null, arguments);
                } catch (e) {
                    Function.prototype.bind.apply(___native_console.warn, [null].concat(arguments));
                }

                var data = isObject(arguments[0]) ? JSON.stringify(arguments[0]) : arguments[0];

                sendCMD([CMD].concat(needSessionID ? [mcConst.SessionID] : []).concat(['warn', data]), !needSessionID);
            }
        };
    }
}
