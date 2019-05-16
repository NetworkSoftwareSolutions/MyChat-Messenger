window.JS_SHA1_NO_COMMON_JS = true;

var mcConst = {
    Title : "MyChat",
    LMSG  : [],
    _CMD_ : window.hasOwnProperty('getCMD') ? getCMD() : {},
    countHistoryMessagesLoad: 45,
    minChatFrameWidth : 300,

    isWindowFocused: true,

    socketIO : null,
    
    ClientSettings: {},

    changeProtocol: location.protocol,

    nodePathes: {
        images: "sendimages",
        files : "files"
    },

    imageSize: {
        small : {
            x: 120,
            y: 120,
            xy: '120x120'
        },
        medium: {
            x: 150,
            y: 150,
            xy: '150x150'
        },
        big   : {
            x: 200,
            y: 200,
            xy: '200x200'
        },
        "0"   : {
            x: 120,
            y: 120,
            xy: '120x120'
        },
        "1"   : {
            x: 150,
            y: 150,
            xy: '150x150'
        },
        "2"   : {
            x: 200,
            y: 200,
            xy: '200x200'
        }
    },

    loadGif : "<img src='source/images/loading.gif'>",

    reconnectTime : 5000,

    lockPrevHotKeys: true,

    maxAvailableDate: '01.01.3000.00.00.00',
    neverDate: '01.01.1900.00.00.00',

    storageOpts: {
        OPENUSERS : 'openUsers-',
        SEQUENCE  : 'sequence-',
        STATUSICO : 'statusU-',
        DIALOGOPT : 'dialogOpt-',
        WRAPOPTS  : 'wrapOpts-',
        INPUTOPTS : 'inputOpts-',
        HISTORYDLG: 'historyDialogs-',
        CURRENTITM: 'currentItem-',

        // -------

        cUserOpt : 'cUserOpt-'
    },

    Lang : "ru",

    containers: {
        left   : "wrapperLeft",
        center : "wrapperCenter",
        right  : "wrapperRight"
    },

    lockInterface : 'lockInterface',

    mirrorStreamName : 'mirrorStreamName',
    videoStreamName  : 'videoStreamName',
    audioStreamName  : 'audioStreamName',
    videoContainer   : 'videoFrameContainer',

    storageFields: {
        lang    : 'cliLang',
        Login   : "cliLogin",
        Pwd     : "cliPwd",
        ServPwd : "cliServPwd",
        Rm      : "cliRm",
        AutoRld : "cliNoAutoConnect"
    },

    userFields : 'REMOTECLIENTTYPE,REMOTEINTERFACESLIST,LASTACCESS,LASTSPEAKTIME,STATE,TAG,HARDWAREID,DOMAIN,' +
                 'DOMAINREGTIME,DOMAINCHANGETIME,VER,UTC,REPUTATION,NICK,DISPLAYNAME,EMAIL,GROUPRIGHTS,COMPNETNAME,' +
                 'IP,MAC,UIN,ACTIVE,REGISTERED,WORKDEPT,TEAMLEAD', //

    dataModels : {
        Login            : 'Login',
        Main             : 'Main',
        ChatWrapper      : 'ChatWrapper',
        ChatFrame        : 'ChatFrame',
        ConfUserList     : 'ConfUserList',
        UserProfile      : 'UserProfile',
        Files            : 'Files',
        CommonContacts   : 'CommonContacts',
        PersonalContacts : 'PersonalContacts',
        Dialogs          : 'Dialogs',
        PrivateConfs     : 'PrivateConfs',
        PrivateInfo      : 'PrivateInfo',
        ServerManager    : 'ServerManager',
        ConfManager      : 'ConfManager',
        MainMenu         : 'MainMenu',
        Kanban           : 'Kanban',
        BBS              : 'BBS',
        CommonFiles      : 'CommonFiles',
        HistoryDialogs   : 'HistoryDialogs',
        ViewLogs         : 'ViewLogs',
        ReceiveFiles     : 'ReceiveFiles',
        Settings         : 'Settings',
        Broadcast        : 'Broadcast',
        Update           : 'Update',
        Forum            : "Forum",

        History          : 'History'
    },

    sexIcon : {
        0: "<span class='fa fa-user'></span>",
        1: "<span class='fa fa-male'></span>",
        2: "<span class='fa fa-female'></span>"
    },

    imagesPath : {
        noFilter   : 'source/images/nofilter20.png',
        loading    : 'source/images/loading.gif',
        all        : 'source/images/',
        flags      : 'source/images/flags/',
        loadImage  : 'source/images/loadimg.gif',
        nofile     : 'source/images/nofile.gif'
    },

    pathAliases : {
        AliasAdmin    : "admin", // папка-псевдоним, путь к админке
        AliasAPI      : "API", // папка-псевдоним, путь к Integration API
        AliasChat     : "chat", // папка-псевдоним, путь к WEB-чату
        AliasFiles    : "files", // папка-псевдоним, путь к файлам, залитым на сервер
        AliasForum    : "forum", // папка-псевдоним, путь ко встроенному форуму
        AliasKanban   : "kanban", // папка-псевдоним, путь к канбан-доске
        
        LobbyEnable   : true, // включен доступ к списку сервисов MyChat
        ForumEnable   : true, // включить доступ ко встроенному форуму
        KanbanEnable  : true, // включить доступ к канбан-доске
        ChatEnable    : true, // включить доступ к WEB-чату
        AdminEnable   : true // включить доступ к WEB-админке
    },

    whereFiles: {
        private: 1,
        conf   : 2,
        forum  : 3,
        kanban : 4,
        bbs    : 5,
        broadc : 6
    },

    states: {
        offline    : -1,
        online     : 0,
        away       : 1,
        dnd        : 2,
        webOnline  : 3
    },

    currentState: 0,

    LicenseInfo : {
        "ServerRegisteredBy"      : "Network Software Solutions", // на кого зарегистрирован сервер
        "IsFree"                  : false,                        // (5.7+) если сервер бесплатный, то true, иначе - false
        "IsMyChatGuestRegistered" : false                          // зарегистрирован ли сервис MyChat Guest
    },

    customLogin : false,

    lockWindowHeight : 80,

    ApplyPanelShowed : false,

    errMessageExpire : 5000,

    guestGroupId : 7,

    userFoto : {
        w : 135,
        h : 157
    },

    CRLF : '\r\n',
    CR   : '\r',
    LF   : '\n',

    ignores: {
        all          : "all", //- игнорировать всё
        confs        : "confs", //- сообщения в конференциях
        confpersonal : "confpersonal", //- личные сообщения в конференциях
        confalert    : "confalert", //- личные важные сообщения в конференциях
        private      : "private", //- приватные сообщения
        privatebeep  : "privatebeep", //- звуковые сигналы в привате
        info         : "info", //- запросы персональной информации о пользователе
        files        : "files", //- отправка файлов
        plugins      : "plugins" //- запросы плагинов
    },

    MyRightsSet : [
      /*
        + {1}   QLogin, "811":"Подключаться к MyChat серверу",
        + {2}   QBBSPost, "786":"Создание новых сообщений на доске",
        + {3}   QBBSView, "785":"Просмотр доски объявлений",
        + {4}   QTxtChCreate, "797":"Создание текстовых каналов",
        + {5}   QTxtChSay, "844":"Отправка сообщений в текстовые каналы",
        + {6}   QTxtChJoin, "796":"Вход в существующие текстовые каналы",
        + {7}   QPrivateOpen, "831":"Открытие новых приватов",
        + {8}   QPrivatesGetMessages, "832":"Получение приватных сообщений от других пользователей",
        + {9}   QUserDetailsChange, "837":"Изменение персонального профиля",
        + {10}  QFilesSend, "841":"Разрешить отправлять файлы другим пользователям",
        + {11}  QFilesReceive, "842":"Разрешить принимать файлы от других пользователей",
        + {12}  QOperatorBan, "821":"Право наказывать пользователей (ban)",
        + {13}  QOperatorTurnOutFromChannel, "820":"Право изгнания пользователей из текстовых каналов (kick)",
        + {14}  QKill,
        + {15}  QBlockIP,
        + {16}  QBlockMAC,
        + {17}  QOperatorTxtChTopicSet, "818":"Изменение темы текстовых каналов",
        + {18}  QFTPPublic, "840":"Доступ к общей папке на файловом сервере",
        + {19}  QFTPPersonal, "839":"Доступ к личной папке на файловом сервере",
        + {20}  QRemoteAdm,
        + {21}  QOperatorClearChannelText, "819":"Очистка текстовых каналов у всех пользователей",
        + {22}  QContactsListChange, "799":"Изменение персональной панели контактов",
        + {23}  QBroadcasts, "823":"Отправка оповещения другим пользователям",
        + {24}  QAllowPersonalMsg, "794":"Отправка персональных сообщений в каналах",
        + {25}  QAllowAlertMsg, "795":"Отправка важных персональных сообщений в каналах",
        + {26}  QAllowSysInfoView, "815":"Просмотр сетевого имени компьютера и IP-адреса пользователя",
        + {27}  QSendImages, "792":"Вставка изображений",
        + {28}  QAllowIgnores, "805":"Игнорирование других пользователей",
        + {29}  QAllowInvites, "810":"Отправка приглашений в каналы другим пользователям",
        + {30}  QImagesPrivates, "830":"Вставка изображений",
        + {31}  QShowCommonContactsList, "800":"Показывать общий список контактов",
        + {32}  QHalt,
        + {33}  QTxtChRename,
        + {34}  QTxtChDelete,
        + {35}  QForciblyInvites,
        + {36}  QBlockUIN,
        + {37}  QAllowPlugins, "827":"Использование плагинов",
        + {38}  QAllowOptionsChange, "806":"Изменение настроек клиентского приложения",
        + {39}  QAllowMyFavoriteChannels, "793":"Доступ к ''Моим любимым каналам''",
        + {40}  QAllowCloseProgram,
        + {41}  QAllowContactsListsTotal,                         // разрешить или запретить полностью доступ к панели контактов
        + {42}  QAllowAccountsManager,                            // разрешить пользоваться менеджером учётных записей
        + {43}  QWEBAllowViewLogsSelfPrivates,                    // просмотр своих разговоров в приватах
        + {44}  QWEBAllowViewLogsAllChannels,                     // просмотр всех разговоров в каналах
        + {45}  QWEBAllowViewLogsAllPrivates,                     // просмотр всех разговоров в приватах
        + {46}  QAllowFindUsersTool,                              // разрешить поиск пользователей
        + {47}  QAllowActions,                                    // разрешить вставку в текст Action-ов
        + {48}  QAllowClientLogPrivatesAndChannels,               // разрешить или запретить клиенту писать логи локально, у себя на компьютере
        + {49}  QMessengerStyle,                                  // Messenger-style отображения майчат клиента
        + {50}  QAllowOpenComputer,                               // показывать или нет в меню опцию "Открыть компьютер" по щелчку на имени юзера
        + {51}  QExceptionAllowRecievePrivates,                   // Приём приватных сообщений от пользователей, которым запрещена отправка приватных сообщений
        + {52}  QAllowViewRemoteUserMACAddress,                   // разрешить смотреть MAC адрес удалённого юзера
        + {53}  QAllowViewRemoteUserActiveProcess,                // разрешить смотреть активный процесс удалённого юзера
        + {54}  QWEBAllowViewFTPLog,                              // Просмотр FTP протоколов
        + {55}  QWEBAllowViewSystemLog,                           // Просмотр системных протоколов
        + {56}  QEnableTaskWorkersJobTimeControlSystem,           // контроль рабочего времени
        + {57}  QWEBSupportAllowAccess,                           // доступ к WEB-интерфейсу веб-суппорта
        + {58}  QWEBAllowAdmin,                                   // администрирование сервере через WEB
        + {59}  QAllowProgramBlockTool,                           // Блокирование работающей программы паролем
        + {60}  QAllowNetworkStatusChange,                        // Изменение сетевого статуса
        + {61}  QEnableAllowedClientsPluginsList,                 // Активировать список разрешённых клиентских плагинов
        + {62}: QEnableBlockedCLientsPluginsList,                 // Активировать список запрещённых клиенских плагино,
        + {63}  QEnablePluginsManagement,                         // Разрешить управление плагинами на клиенте
        + {64}  QAllowImagesInBroadcasts,                         // вставка картинок в оповещениях
        + {65}  QEnableFontLayoutsInMessages,                     // использование шрифтовой разметки в отправляемых сообщениях
          {66}  QAllowCreateHiddenChannels,                       // - (это ещё не внесено в базу данных) разрешить создавать скрытые каналы
        + {67}  QEnableTransferFilesOnlyViaServer,                // передавать файлы только через сервер
        + {68}  QEnableImmunityFromBans,                          // иммунитет от банов
        + {69}  QEnableAdvertBlock                                // показывать или нет рекламный блок
        + {70}  QBlockPrivatesExceptPersonalContacts,             // Запретить приваты со всеми, кроме входящих в личный список контактов
        + {71}  QBlockPrivatesExceptCommonContacts,               // Запретить приваты со всеми, кроме входящих в общий список контактов
        + {72}  QEnableImmunityFromIgnores,                       // Иммунитет от игноров
        + {73}  QIntegrationAPIEnableSendMsgFromAnyUser,          // Разрешить отправку сообщений от имени этих пользователей
        + {74}  QEnableVoiceCalls,                                // Голосовые звонки
        + {75}  QEnableVideoCalls,                                // Видеозвонки
        + {76}  QAllowGetVoiceCalls,                              // Разрешить получать голосовые звонки
        + {77}  QAllowGetVideoCalls,                              // Разрешить получать видеозвонки
        + {78}  QAllowAddNewPlugins,                              // Добавление новых плагинов
        + {79}  QAllowDeletePlugins,                              // Удаление плагинов
        + {80}  QAllowChangeAccountPassword,                      // Изменение пароля своей учётной записи
        + {81}  QAllowAccessForeignersToPersonalFiles,            // Разрешить доступ к личным файлам для других пользователей ("только чтение")
        + {82}  QAllowPublishLinkToPersonalFiles,                 // Разрешить публиковать ссылку на "Мои файлы на сервере"
        + {83}  QFTPPublicWrite,                                  // разрешить писать в общую папку
        + {84}  QFTPPersonalWrite                                 // разрешить писать в личную папку
        + {85}  QAllowSendInvites                                 // разрешить отправлять приглашения в MyChat другим людям
        + {86}  QWEBAllowViewNodeJSLogs,                          // разрешить просмотр логов NodeJS сервера
        + {87}  QWEBAllowViewAuditLogs                            // разрешить просмотр логов аудита
      */
    ],

    LoginInfo : {
        login   : "",
        pwd     : "",
        servPwd : "",
        rm      : ""
    },

    Auth      : '',
    PWD       : '',
    servPass  : '',

    BrowserID : '',
    SessionID : '',

    LoggedIn  : false,
    nowLogin  : false,

    terminator       : '\u2022',
    terminator2      : '\u0002',
    terminator3      : '\u0003',
    newLine          : '\u000b',

    myChatLinkTitle  : "?specialMyChatLinkTitle=",

    PingTimer        : null,
    PingInterval     : 200,

    mcPara           : "L$",
    mcParaRight      : "R#$",
    mcParaCenter     : "C#$",

    UserInfo   : {                       // информация о залогиненом юзере
        "UIN"             : 0,           // UIN пользователя, который залогинен в системе
        "Nick"            : "Anonymous", // ник пользователя, который сообщил ему сервер
        "Sex"             : 1,           // пол пользователя
        "Avatar"          : 0,           // номер аватара пользователя
        "Status"          : 0,
        "LoginStyle"      : "login",     // тип логина: "login" - обычный логин, "domain" - доменная авторизация
        "AutoAwayTime"    : 15,          // время в минутах, после которого будет считаться, что пользователь неактивен
                                         // за компьютером, если он не нажимал ничего на клавиатуре и не шевелил мышкой
        "ServerSignature" : "",          // специальная сигнатура сервера MyChat, нужна для системы статистики
        "HWID"            : "",          // серийник сервера
        "Domain"          : "domain"     // если доменная авторизация, "LoginStyle" = "domain", то в этом параметре
                                         // передаётся ещё и имя домена, с которого проходит аторизация.
                                         // Если доменной авторизации нет - этот параметр не передаётся
    },

    ErrorText  : {},
    SrvErrorText: {},

    CanDisplayNotificator : false,
    NotificatorObject     : null,

    ExtendedMode           : true,
    CanChangToExtendedMode : true,
    WidthForExtendedMode   : 800,

    oneDay : 1000*60*60*24,

    navWidth : 270,

    isShowed : null,
    nextShow : '',

    scrResize : null,
    navResize : null,

    noNotify : false,
    notify   : null,
    idNotify : 0,

    ServerInfo: {
        Host: '127.0.0.1',
        Port: 2004,
        ID  : null
    },

    keyCodes : {
        // Alphabet
        a:65, b:66, c:67, d:68, e:69,
        f:70, g:71, h:72, i:73, j:74,
        k:75, l:76, m:77, n:78, o:79,
        p:80, q:81, r:82, s:83, t:84,
        u:85, v:86, w:87, x:88, y:89,
        z:90,

        // Numbers
        n0:48, n1:49, n2:50, n3:51, n4:52,
        n5:53, n6:54, n7:55, n8:56, n9:57,

        // Controls
        tab:  9, enter :13,  shift :16, backspace:8,
        ctrl:17, alt   :18,  esc   :27, space    :32,
        menu:93, pause :19,  cmd   :91, insert   :45,
        home:36, pageup:33,'delete':46, end      :35,
        pagedown:34,

        // F*
        f1:112, f2:113, f3:114, f4 :115, f5 :116, f6 :117,
        f7:118, f8:119, f9:120, f10:121, f11:122, f12:123,

        // numpad
        np0: 96, np1: 97, np2: 98, np3: 99, np4:100,
        np5:101, np6:102, np7:103, np8:104, np9:105,

        npslash:11,npstar:106,nphyphen:109,npplus:107,npdot:110,

        // Lock
        capslock:20, numlock:144, scrolllock:145,

        // Symbols
        equals: 61, hyphen   :109, coma  :188, dot:190,
        gravis:192, backslash:220, sbopen:219, sbclose:221,
        slash :191, semicolon: 59, apostrophe : 222,

        // Arrows
        aleft:37, aup:  38, aright:39, adown:40,

        PrintSymbols :
            [32, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65,
                66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76,
                77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87,
                88, 89, 90, 96, 97, 98, 99, 100,101,102,103,
                105,106,107,109,110,111,186,187,188,189,190,
                104,191,192,219,220,221,222],

        EditSymbols  : [8,  32, 46],

        Digits :
            [48, 49, 50, 51,  52, 53, 54, 55, 56, 57,
                96, 97, 98, 99, 100,101,102,103,104,105],

        ControlFunc	 :
            [ 33, 34, 35, 36, 37, 38, 39, 40,112,113,
                114,115,116,117,118,119,120,121,122,123],

        ControlsKeys : [36, 33, 35, 34, 37, 38, 39, 40],

        PrintAndEdit : function(){
            return mcConst.keyCodes.PrintSymbols.concat(mcConst.keyCodes.EditSymbols);
        }
    },

    KanbanEvents: {
        TASK_ADDED             : 1,
        TASK_PERFORMER_CHANGED : 2,
        COMMENT_ADDED          : 3,
        TASK_MOVED             : 4,
        TASK_CHANGED           : 5,
        TASK_DELETED           : 6,
        PROJECT_CLOSED         : 7
    },

    historyTypes: {
        count: 1,
        range: 2,
        list : 3
    },

    FTP: {
        CommonUser: 'mcuser',
        CommonPWD : 'mychat'
    }
};