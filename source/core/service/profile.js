 /**
 * Created by Gifer on 30.08.2016.
 */

 "use strict";

 const fs      = require('fs');
 const Service = require('./service');
 const os      = require('os');
 const console = require('gifer-console');

 const MCPROFILE = "mcprofile.dat";

 let rootPath = ""; // path to mychat profile folder
 let rootProfile = "";

 function init(appPath) {
     rootPath = appPath || "/";

     if (rootPath[rootPath.length - 1] !== "/") {
         rootPath += "/";
     }
 }

 function getProfilePath(){
     let path     = process.argv[0].replace(/\\/g, "/");
     let pathArr  = path.split('/');
     let dataRoot = ''; // path to mcprofile.dat
     let subDir   = '';

     switch (os.platform()){
         case "darwin":
             dataRoot = process.env.HOME;

             let item = pathArr.shift();

             while (item.indexOf('.app') === -1){
                 item = pathArr.shift();
             }

             subDir   = item.replace('.app', '');
         break;

         case "linux" :
             dataRoot = process.env.HOME;
             subDir   = pathArr[pathArr.length - 2];
         break;

         case "win32" :
             dataRoot = process.env.LOCALAPPDATA;
             subDir   = pathArr[pathArr.length - 2];
         break;
     }

     rootProfile = dataRoot + "/" + subDir;

     return rootProfile;
 }

 function testProfile() {
     let path = getProfilePath();
     let dbPath = null;
     let profileFile = null;

     try{
         dbPath = fs.statSync(path + "/db/main.db");
     } catch(e){
         //console.err("Not found: "  + path);
     }

     try{
         profileFile = fs.statSync(rootPath + MCPROFILE);
     } catch(e){
         console.err("Not found: "  + rootPath + MCPROFILE);
         //todo: throw new Error !!!

         setTimeout(function () {
             process.exit(900);
         }, 60);
     }

     if (profileFile && !dbPath){
         makeProfile(path.replace(/\\/g, "/"));
     }
 }

 function makeProfile(profilePath) {
     let zip = new require('adm-zip')(rootPath + MCPROFILE);

     try {
         zip.extractAllTo(profilePath, true);
     } catch (e){
         console.immediately(e.message);
     }
 }

 function extractFile(filePathInProfile) {
     const zip = new require('adm-zip')(rootPath + MCPROFILE);

     if (!rootProfile) {
         getProfilePath();
     }

     try{
         zip.extractEntryTo(filePathInProfile, rootProfile, true, true);
     } catch (e){
         console.immediately(e.message);
     }
 }

 exports.getProfilePath = getProfilePath;
 exports.testProfile    = testProfile;
 exports.extractFile    = extractFile;
 exports.init           = init;