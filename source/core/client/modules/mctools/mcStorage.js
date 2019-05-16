 /**
 * Created by Gifer on 21.02.2017.
 */

 function mcStorage($rootScope) {
     "use strict";
     var callBackFunctions = {};

     function sendData(data) {
         $rootScope.$broadcast('sendCMDToElectron', [data.cmd].concat(data.values).concat([
             function (res) {
                 if (res && callBackFunctions[res.name]){
                     callBackFunctions[res.name].shift()(res.data);
                 } else
                 if (data && data.cb){
                     data.cb(res)
                 }
             }
         ]));
     }

     $rootScope.Storage = {
         historyDialogs : {
             load: function (uin, name, cb) {
                 if ($rootScope.isWebClient){
                     if (cb) {
                         cb(webix.storage.local.get(name + uin));
                     } else {
                         return webix.storage.local.get(name + uin);
                     }
                 } else {
                     if (!callBackFunctions[name]){
                         callBackFunctions[name] = [];
                     }

                     callBackFunctions[name].push(cb);
                                          
                     sendData({
                         cmd: mcConst._CMD_.ce_history_get_dialogs,
                         values: [],
                         cb: cb
                     });
                 }
             },

             remove: function (uin, name, cb) {
                 if ($rootScope.isWebClient){
                     if (cb) {
                         cb(webix.storage.local.remove(name + uin));
                     } else {
                         return webix.storage.local.remove(name + uin);
                     }
                 } else {
                     sendData({
                         cmd: mcConst._CMD_.ce_history_remove_dialogs,
                         values: [],
                         cb: cb
                     });
                 }
             },

             save: function (uin, name, data, cb) {
                 if ($rootScope.isWebClient){
                     if (cb) {
                         cb(webix.storage.local.put(name + uin, data));
                     } else {
                         return webix.storage.local.put(name + uin, data);
                     }
                 } else {
                     sendData({
                         cmd: mcConst._CMD_.ce_history_set_dialogs,
                         values: [
                             data
                         ],
                         cb: cb
                     });
                 }
             }
         },
         dialogs : {
             load: function (serverID, uin, name, cb) {
                 if ($rootScope.isWebClient){
                     if (cb) {
                         cb(webix.storage.local.get(name + uin));
                     } else {
                         return webix.storage.local.get(name + uin);
                     }
                 } else {
                     if (!callBackFunctions[name]){
                         callBackFunctions[name] = [];
                     }

                     callBackFunctions[name].push(cb);
                     
                     sendData({
                         cmd: mcConst._CMD_.ce_storage_get,
                         values: [
                             serverID,
                             uin,
                             name
                         ],
                         cb: cb
                     });
                 }
             },

             remove: function (serverID, uin, name, cb) {
                 if ($rootScope.isWebClient){
                     if (cb) {
                         cb(webix.storage.local.remove(name + uin));
                     } else {
                         return webix.storage.local.remove(name + uin);
                     }
                 } else {
                     sendData({
                         cmd: mcConst._CMD_.ce_storage_remove,
                         values: [
                             serverID,
                             uin,
                             name
                         ],
                         cb: cb
                     });
                 }
             },

             save: function (serverID, uin, name, data, cb) {
                 if ($rootScope.isWebClient){
                     if (cb) {
                         cb(webix.storage.local.put(name + uin, data));
                     } else {
                         return webix.storage.local.put(name + uin, data);
                     }
                 } else {
                     sendData({
                         cmd: mcConst._CMD_.ce_storage_save,
                         values: [
                             serverID,
                             uin,
                             name,
                             data
                         ],
                         cb: cb
                     });
                 }
             }
         },
         statistics : {
             load: function (serverID, uin, cb) {
                 if (!$rootScope.isWebClient){
                     if (!callBackFunctions[name]){
                         callBackFunctions[name] = [];
                     }

                     callBackFunctions[name].push(cb);

                     sendData({
                         cmd: mcConst._CMD_.ce_statistics_get,
                         values: [
                             serverID,
                             uin,
                         ],
                         cb: cb
                     });
                 }
             },

             save: function (serverID, uin, stat, cb) { // mcConst.ServerInfo.ID
                 if (!$rootScope.isWebClient){
                     sendData({
                         cmd: mcConst._CMD_.ce_statistics_save,
                         values: [
                             serverID,
                             uin,
                             stat
                         ],
                         cb: cb
                     });
                 }
             }
         }
     };

     window.mcStorage = $rootScope.Storage;
 }
