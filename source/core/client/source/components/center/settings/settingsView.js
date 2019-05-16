"use strict";

function initSettingsView($scope){
    var view = $$($scope.Name);

    if (!view){
        var labelWidth     = 200;
        var blockWidth     = 600;
        var headerList     = {
            '1':  mcLang({id:591,  from: "admin"}), // "591":"Сетевые настройки",
            '2':  mcLang({id:1345, from: "admin"}), // "1345":"Настройки прокси",
            '3':  mcLang({id:1350, from: "admin"}), // "1350":"Общие",
            '4':  mcLang({id:1357, from: "admin"}), // "1357":"Окно чата",
            '5':  mcLang({id:1367, from: "admin"}), // "1367":"Показывать окно чата поверх всех окон",
            '6':  mcLang({id:1371, from: "admin"}), // "1371":"Формат даты/времени в протоколах сообщений",
            '7':  mcLang({id:1373, from: "admin"}), // "1373":"Информационные окошки в системном трее",
            '8':  mcLang({id:1336, from: "admin"}), // "1336":"Горчие клавиши",
            '9':  mcLang({id:1402, from: "admin"}), // "1402":"Звуки",
            '10': mcLang({id:29,   from: "admin"}), // "29" : "Сообщения",
            '11': mcLang({id:1430, from: "admin"}), // "1430":"Системные события",
            '12': mcLang({id:598,  from: "admin"}), // "598": "Протоколирование",
            '13': mcLang({id:1445, from: "admin"}), // "1445":"Загрузка истории сообщений в приват",
            '14': mcLang({id:1451, from: "admin"}), // "1451":"Максимальный размер истории сообщений в окне (штук)",
            '15': mcLang({id:838,  from: "admin"}), // "838":"Файлы",
            '16': mcLang({id:1461, from: "admin"}), // "1461":"Интерфейс клиаента чата",
            '17': mcLang({id:1464, from: "admin"}), // "1464":"Обновления",
            '18': mcLang({id:574,  from: "admin"}), // "574":"Дополнительно",
            '19': mcLang({id:1851, from: "admin"})  // "1851":"Звонки",
        };

        var __items = [
            // == "1350":"Общие" ==
            { rows: [
                { template: headerList['3'], head: 3, id: "rmctrlHeader3",  css: "dialogsHeader font115 byCenter white lHeight28", height: 28},

                { padding: 7, rows: [
                    // { id: "rcitm_GeneralWindowsStart", head: 3, view: "checkbox", labelRight: mcLang({id:1351, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}},
                    { id: "rcitm_GeneralConfirmExit",  head: 3, view: "checkbox", labelRight: mcLang({id:1352, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}},
                    { height: 10},
                    { id: "rcitm_GeneralMainWindow", head: 3, view: "radio", css: "finger paraPadding20", value: "0", vertical: true, label: mcLang({id:1353, from: "admin"}), labelPosition: "top", height: 100, options: [
                        { id: "0", value: mcLang({id:683, from: "admin"})},  // "683": "Ничего не делать",
                        { id: "1", value: mcLang({id:1355, from: "admin"})}, // "1355":"Прятать окно MyChat в трей после старта",
                        { id: "2", value: mcLang({id:1356, from: "admin"})}  // "1356":"Разворачивать главное окно на весь экран после старта",
                    ], on: { onChange: $scope.universalChanger}},
                    { height: 10},
                    { id: "rcitm_SpecialMessagesFontSize", head: 3, view: "radio", css: "finger paraPadding20", value: "0", vertical: true, label: mcLang({id:1664, from: "admin"}), labelPosition: "top", height: 120, options: [// "1664":"Размер шрифта для сообщений",
                        { id: "0", value: mcLang({id:1667, from: "admin"})}, // "1667":"маленький",
                        { id: "1", value: mcLang({id:1668, from: "admin"})}, // "1668":"обычный",
                        { id: "2", value: mcLang({id:1669, from: "admin"})}, // "1669":"большой",
                        { id: "3", value: mcLang({id:1670, from: "admin"})}  // "1670":"очень большой",
                    ], on: { onChange: $scope.universalChanger}},
                    { id: "rcitm_EventsTimeStamp", head: 4,  view: "checkbox", labelRight: mcLang({id:1372, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}},
                ]}
            ]},

            // == "1357":"Окно чата" ==
            { rows: [
                { template: headerList['4'], head: 4, id: "rmctrlHeader4",  css: "dialogsHeader font115 byCenter white lHeight28", height: 26},

                { padding: 7, rows: [
                    { id: "rcitm_GeneralShowSendButton", head: 4, view: "checkbox",  labelRight: mcLang({id:1358, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}},
                    { id: "rcitm_GeneralCtrlEnterSend", head: 4, view: "checkbox",  labelRight: mcLang({id:1359, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}},
                    { id: "rcitm_GeneralSpellCheck", head: 4, view: "checkbox",  labelRight: mcLang({id:1360, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}},
                    // { id: "rcitm_GeneralAutoHideMainWindow", head: 4, view: "checkbox",  labelRight: mcLang({id:1361, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1361":"Автоматическое скрытие окна MyChat Client в трей при бездействии пользователя",
                    { id: "rcitm_GeneralDoubleClickPagesClose", head: 4, view: "checkbox",  labelRight: mcLang(614), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}} // "614":"Закрывать диалоги двойным щелчком мыши",
                ]}
            ]},

            // == "1367":"Показывать окно чата поверх всех окон", ==
            { rows: [
                { template: headerList['5'], head: 5, id: "rmctrlHeader5",  css: "dialogsHeader font115 byCenter white lHeight28", height: 26},

                { padding: 7, rows: [
                    { id: "rcitm_EventsPopupOnNewBBS", head: 5, view: "checkbox",  labelRight: mcLang({id:1368, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}},
                    { id: "rcitm_EventsPopupOnChannelMessage", head: 5, view: "checkbox",  labelRight: mcLang({id:1369, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}},
                    { id: "rcitm_EventsPopupOnPrivateMessage", head: 5, view: "checkbox",  labelRight: mcLang({id:1370, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}
                ]}
            ]},

            // == "1373":"Информационные окошки в системном трее", ==
            { rows: [
                { template: headerList['7'], head: 7, id: "rmctrlHeader7",  css: "dialogsHeader font115 byCenter white lHeight28", height: 26},

                { padding: 7, rows: [
                    { id: "rcitm_EventsShowPopupTrayWindow", head: 7, view: "checkbox",  labelRight: mcLang({id:1374, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}},
                    { id: "rcitm_EventsTrayBBSMsg", head: 7, view: "checkbox",  labelRight: mcLang({id:1368, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1368":"При новому повідомленні на дошці оголошень",
                    { id: "rcitm_EventsTrayChMsg", head: 7, view: "checkbox",  labelRight: mcLang({id:1369, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1369":"При получении нового сообщения в конференциях",
                    { id: "rcitm_EventsTrayPvMsg", head: 7, view: "checkbox",  labelRight: mcLang({id:1370, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1370":"При получении нового сообщения в привате",

                    { height: 10},

                    { head: 7,  cols: [
                        { id: "rcitm_EventsTrayDontHide", head: 7, view: "radio", value: "1", vertical: true, width: 300, label: mcLang({id:1334, from: "admin"}), labelPosition: "top", css: "finger paraPadding20", height: 70, options:[ // "1334":"Что делать со всплывающим окном?",
                            { id: "1", value: mcLang({id:1378, from: "admin"})}, // "1378":"Показывать и не прятать",
                            { id: "0", value: mcLang({id:1380, from: "admin"})} // "1380":"Скрывать после:",
                        ], on: { onChange: $scope.universalChanger}},

                        { rows: [
                            { height: 42},
                            
                            { cols: [
                                { id: "rcitm_EventsTrayWindowDuration", head: 7, view: "counter", value: 10, step: 1, min: 1, max: 999, width: 100, on: { onChange: $scope.universalChanger, onKeyPress: $scope.checkNumbers}},
                                { template: mcLang({id:1379, from: "admin"}), height: 38, autoheight: true, css: "lHeight38", borderless: true } // "1379":"секунд",
                            ]}
                        ]}
                    ]},
                    { id: "rcitm_EventsTrayBlinkOnTaskBar", head: 7, view: "checkbox",  labelRight: mcLang({id:1842, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1370":"При получении нового сообщения в привате",
                ]}
            ]},

            // == "1402":"Звуки", ==
            { rows: [
                { template: headerList['9'], head: 9, id: "rmctrlHeader9",  css: "dialogsHeader font115 byCenter white lHeight28", height: 26},

                { padding: 7, rows: [

                    { id: "rcitm_SoundsAllSoundsOff", head: 9,  rows: [
                        { id: "sub_SoundsAllSoundsOff", head: 9, view: "checkbox", labelRight: mcLang({id:1403, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}} // "1403":"Включить все звуки",
                    ]},

                    { cols: [
                        { rows: [
                            { head: 9, view: "accordion", multi: true, rows: [
                                { id: "rcitm_SoundsAllSoundsOffCustom", view: "accordionitem", header: mcLang({id:1681, from: "admin"}), collapsed : true, body:{ padding: 7, rows: [
                                    { id: "rcitm_SoundsSndError", hidden: true, head: 9, view: "checkbox", labelRight: mcLang({id:1386, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1386":"Ошибка",
                                    { id: "rcitm_SoundsSndJoin", head: 9, view: "checkbox", labelRight: mcLang({id:1404, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1404":"Пользователь заходит в канал",
                                    { id: "rcitm_SoundsSndLeave", head: 9, view: "checkbox", labelRight: mcLang({id:1405, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1405":"Пользователь покидает канал",
                                    { id: "rcitm_SoundsSndChat", head: 9, view: "checkbox", labelRight: mcLang({id:1406, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1406":"Новое сообщение в канале",
                                    { id: "rcitm_SoundsSndStatus", hidden: true, head: 9, view: "checkbox", labelRight: mcLang({id:1407, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1407":"Изменения в чате (смена ника, аватара, темы канала и т.д.)",
                                    { id: "rcitm_SoundsSndSignal", hidden: true, head: 9, view: "checkbox", labelRight: mcLang({id:1408, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1408":"Сигнал",
                                    { id: "rcitm_SoundsSndChatType", head: 9, view: "checkbox", labelRight: mcLang({id:1409, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1409":"Ввод текст",
                                    { id: "rcitm_SoundsSndChatBS", head: 9, view: "checkbox", labelRight: mcLang({id:1410, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1410":"Правка текста (BS, Del)",
                                    { id: "rcitm_SoundsSndChatRet", head: 9, view: "checkbox", labelRight: mcLang({id:1411, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1411":"Ввод текста (Enter)",
                                    { id: "rcitm_SoundsSndNewMsg", head: 9, view: "checkbox", labelRight: mcLang({id:1412, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1412":"Новое сообщение на доске объявлений",
                                    { id: "rcitm_SoundsSndPrivate", head: 9, view: "checkbox", labelRight: mcLang({id:1413, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1413":"Новое сообщение в привате",
                                    { id: "rcitm_SoundsSndBadWord", hidden: true, head: 9, view: "checkbox", labelRight: mcLang({id:1414, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1414":"Плохие слова",
                                    { id: "rcitm_SoundsSndBroadcast", head: 9, view: "checkbox", labelRight: mcLang({id:1415, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1415":"Новое оповещение",
                                    { id: "rcitm_SoundsSndScreenShot", head: 9, view: "checkbox", labelRight: mcLang({id:1416, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1416":"Снимок экрана",
                                    { id: "rcitm_SoundsSndFilesExchangeRequest", head: 9, view: "checkbox", labelRight: mcLang({id:1417, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1417":"Запрос на передачу файлов",
                                    { id: "rcitm_SoundsSndFilesExchangeDone", head: 9, view: "checkbox", labelRight: mcLang({id:1418, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1418":"Передача файлов завершена",
                                    { id: "rcitm_SoundsSndMediaCall", head: 9, view: "checkbox", labelRight: mcLang({id:1419, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1419":"Медиазвонок, сигнал вызова",
                                    { id: "rcitm_SoundsSndMediaBusy", head: 9, view: "checkbox", labelRight: mcLang({id:1420, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1420":"Медиазвонок, сигнал \"занято\"",
                                    { id: "rcitm_SoundsSndMediaCallReject", head: 9, view: "checkbox", labelRight: mcLang({id:1421, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1421":"Медиазвонок, обрыв связи",
                                    { id: "rcitm_SoundsSndMediaIncomingCall", head: 9, view: "checkbox", labelRight: mcLang({id:1422, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1422":"Медиазвонок, входящий звонок",
                                    { id: "rcitm_SoundsSndMediaEndCall", head: 9, view: "checkbox", labelRight: mcLang({id:1423, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}  // "1423":"Медиазвонок, конец связи",
                                ]}},
                                
                                { id: "rcitm_SoundsFilesCustom", hidden: true, view: "accordionitem", header: mcLang({id:1694, from: "admin"}), collapsed : true, body:{ padding: 7, rows: [
                                    { id: "rcitm_SoundsSndErrorFile", hidden: true, head: 9, view: "text", label: mcLang({id:1702, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1702":"Файл звука сообщения об ошибке",
                                    { id: "rcitm_SoundsSndJoinFile", head: 9, view: "text", label: mcLang({id:1698, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1698":"Файл звука пользователей, которые входят в конференцию",
                                    { id: "rcitm_SoundsSndLeaveFile", head: 9, view: "text", label: mcLang({id:1697, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1697":"Файл звука пользователей, которые покидают конференцию",
                                    { id: "rcitm_SoundsSndChatFile", head: 9, view: "text", label: mcLang({id:1706, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1706":"Файл звука сообщения в текстовой конференции",
                                    { id: "rcitm_SoundsSndStatusFile", hidden: true, head: 9, view: "text", label: mcLang({id:1701, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1701":"Файл звука статусного сообщения",
                                    { id: "rcitm_SoundsSndSignalFile", hidden: true, head: 9, view: "text", label: mcLang({id:1705, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1705":"Файл звука \"будильника\" в привате",
                                    { id: "rcitm_SoundsSndChatTypeFile", head: 9, view: "text", label: mcLang({id:1699, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1699":"Файл звука набора сообщения",
                                    { id: "rcitm_SoundsSndChatBSFile", head: 9, view: "text", label: mcLang({id:1700, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1700":"Файл звука нажатия BS либо Del при наборе сообщения",
                                    { id: "rcitm_SoundsSndChatRetFile", head: 9, view: "text", label: mcLang({id:1704, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1704":"Файл звука нажатия \"Enter\" при отправке сообщеия в чат",
                                    { id: "rcitm_SoundsSndNewMsgFile", head: 9, view: "text", label: mcLang({id:1695, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1695":"Файл звука нового сообщения на доске объявлений",
                                    { id: "rcitm_SoundsSndPrivateFile", head: 9, view: "text", label: mcLang({id:1703, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1703":"Файл звука входящего приатного сообщения",
                                    { id: "rcitm_SoundsSndBadWordFile", hidden: true, head: 9, view: "text", label: mcLang({id:1696, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1696":"Файл звука \"плохих слов\" фильтра нецензурных выражений",
                                    { id: "rcitm_SoundsSndBroadcastFile", head: 9, view: "text", label: mcLang({id:1707, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1707":"Файл звука входящего оповещения",
                                    { id: "rcitm_SoundsSndScreenShotFile", head: 9, view: "text", label: mcLang({id:1708, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1708":"Файл звука снятия скриншота",
                                    { id: "rcitm_SoundsSndFilesExchangeRequestFile", head: 9, view: "text", label: mcLang({id:1709, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1709":"Файл звука запроса на передачу файлов",
                                    { id: "rcitm_SoundsSndFilesExchangeDoneFile", head: 9, view: "text", label: mcLang({id:1710, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1710":"Файл звука окончания передачи файлов",
                                    { id: "rcitm_SoundsSndMediaBusyFile", head: 9, view: "text", label: mcLang({id:1711, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1711":"Файл звука \"занято\" для медиа звонка",
                                    { id: "rcitm_SoundsSndMediaCallFile", head: 9, view: "text", label: mcLang({id:1712, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1712":"Файл звука исходящего медиа звонка",
                                    { id: "rcitm_SoundsSndMediaCallRejectFile", head: 9, view: "text", label: mcLang({id:1713, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1713":"Файл звука отмены входящего медиа звонка",
                                    { id: "rcitm_SoundsSndMediaEndCallFile", head: 9, view: "text", label: mcLang({id:1714, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}, //"1714":"Файл звука окончания медиа звонка",
                                    { id: "rcitm_SoundsSndMediaIncomingCallFile", head: 9, view: "text", label: mcLang({id:1715, from: "admin"}), labelPosition: "top", value: "", css: "finger", on: { onChange: $scope.universalChanger}}  //"1715":"Файл звука входящего медиа звонка",
                                ]}}
                            ]}
                        ]},
                        { gravity: 0}
                    ]}
                ]}
            ]},

            // == "29" : "Сообщения", ==
            { rows: [
                { template: headerList['10'], head: 10, id: "rmctrlHeader10",  css: "dialogsHeader font115 byCenter white lHeight28", height: 26},

                { padding: 7, rows: [
                    { id: "rcitm_SysEventsShowImagesInChat", head: 10, view: "checkbox",  labelRight: mcLang({id:1425, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1425":"Показывать изображения в тексте чата",

                    { id: "rcitm_SysEventsImagesThumbsSize", head: 10, view: "select",  label: mcLang({id:1822, from: "admin"}), labelWidth: 300, width: 500, value: "0", options: [ // "1822":"Размер миниатюр изображений в чате",
                        { id: "0", value: mcLang({id:1823, from: "admin"})}, // "1823":"маленькое (120х120)",
                        { id: "1", value: mcLang({id:1824, from: "admin"})}, // "1824":"обычное (150х150)",
                        { id: "2", value: mcLang({id:1825, from: "admin"})}  // "1825":"большое (200х200)",
                    ], on: { onChange: $scope.universalChanger}},

                    { id: "rcitm_SysEventsDisableEmotions", head: 10, view: "checkbox",  labelRight: mcLang({id:1427, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}} // "1427":"Использовать графические смайлики",
                ]}
            ]},

            // == "1445":"Автоматическая загрузка истории сообщений в окно", ==
            { rows: [
                { template: headerList['13'], head: 13, id: "rmctrlHeader13",  css: "dialogsHeader font115 byCenter white lHeight28", height: 26},

                { padding: 7, rows: [

                    { id: "rcitm_57", head: 13,  rows: [
                    { cols: [
                        { id: "rcitm_SysEventsLoadHistoryType", head: 13, view: "radio", value: "0", vertical: true, width: 300, label: mcLang({id:1449, from: "admin"}), labelPosition: "top", css: "finger paraPadding20", height: 70, options:[ // "1449":"Варианты загрузки истории сообщений",
                            { id: "0", value: mcLang({id:1446, from: "admin"})}, // "1446":"Не загружать историю сообщений",
                            { id: "1", value: mcLang({id:1447, from: "admin"})} // "1447":"Загружать последние N сообщений",

                        ], on: { onChange: $scope.universalChanger}},
                        { rows: [
                            { height: 42 },
                            { cols: [
                                { id: "rcitm_SysEventsHistory_1_Num", head: 13, view: "counter", value: 10, step: 1, min: 1, max: 999, width: 100, on: { onChange: $scope.universalChanger, onKeyPress: $scope.checkNumbers}},
                                { template: mcLang({ id: 1450, from: "admin" }), borderless: true, css: "lHeight38"} // "1450":"сообщений",
                            ]}
                        ]}
                    ]},
                    { cols: [
                        { width: 30},
                        { id: "rcitm_LoadHistoryToConf", head: 12, view: "checkbox", labelRight: mcLang({id:1880, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}} // "1880":"Загружать историю в конференции",
                    ]},
                    { cols: [
                        { width: 30},
                        { id: "rcitm_LoadHistoryToPrivate", head: 12, view: "checkbox", labelRight: mcLang({id:1881, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}} // "1881":"Загружать историю в приваты",
                    ]}
                ]}
                ]}
            ]},

            // == "838":"Файлы", ==
            { rows: [
                { template: headerList['15'], head: 15, id: "rmctrlHeader15",  css: "dialogsHeader font115 byCenter white lHeight28", height: 26},

                { padding: 7, rows: [
                    { id: "rcitm_63", head: 15,  cols: [
                        { id: "rcitm_SendFilesRandomPorts", head: 15, view: "radio", value: "1", vertical: true, width: 225, label: mcLang({id:1454, from: "admin"}), labelPosition: "top", css: "finger paraPadding20", height: 70, options:[ // "1454":"Порты для передачи файлов",
                            { id: "0", value: mcLang({id:1455, from: "admin"})}, // "1455":"Фиксированные",
                            { id: "1", value: mcLang({id:1456, from: "admin"})}  // "1456":"Случайные, из диапазона",
                        ], on: { onChange: $scope.universalChanger}},

                        { rows: [
                            { height: 7},
                            { cols: [
                                { id: "rcitm_SendFilesBasePort", head: 15, view: "counter", value: 10, step: 1, min: 1, max: 65000, width: 130, labelWidth: 30, label: "&nbsp;", on: { onChange: $scope.universalChanger, onKeyPress: $scope.checkNumbers}},
                                { id: "rcitm_SendFilesDataPort", head: 15, view: "counter", value: 10, step: 1, min: 1, max: 65000, width: 130, labelWidth: 30, label: "&nbsp;", on: { onChange: $scope.universalChanger, onKeyPress: $scope.checkNumbers}}
                            ]},
                            { cols: [
                                { id: "rcitm_SendFilesRandomPortStart", head: 15, view: "counter", value: 10, label: mcLang({id:1339, from: "admin"}), labelWidth: 30, step: 1, min: 1, max: 65000, width: 130, on: { onChange: $scope.universalChanger, onKeyPress: $scope.checkNumbers}}, // "1339":"от",
                                { id: "rcitm_SendFilesRandomPortEnd", head: 15, view: "counter", value: 10, label: mcLang({id:634, from: "admin"}),  labelWidth: 30, step: 1, min: 1, max: 65000, width: 130, on: { onChange: $scope.universalChanger, onKeyPress: $scope.checkNumbers} } // "634": "до",
                            ]}
                        ]}
                    ]},

                    { maxWidth: blockWidth, rows: [
                        { id: "rcitm_SendFilesInputFilesDir", head: 15,  view: "text", value: "", keyPressTimeout: 500, label: mcLang({id:1457, from: "admin"}), labelPosition: "top",
                            on: { onTimedKeyPress: $scope.universalChanger }} // "1457":"Сохранять файлы, которые присылают пользователи, в:",
                    ]}
                ]}
            ]},

            // == "1464":"Обновления", ==
            { hidden: true, rows: [
                { template: headerList['17'], head: 17, id: "rmctrlHeader17",  css: "dialogsHeader font115 byCenter white lHeight28", height: 26},

                { padding: 7, rows: [
                    { id: "rcitm_GeneralDailyUpdatesCheck", head: 17, view: "checkbox",  labelRight: mcLang({id:1465, from: "admin"}), labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}}, // "1465":"Еженедельно проверять наличие новой верии MyChat",
                ]}
            ]},

            // == "1851":"Звонки", ==
            { rows: [
                { template: headerList['19'], head: 19, id: "rmctrlHeader19",  css: "dialogsHeader font115 byCenter white lHeight28", height: 26},

                { padding: 7, rows: [
                    { id: "rcitm_Transport", head: 19,   cols: [
                        { template: mcLang({id:1852, from: "admin"}), borderless: true, autoheight: true, width: 200}, // "1852":"Сетевой транспорт",
                        { id: "rcitm_MediaNetworkTransportTCP", head: 19, view: "checkbox", width: 60, labelRight: "TCP", labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}},
                        { id: "rcitm_MediaNetworkTransportUDP", head: 19, view: "checkbox", width: 60, labelRight: "UDP", labelWidth: 0, value: "", css: "finger", on: { onChange: $scope.universalChanger}},
                        {}
                    ]},

                    { id: "rcitm_IceTransportPolicy", head: 19, view: "select",  label: mcLang({id:1856, from: "admin"}), labelWidth: 200, width: 500, value: "classic", options: [ //  "1856":"Метод связи",
                        { id: "relay", value: mcLang({id:1854, from: "admin"})}, // "1854":"Через сервер",
                        { id: "all",   value: mcLang({id:1855, from: "admin"})}  // "1855":"Напрямую и через сервер",
                    ], on: { onChange: $scope.universalChanger}}
                ]}
            ]},

            // == "574":"Дополнительно", ==
            { rows: [
                { template: headerList['18'], head: 18, id: "rmctrlHeader18",  css: "dialogsHeader font115 byCenter white lHeight28", height: 26},

                { padding: 7, rows: [
                    { id: "rcitm_AdditionalPrivateInfoFields", head: 18, view: "text",  label: mcLang({id:1470, from: "admin"}), labelPosition: "top", value: "", on: { onTimedKeyPress: $scope.universalChanger}}, // "1470":"Список информационных полей, которые показываются в приватном чате",
                    { id: "rcitm_AdditionalProgramCaption", head: 18, view: "text",  label: mcLang({id:1471, from: "admin"}), labelPosition: "top", value: "", on: { onTimedKeyPress: $scope.universalChanger}}, // "1471":"Заголовок программы",
                    { id: "rcitm_AdditionalSystemTrayText", head: 18, view: "text",  label: mcLang({id:1472, from: "admin"}), labelPosition: "top", value: "", on: { onTimedKeyPress: $scope.universalChanger}}  // "1472":"Хинт в системном лотке (трее)",
                ]}
            ]}
        ];

        $$($scope.container).addView({
            id   : $scope.Name,
            rows : [
                { view: "template", template: mcLang(15), autoheight: true, borderless: true, height: 34, css: "byCenter header"},

                { view: "scrollview", borderless: true, scroll: false, css: "scrollMenu myScroll", body: { padding: 0, css: "font14l", rows: [].concat(__items)}}
            ]
        });

        view = $$($scope.Name);

    } else {
        view.show();
    }

    return view;
}
