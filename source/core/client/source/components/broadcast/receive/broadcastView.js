"use strict";

function initBroadcastView($scope, broadcasts){
    var view = $$($scope.Name);

    function numberList(length) {
        return (new Array(length || 1)).join('.').split('.').map(function (itm, idx) { return idx.toString() })
    }

    // Avatar      : 0,
    // DisplayName : "Andrey Rakov",
    // ID          : 428,
    // Sex         : 1,
    // State       : 0,
    // dtCreatedUTC: "22.06.2018.11.06.53",
    // files_list  : [],
    // msg         : "sdfsdf",
    // msg_type    : 0,
    // read_notify : true,
    // uinOwner    : 3

    if (!view){
        view = webix.ui({
            id      : $scope.Name,
            view    : "window",
            position: "center",
            modal   : true,
            width   : document.body.offsetWidth  - 40,
            height  : document.body.offsetHeight - 40,
            head    : false,
            body    : { padding: 5, rows: [
                { id: "brTitle", template: "&nbsp;", height: 38, css: "byCenter lHeight36"},

                { id: "brCntWrapper", cols: [
                    { id: "brUserList", view: "list", width: 200, select: true, minWidth: 200, maxWidth: 500,
                        type:{
                            height: 50
                        },
                        template: function (obj) {
                            return  mcService.myReplaceFormated(
                                "<div class='lHeight26'>" +
                                    "<div class='firstLineList'>#{name}</div>" +
                                    "<div>#{date}#{onlySee}#{confirm}#{reply}</div>" +
                                "</div>",
                                {
                                    name   : obj.DisplayName,
                                    date   : mcService.formatDate(mcService.utcTime(obj.dtCreatedUTC), "hh:nn dd.mm.yyyy"),
                                    onlySee: obj.msg_type === $scope.msgType.regular    ? " " + mcService.insertIco("fa-eye", " ") : "",
                                    confirm: obj.msg_type === $scope.msgType.needRead   ? " " + mcService.insertIco("fa-check-square-o", " ") : "",
                                    reply  : obj.msg_type === $scope.msgType.needAnswer ? " " + mcService.insertIco("fa-comments-o", " ") : ""
                                });
                        },
                        on: {
                            onAfterSelect : $scope.selectBroadcast,
                            onBeforeSelect: $scope.backupAnswer
                        }
                    },

                    { view: "resizer"},

                    { rows: [
                        { cols: [
                            { rows: [
                                $scope.dwlMngr.progressWrapper,

                                { id: "brMsgContent", template: "&nbsp;", css: "framePaddingAll10"},

                                { id: "brAnswerResizer", view: "resizer", hidden: true},
                                { id: "brAnswer", view: "textarea", css: "noBGColorAll", hidden: true, height: 60, placeholder: mcLang(621)}, // "621":"Введите здесь ответ на оповещение",

                                { rows: [
                                    { id: "brImReadMsgWrap", cols: [
                                        { id: "brImReadMsg", view: "checkbox", value: false, labelWidth: 0, labelRight: mcLang(607),  css: "finger", // "607":"Я прочитал сообщение",
                                            on: {onChange: $scope.readMsg}
                                        },
                                        {},
                                        { id: "brCloseWnd", view: "button", width: 150, value: mcLang(12), click: $scope.closeBroadcast} // "12" :"Закрыть",
                                    ]},

                                    { height: 20 }
                                ]}
                            ]},

                            { id: "brFilesResizer", view: "resizer"},

                            { id: "brFileListWrap", hidden: true, rows: [
                                { height: 3},
                                    
                                { id: "brFilesCount", template: mcLang(622), css: "byCenter", autoheight: true, borderless: true}, // "622":"Файлы",

                                { height: 3},

                                { id: "brFileList", view: "list", width: 200, select: false, minWidth: 200, maxWidth: 500, css: "lHeight17All font80 filesList",
                                    type:{
                                        height: "auto"
                                    },
                                    template: function (obj) {
                                        return mcService.myReplaceFormated(
                                            "<span class='bolder'>#{fName}</span><br><span class='gray'>#{sizeTitle}: #{size}</span>",
                                            {
                                                fName    : obj.OriginalFileName,
                                                size     : mcService.formatFileSize(obj.Size),
                                                sizeTitle: mcLang(590) // "590":"размер",
                                            }
                                        );
                                    },
                                    on: {
                                        onItemClick: $scope.downloadFile
                                    }
                                }
                            ]}
                        ]}
                    ]}
                ]}
            ]}
        });

        $scope.initDU();
    }

    broadcasts.forEach(function (itm) {
        itm.id = itm.ID;
    });

    $scope.brUserList      = $$("brUserList");
    $scope.brTitle         = $$("brTitle");
    $scope.brMsgContent    = $$("brMsgContent");
    $scope.brImReadMsgWrap = $$("brImReadMsgWrap");
    $scope.brImReadMsg     = $$("brImReadMsg");
    $scope.brCntWrapper    = $$("brCntWrapper");
    $scope.answerResizer   = $$("brAnswerResizer");
    $scope.answer          = $$("brAnswer");
    $scope.brFileListWrap  = $$("brFileListWrap");
    $scope.brFilesResizer  = $$("brFilesResizer");
    $scope.brFileList      = $$("brFileList");
    $scope.brFilesCount    = $$("brFilesCount");

    $scope.brUserList.parse(broadcasts);
    $scope.brUserList.select($scope.brUserList.getFirstId());

    view.show();

    return view;
}