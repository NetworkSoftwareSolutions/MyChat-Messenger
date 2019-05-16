
function Create_cPanel(mediaCall, video, share, videoContainer) {
    function _Timer (_target){
        function getTime(Now) {
            var ss = Now % 60;
            var hh = parseInt(Now / 3600);
            var nn = parseInt(Now / 60) - (hh * 60);

            return ((hh < 10) ? ("0" + hh) : hh) + ":" + ((nn < 10) ? ("0" + nn) : nn) + ":" + ((ss < 10) ? ("0" + ss) : ss);
        }

        var Now = 0;
        var id  = null;

        this.Start = function(){
            id = setInterval(function(){
                _target.innerText = getTime(Now++);
            }, 1000);
        };

        this.Stop = function(){
            clearInterval(id);

            console.log('Stop timer, Now: ' + Now);

            return Now || 0;
        };
    }

    function showPanel() {
        if (panelShowed){
            clearTimeout(hideTimer);

            hideTimer = setTimeout(function () {
                panelShowed = false;
                hideTimer   = null;

                _fade.out();
            }, 4000);
        } else {
            _fade.in();

            panelShowed = true;
        }
    }

    var Self        = this;
    var isFit       = false;
    var isMax       = false;
    var panelShowed = false;
    var hideTimer   = null;
    var _cPanel     = document.createElement("div");
    var mediaTimer  = null;
    var controls    = {
        cameraSwitch     : document.createElement("span"),
        microphoneSwitch : document.createElement("span"),
        cancelCall       : document.createElement("span"),
        fillFitScreen    : document.createElement("span"),
        minMaxScreen     : document.createElement("span"),
        callTime         : document.createElement("div"),
    };
    var _fade       = new mcService.FadeControl(_cPanel);

    _cPanel.id                   = "cPanel";
    controls.cameraSwitch    .id = "cameraSwitch";
    controls.microphoneSwitch.id = "microphoneSwitch";
    controls.cancelCall      .id = "cancelCall";
    controls.fillFitScreen   .id = "fillFitScreen";
    controls.minMaxScreen    .id = "minMaxScreen";
    controls.callTime        .id = "callTime";

    controls.cameraSwitch .style.display = video ? "inline-block" : "none";
    controls.fillFitScreen.style.display = share ? "inline-block" : "none";
    controls.minMaxScreen .style.display = video || share ? "inline-block" : "none";
    controls.callTime     .innerText     = "00:00:00";

    _cPanel.appendChild(controls.cameraSwitch);
    _cPanel.appendChild(controls.microphoneSwitch);
    _cPanel.appendChild(controls.fillFitScreen);
    _cPanel.appendChild(controls.minMaxScreen);
    _cPanel.appendChild(controls.cancelCall);
    _cPanel.appendChild(controls.callTime);


    // ------------------------

    controls.cameraSwitch.addEventListener('click', function(){
        if (mediaCall.switchCamera()){
            controls.cameraSwitch.className = "";
        } else {
            controls.cameraSwitch.className = "cameraSwitchOFF";
        }
    });

    controls.microphoneSwitch.addEventListener('click', function(){
        if (mediaCall.switchMicrophone()) {
            controls.microphoneSwitch.className = "";
        } else {
            controls.microphoneSwitch.className = "microphoneSwitchOFF";
        }
    });

    controls.fillFitScreen.addEventListener('click', function(){
        if (Self.fitFill) Self.fitFill(isFit, videoContainer);

        controls.fillFitScreen.className = isFit ? "" : "fillFitScreenOFF";

        isFit = !isFit;
    });

    controls.minMaxScreen.addEventListener('click', function () {
        if (Self.minMax) Self.minMax(isMax);

        isMax = !isMax;
    });

    controls.cancelCall.addEventListener('click', function () {
        if (Self.closeCall) Self.closeCall();
    });

    // --------------------------------

    this.body      = _cPanel;
    this.closeCall = null;
    this.minMax    = null;
    this.fitFill   = null;

    this.init = function (parent) {
        if (parent){
            parent.appendChild(_cPanel);
        }

        mediaTimer = new _Timer(controls.callTime);
    };

    this.show = function () {
        _cPanel.className    += "whitePanelBG";
        _cPanel.style.opacity = 1;

        panelShowed = true;

        showPanel();

        mediaTimer.Start();
    };

    this.onmousemove = showPanel;

    this.destructor = function () {
        if (_cPanel){
            _cPanel.innerHTML = "";

            if (_cPanel.parentNode) {
                _cPanel.parentNode.removeChild(_cPanel);
            }

            _cPanel = null;
        }

        if (mediaTimer) {
            mediaTimer.Stop();
            mediaTimer = null;
        }
    };
}