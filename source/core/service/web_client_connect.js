"use strict";

var Service	  = require('./service.js');
var console	  = require('gifer-console');
var MCConnect = require('./mcconnect.js');
var CMD       = MCConnect.CMD;

var inc        = 0;
var parseFunc  = {};
var key        = "nt854t89uc3 548 uj30u4 ry59-48fdkws iajwh34by6t89-i1k,ZOKJ Nbayzf % ^tsjza(_wehT587   2 HED-9ISJAU*(ASGHf6789R3J nfe_(uheqT58Q 73H//Service.RandomHash(512); //'ergiouhergfih450t8gf7y4t08hberiugfvb3845gt5rthb8urghrghju'; // Service.RandomHash(256); // supersecretkey";
var CR         = "\r";

/**
 * @return {string}
 */
function SessionID_Generator (){
    inc ++;

    return inc + Service.RandomHash(15);
}

function createContext(id, cmd, data, pwd, srvPwd) {
    return {
        login      : data.UIN,
        pass       : pwd, // originPass,

        Secured              : data.Secured,
        Gender               : data.Gender,
        Email                : data.Email,
        SecretQuestionNumber : data.SecretN || 0,
        SecretAnswer         : data.SecretA || 1,
        ClientType           : data.ClientType,
        Style                : data.Style,
        NodeUserAgent        : data.UserAgent,
        NodeReferral         : data.Referral,
        State                : data.State,

        ServPass             : srvPwd, // originSrvPass,

        PingDelay  : data.PingDelay || 25,
        host       : data.Host,
        port       : data.Port,

        //clientIP   : Host, // todo: add my IP
        sessionID  : id,
        authType   : cmd
    }
}

function _Auth(_data, cmd, CallBack){
    var id   = SessionID_Generator();
    var data = Service.StringToObj(_data);

    var originPass    = "";
    var originSrvPass = "";

    function doLogin(id, data){
        MCConnect.MakeClientConnection(createContext(id, cmd, data, originPass, originSrvPass));

        if (CallBack){
            var pwd = "";

            if (data.RM) {
                pwd = CR + data.Pass + CR + (data.ServPass || "");
            } else {
                pwd = CR + ((data.Pass)     ? Service.Encrypt(key, data.Pass || "")     : "") +
                      CR + ((data.ServPass) ? Service.Encrypt(key, data.ServPass || "") : "");
            }

            CallBack(CMD.OK + CR + id + pwd);
        } else {
            console.err('Not assigned CallBack on CMD:' + cmd);
        }
    }

    try {
        originPass    = (data.RM) ? Service.Decrypt(key, data.Pass || "") : data.Pass || "";
        originSrvPass = (data.ServPass && data.RM) ? Service.Decrypt(key, data.ServPass || "") : (data.ServPass || "");
    } catch (e){
        originPass    = data.Pass || "";
        originSrvPass = data.ServPass || "";
    }

    if (MCConnect.getPenaltyUser(data.UIN) && cmd === CMD.Login){
        setTimeout(function(){
            doLogin(id, data);
        }, 1000);
    } else {
        doLogin(id, data);
    }
}

parseFunc[CMD.Login]       = function Login(_data, SendDataToWebClient){
    var data = Service.StringToObj(_data);
    var sID  = data.SessionID;

    if (sID){
        data = createContext(sID, CMD.Login, data, data.Pass, data.ServPass);
        
        MCConnect.updateUserInfo(sID, data);
        MCConnect.SendDataToServer(sID, CMD.cs_login, [data]);
    } else {
        _Auth(_data, CMD.Login, SendDataToWebClient);
    }
};

parseFunc[CMD.Register]    = function Register(_data, SendDataToWebClient){
    _Auth(_data, CMD.Register, SendDataToWebClient);
};

parseFunc[CMD.Ping]        = function Ping(_data, SendDataToWebClient){ // sessionID
    var data = _data.split(CR);
    var sID  = data[0];

    if (MCConnect.HasConnection(sID)){
        if (SendDataToWebClient) SendDataToWebClient(CMD.Ping + CR + MCConnect.GetConnection(sID).UsersInBuffer.GetFromInBuf(MCServer.sendBufferSize));

        MCConnect.SendDataToServer(sID, MCConnect.CMD.cs_ping);
    } else {
        var out = MCConnect.getFromErrorBuffer(sID) || {};

        if (Service.isString(out)){
            out += '{"9999": {}}';
        } else {
            out[MCConnect.CMD.sc_drop_connect] = {};

            out = JSON.stringify(out);
        }

        SendDataToWebClient(CMD.Ping + CR + out);
    }
};

function UniversalParser (_CMD, _data, SendDataToWebClient){
    if (parseFunc.hasOwnProperty(_CMD)) {
        parseFunc[_CMD](_data, SendDataToWebClient);
    } else {
        var data = _data.split(CR);
        var sID  = data.shift().toString();

        MCConnect.SendDataToServer(sID, _CMD, data);

        if (SendDataToWebClient) SendDataToWebClient(CMD.OK);
    }
}

exports.UniversalParser = UniversalParser;