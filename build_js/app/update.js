const electron = require('electron');
const console  = require('gifer-console');
const Service  = require('./service');
const Profile  = require('./profile');
const copy     = require('copy').copy;
const rm       = require('rimraf');
const os       = require('os');


console.SetLogLevel(console.logLevel.L_Normal);

global.__dirname = __dirname;

const app            = electron.app;

// ========================================================

app.on('ready', function() {
    let dest = "";

    Profile.init(__dirname);

    console.DublicateToFile(Profile.getProfilePath() + "/logs/" + (new Date()).myFormat('yyyy') + "/" + (new Date()).myFormat('mm') + "/" + (new Date()).myFormat('dd') + "/node.log");

    console.immediately("======================================================");
    console.immediately("============ Start update module =====================");
    console.immediately("======================================================");

    const updatePath = Profile.getProfilePath() + "/updates/";
    const updateTemp = updatePath + "temp/";

    switch (os.platform()) {
        case "darwin":
            dest = Service.ExtractPath(process.argv[0]).replace("MacOS", "Resources");
        break;

        case "linux":
        case "win32":
            dest = Service.ExtractPath(process.argv[0]) + "/resources/";
        break;
    }

    console.immediately(dest);

    process.noAsar = true;

    copy(updateTemp, dest, function () {
        rm(dest + "/app", function() {
            rm(updateTemp, function() {
                console.immediately("================== RESTART ===========================");

                process.noAsar = false;

                app.relaunch({args: process.argv.slice(1).concat(["--start"])});
                app.quit();
            });
        });
    });
});

process.on('uncaughtException', function (err) {
    console.immediately("Updater FATAL - " + err.message + '\n');
    console.immediately(err.stack + '\n');

    console.error("Updater FATAL - " + err.message + '\n');
    console.error(err.stack + '\n');

    setTimeout(function () {
        process.exit(700);
    }, 40);
});
