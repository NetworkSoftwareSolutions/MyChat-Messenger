/**
 * Created by Gifer on 02.10.2017.
 */


"use strict";

const console          = require('gifer-console');
const util             = require('util');
const fs               = require('fs');
const os               = require('os');
const _ftp             = require('../mcFtpServer');

function start({host, uin, path, startPort, endPort, pwd}) {
    _ftp.addUser(uin, {
        uin,
        host,
        path,
        startPort,
        endPort,
        pwd
    });

    _ftp.start(uin);
}

module.exports = {
    start
};

