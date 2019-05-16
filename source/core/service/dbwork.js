 
 const fs       = require('fs');
 const console  = require('gifer-console');
 const util     = require('util');
 const os       = require('os');
 const HOME_DIR = require('./service').HOME_DIR;

 let updateVersion = {};
 let sqlite3    = null;
 let db	        = null;
 let debugLog   = true;
 let DBPath 	= "";
 let DBWork 	= {
     servers    : {},
     userStorage: {},
     statistics : {},
     system     : {},
     userPath   : {},
     userFiles  : {},
     dialogsHistory: {}
 };
 let dbLogLevel = console.logLevel.L_Extended;
 let CRLF       = '\r\n';
 
 try {
     sqlite3 = require('sqlite3').verbose();
 } catch (e){
     console.immediately("DbWork init:\n" + module.paths.join('\n'));
     console.immediately(e.message);
     console.immediately(e.stack);

     process.exit(800);
 }

 function connect() {
     db = new sqlite3.Database(DBPath);

     return db;
 }

 function close() {
     if (db) {
         db.close();
     }
 }

 function _run_DB_func (_sql, params, logging){
     return new Promise(function (res, rej) {
         try {
             db.all(_sql, params, function(err, rows){
                 if (!err){
                     if (logging){
                         console.log("Runned SQL: " + _sql + " > with params: " + (util.isArray(params) ? params.join(" | ") : params), dbLogLevel );
                         console.log("Result: " + JSON.stringify({'ROWS' : rows}), dbLogLevel);
                     }

                     res(rows);
                 } else {
                     console.err(err.message);

                     rej("(DBWork) Error occured at sql: " + _sql);
                 }
             });
         } catch (e){
             console.err(err.message);

             rej("(DBWork) Error occured at sql: " + _sql);
         }
     });
 }

 function _run_multiple_DB_func (queries, logging){
     return new Promise(function (res, rej) {
         db.serialize(function () {
             Object.keys(queries).forEach(function (qIdx) {
                 let query = queries[qIdx];

                 db.all(query.sql, query.params || [], function (err, data) {
                     if (!err) {
                         if (logging) {
                             console.log("Runned SQL: " + query.sql + " > with params: " + (util.isArray(query.params) ? query.params.join(" | ") : query.params), dbLogLevel);
                             console.log("Result: " + JSON.stringify({'ROWS': data}), dbLogLevel);
                         }

                         if (query.callback) {
                             res(data);
                         }
                     } else {
                         console.err(err.stack, true);
                         console.err(err.message, true);

                         rej("(DBWork) Error occured at sql: " + query.sql);
                     }
                 });
             })
         });
     });
 }

 updateVersion['2'] = function (ver) {
     return _run_multiple_DB_func({
         "1": {
             sql : `CREATE TABLE [user_storage] (
                        [srv] INT,
                        [uin] INT,
                        [name] VARCHAR,
                        [value] VARCHAR)`
         },
         "2": { sql: "CREATE INDEX [uin] ON [user_storage] ([uin])"},
         "3": { sql: "CREATE INDEX [name] ON [user_storage] ([name])"},
         "4": {
             sql : 'update system set verdb=?',
             params: [ver],
             callback: true
         }
     }, debugLog);
 };

 updateVersion['3'] = function (ver) {
     return _run_DB_func('update system set verdb=?', [ver], debugLog);
 };

 updateVersion['4'] = function (ver) {
     return _run_multiple_DB_func({
         "1": {
             sql : `CREATE TABLE [statistics] (
                        [servid] INTEGER, 
                        [uin] INTEGER, 
                        [stat] VARCHAR)`
         },
         "2": { sql: "CREATE INDEX [id] ON [statistics] ([servid], [uin])"},
         "3": {
             sql : 'update system set verdb=?',
             params: [ver],
             callback: true
         }
     }, debugLog);
 };

 updateVersion['5'] = function (ver) {
     return _run_multiple_DB_func({
         "1": { sql: "DROP INDEX uin" },
         "2": { sql: "DROP INDEX name" },
         "3": { sql: "CREATE INDEX [uin] ON [user_storage] ([uin])"},
         "4": { sql: "CREATE INDEX [name] ON [user_storage] ([name])"},
         "5": {
             sql : 'update system set verdb=?',
             params: [ver],
             callback: true
         }
     }, debugLog);
 };

 updateVersion['6'] = function (ver) {
     return _run_multiple_DB_func({
         "1": { sql: "alter table system add column hardware_id VARCHAR"},
         "2": {
             sql : 'update system set verdb=?',
             params: [ver],
             callback: true
         }
     }, debugLog);
 };

 updateVersion['7'] = function (ver) {
     return _run_multiple_DB_func({
         "1": { sql: "alter table system add column download_folder VARCHAR"},
         "2": {
             sql: "update system set download_folder=?",
             params: [os.homedir() + HOME_DIR]
         },
         "4": { sql: "CREATE TABLE [files] ("+
                     "[uin_owner] INTEGER NOT NULL,"+
                     "[hash] VARCHAR NOT NULL,"+
                     "[sTimeStamp] VARCHAR NOT NULL,"+
                     "[FullPathWithName] VARCHAR NOT NULL,"+
                     "[serv_id] INTEGER NOT NULL);"},
         "5": { sql: "CREATE INDEX [filesuinservidhashtimestamp] ON [files] ([uin_owner], [serv_id], [hash], [sTimeStamp]);"},
         "6": { sql: "CREATE INDEX [filesuinservidhash] ON [files] ([uin_owner], [serv_id], [hash]);" },

         "7": { sql: "CREATE TABLE [users_path] (" +
                     "[uin_owner] INTEGER NOT NULL," +
                     "[serv_id] INTEGER NOT NULL," +
                     "[uin] INTEGER NOT NULL," +
                     "[path] VARCHAR NOT NULL);"},
         "8": {sql:  "CREATE INDEX [userspathuinowneruinservid] ON [users_path] ([uin_owner], [serv_id], [uin]);" },
         
         "9": {
             sql : 'update system set verdb=?',
             params: [ver],
             callback: true
         }
     }, debugLog);
 };

 updateVersion['8'] = function (ver) {
     return _run_multiple_DB_func({
         "1": {
             sql: "CREATE TABLE [dialogs_history] ("+
                  "[serv_id] INTEGER NOT NULL,"+
                  "[uin_owner] INTEGER NOT NULL,"+
                  "[history] VARCHAR NOT NULL);"},

         "2": { sql: "CREATE INDEX [idx_dialogs_history] ON [dialogs_history] ([serv_id], [uin_owner]);"},
         "3": { sql: "alter table system add column nick VARCHAR"},
         "4": {
             sql : 'update system set verdb=?',
             params: [ver],
             callback: true
         }
     });
 };

 updateVersion['9'] = function (ver) {
     return _run_multiple_DB_func({
         "1": { sql: "alter table mcservers add column secure INTEGER"},
         "2": { sql: "update mcservers set secure=0"},
         "3": {
             sql : 'update system set verdb=?',
             params: [ver],
             callback: true
         }
     });
 };

 updateVersion['10'] = function (ver) {
     return _run_multiple_DB_func({
         "1": { sql: "alter table system add column client_settings VARCHAR"},
         "2": { sql: "update system set client_settings=\"{}\""},
         "3": {
             sql : 'update system set verdb=?',
             params: [ver],
             callback: true
         }
     });
 };

 updateVersion['11'] = function (ver) {
     return _run_multiple_DB_func({
         "1": { sql: "ALTER TABLE system RENAME TO temp_system"},
         "2": { sql: "CREATE TABLE system (" +
                         "verdb INTEGER NOT NULL," +
                         "dtstart DATETIME," +
                         "statcrc32 INTEGER DEFAULT 0," +
                         "pwd VARCHAR," +
                         "autoconnect BOOLEAN," +
                         "srvpwd VARCHAR," +
                         "uin VARCHAR," +
                         "hardware_id VARCHAR," +
                         "download_folder VARCHAR," +
                         "client_settings VARCHAR," +
                         "nick VARCHAR)"},
         "3": { sql: "INSERT INTO system SELECT verdb, dtstart, statcrc32, pwd, autoconnect, srvpwd, uin, hardware_id, download_folder, mydata as client_settings, nick FROM temp_system"},
         "4": { sql: "DROP TABLE temp_system"},
         "5": {
             sql : 'update system set verdb=?',
             params: [ver],
             callback: true
         }
     });
 };

 updateVersion['12'] = function (ver) {
     return _run_multiple_DB_func({
         "1": { sql: "alter table system add column settings_crc32 VARCHAR"},
         "2": {
             sql : 'update system set verdb=?',
             params: [ver],
             callback: true
         }
     });
 };

 // ===========================================================

 // Добавление пути в роутер_лист
 DBWork.servers.getList = function () {
     return _run_DB_func('select rowid,* from mcservers', [], true);
 };

 DBWork.servers.serverExists = function (ip, port, srvId) {
     return _run_DB_func('select rowid as chkID from mcservers where IP=? and port=?' + (srvId ? " and rowid<>?" : ""), [ip, port].concat(srvId ? [srvId] : []), debugLog);
 };

 DBWork.servers.saveServer = function (srv) {
     return _run_DB_func('update mcservers set IP=?, port=?, name=?, description=?, pwd=?, alternate_ip=?, alternate_port=?, secure=? where rowid=?', srv, debugLog);
 };

 DBWork.servers.delServer = function (id) {
     return _run_DB_func('delete from mcservers where rowid=?', [parseInt(id)], debugLog);
 };

 DBWork.servers.addServer = function (srv) {
     return _run_multiple_DB_func({
         "1": {
             sql : 'insert INTO mcservers (IP, port, name, description, pwd, alternate_ip, alternate_port, secure) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
             params : srv
         },
         "2": {
             sql : 'select max(rowid) as servID from mcservers',
             callback: true
         }
     }, debugLog);
 };

 // = STORAGE - user_storage =================================

 DBWork.userStorage.update = function (srv, uin, name, value) {
     return _run_DB_func('update user_storage set value=? where srv=? and uin=? and name=?', [value, srv, uin, name], debugLog);
 };

 DBWork.userStorage.add = function (srv, uin, name, value) {
     return _run_DB_func('insert INTO user_storage (srv, uin, name, value) VALUES (?, ?, ?, ?)', [srv, uin, name, value], debugLog);
 };

 DBWork.userStorage.remove = function (srv, uin, name) {
     return _run_DB_func('delete from user_storage where srv=? and uin=? and name=?', [srv, uin, name], debugLog);
 };

 DBWork.userStorage.get = function (srv, uin, name) {
     return _run_DB_func('select value from user_storage where srv=? and uin=? and name=?', [srv, uin, name], debugLog);
 };

 // ===========================================================

 DBWork.getVersionDB = function () {
     return _run_DB_func('select verdb from system', [], debugLog);
 };

 DBWork.setVersionDB = function (ver) {
     return _run_DB_func('update system set verdb=?', [ver], debugLog);
 };

 DBWork.getVersionCount = function () {
     return Object.keys(updateVersion).length + 1;
 };

 DBWork.updateToVer = function (ver) {
     if (updateVersion.hasOwnProperty(ver)){
         return updateVersion[ver](ver);
     }
 };

 // ===========================================================

 DBWork.statistics = {
    update : function (srv, uin, stat) {
     return _run_DB_func('update statistics set stat=? where servid=? and uin=?', [stat, srv, uin], debugLog);
 },

    add : function (srv, uin, stat) {
     return _run_DB_func('insert INTO statistics (servid, uin, stat) VALUES (?, ?, ?)', [srv, uin, stat], debugLog);
 },

    remove : function (srvid, uin) {
     return _run_DB_func('delete from statistics where servid=? and uin=?', [srvid, uin], debugLog);
 },

    get : function (srv, uin) {
     return _run_DB_func('select stat from statistics where servid=? and uin=?', [srv, uin], debugLog);
 }
 };

 DBWork.dialogsHistory = {
     remove: function (servId, uin) {
         return _run_DB_func('delete from dialogs_history where serv_id=? and uin_owner=?', [servId, uin], debugLog);
     },
     get: function (servId, uin) {
         return _run_DB_func('select history from dialogs_history where serv_id=? and uin_owner=?', [servId, uin], debugLog);
     },
     set: function (servId, uin, data) {
         return _run_multiple_DB_func({
             "1": {
                 sql   : 'delete from dialogs_history where serv_id=? and uin_owner=?',
                 params: [servId, uin]
             },
             "2": {
                 sql     : 'insert INTO dialogs_history (serv_id, uin_owner, history) VALUES (?, ?, ?)',
                 params  : [servId, uin, data],
                 callback: true
             }
         }, debugLog);
     }
 };

 // ===========================================================
 
 DBWork.system.hardwareID = {
     get: function () {
         return _run_DB_func('select hardware_id from system', [], debugLog);
     },
     set: function (id) {
         return _run_DB_func('update system set hardware_id=?', [id], debugLog);
     }
 };

 DBWork.system.downloadFolder = {
     get: function () {
         return _run_DB_func('select download_folder from system', [], debugLog);
     },
     set: function (folder) {
         return _run_DB_func('update system set download_folder=?', [folder], debugLog);
     }
 };

 DBWork.system.getAllSettings = function () {
     return _run_DB_func('select * from system', [], debugLog);
 };

 DBWork.system.setClientSettings = function (client_settings) {
     return _run_DB_func('update system set client_settings=?', [client_settings], debugLog);
 };

 DBWork.system.setSettingsCRC32 = function (crc32) {
     return _run_DB_func('update system set settings_crc32=?', [crc32], debugLog);
 };

 DBWork.system.savePrvPwd = function (pwd, rm, srvpwd, uin, nick) {
     return _run_DB_func('update system set pwd=?, autoconnect=?, srvpwd=?, uin=?, nick=?', [pwd, rm, srvpwd, uin, nick], debugLog);
 };

 DBWork.system.loadPrvPwd = function () {
     return _run_DB_func('select pwd, autoconnect, srvpwd, uin, nick from system', [], debugLog);
 };

 // ===========================================================

 DBWork.userPath = {
     get: function (servId, myUin, userUin) {
         return _run_DB_func('select path from users_path where serv_id=? and uin_owner=? and uin=?', [servId, myUin, userUin], debugLog);
     },
     set: function (servId, myUin, userUin, path) {
         return _run_multiple_DB_func({
             "1": {
                 sql   : 'delete from users_path where serv_id=? and uin_owner=? and uin=?',
                 params: [servId, myUin, userUin]
             },
             "2": {
                 sql     : 'insert INTO users_path (serv_id, uin_owner, uin, path) VALUES (?, ?, ?, ?)',
                 params  : [servId, myUin, userUin, path]
             }
         }, debugLog);
     }
 };

 DBWork.userFiles = {
     //[files] - [uin_owner][hash][sTimeStamp][FullPathWithName][servid]
     get: function (servId, uin_owner, hash) {
         return _run_DB_func('select FullPathWithName, sTimeStamp from files where serv_id=? and uin_owner=? and hash=?', [servId, uin_owner, hash], debugLog);
     },
     set: function (servId, uin_owner, hash, sTimeStamp, FullPathWithName) {
         return _run_multiple_DB_func({
             "1": {
                 sql   : 'delete from files where serv_id=? and uin_owner=? and hash=?',
                 params: [servId, uin_owner, hash]
             },
             "2": {
                 sql     : 'insert INTO files (serv_id, uin_owner, hash, sTimeStamp, FullPathWithName) VALUES (?, ?, ?, ?, ?)',
                 params  : [servId, uin_owner, hash, sTimeStamp, FullPathWithName]
             }
         }, debugLog);
     }
 };

 // ===========================================================

 exports.connect = connect;
 exports.close   = close;
 exports.do      = DBWork;

 exports.Init    = function(path, _dbLogLevel){
     DBPath   = path || (MCPathes.Index + '/db/main.db');
     dbLogLevel = _dbLogLevel || console.logLevel.L_Extended;

     return new Promise(function (res, rej) {
         fs.exists(DBPath, function (exists) {
             if (!exists) {
                 rej("Cant found " + DBPath + " file!");
             } else {
                 res();
             }
         });
     });
 };