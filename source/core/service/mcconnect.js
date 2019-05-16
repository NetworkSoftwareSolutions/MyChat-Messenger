
 "use strict";

 const console         = require('gifer-console');
 const MCServ          = require('net');
 const Service         = require('./service.js');
 const util            = require('util');
 const CMD             = require('../client/modules/cmd/cmd').CMD;
 const ClientToServCMD = require('./clientCMD').ClientToServCMD;
 const _serverCMD      = require('./serverCMD');
 const OS              = require('os');
 const tlsMCServ       = require('tls');
 const constants       = require('constants');

 process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

 let CLIENT_TO_SERVER = 'client-to-server-cmd';
 let SERVER_TO_CLIENT = 'server-to-client-cmd';
 let ServToClientCMD  = _serverCMD.ServToClientCMD;

 let ProtocolVersion  = MCServer.ProtocolVersion;

 let ConnectionsList = {};
 let CRLF            = "\r\n";
 let CR              = "\r";
 let LF              = "\n";
 let wcc             = null;
 let socketIO        = null;
 let errorBuffer     = {};
 let tryUpdateClient = null;

 let MagicPacket  = '\u0017\u0006';
 let SendingFlags = '00';
 let hardwareID   = "";
 let clientInfo   = {};
 let directSendElectronClient = null;

 let legacyServers = ['7.2.0', '7.3.0', '7.4.0'];
 let serverVersion = null;

 MCServer.ClientVersion = legacyServers[legacyServers.length - 1];
 
 Service.LoadJSONFile(MCPathes.Service + 'textsource/errors/client/' + MCServer.Lang + '.errors.json', function(data){
     let text = data;

     if (text){
         global.MCServer.ErrorText = JSON.parse(text.toString());
     }
 }, 'utf8');

 // ===========================================================

 ClientToServCMD[CMD.cs_hello] = function(__socket){
     let mac    = '';
     let osType = '';
     let clientType = '';

     try {
         let where = "";
         let intrfslst = OS.networkInterfaces();

         switch (OS.platform()){
             case "win32":  where = "Ethernet"; osType = 'win32'; clientType = CMD.ClientType.WIN32_NEXT; break;
             case "linux":  where = "eth0";     osType = 'linux'; clientType = CMD.ClientType.LINUX; break;
             case "darwin": where = "en0";      osType = 'mac';   clientType = CMD.ClientType.MACOS; break;

             default: where = "eth0";
         }

         if (intrfslst[where] && intrfslst[where].length){
             mac = intrfslst[where][0].mac.toUpperCase().replace(/[:]/g, "-");
         } else {
             mac = intrfslst[Object.keys(intrfslst)[0]][0].mac.toUpperCase().replace(/[:]/g, "-");
         }
     } catch (e){
         console.error(e.message);
         console.error(e.stack);
     }

     clientInfo = {
         "ProtocolVer"  : ProtocolVersion,     // версия протокола клиента
         "Client"       : clientType,              //__socket.UserInfo.ClientType,    // тип клиента, который подключается к серверу. win32 - Windows-клиент.
         "Packed"       : false,               // использовать сжатие трафика или нет. По умолчанию - false
         "MAC"          : mac,                 // MAC адрес клиента
         "osType"       : osType,
         "HardwareID"   : osType + '-' + hardwareID,          // timastamp+XY HardwareID клиента
         "NetName"      : OS.hostname(),       // сетевое имя компьютера
         "Ver"          : serverVersion,       // версия клиентского приложения
         "OS"           : OS.type() + " " + OS.release(),        // название и версия операционной системы клиента
         "Secured"      : __socket.UserInfo.Secured || "",                  // использовать или нет зашифрованное соединение. Если пустая строка - шифрования нет
         "UTC"          : 0,                   // UTC смещение времени подключающегося клиента
         "NodeRemoteIP" : __socket.UserInfo.clientIP,
         "NodeUserAgent": __socket.UserInfo.NodeUserAgent,
         "NodeReferral" : __socket.UserInfo.NodeReferral,
         "Interfaces"   : []                   // список сетевых интерфейсов клиента
     };

     console.log(clientInfo, console.logLevel.L_High);

     global.isBrodcast = false;

     return MagicPacket + CMD.cs_hello + SendingFlags +
         JSON.stringify(clientInfo) + CRLF;
 };

 ServToClientCMD[CMD.sc_halt]  = null;

 // ===========================================================

 function TInBufData(sid, wsEmit){
     let Buffers = [];
     let sID     = sid;
     let Self    = this;

     this.AddDataToInBuf = function(_data){
         if (wsEmit){
             wsEmit.emit(SERVER_TO_CLIENT, CMD.Ping + CR + Service.ObjToString(_data) + CR);
         } else {
             if (directSendElectronClient) {
                 directSendElectronClient(_data);
             } else {
                 Buffers.push(_data);
             }
         }

         console.info('Added data to InBuffer, total length:' + Buffers.length, console.logLevel.L_Full);
     };

     this.ClearInBufData = function(){
         if (Buffers.length > 0) {
             Buffers = [];

             console.info('Clearing InBuffer for SessionID: ' + sID, console.logLevel.L_Full);
         }
     };

     /**
      * @return {string}
      */
     this.GetAllFromInBuf = function(needClear){
         let res = Service.ArrayToString(Buffers);

         if (needClear) {
             Self.ClearInBufData();
         }

         return res;
     };

     /**
      * @return {string}
      */
     this.GetAllFromInBufAsArray = function(needClear){
         let res = Buffers;

         if (needClear) {
             Self.ClearInBufData();
         }

         return res;
     };

     /**
      * @return {string}
      */
     this.GetFromInBuf = function(maxSize){
         let res = "";
         let item = "";

         if (Buffers.length === 1){
             res = Service.ObjToString(Buffers[0]) + CR;

             Buffers.shift();
         } else
         while (Buffers.length > 0){
             item = Service.ObjToString(Buffers[0]);

             res = res + item + CR;

             Buffers.shift();

             if (res.length >= maxSize){
                 break;
             }
         }

         return res;
     };

     this.ClearHistory = function(){
         let i = 0;

         while (i < Buffers.length){
             if (Buffers[i] && Buffers[i].logs) {
                 Buffers.shift();
             } else
             if (Buffers[i]){
                 i ++;
             }
         }
     };
 }

 function ClientConnect (OptSettings) {
     let Self          = this;
     let __socket      = null;
     let __buffer      = "";

     this.socketIO     = OptSettings.io;

     delete OptSettings.io;

     if (console.GetLogLevel() >= console.logLevel.L_Extended){
         console.log('User try auth and send:\n' + JSON.stringify(Service.extend(OptSettings, {pass: "*****"})), console.logLevel.L_Extended);
     }

     let ConnectOpt = updateData(OptSettings);

     //=======================================================

     function updateData(data) {
         return Service.extend({
             login                : 0,
             pass                 : "",
             host                 : '192.168.10.100',
             port                 : 2004,

             sessionID            : "11111111111111",
             authType             : CMD.Login,
             ServPass             : "",

             ClientType           : "web",

             PingDelay            : 25,
             CurrentPing          : 1,

             clientIP             : "",

             Secured              : false,
             HWID                 : "",
             Gender               : 1,                      // пол пользователя, 0 - неизвестен, 1 - мужской, 2 - женский
             Firstname            : "",                     // имя пользователя
             Lastname             : "",                     // фамилия пользователя
             Surname              : "",                     // отчество пользователя
             Avatar               : 0,                      // номер аватара
             Email                : "bugs@nsoft-s.com",     // адрес электронной почты
             SecretQuestionNumber : 0,                      // номер секретного вопроса для восстановления пароля
             SecretAnswer         : "",                     // ответ на секретный вопрос
             State                : 0                       // текущий статус пользователя (0 - свободен)
         }, data || {});
     }
     
     function ProcessingReceivedData(){
         if (__buffer.indexOf(CRLF) !== -1) {
             let data = Service.GetSubstring(__buffer, CRLF);

             __buffer = Service.GetSubstringFrom(__buffer, CRLF);

             if (data !== ''){
                 let CMD_numb = data.slice(2, 6) + '';
                 let DataObj  = data.slice(8, data.length);

                 console.log("Received CMD from server:" + CMD_numb, console.logLevel.L_Full);

                 if (DataObj.length > 0) {
                     console.log("Received DATA from server:" + DataObj, console.logLevel.L_Full);

                     DataObj = Service.StringToObj(DataObj);
                 }

                 if (ServToClientCMD[CMD_numb]) {
                     ServToClientCMD[CMD_numb].apply(Self, [DataObj]);
                 } else
                 if (Self.ServerToClientMultiCMD.apply(Self, [CMD_numb, DataObj]) === false){
                     console.error('Server send unknown command: ' + CMD_numb);
                 }

                 if (__buffer.length > 0){
                     process.nextTick(function(){
                         ProcessingReceivedData();
                     });
                 }
             } else {
                 console.warn("Processing Received DATA is empty");
             }
         }
     }

     function enableSSL(socket) {
         return tlsMCServ.connect({
             socket            : socket,
             secureProtocol    : "TLSv1_2_method",
             servername        : "MyChatServer",
             secureContext     : tlsMCServ.createSecureContext({
                 secureOptions   : constants.SSL_OP_NO_SSLv2 | constants.SSL_OP_NO_SSLv3
             }),
             rejectUnauthorized : false,
         });
     }

     function closeConnectionNow(err) {
         let _id = ConnectOpt.sessionID;
         
         if (HasConnection(_id)){
             err = err || {};

             Self.ServerToClientMultiCMD(CMD.sc_error, JSON.stringify({ "ErrNum" : 224, "Params" : [err.message || err.code || "unknown connection error"] }));

             setTimeout(function () {
                 Self.CloseConnection(true);
             }, 100);
         }
     }

     function setHandlers(handleSocket, ssl) {
         if (ssl){
             handleSocket.on('secureConnect', function () {
                 console.log("SSL connections! " + handleSocket.getProtocol());
             });
         }

         handleSocket.setTimeout(80000);

         handleSocket.on('data', function(data) {
             __buffer += data.toString();

             ProcessingReceivedData();
         });
         handleSocket.on('end', function() {
             let err = Self.UsersInBuffer.GetFromInBuf();

             if (err){
                 try {
                     err = Service.isString(err) ? JSON.parse(err) : err;
                 } catch (e){}

                 errorBuffer[ConnectOpt.sessionID] = err;
             }

             console.important('\"End\" connections to MyChat server');
         });
         handleSocket.on('close', function() {//err
             console.important('Client disconnected. Close sID: ' + ConnectOpt.sessionID);

             Self.CloseConnection();
         });
         handleSocket.on('error', function(err) {
             console.DublicateToFile(require('./profile').getProfilePath() + "/logs/" + (new Date()).myFormat('yyyy') + "/" + (new Date()).myFormat('mm') + "/" + (new Date()).myFormat('dd') + "/node.log");

             closeConnectionNow(err);
         });
         handleSocket.on('timeout', function() {
             console.DublicateToFile(require('./profile').getProfilePath() + "/logs/" + (new Date()).myFormat('yyyy') + "/" + (new Date()).myFormat('mm') + "/" + (new Date()).myFormat('dd') + "/node.log");

             closeConnectionNow({code: "connection timeout"});
         });
     }

     function doConnect(ssl) {
         let socket = MCServ.createConnection(ConnectOpt.port, ConnectOpt.host, function() {
             console.log('Connected to MyChat Server. Sending signature.' + (ssl ? " Secured" : "Normal"));

             if (ssl) {
                 this.write('mc' + serverVersion + CRLF + '{"Secured":"TLSv1.2"}' + CRLF);
             } else {
                 this.write('mc' + serverVersion + CRLF + '{"Secured":""}');
             }
         });

         __socket = ssl ? enableSSL(socket) : socket;

         setHandlers(__socket, ssl);
     }

     function testAndConnect(host, port) {
         console.log("Current client version: " + MCServer.ClientVersion);
         
         Service.testServerConnect(host, port, function (err, _data) {
             if (err){
                 closeConnectionNow(err);
             } else {
                 let serverInfo = Service.StringToObj(_data.replace('mctest', ''));

                 if (legacyServers.indexOf(serverInfo.ServerVer) !== -1){
                     ProtocolVersion = serverInfo.ProtocolVer;
                     serverVersion   = serverInfo.ServerVer;

                     doConnect(ConnectOpt.Secured || serverInfo.ForceEncrypt);

                     MCServer.ipNode = ConnectOpt.host;
                 } else
                 if (Service.versionToInt(serverInfo.ServerVer) > Service.versionToInt(MCServer.ClientVersion)){
                     tryUpdateClient && tryUpdateClient(serverInfo);
                 } else {
                     Self.ServerToClientMultiCMD(CMD.sc_error, JSON.stringify({ "ErrNum" : 81, "Params" : [] }));
                 }
             }
         });
     }

     testAndConnect(ConnectOpt.host, ConnectOpt.port);

     // ===========================================================

     this.UsersInBuffer = new TInBufData(ConnectOpt.sessionID, ConnectOpt.isWs ? this.socketIO : null);

     this.UserInfo = ConnectOpt;

     this.updateUserInfo = function (info) {
         ConnectOpt = updateData(info);
     };

     this.RightSet = null;

     this.SendDataToServer = function (_data, CallBack){
         if (__socket && __socket.writable){
             if (_data && (_data !== "")){
                 console.log('Sending Data To Server: ' + _data, console.logLevel.L_Full);

                 process.nextTick(()=>{
                     __socket.write(Service.convertToEntities(_data));
                 });

                 if (CallBack){
                     CallBack.apply(Self);
                 }
             } else {
                 console.error('SendDataToServer. Nothing send to server, _data is empty');
             }
         }
     };
     
     this.CloseConnection = function(drop){
         let _id = ConnectOpt.sessionID;

         DropConnection(_id);

         if (Self.onDisconnect){
             Self.onDisconnect.call(Self);
         }

         Self.UsersInBuffer.ClearInBufData();

         if (__socket){
             try{
                 if (drop){
                     __socket.destroy();
                 } else {
                     __socket.end();
                 }
             } catch (e){}
         }

         __socket = null;

         console.important('Close socket with SessionID: ' + _id);
     };

     this.checkRights = function(rule){
         return this.RightSet[rule] && this.RightSet[rule] === '1';
     };

     this.ServerToClientMultiCMD = function(cmd, _data) {
         let res = false;

         if (Service.InObject(cmd, CMD)) {
             let out  = {};
             out[cmd] = _data;

             console.log('Received cmd: ' + cmd, console.logLevel.L_Extended);

             Self.UsersInBuffer.AddDataToInBuf(out);

             res = true;
         }

         return res;
     };

     this.onDisconnect = null;
 }

 function MakeClientConnection (options){
     ConnectionsList[options.sessionID] = new ClientConnect(options);

     return ConnectionsList[options.sessionID];
 }

 /**
 * @return {boolean}
 */
 function DropConnection (sID){
     if (ConnectionsList && ConnectionsList[sID]) {
         delete ConnectionsList[sID];

         console.important('Dropped connection from list, sID: ' + sID);
     }
 }

 function KILL_ALL_CONNECTION(drop){
     if (ConnectionsList){
         let cc = ConnectionsList;

         ConnectionsList = {};

         for (let i in cc){
             cc[i].CloseConnection(drop);
         }

         console.important('All connections was dropped!');
     }
 }

 /**
 * @return {boolean}
 */
 function HasConnection (id){
     return ConnectionsList && ConnectionsList.hasOwnProperty(id);
 }

 function GetConnection(id){
     return HasConnection(id) ? ConnectionsList[id] : null;
 }

 function GetConnectionInfo(id){
     let info = GetConnection(id);

     return (info) ? info.UserInfo : null;
 }

 function SendDataFromClient (id, CMD_numb, Data){
     if (HasConnection(id)){
         if (ClientToServCMD[CMD_numb]){
             if ((CMD_numb === CMD.cs_special_ping) && (ConnectionsList[id].UserInfo.CurrentPing < ConnectionsList[id].UserInfo.PingDelay)){
                 ConnectionsList[id].UserInfo.CurrentPing ++;

                 console.log('Skip cs_ping', console.logLevel.L_Full);
             } else {
                 if (Service.isString(Data)){
                    Data = Data.split(CR);
                 }

                 if (CMD_numb === CMD.cs_special_ping) {
                     ConnectionsList[id].UserInfo.CurrentPing = 1;
                 } else {
                     console.log('SendDataFromClient CMD:' + CMD_numb, console.logLevel.L_Extended);
                 }

                 if (!ConnectionsList[id].UserInfo.LoggedIn && CMD_numb === CMD.cs_special_ping){
                     return;
                 }

                 if (Data && Data.length > 0) {
                     Data.forEach(function(item, idx, arr){
                         arr[idx] = item === 'true' ? true : (item === 'false' ? false : item);
                     });
                 } else {
                     console.warn('CMD:' + CMD_numb + ' Client data is EMPTY!', console.logLevel.L_Full);
                 }

                 let _out = ClientToServCMD[CMD_numb].apply(GetConnection(id), Data);

                 if (CMD_numb !== CMD.cs_special_ping) {
                     console.log('SendDataFromClient CMD:' + CMD_numb + ' Data: ' + Data, console.logLevel.L_Extended);
                 } else {
                     console.log('SendDataFromClient CMD:' + CMD_numb + ' Data: ' + Data, console.logLevel.L_Full);
                 }

                 if (CMD_numb === CMD.cs_quit){
                     ConnectionsList[id].SendDataToServer(_out, function () {
                         setTimeout(() => this.CloseConnection(), 500);
                     });
                 } else {
                     ConnectionsList[id].SendDataToServer(_out);
                 }

             }
         } else {
             console.error('CMD numb at SendDataFromClient: ' + CMD_numb + ' is not defined! Add to ClientToServCMD list!');
         }
     } else {
         console.error('SendDataFromClient ID: ' + id + ' is not defined! CMD: ' + CMD_numb);
     }
 }

 function startSocketIO(IO){
    socketIO = IO;

    socketIO.on('connection', function(client){
        console.info('Someone connected. IP \"' + client.conn.remoteAddress + '\"', console.logLevel.L_Full);

        client.sendDataInternal = require('./mctools/mcInternalConnection').sendDataFromInternalServer;

        function send(data) {
            client.emit(SERVER_TO_CLIENT, data);
        }

        client.on(CLIENT_TO_SERVER, function(data){
            let reqData = Service.Get_CMD(data);

            wcc.UniversalParser.apply(client, [reqData.CMD, reqData.DATA, send, true]);
        });

        client.on('disconnect', function(){
            console.info('Someone disconnected. IP \"' + client.conn.remoteAddress + '\"', console.logLevel.L_Full);

            if (HasConnection(client.mcSessionID)){
                GetConnection(client.mcSessionID).CloseConnection();
            }
        });
    });
 }

 function checkUploadRights(id) {
     let res = false;

     if (ConnectionsList && ConnectionsList[id]) {
         res = ConnectionsList[id].checkRights(CMD.RS.QSendImages) ||
               ConnectionsList[id].checkRights(CMD.RS.QImagesPrivates);
     }

     return res;
 }

 function checkRightsByIds(id, rights) {
     let res = false;

     if (ConnectionsList && ConnectionsList[id] && rights.length) {
         rights.forEach(function(item){
             res = res || ConnectionsList[id].checkRights(item);
         });
     }

     return res;
 }

 function checkRightsByIdsStrict(id, rights) {
     let res = false;

     if (ConnectionsList && ConnectionsList[id] && rights.length) {
         rights.forEach(function(item){
             res = res && ConnectionsList[id].checkRights(item);
         });
     }

     return res;
 }

 function getFromErrorBuffer(sID){
     let res = {};

     if (errorBuffer && errorBuffer.hasOwnProperty(sID)){
         res = errorBuffer[sID];

         delete errorBuffer[sID];
     }

     return res;
 }

 function GetFirstSID(){
     return Object.keys(ConnectionsList)[0] || null;
 }

 function isAdminSid(sid, uin) {
     let user = GetConnectionInfo(sid);

     return user && user.ClientType === CMD.ClientType.WEB_ADMIN && user.UIN == uin;
 }

 // =======================================================
 // =======================================================
 
 exports.MakeClientConnection = MakeClientConnection; 
 exports.HasConnection        = HasConnection;
 exports.GetConnection        = GetConnection;
 exports.SendDataToServer     = SendDataFromClient;
 exports.isAdminSid           = isAdminSid;
 exports.CMD                  = CMD;
 exports.KILL_ALL_CONNECTION  = KILL_ALL_CONNECTION;
 exports.getPenaltyUser       = _serverCMD.getPenaltyUser;
 exports.startSocketIO        = startSocketIO;
 exports.updateUserInfo       = function (sID, data) {
     if (HasConnection(sID)){
         GetConnection(sID).updateUserInfo(data);
     }
 };

 // =======================================================

 exports.firstLogin           = _serverCMD.firstLogin;
 exports.httpStarted          = function () {
     wcc = _serverCMD.httpStarted();
 };
 exports.checkUploadRights    = checkUploadRights;
 exports.checkRightsByIds     = checkRightsByIds;
 exports.checkRightsByIdsStrict = checkRightsByIdsStrict;
 exports.getFromErrorBuffer   = getFromErrorBuffer;
 exports.GetFirstSID          = GetFirstSID;
 exports.tryUpdateClient      = function (_tryUpdateClient){
     tryUpdateClient = _tryUpdateClient;
 };
 exports.clientInformation    = function () {
     return clientInfo;
 };
 exports.directSendElectronClient = function (ff) {
     directSendElectronClient = ff;
 };

 exports.setHardwareID        = function (hwid) {
     hardwareID = hwid;
 };
