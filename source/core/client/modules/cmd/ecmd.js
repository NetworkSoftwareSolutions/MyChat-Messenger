;(function(factory) {
    if (typeof exports === 'object') {
        exports.ECMD = factory();
    } else
    if (window){
        var ecmd = factory();

        if (window.mcConst && window.mcConst._CMD_){
            Object.keys(ecmd).forEach(function (cmd) {
                window.mcConst._CMD_[cmd] = ecmd[cmd];
            });
        } else {
            window._ECMD_ = ecmd;
        }
    }
})(function() {
    "use strict";

    return {
        // ==== Client => Electron =============================================

        ce_get_server_list         : '7001', // найти сервера чата в локальной сети
        ce_test_server_ip          : '7002', // тест IP адреса
        ce_set_language            : '7003', //
        ce_modify_server           : '7004', // обновление сервера
        ce_add_server              : '7005', // добавление сервера
        ce_del_server              : '7006', // удаление сервера
        ce_quit_from_program       : '7007', //
        ce_get_client_settings     : '7008', //
        ce_set_client_settings     : '7009', // сохранение настроек в базу
        ce_hide_program            : '700A', // спрятать окно чата в трей
        ce_show_notify             : '700B', // show notify
        ce_save_autoconnect_server : '700C', // сохраняем ид сервера к которому нужно подключаться и рароль пользователя + сервера
        ce_load_autoconnect_server : '700D', // вычитать информацию про сервер к которому нужно подключаться
        ce_hide_or_close_by_x      : '700E', // прятать или закрывать программу по нажатию на крестик окна
        ce_storage_get             : '700F', // получение значения storage у пользователя uin с индексом сервера srv
        ce_storage_save            : '7010', // добавление/обновление новых данный в storage
        ce_storage_remove          : '7011', // удаление данных из storage
        ce_open_internal_url       : '7012', // открыть адрес со своего сервера

        ce_statistics_get          : '7013', // получение данных статистики
        ce_statistics_save         : '7014', // сохранение статистики
        ce_get_mc_client_info      : '7015', // получение системной информации про клиент чата

        ce_break_blink             : '7016', // убираем мигающий конвертик с трея
        ce_show_on_top             : '7017', // пришло новое сообщение BBS

        ce_ftp_login               : '7018', // ftp
        ce_ftp_quit                : '7019', //
        ce_ftp_list                : '701A', // получить список файлов FTP каталога
        ce_ftp_download            : '701B', //
        ce_ftp_upload              : '701C', //

        ce_console_log             : '701E', //

        ce_file_download_abort     : '701D', //
        ce_file_upload_abort       : '701F', //
        ce_file_upload_start       : '7020', //
        ce_file_upload_prepare_abort:'7021', // abort sha1 calc
        ce_file_check_exist        : '7023', // отправляется после ec_check_file_exist
        ce_file_download_url       : '7025', // handleRedirect

        ce_get_clipboard_files_list: '7022', //
        ce_hide_window             : '7024', //

        ce_file_open_in_folder     : '7026', //
        ce_file_open_or_download   : '7028', //

        ce_special_link_user_info  : '7027', // отправляется данные про пользователя, по чьей ссылке мы кликнули в чатя, для скачивания файла

        ce_history_get_dialogs     : '7029', //
        ce_history_set_dialogs     : '702A', //
        ce_history_remove_dialogs  : '702B', //

        ce_file_direct_upload_start     : '702C', //
        ce_file_direct_upload_abort     : '702D', //
        ce_file_direct_upload_complete  : '702E', //
        ce_file_direct_upload_prepare   : '702F', //

        ce_get_logs_list           : '7030', //
        ce_get_user_folder         : '7031', //

        ce_file_set_new_folder_for_user : '7032', //

        ce_file_direct_receive_start    : '7033', //

        ce_stop_ftp_server         : '7034', //
        ce_remove_ftp_user         : '7035', //

        ce_file_open_folder        : '7036', //

        ce_get_logs_files          : '7037', //
        ce_toggle_min_max          : '7038', //
        ce_toggle_kiosk            : '7039', //

        ce_web_services_info       : '703A', //
        ce_client_disconnected     : '703B', //
        ce_server_ports            : '703C', //
        ce_disable_always_on_top   : '703D', //
        ce_restart_client          : '703E', //

        ce_start_ftp_server        : '703F', //
        ce_client_connected        : '7040', //

        // ==== Electron => Client =============================================

        ec_get_server_list         : '9001', // список серверов чата в локальной сети
        ec_test_server_ip          : '9002', // ответ теста адреса
        ec_complete_command        : '9003', // подтверждение выполнение команды
        ec_server_added            : '9004', // сервер добавлен, возвращает его id
        ec_error                   : '9005', // возникла ошибка
        ec_server_saved            : '9006', // была изменена информация про сервер
        ec_get_client_settings     : '9007', //
        ec_load_autoconnect_server : '9008', // получить инфо по автосерверу
        ec_open_dialog             : '9009', // открыть приват или конференцию, сейчас вызывается по лику на трей-нотифай
        ec_storage_get             : '900A', // получение данных из storage

        ec_statistics_get          : '900B', // данные статистики
        ec_get_mc_client_info      : '900C', //

        ec_open_local_kanban       : '900D', // был переход по ссылке на канбан

        ec_ftp_login               : '900E', //
        ec_ftp_error               : '900F', //
        ec_ftp_uploaded            : '9010', //
        ec_ftp_list                : '9011', //
        ec_ftp_progress            : '9012', //

        ec_get_clipboard_files_list: '9019', //

        ec_file_download_start     : '9017', //
        ec_file_download_progress  : '9013', //
        ec_file_download_complete  : '9015', //
        ec_file_download_aborted   : '9018', //

        ec_file_upload_start       : '9020', //
        ec_file_upload_progress    : '9014', //
        ec_file_upload_complete    : '9016', //
        ec_file_upload_aborted     : '9021', //

        ec_file_upload_prepare_start   : '9024', //
        ec_file_upload_prepare_progress: '9022', //

        ec_file_check_exist        : '9025', //

        ec_mainWindowFocused       : '9026', //
        ec_history_get_dialogs     : '9027', //

        ec_file_direct_upload_start     : '9028', //
        ec_file_direct_upload_aborted   : '9029', //
        ec_file_direct_upload_progress  : '902A', //
        ec_file_direct_upload_complete  : '902B', //

        ec_get_logs_list           : '902C', //
        ec_drop_connect            : '902D', //

        ec_file_direct_upload_no_files  : '902E', //
        ec_get_user_folder              : '902F', //

        ec_file_set_new_folder_for_user : '9030', //
        ec_file_direct_receive_start    : '9031', //
        ec_file_direct_receive_client_disconnected : '9032', //

        ec_get_logs_files           : '9033', //
        ec_system_suspend           : '9034', //
        ec_system_resume            : '9035', //
        ec_download_update          : '9036', //

        ec_mainWindowBlur           : '9037', //

        ec_file_download_file_no_found  : '9038',

        // ==== electron errors=================================================

        errElectron : {
            eDuplicateServer : 1, // возникает при добавлении сервера, когда уже есть сервера с такой парой адреса и порта
            eUnknownServerID : 2, // передан неизвестный ИД сервера для сохранения
            eFtpNotConnected : 3, // нет FTP подключения
            eFtpError        : 4,
            eFileDownload    : 5,
            eFileUpload      : 6
        },

        _last_ : '---'
    }
});

