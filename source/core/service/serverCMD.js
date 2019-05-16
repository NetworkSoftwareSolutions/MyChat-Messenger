 /**
 * Created by Gifer on 13.02.2017.
 */

 var console  = require('gifer-console');
 var Service  = require('./service.js');
 var CMD      = require('../client/modules/cmd/cmd').CMD;
 var web_client_connect = require('./web_client_connect');

 var oneDay = 1000*60*60*24;
 var CRLF   = "\r\n";
 var CR     = "\r";
 var LF     = "\n";

 var ServToClientCMD = {};
 var ClientToServCMD = require('./clientCMD').ClientToServCMD;

 var penaltyList  = [];
 var LoginMethods = {};
 var firstLogin   = false;
 var serverHWID   = "";

 LoginMethods[CMD.Login]    = CMD.cs_login;
 LoginMethods[CMD.Register] = CMD.cs_register_new_user;
 LoginMethods[CMD.cs_login_by_token] = CMD.cs_login_by_token;

 //====================== SEVER TO CLIENT ===============================

 ServToClientCMD[CMD.sc_hello]                = function(_data){
     var socket = this;

     process.nextTick(function(){
         socket.ServerInfo = _data;
         socket.UserInfo.HWID = socket.ServerInfo.HWID;

         serverHWID = socket.ServerInfo.HWID;

         MCServer.PortNode = socket.ServerInfo.PortNode;
         MCServer.HTTPS    = socket.ServerInfo.HTTPS;
         MCServer.PortFTP  = socket.ServerInfo.PortFTP;

         console.log('Hello:\n' + JSON.stringify(socket.ServerInfo), console.logLevel.L_Full);

         socket.SendDataToServer(ClientToServCMD[CMD.cs_hello](socket));
     });
 };

 ServToClientCMD[CMD.sc_accept_connection]    = function(){
     var socket = this;

     process.nextTick(function(){
         console.info("Server is Ready");
         console.log('UserInfo:\n' + JSON.stringify(socket.UserInfo), console.logLevel.L_Full);

         if (LoginMethods.hasOwnProperty(socket.UserInfo.authType)){
             socket.SendDataToServer(ClientToServCMD[LoginMethods[socket.UserInfo.authType]](socket.UserInfo));
         }
     });
 };

 ServToClientCMD[CMD.sc_login]                = function(_data){
     var socket = this;

     console.important("User UIN: " + _data.UIN + " Successfully Logged In! sID: " + socket.UserInfo.sessionID);
     console.log("sc_login: " + JSON.stringify(_data), console.logLevel.L_Full);

     var out = {};
     out[CMD.sc_login] = _data;
     out[CMD.sc_login].HWID     = socket.ServerInfo.HWID;
     out[CMD.sc_login].PortNode = socket.ServerInfo.PortNode;
     out[CMD.sc_login].HTTPS    = socket.ServerInfo.HTTPS;
     out[CMD.sc_login].PortFTP  = socket.ServerInfo.PortFTP;
     // out[CMD.sc_login].IPVer    = MCServer.IPVer;

     socket.UserInfo.UIN = _data.UIN;
     socket.UserInfo.LoggedIn = true;

     if (firstLogin){
         firstLogin = false;
         Service.Delete_File(MCPathes.ProfilNode + 'first.login');
     }

     this.UsersInBuffer.AddDataToInBuf(out);
 };

 ServToClientCMD[CMD.sc_halt]                 = function (){
     var socket = this;

     process.nextTick(function(){
         socket.SendDataToServer();

         socket.CloseConnection();

         console.important('Server send HALT. Terminate web-client session.');
     });
 };

 ServToClientCMD[CMD.sc_error]                = function(_data){
     var socket = this;

     process.nextTick(function(){
         var out           = {};
         out[CMD.sc_error] = _data;

         socket.UsersInBuffer.AddDataToInBuf(out);

         if (_data.ErrNum == 14){
             penaltyList.push(socket.UserInfo.login);
         }

         console.warn("MCServer ERROR: [" + _data.ErrNum + "] " + Service.myReplace(global.MCServer.ErrorText[_data.ErrNum], [].concat(_data.Params)) + "\nFor sID: " + socket.UserInfo.sessionID, console.logLevel.L_Normal);
     });
 };

 ServToClientCMD[CMD.sc_web_user_foto_file]   = function(_data){
     if (_data.FileName != ""){
         var uin = this.UserInfo.UIN;
         var res = require('./router').AddRandomPath({
             source  : _data.FileName,
             fileName: '/' + Service.ExtractFileName(_data.FileName),
             UIN     : uin
         });

         var out = {};
         out[CMD.sc_web_user_foto_file] = {
             "UIN"      : uin,
             "FileName" : res[1]
         };

         this.UsersInBuffer.AddDataToInBuf(out);
     }
 };

 ServToClientCMD[CMD.sc_get_all_rights]       = function(_data){
     var out = {};

     out[CMD.sc_get_all_rights] = _data;

     this.RightSet = ' ' + _data.RightsSet;

     console.log('Received cmd: ' + CMD.sc_get_all_rights, console.logLevel.L_Extended);

     this.UsersInBuffer.AddDataToInBuf(out);
 };

 /*ServToClientCMD[CMD.sc_get_all_rights]       = function(_data){
  console.log('Received cmd sc_get_all_rights: ');
  console.log(_data);

  var out      = {};
  out[CMD.sc_get_all_rights] = _data;

  this.UsersInBuffer.AddDataToInBuf(out);
  };*/

 /**
  * @return {boolean}
  */
 function getPenaltyUser(user){
     var res = false;
     var idx = Service.inArrayNoStrict(user, penaltyList);

     if (idx !== -1){
         res = true;

         penaltyList.splice(idx, 1);
     }

     return res;
 }

 function setPenaltyUser(user){
     var idx = Service.inArrayNoStrict(user, penaltyList);

     if (idx == -1){
         penaltyList.push(user);
     }
 }

 exports.ServToClientCMD = ServToClientCMD;
 exports.LoginMethods = LoginMethods;
 exports.firstLogin           = function(){ return firstLogin };
 exports.httpStarted          = function(){
     Service.LoadJSONFile(MCPathes.ProfilNode + 'first.login', function(data){
         firstLogin = !!data;
     }, 'utf8');

     return web_client_connect;
 };
 exports.getPenaltyUser       = getPenaltyUser;
 exports.getServerHWID        = function () {
     return serverHWID;
 };
