/**
 * Created by Gifer on 26.07.2017.
 */

const console = require('gifer-console');
const CMD     = require('../mcconnect').CMD;
const Service = require('../service');
const fs      = require('fs');
const os      = require('os');
const crypto  = require('crypto');

let __abortDownload  = null;
let dialogs          = null;
let mainWindow       = null;

function download(url, path, onError) {
    return new Promise(function (resolve, reject) {
        let http      = require(url.indexOf('https://') === 0 ? 'https' : 'http');
        let finalHash = null;

        if (path) {
            // if (mainWindow && mainWindow.hasOwnProperty("webContents")) {
                mainWindow.webContents.send('ec_CMD', [
                    CMD.ec_file_download_start
                ]);
            // }

            fs.open(path, 'w', (err, fd) => {
                if (err) {
                    onError(CMD.errElectron.eFileDownload, [err.message]);

                    reject(err.message);
                } else {
                    let file = fs.createWriteStream(path, { fd: fd });

                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // на сервере можем юзать самоподписной сертификат :(

                    http.get(url, function(res) {
                        function sendProgressInfo() {
                            currentPercent = (totalLength / onePercent).toFixed();

                            if (mainWindow && !mainWindow.isDestroyed()){
                                try{
                                    mainWindow.webContents.send('ec_CMD', [
                                        CMD.ec_file_download_progress,
                                        {
                                            size    : Service.format_size(fileSize),
                                            text    : Service.format_size(totalLength),
                                            percent : currentPercent,
                                            name    : Service.ExtractFileName(path)
                                        }
                                    ]);
                                } catch (e) {}
                            }
                        }

                        let progressTimer  = null;
                        let fileSize       = res.headers['content-length'];
                        let onePercent     = fileSize / 100;
                        let currentPercent = 0;
                        let totalLength    = 0;
                        let sha1           = crypto.createHash('sha1');

                        if (res.statusCode === 404){
                            file.close();

                            let err = "Error 404: File not found!";

                            fs.unlink(path, function () {
                                __abortDownload = null;

                                onError(CMD.errElectron.eFileDownload, [err]);

                                process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
                            });

                            if (mainWindow && !mainWindow.isDestroyed()){
                                try {
                                    mainWindow.webContents.send('ec_CMD', [
                                        CMD.ec_file_download_file_no_found
                                    ]);
                                } catch (e) {}
                            }

                            reject(err);
                        } else {
                            setTimeout(function () {
                                sendProgressInfo();
                            }, 10);

                            res.pipe(file);

                            __abortDownload = function () {
                                res.pause();
                                res.destroy();

                                sha1 = null;

                                file.close();

                                fs.unlink(path, function () {
                                    if (mainWindow && !mainWindow.isDestroyed()){
                                        try {
                                            mainWindow.webContents.send('ec_CMD', [
                                                CMD.ec_file_download_aborted
                                            ]);
                                        } catch (e) {}
                                    }

                                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
                                });
                            };

                            res.on('data', (chunk) => {
                                totalLength += chunk.length;

                                sha1.update(chunk);

                                if (!progressTimer){
                                    progressTimer = setTimeout(function () {
                                        sendProgressInfo();

                                        progressTimer = null;
                                    }, 100);
                                }
                            });

                            res.on('error', (err) => {
                                file.close();
                                sha1 = null;

                                fs.unlink(path, function () {
                                    __abortDownload = null;

                                    onError(CMD.errElectron.eFileDownload, [err.message]);

                                    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
                                });

                                reject(err.message);
                            });

                            res.on('end', () => {
                                file.close();

                                if (sha1) {
                                    finalHash = sha1.digest('hex');
                                }

                                if (mainWindow && !mainWindow.isDestroyed()){
                                    try{
                                        mainWindow.webContents.send('ec_CMD', [
                                            CMD.ec_file_download_complete
                                        ]);
                                    } catch (e) {}
                                }

                                __abortDownload = null;

                                process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

                                resolve([path, finalHash, totalLength]);
                            });
                        }
                    }).on('error', function(err) {
                        file.close();

                        fs.unlink(path, function () {
                            __abortDownload = null;

                            onError(CMD.errElectron.eFileDownload, [err.message]);

                            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
                        });

                        reject(err.message);
                    });
                }
            });
        } else {
            reject('Download: file name is not set');
        }
    });
}

function openDialogDownload(path, file, openDialog) {
    return new Promise(function (resolve, reject) {
        if (dialogs){
            let openPath = "";

            if (os.platform() === 'win32') {
                openPath = path.replace(/\//g, '\\');

                if (openPath[openPath.length - 1] !== '\\'){
                    openPath += "\\";
                }
            } else {
                openPath = path.replace(/\\/g, '/');

                if (openPath[openPath.length - 1] !== '/'){
                    openPath += "/";
                }
            }

            dialogs[openDialog ? "showOpenDialog" : "showSaveDialog"](mainWindow, {
                defaultPath: decodeURI(openPath + (file || "")),
                properties : ['openDirectory']
            }, function (newPath) {
                // download(filename, url, path, onError);
                resolve(newPath);
            });
        } else {
            reject('[downloadFile]: dialogs is undefined!');
            // console.error('[downloadFile]: dialogs is undefined!');
        }
    });
}

function abortDownload() {
    if (__abortDownload){
        __abortDownload();
    }
}

function init(_dialog, _mainWindow) {
    dialogs    = _dialog;
    mainWindow = _mainWindow;
}

module.exports = function () {
    init.apply(null, arguments);
    
    return {
        init,
        download,
        abortDownload,
        openDialogDownload
    }
};
