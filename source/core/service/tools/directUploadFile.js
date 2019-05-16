/**
 * Created by Gifer on 02.10.2017.
 */

"use strict";

const console          = require('gifer-console');
const util             = require('util');
const os               = require('os');
const _ftpClient       = require('../mcFtpClient');
const net              = require('net');
const ExtractPath      = require('../service').ExtractPath;
// const moment           = require('moment');

const mcFtpHello = "220 Welcome to MC FTP Server";

let _abortUploading    = null;
let dialogs            = null;
let mainWindow         = null;
let uploadsData        = null;
let isUploadingStarted = false;

function init(_dialog, _mainWindow) {
    dialogs  = _dialog;
    mainWindow = _mainWindow;
}

function doUpload(host, port, _events) {
    return new Promise(function (resolve, reject) {
        let fileList   = [].concat(uploadsData.FilesList);
        let totalCount = fileList.length;
        let totalSize  = uploadsData.FilesSize;
        let trSize     = 0;
        let percent    = 0;
        let currentIdx = 0;
        let speed      = 0;
        let onePercent = totalSize / 100;
        let sendTimer  = null;
        let current_size    = 0;
        let current_count   = 0;
        let seconds_between = 1;
        let start_time      = (new Date()).getTime();
        let current_file    = null;
        let events          = {
            onProgress    : _events.onProgress     || function () {},
            onFileUploaded: _events.onFileUploaded || function () {},
            onComplete    : _events.onComplete     || function () {},
            onDebug       : _events.onDebug        || function () {}
        };
        let sendProgressToMc= false;

        isUploadingStarted = true;

        function _startUploadFile(ftp) {
            if (fileList.length){
                current_file    = fileList.shift();

                let filePath = current_file.filePath;
                let fileName = current_file.fileName;

                currentIdx = current_file.idx;
                
                ftp.upload(filePath, fileName);

                sendProgress(true);
            } else {
                return true;
            }
        }

        function sendProgress(now) {
            function go(toClient) {
                if (uploadsData){
                    events.onProgress([
                        uploadsData.UIN,
                        percent,
                        totalSize,
                        current_count,
                        totalCount,
                        speed,
                        trSize
                    ], toClient);
                }
            }

            if (now){
                go(true);
            } else
            if (!sendTimer){
                sendTimer = setTimeout(function () {
                    sendTimer = null;
                    sendProgressToMc = !sendProgressToMc;
                    
                    go(sendProgressToMc);
                }, 500);
            }
        }

        if (fileList && uploadsData){
            let ftp        = new _ftpClient();
            const ftpCONST = ftp.const;

            if (!util.isArray(fileList) && util.isString(fileList)){
                fileList = [fileList]
            }

            _abortUploading = function () {
                ftp.close();
            };

            ftp.connect({
                host : host,
                port : port,
                login: uploadsData.myUIN,
                pwd  : uploadsData.myUIN
            });

            ftp.on(ftpCONST.LOGGED_IN, function () {
                _startUploadFile(ftp);
            });

            ftp.on(ftpCONST.DEBUG, function (type, data) {
                events.onDebug(type, data);
            });

            ftp.on(ftpCONST.UPLOADED,  function (hadError) {
                if (hadError || !uploadsData){
                    ftp.close();

                    console.error(hadError);

                    abortUploading();

                    reject(hadError);
                } else {
                    events.onFileUploaded([
                        uploadsData.UIN,
                        currentIdx
                    ]);

                    current_count++;
                    current_size += current_file.size;
                    
                    if (_startUploadFile(ftp)) {
                        sendProgress(true);
                        
                        setTimeout(function () {
                            ftp.close();
                            
                            events.onComplete(uploadsData);

                            abortUploading();
                        }, 50);
                    }
                }
            });

            ftp.on(ftpCONST.ERROR,     function (error) {
                ftp.close();

                abortUploading();
                
                reject(error);
            });

            ftp.on(ftpCONST.PROGRESS,  function (data) {
                if (seconds_between === 0) {
                    seconds_between = 1;
                }

                trSize  = current_size + (data.transferred || data.total) ;
                speed   = Math.round((speed + trSize / seconds_between) / 2);
                percent = (trSize / onePercent).toFixed();

                seconds_between = Math.round(((new Date()).getTime() - start_time) / 1000);

                sendProgress();
            });

        } else {
            reject('doUpload: No files to send!');
        }
    });
}

function openDialogUpload(path = '') {
    return new Promise(function (resolve, reject) {
        if (dialogs){
            if (path[path.length - 1] !== '\\' || path[path.length - 1] !== '/'){
                path += "/";
            }

            let openPath = (os.platform() === 'win32' ? path.replace(/\//g, '\\') : path.replace(/\\/g, '/'));

            dialogs.showOpenDialog(mainWindow, {
                defaultPath: openPath,
                properties : ['openFile','multiSelections']
            }, function (fileList) {
                if (fileList) {
                    resolve([fileList, ExtractPath(fileList[0])]);
                }
            });
        } else {
            reject('[uploadFile]: dialogs is undefined!');
        }
    });
}

function checkDirectUpload() {
    return new Promise(function (resolve, reject) {
        if (isUploadingStarted){
            reject('Other uploading was started');
        } else {
            resolve();
        }
    });
}

function abortUploading() {
    if (_abortUploading){
        _abortUploading();
    }

    _abortUploading    = null;
    isUploadingStarted = false;
    uploadsData        = null;
}

function _checkIP(uin, port, ipList, done) {
    let ip     = ipList.shift();
    let socket = net.createConnection(port, ip);
    let allOk  = false;

    socket.setTimeout(1000, function () {
        if (ipList.length){
            process.nextTick(() => _checkIP(uin, port, ipList, done));

            // socket.destroy();
        }
    });

    socket.on('data', function (data) {
        let str = data.toString();

        if (str.indexOf(mcFtpHello) !== -1) {
            socket.write('MYCHATCHECK ' + uin + '\r\n');
        } else
        if (str.indexOf("OK\r\n") === 0){
            allOk = true;
            
            done([ip, port]);

            ipList = [];

            try {
                socket.destroy();
            } catch (e){}
        }
    });
    
    socket.on('error', function (err) {
        console.error("Check ip err: " + err.message);

        if (!allOk && ipList.length){
            process.nextTick(() => _checkIP(uin, port, ipList, done));
        }
    });

    socket.on('close', function () {
        if (!allOk && ipList.length){
            process.nextTick(() => _checkIP(uin, port, ipList, done));
        }
    });
}

function checkInterfaces(interfaceList, port, uin) {
    return new Promise(function (resolve, reject) {
        if (interfaceList){
            _checkIP(uin, port, interfaceList, resolve);
        } else {
            reject('checkInterfaces: Interface list is not defined!');
        }
    });
}

function filesToSend(data) {
    if (!isUploadingStarted && data.FilesList){
        uploadsData = data;
    } else {
        uploadsData = null;
    }

    return !!uploadsData;
}

function getFilesInfo() {
    return uploadsData;
}

module.exports = function () {
    init.apply(null, arguments);

    return {
        init,
        doUpload,
        checkInterfaces,
        abortUploading,
        checkDirectUpload,
        openDialogUpload,
        filesToSend,
        getFilesInfo
    }
};
