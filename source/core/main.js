 'use strict';

 const electron       = require('electron');
 const console        = require('gifer-console');
 // const domainRequire  = require('domain').create();

 // console.SetLogLevel(-1); // best for release -1 or L_noLog
 console.SetLogLevel(console.logLevel.L_Normal);

 global.__dirname = __dirname;

 const app            = electron.app;
 const ipc            = electron.ipcMain;
 const BrowserWindow  = electron.BrowserWindow;
 const globalShortcut = electron.globalShortcut;
 const protocol       = electron.protocol;

 const sendDataToServer= require('./service/web_client_connect.js').UniversalParser;
 const Service         = require('./service/service.js');
 const DbWork          = require('./service/dbwork');
 const Profile         = require('./service/profile');
 const clientUpdate    = require('./service/clientUpdate').updateDB;
 const mcconnect       = require('./service/mcconnect');
 const CMD             = mcconnect.CMD;

 let hotKeys         = {
     showWindow: {
         key: "Super+F12",
         handle: null
     }
 };
 let electronCMD     = {};
 let mainWindow      = null;

 // ===== debug mod ========================================

 app.commandLine.appendSwitch('ignore-certificate-errors');
 // app.commandLine.appendSwitch('remote-debugging-port', '8315');
 // app.commandLine.appendSwitch('host-rules', 'MAP * 127.0.0.1');

 // ========================================================

 app.on('ready', function() {
     Profile.init(__dirname);

     process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;

     console.DublicateToFile(Profile.getProfilePath() + "/logs/" + (new Date()).myFormat('yyyy') + "/" + (new Date()).myFormat('mm') + "/" + (new Date()).myFormat('dd') + "/node.log");

     Profile.testProfile();

     console.log("======================================================");
     console.log("================ START CLIENT ========================");
     console.log("======================================================");

     mainWindow = new BrowserWindow({
         frame : true,
         autoHideMenuBar: true,
         height: 600,
         width : 1000,
         show  : false,
         webPreferences: {
             nodeIntegration: true,
         },
         icon  : `${__dirname}/client/modules/images/256x256.png`
     });

     app.closeNow = true;

     const updatePath = Profile.getProfilePath() + "/updates/";
     const updateTemp = updatePath + "temp/";

     Service.checkDir(updateTemp);

     console.log(process.argv.join(','));

     new Promise(function (resolve) { // check update
         if (process.argv.indexOf(CMD.updateConsoleCMD) !== -1 && process.argv.indexOf(CMD.normalStart) === -1){
             console.log("================= UPDATING ===========================");
             console.log("======================================================");

             const os = require('os');

             let dest = "";
             let arc  = "";

             switch (os.platform()) {
                 case "darwin":
                     dest = Service.ExtractPath(process.argv[0]).replace("MacOS", "Resources");
                     arc  = "rsMac.zip";
                 break;

                 case "linux":
                     dest = Service.ExtractPath(process.argv[0]) + "/resources/";
                     arc  = "rsLinux." + os.arch() + ".zip";
                 break;

                 case "win32":
                     dest = Service.ExtractPath(process.argv[0]) + "/resources/";
                     arc  = "rsWin.zip";
                 break;
             }

             const zip  = new require('adm-zip')(updatePath + arc);
             const copy = require('./service/tools/copy').copy;

             process.noAsar = true;

             zip.extractAllTo(updateTemp, true);

             copy(updateTemp + "/app/", dest + "/app/", function () {
                 process.noAsar = false;

                 app.relaunch();

                 global.isBrodcast = false;
                 
                 app.closeNow = true;

                 mainWindow.close();
             });
         } else {
             resolve();
         }
     })
     .then(function (){
         protocol.registerHttpProtocol('mychat', (request, callback) => {
             const url = request.url.substr(7);

             callback({path: path.normalize(`${__dirname}/${url}`)})
         }, (error) => {
             if (error) console.error('Failed to register protocol')
         });

         console.log('Connecting DB');

         return DbWork.Init(Profile.getProfilePath() + '/db/main.db'); // second param it is enable debug log level
     })
     .then(DbWork.connect)
     .then(clientUpdate)
     .then(function () {
         mcconnect.tryUpdateClient(tryUpdateClient);

         mainWindow.loadURL(`file://${__dirname}/client/index.html`);
         mainWindow.webContents.session.clearCache(function () { });

         if (globalShortcut.isRegistered(hotKeys.showWindow.key)) {
             console.log('Super+F12 is busy');
         } else {
             try{
                 hotKeys.showWindow.handle = globalShortcut.register(hotKeys.showWindow.key, () => {
                     showAndFocus();
                 });

                 console.log('Super+F12 is passed!');
             } catch (e){
                 console.error(e.message);
             }
         }

         mainWindow.once('ready-to-show', () => {
             if (process.argv.indexOf('/debugWnd') >= 0) {
                 mainWindow.webContents.openDevTools();
             }

             mainWindow.show();

             electronCMD = require("./service/electronCMD")(electron, app, mainWindow, DbWork, Profile);
         });
     })
     .then(function () {
         electron.powerMonitor.on('suspend', () => {
             console.log('The system is going to sleep!');

             if (ipc) {
                 let connection = mcconnect.GetConnection(mcconnect.GetFirstSID());

                 if (connection){
                     console.important('Send "Quit" to server');

                     mainWindow.webContents.send('ec_CMD', [
                         CMD.ec_system_suspend
                     ]);

                     connection.SendDataToServer('\u0017\u0006' + CMD.cs_quit + '00\r\n');

                     setTimeout(() => mainWindow.webContents.send('ec_CMD', [
                         CMD.ec_drop_connect
                     ]), 100);
                 }
             }
         });

         electron.powerMonitor.on('resume', () => {
             console.log('The system wake up!');

             mainWindow.webContents.send('ec_CMD', [
                 CMD.ec_system_resume
             ]);
         });

     })
     .catch(function (err) {
         if (err) {
             console.error(err.stack || err.message || err);
         }
     });

     mainWindow.on('close', function (e) {
         if (global.isBrodcast){
             e.preventDefault();
             e.returnValue = false
         } else
             
         if (!app.closeNow){
             mainWindow.blur();

             e.preventDefault();

             mainWindow.hide();

             // mainWindow = null;
         }
     });

     mainWindow.on('minimize', function (e) {
         if (global.isBrodcast){
             mainWindow.show();

             e.preventDefault();
             e.returnValue = false
         }
     });

     mainWindow.on('closed', function () {
         if (app.closeNow){
             mainWindow = null;

             DbWork.close();

             globalShortcut.unregisterAll();

             app.quit();
         }
     });

     mainWindow.on('focus', function () {
         if (ipc && mainWindow && !mainWindow.isDestroyed()){
             mainWindow.webContents.send('ec_CMD', [
                 CMD.ec_mainWindowFocused
             ]);
         }
     });

     mainWindow.on('blur', function () {
         if (ipc && mainWindow && !mainWindow.isDestroyed()){
             mainWindow.webContents.send('ec_CMD', [
                 CMD.ec_mainWindowBlur
             ]);
         }
     });

     // mainWindow.on('hide', function () {
     //
     // });

     mainWindow.on('show', function () {
         if (ipc && mainWindow && !mainWindow.isDestroyed()){
             mainWindow.webContents.send('ec_CMD', [
                 CMD.ec_mainWindowFocused
             ]);
         }
     });
 });

 function tryUpdateClient(serverInfo) {
     if (mainWindow && !mainWindow.isDestroyed()){
         mainWindow.webContents.send('ec_CMD', [
             CMD.ec_download_update,
             serverInfo
         ]);
     }
 }

 function showAndFocus() {
     if (mainWindow && !mainWindow.isDestroyed()){
         mainWindow.show();
         mainWindow.focus();
     }
 }

 app.on('window-all-closed', () => {
     //app.quit();
 });

 app.on('activate-with-no-open-windows', showAndFocus);

 app.on('activate', showAndFocus);

 ipc.on('csPostParser', function(res, data){
     let reqData = Service.Get_CMD(data);

    sendDataToServer.apply({}, [reqData.CMD, reqData.DATA, function(outData){
        if (res){
            res.sender.send('scPostParser', outData); // mainWindow.webContents
        }
    }]);
 });

 ipc.on('ce_CMD', function parse_CE_CMD (res, data) {
     let cmd = data.shift();

     if (electronCMD.hasOwnProperty(cmd)){
         electronCMD[cmd](data, res);
     } else {
         console.error('Unknown CMD: ' + cmd);
     }
 });

/* process.on('uncaughtException', function (err) {
     console.immediately("FATAL - " + err.message + '\n');
     console.immediately(err.stack + '\n');

     console.error("FATAL - " + err.message + '\n');
     console.error(err.stack + '\n');

     setTimeout(function () {
         process.exit(700);
     }, 40);
 });*/
