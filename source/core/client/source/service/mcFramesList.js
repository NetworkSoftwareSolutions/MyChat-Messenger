
function McFramesList() {
    var _list = {};
    var self  = this;
    var chatTextOutput = null;

    function createFrame(frame) {
        var element = null;

        if (window.mcService.isHtmlElement(frame) && frame.id){
            element = frame;
        } else

        if (window.mcService.isString(frame)){
            element = document.getElementById(frame) || document.createElement('div');

            element.className = "framePaddingР30x10";
            element.id = frame;
        } else {
            console.error("Can't create or find frame: ");
            console.error(frame);
        }

        if (element){
            element.show = function () { self.show(element.id) };
            element.hide = function () { self.hide(element.id) };

            _list[element.id] = element;

            chatTextOutput.appendChild(element);
        }

        return element;
    }

    function get (frame, noCreate) {
        return _list[frame] ? _list[frame] : (noCreate ? null : createFrame(frame));
    }

    this.get    = get;
    this.create = createFrame;

    this.clear  = function (_frame){
        var frame = get(_frame);

        if (frame) {
            frame.innerHTML = "";
        }
    };

    this.remove = function (_frame) {
        // var frame = get(isNaN(parseInt(_frame)) ? _frame : 'UID-' + _frame);
        var frame = get(_frame, true);

        if (frame) {
            if (_list[frame.id]) {
                delete _list[frame.id];
            }

            frame.parentElement.removeChild(frame);
        }
    };

    this.show = function (frame) {
        get(frame).style.display = 'block';
    };

    this.hide = function (frame) {
        get(frame).style.display = 'none';
    };

    this.hasFrame = function (frame) {
        return _list.hasOwnProperty(frame);
    };

    this.initView = function (view) {
        chatTextOutput = view;
    }
}