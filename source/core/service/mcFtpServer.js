/**
 * Created by Gifer on 05.09.2017.
 */
"use strict";

const os      = require('os');
const console = require('gifer-console');
const _ftp    = require('nodeftpd');
const mcFtpHello = "220 Welcome to MC FTP Server";
const CRLF = "\r\n";

let server    = null;
let usersList = {};
let Options   = null;
let onClose   = null;

function __hasUser(uin) {
    return usersList.hasOwnProperty(uin);
}

function __checkUser(uin, pwd) {
    return __hasUser(uin) && usersList[uin].pwd && usersList[uin].pwd.toString() === pwd;
}

function __getUser(login) {
    return __hasUser(login) ? usersList[login] : null;
}

function __toIpv4(ip) {
    let IP = ip.split(':');

    return IP[IP.length - 1];
}

function addUser(login, data) {
    if (!__hasUser(login)){
        usersList[login] = data;
    } else {
        console.err("FTP server: user already exists - " + login);
    }
}

function __connUser(login, data) {
    if (__hasUser(login)){
        usersList[login].connection = data;
    } else {
        console.err("FTP server: can't set connection info for user - " + login);
    }
}

function __removeUser(login) {
    if (__hasUser(login)){
        if (usersList[login].connection && usersList[login].connection.socket && usersList[login].connection.socket.destroy){
            usersList[login].connection.socket.destroy();
        }

        delete usersList[login];
    }
}

function startFTP(opt) {
    Options = opt;

    if (Options){
        getInterfaces();

        server = new _ftp.FtpServer("0.0.0.0", {
            getInitialCwd: function() { // connection, callback
                return ""; // connection.checkedUser ? "" : "mazafaka_fake_path"
            },
            getRoot: function(connection, callback) {
                callback(null, connection.checkedUser ? __getUser(connection.Login).path : "mazafaka_fake_path");
            },
            pasvPortRangeStart   : Options.startPort + 1,
            pasvPortRangeEnd     : Options.endPort,
            Banner               : mcFtpHello,
            allowUnauthorizedTls : true,
            useWriteFile         : false,
            useReadFile          : false,
            uploadMaxSlurpSize   : 7000
        });

        server.on('error', function(error) {
            console.error('FTP Server error:' + error.message);
            console.error(error.stack);
        });

        server.on('end', function () {
            console.log('Stop FTP server!');

            if (onClose){
                onClose();
            }
        });

        server.on('client:connected', function(connection) {
            let closeTimer  = null;

            connection.socket.once('data', function (_data) {
                let data    = _data.toString();
                let mcCheck = data.split(" ");
                let uin     = mcCheck[1].slice(0, mcCheck[1].indexOf(CRLF));
                
                if (mcCheck[0] === 'MYCHATCHECK' && __hasUser(uin)){
                    let clientIp = __toIpv4(connection.socket.remoteAddress).split('.');
                    let res1   = [];
                    let res2   = [];
                    let host   = "";

                    for(let idx = 0; idx < Options.interfaces.length; idx++){
                        let _ip       = Options.interfaces[idx];
                        let _mac      = Options.masks[idx];
                        let chanksIP  = _ip.split('.');
                        let chanksMAC = _mac.split('.');

                        chanksIP.forEach(function (el, elIdx) {
                            res1.push(parseInt(el) & parseInt(chanksMAC[elIdx]));
                        });

                        clientIp.forEach(function (el, elIdx) {
                            res2.push(parseInt(el) & parseInt(chanksMAC[elIdx]));
                        });

                        if (res1.join('.') === res2.join('.')){
                            host = Options.interfaces[idx];

                            break;
                        } else {
                            res1 = [];
                            res2 = [];
                        }
                    }

                    if (host){
                        console.log('Set FTP host for: ' + host);

                        server.setHost(host);

                        connection.respond("OK");

                        setTimeout(function () {
                            if (connection && connection.socket){
                                try {
                                    connection.socket.end();
                                } catch (e){}
                            }
                        }, 100);
                    } else {

                        console.error("Can't resolve host for PASV mode! \nhost: " + host);
                        console.error('Interfaces: ' + Options.interfaces.join(', '));
                        console.error('Masks: ' + Options.masks.join(', '));
                    }
                }
            });

            connection.socket.on('close', function () {
                if (connection.checkedUser){
                    let user = __getUser(connection.Login);

                    __removeUser(connection.Login);

                    if (user && user.closeConnection) {
                        user.closeConnection();
                    }
                }
            });

            connection.on('command:user', function(user, success, failure) {
                if (__hasUser(user)) {
                    connection.Login = user;

                    success();
                } else {
                    failure();
                }
            });

            connection.on('command:pass', function(pass, success, failure) {
                if (__checkUser(connection.Login, pass)) {
                    connection.checkedUser = true;

                    success(connection.Login);

                    __connUser(connection.Login, connection);
                } else {
                    failure(connection.Login);

                    __removeUser(connection.Login);
                }

                clearTimeout(closeTimer);

                closeTimer = null;
            });

            closeTimer = setTimeout(function(){
                __removeUser(connection.Login);
            }, 4000);
        });

        server.debugging = _ftp.LOG_LEVELS.DEBUG;

        server.listen(Options.startPort, "0.0.0.0");
    } else {
        console.error('FTP Server has not options!');
    }
}

function stop(_onClose) {
    if (server){
        onClose = _onClose;
        
        server.close();
        server = null;
    } else

    if (_onClose) {
        _onClose(); 
    }

    usersList = {};
    Options   = null;
}

function getInterfaces() {
    const iList    = os.networkInterfaces();

    let interfaces = [];
    let masks      = [];

    Object.keys(iList).forEach(function (eth) {
        iList[eth].forEach(function (info) {
            if (info.family === 'IPv4' && !info.internal){
                interfaces.push(info.address);
                masks.push(info.netmask);
            }
        });
    });

    Options.interfaces = interfaces;
    Options.masks      = masks;

    return Options.interfaces.join(',');
}

function getMasks() {
    return Options.masks.join(',');
}

function getPort() {
    return Options ? Options.startPort : null;
}

module.exports = {
    getPort  : getPort,
    start    : startFTP,
    addUser  : addUser,
    stop     : stop,
    delUser  : __removeUser,
    getMasks : getMasks,
    getInterfaces: getInterfaces
};
