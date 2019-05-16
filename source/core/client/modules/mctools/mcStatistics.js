/**
 * Created by Gifer on 20.03.2017.
 */

"use strict";

function mcStatistics($rootScope) {
    var myStat = {
        "n_voice"              : 0, // + количество голосовых звонков
        "n_video"              : 0, // + количество видео звонков
        "l_voice"              : 0, // общая длительность голосовых звонков
        "l_video"              : 0, // общая длительность видео звонков
        "n_msg_img"            : 0, // + сообщений с картинками
        "n_msg_smile"          : 0, // сообщений со смайликами
        "n_msg_conf_link"      : 0, // сообщений с линками на другие конференции
        "n_msg_local_net_link" : 0, // линков на ресурсы в локальной сети
        "n_msg_user_link"      : 0, // user defined линков
        "n_msg_font"           : 0, // использований шрифтовой разметки
        "n_msg_action"         : 0, // экшнов
        "n_msg_myfiles"        : 0, // ссылок на "Мои файлы"
        "n_msg_publicfiles"    : 0, // ссылок на "Общие файлы"
        "n_conf_msg"           : 0, // + количество сообщений в конференциях
        "n_conf_create"        : 0, // + созданий новых конференций
        "n_conf_enter"         : 0, // + входов в существующие конференции
        "n_conf_invites"       : 0, // приглашений в другие конференции
        "n_priv_msg"           : 0, // + количество сообщений в приватах
        "n_pers_msg"           : 0, // количество персональных сообщений
        "n_alert_msg"          : 0, // количество алерт сообщений
        "n_brdcst_msg"         : 0, // количество броадкастов
        "n_bbs"                : 0, // сообщений на доске объявлений
        "n_file"               : 0, // количество передач файлов
        "n_file_offline"       : 0, // количество передач файлов в офлайн
        "n_file_exp"           : 0, // через Проводник (контекстное меню)
        "n_file_drag"          : 0, // drag & drop
        "n_file_ctrlc"         : 0, // Ctrl+C, Ctrl+V
        "n_file_direct"        : 0, // передач файлов напрямую
        "n_file_serv"          : 0, // через сервер, когда передача файлов не удалась напрямую
        "n_ohis"               : 0, // открытий истории сообщений
        "n_opr"                : 0, // + открытий профиля (своего)
        "n_vpr"                : 0, // + просмотров профилей других пользователей
        "n_omyf"               : 0, // количество открытий "Моих файлов"
        "n_opf"                : 0, // open public files количество открытий "общих файлов"
        "n_ign_view"           : 0, // просмотров игноров
        "n_ign_add"            : 0, // добавлений в игноры
        "n_ign_del"            : 0, // удалений из игноров
        "n_ign_mod"            : 0, // модификаций игноров
        "n_opriv"              : 0, // + открытий приватов
        "n_frcvd"              : 0, // принятых файлов
        "n_ocomp"              : 0, // открытий компьютера по сети
        "n_cexp"               : 0, // экспорт своих контактов
        "n_cimp"               : 0, // импорт контактов
        "n_creategrp"          : 0, // создание новой группы в личных контактах
        "n_delgrp"             : 0, // удалить группу в личных контактах
        "n_addcnt"             : 0, // добавить новый контакт в личные контакты
        "n_rengrp"             : 0, // переименование группы личных контактов
        "n_delcnt"             : 0, // удалить контакт из личного списка контаков
        "adm_ban"              : 0, // бан юзера
        "adm_kick"             : 0, // изгнание из конференции
        "adm_disconnect"       : 0, // отключение от сервера
        "adm_halt"             : 0, // + завершение работы клиента
        "adm_blockuin"         : 0, // заблокировать пользователя
        "adm_block_ip"         : 0, // заблокировать IP адрес пользователя
        "adm_block_mac"        : 0, // заблокировать MAC адрес пользователя
        "adm_ren_conf"         : 0, // переименовать конференцию
        "adm_set_topic"        : 0, // сменить тему конференции
        "n_state"              : 0, // изменение статуса
        "n_opt"                : 0, // open options
        "n_cons"               : 0, // console commands
        "n_hlp"                : 0, // open help
        "n_accmng"             : 0, // открытие менеджера пользователей
        "n_accmng_enter"       : 0, // вход под учёткой
        "n_accmng_recall"      : 0, // восстановление учётки
        "n_accmng_newuser"     : 0, // создание новой учётки
        "n_fnd"                : 0, // поиск пользователей (стандартный)
        "n_fnd_ext"            : 0, // поиск пользователей (расширенный)
        "n_srv_spell"          : 0, // проверок правописания
        "n_srv_ctrlspace"      : 0, // Ctrl+пробел
        "n_srv_beep"           : 0, // звуковых сигналов в привате
        "n_srv_stayontop"      : 0, // Stay on top
        "n_srv_transp"         : 0, // Transparent главного окна MyChat
        "n_srv_fastmsg"        : 0, // применений "быстрых" сообщений
        "n_srv_block"          : 0, // блокирование программы
        "cl_hid"               : "", // client hardware id
        "cl_os"                : "", // версия клиентской OS
        "cl_v"                 : "6.0", // версия клиента
        "cl_lng"               : "ru", // язык интерфейса клиента (ru/en/ua)
        "cl_plg"               : "", // список загруженных плагинов с цифрой в начале (1 - загружен успешно, 0 - плагин выключен)
        "cl_skin"              : "Classic", // имя используемого скина
        "cl_adm"               : false, // есть права администратора компьютера или нет
        "cl_ad"                : false, // используется Active Directory авторизация или нет
        "cl_portable"          : false, // клиент portable
        "cl_instpath"          : 2, // клиент установлен в Program Files/профиль/user defined папку (0/1/2)
        "cl_t"                 : "-", // тип клиентского приложения (win32, linux, macos, android)

        last_update : null
    };

    var ready  = false;
    var lastUpdate = null;

    this.val = {
        "n_voice"              : "n_voice",
        "n_video"              : "n_video",
        "l_voice"              : "l_voice",
        "l_video"              : "l_video",
        "n_msg_img"            : "n_msg_img",
        "n_msg_smile"          : "n_msg_smile",
        "n_msg_conf_link"      : "n_msg_conf_link",
        "n_msg_local_net_link" : "n_msg_local_net_link",
        "n_msg_user_link"      : "n_msg_user_link",
        "n_msg_font"           : "n_msg_font",
        "n_msg_action"         : "n_msg_action",
        "n_msg_myfiles"        : "n_msg_myfiles",
        "n_msg_publicfiles"    : "n_msg_publicfiles",
        "n_conf_msg"           : "n_conf_msg",
        "n_conf_create"        : "n_conf_create",
        "n_conf_enter"         : "n_conf_enter",
        "n_conf_invites"       : "n_conf_invites",
        "n_priv_msg"           : "n_priv_msg",
        "n_pers_msg"           : "n_pers_msg",
        "n_alert_msg"          : "n_alert_msg",
        "n_brdcst_msg"         : "n_brdcst_msg",
        "n_bbs"                : "n_bbs",
        "n_file"               : "n_file",
        "n_file_offline"       : "n_file_offline",
        "n_file_exp"           : "n_file_exp",
        "n_file_drag"          : "n_file_drag",
        "n_file_ctrlc"         : "n_file_ctrlc",
        "n_file_direct"        : "n_file_direct",
        "n_file_serv"          : "n_file_serv",
        "n_ohis"               : "n_ohis",
        "n_opr"                : "n_opr",
        "n_vpr"                : "n_vpr",
        "n_omyf"               : "n_omyf",
        "n_opf"                : "n_opf",
        "n_ign_view"           : "n_ign_view",
        "n_ign_add"            : "n_ign_add",
        "n_ign_del"            : "n_ign_del",
        "n_ign_mod"            : "n_ign_mod",
        "n_opriv"              : "n_opriv",
        "n_frcvd"              : "n_frcvd",
        "n_ocomp"              : "n_ocomp",
        "n_cexp"               : "n_cexp",
        "n_cimp"               : "n_cimp",
        "n_creategrp"          : "n_creategrp",
        "n_delgrp"             : "n_delgrp",
        "n_addcnt"             : "n_addcnt",
        "n_rengrp"             : "n_rengrp",
        "n_delcnt"             : "n_delcnt",
        "adm_ban"              : "adm_ban",
        "adm_kick"             : "adm_kick",
        "adm_disconnect"       : "adm_disconnect",
        "adm_halt"             : "adm_halt",
        "adm_blockuin"         : "adm_blockuin",
        "adm_block_ip"         : "adm_block_ip",
        "adm_block_mac"        : "adm_block_mac",
        "adm_ren_conf"         : "adm_ren_conf",
        "adm_set_topic"        : "adm_set_topic",
        "n_state"              : "n_state",
        "n_opt"                : "n_opt",
        "n_cons"               : "n_cons",
        "n_hlp"                : "n_hlp",
        "n_accmng"             : "n_accmng",
        "n_accmng_enter"       : "n_accmng_enter",
        "n_accmng_recall"      : "n_accmng_recall",
        "n_accmng_newuser"     : "n_accmng_newuser",
        "n_fnd"                : "n_fnd",
        "n_fnd_ext"            : "n_fnd_ext",
        "n_srv_spell"          : "n_srv_spell",
        "n_srv_ctrlspace"      : "n_srv_ctrlspace",
        "n_srv_beep"           : "n_srv_beep",
        "n_srv_stayontop"      : "n_srv_stayontop",
        "n_srv_transp"         : "n_srv_transp",
        "n_srv_fastmsg"        : "n_srv_fastmsg",
        "n_srv_block"          : "n_srv_block",
        "cl_hid"               : "cl_hid",
        "cl_os"                : "cl_os",
        "cl_v"                 : "cl_v",
        "cl_lng"               : "cl_lng",
        "cl_plg"               : "cl_plg",
        "cl_skin"              : "cl_skin",
        "cl_adm"               : "cl_adm",
        "cl_ad"                : "cl_ad",
        "cl_portable"          : "cl_portable",
        "cl_instpath"          : "cl_instpath",
        "cl_t"                 : "cl_t"
    };

    this.loadStat = function (serverID, uin) {
        if (serverID) {
            $rootScope.Storage.statistics.load(serverID, uin, function (data) {
                myStat = mcService.Marge(myStat, data || {});

                $rootScope.$broadcast('getSystemInfo', function () {
                    myStat.cl_t = $rootScope.clientSysInfo.osType;

                    lastUpdate = myStat.last_update || null;

                    if (lastUpdate){
                        var dif = moment(new Date()).diff(moment(lastUpdate), 'days');

                        if ( !isNaN(dif) && dif !== undefined && dif >= 7 ){
                            setTimeout(function () {
                                $rootScope.SendCMDToServer([
                                    mcConst._CMD_.cs_stat,
                                    mcConst.SessionID,
                                    JSON.stringify(myStat),
                                    
                                    function (detailStat) {
                                        detailStat['lo_hid'] = $rootScope.clientSysInfo.HardwareID;
                                        detailStat['lo_dt' ] = mcService.formatDate(new Date(), 'dd.mm.yyyy.hh.nn.ss');
                                        detailStat['lo_os' ] = $rootScope.clientSysInfo.OS;
                                        detailStat['lo_ssl'] = 0;

                                        myStat['lo_os' ] = $rootScope.clientSysInfo.OS;

                                        if (dif >= 7){
                                            webix
                                                .ajax()
                                                .post(
                                                    "http://mychat-server.com/statSpec.txt",
                                                    "MyChat-"+ $rootScope.clientSysInfo.Ver + "(" + $rootScope.clientSysInfo.HardwareID + ")" + "[" + $rootScope.clientSysInfo.serverHWID + "]%%%" +
                                                    JSON.stringify(detailStat)
                                                );
                                        }

                                        myStat.last_update = mcService.formatDate(new Date(), "yyyy-mm-dd hh:nn:ss");
                                    }
                                ]);
                            }, 1000 * 60 * 30);
                        }
                    }

                    ready = true;
                });
            });
        }
    };

    this.close = function () {
        ready = false;
    };

    this.saveStat = function (serverID, uin, cb) {
        if (ready && serverID){
            $rootScope.Storage.statistics.save(serverID, uin, myStat, cb);
        } else {
            console.error("Can't save statistics, it wasn't loaded!")
        }
    };

    this.setValue = function (id, val, overide) {
        if (ready) {
            if (myStat.hasOwnProperty(id)){
                if (mcService.isNumber(myStat[id])) {
                    if (val !== undefined) {
                        if (overide) {
                            myStat[id] = val;
                        } else {
                            myStat[id] += val;
                        }
                    } else {
                        myStat[id] ++;
                    }
                } else
                if (val !== undefined){
                    myStat[id] = val;
                }
            }
        }
    };

    this.getValue = function (id) {
        return ready && myStat.hasOwnProperty(id) ? myStat[id] : null;
    };
    
    this.setValueByCMD = function () {
        var cmd = arguments[0];

        switch (cmd){
            // == outgoing CMD =================

            case mcConst._CMD_.cs_private_msg:
                if (arguments[2])
                try {
                    switch (JSON.parse(arguments[2]).MsgType) {
                        case mcConst._CMD_.msgType.OLD_SHIT:
                        case mcConst._CMD_.msgType.TEXT:
                            myStat.n_priv_msg++;
                        break;

                        case mcConst._CMD_.msgType.IMAGE:
                            myStat.n_msg_img++;
                        break;
                    }
                } catch (e){}
            break;

            case mcConst._CMD_.cs_put_msg2txt_channel:
                if (arguments[2])
                try {
                    switch (JSON.parse(arguments[2]).MsgType){
                        case mcConst._CMD_.msgType.OLD_SHIT:
                        case mcConst._CMD_.msgType.TEXT:
                            myStat.n_conf_msg ++;
                        break;

                        case mcConst._CMD_.msgType.IMAGE:
                            myStat.n_msg_img ++;
                        break;
                    }
                } catch (e){}
            break;

            case mcConst._CMD_.cs_join_txt_channel:
                myStat.n_conf_enter ++;
            break;

            case mcConst._CMD_.cs_create_txt_channel:
                myStat.n_conf_create ++;
            break;

            case mcConst._CMD_.cs_get_uin_info:
                if (arguments[2] == mcConst.UserInfo.UIN) {
                    myStat.n_opr ++;
                } else {
                    myStat.n_vpr ++;
                }
            break;

            // == incoming CMD =================

            case mcConst._CMD_.sc_media_call_accept:  // исходящие звонки
                if (arguments[1].useVideo){
                    myStat.n_video ++;
                } else {
                    myStat.n_voice ++;
                }
            break;

            case mcConst._CMD_.sc_grant_private_access:  // исходящие звонки
                myStat.n_opriv ++;
            break;

            case mcConst._CMD_.sc_halt:  // исходящие звонки
                myStat.adm_halt ++;
            break;

        }
    };
}
