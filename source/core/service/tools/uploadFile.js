/**
 * Created by Gifer on 26.07.2017.
 */
"use strict";

const console         = require('gifer-console');
const CMD             = require('../mcconnect').CMD;
const ExtractFileName = require('../service').ExtractFileName;
const randomHash      = require('../service').RandomHash;
const format_size     = require('../service').format_size;
const crypto          = require('crypto');
const fs              = require('fs');
const os              = require('os');
const Request         = require('request');

let __abortUpload  = null;
let dialogs        = null;
let mainWindow     = null;
let uploadsData    = {};

function abortUpload() {
    if (__abortUpload){
        __abortUpload();
    }
}

function doUpload(fileHash, filePath, stat, okOptions, onError) {
    function sendProgressInfo() {
        currentPercent = (totalLength / onePercent).toFixed();

        mainWindow.webContents.send('ec_CMD', [
            CMD.ec_file_upload_progress,
            {
                size    : format_size(fileSize),
                text    : format_size(totalLength),
                percent : currentPercent,
                name    : fileName
            }
        ]);
    }

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // на сервере можем юзать самоподписной сертификат :(

    let fileName       = ExtractFileName(filePath);
    let http           = require(MCServer.HTTPS ? 'https' : 'http');
    let file           = fs.createReadStream(filePath);
    let progressTimer  = null;
    let currentPercent = 0;
    let totalLength    = 0;
    let fileSize       = stat.size;
    let onePercent     = fileSize / 100;
    
    let myServer = 'http' + (MCServer.HTTPS ? 's' : '') + '://' + MCServer.ipNode
        + (MCServer.HTTPS
            ? (MCServer.PortNode ? ':' + MCServer.PortNode : '')
            : (MCServer.PortNode ? ':' + MCServer.PortNode : ''));

    mainWindow.webContents.send('ec_CMD', [
        CMD.ec_file_upload_start
    ]);

    __abortUpload = function () {
        request.abort();

        mainWindow.webContents.send('ec_CMD', [
            CMD.ec_file_upload_aborted
        ]);

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    };

    let request = Request({
        method: "POST",
        url: myServer + '/uploading/?hash=' + fileHash,
        formData: {
            custom_file: {
                value: file,
                options: {
                    filename: fileName
                }
            }
        }
    });

    sendProgressInfo();

    request.on('error', (err) => {
        file.close();

        __abortUpload = null;

        onError(CMD.errElectron.eFileUpload, [err.message]);

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';

        console.error('[UPLOADING]: ' + err.message);
    });

    file.on('data', (chunk) => {
        totalLength += chunk.length;

        if (!progressTimer){
            progressTimer = setTimeout(function () {
                sendProgressInfo();

                progressTimer = null;
            }, 100);
        }
    });

    file.on('end', () => {
        okOptions.Hash     = fileHash;
        okOptions.FileName = filePath;
        okOptions.lastModifiedDate = new Date(stat.mtime).getTime();
        okOptions.fileSize = fileSize;

        mainWindow.webContents.send('ec_CMD', [
            CMD.ec_file_upload_complete,
            okOptions
        ]);

        file.close();

        __abortUpload = null;

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
    });

}

function checkExist(id, data) {
    let [hash, filePath, stat, okOptions] = data;

    uploadsData[id] = data;

    okOptions.FileName = filePath;
    okOptions.Hash     = hash;
    okOptions.fileSize = stat.size;
    okOptions.lastModifiedDate = (new Date(stat.mtime)).getTime();

    mainWindow.webContents.send('ec_CMD', [
        CMD.ec_file_check_exist,
        {
            info: okOptions,
            id  : id
        }
    ]);
}

function check(filePath, okOptions, onError) {
    if (filePath){
        fs.open(filePath, 'r', function (err, fd) {
            function sendProgressInfo() {
                currentPercent = (totalLength / onePercent).toFixed();

                mainWindow.webContents.send('ec_CMD', [
                    CMD.ec_file_upload_prepare_progress,
                    {
                        percent : currentPercent
                    }
                ]);
            }

            let progressTimer  = null;
            let currentPercent = 0;
            let totalLength    = 0;
            let stat           = fs.statSync(filePath);
            let fileSize       = stat.size;
            let onePercent     = fileSize / 100;

            mainWindow.webContents.send('ec_CMD', [
                CMD.ec_file_upload_prepare_start
            ]);

            if (err) {
                console.error(err.message);

                onError(CMD.errElectron.eFileUpload, [err.message]);
            } else {
                let file = fs.createReadStream(filePath, { fd: fd });
                let sha1 = crypto.createHash('sha1');

                __abortUpload = function () {
                    mainWindow.webContents.send('ec_CMD', [
                        CMD.ec_file_upload_aborted
                    ]);

                    file.close();
                };

                sendProgressInfo();

                file.on('data', (chunk) => {
                    totalLength += chunk.length;

                    sha1.update(chunk);

                    if (!progressTimer){
                        progressTimer = setTimeout(function () {
                            sendProgressInfo();

                            progressTimer = null;
                        }, 100);
                    }
                });

                file.on('end', () => {
                    __abortUpload = null;

                    file.close();
                });

                file.on('error', (err) => {
                    onError(CMD.errElectron.eFileUpload, [err.message]);

                    console.error('[PREPARE UPLOAD]: ' + err.message);

                    file.close();
                });

                file.on('close', () => {
                    if (!__abortUpload){
                        sendProgressInfo();

                        let hash = sha1.digest('hex');

                        checkExist(randomHash(10), [hash, filePath, stat, okOptions, onError]);
                    }

                    __abortUpload = null;
                    sha1 = null;
                    file = null;
                });
            }
        });
    }
}

function init(_dialog, _mainWindow) {
    dialogs  = _dialog;
    mainWindow = _mainWindow;
}

module.exports = function () {
    init.apply(null, arguments);

    return {
        init,
        check,
        Upload: function (id) {
            if (uploadsData.hasOwnProperty(id)){
                doUpload.apply(null, uploadsData[id]);

                delete uploadsData[id];
            }
        },
        abortUpload,
        // openDialogUpload
    }
};
