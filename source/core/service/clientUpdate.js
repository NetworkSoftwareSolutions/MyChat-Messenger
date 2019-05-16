 /**
 * Created by Gifer on 21.02.2017.
 * Список операций после обновления базы до конкретной версии
 */

 const console  = require('gifer-console');
 const DbWork   = require('./dbwork');
 const Profile  = require('./profile');

 let updates = {};

 function newDbVersion(ver, dbVer, callback) {
     return DbWork.do.updateToVer(ver)
         .then(function () {
             console.log('Update DB to ver ' + ver);

             if (callback) {
                 callback(ver);
             }

             if (ver < dbVer){
                 ver ++;

                 if (!updates.hasOwnProperty(ver)){
                     throw new Error('Can\'t find DB update ver ' + ver);
                 }

                 return updates[ver](ver);
             }
         })
     ;
 }

 function init(dbVer) { // fill "updates" structure
     for (let i = 2; i <= dbVer; i++){
         switch (i){
             case 3:
                 updates[i] =  function (ver) {
                     return newDbVersion(ver, dbVer, () => Profile.extractFile('images/256x256.png'))
                 };
             break;

             default:
                 updates[i] = function (ver) {
                     return newDbVersion(ver, dbVer);
                 };
         }
     }
 }

 exports.updateDB = function () {
     let dbVer = DbWork.do.getVersionCount();

     init(dbVer);

     return DbWork.do.getVersionDB()
         .then(function ([res]) {
             let ver = res.verdb;

             console.log('Current DB version: ' + ver);

             if (ver < dbVer){
                 ver ++;

                 return updates[ver](ver, dbVer);
             } else
             if (ver > dbVer){
                 throw new Error('DB version can\'t be higher when client need. VerDB: "' + ver + '" and client: "' + dbVer + '"');
             } else {
                 return true;
             }
         })
     ;
 };