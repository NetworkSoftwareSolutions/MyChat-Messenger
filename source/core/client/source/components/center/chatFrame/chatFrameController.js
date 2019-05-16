"use strict";

function chatFrameController($scope, $rootScope, mcPlaySound){
    $scope.Name = mcConst.dataModels.ChatFrame;
    
    $scope.displayName        = null;
    $scope.chatTextOutput     = null;
    $scope.enterChatText      = null;
    $scope.clipPopupButton    = null;
    $scope.clipPopupLoaderImg = null;
    $scope.videoFrameWrapper  = null;

    // ----------------------------------

    var pressNotifyCount  = 0;
    var prevFrame         = 'UIN-0';
    var currentFrame      = null;
    var view              = null;
    var titleValue        = [];
    var prevHeight        = 0;
    var inputSize         = 57;
    var scrollDownTimer   = null;
    var myMessages        = {
        UIN        : -1,
        IDMyMsgGot : 0,
        IDMyMsgRead: 0
    };
    var noScrollDownOnSync= false;
    var msgTemplateList   = {};

    // ----------------------------------

    var downloadUploadManager = null;
    var framesList            = new McFramesList();

    // ----------------------------------
    
    var userMenu = function() {
        return [{
            view: "button",
            value: mcService.Lang(41), // "41" : "Добавить в игнор",
            click: function(){
                this.getTopParentView().hide();

                webix.confirm({
                    title : mcService.Lang(42), // "42" : "Игнорировать приватные сообщения от:",
                    ok    : mcService.Lang(43), // "43" : "Да",
                    cancel: mcService.Lang(44), // "44" : "Нет",
                    type  :"confirm-error",
                    text  : titleValue[0],
                    width : 310,
                    callback:function(result){ //setting callback
                        if (result){
                            var uin = $rootScope.GetChatID();

                            $rootScope.$broadcast('SendCMDToServer', [
                                mcConst._CMD_.cs_set_custom_ignore,
                                mcConst.SessionID,
                                uin, // current UIN
                                mcConst.ignores.private
                            ]);

                            $rootScope.$broadcast('getIgnoreList', []);
                            $rootScope.$broadcast('addIgnoreInPrivateInfo', [uin]);
                        }
                    }
                });
            }
        }, {
            view: "button",
            value: mcService.Lang(51), // "51" : "Удалить из игноров",
            click: function(){
                var uin = $rootScope.GetChatID();

                this.getTopParentView().hide();

                $rootScope.$broadcast('SendCMDToServer', [
                    mcConst._CMD_.cs_del_custom_ignore,
                    mcConst.SessionID,
                    uin,
                    mcConst.ignores.private
                ]);

                $rootScope.$broadcast('getIgnoreList', []);
                $rootScope.$broadcast('removeIgnoreInPrivateInfo', [uin]);

                webix.message(mcService.Lang(52, titleValue[0])); //"52" : "С пользователя %s снят игнор!",
            }
        }];
    };
    var confMenu = function() {
        return [{
            view : "button",
            value: mcService.Lang(28), // "28" : "Выйти из конференции",
            click: function(){
                this.getTopParentView().hide();

                $rootScope.$broadcast('leaveConf', [getCurrentID()]);
            }
        }];
    };

    // =====================================

    window._userActions.deleteMessage = function(){
        var idx = this.getAttribute('Idx');
        var uinUID = getCurrentID();
        var elm   = "";
        var param = "";

        if (uinUID && getCurrentType() === $rootScope.chatAliases.UID){
            elm   = this.parentElement.getElementsByClassName("messageText")[0];
            param = mcService.copy(elm.innerText, 0, 20) + (elm.innerText.length > 20 ? "..." : "");

            if (!param){
                param = "<div style='margin-left: 20px'>" + elm.innerHTML + "</div>";
            }

            webix.confirm({
                type  : "confirm-warning",
                text  : mcLang(587, param),  // "587":"Удалить сообщение",
                ok    : mcService.Lang(519), // "519":"Удалить",
                cancel: mcService.Lang(33),  // "33" :"Отмена",

                callback:function(yes){
                    if (yes){
                        $rootScope.SendCMDToServer([
                            mcConst._CMD_.cs_moder_delete_conf_message,
                            mcConst.SessionID,

                            uinUID,
                            idx
                        ]);
                    }
                }
            });
        } else
        if (uinUID && getCurrentType() === $rootScope.chatAliases.UIN) {
            elm   = this.parentElement.getElementsByClassName("messageText")[0];
            param = mcService.copy(elm.innerText, 0, 20) + (elm.innerText.length > 20 ? "..." : "");

            if (!param){
                param = "<div style='margin-left: 20px'>" + elm.innerHTML + "</div>";
            }

            webix.confirm({
                type  : "confirm-warning",
                text  : mcLang(587, param),  // "587":"Удалить сообщение",
                ok    : mcService.Lang(519), // "519": "Удалить",
                cancel: mcService.Lang(33),  // "33": "Отмена",

                callback:function(yes){
                    if (yes){
                        $rootScope.SendCMDToServer([
                            mcConst._CMD_.cs_delete_private_message,
                            mcConst.SessionID,

                            uinUID,
                            idx
                        ]);
                    }
                }
            });
        }
    };

    window._userActions.downloadFile = function(){
        var link = this.parentElement.childNodes[1];
        var url  = link.href;
        var fileInfo = {
            uin        : link.getAttribute("uin"),
            displayName: link.getAttribute("nick"),
            filePath   : link.getAttribute("filepath"),
            fileDT     : link.getAttribute("filedt"),
            hash       : link.getAttribute("hash")
        };

        if ($rootScope.isWebClient){
            window.open(url);
        } else {
            downloadUploadManager.downloadUrl(url, fileInfo);
        }
    };

    window._userActions.openOrDownloadFile = function(e){
        var url = this.href;
        var fileInfo = {
            uin        : this.getAttribute("uin"),
            displayName: this.getAttribute("nick"),
            filePath   : this.getAttribute("filepath"),
            fileDT     : this.getAttribute("filedt"),
            hash       : this.getAttribute("hash")
        };
        
        if ($rootScope.isWebClient){
            // window.open(url);
        } else {
            e.preventDefault();

            downloadUploadManager.openDownloadUrl(url, fileInfo);
        }

        return false;
    };

    window._userActions.openInFolder = function(){
        var hash = this.parentElement.childNodes[1].getAttribute('hash');
        var uin  = this.parentElement.childNodes[1].getAttribute('uin');

        downloadUploadManager.openInFolder(hash, uin);
    };

    window._userActions.openFolder = function(){
        var path = this.getAttribute('filepath');

        downloadUploadManager.openFolder(path);
    };

    window._userActions.replyToUser = function(){
        var uin = this.getAttribute('uin');

        if (uin != mcConst.UserInfo.UIN){
            var txt = this.innerHTML;

            $scope.enterChatText.setValue($scope.enterChatText.getValue() + " @" + mcService.copy(txt, 0, txt.indexOf('<span')).replace(/\:$/, '') + " ");

            focusToEnterChat();
        }
    };

    window._userActions.userMenu = function(){
        var uin = this.getAttribute('uin');

        if (uin != mcConst.UserInfo.UIN){

            focusToEnterChat();
        }
    };

    window._userActions.hideStatus = function () {
        mcService.hideView(this.querySelector(".statusItem"));
    };

    window._userActions.showStatus = function () {
        mcService.showView(this.querySelector(".statusItem"));
    };

    // =====================================

    function showNotify(notI, text, nick, isConf, id){
        text = text || "";
        
        var textForNotify = text.slice(0, 100) + ((text.length > 100) ? '...' : "" );
        var itemID = (isConf ? 'UID-' : 'UIN-') + id;

        if (notI){
            if (($rootScope.isWebClient || mcConst.ClientSettings.SoundsSndChat) && isConf){
                mcPlaySound.PlaySound(mcPlaySound.Sounds.ConfMsg, true);
            } else
            if (($rootScope.isWebClient || mcConst.ClientSettings.SoundsSndPrivate) && !isConf){
                mcPlaySound.PlaySound(mcPlaySound.Sounds.Private, true);
            }

            if ($rootScope.isWebClient){
                if ($rootScope.GetChatTypeID() !== itemID){
                    mcService.CreateNotification({
                        title : nick.slice(0, 30) + ((nick.length > 30) ? '..' : "" ) + ":",
                        body  : textForNotify,
                        timeOut : 5000,
                        click : function onClickOnNotify(){
                            if (isConf){
                                $rootScope.$broadcast('OpenConf', [id]);
                            } else {
                                $rootScope.$broadcast('OpenPrivate', [id]);
                            }
                        }
                    });
                }
            } else

            if ((isConf && ($rootScope.isWebClient || mcConst.ClientSettings.EventsTrayChMsg)) || (!isConf && ($rootScope.isWebClient || mcConst.ClientSettings.EventsTrayPvMsg))){
                $rootScope.$broadcast('sendCMDToElectron', [
                    mcConst._CMD_.ce_show_notify,

                    nick.slice(0, 30) + ((nick.length > 30) ? '..' : "" ) + ":",
                    textForNotify,
                    itemID
                ]);
            }
        }
    }

    function parseLink(source) {
        return source ? mcService.ReplaceURLs(source, { callback: function(text, link){
                var res = "";

                if (/png|jpg|jpeg$/.test(link)){
                    res = '<br/><img class="thumbImage" src="' + link + '">';
                }

                return link ? '<a href="' + link + '" title="' + link + '" target="_blank">' + (res || text) + '</a>' : text;
            }}) : ""
    }

    function getCurrentID() {
        return (currentFrame.id || currentFrame).split('-')[1];
    }

    function getCurrentType() {
        return (currentFrame.id || currentFrame).split('-')[0];
    }

    // ======= DRAW MESSAGES =======================

    function removeMSG(msg) {
        setTimeout(function () {
            var Idx    = msg.Msg;
            var isConf = !!msg.UID;

            var message = document.getElementById(isConf ? "conf-" + msg.UID + "-" + Idx : "priv-" + Idx);

            if (message){
                message.innerHTML = "";
            }
        }, 100);
    }

    function addMSG (msg, frame){
        var target= framesList.get(frame);
        var div   = document.createElement('div');
        var text  = !msg.MsgType ? msg.Msg.split(mcConst.newLine) : msg.Msg.split(mcConst.CRLF);
        var notI  = (msg.UINFrom || msg.UIN) != mcConst.UserInfo.UIN;
        var uin   = msg.UINFrom || msg.UIN;
        var nick  = msg.Nick;
        var time  = (msg.dt) ? msg.dt.split('.') : "";
        var date  = '';
        var info  = msg.Msg.split(mcConst.CRLF);
        var hash  = info[0];
        var isConf= msg.UID !== undefined;
        var notifyText;
        var prevItem = msg.History ? target.firstChild : target.lastChild;
        var same     = prevItem ? prevItem.getAttribute('uin') == uin : false;
        var userName = "";
        var hasAlign = false;
        var loadThmb = false;

        if (time === '') {
            time = mcService.formatDate(new Date(), 'hh:nn:ss');
            date = mcService.formatDate(new Date(), 'dd.mm.yyyy');
        } else {
            date = (time.length >= 6) ? time[0] + "." + time[1] + "." + time[2] : time; // dt[0] + "." + dt[1] + "." + dt[2] + "&nbsp;" +
            time = (time.length >= 6) ? time[3] + ":" + time[4] + ":" + time[5] : time; // dt[0] + "." + dt[1] + "." + dt[2] + "&nbsp;" +
        }

        div.setAttribute('uin', uin);
        div.setAttribute('Idx', msg.Idx);
        div.setAttribute('postDate', date);
        div.setAttribute('id', isConf ? "conf-" + msg.UID + "-" + msg.Idx : "priv-" + msg.Idx);

        div.style.wordBreak = "break-word";
        div.className       = notI ? "messageUser " : 'messageMy ';
        div.className      += " _messagesFontSize";

        if (!same || msg.History || (!msg.History && target.lastChild && target.lastChild.getAttribute('postDate') !== date)){
            userName = mcService.myReplaceFormated(
                '<div id="__#{id}" class="grayBorderTop">' +
                    '<div class="messageUserName" uin="#{uin}" onclick="_userActions.replyToUser.apply(this)" oncontextmenu="window._userActions.userMenu.apply(this)">' +
                        '#{nick}<span class="messageTime messageTimeHistory">#{date}</span>' +
                    '</div>' +
                '</div>',
                {
                    uin  : uin,
                    id   : msg.Idx,
                    nick : nick,
                    date : ($rootScope.isWebClient || mcConst.ClientSettings.EventsTimeStamp) ? date : ""
                }
            );
        }

        switch (msg.MsgType){
            case mcConst._CMD_.msgType.OLD_SHIT:
            case mcConst._CMD_.msgType.INTEGRATION_API:
            case mcConst._CMD_.msgType.TEXT:
                for (var i = 0; i < text.length; i++){
                    text[i] = text[i].replace(/</ig, "&lt;");
                }

                text.forEach(function (txt, line) {
                    if (!msg.MsgType) {
                        if (txt.indexOf(mcConst.mcPara) === 0){
                            text[line] = txt.replace(mcConst.mcPara, "");
                        } else
                        if (txt.indexOf(mcConst.mcParaCenter) === 0){
                            hasAlign = true;
                            text[line] = "<div class='byCenter messageTextP60'>" + txt.replace(mcConst.mcParaCenter, "") + "</div>";
                        } else
                        if (txt.indexOf(mcConst.mcParaRight) === 0){
                            hasAlign = true;
                            text[line] = "<div class='byRight messageTextP60'>" + txt.replace(mcConst.mcParaRight, "") + "</div>";
                        }
                    }
                });

                text = text.join('<br/>');
                
                text = mcService.replaceMcComponents(text, $rootScope.isWebClient);

                text = mcService.ReplaceURLs(text, { callback: function(text, link){
                    var res = "";

                    if (link && link.indexOf(mcConst.myChatLinkTitle) > 0){ // parse special mychat link
                        link = link.split(mcConst.myChatLinkTitle);

                        res  = link[1];
                        link = link[0];
                    } else

                    // if (link && link.indexOf("local://") === 0) {
                    //     link = link.replace("local://", "");
                    // } else

                    if (/(\.png|\.jpg|\.jpeg)$/.test(link) && link.indexOf(mcService.getLocalHostPath($rootScope.isWebClient)) === 0){
                        res = '<br/><img class="thumbImage" src="' + link + '">';
                    }

                    return link ? '<a href="' + link + '" title="' + link + '" target="_blank">' + (res || text) + '</a>' : text;
                }});

                notifyText = text;
            break;

            case mcConst._CMD_.msgType.IMAGE:
                text = mcService.myReplaceFormated(
                    '<a id="link_#{idx}" href="noimage" target="_blank"><img id="img_#{idx}" src="#{loadImage}" dt="#{dt}" alt=""></a>',
                    {
                        idx      : info[0] + msg.Idx,
                        loadImage: mcConst.imagesPath.loadImage,
                        dt       : info[2]
                    }
                );

                downloadUploadManager.addImageToLoad(hash, msg.Idx);

                loadThmb = true;

                notifyText = mcLang(570); // "570":"Опубликовано изображение",
            break;

            case mcConst._CMD_.msgType.FILE:
                var filePath = info[1];
                var fileDT   = info[2];
                var fileSize = info[3];
                var fileName = mcService.extractFileName(filePath);

                text =  mcService.myReplaceFormated(
                    // icon
                    '<i class="fa fa-file-o" aria-hidden="true"></i>' +

                    // file name
                    '<a id="link_#{hash}#{id}" ' +
                        'hash="#{hash}" ' +
                        'filepath="#{filepath}" ' +
                        'filedt="#{filedt}" ' +
                        'filesize="#{filesize}" ' +
                        'href="#{href}" ' +
                        'nick="#{nick}" ' +
                        'uin="#{uin}" ' +
                        'target="_blank" ' +
                        'onclick="window._userActions.openOrDownloadFile.apply(this, arguments)" ' +
                        'class="font120 fileLink"' +
                    '>#{file}</a>&nbsp;&nbsp;' +

                    // download icon
                    '<i class="fa fa-download finger" aria-hidden="true" title="#{dTitle}" onclick="window._userActions.downloadFile.apply(this)"></i>&nbsp;' +

                    // open folder icon
                    ($rootScope.isWebClient ? '' : '<i class="fa fa-folder-open-o finger" onclick="window._userActions.openInFolder.apply(this, arguments)" title="#{oTitle}" aria-hidden="true"></i>&nbsp;') +
                    
                    // file size
                    '(#{formatedSize})</span>',
                    {
                        id      : msg.Idx,
                        nick    : nick,
                        uin     : uin,
                        hash    : hash,
                        href    : mcService.getLocalHostPath($rootScope.isWebClient) + "/" + mcConst.pathAliases.AliasFiles + "/" + hash + "/" + encodeURI(fileName),
                        file    : fileName,
                        time    : time,
                        filepath: filePath,
                        filedt  : fileDT,
                        filesize: fileSize,
                        dTitle  : mcLang(573), // "573":"Скачать",
                        oTitle  : mcLang(574), // "574":"Показать в папке",
                        formatedSize: mcService.formatFileSize(fileSize)
                    }
                );

                notifyText = mcLang(571, fileName); // "571":"Файл: %s",
            break;
        }

        div.innerHTML = mcService.myReplaceFormated(
            "#{userName}" +
            "<div id='hsMsg-#{Idx}' Idx='#{Idx}' class='showOnHover' uin='#{uin}' postDate='#{postDate}' onmouseover='window._userActions.hideStatus.apply(this)' onmouseout='window._userActions.showStatus.apply(this)' style='#{style}'>" +
                "<span id='#{Idx}-st-#{uin}' class='#{state} statusItem'></span>" +
                ((mcService.checkRights(mcConst._CMD_.RS.QAdmAccessToRemoveConfMessages) && isConf) || (!isConf && mcService.checkRights(mcConst._CMD_.RS.QAllowRemovePrivateMessages))
                    ? "<span class='webix_icon fa-trash-o fAwesome needShow messageTrash #{noTime}' Idx='#{Idx}' onclick='window._userActions.deleteMessage.apply(this)' title='#{delHint}'></span>"
                    : ""
                ) +
                "<span class='messageTime'> #{time} </span>" +
                "<span class='messageText #{w100}'>#{text}</span>" +
            "</div>",
            {
                userName : userName,
                w100     : hasAlign ? "width100" : "messageTextP60",
                uin      : uin,
                Idx      : msg.Idx,
                postDate : date,
                style    : "wordBreak: break-word",
                text     : text,
                time     : $rootScope.isWebClient || mcConst.ClientSettings.EventsTimeStamp ? time : "",
                delHint  : mcLang(519), // "519":"Удалить",
                noTime   : $rootScope.isWebClient || mcConst.ClientSettings.EventsTimeStamp ? "" : "messageTrashNoTime",
                state    : msg.UID ? "" : (notI ? "" : (myMessages.IDMyMsgRead >= msg.Idx ? "messageRead" : (myMessages.IDMyMsgGot >= msg.Idx ? "messageGot" : "messageSend" )))
            }
        );

        if (msg.History && !msg.UpSync){ // !msg.isOffline &&
            if (!same) {
                target.insertBefore(document.createElement('br'), target.firstChild);
            } else 
            if (target.firstChild && target.firstChild.getAttribute('postDate') === date ){
                target.firstChild.removeChild(target.firstChild.firstChild);
            } else {
                target.insertBefore(document.createElement('br'), target.firstChild);
            }

            target.insertBefore(div, target.firstChild);
        } else {
            if (!same) {
                target.appendChild(document.createElement('br'));
            }

            target.appendChild(div);

            if (!msg.noNotify) {
                showNotify(notI, notifyText, nick, isConf, isConf ? msg.UID : uin);
            }
        }

        if (loadThmb) {
            // setTimeout(function () {
                downloadUploadManager.loadThumbs([info[0], info[1], msg.Idx], function (){
                    scrollDown(false, !msg.History, msg.History && noScrollDownOnSync);
                });
            // }, 10);
        }
    }

    function addCustomMSG (msg, frame, noTimeStamp){
        if (mcService.isObject(msg)){
            msg.Text = msg.Text || msg.Msg;
        }

        var target = framesList.get(frame);
        var div    = document.createElement('div');
        var text   = msg.Text !== undefined ? msg.Text.split('L$') : msg.split('L$'); //msg.Msg.split('L$');
        var uin    = msg.UIN !== undefined ? msg.UIN : (msg.UINFrom !== undefined ? msg.UINFrom : $rootScope.GetChatID()); //msg.UINFrom || msg.UIN;
        var time   = mcService.formatDate(msg.dt || (new Date()), 'hh:nn:ss');
        var notI   = uin != mcConst.UserInfo.UIN;

        if (mcService.trim(text[0]) === "") text.shift();

        for (var i = 0; i < text.length; i++){
            text[i] = text[i].replace(/</ig, "&lt;");
            text[i] = text[i].replace(/\u000b/ig, "");
        }

        text = mcService.ReplaceURLs(text.join('<br/>'), { callback: function(text, link){
            var res = "";

            if (/png|jpg|jpeg$/.test(link)){
                res = '<br/><img class="thumbImage" src="' + link + '">';
            }

            return link ? '<a href="' + link + '" title="' + link + '" target="_blank">' + (res || text) + '</a>' : text;
        }});

        if (text.indexOf(mcConst.CRLF) >= 0) {
            text = text.replace(new RegExp(mcConst.CRLF, 'g'), "<br/>");
        }

        div.className = (msg.Type ? "" : "brown ") + "framePaddingW5";
        div.style.wordBreak = "break-word";

        switch (msg.MsgType){
            case mcConst._CMD_.msgType.CONF_TURN_OUT:
                
            break;
        }

        div.innerHTML += '<br><div class="borderTop relative _messagesFontSize">' +
                            (($rootScope.isWebClient || mcConst.ClientSettings.EventsTimeStamp) && !noTimeStamp ? '<span class="messageTime">' + time + '</span> ' : "") +
                            '<span class="messageText messageTextP60"><i class="fa fa-bullhorn" aria-hidden="true"></i> ' + text + '</span> ' +
                         '</div>';

        div.setAttribute('uin', uin);

        if (msg.Idx) {
            div.setAttribute('Idx', msg.Idx);
        }

        if (msg.History){
            target.insertBefore(div, target.firstChild);
        } else {
            target.appendChild(div);

            var isConf = msg.UID !== undefined;

            showNotify(notI, text, "", isConf, isConf ? msg.UID : uin);
        }
    }

    function addRedirectMSG (msg, frame, noTimeStamp){
        var target = framesList.get(frame);
        var div    = document.createElement('div');
        var text   = "";
        var uin    = msg.UIN !== undefined ? msg.UIN : (msg.UINFrom !== undefined ? msg.UINFrom : $rootScope.GetChatID()); //msg.UINFrom || msg.UIN;
        var time   = mcService.formatDate(msg.dt || (new Date()), 'hh:nn:ss');
        var notI   = uin != mcConst.UserInfo.UIN;
        var rdData = mcService.StringToObj(msg.Msg);

        if (rdData.UIN == mcConst.UserInfo.UIN){
            text = mcLang(615, [rdData.DisplayNameTo, rdData.DisplayNameFrom]); // "615":"Вы перенаправлены к пользователю <span class='blue'>%s</span>",
        } else
        if (rdData.UINFrom == mcConst.UserInfo.UIN){
            text = mcLang(616, [rdData.DisplayName, rdData.DisplayNameTo]); // "616":"Вы перенаправили пользователя <span class='blue'>%s</span> к <span class='blue'>%s</span>",
        } else
        if (rdData.UINTo == mcConst.UserInfo.UIN){
            text = mcLang(617, [rdData.DisplayName, rdData.DisplayNameFrom]); // "617":"Пользователь <span class='blue'>%s</span> перенаправлен к вам от <span class='blue'>%s</span>",
        }

        div.className = (msg.Type ? "" : "brown ") + "framePaddingW5";
        div.style.wordBreak = "break-word";

        div.innerHTML += '<br><div class="borderTop relative _messagesFontSize">' +
                            (($rootScope.isWebClient || mcConst.ClientSettings.EventsTimeStamp) && !noTimeStamp ? '<span class="messageTime">' + time + '</span> ' : "") +
                            '<span class="messageText messageTextP60"><i class="fa fa-bullhorn" aria-hidden="true"></i> ' + text + '</span> ' +
                         '</div>';

        div.setAttribute('uin', uin);

        if (msg.Idx) {
            div.setAttribute('Idx', msg.Idx);
        }

        if (msg.History){
            target.insertBefore(div, target.firstChild);
        } else {
            target.appendChild(div);

            var isConf = msg.UID !== undefined;

            showNotify(notI, text, "", isConf, isConf ? msg.UID : uin);
        }
    }

    function addKanbanMSG (msg, frame){
        var target = framesList.get(frame);
        var div    = document.createElement('div');
        var kMSG   = JSON.parse(msg.Msg);
        var uin    = msg.UIN !== undefined ? msg.UIN : (msg.UINFrom !== undefined ? msg.UINFrom : $rootScope.GetChatID()); //msg.UINFrom || msg.UIN;
        var time   = msg.dt ? mcService.formatDate(msg.dt, 'dd.mm.yyyy hh:nn:ss') : mcService.formatDate(new Date(), 'hh:nn:ss');
        var text   = "";
        var notifyText;

        if (!kMSG.TaskName) {
            return;
        }

        switch (kMSG.What){
            case mcConst.KanbanEvents.TASK_ADDED: case mcConst.KanbanEvents.TASK_PERFORMER_CHANGED:
                text = mcLang(543, [ // "543":"<a href='%s' target='_blank'>Новое задание</a> от %s<br>Задание:<br>%s<br>Описание:<br>%s",
                    mcService.createKanbanLink(kMSG.ProjectID, kMSG.TaskID),
                    kMSG.DisplayName,
                    parseLink(kMSG.TaskName),
                    parseLink(kMSG.Description)
                ]);

                notifyText = "KANBAN Task:<br>" + kMSG.TaskName;
            break;

            case mcConst.KanbanEvents.COMMENT_ADDED:
                text = mcLang(544, [ // "544":"<a href='%s' target='_blank'>Новый комментарий</a> от %s<br>Задание:<br>%s<br>Комментарий:<br>%s",
                    mcService.createKanbanLink(kMSG.ProjectID, kMSG.TaskID, kMSG.CommentID),
                    kMSG.DisplayName,
                    parseLink(kMSG.TaskName),
                    parseLink(kMSG.Comment)
                ]);

                notifyText = "KANBAN Comment:<br>" + kMSG.Comment;
            break;

            case mcConst.KanbanEvents.TASK_MOVED:
                text = mcLang(545, [ // "545":"<a href='%s' target='_blank'>Задание перемещено</a> пользователем %s<br>Задание:<br>%s<br>Откуда и куда:<br>%s",
                    mcService.createKanbanLink(kMSG.ProjectID, kMSG.TaskID),
                    kMSG.DisplayName,
                    parseLink(kMSG.TaskName),
                    kMSG.OldStageName + " &gt; " + kMSG.StageName
                ]);

                notifyText = "KANBAN Task:<br>" + kMSG.TaskName;
            break;

            case mcConst.KanbanEvents.TASK_CHANGED:
                text = mcLang(546, [ // "546":"<a href='%s' target='_blank'>Задание изменено</a> пользователем %s<br>Задание:<br>%s<br>Описание:<br>%s",
                    mcService.createKanbanLink(kMSG.ProjectID, kMSG.TaskID),
                    kMSG.DisplayName,
                    parseLink(kMSG.TaskName),
                    parseLink(kMSG.Description)
                ]);

                notifyText = "KANBAN Task:<br>" + kMSG.TaskName;
            break;

            case mcConst.KanbanEvents.TASK_DELETED:
                text = mcLang(547, [ // "547":"<a href='%s' target='_blank'>Задание удалено</a> пользователем %s<br>Задание:<br>%s<br>Описание:<br>%s<br>Проект:<br>%s",
                    mcService.createKanbanLink(kMSG.ProjectID, kMSG.TaskID),
                    kMSG.DisplayName,
                    parseLink(kMSG.TaskName),
                    parseLink(kMSG.Description),
                    kMSG.ProjectName
                ]);

                notifyText = "KANBAN Task:<br>" + kMSG.TaskName;
            break;

            case mcConst.KanbanEvents.PROJECT_CLOSED:
                text = mcLang(548, [ // "548":"<a href='%s' target='_blank'>Проект закрыт</a> пользователем %s<br>Проект:<br>%s",
                    mcService.createKanbanLink(kMSG.ProjectID, kMSG.TaskID),
                    kMSG.DisplayName,
                    kMSG.ProjectName
                ]);

                notifyText = "KANBAN Project:<br>" + kMSG.ProjectName;
            break;
        }

        div.className = "framePaddingW5";
        div.style.wordBreak = "break-word";

        div.innerHTML += '<div class="borderTop marginTop10 _messagesFontSize"><i class="fa fa-bullhorn" aria-hidden="true"></i>' +
                         '<span class="messageKanbanTime toRight lineHeight24">' + time + '</span> ' +
                         '<span class="messageKanban">' + text + '</span></div><br>';

        div.setAttribute('uin', uin);

        if (msg.Idx) {
            div.setAttribute('Idx', msg.Idx);
        }

        if (msg.History){
            target.insertBefore(div, target.firstChild);
        } else {
            target.appendChild(div);

            showNotify(true, notifyText, kMSG.DisplayName, false, uin);
        }
    }

    function addReceivedFilesMSG(msg, frame) {
        var target = framesList.get(frame);
        var div    = document.createElement('div');
        var uin    = msg.UIN;
        var time   = mcService.formatDate(new Date(), 'hh:nn:ss');
        var text   = "";
        var fileList  = msg.FilesList;
        var fileCount = msg.Count;
        var fileSize  = msg.Size;
        var filePath  = msg.Path;
        var count     = 0;
        var more      = false;
        var topText   = 597;

        switch (msg.MsgType){
            case mcConst._CMD_.msgType.SHOW_RECEIVED_FILES: topText = 597; break; // "597":"Принято %s файлов, общий рамер: %
            case mcConst._CMD_.msgType.SHOW_UPLOADED_FILES: topText = 599; break; // "599":"ОТправлено %s файлов, общий рамер: %s",
        }

        text = mcService.myReplaceFormated(
            "<span class='finger bolder #{addClass}'>#{msg}</span>",
            {
                msg  : mcLang(topText, [fileCount, mcService.formatFileSize(fileSize)]),
                addClass: "fileLink"
            }
        );

        fileList.forEach(function (file) {
            if ((file.received || file.sended) && count < 10){
                text += mcService.myReplaceFormated(
                    "<div><span class='brown'>#{name}</span> (#{size})</div>",
                    {
                        name: file.fileName,
                        size: mcService.formatFileSize(file.size)
                    }
                );
            } else {
                more = true;
            }

            count ++;
        });

        if (count > 10) {
            text += "<div>" + mcLang(598, count - 10) + "</div>"; // "598":"... еще %s файлов",
        }

        div.className = "framePaddingW5";
        div.style.wordBreak = "break-word";

        div.innerHTML += mcService.myReplaceFormated(
            '<br><div class="borderTop _messagesFontSize">' +
                '<span class="messageTime">#{time}</span> ' +
                '<span filepath="#{path}" class="messageText" title="#{oTitle}" onclick="window._userActions.openFolder.apply(this)"><i class="fa fa-folder-open-o" aria-hidden="true"></i> #{text}</span>' +
            '</div>',
            {
                time   : $rootScope.isWebClient || mcConst.ClientSettings.EventsTimeStamp ? time : "",
                text   : text,
                path   : filePath,
                oTitle : mcLang(574), // "574":"Показать в папке",
            }
        );

        div.setAttribute('uin', uin);

        target.appendChild(div);
    }

    // -----

    function chatMessage(msg) {
        var frame;

        if (!msg.hasOwnProperty('UID')){
            frame = $rootScope.createUIN(getUinWith(msg));
        } else {
            frame = $rootScope.createUID(msg.UID);
        }

        if (!framesList.hasFrame(frame)) {
            framesList.create(frame).hide();
        }

        msg.Idx = msg.Idx || msg.MsgIdx;

        if (!msg.History && msg.UINFrom == mcConst.UserInfo.UIN) {
            $rootScope.$broadcast(window._messages_.dialogsList.getUserState, [getUinWith(msg), function (state) {
                if (state === mcConst.states.offline) {
                    addCustomMSG(mcLang(572), frame, true); // "572":"Пользователь сейчас не в сети, ваше сообщение будет доставлено",
                }
            }]);
        }

        switch (msg.MsgType){
            case mcConst._CMD_.msgType.OLD_SHIT:
            case mcConst._CMD_.msgType.TEXT:
            case mcConst._CMD_.msgType.IMAGE:
            case mcConst._CMD_.msgType.INTEGRATION_API:
            case mcConst._CMD_.msgType.FILE:
                if (msg.Mod !== mcConst._CMD_.msgMods.DELETED){
                    addMSG(msg, frame);

                    noScrollDownOnSync = msg.History && !$scope.chatTextOutputW.getNode().scrollTop;
                }

                if (!msg.History && ((($rootScope.isWebClient || mcConst.ClientSettings.EventsPopupOnPrivateMessage) && !msg.hasOwnProperty('UID')) ||
                    (($rootScope.isWebClient || mcConst.ClientSettings.EventsPopupOnChannelMessage) && msg.hasOwnProperty('UID')))){

                    $rootScope.$broadcast(window._messages_.dialogsCtrl.selectDialog, [frame]);

                    if (!$rootScope.isWebClient) {
                        $rootScope.$broadcast(window._messages_.clientData.sendCMDToElectron, [
                            mcConst._CMD_.ce_show_on_top
                        ]);
                    }
                }
            break;

            case mcConst._CMD_.msgType.KANBAN_NOTIFY:
                addKanbanMSG(msg, frame);
            break;

            case mcConst._CMD_.msgType.CONF_ALERT:
            case mcConst._CMD_.msgType.CONF_PERSONAL:
                // мусорные команды - выкинуть нах с сервера
            break;

            case mcConst._CMD_.msgType.ADM_DELETE_MESSAGE:
                removeMSG(msg, frame);
            break;

            case  mcConst._CMD_.msgType.PRIVATE_REDIRECT:
                var redirectData = mcService.StringToObj(msg.Msg);

                if (!msg.History && redirectData.UIN == mcConst.UserInfo.UIN &&  redirectData.UINTo != $rootScope.GetChatID()) {
                    $rootScope.$broadcast('OpenPrivate', [redirectData.UINTo]);
                }

                addRedirectMSG(msg, frame);
            break;

            default:
                addCustomMSG(msg, frame);
        }

        if (currentFrame == frame || currentFrame.id == frame){
           scrollDown(false, !msg.History, msg.History && noScrollDownOnSync);
        }
    }

    function customMessage(msg) {
        var frame = null;

        if (msg.MsgType == mcConst._CMD_.msgType.KANBAN_NOTIFY){
            frame = 'UIN-0';
        } else {
            frame = msg.hasOwnProperty('UIN') ? "UIN-" + msg.UIN : "UID-" + msg.UID;
        }

        if (!framesList.hasFrame(frame)) {
            framesList.create(frame).hide();
        }

        if (msg.MsgType == mcConst._CMD_.msgType.KANBAN_NOTIFY) {
            $rootScope.$broadcast('updateCounter', [msg]);

            addKanbanMSG(msg, frame);
        } else
        if (msg.MsgType === mcConst._CMD_.msgType.SHOW_RECEIVED_FILES){
            addReceivedFilesMSG(msg, frame);
        } else
        if (msg.MsgType === mcConst._CMD_.msgType.SHOW_UPLOADED_FILES){
            addReceivedFilesMSG(msg, frame);
        } else {
            addCustomMSG(msg, frame);
        }

        noScrollDownOnSync = msg.History && !$scope.chatTextOutputW.getNode().scrollTop;
        
        if (currentFrame == frame || currentFrame.id == frame){
            scrollDown(false, !msg.History, msg.History && noScrollDownOnSync);
        }
    }

    // =============================================

    function transformRusText(text) {
        var listSymbols = {
            en : "qwertyuiop[]asdfghjkl;'zxcvbnm,.QWERTYUIOP{}ASDFGHJKL:ZXCVBNM<>`~\"",
            ru : "йцукенгшщзхъфывапролджэячсмитьбюЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЯЧСМИТЬБЮёЁЭ",
            ua : "йцукенгшщзхїфівапролджєячсмитьбюЙЦУКЕНГШЩЗХЇФІВАПРОЛДЖЯЧСМИТЬБЮ`~Є"
        };
        var res = new Array(text.length);
        var idx = -1;

        for (var i = 0; i < text.length; i ++){
            idx = listSymbols.en.indexOf(text[i]);
            
            if (idx >= 0) {
                res[i] = listSymbols[mcConst.Lang][idx];
            } else {
                idx = listSymbols.ru.indexOf(text[i]);
                
                if (idx >= 0){
                    res[i] = listSymbols.en[idx];
                } else {
                    res[i] = text[i];
                }
            }
        }

        return res.join('');
    }

    function sendPrivate(UIN, text, msgType){
        var msg = mcService.trim(text || $scope.enterChatText.getValue());

        if (msg !== ''){
            msg = msgType === undefined || msgType === mcConst._CMD_.msgType.TEXT ? (msg.replace(/\n/gi, '\r\n')) : msg;

            if ($rootScope.isWebClient || mcConst.ClientSettings.SoundsSndChatRet) {
                mcPlaySound.PlaySound(mcPlaySound.Sounds.EnterBtn);
            }

            $rootScope.SendCMDToServer([
                mcConst._CMD_.cs_private_msg,
                mcConst.SessionID,

                JSON.stringify({
                    UIN : UIN || $rootScope.GetChatID(),
                    Msg : msg,
                    MsgType: msgType || mcConst._CMD_.msgType.TEXT
                })
            ]);
        }
    }

    function sendConf(UID, text, msgType){
        var msg = mcService.trim(text || $scope.enterChatText.getValue());

        if (msg !== ''){
            msg = msgType === undefined || msgType === mcConst._CMD_.msgType.TEXT ? (msg.replace(/\n/gi, '\r\n')) : msg;

            if ($rootScope.isWebClient || mcConst.ClientSettings.SoundsSndChatRet) {
                mcPlaySound.PlaySound(mcPlaySound.Sounds.EnterBtn);
            }

            $rootScope.$broadcast('SendCMDToServer' , [
                mcConst._CMD_.cs_put_msg2txt_channel,
                mcConst.SessionID,

                JSON.stringify({
                    UIN : mcConst.UserInfo.UIN,
                    UID : UID || $rootScope.GetChatID(),
                    Msg : msg,
                    MsgType: msgType || mcConst._CMD_.msgType.TEXT
                })
            ]);
        }
    }

    function getUinWith(msg){
        return ((mcConst.UserInfo.UIN == msg.UINFrom) ? msg.UINTo : msg.UINFrom);
    }

    function scrollDown(now, smooth, history){ // frame
        if (view){
            if (history){ // noScrollDownOnSync &&
                // scrollDownTimer = setTimeout(function () {
                if (scrollDownTimer){
                    clearTimeout(scrollDownTimer);

                    scrollDownTimer = null;
                }

                if ($scope.chatTextOutput.scrollHeight !== prevHeight){
                    $scope.chatTextOutputW.getNode().scrollTop += $scope.chatTextOutput.scrollHeight - prevHeight;

                    prevHeight = $scope.chatTextOutput.scrollHeight;
                }
                // }, 100);
            } else

            if (now ){ // && !noScrollDownOnSync
                prevHeight = $scope.chatTextOutput.scrollHeight;

                $scope.chatTextOutputW.getNode().scrollTop = prevHeight;
            } else
            if (!scrollDownTimer) { //  && !noScrollDownOnSync
                scrollDownTimer = setTimeout(function () {
                    scrollDownTimer = null;

                    prevHeight = $scope.chatTextOutput.scrollHeight;

                    if (smooth){
                        $scope.chatTextOutputW.getNode().scroll({top: prevHeight, left: 0, behavior: 'smooth'});
                    } else {
                        $scope.chatTextOutputW.getNode().scrollTop = prevHeight;
                    }
                }, 100);
            }
        }
    }

    function fillFrame(topBtnTitle, topTopic, hasHistory){
        var frame  = $rootScope.GetChatTypeID();

        if (view) {
            view.show();

            framesList.hide(prevFrame);

            titleValue   = [topBtnTitle, topTopic];
            currentFrame = framesList.get(frame);
            prevFrame    = frame;

            currentFrame.show();
            
            $rootScope.$broadcast('selectDialog',[frame]);

            $scope.displayName.show();
            $scope.displayName.define('label', topBtnTitle + (topTopic ? ': ' + topTopic : ''));
            $scope.displayName.refresh();

            scrollDown();

            if (hasHistory){
                mcService.showView($scope.loadMoreHistory);
            } else {
                mcService.hideView($scope.loadMoreHistory);
            }

            switch ($rootScope.GetChatType()){
                case $rootScope.chatAliases.UIN:
                    $scope.topLabelList = userMenu();  // private

                    $$($scope.container).getNode().className = "webix_view noMargin gradient2 webix_layout_line";

                    $scope.inputWrapper.show();
                    $scope.inputResizer.show();
                break;

                case $rootScope.chatAliases.UID:
                    $scope.topLabelList = confMenu();  // channel

                    $$($scope.container).getNode().className = "webix_view noMargin gradient webix_layout_line";

                    $scope.inputWrapper.show();
                    $scope.inputResizer.show();
                break;
            }

            focusToEnterChat();
        }
    }

    function focusToEnterChat(){
        if (mcConst.LoggedIn && $scope.enterChatText){
            var pos = mcService.getCaretPosition($scope.enterChatText.$view);
            
            $scope.displayName.focus();

            setTimeout(function () {
                $scope.enterChatText.focus();
                
                mcService.setCaretPosition($scope.enterChatText.$view, pos);
            }, 50);
        }
    }

    function _sendText(sendType, sendId, sendText, msgType){
        var id = sendId || $rootScope.GetChatID();

        switch (sendType || $rootScope.GetChatType()){
            case 'UIN': sendPrivate(id, sendText, msgType); break;
            case 'UID': sendConf(id, sendText, msgType);    break;
        }

        if (msgType !== mcConst._CMD_.msgType.IMAGE && msgType !== mcConst._CMD_.msgType.FILE){
            setTimeout(function(){
                $scope.enterChatText.setValue('');
                $scope.enterChatText.$setValue('');
            }, 10);
        }

        return false;
    }

    function minMax (isMax, callInfo) {
        var wrapper = $scope.videoFrameWrapper;
        var wrapNode = wrapper.getNode().firstChild;

        if (isMax){
            wrapNode.className = wrapNode.className.replace(" maxSize", "");
            wrapNode.style.position = "relative";

            if (callInfo.cPanel) {
                callInfo.cPanel.body.style.position = "absolute";
            }
        } else {
            wrapNode.className += " maxSize";
            wrapNode.style.position = "fixed";

            if (callInfo.cPanel) {
                callInfo.cPanel.body.style.position = "fixed";
            }
        }

        if (!$rootScope.isWebClient){
            $rootScope.$broadcast(window._messages_.clientData.toggleKioskMode, [!isMax]);
        }
    }

    function showVideoFrame(callInfo) {
        if (callInfo && (callInfo.useVideo || callInfo.receiveScreen)){
            var wrapper = $scope.videoFrameWrapper;
            var wrapNode = wrapper.getNode().firstChild;

            wrapper.show();

            $scope.videoResizer.show();

            $scope.videoFrameContainer = document.getElementById(mcConst.videoContainer);
            $scope.videoFrameContainer.appendChild(callInfo.video);

            if (callInfo.receiveScreen) {
                wrapNode.style.overflow = "auto";
                wrapNode.style.position = "relative";
            } else {
                wrapNode.style.overflow = "none";
                wrapNode.style.position = "";

                $scope.videoFrameContainer.appendChild(callInfo.mirror);

                callInfo.video.style.maxWidth = "100%";
            }

            view.getTopParentView().adjust();
            
            callInfo.cPanel.init(wrapNode);

            wrapNode.onmousemove = function () {
                callInfo.cPanel.onmousemove();
            };

            callInfo.cPanel.closeCall = function () {
                $rootScope.$broadcast(window._messages_.privateInfo.stopCurrentCall);
            };

            callInfo.cPanel.fitFill = function (isFit, videoContainer) {
                if (!isFit){
                    $scope.videoFrameContainer.style.height = "";
                    videoContainer.className = videoContainer.className.replace(" fit", "");
                } else {
                    $scope.videoFrameContainer.style.height = "100%";
                    videoContainer.className += " fit";
                }
            };

            callInfo.cPanel.minMax = function (isMax) {
                minMax(isMax, callInfo);
            };
            
            callInfo.cPanel.show();
        }
    }

    function hideVideoFrame(callInfo){
        var wrapNode = $scope.videoFrameWrapper.getNode();
        
        wrapNode.onmousemove = null;

        $scope.videoFrameWrapper.hide();
        
        $scope.videoResizer.hide();

        if ($scope.videoFrameContainer){
            $scope.videoFrameContainer.innerHTML = "";
        }

        $scope.videoFrameContainer = null;

        view.getTopParentView().adjust();

        if (!$rootScope.isWebClient && callInfo){
            minMax(true, callInfo);
        }
    }

    function markGotNotify(UIN, ID){
        var elem  = null;

        var firstIdx = $rootScope.$broadcast(window._messages_.dialogsList.getFirstLastMsg, [UIN, true]);

        for (var idx = ID; idx >= firstIdx; idx --){
            elem = document.getElementById(idx + "-st-" + mcConst.UserInfo.UIN);

            if (elem){
                if (elem.className.indexOf("messageGot") === 0 || elem.className.indexOf("messageRead") === 0){
                    break;
                } else {
                    elem.className = "messageGot statusItem";
                }
            }
        }
    }

    function markReadNotify(UIN, ID){
        var elem  = null;
        var firstIdx = $rootScope.$broadcast(window._messages_.dialogsList.getFirstLastMsg, [UIN, true]);

        for (var idx = ID; idx >= firstIdx; idx --){
            elem = document.getElementById(idx + "-st-" + mcConst.UserInfo.UIN);

            if (elem){
                if (elem.className.indexOf("messageRead") === 0){
                    break;
                } else {
                    elem.className = "messageRead statusItem";
                }
            }
        }
    }

    // =====================================
    // =====================================

    $scope.popupInsertPhrase = function(){

    };

    $scope.scrollControl = function (e) {
        if (e.clientX > $scope.chatTextOutputW.getNode().outerWidth){
            console.log('click on scroll');
        }
    };

    $scope.sendText = _sendText;

    $scope.popupInsertFile = function(){
        this.getTopParentView().hide();

        $scope.uploadFile(mcConst._CMD_.msgType.FILE, false, false);
    };

    $scope.popupInsertImage = function(){
        this.getTopParentView().hide();

        $scope.uploadFile(mcConst._CMD_.msgType.IMAGE, false, false);
    };

    $scope.addHistoryMessages = function () {
        noScrollDownOnSync = true;
        
        $rootScope.$broadcast(window._messages_.dialogsList.getHistoryMsgRange, [$rootScope.GetChatID(), $rootScope.GetChatType()]);
    };

    $scope.saveTextInputSize = function () {
        inputSize = $scope.inputWrapper.$getSize()[3];
        
        $rootScope.Storage.dialogs.save(null, null, mcConst.storageOpts.INPUTOPTS, inputSize);
    };

    $scope.loadTextInputSize = function () {
        $rootScope.Storage.dialogs.load(null, null, mcConst.storageOpts.INPUTOPTS, function (height) {
            if (height && !downloadUploadManager.isActive()) {
                $scope.inputWrapper.define('height', height);
                $scope.inputWrapper.resize();
                $scope.inputWrapper.resizeChildren();
            }
        });
    };

    $scope.registerHotKeys = function () {
        $rootScope.hotKeyDispatcher.addPreset(mcConst.dataModels.ChatFrame, [{
            key   : mcConst.keyCodes.enter,
            func  : function () {
                $scope.sendText();
            }
        }, {
            key   : mcConst.keyCodes.enter,
            ctrlKey: true,
            func  : function () {
                if ($rootScope.isWebClient || mcConst.ClientSettings.GeneralCtrlEnterSend) {
                    $scope.sendText();
                } else {
                    $scope.enterChatText.getInputNode().value += "\n";
                }
            }
        }, {
            key   : mcConst.keyCodes.f8,
            func  : function () {
                var node = $scope.enterChatText.getInputNode();
                var selectedText = mcService.getSelectedText(node);

                if (selectedText.infix){
                    $scope.enterChatText.setValue(selectedText.prefix + transformRusText(selectedText.infix) + selectedText.postfix);

                    mcService.setSelectionText(node, selectedText.selectionStart, selectedText.selectionEnd);
                } else {
                    $scope.enterChatText.setValue(transformRusText($scope.enterChatText.getValue()));
                    
                    mcService.setCaretPosition(node, selectedText.selectionEnd);
                }
            }
        }], $scope.enterChatText.getNode());

        $rootScope.hotKeyDispatcher.addPreset(mcConst.dataModels.ChatFrame + "global", [{
            key   : mcConst.keyCodes.f5,
            func  : function () {
                $scope.clipPopupWindow.hide();

                $scope.uploadFile(mcConst._CMD_.msgType.FILE, false, false);
            }
        },{
            key   : mcConst.keyCodes.f6,
            func  : function () {
                $rootScope.$broadcast(_messages_.privateInfo.redirectUserTo);
            }
        }, {
            key   : mcConst.keyCodes.f,
            ctrlKey: true,
            func  : function () {
                $scope.searchWrapper.show();
                $scope.searchChatText.focus();
            }
        }, {
            key     : mcConst.keyCodes.v,
            shiftKey: true,
            ctrlKey : true,
            func    : function () {
                downloadUploadManager.sendFilesToUser(true);
            }
        }, {
            key     : mcConst.keyCodes.f4,
            ctrlKey : true,
            func    : function () {
                $rootScope.$broadcast(_messages_.dialogsList.removeDialogFromList, [$rootScope.GetChatID()]);
            }
        }], document);

        $rootScope.hotKeyDispatcher.addPreset(mcConst.dataModels.ChatFrame + "find", [{
            key   : mcConst.keyCodes.enter,
            func  : function () {
                $rootScope.$broadcast("find_chat_text", [currentFrame, $scope.searchChatText.getValue(), $scope.searchChatText]);
            }
        }, {
            key     : mcConst.keyCodes.esc,
            lockPrev: true,
            func    : $scope.hideFindChatText
        }], $scope.searchChatText.getNode());
    };

    $scope.removeHotKeys = function () {
        $rootScope.hotKeyDispatcher.removePreset(mcConst.dataModels.ChatFrame);
        $rootScope.hotKeyDispatcher.removePreset(mcConst.dataModels.ChatFrame + "global");
        $rootScope.hotKeyDispatcher.removePreset(mcConst.dataModels.ChatFrame + "find");
    };

    $scope.hideFindChatText = function () {
        $scope.searchWrapper.hide();
        $scope.searchChatText.setValue("");

        $rootScope.$broadcast("find_clear", [currentFrame]);

        setTimeout(function () {
            $scope.enterChatText.focus();
        }, 50);
    };

    $scope.titleMenu = function(){
        switch ($rootScope.GetChatType()){
            case $rootScope.chatAliases.UIN:
                $rootScope.$broadcast("selectTool", [mcConst.dataModels.PrivateInfo,  true]);
            break;

            case $rootScope.chatAliases.UID:
                $rootScope.$broadcast("selectTool", [mcConst.dataModels.ConfUserList, true]);
            break;
        }
    };

    $scope.changeScrollPosition = function () {
        var scrView   = $scope.chatTextOutputW.getNode();
        var newHeight = scrView.scrollHeight;
        var delta     = newHeight - prevHeight;

        if ( delta >= 0){
            scrView.scrollTop += delta;
        } else {
            scrView.scrollTop -= delta;
        }

        prevHeight = newHeight;
    };

    $scope.typingNotify = function(code, e){ // code, e
        if (!e.altKey && !e.ctrlKey){
            if (mcConst.keyCodes.PrintSymbols.indexOf(code) !== -1){
                if ($rootScope.isWebClient || mcConst.ClientSettings.SoundsSndChatType) {
                    mcPlaySound.PlaySound(mcPlaySound.Sounds.Typing);
                }
            } else
            if ((code === mcConst.keyCodes.delete || code === mcConst.keyCodes.backspace) && $scope.enterChatText.getValue() && ($rootScope.isWebClient || mcConst.ClientSettings.SoundsSndChatBS)) {
                mcPlaySound.PlaySound(mcPlaySound.Sounds.DeleteAct);
            }
        }

        if ($rootScope.GetChatType() === 'UIN'){
            pressNotifyCount ++;

            if (pressNotifyCount === 10){
                pressNotifyCount = 0;

                $rootScope.$broadcast('SendCMDToServer', [
                    mcConst._CMD_.cs_typing_notify,
                    mcConst.SessionID,
                    $rootScope.GetChatID()
                ])
            }
        }
    };

    $scope.show = function(){
        if (!view){
            downloadUploadManager = new DownloadUploadManager($rootScope, _sendText);
            // framesList            = new McFramesList();

            $scope.uploadFile = downloadUploadManager.uploadFile;
            $scope.initDU     = downloadUploadManager.initViews;
            $scope.duViews    = downloadUploadManager.getViews();

            view = initChatFrame($scope);

            framesList.initView($scope.chatTextOutput);
            framesList.show(prevFrame);

            if (!currentFrame){
                currentFrame = framesList.get(prevFrame);
            }

            downloadUploadManager.onPasteItemFromClipboard($scope.enterChatText.$view);
        } else {
            view.show();
        }

        scrollDown();
        
        $scope.registerHotKeys();

        setTimeout(function () {
            downloadUploadManager.loadAllImages(function () {
                scrollDown();
            });
        }, 100);
    };

    //========================================

    var _msg = _messages_.chatFrame = {
        showMirrorVideoFrame    : 'showMirrorVideoFrame',
        blurChatTextOutput      : 'blurChatTextOutput',
        showVideoFrame          : 'showVideoFrame',
        hideVideoFrame          : 'hideVideoFrame',
        clearChatFrame          : 'clearChatFrame',
        fillChatFrame           : 'fillChatFrame',
        addChatMessage          : 'addChatMessage',
        addCustomMSG            : 'addCustomMSG',
        clearConfMessages       : 'clearConfMessages',
        clearPrivateMessages    : 'clearPrivateMessages',
        removeFrameChat         : 'removeFrameChat',
        on_mainWindowFocused    : 'on_mainWindowFocused',
        focusToEnterChat        : 'focusToEnterChat',
        scrollDownChat          : 'scrollDownChat',
        showNotifyMessage       : 'showNotifyMessage',
        updateMessagesState     : 'updateMessagesState',
        on_private_got_notify   : 'on_private_got_notify',
        on_private_read_notify  : 'on_private_read_notify',
        quickMessagesList       : 'quickMessagesList',

        '----':'----'
    };

    // ===================================================================

    $scope.$on(_msg.quickMessagesList, function (e, args){
        msgTemplateList  = args[0];

        // console.log(msgTemplateList);
    });

    $scope.$on(_msg.updateMessagesState, function (e, args) {
        var UIN  = args[0];
        var fUIN = $rootScope.createUIN(UIN);

        myMessages = {
            UIN        : -1,
            IDMyMsgGot : 0,
            IDMyMsgRead: 0
        };

        if (UIN != mcConst.UserInfo.UIN && $rootScope.GetChatTypeID() === fUIN && myMessages.UIN != UIN) {
            myMessages = mcService.Marge(myMessages, $rootScope.$broadcast(window._messages_.dialogsList.getMyMessagesState, [UIN]));

            if ($rootScope.GetChatTypeID() === fUIN){
                markReadNotify.apply(null, [UIN, myMessages.IDMyMsgRead]);

                if (myMessages.IDMyMsgGot > myMessages.IDMyMsgRead){
                    markGotNotify.apply(null, [UIN, myMessages.IDMyMsgGot]);
                }
            }
        }
    });

    $scope.$on(_msg.on_private_got_notify, function (e, args) {
        markGotNotify.apply(null, [args[0].UIN, args[0].ID]);
    });

    $scope.$on(_msg.on_private_read_notify, function (e, args) {
        markReadNotify.apply(null, [args[0].UIN, args[0].ID]);
    });

    $scope.$on(_msg.showNotifyMessage, function (e, args) {
        showNotify.apply(null, args);
    });

    $scope.$on(_msg.scrollDownChat, function (e, args) {
        scrollDown.apply(null, args);
    });

    $scope.$on(_msg.focusToEnterChat, focusToEnterChat);

    $scope.$on(_msg.on_mainWindowFocused, function(){
        focusToEnterChat();
    });

    $scope.$on(_msg.showMirrorVideoFrame, function(){
        mcService.showFrame(mcConst.myVideoStream);
    });

    $scope.$on(_msg.blurChatTextOutput, function(){
        $scope.clipPopupWindow.hide();

        $scope.enterChatText.blur();
    });

    $scope.$on(_msg.showVideoFrame, function(e, args){
        showVideoFrame.apply(null, args);
    });

    $scope.$on(_msg.hideVideoFrame, function (e, args) {
        hideVideoFrame.apply(null, args);
    });

    $scope.$on(_msg.clearChatFrame, function(e, args){

    });

    $scope.$on(_msg.fillChatFrame, function(e, args){
        noScrollDownOnSync = false;
        
        fillFrame.apply(null, args);
        
        $scope.hideFindChatText();
    });

    $scope.$on(_msg.addChatMessage, function(e, args){
        chatMessage.apply(null, args);
    });

    $scope.$on(_msg.addCustomMSG, function(e, args){
        customMessage.apply(null, args);
    });

    $scope.$on(_msg.clearConfMessages, function(e, args){
        var uid = args[0];

        framesList.clear('UID-' + uid);
    });

    $scope.$on(_msg.clearPrivateMessages, function(e, args){
        var uin = args[0];

        framesList.clear('UIN-' + uin);
    });

    $scope.$on(_msg.removeFrameChat, function (e, args) {
        var type = args[0];
        var idx  = args[1];
        
        framesList.remove(type + "-" + idx);
    });

    $scope.$on('hide' + $scope.Name, function(){
        $scope.removeHotKeys();
        $scope.hideFindChatText();

        view.hide();
    });

    $scope.$on('show' + $scope.Name, function(e, args){
        $scope.container = args[0];

        $scope.show();

        $scope.loadTextInputSize();
    });

    $rootScope.$broadcast('windowResize', [function(){
        if (view && view.isVisible()){
            var inFocus = webix.UIManager.getFocus();

            if (inFocus && inFocus.config.id === $scope.enterChatText.config.id){
                $scope.enterChatText.focus();
            }
        }
    }]);
}
