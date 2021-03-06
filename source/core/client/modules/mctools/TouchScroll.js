/*
 * TouchScroll - using dom overflow:scroll
 * by kmturley
 */

/*globals window, document */

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var TouchScroll = function () {
    'use strict';

    var module = {
        axis: 'x',
        drag: false,
        zoom: 1,
        time: 0.04,
        isIE: window.navigator.userAgent.toLowerCase().indexOf('msie') > -1,
        isFirefox: window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
        /**
         * @method init
         */
        init: function (options) {
            var me = this;
            this.options = options;
            
            // find target element or fall back to body
            if (options && options.id) {
                this.el = document.getElementById(options.id);
            }
            if (!this.el) {
                if (this.isIE || this.isFirefox) {
                    this.el = document.documentElement;
                } else {
                    this.el = document.body;
                }
            }

            // if draggable option is enabled add events
            if (options.draggable === true) {
                if (this.isIE) {
                    document.ondragstart = function () { return false; };
                }
                if (this.isIE || this.isFirefox) {
                    this.body = document.documentElement;
                } else {
                    this.body = document.body;
                }
                this.addEvent('touchstart', this.el, function (e) { me.onMouseDown(e); });
                this.addEvent('touchmove', this.el, function (e) { me.onMouseMove(e); });
                this.addEvent('touchend', this.body, function (e) { me.onMouseUp(e); });
            }
            
            // if zoom option exists add mouse wheel functionality to element
            if (options && options.zoom) {
                this.elzoom = document.getElementById(options.zoom);
                if (this.isFirefox) {
                    this.addEvent('DOMMouseScroll', this.el, function (e) { me.onMouseWheel(e); });
                } else {
                    this.addEvent('mousewheel', this.el, function (e) { me.onMouseWheel(e); });
                }
            }
            
            // if scroll options exist add events
            if (options && options.prev) {
                this.prev = document.getElementById(options.prev);
                this.addEvent('touchstart', this.prev, function (e) {
                    me.onMouseDown(e);
                });
                this.addEvent('touchend', this.prev, function (e) {
                    me.diffx = options.distance ? (-options.distance / 11) : -11;
                    me.onMouseUp(e);
                });
            }
            if (options && options.next) {
                this.next = document.getElementById(options.next);
                this.addEvent('touchstart', this.next, function (e) {
                    me.onMouseDown(e);
                });
                this.addEvent('touchend', this.next, function (e) {
                    me.diffx = options.distance ? (options.distance / 11) : 11;
                    me.onMouseUp(e);
                });
            }
        },
        /**
         * @method addEvent
         */
        addEvent: function (name, el, func) {
            if (el.addEventListener) {
                el.addEventListener(name, func, false);
            } else if (el.attachEvent) {
                el.attachEvent('on' + name, func);
            } else {
                el[name] = func;
            }
        },
        /**
         * @method cancelEvent
         */
        cancelEvent: function (e) {
            if (!e) { e = window.event; }
            if (e.target && e.target.nodeName === 'IMG') {
                e.preventDefault();
            } else if (e.srcElement && e.srcElement.nodeName === 'IMG') {
                e.returnValue = false;
            }
        },
        /**
         * @method onMouseDown
         */
        onMouseDown: function (e) {
            if (this.drag === false || this.options.wait === false) {
                var touched = event.touches[0] ? event.touches[0] : event;

                this.drag = true;
                this.cancelEvent(e);
                this.startx = touched.clientX + this.el.scrollLeft;
                this.starty = touched.clientY + this.el.scrollTop;
                this.diffx = 0;
                this.diffy = 0;
            }
        },
        /**
         * @method onMouseMove
         */
        onMouseMove: function (e) {
            if (this.drag === true) {
                var touched = event.touches[0] ? event.touches[0] : event;

                this.cancelEvent(e);
                this.diffx = (this.startx - (touched.clientX + this.el.scrollLeft));
                this.diffy = (this.starty - (touched.clientY + this.el.scrollTop));
                //this.el.scrollLeft += this.diffx;
                this.el.scrollTop += this.diffy;
            }
        },
        /**
         * @method onMouseMove
         */
        onMouseUp: function (e) {
            if (this.drag === true) {
                if (!this.options.wait) {
                    this.drag = null;
                }
                this.cancelEvent(e);
                var me = this,
                    start = 1,
                    animate = function () {
                        var step = Math.sin(start);
                        if (step <= 0) {
                            me.diffx = 0;
                            me.diffy = 0;
                            window.cancelAnimationFrame(animate);
                            me.drag = false;
                        } else {
                            me.el.scrollLeft += me.diffx * step;
                            me.el.scrollTop += me.diffy * step;
                            start -= me.time;
                            window.requestAnimationFrame(animate);
                        }
                    };
                animate();
            }
        },
        /**
         * @method onMouseMove
         */
        onMouseWheel: function (e) {
            this.cancelEvent(e);
            if (e.detail) {
                this.zoom -= e.detail;
            } else {
                this.zoom += (e.wheelDelta / 1200);
            }
            if (this.zoom < 1) {
                this.zoom = 1;
            } else if (this.zoom > 10) {
                this.zoom = 10;
            }
            /*
            this.elzoom.style.OTransform = 'scale(' + this.zoom + ', ' + this.zoom + ')';
            this.elzoom.style.MozTransform = 'scale(' + this.zoom + ', ' + this.zoom + ')';
            this.elzoom.style.msTransform = 'scale(' + this.zoom + ', ' + this.zoom + ')';
            this.elzoom.style.WebkitTransform = 'scale(' + this.zoom + ', ' + this.zoom + ')';
            this.elzoom.style.transform = 'scale(' + this.zoom + ', ' + this.zoom + ')';
            */
            this.elzoom.style.zoom = this.zoom * 100 + '%';
            //this.el.scrollLeft += e.wheelDelta / 10;
            //this.el.scrollTop += e.wheelDelta / 8;
        }
    };
    return module;
};