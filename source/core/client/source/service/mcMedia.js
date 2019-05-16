"use strict";

function mcMedia(mcSound, $rootScope) {
    var timer        = null;
    var mediaCall    = null;

    var mediaEvents  = new CallStates();
    var questionBox  = null;
    var callWnd      = null;
    var rejectTimer  = null;
    var UIN          = null;
    var cPanel       = null;

    var selfContainer  = document.createElement('video');
    var videoContainer = document.createElement('video');
    var audioContainer = document.createElement('audio');

    var Self   = this;
    var listCE = mediaEvents.list;

    this.Share       = false;
    this.MID         = 0;
    this.useVideo    = false;
    this.onShowMedia = null;
    this.onCloseCall = null;
    this.infoMessage = null;
    this.callStates  = {
        stopCall : 1,
        reject   : 2,
        close    : 3,
        error    : 4,
        busy     : 5,
        cancel   : 6,
        timeout  : 7
    };

    // ===================================

    mediaEvents.setUniversalStateEvent(function(){
        if (Self.infoMessage){
            Self.infoMessage.apply(null, arguments);
        }

        if (this !== listCE.outgoing_call_try      &&
            this !== listCE.outgoing_call_started  &&
            this !== listCE.outgoing_call_accepted &&
            this !== listCE.incoming_call_accepted &&
            this !== listCE.incoming_call_started  &&
            this !== listCE.incoming_call_try){

            mediaEvents.clearState();
        }
    });

    // ===================================

    function hideCallWnd(all) {
        clearTimeout(rejectTimer);

        if (questionBox && questionBox.parentNode) {
            webix.modalbox.hide(questionBox);
        }

        if (all && callWnd && callWnd.parentNode){
            webix.modalbox.hide(callWnd);
        }
    }

    function sendCandidate(){
        $rootScope.$broadcast('SendCMDToServer', [ mcConst._CMD_.cs_media_ice_candidate, mcConst.SessionID].concat([].slice.call(arguments)));
    }

    function onError(err){
        console.error(err);

        $rootScope.$broadcast('SendCMDToServer', [ mcConst._CMD_.cs_media_call_error, mcConst.SessionID, UIN]);

        mediaEvents.setStateEvent(listCE.outgoing_call_my_error, mcLang(498, err)); // "498":"Во время звонка возникла ошибка: %s",

        Self.CloseCall();
    }

    function sendOffer(){
        $rootScope.$broadcast('SendCMDToServer', [ mcConst._CMD_.cs_media_offer, mcConst.SessionID].concat([].slice.call(arguments)));
    }

    function sendAnswer() {
        $rootScope.$broadcast('SendCMDToServer', [ mcConst._CMD_.cs_media_answer, mcConst.SessionID].concat([].slice.call(arguments)));
    }

    function showMedia(){ // videoContainer
        if (!mediaCall.complete){
            timer.Start();

            mediaCall.complete = true;

            mcSound.Stop();

            if (callWnd && callWnd.parentNode){
                webix.modalbox.hide(callWnd);
            }

            cPanel = new Create_cPanel(mediaCall, mediaCall.useVideo, mediaCall.receiveScreen, videoContainer);

            if (Self.onShowMedia){
                Self.onShowMedia({
                    useVideo     : mediaCall.useVideo,
                    receiveScreen: mediaCall.receiveScreen,

                    video      : videoContainer,
                    audio      : audioContainer,
                    mirror     : selfContainer,
                    cPanel     : cPanel
                });
            }
        }
    }

    // ===================================

    this.setInfo = function (info, video, share) {
        mediaCall.useVideo      = video;
        mediaCall.receiveScreen = share;
        mediaCall.MID           = info.MID;

        mediaCall.addIceServers(mcService.makeIceServers(info, $rootScope.isWebClient), $rootScope.isWebClient ? "all" : mcConst.ClientSettings.IceTransportPolicy);
    };

    this.callQuestions = function (info, done){
        function answer(video){
            Self.setInfo(info, video, info.Share);

            $rootScope.$broadcast('SendCMDToServer', [ mcConst._CMD_.cs_media_call_accept, mcConst.SessionID, info.UIN, video, info.MID]);

            setTimeout(function () {
                $rootScope.$broadcast('SendCMDToServer', [ mcConst._CMD_.cs_media_ready, mcConst.SessionID, info.UIN]);
            }, 250);
        }

        function reject(){
            mcSound.Stop();
            mcSound.PlaySound(mcSound.Sounds.Reject);

            $rootScope.$broadcast('SendCMDToServer', [ mcConst._CMD_.cs_media_call_reject, mcConst.SessionID, info.UIN]);

            mediaEvents.setStateEvent(listCE.incoming_call_rejected, mcLang(506)); // "506":"Вы отказались принять звонок",
        }

        var btns = info.Video ?
            //       0                 1                   2
            [mcService.Lang(21), mcService.Lang(22), mcService.Lang(33)] : //"22" : "Видео", "21" : "Голос",  "33" : "Отмена",
            [mcService.Lang(21), mcService.Lang(33)]; // "21" : "Голос",  "33" : "Отмена",

        mediaEvents.isMyCall = false;
        mediaEvents.setCustomCallEvent(listCE.incoming_call_try);

        UIN = info.UIN;

        questionBox = webix.modalbox({
            buttons: btns,
            text   : mcService.Lang(39) + info.Nick, // "39" : "Входящий звонок",
            width  : "400px",
            callback: function(result){
                switch(result){
                    case '0':
                        answer(false);

                        if (done) done();
                    break;

                    case '1':
                        if (info.Video){
                            answer(true);

                            if (done) done();
                        } else {
                            reject();
                        }
                    break;

                    case '2':
                        reject();
                    break;
                }
            }
        });
    };

    this.myCall = function (_uin, video, share, done){
        function reject(timeout){
            clearTimeout(rejectTimer);

            $rootScope.$broadcast('SendCMDToServer', [ mcConst._CMD_.cs_media_call_reject, mcConst.SessionID, _uin]);

            mediaEvents.setStateEvent(listCE.outgoing_call_rejected, mcLang(507));  //"507":"Исходящий звонок прерван",

            Self.CloseCall(timeout ? Self.callStates.timeout : Self.callStates.cancel);

            mcSound.PlaySound(mcSound.Sounds.Reject);

            if (done) done();
        }

        mediaCall.Share = share;

        mediaEvents.isMyCall = true;

        callWnd = webix.alert({
            type : "alert-warning",
            ok   : mcLang(509), // "509":"Завершить",
            text : mcLang(510), // "510":"Ожидаем овет...",
            callback: function() {
                reject();
            }
        });

        rejectTimer = setTimeout(function(){
            reject(true);

            webix.modalbox.hide(callWnd);
        }, 30000);

        UIN = _uin;

        mediaEvents.setCustomCallEvent(listCE.outgoing_call_try);

        $rootScope.$broadcast('SendCMDToServer', [ mcConst._CMD_.cs_media_call, mcConst.SessionID, _uin, video, mediaCall.Share]);
    };

    this.prepare = function (){
        timer     = new mcService.MyTimer();
        mediaCall = new MediaCall();

        mediaCall.complete       = false;
        mediaCall.sendAnswer     = sendAnswer;
        mediaCall.sendOffer      = sendOffer;
        mediaCall.sendCandidate  = sendCandidate;
        mediaCall.onError        = onError;
        mediaCall.showMedia      = showMedia;

        videoContainer.id        = mcConst.videoStreamName;
        videoContainer.autoplay  = "autoplay";
        videoContainer.className = "VideoCaller";

        audioContainer.id        = mcConst.audioStreamName;
        audioContainer.autoplay  = "autoplay";
        audioContainer.className = "AudioCaller";

        selfContainer.id         = mcConst.mirrorStreamName;
        selfContainer.autoplay   = "autoplay";
        selfContainer.className  = "myVideo";
        selfContainer.muted      = "muted";

        Self.recvReady     = mediaCall.recvReady;
        Self.recvOffer     = mediaCall.recvOffer;
        Self.recvCandidate = mediaCall.recvCandidate;
        Self.recvAnswer    = function () {
            mediaEvents.setCustomCallEvent(listCE.outgoing_call_started);
            mediaCall.recvAnswer.apply(null, arguments);
        };

        return mediaCall;
    };

    this.CloseCall = function CloseCall(callType, params){
        hideCallWnd(true);

        mcSound.Stop();

        if (Self.onCloseCall){
            Self.onCloseCall({
                MID          : mediaCall.MID,
                receiveScreen: mediaCall.useVideo,
                useVideo     : mediaCall.receiveScreen,

                cPanel       : cPanel
            });
        }

        if (Self.nowCalling()) {
            var time          = timer.Stop();

            switch (callType){
                case Self.callStates.stopCall:
                    if (mediaEvents.isMyCall){
                        mediaEvents.setStateEvent(listCE.outgoing_call_my_close, mcLang(495, time)); // "495":"Исходящий звонок от меня, продолжительность %s",
                    } else {
                        mediaEvents.setStateEvent(listCE.incoming_call_my_close, mcLang(494, [params.DisplayName, time])); // "494":"Входящий звонок от %s, продолжительность %s",
                    }
                break;

                case Self.callStates.reject:
                    if (mediaEvents.isMyCall){
                        mediaEvents.setStateEvent(listCE.outgoing_call_rejected, mcLang(496)); // "496":"Пользователь отказался принять ваш звонок",
                    } else {
                        mediaEvents.setStateEvent(listCE.incoming_call_rejected, mcLang(500)); // "500":"Пропущен входящий звонок",
                    }
                break;

                case Self.callStates.close:
                    if (mediaEvents.isMyCall){
                        mediaEvents.setStateEvent(listCE.outgoing_call_remote_close, mcLang(495, time)); // "495":"Исходящий звонок от меня, продолжительность %s",
                    } else {
                        mediaEvents.setStateEvent(listCE.incoming_call_remote_close, mcLang(494, [params.DisplayName, time])); // "494":"Входящий звонок от %s, продолжительность %s",
                    }
                break;

                case Self.callStates.error:
                    mediaEvents.setStateEvent(
                        mediaEvents.isMyCall
                            ? listCE.outgoing_call_remote_error
                            : listCE.incoming_call_remote_error, mcLang(499)); // "499":"Во время звонка у вашего собеседника возникла ошибка",
                break;

                case Self.callStates.busy:
                    mediaEvents.setStateEvent(listCE.outgoing_call_busy, mcLang(501)); // "501":"Исходящий звонок от меня, занято.",
                break;

/*
                case Self.callStates.cancel:    // todo: add text
                    if (mediaEvents.isMyCall){
                        mediaEvents.setStateEvent(listCE.outgoing_call_cancelled);
                    } else {
                        mediaEvents.setStateEvent(listCE.incoming_call_cancelled);
                    }
                break;

                case Self.callStates.timeout:   // todo: add text
                    if (mediaEvents.isMyCall){
                        mediaEvents.setStateEvent(listCE.outgoing_call_cancelled_by_timeout);
                    } else {
                        mediaEvents.setStateEvent(listCE.incoming_call_cancelled_by_timeout);
                    }
                break;
*/
            }

            UIN = null;
            
            webix.message(mcLang(493)); // "493":"Сеанс связи закончен...",

            mediaCall.complete = false;
            mediaCall.hangUp();
        }

        mediaEvents.clearState();

        if (cPanel) {
            cPanel.destructor();
            cPanel = null;
        }
    };

    this.preShow = function (video){
        hideCallWnd();
        
        if (mediaEvents.isMyCall){
            mediaEvents.setCustomCallEvent(listCE.outgoing_call_accepted);
        } else {
            mediaEvents.setCustomCallEvent(listCE.incoming_call_started);
        }

        if (video || mediaCall.useVideo || mediaCall.receiveScreen) {
            mediaCall.setMirror(selfContainer);
            mediaCall.setCallee(videoContainer);
        } else {
            mediaCall.setCallee(audioContainer);
        }
    };

    this.nowCalling = function () {
        return mediaEvents.currentState() !== listCE.free;
    };

    this.getUIN = function () {
        return UIN;
    };
}
