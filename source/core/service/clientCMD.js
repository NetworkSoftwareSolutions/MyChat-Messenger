 /**
 * Created by Gifer on 13.02.2017.
 */

 var loadLogs = require('./loadlogs');
 var console  = require('gifer-console');
 var Service  = require('./service.js');
 var CMD      = require('../client/modules/cmd/cmd').CMD;

 var oneDay = 1000*60*60*24;
 var CRLF   = "\r\n";
 var CR     = "\r";
 var LF     = "\n";

 var ClientToServCMD = {};
 var MagicPacket     = '\u0017\u0006';
 var SendingFlags    = '00';
 var ProtocolVersion = MCServer.ProtocolVersion;
 var ClientVersion   = MCServer.ClientVersion;

 // ====================== CLIENT TO SERVER =============================

 ClientToServCMD[CMD.cs_hello]                = function(__socket){
     var res = MagicPacket + CMD.cs_hello + SendingFlags +
         JSON.stringify({
             "ProtocolVer"  : ProtocolVersion,     // версия протокола клиента
             "Client"       : __socket.UserInfo.ClientType,    // тип клиента, который подключается к серверу. win32 - Windows-клиент.
             "Packed"       : false,               // использовать сжатие трафика или нет. По умолчанию - false
             "MAC"          : "",                  // MAC адрес клиента
             "HardwareID"   : "",                  // timastamp+XY HardwareID клиента
             "NetName"      : "WebChatUser",       // сетевое имя компьютера
             "Ver"          : ClientVersion,       // версия клиентского приложения
             "OS"           : "",                  // название и версия операционной системы клиента
             "Secured"      : "",                  // использовать или нет зашифрованное соединение. Если пустая строка - шифрования нет
             "UTC"          : __socket.UserInfo.UTC,                   // UTC смещение времени подключающегося клиента
             "NodeRemoteIP" : __socket.UserInfo.clientIP,
             "NodeUserAgent": __socket.UserInfo.NodeUserAgent,
             "NodeReferral" : __socket.UserInfo.NodeReferral,
             "NodeLanguage" : __socket.UserInfo.NodeLanguage,
             "NodeOS"       : __socket.UserInfo.NodeOS,
             "Interfaces"   : []                   // список сетевых интерфейсов клиента
         }) + CRLF;

     if (res.length > 2048) res = "";

     return res;
 };

 ClientToServCMD[CMD.cs_login]                = function(userInfo){
     if (!(userInfo && Service.isObject(userInfo) && userInfo.login)){
         return "";
     }

     var user = {
         UIN    : "-1",
         Nick   : "",
         Email  : "",
         Pass   : userInfo.pass,
         Domain : "",
         Style  : userInfo.Style || '0',
         State  : userInfo.State,
         SessionID   : userInfo.SessionID,
         ServPass    : userInfo.ClientType === "websupport" ? MCServer.ServPass : userInfo.ServPass,   // пароль для подключения к серверу (если нужно). Если пароля нет - пустая строка
         AuthService : userInfo.AuthService
     };

     var domainlogin = [];

     if (userInfo.login.indexOf("/") > 1){
         domainlogin = userInfo.login.split("/");
     } else
     if (userInfo.login.indexOf("\\") > 1){
         domainlogin = userInfo.login.split("\\");
     }

     if (domainlogin.length === 0){
         if (Service.isValidEmailAddress(userInfo.login)){
             user.Email = userInfo.login;
         } else
         if ((/^\d+$/).test(userInfo.login)){
             user.UIN = userInfo.login;
         } else {
             user.Nick = userInfo.login;
         }
     } else {
         user.Domain = domainlogin[0];
         user.Nick   = domainlogin[1];
     }

     console.log('Send cs_login: ' + JSON.stringify(user), console.logLevel.L_Full);

     return MagicPacket + CMD.cs_login + SendingFlags + JSON.stringify(user) + CRLF;
 };

 ClientToServCMD[CMD.cs_login_by_token]       = function(userInfo){
     var user = {
         Token: userInfo.Token,
         Client: userInfo.ClientType
     };

     console.log('Send cs_login_by_token: ' + JSON.stringify(user), console.logLevel.L_Full);

     return MagicPacket + CMD.cs_login_by_token + SendingFlags + JSON.stringify(user) + CRLF;
 };

 ClientToServCMD[CMD.cs_register_new_user]    = function(userInfo){
     if (!(userInfo && Service.isObject(userInfo) && userInfo.login)){
         return "";
     }

     var user = {
         Nick                 : userInfo.login,  // ник пользователя
         Pass                 : userInfo.pass,   // пароль для подключения
         Gender               : userInfo.Gender, // пол пользователя, 0 - неизвестен, 1 - мужской, 2 - женский
         Firstname            : "",              // имя пользователя
         Lastname             : "",              // фамилия пользователя
         Surname              : "" ,             // отчество пользователя
         Avatar               : userInfo.Avatar, // номер аватара
         Email                : userInfo.Email,  // адрес электронной почты
         SecretQuestionNumber : userInfo.SecretQuestionNumber, // номер секретного вопроса для восстановления пароля
         SecretAnswer         : userInfo.SecretAnswer,         // ответ на секретный вопрос
         ServPass             : userInfo.ClientType === "websupport" ? MCServer.ServPass : userInfo.ServPass,   // пароль для подключения к серверу (если нужно). Если пароля нет - пустая строка
         State                : 0                // текущий статус пользователя (0 - свободен)
     };

     return MagicPacket + CMD.cs_register_new_user + SendingFlags +
         JSON.stringify(user) + CRLF;
 };

 ClientToServCMD[CMD.cs_private_request]      = function(uin, lang, Task, newDial){
     return MagicPacket + CMD.cs_private_request + SendingFlags +
         JSON.stringify({
             UIN  : parseInt(uin),
             Task : parseInt(Task || 0),
             "New": newDial !== void(0) ? Service.convertIntToBool(newDial) : true,
             Lang : lang ? lang.toUpperCase() : "EN"
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_private_msg]          = function(uinOrMsg, msg, MsgType){
     return MagicPacket + CMD.cs_private_msg + SendingFlags +
         (arguments.length === 1 ? uinOrMsg : JSON.stringify({
             UIN : uinOrMsg,
             Msg : msg,
             MsgType: MsgType
         })) + CRLF;
 };

 ClientToServCMD[CMD.cs_put_msg2txt_channel]   = function(uinOrMsg, uid, msg, MsgType){
     return MagicPacket + CMD.cs_put_msg2txt_channel + SendingFlags +
         (arguments.length === 1 ? uinOrMsg : JSON.stringify({
             UIN : uinOrMsg,
             UID : uid,
             Msg : msg,
             MsgType: MsgType
         })) + CRLF;
 };

 ClientToServCMD[CMD.cs_ping]                 = function(){
     console.log('CMD.cs_ping', console.logLevel.L_High);

     return MagicPacket + CMD.cs_ping + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_quit]                 = function(){
     return MagicPacket + CMD.cs_quit + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_get_channels_list]    = function(){
     return MagicPacket + CMD.cs_get_channels_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_send_messages_buffer] = function(msg){
     return MagicPacket + CMD.cs_send_messages_buffer + SendingFlags +
         JSON.stringify(msg) + CRLF;
 };

 ClientToServCMD[CMD.cs_typing_notify]        = function(uin){
     return MagicPacket + CMD.cs_typing_notify + SendingFlags +
         JSON.stringify({
             UIN : uin
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_get_options_preset]   = function(ID){
     return MagicPacket + CMD.cs_get_options_preset + SendingFlags +
         JSON.stringify({
             ID : ID
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_get_bbs]              = function(){
     return MagicPacket + CMD.cs_get_bbs + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_add_new_bbs]          = function(Msg){
     return MagicPacket + CMD.cs_add_new_bbs + SendingFlags + Msg + CRLF;
 };

 ClientToServCMD[CMD.cs_broadcast_readed_notify] = function(Msg){
     return MagicPacket + CMD.cs_broadcast_readed_notify + SendingFlags + Msg + CRLF;
 };

 ClientToServCMD[CMD.cs_broadcast_just_readed] = function(Msg){
     return MagicPacket + CMD.cs_broadcast_just_readed + SendingFlags + Msg + CRLF;
 };

/*
 ClientToServCMD[CMD.cs_add_new_bbs]          = function(Expired, Sticky, Msg){
     return MagicPacket + CMD.cs_add_new_bbs + SendingFlags +
         JSON.stringify({
             Expired : Expired,  // до какого времени объявление будет актуально
             Sticky  : Sticky ,  // "прилепленное" объявление (в самом верху) или обычное
             Msg     : Msg       // содержимое объявления
         }) + CRLF;
 };
*/

 ClientToServCMD[CMD.cs_delete_private_message] = function(UINWith, Idx){
     return MagicPacket + CMD.cs_delete_private_message + SendingFlags +
         JSON.stringify({
             UINWith : UINWith, // идентификатор пользователя, с кем был приватный разговор
             Idx     : Idx      // идентификатор сообщения
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_redirect_private_talk] = function(UIN, UINTo){
     return MagicPacket + CMD.cs_redirect_private_talk + SendingFlags +
         JSON.stringify({
             UIN   : UIN, // пользователь, которого нужно "передать" другому собеседнику
             UINTo : UINTo// пользователь, кому мы передаём разговор
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_get_users_for_redirect_dialog] = function(UIN){
     return MagicPacket + CMD.cs_get_users_for_redirect_dialog + SendingFlags +
         JSON.stringify({
             UIN : UIN, // пользователь, которого нужно "передать" другому собеседнику
         }) + CRLF;
 };

 // ============= DIALOGS AND MESSAGES ==================

 ClientToServCMD[CMD.cs_get_private_dialogs]              = function(){
     return MagicPacket + CMD.cs_get_private_dialogs + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_del_private_dialog]   = function(UIN){
     return MagicPacket + CMD.cs_del_private_dialog + SendingFlags +
         JSON.stringify({
             UIN : UIN
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_private_get_dialog_msg_states]   = function(UIN){
     return MagicPacket + CMD.cs_private_get_dialog_msg_states + SendingFlags +
         JSON.stringify({
             UIN : UIN
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_private_msg_got]   = function(UIN, ID){
     return MagicPacket + CMD.cs_private_msg_got + SendingFlags +
         JSON.stringify({
             UIN : UIN, // идентификатор пользователя, с которым открыт диалог
             ID  : ID   // идентификатор сообщения в диалоге, все сообщения до него, включая указанный индекс, считаются полученными
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_private_msg_read]   = function(UIN, ID){
     return MagicPacket + CMD.cs_private_msg_read + SendingFlags +
         JSON.stringify({
             UIN : UIN, // идентификатор пользователя, с которым открыт диалог
             ID  : ID   // идентификатор сообщения в диалоге, все сообщения до него, включая указанный индекс, считаются полученными
         }) + CRLF;
 };

 // ============= MEDIA CALL ============================

 ClientToServCMD[CMD.cs_media_call]           = function(uin, video, share){
     return MagicPacket + CMD.cs_media_call + SendingFlags +
         JSON.stringify({
             UIN     : uin,
             Video   : video,
             Share   : share
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_media_call_accept]    = function(uin, video, cID){
     return MagicPacket + CMD.cs_media_call_accept + SendingFlags +
         JSON.stringify({
             UIN   : uin,
             Video : video,
             MID   : cID
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_media_call_reject]    = function(uin){
     return MagicPacket + CMD.cs_media_call_reject + SendingFlags +
         JSON.stringify({
             UIN     : uin
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_media_ready]    = function(uin){
     return MagicPacket + CMD.cs_media_ready + SendingFlags +
         JSON.stringify({
             UIN     : uin
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_media_call_close]     = function(uin){
     return MagicPacket + CMD.cs_media_call_close + SendingFlags +
         JSON.stringify({
             UIN : uin
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_media_call_error]     = function(uin){
     return MagicPacket + CMD.cs_media_call_error + SendingFlags +
         JSON.stringify({
             UIN      : uin
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_media_call_busy]      = function(uin){
     return MagicPacket + CMD.cs_media_call_busy + SendingFlags +
         JSON.stringify({
             UIN      : uin
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_media_offer]      = function(UIN, MID, SDP){
     return MagicPacket + CMD.cs_media_offer + SendingFlags +
         JSON.stringify({
             "UIN" : UIN,   // к какому клиенту идёт запрос
             "MID" : MID,   // идентификатор media-канала, где будут общаться пользователи
             "SDP" : SDP// текстовые данные запроса
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_media_answer]      = function(UIN, MID, SDP){
     return MagicPacket + CMD.cs_media_answer + SendingFlags +
         JSON.stringify({
             "UIN" : UIN,   // к какому клиенту идёт ответ
             "MID" : MID,   // идентификатор media-канала, где будут общаться пользователи
             "SDP" : SDP// текстовые данные ответа
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_media_ice_candidate]      = function(UIN, MID, CANDIDATE){
     return MagicPacket + CMD.cs_media_ice_candidate + SendingFlags +
         JSON.stringify({
             "UIN" : UIN,   // к какому клиенту идёт ответ
             "MID" : MID,   // идентификатор media-канала, где будут общаться пользователи
             "CANDIDATE" : CANDIDATE // текстовые данные ответа
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_media_change_settings]      = function(UIN, MID, Settings){
     return MagicPacket + CMD.cs_media_change_settings + SendingFlags +
         JSON.stringify({
             "UIN" : UIN,   // к какому клиенту идёт ответ
             "MID" : MID,   // идентификатор media-канала, где будут общаться пользователи
             "Settings" : Settings // текстовые данные ответа
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_media_exit_from_mid]      = function(MID){
     return MagicPacket + CMD.cs_media_exit_from_mid + SendingFlags +
         JSON.stringify({
             "MID" : MID   // пользователь вышел из media-канала
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_moder_delete_conf_message]      = function(UID, Idx){
     return MagicPacket + CMD.cs_moder_delete_conf_message + SendingFlags +
         JSON.stringify({
             "UID" : UID, // идентификатор конференции
             "Idx" : Idx  // идентификатор сообщения
         }) + CRLF;
 };

 // ====================================================

 ClientToServCMD[CMD.cs_find_users]           = function(str){
     return MagicPacket + CMD.cs_find_users + SendingFlags +
         JSON.stringify({
             GoogleStyle : true,
             SeachSt     : str
             /*           GoogleStyle : false,
              Nick        : str,
              Lastname    : "",        // фамилия
              Firstname   : "",        // имя
              Surname     : "",        // отчество
              Email       : "",        // адрес электронной почты
              Sex         : -1,        // пол пользователя
              Age         : -1,        // возраст. Диапазоны: 0 - от 13 до 17 лет, 1 - 18..22, 2 - 23..29, 3 - 30..39, 4 - 40..49, 5 - 50..59, 6 свыше 60 лет
              Lang        : -1,        // язык, которым владеет пользователь
              Online      : false       // в сети пользователь сейчас? true - да, false - не имеет значения
              */
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_add_new_contact]      = function(uin, group){
     return MagicPacket + CMD.cs_add_new_contact + SendingFlags +
         JSON.stringify({
             UIN     : uin,
             GroupID : group
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_add_personal_contact_group] = function(grName){
     return MagicPacket + CMD.cs_add_personal_contact_group + SendingFlags +
         JSON.stringify({
             Name : grName
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_get_contacts_list]    = function(){
     return MagicPacket + CMD.cs_get_contacts_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_get_ignores_list]     = function(){
     return MagicPacket + CMD.cs_get_ignores_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_set_custom_ignore]    = function(uin, data){
     return MagicPacket + CMD.cs_set_custom_ignore + SendingFlags +
         JSON.stringify({
             UIN : uin,
             What: data
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_del_custom_ignore]    = function(uin, data){
     return MagicPacket + CMD.cs_del_custom_ignore + SendingFlags +
         JSON.stringify({
             UIN : uin,
             What: data
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_add_ignore]           = function(uin, data){
     return MagicPacket + CMD.cs_add_ignore + SendingFlags +
         JSON.stringify({
             UIN : uin,
             Data: data
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_get_common_contacts_list]  = function(){
     return MagicPacket + CMD.cs_get_common_contacts_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_get_random_uin]        = function(){
     return MagicPacket + CMD.cs_get_random_uin + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_delete_id_from_personal_contacts]  = function(ID){
     return MagicPacket + CMD.cs_delete_id_from_personal_contacts + SendingFlags +
         JSON.stringify({
             ID : ID
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_move_personal_contact] = function(uin, newGR){
     return MagicPacket + CMD.cs_move_personal_contact + SendingFlags +
         JSON.stringify({
             UIN      : uin,
             GroupIDX : newGR
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_rename_contacts_group] = function(GroupIDX, newName){
     return MagicPacket + CMD.cs_rename_contacts_group + SendingFlags +
         JSON.stringify({
             GroupIDX : GroupIDX,
             NewName  : newName
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_get_uin_info]          = function (uin){
     return MagicPacket + CMD.cs_get_uin_info + SendingFlags +
         JSON.stringify({
             UIN : uin
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_set_uin_info]          = function (info){
     return MagicPacket + CMD.cs_set_uin_info + SendingFlags + info + CRLF;
 };

 ClientToServCMD[CMD.cs_web_get_user_foto_file]= function (uin){
     return MagicPacket + CMD.cs_web_get_user_foto_file + SendingFlags + JSON.stringify({
             UIN : uin
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_get_remote_uin_current_time]= function (uin){
     return MagicPacket + CMD.cs_get_remote_uin_current_time + SendingFlags +
         JSON.stringify({
             UIN : uin
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_send_my_current_time]  = function (UINTo, DateTime){
     return MagicPacket + CMD.cs_send_my_current_time + SendingFlags +
         JSON.stringify({
             UINTo    : UINTo   , //89,                       // UIN пользователя, кому мы отправляем свою системную дату и время
             DateTime : DateTime //"08.05.2013.12.54.34"     // дата и время в формате дд.мм.гггг.чч.мм.сс
         }) + CRLF;
 };

 ClientToServCMD[CMD.History]                  = function (uin, dtFrom, dtTo){
     var _params = {
         Type     : "private",
         dtFrom   : dtFrom,
         dtTo     : dtTo,
         UIN1     : this.UserInfo.UIN,
         UIN2     : uin,
         CMD      : CMD.History,
         BufferSize: 1500000
     };

     loadLogs.Load.call(this, _params, this.ServerToClientMultiCMD, this.UsersInBuffer, global.MCServer.ErrorText);

     return "";
 };

 ClientToServCMD[CMD.cs_web_support_i_am_busy] = function (uin, uinWith){
     return MagicPacket + CMD.cs_web_support_i_am_busy + SendingFlags +
         JSON.stringify({
             UIN  : uin,
             UINTalkNow : uinWith
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_leave_txt_channel]     = function (uid){
     return MagicPacket + CMD.cs_leave_txt_channel + SendingFlags +
         JSON.stringify({
             UID  : uid
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_join_txt_channel]      = function (uid, pass){
     return MagicPacket + CMD.cs_join_txt_channel + SendingFlags +
         JSON.stringify({
             UID  : uid,
             Pass : pass
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_create_txt_channel]    = function (name, topic, pass, modes){
     return MagicPacket + CMD.cs_create_txt_channel + SendingFlags +
         JSON.stringify({
             Name: name,
             Topic: topic,
             Pass: pass,
             Modes: modes,
             MaxUsers: 0
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_get_removed_user_info]    = function (uin){
     return MagicPacket + CMD.cs_get_removed_user_info + SendingFlags +
         JSON.stringify({
             UIN: uin
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_integration_icq_send_message]    = function (User, Msg ){
     return MagicPacket + CMD.cs_integration_icq_send_message + SendingFlags +
         JSON.stringify({
             User : User,
             Msg  : Msg
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_delete_conf_message]    = function (UID, Idx){
     return MagicPacket + CMD.cs_adm_delete_conf_message + SendingFlags +
         JSON.stringify({
             UID : UID, // идентификатор конференции
             Idx : Idx   // идентификатор сообщения,
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_history_info_private]    = function (dtUTCFrom, dtUTCTo, UIN1,UIN2){
     return MagicPacket + CMD.cs_adm_get_history_info_private + SendingFlags +
         JSON.stringify({
             dtUTCFrom : dtUTCFrom,  // с какой даты начинать (UTC, формат dd.mm.yyyy.hh.nn.ss.zzz)
             dtUTCTo   : dtUTCTo,  // до какой даты (UTC, формат dd.mm.yyyy.hh.nn.ss.zzz)
             UIN1      : UIN1,  // уникальный идентификатор 1-го пользователя. Порядок не важен
             UIN2      : UIN2  // уникальный идентификатор 2-го пользователя. Порядок не важен
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_history_private]    = function (StartConvID, EndConvID, UIN1, UIN2){
     return MagicPacket + CMD.cs_adm_get_history_private + SendingFlags +
         JSON.stringify({
             StartConvID : StartConvID, // индекс начального сообщения
             EndConvID   : EndConvID,  // индекс конечного сообщения
             UIN1        : UIN1,  // уникальный идентификатор 1-го пользователя. Порядок не важен
             UIN2        : UIN2  // уникальный идентификатор 2-го пользователя. Порядок не важен
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_history_info_conf] = function (dtUTCFrom, dtUTCTo, UID){
     return MagicPacket + CMD.cs_adm_get_history_info_conf + SendingFlags +
         JSON.stringify({
             dtUTCFrom : dtUTCFrom, // с какой даты начинать (UTC, формат dd.mm.yyyy.hh.nn.ss.zzz)
             dtUTCTo   : dtUTCTo, // до какой даты (UTC, формат dd.mm.yyyy.hh.nn.ss.zzz)
             UID       : UID // уникальный идентификатор текстовой конференции
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_history_conf]      = function (StartConvID, EndConvID, UID){
     return MagicPacket + CMD.cs_adm_get_history_conf + SendingFlags +
         JSON.stringify({
             StartConvID : StartConvID, // индекс начального сообщения
             EndConvID   : EndConvID, // индекс конечного сообщения
             UID         : UID // уникальный идентификатор текстовой конференции
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_history_private_user_pairs]    = function (){
     return MagicPacket + CMD.cs_adm_get_history_private_user_pairs + SendingFlags + CRLF;
 };

 // ============ User Groups ==========================

 ClientToServCMD[CMD.cs_adm_get_user_groups]    = function (){
     return MagicPacket + CMD.cs_adm_get_user_groups + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_add_new_user_group]    = function (name){
     return MagicPacket + CMD.cs_adm_add_new_user_group + SendingFlags +
         JSON.stringify({
             Name: name
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_group_users_list]    = function (id){
     return MagicPacket + CMD.cs_adm_get_group_users_list + SendingFlags +
         JSON.stringify({
             ID: id
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_add_users_to_group]    = function (users, id){
     return MagicPacket + CMD.cs_adm_add_users_to_group + SendingFlags +
         JSON.stringify({
             "Users" : users, //"17,3,893,14", // UIN-ы пользователей, через запятую
             "ID"    : id //6              // идентификатор группы, целое цисло
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_remove_users_from_group]    = function (users, id){
     return MagicPacket + CMD.cs_adm_remove_users_from_group + SendingFlags +
         JSON.stringify({
             "Users" : users, //"17,3,893,14", // UIN-ы пользователей, через запятую
             "ID"    : id     //6              // идентификатор группы, целое цисло
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_rename_group_of_users]    = function (id, name){
     return MagicPacket + CMD.cs_adm_rename_group_of_users + SendingFlags +
         JSON.stringify({
             "ID"   : id,  //6,            // идентификатор группы, целое цисло
             "Name" : name //"bla-bla-bla" // новое название группы
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_delete_groups_list]    = function (id){
     return MagicPacket + CMD.cs_adm_delete_groups_list + SendingFlags +
         JSON.stringify({
             "IDS": id  //6,            // идентификатор группы, целое цисло
         }) + CRLF;
 };

 // ===================================================

 ClientToServCMD[CMD.cs_browser_info]    = function (BrowserName, BrowserVersion, BrowserDevice, BrowserOS){
     return MagicPacket + CMD.cs_browser_info + SendingFlags +
         JSON.stringify({
             "BrowserName"    : BrowserName,    // название браузера
             "BrowserVersion" : BrowserVersion,        // его версия
             "BrowserDevice"  : BrowserDevice, // устройство пользователя (1 - desktop, 2 - mobile, 3 - tablet, 4 - spider)
             "BrowserOS"      : BrowserOS  // операционная система пользователя
         }) + CRLF;
 };

 // ====== KANBAN ========================

 ClientToServCMD[CMD.cs_kanban_add_project]       = function (Name, Description, dtDeadLine, State){
     return MagicPacket + CMD.cs_kanban_add_project + SendingFlags +
         JSON.stringify({
             "Name"        : Name,       // название проекта
             "dtDeadLine"  : dtDeadLine, // дата и время дедлайна, если его нет, то "01.01.3000.00.00.00"
             "State"       : State,      // статус проекта
             "Description" : Description // описание проекта
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_edit_project]       = function (ID, Name, Description, dtDeadLine, State){
     return MagicPacket + CMD.cs_kanban_edit_project + SendingFlags +
         JSON.stringify({
             "ID"          : ID,                    // уникальный идентификатор проекта
             "Name"        : Name,       // название проекта
             "dtDeadLine"  : dtDeadLine, // дата и время дедлайна, если его нет, то "01.01.3000.00.00.00"
             "State"       : State,      // статус проекта
             "Description" : Description // описание проекта
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_get_stages_list]   = function (id){
     return MagicPacket + CMD.cs_kanban_get_stages_list + SendingFlags +
         JSON.stringify({
             ID: id // номер проекта, который нас интересует. Число
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_add_stage]   = function (Name, Description, Position, ProjectID, Type){
     return MagicPacket + CMD.cs_kanban_add_stage + SendingFlags +
         JSON.stringify({
             "Name"        : Name,  // название этапа выполнения проекта
             "Description" : Description,  // комментарий к этапу
             "Position"    : Position,  // порядковая позиция этапа в проекте, начинается с 0
             "ProjectID"   : ProjectID,  // идентификатор проекта
             "Type"        : Type // тип этапа
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_add_task]   = function (IDStage, UINPerformer, Name, Desc, Priority, dtDeadLine, State, Tags){
     return MagicPacket + CMD.cs_kanban_add_task + SendingFlags +
         JSON.stringify({
             IDStage          : IDStage,       // идентификатор этапа
             UINPerformer     : UINPerformer,  // идентификатор пользователя, который будет выполнять задачу
             Name             : Name,          // название задачи
             Desc             : Desc,          // описание задачи
             Priority         : Priority,      // важность задачи, приоритет
             dtDeadLine       : dtDeadLine,    // дата и время дедлайна, если есть. Если нет - 01.01.3000 года
             State            : State,         // статус задачи
             Tags             : Tags || ""     // список тегов
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_task_move]   = function (ID, IDStage){
     return MagicPacket + CMD.cs_kanban_task_move + SendingFlags +
         JSON.stringify({
             ID      : ID     , // уникальный идентификатор задачи, число
             IDStage : IDStage  // идентификатор нового этапа
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_task_remove]   = function (ID){
     return MagicPacket + CMD.cs_kanban_task_remove + SendingFlags +
         JSON.stringify({
             ID: ID // уникальный идентификатор задачи, число
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_get_comments]   = function (ID){
     return MagicPacket + CMD.cs_kanban_get_comments + SendingFlags +
         JSON.stringify({
             ID: ID // уникальный идентификатор задачи, число
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_get_project_tags_list]   = function (ProjectID){
     return MagicPacket + CMD.cs_kanban_get_project_tags_list + SendingFlags +
         JSON.stringify({
             ProjectID : ProjectID // идентификатор проекта, теги которого нужно получить
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_get_dashboard]   = function (Typical, Done, Archive){
     return MagicPacket + CMD.cs_kanban_get_dashboard + SendingFlags +
         JSON.stringify({
             Typical : Typical || false,
             Done    : Done || false,
             Archive : Archive || false
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_add_comment]   = function (ID, CommentType, CommentText){
     return MagicPacket + CMD.cs_kanban_add_comment + SendingFlags +
         JSON.stringify({
             ID         : ID, // уникальный идентификатор задачи, число
             CommentType: CommentType, // тип комментария, число
             CommentText: CommentText // текст комментария
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_delete_comment]   = function (ID, IDComment){
     return MagicPacket + CMD.cs_kanban_delete_comment + SendingFlags +
         JSON.stringify({
             ID       : ID, // уникальный идентификатор задачи, число
             IDComment: IDComment // уникальный идентификатор комментария, число
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_task_edit]   = function (ID, UINPerformer, Name, Desc, Priority, dtDeadLine, State, TagsAdded, TagsDeleted){
     return MagicPacket + CMD.cs_kanban_task_edit + SendingFlags +
         JSON.stringify({
             ID        : ID        , // уникальный идентификатор задачи, число
             Name      : Name      , // название задачи
             Desc      : Desc      , // описание задачи
             Priority  : Priority  , // важность задачи, приоритет
             dtDeadLine: dtDeadLine, // дата и время дедлайна, если есть. Если нет - 01.01.3000 года
             State     : State,      // статус задачи
             UINPerformer: UINPerformer,  // (5.21+) идентификатор пользователя, который будет выполнять задачу. Можно заменить его
             TagsAdded   : TagsAdded,     // (6.0+) список тегов, которые были добавлены
             TagsDeleted : TagsDeleted    // (6.0+) список тегов, которые были удалены
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_delete_stage]   = function (id, projectID){
     return MagicPacket + CMD.cs_kanban_delete_stage + SendingFlags +
         JSON.stringify({
             "ID"        : id,  // идентификатор этапа
             "ProjectID" : projectID    // идентификатор проекта, которому принадлежит этап
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_get_last_performers]   = function (ID, Count){
     return MagicPacket + CMD.cs_kanban_get_last_performers + SendingFlags +
         JSON.stringify({
             ID    : ID   , // уникальный идентификатор проекта
             Count : Count  // количество исполнителей
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_modify_stage]   = function (ID, Name, Description, Type){
     return MagicPacket + CMD.cs_kanban_modify_stage + SendingFlags +
         JSON.stringify({
             "ID"          : ID,          // идентификатор проекта, число
             "Name"        : Name,        // название этапа
             "Description" : Description, // описание этапа
             "Type"        : Type         // stage type
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_get_tasks_list]    = function (ids){
     return MagicPacket + CMD.cs_kanban_get_tasks_list + SendingFlags +
         JSON.stringify({
             IDS: ids
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_close_project]     = function (id){
     return MagicPacket + CMD.cs_kanban_close_project + SendingFlags +
         JSON.stringify({
             ID: id
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_reopen_project]    = function (id){
     return MagicPacket + CMD.cs_kanban_reopen_project + SendingFlags +
         JSON.stringify({
             ID: id
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_delete_project]    = function (id){
     return MagicPacket + CMD.cs_kanban_delete_project + SendingFlags +
         JSON.stringify({
             ID: id
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_get_project_rights]    = function (ID){
     return MagicPacket + CMD.cs_kanban_get_project_rights + SendingFlags +
         JSON.stringify({
             ID : ID // уникальный идентификатор проекта
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_get_project_info]    = function (ID){
     return MagicPacket + CMD.cs_kanban_get_project_info + SendingFlags +
         JSON.stringify({
             ID : ID // уникальный идентификатор, число
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_get_task_info]    = function (ID){
     return MagicPacket + CMD.cs_kanban_get_task_info + SendingFlags +
         JSON.stringify({
             ID : ID // уникальный идентификатор задачи, число
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_get_projects_list] = function (){
     return MagicPacket + CMD.cs_kanban_get_projects_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_get_tags_list]     = function (Typical, Done, Archive){
     return MagicPacket + CMD.cs_kanban_get_tags_list + SendingFlags +
         JSON.stringify({
             Typical : Typical || false,
             Done    : Done || false,
             Archive : Archive || false
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_get_personal_options]     = function (){
     return MagicPacket + CMD.cs_kanban_get_personal_options + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_kanban_save_personal_options]    = function (options){
     return MagicPacket + CMD.cs_kanban_save_personal_options + SendingFlags + options + CRLF;
 };

 // ===================================================================

 ClientToServCMD[CMD.cs_adm_get_active_conf_list]    = function (){
     return MagicPacket + CMD.cs_adm_get_active_conf_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_server_info]   = function(){
     return MagicPacket + CMD.cs_adm_get_server_info + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_list_users]   = function(params, fields){
     return MagicPacket + CMD.cs_adm_list_users + SendingFlags +
         JSON.stringify({
             Params  : params,
             Filters : fields
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_check_ports]   = function(data){
     return MagicPacket + CMD.cs_adm_check_ports + SendingFlags + data + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_user_profile] = function(uin){
     return MagicPacket + CMD.cs_adm_get_user_profile + SendingFlags +
         JSON.stringify({
             UIN  : uin
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_list_roles] = function(){
     return MagicPacket + CMD.cs_adm_list_roles + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_job_positions_list] = function(){
     return MagicPacket + CMD.cs_adm_get_job_positions_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_remove_user] = function(uins){
     return MagicPacket + CMD.cs_adm_remove_user + SendingFlags +
         JSON.stringify({
             UINS: uins
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_create_user] = function(nick, email, pwd){
     return MagicPacket + CMD.cs_adm_create_user + SendingFlags +
         JSON.stringify({
             Nick    : nick,
             Email   : email,
             Pass    : pwd,
             Filters : ""
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_set_user_password] = function(uin, pwd){
     return MagicPacket + CMD.cs_adm_set_user_password + SendingFlags +
         JSON.stringify({
             UIN  : uin,
             Pass : pwd
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_clear_user_foto] = function(uin){
     return MagicPacket + CMD.cs_adm_clear_user_foto + SendingFlags +
         JSON.stringify({
             UIN  : uin
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_server_options] = function(){
     return MagicPacket + CMD.cs_adm_get_server_options + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_modify_user_profile] = function(userInfo){
     return MagicPacket + CMD.cs_adm_modify_user_profile + SendingFlags + userInfo + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_server_net_interfaces] = function(){
     return MagicPacket + CMD.cs_adm_get_server_net_interfaces + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_user_info_by_preset] = function(uin, preset){
     return MagicPacket + CMD.cs_adm_get_user_info_by_preset + SendingFlags +
         JSON.stringify({
             UIN    : uin,
             Preset : preset
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_set_server_options] = function(settings){
     return MagicPacket + CMD.cs_adm_set_server_options + SendingFlags + settings + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_remove_all_logs] = function(){
     return MagicPacket + CMD.cs_adm_remove_all_logs + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_make_backup_server_db] = function(){
     return MagicPacket + CMD.cs_adm_make_backup_server_db + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.NewFoto] = function(uin, data){
     var res    = data.slice(23, data.length);
     var buf    = new Buffer(res, 'base64');
     var socket = this;
     var name   = 'profile-foto-' + uin + '.jpg';

     Service.WriteFile(MCPathes.ProfilNode + "uploads/" + name, buf, function(){
         socket.SendDataToServer(MagicPacket + CMD.cs_adm_set_user_foto + SendingFlags +
             JSON.stringify({
                 UIN      : uin,
                 FileName : name
             }) + CRLF
         );
     }, {flag:'w+'});

     return "";
 };

 ClientToServCMD[CMD.cs_adm_job_positions_del] = function(ID){
     return MagicPacket + CMD.cs_adm_job_positions_del + SendingFlags + '{"ID":"' + ID + '"}' + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_job_positions_add] = function(name, tl){
     return MagicPacket + CMD.cs_adm_job_positions_add + SendingFlags +
         JSON.stringify({
             Name     : name,
             TeamLead : tl
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_job_positions_modify] = function(id, name, tl){
     return MagicPacket + CMD.cs_adm_job_positions_modify + SendingFlags +
         JSON.stringify({
             ID       : id,
             Name     : name,
             TeamLead : tl
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_job_positions_set_sequence] = function(SortPositions, list){
     return MagicPacket + CMD.cs_adm_job_positions_set_sequence + SendingFlags +
         JSON.stringify({
             SortPositions: SortPositions,
             Sequence : list
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_role_add] = function(name, id){
     return MagicPacket + CMD.cs_adm_role_add + SendingFlags +
         JSON.stringify({
             Name : name,
             ID   : id || -1
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_role_delete] = function(id){
     return MagicPacket + CMD.cs_adm_role_delete + SendingFlags +
         JSON.stringify({
             ID   : id
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_role_modify] = function(name, id){
     return MagicPacket + CMD.cs_adm_role_modify + SendingFlags +
         JSON.stringify({
             Name : name,
             ID   : id
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_role_set_rights] = function(rights, id){
     return MagicPacket + CMD.cs_adm_role_set_rights + SendingFlags +
         JSON.stringify({
             Rights : rights,
             ID     : id
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_role_users_list] = function(id){
     return MagicPacket + CMD.cs_adm_role_users_list + SendingFlags +
         JSON.stringify({
             ID     : id
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_role_apply_to_users] = function(list, id){
     return MagicPacket + CMD.cs_adm_role_apply_to_users + SendingFlags +
         JSON.stringify({
             UsersList : list,
             ID        : id
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_check_smtp] = function(){
     return MagicPacket + CMD.cs_adm_check_smtp + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_enter_mychat_reg_data] = function(name, key){
     return MagicPacket + CMD.cs_adm_enter_mychat_reg_data + SendingFlags +
         JSON.stringify({
             "CompanyName" : name,
             SN            : key
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_enter_mychat_guest_reg_data] = function(key){
     return MagicPacket + CMD.cs_adm_enter_mychat_guest_reg_data + SendingFlags +
         JSON.stringify({
             SN : key
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_websupport_groups] = function(){
     return MagicPacket + CMD.cs_adm_get_websupport_groups + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_add_user_to_websupport_group] = function(uins, id){
     return MagicPacket + CMD.cs_adm_add_user_to_websupport_group + SendingFlags +
         JSON.stringify({
             UINS : uins,
             ID   : id
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_delete_user_from_websupport] = function(uins){
     return MagicPacket + CMD.cs_adm_delete_user_from_websupport + SendingFlags +
         JSON.stringify({
             UINS : uins
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_add_websupport_group] = function(name){
     return MagicPacket + CMD.cs_adm_add_websupport_group + SendingFlags +
         JSON.stringify({
             Name : name
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_delete_websupport_group] = function(id){
     return MagicPacket + CMD.cs_adm_delete_websupport_group + SendingFlags +
         JSON.stringify({
             ID   : id
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_rename_websupport_group] = function(name, id){
     return MagicPacket + CMD.cs_adm_rename_websupport_group + SendingFlags +
         JSON.stringify({
             Name : name,
             ID   : id
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_websupport_group_users] = function(id){
     return MagicPacket + CMD.cs_adm_get_websupport_group_users + SendingFlags +
         JSON.stringify({
             ID : id
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_custom_options] = function(options){
     return MagicPacket + CMD.cs_adm_get_custom_options + SendingFlags +
         JSON.stringify({
             OptionsFields : options
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_total_contacts_list] = function(){
     return MagicPacket + CMD.cs_adm_get_total_contacts_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_tcl_add_group] = function(groupName, parentID){
     return MagicPacket + CMD.cs_adm_tcl_add_group + SendingFlags +
         JSON.stringify({
             GroupName : groupName,
             ParentID  : parentID
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_tcl_del_ids_list] = function(groupIDs){
     return MagicPacket + CMD.cs_adm_tcl_del_ids_list + SendingFlags +
         JSON.stringify({
             IDList : groupIDs
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_tcl_add_users_list_to_group] = function(uins, groupID){
     return MagicPacket + CMD.cs_adm_tcl_add_users_list_to_group + SendingFlags +
         JSON.stringify({
             UINS    : uins,
             GroupID : groupID
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_tcl_move_users_and_groups] = function(target, groups, users){
     return MagicPacket + CMD.cs_adm_tcl_move_users_and_groups + SendingFlags +
         JSON.stringify({
             ToGroupIdx : target,
             GroupsIdx : groups,
             UsersIdx  : users
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_tcl_rename_group] = function(id, groupName){
     return MagicPacket + CMD.cs_adm_tcl_rename_group + SendingFlags +
         JSON.stringify({
             ID        : id,
             GroupName : groupName
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_import_users] = function(data){
     return MagicPacket + CMD.cs_adm_import_users + SendingFlags + data + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_return_server_to_zero_state] = function(){
     return MagicPacket + CMD.cs_adm_return_server_to_zero_state + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_set_custom_options] = function(options){
     return MagicPacket + CMD.cs_adm_set_custom_options + SendingFlags + options + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_licenses] = function(){
     return MagicPacket + CMD.cs_adm_get_licenses + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_set_antiflood_filter_data] = function(options){
     return MagicPacket + CMD.cs_adm_set_antiflood_filter_data + SendingFlags + options + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_modify_flood_except_users] = function(usersList){
     return MagicPacket + CMD.cs_adm_modify_flood_except_users + SendingFlags +
         JSON.stringify({
             UsersList : usersList
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_flood_except_users_list] = function(){
     return MagicPacket + CMD.cs_adm_get_flood_except_users_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_antiflood_filter_data] = function(){
     return MagicPacket + CMD.cs_adm_get_antiflood_filter_data + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_check_domains_list] = function(){
     return MagicPacket + CMD.cs_adm_get_check_domains_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_add_check_domain] = function(Domain, Host, Port, Secured){
     return MagicPacket + CMD.cs_adm_add_check_domain + SendingFlags +
         JSON.stringify({
             Domain  : Domain ,  // название домена
             Host    : Host   ,  // имя хоста или IP адрес домена
             Port    : Port   ,  // номер порта для LDAP соединения
             Secured : Secured  // использовать шифрованное соединение или нет
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_delete_check_domain] = function(Domain){
     return MagicPacket + CMD.cs_adm_delete_check_domain + SendingFlags +
         JSON.stringify({
             Domain  : Domain  // название домена
         }) + CRLF;
 };

 // === LDAP ====

 ClientToServCMD[CMD.cs_adm_import_ad_users] = function(params){
     // require('fs').writeFile('./ad_log.txt', params, function (err) {
     //     if (err){
     //         console.err(err.message);
     //     } else {
     //         console.log('AD log done!');
     //     }
     // });

     return MagicPacket + CMD.cs_adm_import_ad_users + SendingFlags + params + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_ad_options] = function(){
     return MagicPacket + CMD.cs_adm_get_ad_options + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_save_ad_options] = function(Host, Port, Base, UseSSL, UserName){
     return MagicPacket + CMD.cs_adm_save_ad_options + SendingFlags +
         JSON.stringify({
             Host     : Host,    //"192.168.10.1",  // адрес сервера, к которому происходит подключение по LDAP
             Port     : Port,    //389,             // номер порта
             Base     : Base,    //"dc=nss,dc=com",  // текст запроса или имя домена
             UseSSL   : UseSSL,  //false,           // использовать шифрование или нет
             UserName : UserName //"admin"          // логин пользователя
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_ad_users_list] = function(Host, Port, Base, UseSSL, UserName, UserPassword, Attributes, WhoShow){
     return MagicPacket + CMD.cs_adm_get_ad_users_list + SendingFlags +
         JSON.stringify({
             Host     : Host,    //"192.168.10.1",  // адрес сервера, к которому происходит подключение по LDAP
             Port     : Port,    //389,             // номер порта
             Base     : Base,    //"dc=nss,dc=com",  // текст запроса или имя домена
             UseSSL   : UseSSL,  //false,           // использовать шифрование или нет
             UserName : UserName, //"admin"          // логин пользователя
             UserPassword : UserPassword,      // пароль пользователя
             Attributes   : Attributes,   // список атрибутов пользователей через запятую, которые мы хотим получить из домена. Регистр букв имеет значение
             WhoShow   : WhoShow
         }) + CRLF;
 };

 // === allow ip ===

 ClientToServCMD[CMD.cs_adm_get_allow_ip_list] = function(){
     return MagicPacket + CMD.cs_adm_get_allow_ip_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_add_new_ip_to_allow_list] = function(ip, comment, clientType){
     return MagicPacket + CMD.cs_adm_add_new_ip_to_allow_list + SendingFlags + JSON.stringify({
             IP        : ip,
             Comment   : comment,
             ClientType: clientType || 'common'
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_delete_allow_ip] = function(ip, clientType){
     return MagicPacket + CMD.cs_adm_delete_allow_ip + SendingFlags + JSON.stringify({
             IP: ip,
             ClientType: clientType
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_clear_allow_ip_list] = function(){
     return MagicPacket + CMD.cs_adm_clear_allow_ip_list + SendingFlags + CRLF;
 };

 // === block ip ===

 ClientToServCMD[CMD.cs_adm_get_blocked_ip_list] = function(){
     return MagicPacket + CMD.cs_adm_get_blocked_ip_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_clear_blocked_ip_list] = function(){
     return MagicPacket + CMD.cs_adm_clear_blocked_ip_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_add_ip_to_block_list] = function(ip, comment, clientType){
     return MagicPacket + CMD.cs_adm_add_ip_to_block_list + SendingFlags + JSON.stringify({
             IP: ip,
             Comment: comment,
             ClientType: clientType || 'common'
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_delete_blocked_ip] = function(ip, clientType){
     return MagicPacket + CMD.cs_adm_delete_blocked_ip + SendingFlags + JSON.stringify({
             IP: ip,
             ClientType: clientType || 'common'
         }) + CRLF;
 };

 // === block mac ===

 ClientToServCMD[CMD.cs_adm_delete_blocked_mac] = function(mac){
     return MagicPacket + CMD.cs_adm_delete_blocked_mac + SendingFlags + JSON.stringify({
             MAC: mac
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_add_mac_to_block_list] = function(mac, comment){
     return MagicPacket + CMD.cs_adm_add_mac_to_block_list + SendingFlags + JSON.stringify({
             MAC: mac,
             Comment: comment
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_blocked_mac_list] = function(){
     return MagicPacket + CMD.cs_adm_get_blocked_mac_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_clear_blocked_mac_list] = function(){
     return MagicPacket + CMD.cs_adm_clear_blocked_mac_list + SendingFlags + CRLF;
 };

 // === block nick ===

 ClientToServCMD[CMD.cs_adm_get_deny_nicks_list] = function(){
     return MagicPacket + CMD.cs_adm_get_deny_nicks_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_add_deny_nick] = function(nick){
     return MagicPacket + CMD.cs_adm_add_deny_nick + SendingFlags + JSON.stringify({
             Nick: nick
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_delete_deny_nick] = function(nick){
     return MagicPacket + CMD.cs_adm_delete_deny_nick + SendingFlags + JSON.stringify({
             Nick: nick
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_clear_deny_nicks_list] = function(){
     return MagicPacket + CMD.cs_adm_clear_deny_nicks_list + SendingFlags + CRLF;
 };

 // === block channels ===

 ClientToServCMD[CMD.cs_adm_get_deny_conf_list] = function(){
     return MagicPacket + CMD.cs_adm_get_deny_conf_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_add_deny_conf] = function(conf){
     return MagicPacket + CMD.cs_adm_add_deny_conf + SendingFlags + JSON.stringify({
             ConfName: conf
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_delete_deny_conf] = function(conf){
     return MagicPacket + CMD.cs_adm_delete_deny_conf + SendingFlags + JSON.stringify({
             ConfName: conf
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_clear_deny_conf_list] = function(){
     return MagicPacket + CMD.cs_adm_clear_deny_conf_list + SendingFlags + CRLF;
 };

 // === bad words ===

 ClientToServCMD[CMD.cs_adm_get_bad_words_filters_data] = function(){
     return MagicPacket + CMD.cs_adm_get_bad_words_filters_data + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_bad_words_list] = function(){
     return MagicPacket + CMD.cs_adm_get_bad_words_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_clear_bad_words_list] = function(){
     return MagicPacket + CMD.cs_adm_clear_bad_words_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_set_bad_words_filter_data] = function(options){
     return MagicPacket + CMD.cs_adm_set_bad_words_filter_data + SendingFlags + options + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_load_badwords_except_confs] = function(){
     return MagicPacket + CMD.cs_adm_load_badwords_except_confs + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_add_bad_word_to_filters] = function(badWord){
     return MagicPacket + CMD.cs_adm_add_bad_word_to_filters + SendingFlags + JSON.stringify({
             BadWord: badWord
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_del_bad_word_from_filters] = function(badWord){
     return MagicPacket + CMD.cs_adm_del_bad_word_from_filters + SendingFlags + JSON.stringify({
             BadWord: badWord
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_add_badwords_except_conf] = function(conf){
     return MagicPacket + CMD.cs_adm_add_badwords_except_conf + SendingFlags + JSON.stringify({
             ConfName: conf
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_del_badwords_except_conf] = function(conf){
     return MagicPacket + CMD.cs_adm_del_badwords_except_conf + SendingFlags + JSON.stringify({
             ConfName: conf
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_clear_badwords_except_confs] = function(){
     return MagicPacket + CMD.cs_adm_clear_badwords_except_confs + SendingFlags + CRLF;
 };

 // ====

 ClientToServCMD[CMD.cs_adm_export_users_to_csv] = function(uins, fields){
     return MagicPacket + CMD.cs_adm_export_users_to_csv + SendingFlags + JSON.stringify({
             UINS: uins,
             Fields: fields
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_multiply_modify_users] = function(options){
     return MagicPacket + CMD.cs_adm_multiply_modify_users + SendingFlags + options + CRLF;
 };

 ClientToServCMD[CMD.cs_get_online_users_states] = function(){
     return MagicPacket + CMD.cs_get_online_users_states + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_bans_list] = function(){
     return MagicPacket + CMD.cs_adm_get_bans_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_auto_conf_list] = function(){
     return MagicPacket + CMD.cs_adm_get_auto_conf_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_del_auto_conf] = function(uids){
     return MagicPacket + CMD.cs_adm_del_auto_conf + SendingFlags + JSON.stringify({
             UIDS: uids
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_add_auto_conf] = function(Name, Topic, Pass, JoinAll, BlockExit, SyncLogs, InvisibleFlag){
     return MagicPacket + CMD.cs_adm_add_auto_conf + SendingFlags + JSON.stringify({
             Name           : Name,   // название конференции
             Topic          : Topic, // тема конференции
             Password       : Pass,            // пароль на вход в конференцию
             ConnectAllFlag : JoinAll,         // присоединять абсолютно всех пользователей в эту конференцию или нет
             BlockCloseFlag : BlockExit,         // запретить выход из конференции
             SyncLogsFlag   : SyncLogs,           // синхронизация переписки
             InvisibleFlag  : InvisibleFlag
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_update_auto_conf] = function(UID, Topic, Pass, JoinAll, BlockExit, SyncLogs, InvisibleFlag){
     return MagicPacket + CMD.cs_adm_update_auto_conf + SendingFlags + JSON.stringify({
             UID            : UID,
             Topic          : Topic,     // тема конференции
             Password       : Pass,      // пароль на вход в конференцию
             ConnectAllFlag : JoinAll,   // присоединять абсолютно всех пользователей в эту конференцию или нет
             BlockCloseFlag : BlockExit, // запретить выход из конференции
             SyncLogsFlag   : SyncLogs,  // синхронизация переписки
             InvisibleFlag  : InvisibleFlag // (6.1+) скрытая конференция
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_force_update_global_contacts] = function(){
     return MagicPacket + CMD.cs_adm_force_update_global_contacts + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_get_depts_list] = function(){
     return MagicPacket + CMD.cs_get_depts_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_all_text_confs] = function(){
     return MagicPacket + CMD.cs_adm_get_all_text_confs + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.StopLogs] = function(){
     this.UserInfo.StopLoadLogs = true;

     this.UsersInBuffer.ClearHistory();
 };

 ClientToServCMD[CMD.cs_adm_get_moderators] = function(){
     return MagicPacket + CMD.cs_adm_get_moderators + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_conf_names_by_uid_list] = function(uids){
     return MagicPacket + CMD.cs_adm_get_conf_names_by_uid_list + SendingFlags + JSON.stringify({
             UIDS: uids
         }) + CRLF;
 };

 ClientToServCMD[CMD.Logs] = function(_type, dtFrom, dtTo, params){
     var _params = {};

     if (params){
         try {
             _params          = JSON.parse(params);
             _params.Type     = _type;
             _params.dtFrom   = dtFrom;
             _params.dtTo     = dtTo;
             _params.CMD      = CMD.Logs;
             _params.original = params;
         } catch (e){
             console.err('ClientToServCMD[CMD.Logs] incorrect json params data: ' + params);
             return "";
         }
     }

     loadLogs.Load.call(this, _params, this.ServerToClientMultiCMD, this.UsersInBuffer, global.MCServer.ErrorText);

     return "";
 };

 ClientToServCMD[CMD.cs_adm_del_bans] = function(ids){
     return MagicPacket + CMD.cs_adm_del_bans + SendingFlags + JSON.stringify({
             IDList: ids
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_delete_moderators] = function(uins){
     return MagicPacket + CMD.cs_adm_delete_moderators + SendingFlags + JSON.stringify({
             UINS: uins
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_del_moderator_confs] = function(uin, uids){
     return MagicPacket + CMD.cs_adm_del_moderator_confs + SendingFlags + JSON.stringify({
             UIN: uin,
             UIDS: uids
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_add_moderator] = function(uin, uid){
     return MagicPacket + CMD.cs_adm_add_moderator + SendingFlags + JSON.stringify({
             UIN: uin,
             UID: uid || -1
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_bbs_msg_list] = function(actual){
     return MagicPacket + CMD.cs_adm_get_bbs_msg_list + SendingFlags + JSON.stringify({
             Actual: !!actual
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_bbs_get_msg] = function(id){
     return MagicPacket + CMD.cs_adm_bbs_get_msg + SendingFlags + JSON.stringify({
             ID: id
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_bbs_del_messages] = function(ids){
     return MagicPacket + CMD.cs_adm_bbs_del_messages + SendingFlags + JSON.stringify({
             IDS: ids
         }) + CRLF;
 };

/*
 ClientToServCMD[CMD.cs_adm_add_bbs_message] = function(Msg){
     return MagicPacket + CMD.cs_adm_add_bbs_message + SendingFlags + Msg + CRLF;
 };
*/

 ClientToServCMD[CMD.cs_adm_add_bbs_message] = function(dtActualTo, Sticky, Msg){
     return MagicPacket + CMD.cs_adm_add_bbs_message + SendingFlags + JSON.stringify({
             dtActualTo  : dtActualTo, //"2016.01.01.17.24.30", // дата и время акуальности объявления
             Sticky      : Sticky,     //true,                  // "прилепленное" объявление
             Msg         : Msg         //"Bla-bla-bla"          // текст сообщения
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_bbs_clear_actual] = function(){
     return MagicPacket + CMD.cs_adm_bbs_clear_actual + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_bbs_modify_msg] = function(id, dt, Sticky, Msg){
     return MagicPacket + CMD.cs_adm_bbs_modify_msg + SendingFlags + JSON.stringify({
             ID         : id,     // идентификатор объявления
             dtActualTo : dt,     // дата и время акуальности объявления
             Sticky     : Sticky, // "прилепленное" объявление
             Msg        : Msg     // текст сообщения
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_add_group_to_auto_conf] = function(uid, id){
     return MagicPacket + CMD.cs_adm_add_group_to_auto_conf + SendingFlags + JSON.stringify({
             UID: uid,
             ID: id
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_del_group_from_auto_conf] = function(uid, ids){
     return MagicPacket + CMD.cs_adm_del_group_from_auto_conf + SendingFlags + JSON.stringify({
             UID: uid,
             IDS: ids
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_get_private_info] = function(uin, what){
     return MagicPacket + CMD.cs_get_private_info + SendingFlags + JSON.stringify({
             UIN: uin,
             What: what
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_upload_update_packet] = function(FileName_win32){
     return MagicPacket + CMD.cs_adm_upload_update_packet + SendingFlags + JSON.stringify({
             FileName_win32: FileName_win32
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_kill_users] = function(UINS){
     return MagicPacket + CMD.cs_adm_kill_users + SendingFlags + JSON.stringify({
             UINS: UINS
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_halt_users] = function(UINS){
     return MagicPacket + CMD.cs_adm_halt_users + SendingFlags + JSON.stringify({
             UINS: UINS
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_sync_private_history_last] = function(UINWith, Count){
     return MagicPacket + CMD.cs_sync_private_history_last + SendingFlags + JSON.stringify({
             UINWith : UINWith, // идентификатор собеседника
             Count   : Count  // количество сообщений, которые мы хотим получить
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_sync_private_history] = function(UINWith, Ranges){
     return MagicPacket + CMD.cs_sync_private_history + SendingFlags + JSON.stringify({
             UINWith : UINWith, // идентификатор собеседника
             Ranges  : Ranges  // наборы диапазонов индексов, через запятую. Можно указывать одинарные индексы, можно диапазоны, очерёдность не важна
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_script] = function(id){
     return MagicPacket + CMD.cs_adm_get_script + SendingFlags + JSON.stringify({
             ID  : id  // уникальный идентификатор скрипта
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_script_delete] = function(id){
     return MagicPacket + CMD.cs_adm_script_delete + SendingFlags + JSON.stringify({
             ID  : id  // уникальный идентификатор скрипта
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_script_onoff] = function(id, enabled){
     return MagicPacket + CMD.cs_adm_script_onoff + SendingFlags + JSON.stringify({
             ID  : id,  // уникальный идентификатор скрипта
             Enabled: enabled // включить или выключить скрипт
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_script_save] = function(id, text){
     return MagicPacket + CMD.cs_adm_script_save + SendingFlags + JSON.stringify({
             ID  : id,  // уникальный идентификатор скрипта
             ScriptSource: text //
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_script_create] = function(name, event){
     return MagicPacket + CMD.cs_adm_script_create + SendingFlags + JSON.stringify({
             ScriptName : name, // название скрипта, задаётся пользователем
             Event      : event // на какое событие возникает этот скрипт
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_script_check_syntax] = function(source, ScriptName){
     return MagicPacket + CMD.cs_adm_script_check_syntax + SendingFlags + JSON.stringify({
            ScriptSource    : source,  // исходный текст скрипта
            ScriptName      : ScriptName
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_script_run] = function(id, source){
     return MagicPacket + CMD.cs_adm_script_run + SendingFlags + JSON.stringify({
             ID : id,
             ScriptSource  : source  // исходный текст скрипта
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_script_event_states] = function(){
     return MagicPacket + CMD.cs_adm_get_script_event_states + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_update_packet_data] = function(){
     return MagicPacket + CMD.cs_adm_get_update_packet_data + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_online_users_list] = function(){
     return MagicPacket + CMD.cs_adm_get_online_users_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_restart_server_services] = function(mc, web, ftp){
     return MagicPacket + CMD.cs_adm_restart_server_services + SendingFlags + JSON.stringify({
             MyChat : mc,  // нужна или нет перезагрузка ядра MyChat Server
             WEB    : web, // WEB сервер NodeJS
             FTP    : ftp  // FTP сервер
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_get_channel_history_messages] = function(UID, Type, Last, From, To, List){
     return MagicPacket + CMD.cs_get_channel_history_messages + SendingFlags + JSON.stringify({
             UID    : UID ,   // идентификатор конференции
             Type   : Type,   // тип запроса. В зависимости от типа запроса будут поля Last или From/To либо List (1 or 2 or 3)
             Last   : Last,   // 1 - получить последние N сообщений, Last
             From   : From,   // 2 - получить сообщения с From по To
             To     : To  ,
             List   : List    // 3 - получить список сообщений, через запятую: List
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_sync_conf_history] = function(UID, Ranges){
     return MagicPacket + CMD.cs_sync_conf_history + SendingFlags + JSON.stringify({
         UID     : UID   , // уникальный идентификатор конференции, число (UID)
         Ranges  : Ranges  // наборы диапазонов индексов, через запятую. Можно указывать одинарные индексы,
                                          // можно диапазоны, очерёдность не важна
     }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_kill_txt_conf] = function(uid){
     return MagicPacket + CMD.cs_adm_kill_txt_conf + SendingFlags + JSON.stringify({
             UID    : uid // идентификатор канала
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_users_in_conf] = function(uid){
     return MagicPacket + CMD.cs_adm_get_users_in_conf + SendingFlags + JSON.stringify({
             UID    : uid // идентификатор канала
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_kick_users_from_conf] = function(uid, uins){
     return MagicPacket + CMD.cs_adm_kick_users_from_conf + SendingFlags + JSON.stringify({
             UID    : uid, // идентификатор канала
             UINS   : uins
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_add_allowed_or_blocked_plugins] = function(Name, Where){
     return MagicPacket + CMD.cs_adm_add_allowed_or_blocked_plugins + SendingFlags + JSON.stringify({
             Name    : Name , // список плагинов через запятую
             Where   : Where  // куда добавлять. 0 - список разрешённых, 1 - список запрещённых
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_delete_allowed_or_blocked_plugin] = function(Name, Where){
     return MagicPacket + CMD.cs_adm_delete_allowed_or_blocked_plugin + SendingFlags + JSON.stringify({
             Name    : Name , // список плагинов через запятую
             Where   : Where  // куда добавлять. 0 - список разрешённых, 1 - список запрещённых
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_allowed_and_blocked_plugins] = function(){
     return MagicPacket + CMD.cs_adm_get_allowed_and_blocked_plugins + SendingFlags + CRLF;
 };

 // ========== CLIENT OPTIONS =================================

 ClientToServCMD[CMD.cs_adm_get_client_options_presets] = function(){
     return MagicPacket + CMD.cs_adm_get_client_options_presets + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_del_client_options_preset] = function(id){
     return MagicPacket + CMD.cs_adm_del_client_options_preset + SendingFlags + JSON.stringify({
             ID    : id
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_apply_roles_to_options_presets] = function(data){
     return MagicPacket + CMD.cs_adm_apply_roles_to_options_presets + SendingFlags + data + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_create_client_options_preset] = function(Name, Body){
     return MagicPacket + CMD.cs_adm_create_client_options_preset + SendingFlags + JSON.stringify({
             "Name"      : Name,  // название шаблона
             "Body"      : Body   // содержимое шаблона, JSON объект, формат объекта как в команде sc_apply_client_settings
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_update_client_options_preset] = function(ID, Body){
     return MagicPacket + CMD.cs_adm_update_client_options_preset + SendingFlags + JSON.stringify({
             "ID"   : ID,  // числовой идентификатор шаблона настроек, который нужно удалить
             "Body" : Body  // новое содержимое шаблона, JSON объект, формат объекта как в команде sc_apply_client_settings
         }) + CRLF;
 };

 //======================================================================

 ClientToServCMD[CMD.cs_adm_set_integration_tools_options] = function(data){
     return MagicPacket + CMD.cs_adm_set_integration_tools_options + SendingFlags + data + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_integration_tool_options] = function(name){
     return MagicPacket + CMD.cs_adm_get_integration_tool_options + SendingFlags + JSON.stringify({
             name : name // название инструмента, набор настроек которого требуется получить
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_script_info] = function(ID){
     return MagicPacket + CMD.cs_adm_get_script_info + SendingFlags + JSON.stringify({
             ID: ID // уникальный идентификатор скрипта
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_change_mychat_server] = function(Immediately, UINS, IP1, Port1, IP2, Port2, ServName, Desc, Pass){
     return MagicPacket + CMD.cs_adm_change_mychat_server + SendingFlags + JSON.stringify({
             Immediately: Immediately,
             UINS     : UINS    ,  // список UIN-ов пользователей, для которых предназначена эта команда, через запятую. Все пользователи должны быть онлайн
             IP1      : IP1     ,  // основной адрес сервера чата
             Port1    : Port1   ,  // порт для подключения
             IP2      : IP2     ,  // резервный адрес сервера чата
             Port2    : Port2   ,  // второй порт для подключения
             ServName : ServName,  // название для сервера (условно)
             Desc     : Desc    ,  // описание сервера (условно)
             Pass     : Pass       // пароль для доступа к серверу (если указан на сервере, иначе - пустая строка)
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_get_users_list] = function(ListType, Num, UINS, PresetID){
     return MagicPacket + CMD.cs_get_users_list + SendingFlags + JSON.stringify({
             ListType : ListType, // тип запроса, 1 - все онлайн-пользователи, 2 - все зарегистрированніе пользователи на сервере, 3 - пользователи согласно запрошенному списку UIN-ов, 4 - список пользователей согласно номеру пресета для оповещения
             Num      : Num     , // произвольное целое число, для удобства определения типа запроса, если таких запросов делается несколько. Будет возвращено сервером в команде-ответе
             UINS     : UINS    , // список запрашиваемых UIN-ов пользователей, через запятую. Если нет - просто пустая строка
             PresetID : PresetID // номер пресета для оповещения. Если нет - то равно -1
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_get_book] = function(Name){
     return MagicPacket + CMD.cs_get_book + SendingFlags + JSON.stringify({
             Name : Name // название справочника. Название файла без расширения из папки C:\Program Files (x86)\MyChat Server\data\*.json
             // в ответ на эту команду придёт команда sc_book_data
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_is_file_exists] = function(Hash, MsgType, FileName, Where, ID, UTCWriteTime){
     return MagicPacket + CMD.cs_is_file_exists + SendingFlags + JSON.stringify({
             Hash     : Hash    , // SHA1 хэш файла
             MsgType  : MsgType , // тип файла. 2 - изображение, 4 - обычный файл
             FileName : FileName, // локальное название файла
             Where    : Where   , // куда вставлять файл (priv, conf, bbs, broadcast, forum, kanban)
             ID       : ID      , // число-идентификатор, для кого отправлять файл:
                                  // 1, private    - UIN
                                  // 2, conference - UID
                                  // 3, forum      - ID топика
                                  // 4, kanban     - ID таска
                                  // 5, bbs        - -1
                                  // 6, broadcast  - -1
             UTCWriteTime:UTCWriteTime
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_get_image_thumbs] = function(Hash, Width, Height, FileName){
     return MagicPacket + CMD.cs_get_image_thumbs + SendingFlags + JSON.stringify({
             Hash     : Hash    , // SHA1 хэш файла
             Width    : Width   , // произвольная ширина уменьшеной копии изображения
             Height   : Height  , // произвольная высота уменьшенной копии изображения
             FileName : FileName  // локальное название файла
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_integration_telegram_delete_user] = function(user_id){
     return MagicPacket + CMD.cs_adm_integration_telegram_delete_user + SendingFlags + JSON.stringify({
             user_id : user_id // внутренний Telegram ID пользователя
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_integration_telegram_modify_user] = function(user_id, active, mychat_uin){
     return MagicPacket + CMD.cs_adm_integration_telegram_modify_user + SendingFlags + JSON.stringify({
             user_id    : user_id   , // внутренний Telegram ID пользователя
             active     : active    , // юзер включен или нет?
             mychat_uin : mychat_uin  // назначенный UIN для связки с пользователем MyChat. Если не назначен, то -1
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_get_integration_telegram_users] = function(){
     return MagicPacket + CMD.cs_adm_get_integration_telegram_users + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_adm_integration_telegram_clear_users_list] = function(){
     return MagicPacket + CMD.cs_adm_integration_telegram_clear_users_list + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_files_request_transfer] = function(data){
     return MagicPacket + CMD.cs_files_request_transfer + SendingFlags + data + CRLF;
 };

 ClientToServCMD[CMD.cs_files_transfer_progress] = function(UIN, Percents, TotalSize, CurrentCount, TotalCount, Speed, CurrentTransfer){
     return MagicPacket + CMD.cs_files_transfer_progress + SendingFlags + JSON.stringify({
         "UIN"             : UIN             , // идентификатор получателя
         "Percents"        : Percents        , // сколько процентов файлов передано
         "TotalSize"       : TotalSize       , // общий объём передаваемых файлов
         "CurrentCount"    : CurrentCount    , // сколько файлов уже передано на данный момент
         "TotalCount"      : TotalCount      , // сколько файлов всего
         "Speed"           : Speed           , // текущая скорость передачи файлов
         "CurrentTransfer" : CurrentTransfer   // сколько байт на данный момент уже передано
     }) + CRLF;
 };

 ClientToServCMD[CMD.cs_files_success_recieved] = function(UIN){
     return MagicPacket + CMD.cs_files_success_recieved + SendingFlags + JSON.stringify({
         "UIN"     : UIN, // идентификатор получателя файлов
     }) + CRLF;
 };

 ClientToServCMD[CMD.cs_files_transfer_abort] = function(UIN){
     return MagicPacket + CMD.cs_files_transfer_abort + SendingFlags + JSON.stringify({
         "UIN"     : UIN, // идентификатор получателя файлов
     }) + CRLF;
 };

 ClientToServCMD[CMD.cs_files_transfer_deny] = function(UIN){
     return MagicPacket + CMD.cs_files_transfer_deny + SendingFlags + JSON.stringify({
         "UIN"     : UIN, // идентификатор получателя файлов
     }) + CRLF;
 };

 ClientToServCMD[CMD.cs_files_transfer_request_abort] = function(UIN){
     return MagicPacket + CMD.cs_files_transfer_request_abort + SendingFlags + JSON.stringify({
         "UIN"     : UIN, // идентификатор получателя файлов
     }) + CRLF;
 };

 ClientToServCMD[CMD.cs_files_internal_sended_ok_idx] = function(UIN, FileIdx){
     return MagicPacket + CMD.cs_files_internal_sended_ok_idx + SendingFlags + JSON.stringify({
         "UIN"     : UIN, // идентификатор получателя файлов
         "FileIdx" : FileIdx// индекс файла в общем списке передваемых файлов
     }) + CRLF;
 };
 
 ClientToServCMD[CMD.cs_files_transfer_accept] = function(UIN, Port, Interfaces, UncheckFiles, BufSize){
     return MagicPacket + CMD.cs_files_transfer_accept + SendingFlags + JSON.stringify({
         UIN          : UIN         , // идентификатор отправителя файлов
         Port         : Port        , // TCP порт получателя, на который будут передаваться файлы
         Interfaces   : Interfaces  , // список локальных сетевых интерфейсов получателя
         UncheckFiles : UncheckFiles, // индексы файлов, которые получатель не хочет принимать. Может быть пустым. Индексы перечисляются в текстовой строке через запятую
         BufSize      : BufSize       // размер буфера для передачи файлов через сервер, если передача напрямую не удастся по техническим причинам
     }) + CRLF;
 };

 //====================== FORUM ===============================

 ClientToServCMD[CMD.cs_forum_create_section] = function(ParentID, Weight, Caption){
     return MagicPacket + CMD.cs_forum_create_section + SendingFlags + JSON.stringify({
             ParentID : ParentID,  // ID родительского элемента в дереве, если 0 — это корневой элемент
             Weight   : Weight  ,  // "вес" раздела, если это custom-сортировка
             Caption  : Caption    // название раздела, текстовая строка
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_forum_delete_section] = function(ID){
     return MagicPacket + CMD.cs_forum_delete_section + SendingFlags + JSON.stringify({
             ID : ID  // идентификатор секции
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_forum_delete_post] = function(ID){
     return MagicPacket + CMD.cs_forum_delete_post + SendingFlags + JSON.stringify({
             ID : ID
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_forum_delete_topic] = function(ID){
     return MagicPacket + CMD.cs_forum_delete_topic + SendingFlags + JSON.stringify({
             ID : ID
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_forum_get_topic_posts] = function(ID){
     return MagicPacket + CMD.cs_forum_get_topic_posts + SendingFlags + JSON.stringify({
             ID : ID
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_forum_get_section_info] = function(ID){
     return MagicPacket + CMD.cs_forum_get_section_info + SendingFlags + JSON.stringify({
             ID : ID
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_forum_create_topic] = function(ParentID, Weight, Caption){
     return MagicPacket + CMD.cs_forum_create_topic + SendingFlags + JSON.stringify({
             ParentID : ParentID,  // ID родительского элемента в дереве, не может быть 0
             Weight   : Weight  ,  // "вес" топика, если это custom-сортировка
             Caption  : Caption    // название топика, текстовая строка
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_forum_create_post] = function(ParentID, Weight, Caption){
     return MagicPacket + CMD.cs_forum_create_post + SendingFlags + JSON.stringify({
             ParentID : ParentID,
             Weight   : Weight  ,
             Caption  : Caption
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_forum_change_topic] = function(ID, ParentID, Weight, Caption){
     return MagicPacket + CMD.cs_forum_change_topic + SendingFlags + JSON.stringify({
             ID       : ID,        // идентификатор секции
             ParentID : ParentID,  // ID родительского элемента в дереве, не может быть 0
             Weight   : Weight  ,  // "вес" топика, если это custom-сортировка
             Caption  : Caption    // название топика, текстовая строка
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_forum_change_section] = function(ID, ParentID, Weight, Caption){
     return MagicPacket + CMD.cs_forum_change_section + SendingFlags + JSON.stringify({
             ID       : ID,        // идентификатор секции
             ParentID : ParentID,  // ID родительского элемента в дереве, если 0 — это корневой элемент
             Weight   : Weight  ,  // "вес" раздела, если это custom-сортировка
             Caption  : Caption    // название раздела, текстовая строка
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_forum_change_post] = function(ID, ParentID, Weight, Caption){
     return MagicPacket + CMD.cs_forum_change_post + SendingFlags + JSON.stringify({
             ID       : ID,        // идентификатор сообщения
             ParentID : ParentID,  // новый ID родительской темы, если пост перемещается. Должен быть >0
             Weight   : Weight  ,  // вес, для custom-сортировки
             Caption  : Caption    // новый текст сообщения
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_forum_get_structure] = function(){
     return MagicPacket + CMD.cs_forum_get_structure + SendingFlags + CRLF;
 };

 // ==================== TOKEN =========================

 ClientToServCMD[CMD.cs_create_token] = function(Where, Link){
     return MagicPacket + CMD.cs_create_token + SendingFlags + JSON.stringify({
         Where : Where, // для доступа в какой сервис нужно получить токен. "kanban", "forum", "admin", "web"
         Link  : Link   // (6.0+) подраздел сервиса для автоматического перехода. По умолчанию пустая строка
     }) + CRLF;
 };

 ClientToServCMD[CMD.cs_get_public_ftp_info]  = function(){
     return MagicPacket + CMD.cs_get_public_ftp_info + SendingFlags + CRLF;
 };

 ClientToServCMD[CMD.cs_stat]           = function(stat){
     if (Service.isString) {
         try {
             stat = JSON.parse(stat);
         } catch (e){
             stat = null;
         }
     }

     if (stat === null) {
         console.err('STAT ERROR. Incorrect data');

         return "";
     } else

         return MagicPacket + CMD.cs_stat + SendingFlags +
             JSON.stringify({
                 "n_voice"             : stat.n_voice || 0,
                 "n_video"             : stat.n_video || 0,
                 "l_voice"             : stat.l_voice || 0,
                 "l_video"             : stat.l_video || 0,
                 "n_msg_img"           : stat.n_msg_img || 0,
                 "n_msg_smile"         : stat.n_msg_smile || 0,
                 "n_msg_conf_link"     : stat.n_msg_conf_link || 0,
                 "n_msg_local_net_link": stat.n_msg_local_net_link || 0,
                 "n_msg_user_link"     : stat.n_msg_user_link || 0,
                 "n_msg_font"          : stat.n_msg_font || 0,
                 "n_msg_action"        : stat.n_msg_action || 0,
                 "n_msg_myfiles"       : stat.n_msg_myfiles || 0,
                 "n_msg_publicfiles"   : stat.n_msg_publicfiles || 0,
                 "n_conf_msg"          : stat.n_conf_msg || 0,
                 "n_conf_create"       : stat.n_conf_create || 0,
                 "n_conf_enter"        : stat.n_conf_enter || 0,
                 "n_conf_invites"      : stat.n_conf_invites || 0,
                 "n_priv_msg"          : stat.n_priv_msg || 0,
                 "n_pers_msg"          : stat.n_pers_msg || 0,
                 "n_alert_msg"         : stat.n_alert_msg || 0,
                 "n_brdcst_msg"        : stat.n_brdcst_msg || 0,
                 "n_bbs"               : stat.n_bbs || 0,
                 "n_file"              : stat.n_file || 0,
                 "n_file_offline"      : stat.n_file_offline || 0,
                 "n_file_exp"          : stat.n_file_exp || 0,
                 "n_file_drag"         : stat.n_file_drag || 0,
                 "n_file_ctrlc"        : stat.n_file_ctrlc || 0,
                 "n_file_direct"       : stat.n_file_direct || 0,
                 "n_file_serv"         : stat.n_file_serv || 0,
                 "n_ohis"              : stat.n_ohis || 0,
                 "n_opr"               : stat.n_opr || 0,
                 "n_vpr"               : stat.n_vpr || 0,
                 "n_omyf"              : stat.n_omyf || 0,
                 "n_opf"               : stat.n_opf || 0,
                 "n_ign_view"          : stat.n_ign_view || 0,
                 "n_ign_add"           : stat.n_ign_add || 0,
                 "n_ign_del"           : stat.n_ign_del || 0,
                 "n_ign_mod"           : stat.n_ign_mod || 0,
                 "n_opriv"             : stat.n_opriv || 0,
                 "n_frcvd"             : stat.n_frcvd || 0,
                 "n_ocomp"             : stat.n_ocomp || 0,
                 "n_cexp"              : stat.n_cexp || 0,
                 "n_cimp"              : stat.n_cimp || 0,
                 "n_creategrp"         : stat.n_creategrp || 0,
                 "n_delgrp"            : stat.n_delgrp || 0,
                 "n_addcnt"            : stat.n_addcnt || 0,
                 "n_rengrp"            : stat.n_rengrp || 0,
                 "n_delcnt"            : stat.n_delcnt || 0,
                 "adm_ban"             : stat.adm_ban || 0,
                 "adm_kick"            : stat.adm_kick || 0,
                 "adm_disconnect"      : stat.adm_disconnect || 0,
                 "adm_halt"            : stat.adm_halt || 0,
                 "adm_blockuin"        : stat.adm_blockuin || 0,
                 "adm_block_ip"        : stat.adm_block_ip || 0,
                 "adm_block_mac"       : stat.adm_block_mac || 0,
                 "adm_ren_conf"        : stat.adm_ren_conf || 0,
                 "adm_set_topic"       : stat.adm_set_topic || 0,
                 "n_state"             : stat.n_state || 0,
                 "n_opt"               : stat.n_opt || 0,
                 "n_cons"              : stat.n_cons || 0,
                 "n_hlp"               : stat.n_hlp || 0,
                 "n_accmng"            : stat.n_accmng || 0,
                 "n_accmng_enter"      : stat.n_accmng_enter || 0,
                 "n_accmng_recall"     : stat.n_accmng_recall || 0,
                 "n_accmng_newuser"    : stat.n_accmng_newuser || 0,
                 "n_fnd"               : stat.n_fnd || 0,
                 "n_fnd_ext"           : stat.n_fnd_ext || 0,
                 "n_srv_spell"         : stat.n_srv_spell || 0,
                 "n_srv_ctrlspace"     : stat.n_srv_ctrlspace || 0,
                 "n_srv_beep"          : stat.n_srv_beep || 0,
                 "n_srv_stayontop"     : stat.n_srv_stayontop || 0,
                 "n_srv_transp"        : stat.n_srv_transp || 0,
                 "n_srv_fastmsg"       : stat.n_srv_fastmsg || 0,
                 "n_srv_block"         : stat.n_srv_block || 0,
                 "cl_hid"              : stat.cl_hid || "",
                 "cl_os"               : stat.cl_os || "Windows 7",
                 "cl_v"                : stat.cl_v || "6.0",
                 "cl_lng"              : stat.cl_lng || "ru",
                 "cl_plg"              : stat.cl_plg || "",
                 "cl_skin"             : stat.cl_skin || "Classic",
                 "cl_adm"              : stat.cl_adm || false,
                 "cl_ad"               : stat.cl_ad || false,
                 "cl_portable"         : stat.cl_portable || false,
                 "cl_instpath"         : stat.cl_instpath || 2,
                 "cl_t"                : stat.cl_t || "android"
             }) + CRLF;
 };

 ClientToServCMD[CMD.cs_set_uin_foto]           = function(Buf){
     return MagicPacket + CMD.cs_set_uin_foto + SendingFlags +
         JSON.stringify({
             Buf : Buf
         }) + CRLF;
 };

 ClientToServCMD[CMD.cs_get_uin_foto]    = function (uin){
     return MagicPacket + CMD.cs_get_uin_foto + SendingFlags + JSON.stringify({
             UIN: uin
         }) + CRLF;
 };

 ClientToServCMD[CMD.cLog] = function(log, msg) {
     console.important('[ADMIN-console.' + log + ']: ' + msg);
 };


 exports.ClientToServCMD = ClientToServCMD;