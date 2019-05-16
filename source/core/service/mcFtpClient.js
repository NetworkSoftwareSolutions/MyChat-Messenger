/**
 * Created by Gifer on 10.07.2017.
 */

let jsFTP   = require("jsftp");
let console = require("gifer-console");
let EventEmitter = require('events').EventEmitter;
// let Service = require("./service");
// let CMD     = require("./mcconnect").CMD;

const EVENTS = {
    TIMEOUT   : -2,
    ERROR     : -1,
    FILE_LIST : 1,
    CONNECTED : 2,
    LOGGED_IN : 3,
    PROGRESS  : 4,
    DEBUG     : 5,
    DOWNLOADED: 6,
    UPLOADED  : 7,
    MD_DONE   : 8
};
const COMMANDS = {
    // Commands without parameters
    'abor': 'abor', 'pwd' : 'pwd' , 'cdup': 'cdup', 'feat': 'feat',
    'noop': 'noop', 'quit': 'quit', 'pasv': 'pasv', 'syst': 'syst',
    
    // Commands with one or more parameters
    'appe': 'appe', 'cwd' : 'cwd' , 'dele': 'dele', 'list': 'list',
    'mdtm': 'mdtm', 'mkd' : 'mkd' , 'mode': 'mode', 'nlst': 'nlst',
    'pass': 'pass', 'retr': 'retr', 'rmd' : 'rmd' , 'rnfr': 'rnfr',
    'rnto': 'rnto', 'site': 'site', 'stat': 'stat', 'stor': 'stor',
    'type': 'type', 'user': 'user', 'xrmd': 'xrmd', 'opts': 'opts',
    'rest': 'rest',

    // Extended features
    'chmod': 'chmod', 'size': 'size', 'mlst': 'mlst', 'mlsd': 'mlsd'
};


function CreateFtpConnection() {
    let Ftp        = null;
    let features   = [];
    let isLoggedIn = false;
    let selfFTP    = this;

    EventEmitter.call(this);

    this.checkLogin = function () {
        return isLoggedIn;
    };

    this.connect = function (opts) {
         Ftp = new jsFTP({
            host: opts.host || MCServer.Host,
            port: opts.port || MCServer.PortFTP,
            user: opts.login,
            pass: opts.pwd
        });

        Ftp.auth(opts.login, opts.pwd, function () {
            Ftp.execute('CLNT MyChat', function () {
                Ftp.execute('OPTS UTF8 ON', function () {
                    selfFTP.emit(EVENTS.LOGGED_IN, features);
                });
            });
        });

        Ftp.on('jsftp_receive', function(data) {
            selfFTP.emit(EVENTS.DEBUG, "RECEIVE", JSON.stringify(data, null, 2));
        });

        Ftp.on('jsftp_send', function(data) {
            selfFTP.emit(EVENTS.DEBUG, "SEND", JSON.stringify(data, null, 2));
        });

        Ftp.on('connect', function () {
            isLoggedIn = true;

            selfFTP.emit(EVENTS.CONNECTED, arguments);
        });

        Ftp.on('timeout', function () {
            isLoggedIn = false;

            selfFTP.emit(EVENTS.TIMEOUT, arguments);
        });

        Ftp.on('error', function (err) {
            isLoggedIn = false;

            selfFTP.emit(EVENTS.ERROR, err);
        });

        Ftp.on('progress', function (data) {
            selfFTP.emit(EVENTS.PROGRESS, data);
        });
    };

    this.fileList = function (path) {
        return new Promise(function (resolve, reject) {
            Ftp.ls(path || '.', function (err, res) {
                if (err) {
                    selfFTP.emit(EVENTS.ERROR, err);

                    reject(err);
                } else {
                    selfFTP.emit(EVENTS.FILE_LIST, res);

                    resolve(res);
                }
            });
        });
    };
    
    this.download = function (pathToFile, downloadTo) {
        return new Promise(function (resolve, reject) {
            Ftp.get(pathToFile, downloadTo, function (err) {
                if (err){
                    selfFTP.emit(EVENTS.ERROR, err);

                    reject(err);
                } else {
                    selfFTP.emit(EVENTS.DOWNLOADED);

                    resolve();
                }
            });
        });
    };

    this.upload = function (fromPath, toPath) {
        return new Promise(function () { // resolve, reject
            Ftp.put(fromPath, toPath, function (data) {
                selfFTP.emit(EVENTS.UPLOADED, data);
            });
        });
    };

    this.close = function () {
        if (Ftp){
            // Ftp.execute(COMMANDS.quit);
            //
            // setTimeout(function () {
            //     if (Ftp){
            Ftp.destroy();
                // }
            // }, 200);
        }

        isLoggedIn = false;
        features   = [];
        Ftp        = null;
    };

    this.md = function (path) {  // make dir
        return new Promise(function (resolve, reject) {
            Ftp.raw("mkd", "path", function (err, data) {
                if (err) {
                    selfFTP.emit(EVENTS.ERROR, err);
                } else {
                    selfFTP.emit(EVENTS.MD_DONE, data, path);
                }
            });
        });
    };

    this.sendCMD = function (cmd) {
        Ftp.send(cmd);
    };

    this.const = EVENTS;
    this.commands = COMMANDS;
}

require('util').inherits(CreateFtpConnection, EventEmitter);

module.exports = CreateFtpConnection;
