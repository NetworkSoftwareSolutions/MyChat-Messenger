/**
 * Created by Gifer on 11.08.2016.
 */

"use strict";

function CtrlServersManager($rootScope) {
    var serversInfo   = $rootScope.acConfig.serversInfo;
    var currentServer = mcConst.ServerInfo;/* || {
        Port : null,
        Host : null,
        ID   : null
    };*/

    this.getServerInfoByID = function (id) {
        return serversInfo.hasOwnProperty(id) ? mcService.Marge({}, serversInfo[id]) : null;
    };

    this.addServerInfo = function (info) {
        if (mcService.isObject(info) && info.ID){
            serversInfo[info.ID] = serversInfo[info.ID] ? mcService.Marge(serversInfo[info.ID], info) : info;

            return serversInfo[info.ID];
        } else {
            console.error('addServerInfo incorrect data: ' + info);

            return false;
        }
    };

    this.hasServerByID = function (id) {
        return serversInfo.hasOwnProperty(id);
    };

    this.setCurrentServerByID = function (id) {
        if (serversInfo.hasOwnProperty(id)){
            currentServer.Port = serversInfo[id].Port;
            currentServer.Host = serversInfo[id].ServHost;
            currentServer.ID   = id;
            currentServer.IPv6 = mcService.isValidIpAddressV6(serversInfo[id].ServHost);
            currentServer.Secured = serversInfo[id].Secured;

            return mcService.Marge({}, serversInfo[id]);
        } else {
            currentServer.Port = null;
            currentServer.Host = null;
            currentServer.ID   = null;
            currentServer.IPv6 = false;
            currentServer.Secured = false;

            return false;
        }
    };

    this.getCurrentServer = function () {
        return mcService.Marge({}, currentServer);
    };

    this.removeServerByID = function (id) {
        if (serversInfo.hasOwnProperty(id)){
            delete serversInfo[id];
        } else {
            console.error('removeServerByID, unknown id: ' + id);
        }
    };

    this.mapServers = function (cb) {
        var res = [];
        var srv = null;

        for (var i in serversInfo){
            srv = mcService.Marge({}, serversInfo[i]);

            var info = cb ? cb(srv) : srv;

            if (info){
                res.push(info);
            }
        }

        return res;
    };

    this.getServerIdByOrderPosition = function (pos) {
        return Object.keys(serversInfo)[pos];
    };

    this.getServerIdByServID = function (serverID) {
        var id = null;

        for (var i in serversInfo){
            if (serversInfo[i].ServerID == serverID){
                id = serversInfo[i].ID;

                break;
            }
        }

        return id;
    };

    this.getAutoConnectInfo = function (cb) {
        $rootScope.$broadcast("sendCMDToElectron", [
            mcConst._CMD_.ce_load_autoconnect_server,
            cb
        ]);
    };

    this.setAutoConnectInfo = function (pwd, rm, srvpwd) {
        $rootScope.$broadcast("sendCMDToElectron", [
            mcConst._CMD_.ce_save_autoconnect_server,
            pwd,
            rm,
            srvpwd,
            mcConst.UserInfo.UIN,
            mcConst.LoginInfo.login
        ]);
    };
}
