"use strict";

function mcPlaySound($rootScope){
    var isBrowser = location.protocol !== 'file:';

    var Sounds    = {
        Call      : 1,
        Receive   : 2,
        Reject    : 3,
        Busy      : 4,
        End       : 5,
        Private   : 6,
        ConfMsg   : 7,
        JoinConf  : 8,
        LeaveConf : 9,
        EnterBtn  : 10,
        Typing    : 11,
        DeleteAct : 12,
        BBS       : 13
    };

    var SoundList = {};

    var self = this;

    var nowPlaying = null;

    this.snd = Sounds;
    this.Sounds = Sounds;

    function _play(idx) {
        nowPlaying = idx;

        try {
            SoundList[idx].play().catch(function () {});
            SoundList[idx].onended = SoundList[idx].onended || function () {
                this.onended = null;
                
                if (this.sndIdx === nowPlaying) nowPlaying = null;
            };
            SoundList[nowPlaying].onpause = SoundList[nowPlaying].onpause || function () {
                this.onpause = null;

                if (this.sndIdx === nowPlaying) nowPlaying = null;
            };
        } catch (e){}
    }

    this.Play = function(idx, once){
        if ($rootScope.isWebClient || !mcConst.ClientSettings.SoundsAllSoundsOff)
        if (SoundList[idx]){
            if (once){
                SoundList[idx].currentTime = 0;
            } else

            if (nowPlaying){
                self.Stop(nowPlaying);
            }

            _play(idx);
        } else {
            console.warn("Sound idx: " + idx + " is not defined");
        }
    };

    this.PlaySound = this.Play;

    this.Stop = function(idx){
        if (idx) {
            if (SoundList[idx]){
                try {
                    SoundList[idx].pause();
                    SoundList[idx].currentTime = 0;
                } catch (e){}
            } else {
                console.warn("Sound idx: " + idx + " is not defined");
            }
        } else {
            for (var sound in SoundList) {
                if (SoundList[sound]){
                    try {
                        SoundList[sound].pause();
                        SoundList[sound].currentTime = 0;
                    } catch (e){}
                }
            }
        }
    };

    function init() {
        var html = "";

        if (isBrowser){ // Web Client
            html =
                '<audio id="Sound_Ring"      preload loop><source src="source/media/mediaincomingcall.mp3" type="audio/mpeg"></audio>'+
                '<audio id="Sound_Calling"   preload loop><source src="source/media/mediacall.mp3" type="audio/mpeg"></audio>'+
                '<audio id="Sound_End"       preload><source src="source/media/mediaendcall.mp3" type="audio/mpeg"></audio>'+
                '<audio id="Sound_Reject"    preload><source src="source/media/mediacallreject.mp3" type="audio/mpeg"></audio>'+
                '<audio id="Sound_Busy"      preload><source src="source/media/mediabusy.mp3" type="audio/mpeg"></audio>'+
                '<audio id="Sound_Private"   preload><source src="source/media/private.mp3" type="audio/mpeg"></audio>' +
                '<audio id="Sound_EnterBtn"  preload><source src="source/media/chatret.mp3" type="audio/mpeg"></audio>' +
                '<audio id="Sound_Typing"    preload><source src="source/media/chattype.mp3" type="audio/mpeg"></audio>'+
                '<audio id="Sound_JoinConf"  preload><source src="source/media/join.mp3" type="audio/mpeg"></audio>'+
                '<audio id="Sound_ConfMsg"   preload><source src="source/media/chat.mp3" type="audio/mpeg"></audio>'+
                '<audio id="Sound_DeleteAct" preload><source src="source/media/chatbs.mp3" type="audio/mpeg"></audio>'+
                '<audio id="Sound_LeaveConf" preload><source src="source/media/leave.mp3" type="audio/mpeg"></audio>';
        } else { // Electron Client
            
            var profile = require('../service/profile');
            var pathToSounds = profile.getProfilePath() + '/sounds/';

            html =
                '<audio id="Sound_BBS"       preload><source src="' + pathToSounds + 'newmsg.mp3" type="audio/mpeg"></audio>'+
                '<audio id="Sound_Ring"      preload loop><source src="' + pathToSounds + 'mediaincomingcall.mp3" type="audio/mpeg"></audio>'+
                '<audio id="Sound_Calling"   preload loop><source src="' + pathToSounds + 'mediacall.mp3"  type="audio/mpeg"></audio>'+
                '<audio id="Sound_End"       preload><source src="' + pathToSounds + 'mediaendcall.mp3"    type="audio/mpeg"></audio>'+
                '<audio id="Sound_Reject"    preload><source src="' + pathToSounds + 'mediacallreject.mp3" type="audio/mpeg"></audio>'+
                '<audio id="Sound_Busy"      preload><source src="' + pathToSounds + 'mediabusy.mp3" type="audio/mpeg"></audio>'+
                '<audio id="Sound_ConfMsg"   preload><source src="' + pathToSounds + 'chat.mp3"      type="audio/mpeg"></audio>'+
                '<audio id="Sound_JoinConf"  preload><source src="' + pathToSounds + 'join.mp3"      type="audio/mpeg"></audio>'+
                '<audio id="Sound_LeaveConf" preload><source src="' + pathToSounds + 'leave.mp3"     type="audio/mpeg"></audio>'+
                '<audio id="Sound_EnterBtn"  preload><source src="' + pathToSounds + 'chatret.mp3"   type="audio/mpeg"></audio>'+
                '<audio id="Sound_Typing"    preload><source src="' + pathToSounds + 'chattype.mp3"  type="audio/mpeg"></audio>'+
                '<audio id="Sound_DeleteAct" preload><source src="' + pathToSounds + 'chatbs.mp3"    type="audio/mpeg"></audio>'+
                '<audio id="Sound_Private"   preload><source src="' + pathToSounds + 'private.mp3"   type="audio/mpeg"></audio>';
        }

        document.body.insertAdjacentHTML('beforeEnd', html);

        SoundList[Sounds.Call]      = document.getElementById("Sound_Ring");
        SoundList[Sounds.Receive]   = document.getElementById("Sound_Calling");
        SoundList[Sounds.Reject]    = document.getElementById("Sound_End");
        SoundList[Sounds.Busy]      = document.getElementById("Sound_Reject");
        SoundList[Sounds.End]       = document.getElementById("Sound_Busy");
        SoundList[Sounds.Private]   = document.getElementById("Sound_Private");
        SoundList[Sounds.JoinConf]  = document.getElementById("Sound_JoinConf");
        SoundList[Sounds.LeaveConf] = document.getElementById("Sound_LeaveConf");
        SoundList[Sounds.EnterBtn]  = document.getElementById("Sound_EnterBtn");
        SoundList[Sounds.Typing]    = document.getElementById("Sound_Typing");
        SoundList[Sounds.ConfMsg]   = document.getElementById("Sound_ConfMsg");
        SoundList[Sounds.DeleteAct] = document.getElementById("Sound_DeleteAct");

        SoundList[Sounds.Call].sndIdx      = Sounds.Call;
        SoundList[Sounds.Receive].sndIdx   = Sounds.Receive;
        SoundList[Sounds.Reject].sndIdx    = Sounds.Reject;
        SoundList[Sounds.Busy].sndIdx      = Sounds.Busy;
        SoundList[Sounds.End].sndIdx       = Sounds.End;
        SoundList[Sounds.Private].sndIdx   = Sounds.Private;
        SoundList[Sounds.JoinConf].sndIdx  = Sounds.JoinConf;
        SoundList[Sounds.LeaveConf].sndIdx = Sounds.LeaveConf;
        SoundList[Sounds.EnterBtn].sndIdx  = Sounds.EnterBtn;
        SoundList[Sounds.Typing].sndIdx    = Sounds.Typing;
        SoundList[Sounds.ConfMsg].sndIdx   = Sounds.ConfMsg;
        SoundList[Sounds.DeleteAct].sndIdx = Sounds.DeleteAct;

        if (!isBrowser){
            SoundList[Sounds.BBS]        = document.getElementById("Sound_BBS");
            SoundList[Sounds.BBS].sndIdx = Sounds.BBS;
        }
    }

    init();
}