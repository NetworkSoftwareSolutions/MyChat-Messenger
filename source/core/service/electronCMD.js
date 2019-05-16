/**
 * Created by Gifer on 07.08.2016.
 */

"use strict";

module.exports = function (electron, app, mainWindow, DbWork, Profile) {
    const mcconnect         = require('./mcconnect');
    const CMD               = mcconnect.CMD;
    const GetFirstSID       = mcconnect.GetFirstSID;
    const clientInformation = mcconnect.clientInformation;

    const remoteWnd         = electron.BrowserWindow;
    const clipboard         = electron.clipboard;

    const Service           = require('./service');
    const console           = require('gifer-console');
    const Tray              = require('./tray');
    const os                = require('os');
    const fs                = require('fs');
    const urlParse          = require('url');
                                                   
    const child             = require('child_process').execFile;
    const eNotify           = require('electron-notify');
    const sendDataToServer  = require('./web_client_connect.js').UniversalParser;
    const serverHWID        = require('./serverCMD').getServerHWID;
    const McFtpClient       = require('./mcFtpClient');
    const directReceiveFile = require('./mcFtpServer');
    const downloadFile      = require('./tools/downloadFile')    (electron.dialog, mainWindow);
    const uploadFile        = require('./tools/uploadFile')      (electron.dialog, mainWindow);
    const directUploadFile  = require('./tools/directUploadFile')(electron.dialog, mainWindow);
    const parsePath         = require('path');
    const HOME_DIR          = Service.HOME_DIR;

    const ALLOK             = 'all ok';
    const CR                = '\r';
    const TERMINATOR        = "\u2022";
    const oneDay            = 1000*60*60*24;

    let getFileFromClipboard= null;
    let ftpConnect          = null;
    let LMSG                = null;
    let ErrorsText          = null;
    let ipList              = {};
    let commands            = {};
    let ClientSettings      = {};
    let idxInc              = 0;
    let __                  = "***";
    let previewWin          = null;

    try {
        getFileFromClipboard = require('./addons/clipboard/getClipboardFileList_' + os.platform() + '.node').GetFileFromClipboard;
    } catch (e){}

    mcconnect.directSendElectronClient(function (data) {
        if (mainWindow && !mainWindow.isDestroyed()){
            mainWindow.webContents.send('sc_CMD', data);
        }
    });

    Tray.init(electron);

    Tray.setEvent('click', () => {
        showProgram();
    });

    // =========================================================

    function _prepare() {
        new Promise(function (resolve) {
            resolve();
        })

        // === Mac top menu ===
        .then(function () {
            if (process.platform === 'darwin') {
                let _menu   = electron.Menu;
                let osxMenu = _menu.buildFromTemplate([
                    {
                        label: "Application",
                        submenu: [
                            { label: "About MyChat Client", selector: "orderFrontStandardAboutPanel:" },
                            { type: "separator" },
                            { label: "Quit", accelerator: "Command+Q", click: function() {
                                // app.quit();
                                closeProgram();
                            }}
                        ]
                    },

                    {
                        label: "Edit",
                        submenu: [
                            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
                            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
                            { type: "separator" },
                            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
                            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
                        ]
                    }
                ]);

                _menu.setApplicationMenu(osxMenu);
            }
        })

        // === Get Settings ===
        .then(function () {
            return DbWork.do.system.getAllSettings();
        })
        .then(function ([settings]) {
            ClientSettings                 = Service.MargeObj(ClientSettings, settings);
            ClientSettings.client_settings = JSON.parse(ClientSettings.client_settings);

            if (!ClientSettings.client_settings.SendFilesInputFilesDir || ClientSettings.client_settings.SendFilesInputFilesDir.indexOf("%s") !== -1){
                ClientSettings.client_settings.SendFilesInputFilesDir = "";
            }

            if (!ClientSettings.download_folder || ClientSettings.download_folder.indexOf("%s") !== -1){
                ClientSettings.download_folder = "";
            }

            ClientSettings.webPath = {
                AliasAdmin    : "admin",  // папка-псевдоним, путь к админке
                AliasAPI      : "API",    // папка-псевдоним, путь к Integration API
                AliasChat     : "chat",   // папка-псевдоним, путь к WEB-чату
                AliasFiles    : "files",  // папка-псевдоним, путь к файлам, залитым на сервер
                AliasForum    : "forum",  // папка-псевдоним, путь ко встроенному форуму
                AliasKanban   : "kanban", // папка-псевдоним, путь к канбан-доске

                LobbyEnable   : true, // включен доступ к списку сервисов MyChat
                ForumEnable   : true, // включить доступ ко встроенному форуму
                KanbanEnable  : true, // включить доступ к канбан-доске
                ChatEnable    : true, // включить доступ к WEB-чату
                AdminEnable   : true  // включить доступ к WEB-админке
            };

            __ = "&N*t^TN978N*7m&0a_8my87N))^*trr3eQZ2#CDVb79nm<JK>_Pl.,09UMynhn7BVd";
        })

        // === Get HardwareID ===
        .then(function () {
            return DbWork.do.system.hardwareID.get();
        })
        .then(function ([hwid]) {
            if (!hwid || !hwid.hardware_id){
                return new Promise(function (resolve) {
                    Service.getHardwareID(function (newHwid) {
                        ClientSettings.hardware_id = newHwid;

                        console.log('Hardware ID:' + ClientSettings.hardware_id);

                        mcconnect.setHardwareID(ClientSettings.hardware_id);

                        resolve(newHwid);
                    });
                });
            } else {
                console.log('Hardware ID:' + hwid.hardware_id);

                mcconnect.setHardwareID(hwid.hardware_id);
            }
        })
        .then(function (hardware_id) {
            hardware_id ? DbWork.do.system.hardwareID.set(hardware_id) : null;
        })

        // === Set Download Folder ===
        .then(function () {
            return DbWork.do.system.downloadFolder.get();
        })
        .then(function ([path]) {
            ClientSettings.client_settings.SendFilesInputFilesDir =
            ClientSettings.download_folder = (
                ClientSettings.client_settings.SendFilesInputFilesDir ||
                path.download_folder ||
                (os.homedir() + HOME_DIR)
            ).replace(/\\/g, "/");
        })
        .then(function () {
            return createDefaultDownloadFolder();
        })

        // === Start FTP Server ===
        // .then(startFtpServer)     FTP запускается при сохранении ID сервера после подключения, в этот момент сохраняется весь шаблон настроек

        // === GeneralMainWindow ===
        .then(function () {
            console.log("Set default folder: " + ClientSettings.download_folder);
                        
            if (ClientSettings.autoconnect){
                switch (ClientSettings.client_settings.GeneralMainWindow){
                    case "1":
                        hideProgram();
                    break;

                    case "2":
                        maximizeMinimize([true]);
                    break;
                }
            }
        })

        // ========================
        // .then(function () {
        //     modalWindow = new remoteWnd({
        //         autoHideMenuBar: true,
        //         alwaysOnTop    : false,
        //         frame : false,
        //         height: 200,
        //         width : 500,
        //         show  : true,
        //         icon  : `${global.__dirname}/client/modules/images/256x256.png`
        //     });
        //
        //     modalWindow.loadURL(`file://${global.__dirname}/client/modalWindow/modalWindow.html`);
        //     modalWindow.show();
        //     modalWindow.webContents.openDevTools();
        // })

        // === Catch Any Errors ===
        .catch(function (err) {
            if (err) {
                console.error(err.stack || err.message || err);
            }
        });
    }

    function _prepareContext() {
        require('electron-context-menu').init({
            window: mainWindow,
            download: downloadImage
        });
    }

    _prepare();

    _prepareContext();

    // =========================================================

    function startFtpServer() {
        return new Promise(function () {
            let port  = 10000;
            let range = 100;

            if (ClientSettings.client_settings.SendFilesRandomPorts !== undefined){
                if (ClientSettings.client_settings.SendFilesRandomPorts){
                    try{
                        port  = parseInt(ClientSettings.client_settings.SendFilesRandomPortStart);
                    } catch (e) {}
                    try{
                        range = parseInt(ClientSettings.client_settings.SendFilesRandomPortEnd) - parseInt(ClientSettings.client_settings.SendFilesRandomPortStart);
                    } catch (e) {}
                } else {
                    try {
                        port  = parseInt(ClientSettings.client_settings.SendFilesBasePort);
                    } catch (e) {}
                    try {
                        range = parseInt(ClientSettings.client_settings.SendFilesDataPort) - parseInt(ClientSettings.client_settings.SendFilesBasePort);
                    } catch (e) {}
                }
            }

            console.log('Start FTP server on ' + (ClientSettings.client_settings.SendFilesRandomPorts ? "dynamics" : "fixed") + " ports: " + port + '-' + (port + range));

            Service.isPortBusy(port, function (newPort) {
                port = newPort;

                directReceiveFile.start({
                    startPort   : port,
                    endPort     : port + range
                });
            }, function (port, err) {
                console.err("Testing on port: " + port + " failed.\nError: " + err.message);
            }, 500);
        });
    }

    function createDefaultDownloadFolder() {
        return new Promise(function (resolve, reject) {
            if (!ClientSettings.download_folder) {
                ClientSettings.client_settings.SendFilesInputFilesDir
                    = ClientSettings.download_folder
                    = (ClientSettings.client_settings.SendFilesInputFilesDir || (os.homedir() + HOME_DIR)).replace(/\\/g, "/");
            }
            
            fs.stat(ClientSettings.download_folder || "", function (err) {
                if (err){
                    switch (err.code){
                        case "EEXIST":
                            DbWork.do.system.downloadFolder.set(ClientSettings.download_folder);

                            resolve(ClientSettings.download_folder);
                        break;

                        case "ENOENT":
                            fs.mkdir(os.homedir() + "/Documents/", function (err) {
                                if (err){
                                    reject(err.message);
                                } else {
                                    try {
                                        fs.mkdirSync(ClientSettings.download_folder);

                                        DbWork.do.system.downloadFolder.set(ClientSettings.download_folder);
                                    } catch (e){
                                        reject(e.message);
                                    }
                                }
                            });
                        break;
                    }
                } else {
                    DbWork.do.system.downloadFolder.set(ClientSettings.download_folder);

                    resolve(ClientSettings.download_folder);
                }
            });
        });
    }

    function mcLang(id, items, term){
        var res = LMSG[id.toString()];

        return (items) ? Service.myReplace(res, items, term) : res;
    }

    function mcError(id, items, term){
        let res = ErrorsText[id.toString()];

        return (items) ? Service.myReplace(res, items, term) : res;
    }

    function findIdx(ipOrId, port) {
        let ID = null;

        for (let id in ipList){
            if ((ipList[id].ServHost == ipOrId && ipList[id].Port == port) || (!port && ipList[id].ServerID == ipOrId)) {
                ID = id;

                break;
            }
        }

        return ID;
    }

    function getServerID(ID) {
        for (let id in ipList){
            if (ipList[id].ID === ID) {
                return ipList[id].ServerID || null;
            }
        }

        return null;
    }

    function closeProgram() {
        global.isBrodcast = false;

        app.closeNow = true;

        mainWindow.close();
    }

    function relaunch() {
        console.immediately("=============== RESTART FOR UPDATE ===================");

        app.relaunch({args: process.argv.slice(1).concat([CMD.updateConsoleCMD])});

        setTimeout(closeProgram, 500);
    }

    function hideProgram() {
        app.closeNow = false;

        mainWindow.close();
    }

    function showProgram(noFocus) {
        if (mainWindow && !mainWindow.isDestroyed()){
            mainWindow.show();
            
            if (!noFocus) {
                mainWindow.focus();
            }
        }
    }

    function ec_send_error(cmd, params) {
        if (mainWindow && !mainWindow.isDestroyed()){
            mainWindow.webContents.send('ec_CMD', [
                CMD.ec_error,
                {
                    code: cmd,
                    msg: mcError(cmd, params || [])
                }
            ]);
        }
    }

    function sendComplete(cmd) {
        mainWindow.webContents.send('ec_CMD', [
            CMD.ec_complete_command,
            {
                Cmd: cmd
            }
        ]);
    }

    function checkIsServerURL(url) {
        return Service.MCServer.HTTPS && Service.MCServer.PortNode == 443
            ? (url.toLowerCase().indexOf('https://' + Service.MCServer.ipNode /*+ ':' + Service.MCServer.PortNode*/) === 0) ||
              (url.toLowerCase().indexOf('https://' + Service.MCServer.ipNode) === 0)
            : (!Service.MCServer.HTTPS && Service.MCServer.PortNode == 80
                ? (url.toLowerCase().indexOf('http://' + Service.MCServer.ipNode /*+ ':' + Service.MCServer.PortNode*/) === 0) ||
                  (url.toLowerCase().indexOf('http://' + Service.MCServer.ipNode) === 0)
                : url.toLowerCase().indexOf('http' + (Service.MCServer.HTTPS ? 's' : '') + '://' + Service.MCServer.ipNode /*+ ':' + Service.MCServer.PortNode*/) === 0
              )
        ;
    }

    function downloadImage (url) {
        if (!previewWin){
            _prepareContext();
            
            previewWin = mainWindow;
        }

        let dwnld = require('./tools/downloadFile')(electron.dialog, previewWin);

        dwnld.openDialogDownload("", decodeURI(Service.ExtractFileName(url)))
            .then(function (path) {
                return downloadFile.download(url, path, ec_send_error);
            })
                  .catch(function (err) {
                if (err && err !== ALLOK) {
                    console.error(err.stack || err.message || err);
                }
            })
        ;
    }

    function displayImage(url) {
        previewWin = new remoteWnd({
            toolbar: false,
            autoHideMenuBar: true,
            frame : true,
            title : Service.ExtractFileName(url),
            icon  : Profile.getProfilePath() + '/images/256x256.png'
        });

        require('electron-context-menu').init({
            window: previewWin,
            download: downloadImage
        });

        previewWin.loadURL(url);
        previewWin.maximize();
        previewWin.show();

        previewWin.webContents.executeJavaScript(`
            var body = document.getElementsByTagName('body')[0];
            body.onkeydown = function(e){
                if (e.keyCode === 27){
                    window.close();
                }
            };
        `);

        previewWin.on('closed', () => previewWin = null );
    }

    function handleRedirect (e, url) {
        if (url !== (this || mainWindow).webContents.getURL()) {
            if (e){
                e.preventDefault();
            }

            let myServer = 'http' + (Service.MCServer.HTTPS ? 's' : '') + '://' + Service.MCServer.ipNode
                + (Service.MCServer.HTTPS
                    ? (Service.MCServer.PortNode != 443 || url.indexOf(':443/') > 0 ? ':' + Service.MCServer.PortNode : '')
                    : (Service.MCServer.PortNode != 80  || url.indexOf(':80/')  > 0 ? ':' + Service.MCServer.PortNode : ''));

            if (checkIsServerURL(url)){
                url = myServer + urlParse.parse(url).pathname + (urlParse.parse(url).search || urlParse.parse(url).hash || "");

                if (url.indexOf(myServer + '/' + ClientSettings.webPath.AliasKanban + '/') === 0){
                    mainWindow.webContents.send('ec_CMD', [
                        CMD.ec_open_local_kanban,
                        url
                    ]);
                } else

                if (url.indexOf("/loadimg.gif") !== -1  || (url.indexOf(myServer + '/' + ClientSettings.webPath.AliasFiles + '/') === 0 && [".html", ".htm", ".css", ".php"].indexOf(parsePath.extname(url).toLowerCase()) !== -1)) {
                    // --- Lock a Download Link Event ---
                    // --- For Downloading Use "ce_file_open_or_download" or "ce_file_download_url" Events ---
                } else
                if (url.indexOf('/nofile.gif') === -1 && [".png", ".gif", ".jpeg", ".jpg", ".bmp", ".psd"].indexOf(parsePath.extname(url.toLowerCase())) !== -1){
                    displayImage(url);
                }
            } else

            if ((url.toLowerCase().indexOf("ftp") === 0) && os.platform() === "win32"){
                child("explorer.exe", [url], function(err) {
                    if (err && err.code !== 1){
                        console.log(err);
                    }
                });
            } else {
                if (url.indexOf("local://") === 0){
                    if (os.platform() === "win32") {
                        url = url.replace("local://", "\\\\").replace(/\//g, "\\");
                    } else {
                        url = url.replace("local://", "smb://");
                    }

                    electron.shell.openExternal(Service.ExtractPath(url));
                } else {
                    electron.shell.openExternal(url);
                }
            }
        }
    }

    function getDownloadFolder(servId, fileInfo) {
        // === Get Download Folder For User ===
        return  fileInfo.downloadUpdate
            ? new Promise(function (resolve) {
                let updatePath = "";

                switch (os.platform()) {
                    case "darwin":
                        updatePath += "/updates/rsMac.zip";
                    break;

                    case "linux":
                        updatePath += "/updates/rsLinux." + os.arch() + ".zip";
                    break;

                    case "win32":
                        updatePath += "/updates/rsWin.zip";
                    break;
                }

                resolve(Profile.getProfilePath() + updatePath);
            })
            : DbWork.do.userPath.get(servId, ClientSettings.uin, fileInfo.uin)
                .then(function ([info]) {
                    return new Promise(function (resolve) {
                        let pathInfo = null;

                        if (info) {
                            try {
                                pathInfo = fs.statSync(info.path);
                            } catch (err) {
                                console.err(err.message);
                            }
                        }

                        if (pathInfo) {
                            resolve(info.path);
                        } else {
                            resolve();
                        }
                    });
                })

        .then(function (userFolder) {
            return userFolder
                ? userFolder
                : createDefaultDownloadFolder()
                    .then(function () {
                        return new Promise(function (resolve, reject) {
                            let userFolder = ClientSettings.download_folder + fileInfo.uin + " - " + (fileInfo.displayName || "") + "/";

                            fs.mkdir(userFolder, function (err) {
                                if (err && err.code !== "EEXIST"){
                                    reject(err.message);
                                } else {
                                    resolve(userFolder);
                                }
                            });
                        });
                    })
                ;
        })
        .catch(function (err) {
            if (err && err !== ALLOK) {
                console.error(err.stack || err.message || err);
            }
        });
    }

    function download(url, fileInfo, auto) { // --- If "auto=true" Then Save Dialog Wasn't Show ---
        let servId = getMyServerID();

        return getDownloadFolder(servId, fileInfo)

            // === Open Download Dialog ===
            .then(function (path) {
                return auto ? path : downloadFile.openDialogDownload(path || "", Service.ExtractFileName(fileInfo && fileInfo.filePath ? fileInfo.filePath : url));
            })

            // === Save a New Download Folder For User ===
            .then(function (path) {
                return new Promise(function (resolve, reject) {
                    if (path){
                        if (fileInfo && !fileInfo.downloadUpdate) {
                            DbWork.do.userPath.set(servId, ClientSettings.uin, fileInfo.uin, Service.ExtractPath(path));
                        }

                        resolve(path);
                    } else {
                        reject(ALLOK); // -- Close Save Dialog Without Saving --
                    }
                });
            })

            // === Start Download ===
            .then(function (path) {
                if (fileInfo.downloadUpdate){
                    switch (os.platform()) {
                        case "darwin":
                            url += "/updates/rsMac.zip";
                        break;

                        case "linux":
                            url += "/updates/rsLinux." + os.arch() + ".zip";
                        break;

                        case "win32":
                            url += "/updates/rsWin.zip";
                        break;
                    }

                    console.log("Now download: " + os.platform() + " " + url);
                }

                return downloadFile.download(url, path, ec_send_error);
            })

            // === Save a File Download Info ===
            .then(function ([path, finalHash, totalLength]) {
                if (!fileInfo.downloadUpdate && fileInfo.hash){
                    DbWork.do.userFiles.set(servId, ClientSettings.uin, fileInfo.hash, fileInfo.fileDT, path);

                    if (finalHash !== fileInfo.hash){
                        console.error('Hash not match, file size: ' + totalLength);
                    }
                }
            })
            .catch(function (err) {
                if (err && err !== ALLOK) {
                    console.error(err.stack || err.message || err);
                }
            })
        ;
    }

    function getMyServerID() {
        let id = ClientSettings.client_settings ? Service.StringToObj(ClientSettings.client_settings).ServID : null;

        if (!id){
            console.error('Server ID is null!');
        }

        return id;
    }

    function sortAB (a,b){
        return (a > b) ? 1 : ((a < b) ? -1 : 0);
    }

    function checkLogFile(dtFrom, dtTo, cb, list) {
        let currentDT = new Date(dtFrom);
        let filePath  = "";

        try {
            filePath = Profile.getProfilePath() + "/logs/" + Service.formatDate(currentDT, "yyyy/mm/dd/") + "node.log";
        } catch (e){}

        if (!list){
            list = {};
        }

        if (filePath){
            fs.stat(filePath, function (err) {
                if (!err){
                    list[dtFrom] = Service.loadFileSync(filePath).toString();
                }

                if (dtFrom < dtTo){
                    checkLogFile(dtFrom + oneDay, dtTo, cb, list);
                } else {
                    cb(list);
                }
            });
        }
    }

    function maximizeMinimize([maximize]) {
        if (maximize === true || !mainWindow.isMaximized()){
            mainWindow.maximize();
        } else {
            mainWindow.unmaximize();
        }
    }

    function kioskMode([value]) {
        mainWindow.setKiosk(value);
    }

    // =========================================================

    mainWindow.webContents.on('will-navigate', handleRedirect);
    mainWindow.webContents.on('new-window', handleRedirect);

    // =========================================================

    commands[CMD.ce_restart_client] = relaunch;

    commands[CMD.ce_set_language] = function ([lang]) { // data, res
        Service.LoadJSONFile(`${MCPathes.Modules}electrontextsource/${lang}.errors.json`, function (data) {
            ErrorsText = Service.StringToObj(data);
        });

        Service.LoadJSONFile(`${MCPathes.Modules}electrontextsource/${lang}.system.json`, function (data) {
            LMSG = Service.StringToObj(data);

            let menu = [
                { label: mcLang(3), click: function () { //  "3":"Открыть MyChat"
                    showProgram();
                }},
                { label: mcLang(2), click: function () { // "2":"Сменить пользователя",
                    mainWindow.reload(); //todo: remake
                }},
                { label: mcLang(1), click: function () { // "1":"Выйти из MyChat",
                    let sID = GetFirstSID();

                    if (sID){
                        sendDataToServer(CMD.cs_quit, sID);
                    }

                    closeProgram();
                }}
                /*,{ label: "DevTools", click: function () {
                    mainWindow.webContents.openDevTools();
                }}*/
            ];

            Tray.trayMenu(menu);
        });
    };

    commands[CMD.ce_show_notify] = function ([title, text, itemID]) { // data, res
        if (!mainWindow.isFocused() || !mainWindow.isVisible()){
            if (ClientSettings.client_settings.EventsShowPopupTrayWindow){
                eNotify.closeAll();

                eNotify.setConfig({
                    appIcon: global.__dirname + '/client/source/images/75x75.png',
                    displayTime: 9000
                });

                eNotify.notify({
                    title,
                    text,
                    handleRedirect,
                    displayTime: ClientSettings.client_settings.EventsTrayDontHide ? -1 : (ClientSettings.client_settings.EventsTrayWindowDuration * 1000),
                    onClickFunc: function (ntfy) {
                        mainWindow.webContents.send('ec_CMD', [
                            CMD.ec_open_dialog,
                            { itemID }
                        ]);

                        ntfy.closeNotification();

                        if (!mainWindow.isVisible()){
                            mainWindow.show();
                        }

                        mainWindow.focus();
                    }
                });
            }

            if (!Tray.isBlinking() && ClientSettings.client_settings.EventsTrayBlinkOnTaskBar) {
                Tray.blinkPost();
                
                mainWindow.flashFrame(true);
            }
        }
    };

    commands[CMD.ce_quit_from_program] = function () { // data, res
        closeProgram();
    };

    commands[CMD.ce_hide_program] = function () { // data, res
        hideProgram();
    };

    commands[CMD.ce_hide_or_close_by_x] = function ([what]) { // data, res
        app.closeNow = what;
    };

    commands[CMD.ce_get_client_settings] = function () {
        mainWindow.webContents.send('ec_CMD', [
            CMD.ec_get_client_settings,
            ClientSettings
        ]);
    };

    commands[CMD.ce_save_autoconnect_server] = function ([pwd, rm, srvpwd, uin, nick]) {
        DbWork.do.system.savePrvPwd(Service.Encrypt(__, pwd || ""), rm, Service.Encrypt(__, srvpwd || ""), uin, nick)
            .then(function () {
                ClientSettings.uin = uin;
                
                sendComplete(CMD.ce_save_autoconnect_server);
            })
            .catch(function (err) {
                if (err) console.err(err.stack || err.message || err);
            });
    };

    commands[CMD.ce_load_autoconnect_server] = function () { // data, res
        DbWork.do.system.loadPrvPwd()
            .then(function ([info]) {
                try{
                    info.pwd    = Service.Decrypt(__, info.pwd);
                    info.srvpwd = Service.Decrypt(__, info.srvpwd);
                } catch (e){
                    commands[CMD.ce_save_autoconnect_server](info.pwd, info.autoconnect, info.srvpwd, info.uin, info.nick);
                }
                
                mainWindow.webContents.send('ec_CMD', [
                    CMD.ec_load_autoconnect_server,
                    info
                ]);
            })
            .catch(function (err) {
                if (err) console.err(err.stack || err.message || err);
            });
    };

    commands[CMD.ce_set_client_settings] = function ([client_settings]) { // todo: добавить дополнительные проверки
        let data = Service.isString(client_settings) ? Service.convertToEntities(client_settings) : Service.convertToEntities(JSON.stringify(client_settings));

        ClientSettings.client_settings = Service.MargeObj(ClientSettings.client_settings, client_settings);
        ClientSettings.settings_crc32  = ClientSettings.client_settings.CRC32;
        ClientSettings.download_folder
            = ClientSettings.client_settings.SendFilesInputFilesDir
            = ClientSettings.client_settings.SendFilesInputFilesDir.replace(/\\/g, "/");

        DbWork.do.system.setClientSettings(data)
            .then(function () {
                return DbWork.do.system.downloadFolder.set(ClientSettings.download_folder);
            })
            .then(function () {
                return sendComplete(CMD.ce_set_client_settings);
            })
            .then(function () {
                return DbWork.do.system.setSettingsCRC32(ClientSettings.settings_crc32);
            })
            .then(function () {
                directReceiveFile.stop();
                
                startFtpServer();
            })
            .catch(function (err) {
                if (err) console.err(err.stack || err.message || err);
            });
    };

    commands[CMD.ce_get_server_list] = function () { // data, res
        Promise.all([
            // 1 load ip's from db
            DbWork.do.servers.getList()
                .then(function (dbServers) {
                    dbServers.forEach(function (srv) {
                        let ID = findIdx(srv.IP, srv.port) || (Service.RandomHash(5) + idxInc++);

                        ipList[ID] = {
                            ID       : ID,            // уникальный идентификатор для списка в интерфейсе
                            ServerID : srv.rowid,
                            ServHost : srv.IP,
                            Port     : srv.port,
                            ServName : srv.name,
                            ServDesc : srv.description,
                            ServPass : srv.pwd,
                            Secured  : srv.secure
                        }
                    });
                }),

            // 2 get ip's list
            Service.getNetworkInterfacesList().map(function (myIP) {
                //console.log(">" + myIP);

                return new Promise(resolve => {
                    // 3 search mychat servers
                    Service.findMyChatServer(myIP, function (serverInfo, serverHost) {
                        //console.log("<" + serverHost.address);

                        let ID = findIdx(serverHost.address, serverInfo.Port) || (Service.RandomHash(5) + idxInc++);

                        ipList[ID] = Service.MargeObj(ipList[ID] || {}, {
                            ID       : ID,
                            ServHost : serverHost.address
                        }, serverInfo);

                        resolve();
                    })
                })
            })
        ])
        .then(function () {
            mainWindow.webContents.send('ec_CMD', [
                CMD.ec_get_server_list,
                ipList
            ]);
        })
        .catch(function (err) {
            if (err) console.err(err.stack || err.message || err);
        });
    };

    commands[CMD.ce_test_server_ip] = function (data) { // data[0] == host, data[1] == port
        if (Service.isArray(data)){
            Service.testServerConnect.apply(null, data.concat(function (err, res) {
                mainWindow.webContents.send('ec_CMD', [
                    CMD.ec_test_server_ip,
                    [err, res]
                ]);
            }));
        } else {
            mainWindow.webContents.send('ec_CMD', [
                CMD.ec_test_server_ip,
                [{ code: "Incorrect data" }]
            ]);
        }
    };

    commands[CMD.ce_add_server] = function (srv) {
        let ip   = srv[0];
        let port = srv[1];

        if (srv.length === 9) { // remove 9-th element
            srv.pop();
        }

        DbWork.do.servers.serverExists(ip, port)
            .then(function ([res]) {
                if (res && res.chkID) {
                    ec_send_error(CMD.errElectron.eDuplicateServer, [ip, port]);

                    return Promise.reject();
                } else {
                    return DbWork.do.servers.addServer(srv);
                }
            })
            .then(function ([res]) { // if addServer
                let id = findIdx(ip, port) || (Service.RandomHash(5) + idxInc++);

                ipList[id] = {
                    ID       : id,
                    ServHost : srv[0], // sInfo.ServHost,
                    Port     : srv[1], // sInfo.Port,
                    ServName : srv[3], // sInfo.ServName,
                    ServDesc : srv[4], // "",
                    ServPass : srv[5], // sInfo.ServPwd,
                    ServerID : res.servID, // servID,
                    Secured  : srv[7]
                };

                mainWindow.webContents.send('ec_CMD', [
                    CMD.ec_server_added,
                    {
                        ServerID : res.servID,
                        ID       : id
                    }

                ]);
            })
            .catch(function (err) {
                if (err) console.err(err.stack || err.message || err);
            })
        ;
    };

    commands[CMD.ce_del_server] = function (data) {
        let srvID = data[0];

        DbWork.do.servers.delServer(srvID)
            .then(function () {
                let id = findIdx(srvID);

                if (id){
                    delete ipList[id];
                }

                sendComplete(CMD.ce_del_server);
            })
            .catch(function (err) {
                console.err(err.stack || err.message || err);
            });
    };

    commands[CMD.ce_modify_server] = function (srv) {
        let [ip, port, srvID] = [srv[0], srv[1], srv[srv.length - 1]];

        DbWork.do.servers.serverExists(ip, port, srvID)
            .then(function ([res]) {
                if (res && res.chkID){
                    ec_send_error(CMD.errElectron.eDuplicateServer, [ip, port]);

                    return Promise.reject();
                } else {
                    return DbWork.do.servers.saveServer(srv);
                }
            })
            .then(function () { // if saveServer
                let id = findIdx(srvID);

                if (id) {
                    ipList[id] = {
                        ID       : id,
                        ServHost : srv[0], // sInfo.ServHost,
                        Port     : srv[1], // sInfo.Port,
                        ServName : srv[3], // sInfo.ServName,
                        ServDesc : srv[4], // "",
                        ServPass : srv[5], // sInfo.ServPwd,
                        Secured  : srv[7],
                        ServerID : srv[8]  // servID,
                    };

                    mainWindow.webContents.send('ec_CMD', [
                        CMD.ec_server_saved
                    ]);
                } else {
                    ec_send_error(CMD.errElectron.eUnknownServerID, [srvID]);
                }
            })
            .catch(function (err) {
                if (err) console.err(err.stack || err.message || err);
            });
    };

    commands[CMD.ce_storage_save] = function (data) {
        let [srvID, uin, name, val] = data;
        let idSrv =  srvID ? getServerID(srvID) : -1;

        uin = !uin ? -1 : uin;

        DbWork.do.userStorage.get(idSrv, uin, name)
            .then(function ([res]) {
                if (res && res.value){
                    return DbWork.do.userStorage.update(idSrv, uin, name, JSON.stringify(val));
                } else {
                    return DbWork.do.userStorage.add(idSrv, uin, name, JSON.stringify(val));
                }
            })
            .then(function () { // if saveServer
                sendComplete(CMD.ce_storage_save);
            })
            .catch(function (err) {
                if (err) console.err(err.stack || err.message || err);
            });
    };

    commands[CMD.ce_storage_get] = function (data) {
        let [srvID, uin, name] = data;
        let idSrv =  srvID ? getServerID(srvID) : -1;

        uin = !uin ? -1 : uin;

        DbWork.do.userStorage.get(idSrv, uin, name)
            .then(function ([res]) {
                let data = null;

                if (res && res.value) {
                    try {
                        data = JSON.parse(res.value);
                    } catch (e){
                        DbWork.do.userStorage.remove(idSrv, uin, name);
                    }
                }

                mainWindow.webContents.send('ec_CMD', [
                    CMD.ec_storage_get,
                    {
                        data: data,
                        name: name
                    }
                ]);
            })
            .catch(function (err) {
                if (err) console.err(err.stack || err.message || err);
            });
    };

    commands[CMD.ce_storage_remove] = function (data) {
        let [srvID, uin, name] = data;
        let idSrv =  srvID ? getServerID(srvID) : -1;

        uin = !uin ? -1 : uin;

        DbWork.do.userStorage.get(idSrv, uin, name)
            .then(function ([res]) {
                if (res && res.value) {
                    sendComplete(CMD.ce_storage_remove);
                } else {
                    return DbWork.do.userStorage.remove(idSrv, uin, name);
                }
            })
            .then(function () {
                sendComplete(CMD.ce_storage_remove);
            })
            .catch(function (err) {
                if (err) console.err(err.stack || err.message || err);
            });
    };

    commands[CMD.ce_statistics_save] = function (data) {
        let [srvID, uin, stat] = data;
        let idSrv =  getServerID(srvID);

        DbWork.do.statistics.get(idSrv, uin)
            .then(function ([res]) {
                stat.last_update = stat.last_update || (new Date()).myFormat('yyyy-mm-dd hh:nn:ss');

                if (res && res.stat){
                    return DbWork.do.statistics.update(idSrv, uin, JSON.stringify(stat));
                } else {
                    return DbWork.do.statistics.add(idSrv, uin, JSON.stringify(stat));
                }
            })
            .then(function () {
                sendComplete(CMD.ce_statistics_save);
            })
            .catch(function (err) {
                if (err) console.err(err.stack || err.message || err);
            })
        ;
    };

    commands[CMD.ce_statistics_get] = function (data) {
        let [srvID, uin] = data;
        let idSrv =  getServerID(srvID);

        DbWork.do.statistics.get(idSrv, uin)
            .then(function ([res]) {
                let data = null;

                if (res && res.stat) {
                    try {
                        data = JSON.parse(res.stat);
                    } catch (e){
                        DbWork.do.userStorage.remove(idSrv, uin);
                    }
                }

                mainWindow.webContents.send('ec_CMD', [
                    CMD.ec_statistics_get,
                    data
                ]);
            })
            .catch(function (err) {
                if (err) console.err(err.stack || err.message || err);
            });
    };

    commands[CMD.ce_get_mc_client_info] = function () {
        let data = clientInformation();
        
        data.serverHWID = serverHWID();
        
        mainWindow.webContents.send('ec_CMD', [
            CMD.ec_get_mc_client_info,
            data
        ]);
    };

    commands[CMD.ce_break_blink] = function () {
        if (Tray.isBlinking()){
            Tray.clearBlink();
        }

        mainWindow.flashFrame(false);
    };

    commands[CMD.ce_show_on_top] = function ([stay, isBroadcast]) {
        mainWindow.setAlwaysOnTop(true);
        mainWindow.show();

        if (!stay){
            mainWindow.setAlwaysOnTop(false);
        }

        if (isBroadcast){
            global.isBrodcast = true;
        }

        mainWindow.flashFrame(true);
    };

    commands[CMD.ce_disable_always_on_top] = function () {
        mainWindow.setAlwaysOnTop(false);
        global.isBrodcast = false;
    };

    commands[CMD.ce_hide_window] = function () {
        mainWindow.setAlwaysOnTop(false);
        mainWindow.hide();
        
        Tray.hide();
    };

    commands[CMD.ce_special_link_user_info] = function([userInfo]) {
        // Service.getLinkInfoByXY
    };

    commands[CMD.ce_console_log] = function([log, msg]) {
        console.important('[console.' + log + ']: ' + msg);
    };

    commands[CMD.ce_get_clipboard_files_list] = function() {
        if (getFileFromClipboard){
            let file = getFileFromClipboard()[0];

            mainWindow.webContents.send('ec_CMD', [
                CMD.ec_get_clipboard_files_list,
                file
            ]);

            sendComplete(CMD.ce_get_clipboard_files_list);
        }
    };

    commands[CMD.ce_web_services_info] = function([list]) {
        if (list){
            ClientSettings.webPath = list;
        }
    };

    commands[CMD.ce_client_disconnected] = function() {
        Tray.clearBlink();

        ClientSettings.webPath = {
            AliasAdmin    : "admin",  // папка-псевдоним, путь к админке
            AliasAPI      : "API",    // папка-псевдоним, путь к Integration API
            AliasChat     : "chat",   // папка-псевдоним, путь к WEB-чату
            AliasFiles    : "files",  // папка-псевдоним, путь к файлам, залитым на сервер
            AliasForum    : "forum",  // папка-псевдоним, путь ко встроенному форуму
            AliasKanban   : "kanban", // папка-псевдоним, путь к канбан-доске

            LobbyEnable   : true, // включен доступ к списку сервисов MyChat
            ForumEnable   : true, // включить доступ ко встроенному форуму
            KanbanEnable  : true, // включить доступ к канбан-доске
            ChatEnable    : true, // включить доступ к WEB-чату
            AdminEnable   : true  // включить доступ к WEB-админке
        };
    };

    commands[CMD.ce_server_ports] = function([info]) {
        Service.MCServer = Service.MargeObj(Service.MCServer, info);
    };

    commands[CMD.ce_client_connected] = function([userInfo]) {
        eNotify.setConfig();
    };

    commands[CMD.ce_toggle_min_max] = maximizeMinimize;
    
    commands[CMD.ce_toggle_kiosk]   = kioskMode;

    // --- Client Logs --------------------

    commands[CMD.ce_get_logs_list] = function() {
        Service.FileWalker(Profile.getProfilePath() + "/logs/", function (filesList) {
            let minDate = "";
            let maxDate = "";

            if (filesList.length){
                try {
                    filesList.sort(function (a, b) {
                        return sortAB(a.value, b.value);
                    });
                    filesList[0].data.sort(function (a, b) {
                        return sortAB(a.value, b.value);
                    });
                    filesList[0].data[0].data.sort(function (a, b) {
                        return sortAB(a.value, b.value);
                    });

                    filesList[filesList.length - 1].data.sort(function (a, b) {
                        return sortAB(a.value, b.value);
                    });
                    filesList[filesList.length - 1].data[filesList[filesList.length - 1].data.length - 1].data.sort(function (a, b) {
                        return sortAB(a.value, b.value);
                    });

                    minDate += filesList[0].value + ".";
                    minDate += filesList[0].data[0].value + ".";
                    minDate += filesList[0].data[0].data[0].value;

                    maxDate += filesList[filesList.length - 1].value + ".";
                    maxDate += filesList[filesList.length - 1].data[filesList[filesList.length - 1].data.length - 1].value + ".";
                    maxDate += filesList[filesList.length - 1].data[filesList[filesList.length - 1].data.length - 1].data[filesList[filesList.length - 1].data[filesList[filesList.length - 1].data.length - 1].data.length - 1].value;
                } catch (e) {
                    console.error(e.message);
                }
            }

            mainWindow.webContents.send('ec_CMD', [
                CMD.ec_get_logs_list,
                {
                    filesList,
                    minDate,
                    maxDate
                },
            ]);
        });
    };

    commands[CMD.ce_get_logs_files] = function ([from, to]) {
        checkLogFile((new Date(from)).getTime(), (new Date(to)).getTime(), function (list) {
            mainWindow.webContents.send('ec_CMD', [
                CMD.ec_get_logs_files,
                list,
            ]);
        });
    };

    // =============================================
    // === FTP File List In Client =================
    // ce_ftp_download            : '701B', //
    // ce_ftp_upload              : '701C', //

    commands[CMD.ce_ftp_login] = function ([login, pwd]) {
        if (!ftpConnect){
            ftpConnect = new McFtpClient({
                onError: function (err) {
                    ec_send_error(CMD.errElectron.eFtpError, err);
                },

                onProgress: function (data) {
                    mainWindow.webContents.send('ec_CMD', [
                        CMD.ec_ftp_progress,
                        data
                    ]);
                }
            });
        }

        if (ftpConnect.checkLogin()){
            sendComplete(CMD.ce_ftp_login);
        } else {
            ftpConnect.connect(login, pwd, function () {
                sendComplete(CMD.ce_ftp_login);
            });
        }
    };

    commands[CMD.ce_ftp_list] = function (info) {
        if (ftpConnect && ftpConnect.checkLogin()){
            ftpConnect.fileList(info, function (err, list) {
                if (err){
                    ec_send_error(CMD.errElectron.eFtpError, err);
                } else {
                    mainWindow.webContents.send('ec_CMD', [
                        CMD.ec_ftp_list,
                        list
                    ]);
                }
            });
        } else {
            ec_send_error(CMD.errElectron.eFtpNotConnected);
        }
    };

    commands[CMD.ce_ftp_quit] = function () {
        if (ftpConnect && ftpConnect.checkLogin()){
            ftpConnect.close();
            
            ftpConnect = null;
            
            sendComplete(CMD.ce_ftp_quit);
        } else {
            ec_send_error(CMD.errElectron.eFtpNotConnected);
        }
    };

    // =============================================
    commands[CMD.ce_get_user_folder] = function([uin, displayName]) {
        let servId = getMyServerID();

        getDownloadFolder(servId, { uin, displayName })
            .then(function (path) {
                if (path){
                    path = os.platform() === 'win32' ? path.replace(/\//g, '\\') : path.replace(/\\/g, '/');
                    
                    mainWindow.webContents.send('ec_CMD', [
                        CMD.ec_get_user_folder,
                        path
                    ]);
                }
            })
            .catch(function (err) {
                if (err && err !== ALLOK) {
                    console.error(err.stack || err.message || err);
                }
            })
        ;
    };

    commands[CMD.ce_file_set_new_folder_for_user] = function ([path]) {
        downloadFile.openDialogDownload(path || "", "", true)
            .then(function (data) {
                let newPath = data ? data[0] : null;
                
                if (newPath){
                    mainWindow.webContents.send('ec_CMD', [
                        CMD.ec_file_set_new_folder_for_user,
                        newPath
                    ]);
                }
            })
            .catch(function (err) {
                if (err && err !== ALLOK) {
                    console.error(err.stack || err.message || err);
                }
            })
        ;
    };

    commands[CMD.ce_file_download_abort] = function () {
        if (downloadFile){
            downloadFile.abortDownload();
        }
    };

    commands[CMD.ce_file_upload_start] = function([filePath, okOptions]) {
        uploadFile.check(filePath, okOptions, ec_send_error);
    };

    commands[CMD.ce_file_upload_abort] = function() {
        uploadFile.abortUpload();
    };

    commands[CMD.ce_file_upload_prepare_abort] = function() {
        uploadFile.abortUpload();
    };

    commands[CMD.ce_file_check_exist] = function([id]) {
        uploadFile.Upload(id);
    };

    commands[CMD.ce_file_open_in_folder] = function([hash, uin]) {
        let servId = getMyServerID();

        DbWork.do.userFiles
            .get(servId, ClientSettings.uin, hash)
            .then(function ([info]) {
                return new Promise(function (resolve, reject) {
                    if (info && info.FullPathWithName){
                        electron.shell.showItemInFolder(info.FullPathWithName);

                        reject(ALLOK);
                    } else {
                        resolve();
                    }
                })
            })
            .then(function () {
                return DbWork.do.userPath.get(servId, ClientSettings.uin, uin);
            })
            .then(function ([info]) {
                if (info && info.path){
                    electron.shell.showItemInFolder(info.path);
                }
            })
            .catch(function (err) {
                if (err && err !== ALLOK) {
                    console.error(err.stack || err.message || err);
                }
            })
        ;
    };

    commands[CMD.ce_file_open_folder] = function([path]) {
        // let openPath = os.platform().indexOf('win') === 0 ? path : encodeURI("file:/" + path);
        //
        // console.log(openPath);

        electron.shell.openItem(path);
    };

    commands[CMD.ce_file_download_url] = function ([url, fileInfo, auto]) {
        download(url, fileInfo, auto);
    };

    commands[CMD.ce_file_open_or_download] = function([url, fileInfo]) {
        let servId = getMyServerID();

        DbWork.do.userFiles
            // === Is File Exists? === Try To Run If Exists ===
            .get(servId, ClientSettings.uin, fileInfo.hash)
            .then(function ([info]) {
                return new Promise(function (resolve, reject) {
                    let fileStat = null;

                    try{
                        fileStat = fs.statSync(
                            info && info.FullPathWithName
                                ? info.FullPathWithName
                                : (fileInfo.uin === ClientSettings.uin
                                    ? fileInfo.filePath
                                    : info.FullPathWithName
                                )
                        );
                    } catch (e){}

                    if (fileStat){
                        /*let ext = Service.ExtractFileExtention(info.FullPathWithName);
                         //todo: Добавить проверку на ехе файлы и выдать предупреждение
                         (Ext = '.EXE') or (Ext='.BAT') or (Ext='.REG') or (Ext='.CMD') or (Ext='.COM') or (Ext='.MSI')
                         or (Ext='.JS') or (Ext='.VBS') or (Ext='.SCR') or (Ext='.JSE') or (Ext='.WSH') or (Ext='.WSF')
                         or (Ext='.LNK')
                         if (['exe', 'cmd', 'com'].indexOf(ext) >=0 ){
                         }*/
                        electron.shell.openExternal(info.FullPathWithName);

                        reject(ALLOK);
                    } else {
                        resolve();
                    }
                });
            })
            
            .then(function () {
                return download(url, fileInfo);
            })
            .catch(function (err) {
                if (err && err !== ALLOK) {
                    console.error(err.stack || err.message || err);
                }
            })
        ;
    };

    // --- Direct Send ---

    commands[CMD.ce_file_direct_upload_prepare] = function ([uin, getFromCB]) {
        directUploadFile
            .checkDirectUpload()
            .then(function (path) {
                return new Promise(function (resolve, reject) {
                    let list = getFromCB ? getFileFromClipboard() : [];

                    if (getFromCB){
                        if (list.length && list[0]){
                            resolve([list, Service.ExtractPath(list[0])]);
                        } else {
                            mainWindow.webContents.send('ec_CMD', [
                                CMD.ec_file_direct_upload_no_files
                            ]);

                            reject(ALLOK);
                        }
                    } else {
                        resolve(directUploadFile.openDialogUpload(path));
                    }
                });
            })
            .then(function ([list, openPath]) {
                let sID       = GetFirstSID();
                let totalSize = 0;
                let fileCount = 0;
                let filesList = ""; // "1•eslintignore•temp\•26•128•" +

                list.forEach(function (file, idx) {
                    let fileName = Service.ExtractFileName(file);
                    let path = "";
                    let size = -1;
                    let attr = "128";

                    try {
                        let stat = fs.statSync(file);

                        size = stat.size;
                    } catch (e){}

                    if (size >= 0){
                        fileCount ++;
                        totalSize += size;
                        filesList += (idx + 1) + TERMINATOR + fileName + TERMINATOR + path + TERMINATOR + size + TERMINATOR + attr + TERMINATOR;

                        list[idx] = {
                            fileName : fileName,
                            filePath : file,
                            idx  : idx + 1,
                            size : size
                        }
                    }
                });

                let data = {
                    "UIN"        : uin,       // идентификатор пользователя-получателя
                    "FilesCount" : fileCount, // общее количество файлов без учёта папок
                    "FilesSize"  : totalSize, // общий объём передаваемых файлов в байтах
                    "Desc"       : "",        // текстовый комментарий к отправляемому блоку файлов
                    "List"       : filesList  // список самих файлов. Доработать
                };

                sendDataToServer(CMD.cs_files_request_transfer, [sID, JSON.stringify(data)].join(CR));

                delete data.List;

                data.FilesList = list;
                data.myUIN     = ClientSettings.uin;
                data.filesPath = openPath;

                return data;
            })
            .then(directUploadFile.filesToSend)
            .then(function (hasFiles) {
                if (hasFiles){
                    mainWindow.webContents.send('ec_CMD', [
                        CMD.ec_file_direct_upload_start,
                        directUploadFile.getFilesInfo()
                    ]);
                }
            })
            .catch(function (err) {
                if (err && err !== ALLOK) {
                    console.error(err.stack || err.message || err);
                }
            })
        ;
    };

    commands[CMD.ce_file_direct_upload_start] = function ([info]) {
        // "UIN"          : 456,                           // идентификатор пользователя-получателя файлов
        // "Port"         : 10000,                         // порт для приёма файлов "напрямую", минуя сервер
        // "BufSize"      : 65520,                         // размер буфера для приёма файлов (если файлы будут передаваться не напрямую, а через сервер)
        // "Interfaces"   : "192.168.10.1,213.130.24.149", // список сетевых интерфейсов получателя. Доработать
        // "UncheckFiles" : "1,17,21,25"                   // индексы файлов, которые получатель принимать отказался. Доработать

        directUploadFile
            .checkInterfaces(info.Interfaces.split(","), info.Port, ClientSettings.uin)
            .then(function ([host, port]) {
                let _uploadInfo = directUploadFile.getFilesInfo();
                
                return directUploadFile.doUpload(host, port, {
                    onProgress     : function (data, sendToClient) {
                        if (sendToClient){
                            sendDataToServer(CMD.cs_files_transfer_progress, [GetFirstSID()].concat(data).join(CR));
                        }

                        mainWindow.webContents.send('ec_CMD', [
                            CMD.ec_file_direct_upload_progress,
                            {
                                percent : data[1],
                                size    : Service.format_size(data[2]),
                                text    : Service.format_size(data[6]),
                                name    : ""

                            }
                        ]);
                    },
                    onFileUploaded : function (data) {
                        let idx = data[1];
                        let _idx = Service.findItemInArrayOfObj(_uploadInfo.FilesList, idx, 'idx');

                        _uploadInfo.FilesList[_idx].sended = true;

                        sendDataToServer(CMD.cs_files_internal_sended_ok_idx, [GetFirstSID()].concat(data).join(CR));
                    },
                    onComplete     : function () {
                        sendDataToServer(CMD.cs_files_success_recieved, [GetFirstSID(),info.UIN].join(CR));

                        mainWindow.webContents.send('ec_CMD', [
                            CMD.ec_file_direct_upload_complete,
                            _uploadInfo
                        ]);
                    },
                    onDebug        : function (type, data) {
                        console.log(type + ": " + data);
                    }
                });
            })
            .catch(function (err) {
                if (err && err !== ALLOK) {
                    console.error(err.stack || err.message || err);
                }
            })
        ;
    };

    commands[CMD.ce_file_direct_upload_abort] = function ([]) {
        directUploadFile.abortUploading();
    };

    commands[CMD.ce_file_direct_upload_complete] = function ([]) {

    };

    // ---- Direct Receive ---

    commands[CMD.ce_stop_ftp_server] = function () {
        directReceiveFile.stop();
    };

    commands[CMD.ce_start_ftp_server] = function () {
        startFtpServer();
    };

    commands[CMD.ce_remove_ftp_user] = function ([uin]) {
        directReceiveFile.delUser(uin);
    };

    commands[CMD.ce_file_direct_receive_start] = function ([uin, path]) {
        let servId = getMyServerID();
        let _path  = path.toString();

        DbWork.do.userPath
            .set(servId, ClientSettings.uin, uin, _path)
            .catch(function (err) {
                if (err && err !== ALLOK) {
                    console.error(err.stack || err.message || err);
                }
            })
        ;

        directReceiveFile.addUser(uin, {
            uin      : uin,
            pwd      : uin,
            path     : _path,
            closeConnection: function () {
                mainWindow.webContents.send('ec_CMD', [
                    CMD.ec_file_direct_receive_client_disconnected,
                    uin
                ]);
            }
        });

        mainWindow.webContents.send('ec_CMD', [
            CMD.ec_file_direct_receive_start,
            {
                port      : directReceiveFile.getPort(),
                interfaces: directReceiveFile.getInterfaces()
            }
        ]);
    };

    // ==============================================

    commands[CMD.ce_history_get_dialogs] = function () {
        let serverId = getMyServerID();

        DbWork.do.dialogsHistory.get(serverId, ClientSettings.uin)
            .then(function ([data]) {
                let list = {};
                
                if (data && data.history){
                    list = data.history;
                }

                try{
                    JSON.parse(list);
                } catch (e){
                    list = "";
                }

                mainWindow.webContents.send('ec_CMD', [
                    CMD.ec_history_get_dialogs,
                    list
                ]);
            })
            .catch(function (err) {
                if (err && err !== ALLOK) {
                    console.error(err.stack || err.message || err);
                }
            })
        ;
    };

    commands[CMD.ce_history_set_dialogs] = function ([history]) {
        let serverId = getMyServerID();
        let _data = Service.isString(history) ? JSON.parse(history) : history;

        DbWork.do.dialogsHistory
            .get(serverId, ClientSettings.uin)
            .then(function ([data]) {
                let list = {};

                if (data && data.history){
                    list = JSON.parse(data.history);
                }

                list = Service.MargeObj(list, _data);

                return Service.ObjToString(list);
            })

            .then(function (data) {
                return DbWork.do.dialogsHistory.set(serverId, ClientSettings.uin, data);
            })
            
            .then(function () {
                sendComplete(CMD.ce_history_set_dialogs);
            })

            .catch(function (err) {
                if (err && err !== ALLOK) {
                    console.error(err.stack || err.message || err);
                }
            })
        ;
    };

    commands[CMD.ce_history_remove_dialogs] = function () {
        let serverId = getMyServerID();

        DbWork.do.dialogsHistory.remove(serverId, ClientSettings.uin)
            .then(function () {
                sendComplete(CMD.ce_history_remove_dialogs);
            })
            .catch(function (err) {
                if (err && err !== ALLOK) {
                    console.error(err.stack || err.message || err);
                }
            })
        ;
    };

    // ==============================================

    return commands;
};



var tt = {
"AdditionalPrivateInfoFields": "EMAIL,WORK_PHONE,WORK_DIVDEPT,HOME_BIRTHDAY",
"AdditionalProgramCaption": "%program% %ver% - %nickname% %company% (%state%)",
"AdditionalSystemTrayText": "",
"CRC32": -1413113863, "Colorscolor_active_link": "255",
"Colorscolor_ch_pv_back": "13758972",
"Colorscolor_hello_nick": "13209",
"Colorscolor_inp_back": "13758972",
"Colorscolor_own_nick_text": "255",
"Colorscolor_timestamp": "10526880",
"Colorscolor_users_nick_text": "16711680",
"Colorscolor_userslist_back": "13758972",
"Colorscolor_userslist_text": "0",
"Colorscolor_visited_link": "8388736",
"EventsDateTimeStampFormat": "[hh:nn:ss]",
"EventsOpenPrivateOnPersonalOrAlert": "0",
"EventsPopupOnChannelMessage": false, "EventsPopupOnNewBBS": true, "EventsPopupOnPrivateMessage": false, "EventsShowPopupTrayWindow": true, "EventsTimeStamp": true, "EventsTrayBBSMsg": true, "EventsTrayBlinkOnTaskBar": true, "EventsTrayChMsg": true, "EventsTrayDontHide": false, "EventsTrayPvMsg": true, "EventsTrayWindowDuration": 10, "GeneralAutoHideMainWindow": true, "GeneralConfirmExit": false, "GeneralCtrlEnterSend": false, "GeneralDailyUpdatesCheck": true, "GeneralDisableAvatars": true, "GeneralDoubleClickPagesClose": true, "GeneralFadeWindows": "1",
"GeneralMainWindow": "0",
"GeneralOpenPrivateByOneClick": "1",
"GeneralQuickMsgAutoSend": "0",
"GeneralRememberOpenContactGroups": "",
"GeneralShowMainToolsPanel": "1",
"GeneralShowSendButton": true, "GeneralShowTipOfTheDay": "0",
"GeneralShowUsersCounterOnTheTabs": "1",
"GeneralSpellCheck": true, "GeneralStartPassword": "0",
"GeneralTipOfTheDayNum": "3",
"GeneralWindowsStart": "1",
"HotKeysEscHide": "1",
"HotKeysHotKeyMyChat": "<Win>+F12",
"HotKeysHotKeyMyChatScreenShot": "<Win>+F9",
"HotKeysUseGlobalHotKeys": "1",
"ID": 11, "IceTransportPolicy": "all",
"InterfaceBackgroundPlacement": "",
"InterfaceCommonBackground": "",
"InterfaceTrayIconListNumber": "0",
"LanguagesLanguage": "russian.ini",
"LoadHistoryToConf": true, "LoadHistoryToPrivate": true, "LogsFiles": "1",
"LogsPrivates": "1",
"LogsServer": "1",
"LogsTxtChannels": "1",
"MediaNetworkTransportTCP": true, "MediaNetworkTransportUDP": true, "NetworkProxyAuth": "0",
"NetworkProxyHost": "",
"NetworkProxyPort": "1080",
"NetworkProxyType": "0",
"NetworkProxyUserName": "",
"NetworkProxyUserPass": "",
"NetworkReconnectTime": "10",
"NetworkSecured": "0",
"SecurityOptionsPassword": "",
"SendFilesBasePort": 10000, "SendFilesBufferSize": "3",
"SendFilesDataPort": 10001, "SendFilesInputFilesDir": "",
"SendFilesRandomPortEnd": 10030, "SendFilesRandomPortStart": 10000, "SendFilesRandomPorts": false, "SendFilesRememberSelectInputFilesFolder": "1",
"SendFilesRenameRecievedDuplicates": "",
"SendFilesSayYes": "0",
"ServID": 2, "SmileysSmileysSet": "classic",
"SoundsAllSoundsOff": false, "SoundsSndBadWord": true, "SoundsSndBadWordFile": "badword.mp3",
"SoundsSndBroadcast": true, "SoundsSndBroadcastFile": "broadcast.mp3",
"SoundsSndChat": true, "SoundsSndChatBS": true, "SoundsSndChatBSFile": "chatbs.mp3",
"SoundsSndChatFile": "chat.mp3",
"SoundsSndChatRet": true, "SoundsSndChatRetFile": "chatret.mp3",
"SoundsSndChatType": true, "SoundsSndChatTypeFile": "chattype.mp3",
"SoundsSndError": true, "SoundsSndErrorFile": "error.mp3",
"SoundsSndFilesExchangeDone": true, "SoundsSndFilesExchangeDoneFile": "filesdone.mp3",
"SoundsSndFilesExchangeRequest": true, "SoundsSndFilesExchangeRequestFile": "filesrequest.mp3",
"SoundsSndJoin": true, "SoundsSndJoinFile": "join.mp3",
"SoundsSndLeave": true, "SoundsSndLeaveFile": "leave.mp3",
"SoundsSndMediaBusy": true, "SoundsSndMediaBusyFile": "mediabusy.mp3",
"SoundsSndMediaCall": true, "SoundsSndMediaCallFile": "mediacall.mp3",
"SoundsSndMediaCallReject": true, "SoundsSndMediaCallRejectFile": "mediacallreject.mp3",
"SoundsSndMediaEndCall": true, "SoundsSndMediaEndCallFile": "mediaendcall.mp3",
"SoundsSndMediaIncomingCall": true, "SoundsSndMediaIncomingCallFile": "mediaincomingcall.mp3",
"SoundsSndNewMsg": true, "SoundsSndNewMsgFile": "newmsg.mp3",
"SoundsSndPrivate": true, "SoundsSndPrivateFile": "private.mp3",
"SoundsSndScreenShot": true, "SoundsSndScreenShotFile": "screenshot.mp3",
"SoundsSndSignal": true, "SoundsSndSignalFile": "signal.mp3",
"SoundsSndStatus": true, "SoundsSndStatusFile": "status.mp3",
"SpecialMessagesFontSize": "1",
"SpecialPagesPanel": "3",
"SpecialToolsPanelType": "1",
"SysEventsAutoFillBroadcastUsersList": "1",
"SysEventsAutoreplaceSmileys": "1",
"SysEventsBanUser": "1",
"SysEventsChangeTheme": "1",
"SysEventsConnectionLost": "1",
"SysEventsConnectionRestored": "1",
"SysEventsDisableEmotions": false,
"SysEventsEnableSmileysAnimation": "1",
"SysEventsEnterTxtxCh": "1",
"SysEventsHistory_1_Num": 40,
"SysEventsIgnore": "1",
"SysEventsImagesThumbsSize": "2",
"SysEventsLeaveTxtxCh": "1",
"SysEventsLoadHistoryType": "1",
"SysEventsQuitChat": "1",
"SysEventsShowImagesInChat": true, "SysEventsShowSysEvents": "1",
"SysEventsTurnOut": "1",
"SysEventsUseMessagesFontLayouts": "1",
"UpdateForceUpdateFromMyChatServerInActiveDirectory": "0",
"UpdateUpdateDomain": "",
"UpdateUpdateLogin": "",
"UpdateUpdatePassword": "",
"UpdateUseAccountForUpdates": "0"
}