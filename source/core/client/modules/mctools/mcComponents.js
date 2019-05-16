 /**
 * Created by Gifer on 20.02.2017.
 */

 (function (root) {

     // Store setTimeout reference so promise-polyfill will be unaffected by
     // other code modifying setTimeout (like sinon.useFakeTimers())
     var setTimeoutFunc = setTimeout;

     function noop() {}

     // Polyfill for Function.prototype.bind
     function bind(fn, thisArg) {
         return function () {
             fn.apply(thisArg, arguments);
         };
     }

     function Promise(fn) {
         if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
         if (typeof fn !== 'function') throw new TypeError('not a function');
         this._state = 0;
         this._handled = false;
         this._value = undefined;
         this._deferreds = [];

         doResolve(fn, this);
     }

     function handle(self, deferred) {
         while (self._state === 3) {
             self = self._value;
         }
         if (self._state === 0) {
             self._deferreds.push(deferred);
             return;
         }
         self._handled = true;
         Promise._immediateFn(function () {
             var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
             if (cb === null) {
                 (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
                 return;
             }
             var ret;
             try {
                 ret = cb(self._value);
             } catch (e) {
                 reject(deferred.promise, e);
                 return;
             }
             resolve(deferred.promise, ret);
         });
     }

     function resolve(self, newValue) {
         try {
             // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
             if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
             if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
                 var then = newValue.then;
                 if (newValue instanceof Promise) {
                     self._state = 3;
                     self._value = newValue;
                     finale(self);
                     return;
                 } else if (typeof then === 'function') {
                     doResolve(bind(then, newValue), self);
                     return;
                 }
             }
             self._state = 1;
             self._value = newValue;
             finale(self);
         } catch (e) {
             reject(self, e);
         }
     }

     function reject(self, newValue) {
         self._state = 2;
         self._value = newValue;
         finale(self);
     }

     function finale(self) {
         if (self._state === 2 && self._deferreds.length === 0) {
             Promise._immediateFn(function() {
                 if (!self._handled) {
                     Promise._unhandledRejectionFn(self._value);
                 }
             });
         }

         for (var i = 0, len = self._deferreds.length; i < len; i++) {
             handle(self, self._deferreds[i]);
         }
         self._deferreds = null;
     }

     function Handler(onFulfilled, onRejected, promise) {
         this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
         this.onRejected = typeof onRejected === 'function' ? onRejected : null;
         this.promise = promise;
     }

     /**
      * Take a potentially misbehaving resolver function and make sure
      * onFulfilled and onRejected are only called once.
      *
      * Makes no guarantees about asynchrony.
      */
     function doResolve(fn, self) {
         var done = false;
         try {
             fn(function (value) {
                 if (done) return;
                 done = true;
                 resolve(self, value);
             }, function (reason) {
                 if (done) return;
                 done = true;
                 reject(self, reason);
             });
         } catch (ex) {
             if (done) return;
             done = true;
             reject(self, ex);
         }
     }

     Promise.prototype['catch'] = function (onRejected) {
         return this.then(null, onRejected);
     };

     Promise.prototype.then = function (onFulfilled, onRejected) {
         var prom = new (this.constructor)(noop);

         handle(this, new Handler(onFulfilled, onRejected, prom));
         return prom;
     };

     Promise.all = function (arr) {
         var args = Array.prototype.slice.call(arr);

         return new Promise(function (resolve, reject) {
             if (args.length === 0) return resolve([]);
             var remaining = args.length;

             function res(i, val) {
                 try {
                     if (val && (typeof val === 'object' || typeof val === 'function')) {
                         var then = val.then;
                         if (typeof then === 'function') {
                             then.call(val, function (val) {
                                 res(i, val);
                             }, reject);
                             return;
                         }
                     }
                     args[i] = val;
                     if (--remaining === 0) {
                         resolve(args);
                     }
                 } catch (ex) {
                     reject(ex);
                 }
             }

             for (var i = 0; i < args.length; i++) {
                 res(i, args[i]);
             }
         });
     };

     Promise.resolve = function (value) {
         if (value && typeof value === 'object' && value.constructor === Promise) {
             return value;
         }

         return new Promise(function (resolve) {
             resolve(value);
         });
     };

     Promise.reject = function (value) {
         return new Promise(function (resolve, reject) {
             reject(value);
         });
     };

     Promise.race = function (values) {
         return new Promise(function (resolve, reject) {
             for (var i = 0, len = values.length; i < len; i++) {
                 values[i].then(resolve, reject);
             }
         });
     };

     // Use polyfill for setImmediate for performance gains
     Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
         function (fn) {
             setTimeoutFunc(fn, 0);
         };

     Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
         if (typeof console !== 'undefined' && console) {
             console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
         }
     };

     /**
      * Set the immediate function to execute callbacks
      * @param fn {function} Function to execute
      * @deprecated
      */
     Promise._setImmediateFn = function _setImmediateFn(fn) {
         Promise._immediateFn = fn;
     };

     /**
      * Change the function to execute on unhandled rejection
      * @param {function} fn Function to execute on unhandled rejection
      * @deprecated
      */
     Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
         Promise._unhandledRejectionFn = fn;
     };

     if (typeof module !== 'undefined' && module.exports) {
         module.exports = Promise;
     } else if (!root.Promise) {
         root.Promise = Promise;
     }

 })(this);

 (function () {
     function _on(event, args) {
         if (Object.prototype.toString.call( event ) !== '[object String]'){
             console.error('[events.on] Event name must be string');
         } else
         if (eventList.hasOwnProperty(event)){
             //console.error('[events.on] Event %s already exist', event);

             eventList[event].push(args);
         } else {
             eventList[event] = [args];
         }
     }

     function _off(event) {
         if (eventList.hasOwnProperty(event)){
             delete eventList[event];
         } else {
             console.warn('[events.off] Unknown event: ' + event);
         }
     }

     function _broadcast(event, args, nolog) {
         var res = null;

         if (Object.prototype.toString.call( event ) !== '[object String]'){
             console.warn('[events.broadcast] Event name must be string');
         } else
         if (!eventList.hasOwnProperty(event)){
             if (!nolog) {
                 console.warn('[events.broadcast] Unknown event: ' + event);
             }
         } else {
             eventList[event].forEach(function (cb) {
                 res = cb.apply(null, [null, args]);
             });

             if (res) return res;
         }
     }

     function _http(url, callback) {
         var res;

         try{
             res = new Promise(function (resolve, reject) {
                 var _request = new XMLHttpRequest();

                 _request.open("GET", url);

                 _request.onreadystatechange=function(){
                     if (_request.readyState === 4) {
                         if (_request.status == 200) {
                             if (callback) {
                                 callback(_request.responseText);
                             }

                             resolve(_request.responseText);
                         } else {
                             // console.error(_request.statusText);

                             reject(_request.statusText);
                         }
                     }
                 };

                 _request.send(null);
             });

             res.success = res.then;
         } catch (e){
             console.error(e.message);
         }

         return res;
     }

     function changeLocation() { // info
         if ($location){
             $location.data = purl().data;

             $rootScope.$broadcast('onChangeHrefPath', [$location], true);
         }
     }

     var units      = [];
     var moduleList = {}; // Loaded Modules
     var eventList  = {}; // Event Emitter
     var $rootScope = {   // Global Scope
         '$on'  : _on,
         '$off' : _off,
         '$emit': _broadcast,
         '$broadcast': _broadcast,
         isWebClient : location.protocol !== 'file:'
     };
     var $location  = null;

     try {
         $location = purl();
     } catch (e){
         console.error(e.message);
     }

     window.mcComponents = {
         start: function () {
             units.forEach(function (unit) {
                 var selectScope = moduleList;

                 selectScope['$rootScope'] = $rootScope;
                 selectScope['$http']      = _http;
                 selectScope['$location']  = $location;
                 selectScope['$scope']     = { // Local Scope
                     '$on': _on,
                     '$off': _off,
                     '$emit': _broadcast,
                     '$broadcast': _broadcast
                 };

                 try {
                     moduleList[unit.module] = new (Function.prototype.bind.apply(window[unit.module], [null].concat(unit.args.map(function (item) {
                         return selectScope[item];
                     }))));
                 } catch (e){
                     console.error(e);
                 }

                 selectScope = null;
             });

             return this;
         },
         units: function (items) {
             units = Object.prototype.toString.call( items ) === '[object Array]' ? items : [];

             return this;
         },
         _broadcast: _broadcast
     };

     (function(eventInfo){
         window[eventInfo[0]](eventInfo[1] + 'popstate', changeLocation, false);
     })(window.addEventListener ? ['addEventListener', ''] : ['attachEvent', 'on']);
 })();

 var _messages_ = {};

