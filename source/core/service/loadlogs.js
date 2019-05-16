/**
 * Created by Gifer on 06.05.2015.
 */
 "use strict";

 var Service = require('./service');
 var CMD     = require('./mcconnect').CMD;
 var util    = require('util');
 var console = require('gifer-console');
 var fs      = require('fs');

 var oneDay = 1000*60*60*24;
 var CRLF = "\r\n";
 var CR   = "\r";
 var LF   = "\n";

 function SendFile(socket, sendCMD, _params, bufferSize){
     var QTask = new Service.TaskList();

     this.addFile = function(_path, _this, _date){
         QTask.AddTask(function(){
             var next = this.next;
             var date = Service.formatDate(new Date(parseInt(_date)), 'dd.mm.yyyy');

             if (socket.UserInfo.StopLoadLogs){
                 next();
             } else {
                 Service.LoadFile(_path, function(data){
                     var out = {
                         Source : "",
                         Date   : ""
                     };

                     if (data == null){
                         if (!socket.UserInfo.StopLoadLogs){ // _date == dtFrom &&
                             //sendCMD.apply(_this,[CMD.Logs, {
                             out = {
                                 Date      : date,
                                 Chunk     : "0/0",
                                 Type      : _params.Type,
                                 Params    : _params.original,
                                 LastChunk : true,
                                 Source    : ""
                             };

                             if (_params.CMD == CMD.History){
                                 out.UIN = _params.UIN2;
                             }

                             sendCMD.apply(_this,[_params.CMD, out]);

                             console.log('SendChunk no file to load: ' + _path, console.logLevel.L_High);
                         }
                     } else {
                         var chunks       = (new Buffer(data).toString()).split((_params.Type == 'nodejs') ? LF : CRLF);
                         var currentChunk = 0;
                         var first        = true;

                         for (var i = chunks.length - 1; i >= 0; i --){
                             out.Source = chunks[i] + CR + (out.Source || "");

                             if (socket.UserInfo.StopLoadLogs){
                                 break;
                             }

                             if (out.Source.length >= bufferSize || i == 0){
                                 currentChunk += out.Source.length;

                                 out.Date      = date;
                                 out.Chunk     = currentChunk + '/' + data.length;
                                 out.Type      = _params.Type;
                                 out.Params    = _params.original;
                                 out.FirstChunk = first;
                                 out.LastChunk = i === 0;

                                 if (_params.CMD == CMD.History){
                                     out.UIN = _params.UIN2;
                                 }

                                 first = false;

                                 sendCMD.apply(_this,[_params.CMD, out]);
                                 //sendCMD.apply(_this,[CMD.Logs, out]);

                                 console.log('SendChunk:\n' + JSON.stringify(out), console.logLevel.L_High);

                                 out = {};
                             }
                         }
                     }

                     next();
                 }, (_params.Type == "nodejs") ? 'utf8' : 'win1251');
             }
         });
     };

     this.Run = QTask.Run;
 }

 module.exports.Load = function(_params, sendCMD, UsersInBuffer, ErrorText){
     var socket   = this;
     var UserInfo = this.UserInfo;
     var _errNum  = 0;

     function checkRights(type){
        var res = false;

        switch (type) {
            case "selfPrivate":
                res = (socket.RightSet[43] == '1') ? Service.Replace('%s_%s.log', "%s", Service.minimumOfTwo(_params.UIN1, _params.UIN2)): '';

                if (!res) _errNum = 140;
            break;

            case "private":
                res = (socket.RightSet[45] == '1') ? Service.Replace('%s_%s.log', "%s", Service.minimumOfTwo(_params.UIN1, _params.UIN2)): '';

                if (!res) _errNum = 139;
            break;

            case "channels":
                res = (socket.RightSet[44] == '1') ? 'txtch_' + _params.UID + '.log': '';

                if (!res) _errNum = 138;
            break;

            case "ftp":
                res = (socket.RightSet[54] == '1') ? 'ftp.log': '';

                if (!res) _errNum = 137;
            break;

            case "system":
                res = (socket.RightSet[55] == '1') ? 'system.log': '';

                if (!res) _errNum = 141;
            break;

            case "nodejs":
                res = (socket.RightSet[86] == '1') ? 'node.log': '';

                if (!res) _errNum = 142;
            break;

            case "script":
                res = (socket.RightSet[132] == '1') ? 'script.log': '';

                if (!res) _errNum = 169;
            break;

            case "audit":
                res = (socket.RightSet[87] == '1') ? 'audit.log': '';

                if (!res) _errNum = 143;
            break;
        }

        return res;
    }

    if (_params.Type == "private" && (_params.UIN1 == UserInfo.UIN || _params.UIN2 == UserInfo.UIN)){
        _params.Type = "selfPrivate";
    }

    var file       = checkRights(_params.Type);

    if (file){
        var bufferSize = _params.BufferSize || MCServer.sendBufferSize;

        if ( bufferSize > MCServer.maxUploadData ) {
            bufferSize = MCServer.sendBufferSize;
        }

        var sendResult = new SendFile(socket, sendCMD, _params, bufferSize);

        socket.UserInfo.StopLoadLogs = false;

        for (var  dt = _params.dtTo; dt >= _params.dtFrom; dt = dt - oneDay){
            var _file = Service.formatDate(new Date(parseInt(dt)), 'yyyy/mm/dd/') + file;

            console.log('ClientToServCMD[CMD.Logs] ' + MCPathes.History + _file, console.logLevel.L_High);

            sendResult.addFile(MCPathes.History + _file, UserInfo, dt);
        }

        sendResult.Run();
    } else {
        var out           = {};
        out[CMD.sc_error] = {
            ErrNum : _errNum,
            Params : []
        };

        UsersInBuffer.AddDataToInBuf(out);

        console.warn("MCServer ERROR: [" + out[CMD.sc_error].ErrNum + "] " + util.format(ErrorText[out[CMD.sc_error].ErrNum],
            out[CMD.sc_error].Params) + "\nFor sID: " + socket.UserInfo.sessionID, console.logLevel.L_Normal);
    }

 };

 module.exports.LoadLogsManyToOne = function(_params, sendCMD, UsersInBuffer, ErrorText) {
     var socket  = this;
     var UserInfo= this.UserInfo;
     var _errNum = 0;
     var uinWith = _params.UIN1 == '-1' ? _params.UIN2 : _params.UIN1;

     if (socket.RightSet[43] != '1'){
         _errNum = 140;
     } else
     if (socket.RightSet[45] != '1') {
         _errNum = 139;
     }

     if (_errNum || uinWith == "-1"){
         var out = {};

         out[CMD.sc_error] = {
             ErrNum : _errNum,
             Params : []
         };

         UsersInBuffer.AddDataToInBuf(out);

         console.warn("MCServer ERROR: [" + out[CMD.sc_error].ErrNum + "] " + util.format(ErrorText[out[CMD.sc_error].ErrNum],
             out[CMD.sc_error].Params) + "\nFor sID: " + socket.UserInfo.sessionID, console.logLevel.L_Normal);
     } else {
         var bufferSize = _params.BufferSize || MCServer.sendBufferSize;

         if ( bufferSize > MCServer.maxUploadData ) {
             bufferSize = MCServer.sendBufferSize;
         }

         var sendResult = new SendFile(socket, sendCMD, _params, bufferSize);
         var noFiles    = true;

         socket.UserInfo.StopLoadLogs = false;

         for (var  dt = _params.dtTo; dt >= _params.dtFrom; dt = dt - oneDay) {
             var files = [];
             var dir   = MCPathes.History + Service.formatDate(new Date(parseInt(dt)), 'yyyy/mm/dd/') + '/';

             try{
                 files = fs.readdirSync(dir);
             } catch (e){}

             for (var item in files){
                 if ((new RegExp("^" + uinWith + "\\_\\d+\\.log$|^\\d+\\_" + uinWith + "\\.log$")).test(files[item])){
                     sendResult.addFile(dir + files[item], UserInfo, dt);

                     noFiles = false;
                 }
             }

             if (noFiles){
                 sendResult.addFile(dir + 'n-o-f-i-l-e', UserInfo, dt);
             }
         }

         sendResult.Run();
     }
 };