 /**
  * Created by Gifer on 07.08.2015.
  */
 "use strict";

 var fse         = require('fs-extra');
 var fs          = require('fs');
 var path        = require('path');
 var exec        = require('child_process').exec;
 var build       = require('./build').build;
 var console     = require('gifer-console');
 var Service     = require('../source/core/service/service');
 var archiver    = require('archiver');

 var LoadFile    = Service.LoadFile;
 var ExtractPath = Service.ExtractPath;
 var StringToObj = Service.StringToObj;
 var isObject    = Service.isObject;
 var isString    = Service.isString;
 var t           = Service.TaskList;

 var Q = new t();

 var projectJSON = "E:\\projects\\mcAlternativ\\build_js\\package.json";
 var sourceFile  = "E:\\projects\\mcAlternativ\\build_js\\release.json";
 var IDX         = "E:\\projects\\mcAlternativ\\build_js\\idx";
 var releasePath = "E:\\projects\\mcAlternativ\\prebuild\\";
 var asarPath    = "E:\\projects\\mcAlternativ\\asarFile\\";
 var root        = "E:\\projects\\mcAlternativ\\source\\";

 var currentIDX  = 0;

 function copyReleaseFiles(list, targetPath, _root){
     for (var i = 0; i < list.length; i++){
         var item = list[i];

         if (isObject(item)){
             var name = Object.keys(item)[0];

             if (name == "_clearRecursive"){
                 console.info('Clear folder: ' + targetPath);

                 fse.removeSync(targetPath);
                 fse.ensureDirSync(targetPath);
             } else {
                 copyReleaseFiles(item[name], targetPath + name + "\\", _root + name + "\\");
             }
         } else
         if (isString(item)){
             console.log("Copy: " + _root + item);

             fse.copySync(_root + item, targetPath + item);
         }
     }
 }

 Q.AddTask(function() {
     LoadFile(IDX, function (_idx) {
         currentIDX = parseInt(_idx);

         Q.Next();
     });
 });

 Q.AddTask(function(){
     LoadFile(projectJSON, function (data) {
         var prJSON = Service.myReplaceFormated(data, {
             clientVersion       : Service.MCServer.ClientVersion,
             clientVersionWithIDX: Service.MCServer.ClientVersion + '.' + currentIDX,
             electronVersion     : Service.MCServer.ElectronVersion,
             electronVersionShort: Service.MCServer.ElectronVersionShort,
             electronNodeVersion : Service.MCServer.ElectronNodeVersion
         });

         try{
             fse.removeSync(root + "package.json");
         } catch (e) {}

         fse.writeFileSync(root + "package.json", prJSON);

         Q.Next();
     });
 });

 Q.AddTask(function(){
     build(root + "core\\client\\", "chat",    root + "core\\client\\source.js", this.next);
 });

 Q.AddTask(function(){
     LoadFile(sourceFile, function(source){
         source = StringToObj(source);

         copyReleaseFiles(source.Release, releasePath, root);

         if (source.ExternalSource){
             for (var i = 0; i < source.ExternalSource.length; i++ ){
                 var item = source.ExternalSource[i];
                 var sourceFolder = Object.keys(item)[0];

                 console.info('Adding External Folder: ' + sourceFolder);

                 copyReleaseFiles(item[sourceFolder].Source, releasePath + item[sourceFolder].Target, sourceFolder);
             }
         }

         var loader = releasePath + 'core\\client\\modules\\mctools\\loader.js';

         LoadFile(loader, function(source){
             source = source.replace("var loadProjectType = MC_DEVELOP;", "var loadProjectType = MC_RELEASE;");

             fse.writeFileSync(loader, source);

             Q.Next();
         });
     });
 });

 function getDirectories(srcpath) {
     return fs.readdirSync(srcpath).filter(function(file) {
         return fs.statSync(path.join(srcpath, file)).isDirectory();
     });
 }

 Q.AddTask(function () {
     console.log("create mcprofile.dat");

     fse.deleteSync(releasePath + "\\core\\mcprofile.dat");

     var output     = fs.createWriteStream(releasePath + "\\core\\mcprofile.dat");
     var zipArchive = archiver('zip');

     process.chdir(__dirname + "\\mcprofile");

     output.on('close', function() {
         console.log('Complete!');

         Q.Next();
     });

     zipArchive.pipe(output);

     zipArchive.bulk([
         { src: [ '**/*' ], cwd: '.', expand: true }
     ]);

     zipArchive.finalize(function(err) {
         if(err) {
             throw err;
         }

         // Q.Next();
     });
 });

 Q.AddTask(function () {
     try{
         fse.removeSync(IDX);
     } catch (e) {}

     fse.writeFileSync(IDX, currentIDX + 1);
 });

 Q.Run();