"use strict";

var MC_DEVELOP = 'Develop';
var MC_RELEASE = 'Release';

// var webix_strict = true;
var loadProjectType = MC_DEVELOP; // MC_RELEASE
var _gLock = {};

function getElementByClass(classList, _node) {
    var res = null;
    var node = _node || document;

    if (document.getElementsByClassName) {
        res = node.getElementsByClassName(classList)
    } else {
        var list = node.getElementsByTagName('*');
        var length = list.length;
        var classArray = classList.split(/\s+/);
        var classes = classArray.length;
        var result = [];

        for (var i = 0; i < length; i++) {
            for (var j = 0; j < classes; j++) {
                if (list[i].className.search('\\b' + classArray[j] + '\\b') != -1) {
                    result.push(list[i]);

                    break
                }
            }
        }

        res = result;
    }

    return res;
}

window.mcWidgets = {};

function isIE() {
    //return '\v'=='v';

    var tmp = document.documentMode, _isIE;

    // Try to force this property to be a string.
    try {
        document.documentMode = "";
    }
    catch (e) {
    }

    // If document.documentMode is a number, then it is a read-only property, and so
    // we have IE 8+.
    // Otherwise, if conditional compilation works, then we have IE < 11.
    // Otherwise, we have a non-IE browser.
    _isIE = typeof document.documentMode === "number" || eval("/*@cc_on!@*/!1");

    // Switch back the value to be unobtrusive for non-IE browsers.
    try {
        document.documentMode = tmp;
    }
    catch (e) {
    }

    return _isIE;
}

(function() {

    function TaskList() {
        var self = this;
        var list = [];
        var scope = {};

        this.AddTask = function (task) {
            list.push(task);
        };

        this.Next = function () {
            if (list[0]) {
                list.shift().apply(self, scope);
            } else {
                self = null;
            }
        };

        this.Run = function () {
            this.length = list.length;

            self.Next();
        };

        scope = {
            next: self.Next,
            Next: self.Next
        };
    }

    function loadSource(url, callback) { // Load Source
        function displayError(url) {
            var parentElem = document.body;//getElementsByTagName("body");
            var newDiv = document.createElement('div');

            newDiv.innerHTML = "<span style='color: rgba(229, 0, 0, 0.85); text-shadow: 1px 1px 2px rgba(233, 247, 136, 0.67); margin: 10px; font-family: arial, sans-serif;font-size: 1.4em; font-weight: bolder'>Error loading URL: " + url + "</span>";

            parentElem.appendChild(newDiv);

        }

        var script = document.createElement("script");
        var self = this;

        script.type = "text/javascript";

        if (script.readyState) {  //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" ||
                    script.readyState == "complete") {
                    script.onreadystatechange = null;

                    if (callback) callback.apply(self);
                } else if (script.readyState != "loading") {
                    //console.error("Error loading url: " + url);
                    displayError(url);
                }
            };
        } else {  //Others
            script.onload = function () {
                if (callback) callback.apply(self);
            };

            script.onerror = function () {
                displayError(url);
                //console.error("Error loading url: " + url);
            }
        }

        script.src = loadProjectType === MC_RELEASE ? url.replace("_debug", "") : url;

        var header = document.getElementsByTagName("head");

        header[header.length - 1].appendChild(script); //getElementsByTagName("head")[0]
    }


    if (window.old_IE) {
        var parentElem = document.body;//getElementsByTagName("body");
        var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

        width = parseInt(width / 2) - 240;

        var newDiv = document.createElement('div');
        newDiv.innerHTML =
            '<div class="webix_modal_box webix_confirm" style="width: 480px; top: 199px; left: ' + width + 'px; z-index: 99999; border: 1px solid red">' +
            '<span class="red"><br>' +
            'MyChat Server Control Panel needs Internet Explorer 10 or newer<br><br>' +
            '<a href="https://www.google.com/chrome/browser/desktop/index.html" target="_blank">Download Chrome</a><br><br>' +
            '<a href="https://www.mozilla.org" target="_blank">Download Firefox</a>' +
            '</span><br><br></div>';

        parentElem.appendChild(newDiv);
    } else {
        setTimeout(function(){
            var req = new XMLHttpRequest();

            req.open('GET', document.location, true);
            req.send(null);

            req.onreadystatechange = function(){
                if(this.readyState == this.HEADERS_RECEIVED) {
                    if (getElementByClass('mcIco').length){
                        var ver = req.getResponseHeader("MyChat-version");

                        if (ver) {
                            getElementByClass('mcIco')[0].innerHTML = 'ver ' + ver;
                            window.mcVersion = req.getResponseHeader("MyChat-version");
                        }
                    }
                }
            };
        }, 0);

        if (isIE()) {
            var res = getElementByClass('ieNoSelect');

            for (var i in res) {
                res[i].onselectstart = function (e) {
                    if (e.target.nodeName != "INPUT" && e.target.nodeName != "TEXTAREA") {
                        e.preventDefault();
                        return false;
                    }

                    return true;
                };
            }
        }

        var task = new TaskList();

        var _next = function () {
            window.mcLoader.progress += 100 / this.length;

            window.mcLoader.indicator.innerHTML = "Loading&nbsp;" + parseInt(window.mcLoader.progress) + "%";
            window.mcLoader.indicator.style.width = window.mcLoader.progress + "%";

            task.Next();
        };

        window.mcLoader.indicator.style.display = "inline-block";

        loadSource(window.mcLoader.source || "source.js", function () {
            function _load_resource(res, count){
                for (var item = 0; item < count; item++) {
                    (function (_item) {
                        task.AddTask(function () {
                            loadSource.apply(this, [res[_item], _next])
                        });
                    })(item);
                }
            }

            _gLock = MC_RESOURCE.LockSettings || {};

            _load_resource(MC_RESOURCE.Frameworks, MC_RESOURCE.Frameworks.length);

            _load_resource(MC_RESOURCE[loadProjectType], MC_RESOURCE[loadProjectType].length - 1);

            task.AddTask(function () {
                loadSource.apply(this, [MC_RESOURCE[loadProjectType][MC_RESOURCE[loadProjectType].length - 1], function () {
                    window.mcLoader.label.parentNode.removeChild(window.mcLoader.label);
                    window.mcLoader = null;
                }])
            });

            task.Run();
        });
    }
})();

