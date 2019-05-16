 /**
 * Created by Gifer on 28.01.2016.
 */

 "use strict";

 function MediaCall(){
     var Self      = this;
     var myStream  = null;
     var pcList    = {};
     var pcStreams = {};
     var calleeUIN = null;
     var failTimer = null;
     var pc        = null;
     var mirrorContainer = null;
     var calleeContainer = null;
     var devices   = {

     };
     var iceRestart= false;
     var isWeb     = location.protocol !== "file:";
     var isMyCall  = false;

     var configuration  = {
         iceTransportPolicy : "all",
         iceTransport : "all",
         iceServers : []
     };
     var streamBackup   = null;
     var streamAssigned = false;

     // ===========================================================

     this.onFailedInit  = null;
     this.onError       = null;
     this.sendAnswer    = null;
     this.sendOffer     = null;
     this.sendCandidate = null;
     this.showMedia     = null;
     this.iceClosed     = null;

     this.restoreCall   = false;
     this.useVideo      = false;
     this.MID           = null;
     this.initFailTime  = 95000;
     this.Share         = false;
     this.receiveScreen = false;

     // ===========================================================

     function isArray(obj){
         return Object.prototype.toString.call( obj ) === '[object Array]';
     }

     function isObject(obj) {
         return Object.prototype.toString.call( obj ) === '[object Object]';
     }

     function onIceStateChange(pc) { // event
         if (pc) {
             if ( pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
                 pc.getStats(null).then(function(results) {
                     // figure out the peer's ip
                     var activeCandidatePair = null;
                     var remoteCandidate = null;

                     // search for the candidate pair
                     Object.keys(results).forEach(function(result) {
                         var report = results[result];

                         if (report.type === 'candidatepair' && report.selected || report.type === 'googCandidatePair' &&
                             report.googActiveConnection === 'true') {
                             activeCandidatePair = report;
                         }
                     });

                     if (activeCandidatePair && activeCandidatePair.remoteCandidateId) {
                         Object.keys(results).forEach(function(result) {
                             var report = results[result];

                             if (report.type === 'remotecandidate' && report.id === activeCandidatePair.remoteCandidateId) {
                                 remoteCandidate = report;
                             }
                         });
                     }

                     if (remoteCandidate && remoteCandidate.ipAddress && remoteCandidate.portNumber) {
                         console.log('[onIceStateChange]: Remote address changed to ' + remoteCandidate.ipAddress + ":" + remoteCandidate.portNumber);
                     }
                 });
             }
         }
     }
     
     function assignStream(callee) {
         if (streamBackup && streamBackup.stream){
             var videoContainer = calleeContainer || document.createElement('video');

             videoContainer.className = "VideoCaller";
             videoContainer.autoplay  = true;
             videoContainer.srcObject = streamBackup.stream;

             pcStreams[callee] = videoContainer;

             streamAssigned = true;
         }

         console.log('AssignStream iceConnectionState: ' + pc.iceConnectionState);
         console.log(streamBackup);
     }

     function startCall(callee, sdp) {
         var createOffer = !sdp;

         pc = pcList[callee] || new RTCPeerConnection(configuration);

         console.log(JSON.stringify(configuration));

         if (!pcList[callee]) {
             pcList[callee] = pc;

             pc.oniceconnectionstatechange = function(evt) {
                 console.log("ICE connection state change: " + evt.target.iceConnectionState);

                 if (pc.iceConnectionState === 'disconnected') {
                     iceRestart = Self.restoreCall;
                 } else
                 if (pc.iceConnectionState === 'closed' && Self.iceClosed) {
                     Self.iceClosed();
                 } else

                 if (pc.iceConnectionState === 'failed'){
                     iceRestart = Self.restoreCall;

                     if (!Self.restoreCall) {
                         runError('Error: ICE Connection State FAILED!', 1);
                     }
                 } else

                 if ((pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') && Self.showMedia){
                     clearTimeout(failTimer);

                     onIceStateChange(pc, evt);

                     if (!iceRestart) {
                         Self.showMedia.apply(null, [pcStreams[callee]])
                     }

                     iceRestart = false;

                     if (!streamAssigned){
                         assignStream(callee);
                     }
                 }

                 if (iceRestart) {
                     setTimeout(function () {
                         startCall(callee);
                     }, 500);
                 }
             };

             pc.onicecandidateerror = function(err){
                 runError('OnIceCandidateError: ' + JSON.stringify(err), 1);
             };

             pc.onicecandidate = function (evt) { // send any ice candidates to the other peer
                 //console.log("ICE gathering state change: " + evt.target.iceGatheringState);

                 if (evt.candidate) {
                     console.log("OUTGOING ICE: " + evt.candidate.candidate);

                     Self.sendCandidate(callee, Self.MID, JSON.stringify(evt.candidate));
                 }
             };

             pc.onaddstream = function (evt) {
                 streamBackup = evt;

                 console.log('Get Remote Stream complete!');
             };

             // pc.ontrack = function (evt) {
             //     console.log(evt);
             // };

             if (Self.useVideo){
                 if (Object.prototype.toString.call( mirrorContainer ) === '[object String]'){
                     mirrorContainer = document.getElementById(mirrorContainer);
                 }

                 if (['[object HTMLVideoElement]', '[object HTMLAudioElement]'].indexOf(Object.prototype.toString.call( mirrorContainer )) === -1){
                     // console.error('\"mirrorContainer\" is not a HTML element!');

                     Self.hangUp('\"mirrorContainer\" is not a HTML element!');

                     return false;
                 } else
                 if (myStream){
                     mirrorContainer.srcObject = myStream;
                 }
             }

             if (myStream) pc.addStream(myStream);
         }

         console.log("ICE  GatheringState: " + pc.iceGatheringState);
         console.log("ICE ConnectionState: " + pc.iceConnectionState);

         if (createOffer){
             pc.createOffer({
                 offerToReceiveAudio: 1,
                 offerToReceiveVideo: 1,
                 iceRestart         : iceRestart
             }).then( function (desc) {
                 pc.setLocalDescription(desc);

                 Self.sendOffer(callee, Self.MID, JSON.stringify(desc));
             }, function(err){
                 Self.hangUp('CreateOffer: ' + JSON.stringify(err));
                 // runError('CreateOffer: ' + JSON.stringify(err), 1);
             });

         } else {
             if (!isObject(sdp)){
                 sdp = JSON.parse(sdp);
             }

             pc.setRemoteDescription(new RTCSessionDescription(sdp));

             pc.createAnswer(function (desc) {
                 pc.setLocalDescription(desc);

                 Self.sendAnswer(callee, Self.MID, JSON.stringify(desc));
             }, function(err){
                 Self.hangUp('CreateAnswer: ' + JSON.stringify(err));
                 // runError('CreateAnswer: ' + JSON.stringify(err), 1);
             });
         }

         return pc;
     }

     function runError(){
         clearTimeout(failTimer);

         if (Self.onError){
             Self.onError.apply(null, arguments);
         }
     }

     function getScreen(nextStep) {
         if (!isWeb && !Self.useVideo) {
             navigator.getUserMedia({
                 audio : false,
                 video : {
                     mandatory: {
                         chromeMediaSource  : 'desktop',
                         chromeMediaSourceId: "screen:0:0",
                         minWidth           : 160,
                         minHeight          : 120,
                         maxWidth           : 1920,
                         maxHeight          : 1080,
                         minFrameRate       : 5,
                         maxFrameRate       : 15
                     }
                 }
             }, function successGetMedia(screenStream) {
                 var shareStream = screenStream.getVideoTracks()[0];

                 if (!myStream) {
                     myStream = screenStream;
                 } else {
                     myStream.addTrack(shareStream);
                 }

                 shareStream.enabled = Self.Share;

                 nextStep();
             }, function errorGetMedia(err){
                 console.warn('Error getting screen stream: ' + JSON.stringify(err));

                 if (myStream){
                     nextStep();
                 } else {
                     Self.hangUp("No media devices");
                 }
             });
         } else {
             if (myStream){
                 nextStep();
             } else {
                 Self.hangUp("No media devices");
             }
         }
     }

     function GetMedia(cb){
         if (!myStream){
             var opt = {
                 "audio": {
                     optional: [].concat(devices && devices.microphone ? {sourceId: devices.microphone} : [])
                 },
                 "video": Self.useVideo ? {
                     mandatory: {
                         minWidth: 160,
                         maxWidth: 1280,
                         minHeight: 120,
                         maxHeight: 720,
                         minAspectRatio: 4/3,
                         maxAspectRatio: 16/9,
                         minFrameRate: 10,
                         maxFrameRate: 50
                     },
                     optional: [].concat(Self.useVideo && devices.camera ? { sourceId: devices.camera } : [])
                 } : false
             };

             console.log('GetMedia config: ' + JSON.stringify(opt));

             failTimer = setTimeout(function () {
                 if (Self.onFailedInit){
                     Self.onFailedInit();
                 }

                 failTimer = null;

                 GetMedia(cb);
             }, Self.initFailTime);

             navigator.getUserMedia(opt, function successGetMedia(stream) {
                 console.log('getUserMedia: Media stream get successfully');

                 myStream = stream;

                 if (!myStream){
                     console.warn('Getting empty stream!');
                 }

                 getScreen(cb);
             }, function errorGetMedia(err){
                 myStream = null;

                 if (err.name === "NotFoundError" && Self.Share){
                     getScreen(cb);
                 } else
                 if (isMyCall){
                     Self.hangUp('Error getting media stream: ' + JSON.stringify(err));
                 } else {
                     cb();
                 }
             })
         } else {
             cb();
         }
     }

     // ===========================================================

     this.addIceServers = function (srv, iceTransportPolicy){
         configuration.iceServers         = srv || [];
         configuration.iceTransportPolicy = iceTransportPolicy || "all";
         configuration.iceTransport       = iceTransportPolicy || "all";
     };

     this.setDevices = function (microphome, camera, sound) {
         if (isObject(microphome)){
             devices = {
                 microphone : microphome.microphome,
                 camera     : microphome.camera,
                 sound      : microphome.sound
             };
         } else {
             devices = {
                 microphone : microphome,
                 camera     : camera,
                 sound      : sound
             };
         }

         console.log("DEVICES:" + JSON.stringify(devices));
     };

     this.setMirror     = function (target){
         mirrorContainer = target;
     };

     this.setCallee     = function (target){
         if (Object.prototype.toString.call( target ) === '[object String]'){
             calleeContainer = document.getElementById(target);
         } else {
             calleeContainer = target;
         }

         if (['[object HTMLVideoElement]', '[object HTMLAudioElement]'].indexOf(Object.prototype.toString.call( calleeContainer )) === -1){
             // console.error('\"calleeContainer\" is not a HTML element!'); // todo: fucking shit error

             Self.hangUp('\"calleeContainer\" is not a HTML element!');
         }
     };

     this.recvAnswer    = function (data){
         console.log('RECEIVE ANSWER');

         if (!isObject(data.SDP)){
             data.SDP = JSON.parse(data.SDP);
         }

         if (pcList[data.UIN] && pcList[data.UIN].setRemoteDescription){
             pcList[data.UIN].setRemoteDescription(new RTCSessionDescription(data.SDP));
         } else {
             Self.hangUp('error in "RECEIVE ANSWER"');
         }
     };

     this.recvOffer     = function (data){
         console.log('RECEIVE OFFER');

         isMyCall = false;

         GetMedia(function(){
             startCall(data.UIN, data.SDP);
         });
     };

     this.recvCandidate = function (data){
         console.log('RECEIVE CANDIDATE');

         if (pcList[data.UIN] && pcList[data.UIN].addIceCandidate) {
             if (!isObject(data.CANDIDATE)){
                 data.CANDIDATE = JSON.parse(data.CANDIDATE);
             }

             pcList[data.UIN].addIceCandidate(new RTCIceCandidate(data.CANDIDATE));
         }

         console.log("INCOMING ICE:" + JSON.stringify(data.CANDIDATE));
     };

     this.recvReady     = function (list){
         console.log('RECEIVE READY');

         pc = null;

         calleeUIN = list || calleeUIN;

         if (calleeUIN){
             isMyCall = true;

             GetMedia(function(){
                 if (calleeUIN){
                     if (!isArray(calleeUIN)){
                         calleeUIN = calleeUIN.toString().split(',');
                     }

                     calleeUIN.forEach(function(uin){
                         startCall(uin);
                     });
                 }
             });
         }
     };

     this.restartIceNow = function () {
         iceRestart = true;

         startCall(isArray(calleeUIN) ? calleeUIN[0] : calleeUIN);
     };

     this.CallToUser    = function (uin){
         calleeUIN = uin;
     };

     this.switchCamera  = function () {
         var stream = myStream ? myStream.getVideoTracks() : [];

         if (stream.length) {
             stream[0].enabled = !stream[0].enabled;
         }

         return stream && stream[0] ? stream[0].enabled : false;
     };

     this.switchMicrophone = function () {
         var stream = myStream ? myStream.getAudioTracks() : [];

         if (stream.length) {
             stream[0].enabled = !stream[0].enabled;
         }

         return stream && stream[0] ? stream[0].enabled : false;
     };

     this.hangUp        = function (error){
         console.log('Hang Up Call');

         if (myStream) {
             try {
                 mirrorContainer.pause();
                 mirrorContainer.srcObject = null;
             } catch (e){}

             if (myStream.getTracks) myStream.getTracks().forEach(function(track){
                 track.stop();
             });
         } else {
             if (Self.iceClosed) {
                 Self.iceClosed();
             }
         }

         for (var i in pcStreams){
         }

         try {
             pcStreams[i].pause();
             pcStreams[i].srcObject.getTracks().forEach(function(track){
                 track.stop();
             });
         } catch (e){}

         for (var i in pcList){
             pcList[i].close();
             pcList[i] = null;
         }

         pcList    = {};
         pcStreams = {};
         myStream  = null;
         calleeUIN = null;
         Self.MID  = null;

         streamBackup   = null;
         streamAssigned = false;


         clearTimeout(failTimer);
         failTimer = null;

         if (error){
             runError(error);
         }

         isMyCall = false;
     };
 }
