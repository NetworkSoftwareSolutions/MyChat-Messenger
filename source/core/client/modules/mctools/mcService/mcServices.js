'use strict';

function servicesController(_api) {
    var hexCodes = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
    var imgIndex = 1;

    var serviceList = {
        ModalTimer : null,
        noNotify   : false,
        notify     : null,
        idNotify   : 0,

        /**
         * @return {string}
         */
        insertIco : function(ico, css){
            return "<span class='webix_icon " + ico + " " + (css || "fa-lg") + "'></span>"
        },

        /**
         * @return {boolean}
         */
        checkRights: function(id){
            var res = false;

            id = parseInt(id);

            if (!isNaN(id)){
                res = mcConst.MyRightsSet[id - 1];
            }

            return res;
        },

        /**
         * @return {boolean}
         */
        isPlainObject : function(obj) {
            var res = false;

            if (!obj || !serviceList.isObject(obj) || obj.nodeType || obj.setInterval){
                res = false;
            } else
            if (obj.constructor && !obj['constructor'] && !obj.constructor['isPrototypeOf']){
                res = false;
            } else {
                var key;
                
                for ( key in obj ) {}

                res = key === undefined || !!obj[key];
            }

            return res;
        },

        /**
         * @return {object}
         */
        oldMarge : function () {
            var options, name, src, copy, copyIsArray, clone,
                target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false;

            // Handle a deep copy situation
            if ( typeof target === "boolean" ) {
                deep = target;
                target = arguments[1] || {};
                // skip the boolean and the target
                i = 2;
            }

            // Handle case when target is a string or something (possible in deep copy)
            if ( typeof target !== "object" && typeof target !== "function") {
                target = {};
            }

            // extend jQuery itself if only one argument is passed
            // if ( length === i ) {
            //     target = this;
            //     --i;
            // }

            for ( ; i < length; i++ ) {
                // Only deal with non-null/undefined values
                if ( (options = arguments[ i ]) !== null ) {
                    // Extend the base object
                    for ( name in options ) {
                        src  = target [ name ];
                        copy = options[ name ];

                        // Prevent never-ending loop
                        if ( target === copy ) {
                            continue;
                        }

                        // Recurse if we're merging plain objects or arrays
                        if ( deep && copy && ( serviceList.isPlainObject(copy) || (copyIsArray = serviceList.isArray(copy)) ) ) {
                            if ( copyIsArray ) {
                                copyIsArray = false;
                                clone = src && serviceList.isArray(src) ? src : [];
                            } else {
                                clone = src && serviceList.isPlainObject(src) ? src : {};
                            }

                            // Never move original objects, clone them
                            target[ name ] = serviceList.oldMarge( deep, clone, copy );

                            // Don't bring in undefined values
                        } else if ( copy !== undefined ) {
                            target[ name ] = copy;
                        }
                    }
                }
            }

            // Return the modified object
            return target;
        },

        /**
         * @return {object}
         */
        Marge : function Marge() {
            if (serviceList.isIE()){
                return serviceList.oldMarge.apply(null, arguments);
            } else {
                if (!Object.assign) {
                    Object.defineProperty(Object, 'assign', {
                        enumerable  : false,
                        configurable: true,
                        writable    : true,
                        value       : function(target, firstSource) {
                            'use strict';

                            if (target === undefined || target === null) {
                                throw new TypeError('Cannot convert first argument to object');
                            }

                            var to = Object(target);

                            for (var i = 1; i < arguments.length; i++) {
                                var nextSource = arguments[i];

                                if (nextSource === undefined || nextSource === null) {
                                    continue;
                                }

                                var keysArray = Object.keys(Object(nextSource));

                                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                                    var nextKey = keysArray[nextIndex];
                                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);

                                    if (desc !== undefined && desc.enumerable) {
                                        to[nextKey] = nextSource[nextKey];
                                    }
                                }
                            }

                            return to;
                        }
                    });
                }

                return Object.assign.apply(null, arguments);
            }
        },

        /**
         * @return {object}
         */
        deepExtend : function(out) {
            out = out || {};

            for (var i = 1; i < arguments.length; i++) {
                var obj = arguments[i];

                if (!obj)
                    continue;

                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (typeof obj[key] === 'object')
                            out[key] = serviceList.deepExtend(out[key], obj[key]);
                        else
                            out[key] = obj[key];
                    }
                }
            }

            return out;
        },

        /**
         * @return {boolean}
         */
        RGBToHex : function (color) {
            var res = false;

            if (color) {
                if (color.substr(0, 1) === '#') {
                    res = color;
                } else {
                    var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);

                    var red = parseInt(digits[2]);
                    var green = parseInt(digits[3]);
                    var blue = parseInt(digits[4]);

                    var rgb = blue | (green << 8) | (red << 16);

                    res = digits[1] + '#' + rgb.toString(16);
                }
            }

            return res;
        },

        /**
         * @return {boolean}
         */
        IntToBool : function (Int){
            return serviceList.isBoolean(val) ? val : val == '1';
        },

        /**
         * @return {number}
         */
        BoolToIntEx : function (b){
            return (b === true) ? 0 : -1;
        },

        /**
         * @return {boolean}
         */
        isIE : function (){
            //return '\v'=='v';

            var tmp = document.documentMode, _isIE;

            // Try to force this property to be a string.
            try {
                document.documentMode = "";
            } catch(e){ }

            // If document.documentMode is a number, then it is a read-only property, and so
            // we have IE 8+.
            // Otherwise, if conditional compilation works, then we have IE < 11.
            // Otherwise, we have a non-IE browser.
            _isIE = typeof document.documentMode === "number" || eval("/*@cc_on!@*/!1");

            // Switch back the value to be unobtrusive for non-IE browsers.
            try{document.documentMode = tmp;}
            catch(e){ }

            return _isIE;
        },

        /**
         * @return {boolean}
         */
        isIE6 : function (){
            var gg = navigator['appVersion'];
            var ggg = gg.indexOf("MSIE");
            var gggg = gg.slice(ggg + 5, ggg + 6);

            return gggg === "6";
        },

        /**
         * @return {boolean}
         */
        isFuckingFirefox : function() {
            return typeof InstallTrigger !== 'undefined';
        },

        /**
         * @return {object}
         */
        LessOfTwo : function (itm1, itm2, inString){
            var u1, u2;

            if (parseInt(itm1) < parseInt(itm2)) {
                u1 = itm1;
                u2 = itm2;
            } else {
                u1 = itm2;
                u2 = itm1;
            }

            return inString ? u1 + "_" + u2 : {min:u1, more:u2};
        },

        /**
         * @return {string}
         */
        formatDate : function (formatDate, formatString){
            if (!formatDate) return formatDate;

            var mcDate = serviceList.isString(formatDate);

            if (mcDate) formatDate = formatDate.split('.');

            var yyyy = mcDate ? parseInt(formatDate[2]) : formatDate.getFullYear();
            var yy = yyyy.toString().substring(2);
            var m = mcDate ? parseInt(formatDate[1]) : formatDate.getMonth() + 1;
            var mm = m < 10 ? "0" + m : m;
            var d = mcDate ? parseInt(formatDate[0]) : formatDate.getDate();
            var dd = d < 10 ? "0" + d : d;

            var  h = mcDate ? parseInt(formatDate[3]) : formatDate.getHours();
            var  hh = h < 10 ? "0" + h : h;
            var  n = mcDate ? parseInt(formatDate[4]) : formatDate.getMinutes();
            var  nn = n < 10 ? "0" + n : n;
            var  s = mcDate ? parseInt(formatDate[5]) : formatDate.getSeconds();
            var  ss = s < 10 ? "0" + s : s;
            var  zzz = mcDate ? parseInt(formatDate[6] || "0") : formatDate.getMilliseconds();
            
            if (zzz < 10) {
                zzz = "00" + zzz;
            } else
            if (zzz >= 10 && zzz < 100){
                zzz = "0" + zzz;
            }

            var MMM = moment().locale(mcConst.Lang).month(parseInt(m) - 1).format('MMMM');

            formatString = formatString.replace(/yyyy/, yyyy);
            formatString = formatString.replace(/yy/, yy);
            formatString = formatString.replace(/mm/, mm);
            formatString = formatString.replace(/m/, m);
            formatString = formatString.replace(/dd/, dd);
            formatString = formatString.replace(/d/, d);
            formatString = formatString.replace(/hh/, hh);
            formatString = formatString.replace(/h/, h);
            formatString = formatString.replace(/nn/, nn);
            formatString = formatString.replace(/n/, n);
            formatString = formatString.replace(/ss/, ss);
            formatString = formatString.replace(/s/, s);
            formatString = formatString.replace(/zzz/, zzz);
            formatString = formatString.replace(/MMM/, MMM);

            return formatString;
        },

        /**
         * @return {string}
         */
        DIV : function (x1, x2){
            var y1 = (x1 / x2).toString();
            var idx = y1.indexOf(".");

            return y1.slice(0, (idx !== -1) ? idx : y1.length);
        },

        CopyArray : function (arr){
            return [].concat(arr);
        },

        StringToArray : function (_msg, separator){
            var res =[];
            var idx = -1;

            if (_msg){
                if (serviceList.isIE() === false) {
                    res = _msg.split(separator) || [];
                } else {
                    do {
                        idx = _msg.indexOf(separator);
                        if (idx >= 0) {
                            res.push(_msg.slice(0, idx));
                            _msg = _msg.slice(idx + 1, _msg.length + 1);
                        }
                    } while (idx !== -1);
                }

                if (res.length && res[res.length - 1].length === 0) {
                    res.pop();
                }
            }

            return res;
        },

        GetSubstring : function (str, term){
            var idx = str.indexOf(term);
            return (idx !== -1)? str.slice(0, idx) : str.slice(0, str.length + 1);
        },

        GetSubstringFrom : function (str, term){
            var idx = str.indexOf(term);
            return (idx !== -1)? str.slice(idx + 1, str.length + 1) : str.slice(0, str.length + 1);
        },

        DelSubstring : function (str, term){
            var idx = str.indexOf(term);
            return (idx !== -1)? str.slice(idx + 1, str.length + 1) : "";
        },

        delArrayItem : function(arr, pos, len){
            if ( pos >= 0 ) {
                arr.splice(pos,(len || 1));
            }
        },

        doGetCaretPosition : function (ctrl) {
            var CaretPos = 0;	// IE Support

            if (document.selection) {
                var Sel = document.selection.createRange();

                ctrl.focus ();
                Sel.moveStart ('character', -ctrl.value.length);

                CaretPos = Sel.text.length;
            } else { // Firefox support
                if (ctrl.selectionStart || ctrl.selectionStart == '0'){
                    CaretPos = ctrl.selectionStart;
                }
            }

            return CaretPos;
        },

        inArray: function( elem, arr, i ) {
            var len;

            if ( arr ) {
                len = arr.length;
                i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

                for ( ; i < len; i++ ) {
                    if ( i in arr && arr[ i ] === elem ) {
                        return i;
                    }
                }
            }

            return -1;
        },

        inArrayLowerCase: function( elem, arr, i ) {
            var len;

            if ( arr ) {
                len = arr.length;
                i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

                for ( ; i < len; i++ ) {
                    if ( i in arr && arr[ i ].toLowerCase() === elem.toLowerCase() ) {
                        return i;
                    }
                }
            }

            return -1;
        },

        inArrayNoStrict: function( elem, arr, i ) {
            var len;

            if ( arr ) {
                len = arr.length;
                i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

                for ( ; i < len; i++ ) {
                    if ( i in arr && arr[ i ] == elem ) {
                        return i;
                    }
                }
            }

            return -1;
        },

        isArray : function (obj) {
            return Object.prototype.toString.call( obj ) === '[object Array]';
        },

        isString : function (obj) {
            return Object.prototype.toString.call( obj ) === '[object String]';
        },

        isHtmlElement : function (obj) {
            return Object.prototype.toString.call( obj ).indexOf('[object HTML') === 0;
        },

        isNumber : function (obj) {
            return Object.prototype.toString.call( obj ) === '[object Number]';
        },

        isObject : function (obj) {
            return Object.prototype.toString.call( obj ) === '[object Object]';
        },

        isFunction : function (obj) {
            return Object.prototype.toString.call( obj ) === '[object Function]';
        },

        isBoolean : function (obj) {
            return Object.prototype.toString.call( obj ) === '[object Boolean]';
        },

        RandomHash : function (len, isPwd) {
            var letters =  isPwd
                ? 'JjKAEeaMpsTt9QqRxBcDdF2fGgHh3ibC-kL7mNnPV85yr6SUuZ1WwXY4._vz!@#%$&*'
                : 'JjKAEeaMpsTt9QqRxBcDdF2fGgHhI3ibC-kL7mNnOPV85yr6SUuZo1WwXlY40._vz';
            var res = '';

            for (var i=0; i <  len; i++) {
                res += letters[Math.floor(Math.random() * letters.length)];
            }

            return res;
        },

        getRandomInt : function (min, max){
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        GetType : function (obj){
            return Object.prototype.toString.call( obj );
        },

        isFormatedLikeIP : function(ip){
            var reg = /((((\d){1,3}\.){3})((\d){1,3}))/; // |(((^|:)([0-9a-fA-F]{0,4})){1,8})

            return reg.test(ip);
        },

        isValidFIO : function (fio){
            var pattern = new RegExp(/^([\x27а-яА-Яa-zA-ZїЇіІєЄ]{2,}|[\x27а-яА-Яa-zA-ZїЇіІєЄ]{2,}\-[\x27а-яА-Яa-zA-ZїЇіІєЄ]{2,})\040[\x27а-яА-Яa-zA-ZїЇіІєЄ]{2,}|[\x27а-яА-Яa-zA-ZїЇіІєЄ]{2,}\040[\x27а-яА-Яa-zA-ZїЇіІєЄ]{2,}$/);
            return pattern.test(fio);
        },

        isValidEmailAddress : function (emailAddress) {
            var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
            return pattern.test(emailAddress);
        },   

        isValidIpAddress : function (ip) {
            var reg = /(^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?$))/; // |(((^|:)([0-9a-fA-F]{0,4})){1,8})

            return reg.test(ip);
        },

        isValidIpAddressV6 : function (ip) {
            var reg = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
            // var reg = /^(:([0-9a-fA-F]{0,4})){1,8}$/;

            return reg.test(ip);
        },

        isValidHostName : function (ip) {
            var reg = /^[0-9a-zA-Z\-.]*$/;

            return reg.test(ip) || serviceList.isValidIpAddressV6(ip);
        },

        isValidIpRange : function(ip){
            var reg = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)(-)((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

            return reg.test(ip);
        },

        isValidIpMask : function(ip){
            var reg = /(^(((25([0-5]|\?)|2([0-4]|\?)(\d|\?)|([01]|\?)?(\d|\?)(\d|\?)?)|\*)\.){3}((25([0-5]|\?)|2([0-4]|\?)(\d|\?)|([01]|\?)?(\d|\?)(\d|\?)?)|\*)$)/;

            return reg.test(ip);
        },

        isValidMACAddress : function(mac){
            var reg = /^([0-9a-fA-F]{2}([:-]|$)){6}$|([0-9a-fA-F]{4}([.]|$)){3}$/;

            return reg.test(mac);
        },

        isHasNoRussianSymbol : function (sText) {
            var pattern = new RegExp(/[a-zA-Z0-9]/i);

            return pattern.test(sText);//(pattern.test(sText) || (sText.search(" ") == -1));
        },

        isSymbolicNumbers : function (sText) {
            var pattern = new RegExp(/[a-zA-Z0-9а-яА-ЯїЇіІєЄ\s]/i);

            return pattern.test(sText);
        },

        isURL : function (_url){
            var u = /(((http|https|ftp|ftps)(:\/\/)?|(:\/\/)(www\.)?|(www\.))[a-zа-я0-9-]+\.[a-zа-я0-9-]{2,6})/gi;

            return u.test(_url);
        },

        trim : function ( str ){
            return str.toString().replace(/^\s+|\s+$/g,'');
        },

        /**
         * @return {string}
         */
        GetUserOS : function (){
            var os = "";
            var appV = navigator.appVersion;
            var oscpu = navigator.oscpu;

            if (serviceList.isIE()){
                os = appV.split(";")[2];
            } else {
                if (oscpu !== null || oscpu !== undefined) {
                    os = oscpu;
                } else os = appV.slice(appV.indexOf("(") + 1, ((appV.indexOf(";") != -1) ? appV.indexOf(";") : appV.indexOf(")")) );
            }

            return navigator.platform + " " + os;
        },

        /**
         * @return {string}
         */
        GetUserLanguage : function (){
            return  (navigator.language       ? navigator.language       : "") +
                    (navigator.systemLanguage ? navigator.systemLanguage : "");
        },

        /**
         * @return {string}
         */
        GetUserRefLink : function (){
            return document.referrer;
        },

        /**
         * @return {string}
         */
        GetUserAgent : function (){
            return navigator.userAgent;
        },

        /**
         * @return {string}
         */
        GetUserBrowser : function (){
            var browser = "";

            if (this.isIE()){
                browser = "IE";
            } else
            if (navigator.appName === "Opera"){
                browser = "Opera";
            } else
            if (navigator.vendor === "Apple Computer, Inc."){
                browser = "Safari";
            } else
            if (navigator.vendor === "Google Inc."){
                browser = "Chrome";
            } else
            if (navigator.oscpu){
                browser = "FireFox";
            } else {
                browser = "Other Brouser";
            }

            return browser;
        },

        pos  : function (FindStr, Src){
            return Src.indexOf(FindStr);
        },

        copy : function (Src, From, Count){
            return (Src) ? Src.slice(From, From + (Count || (Src.length - From))) : "";
        },

        ReplaceURLs : function( txt, options ) {
            var
                SCHEME = "[a-z\\d.-]+://",
                IPV4 = "(?:(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])",
                HOSTNAME = "(?:(?:[^\\s!@#$%^&*()_=+[\\]{}\\\\|;:'\",.<>/?]+)\\.)+",
                TLD = "(?:ac|ad|aero|ae|af|ag|ai|al|am|an|ao|aq|arpa|ar|asia|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|cat|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|coop|com|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|in|io|iq|ir|is|it|je|jm|jobs|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mo|mp|mq|mr|ms|mt|museum|mu|mv|mw|mx|my|mz|name|na|nc|net|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pro|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--80akhbyknj4f|xn--9t4b11yi5a|xn--deba0ad|xn--g6w251d|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--jxalpdlp|xn--kgbechtv|xn--zckzah|ye|yt|yu|za|zm|zw)",
                PORT = "(?::\\d{1,5})?",
                HOST_OR_IP = "(?:" + HOSTNAME + TLD + PORT + "|" + IPV4 + PORT + ")",
                PATH = "(?:[;/][^#?<>\\s]*)?",
                QUERY_FRAG = "(?:\\?[^#<>\\s]*)?(?:#[^<>\\s]*)?",
                URI1 = "\\b" + SCHEME + "[^<>(\\s|\\)|\\(|\\[|\\])]+", //"[^<>\\s]+",
                URI2 = "\\b" + HOST_OR_IP + PATH + QUERY_FRAG + "(?!\\w)",

                MAILTO = "mailto:",
                EMAIL = "(?:" + MAILTO + ")?[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@" + HOST_OR_IP + QUERY_FRAG + "(?!\\w)",

                URI_RE = new RegExp( "(?:" + URI1 + "|" + URI2 + "|" + EMAIL + ")", "ig" ),
                SCHEME_RE = new RegExp( "^" + SCHEME, "i" );

            var quotes = {
                "'": "`",
                '>': '<',
                ')': '(',
                ']': '[',
                '}': '{',
                'В»': 'В«',
                'вЂє': 'вЂ№'
            };

            var default_options = {
                callback: function( text, href ) {
                    return href ? '<a href="' + href + '" title="' + href + '">' + text + '<\/a>' : text;
                },
                punct_regexp: /(?:[!?.,:;'"]|(?:&|&amp;)(?:lt|gt|quot|apos|raquo|laquo|rsaquo|lsaquo);)$/
            };

            options = options || {};

            // Temp variables.
            var arr,
                i,
                link,
                href,

                // Output HTML.
                html = '',

                // Store text / link parts, in order, for re-combination.
                parts = [],

                // Used for keeping track of indices in the text.
                idx_prev,
                idx_last,
                idx,
                link_last,

                // Used for trimming trailing punctuation and quotes from links.
                matches_begin,
                matches_end,
                quote_begin,
                quote_end;

            // Initialize options.
            for ( i in default_options ) {
                if ( options[ i ] === undefined ) {
                    options[ i ] = default_options[ i ];
                }
            }

            // Find links.
            while ( arr = URI_RE.exec( txt ) ) {

                link = arr[0];
                idx_last = URI_RE.lastIndex;
                idx = idx_last - link.length;

                // Not a link if preceded by certain characters.
                if ( /[\/:]/.test( txt.charAt( idx - 1 ) ) ) {
                    continue;
                }

                // Trim trailing punctuation.
                do {
                    // If no changes are made, we don't want to loop forever!
                    link_last = link;

                    quote_end = link.substr( -1 );
                    quote_begin = quotes[ quote_end ];

                    // Ending quote character?
                    if ( quote_begin ) {
                        matches_begin = link.match( new RegExp( '\\' + quote_begin + '(?!$)', 'g' ) );
                        matches_end = link.match( new RegExp( '\\' + quote_end, 'g' ) );

                        // If quotes are unbalanced, remove trailing quote character.
                        if ( ( matches_begin ? matches_begin.length : 0 ) < ( matches_end ? matches_end.length : 0 ) ) {
                            link = link.substr( 0, link.length - 1 );
                            idx_last--;
                        }
                    }

                    // Ending non-quote punctuation character?
                    if ( options.punct_regexp ) {
                        link = link.replace( options.punct_regexp, function(a){
                            idx_last -= a.length;
                            return '';
                        });
                    }
                } while ( link.length && link !== link_last );

                href = link;

                // Add appropriate protocol to naked links.
                if ( !SCHEME_RE.test( href ) ) {
                    href = ( href.indexOf( '@' ) !== -1 ? ( !href.indexOf( MAILTO ) ? '' : MAILTO )
                        : !href.indexOf( 'irc.' ) ? 'irc://'
                            : !href.indexOf( 'ftp.' ) ? 'ftp://'
                                : 'http://' )
                        + href;
                }

                // Push preceding non-link text onto the array.
                if ( idx_prev != idx ) {
                    parts.push([ txt.slice( idx_prev, idx ) ]);
                    idx_prev = idx_last;
                }

                // Push massaged link onto the array
                parts.push([ link, href ]);
            }

            // Push remaining non-link text onto the array.
            parts.push([ txt.substr( idx_prev ) ]);

            // Process the array items.
            for ( i = 0; i < parts.length; i++ ) {
                html += options.callback.apply( window, parts[i] );
            }

            // In case of catastrophic failure, return the original text;
            return html || txt;
        },

        isObjectEmpty : function (obj){
            var flag = true;

            if (obj && (this.isObject(obj))){
                for (var i in obj){
                    flag = false;
                }
            }

            return flag;
        },

        StringToObj : function (_data){
            var res = null;

            if (this.isString(_data)){
                try {
                    res = JSON.parse(_data);
                } catch(e){
                    // console.error('Error. Can\'t convert to JSON:\n' + _data);
                }
            }

            return res || _data;
        },

        isNewNotificationSupported: function () {
            if (!window.Notification || !Notification.requestPermission)
                return false;
            if (Notification.permission == 'granted')
                // throw new Error('You must only call this *before* calling Notification.requestPermission(), otherwise this feature detect would bug the user with an actual notification!');
                return false;
            try {
                new Notification('');
            } catch (e) {
                if (e.name == 'TypeError')
                    return false;
            }
            return true;
        },

        CreateNotification : function (opt) {
            if (serviceList.notify !== null){
                clearTimeout(serviceList.idNotify);

                serviceList.notify.close();
                serviceList.idNotify = 0;
                serviceList.notify = null;
            }

            if (!serviceList.noNotify && serviceList.isNewNotificationSupported()){
                serviceList.notify = new Notification((opt.title) ? opt.title : "No title", serviceList.Marge({
                    icon    : mcConst.imagesPath.all + '75x75.png',
                    tag     : "list",
                    body    : "Empty"
                }, opt || {}));

                serviceList.idNotify = setTimeout(function(){
                    serviceList.notify.close();
                    serviceList.idNotify = 0;
                    serviceList.notify = null;
                }, opt.timeOut);

                serviceList.notify.onerror = function(){
                    if (console) {
                        console.warn("permission state = default or denied");
                    }

                    clearTimeout(serviceList.idNotify);

                    serviceList.idNotify = 0;
                    serviceList.notify = null;
                    serviceList.noNotify = true;
                };

                if (opt.onShow){
                    serviceList.notify.onshow = function(){
                        opt.onShow();
                    };
                }

                if (opt.click){
                    serviceList.notify.onclick = function() {
                        clearTimeout(serviceList.idNotify);

                        serviceList.notify.close();
                        serviceList.idNotify = 0;
                        serviceList.notify = null;

                        window.focus();

                        opt.click();
                    };
                }

                if (serviceList.notify.show) {
                    serviceList.notify.show();
                }
            }
        },

        CheckNotification : function (rrr){
            var res = false;

            if (window.webkitNotifications || window.Notification) {
                if ((window.webkitNotifications && window.webkitNotifications.checkPermission() === 0) || Notification.permission === "granted") { // 0 is PERMISSION_ALLOWED
                    res = true;
                    serviceList.noNotify = false;
                } else {
                    if (window.Notification){
                        Notification.requestPermission(function (permission) { // Whatever the user answers, we make sure Chrome stores the information
                            if(!('permission' in Notification)) {
                                Notification.permission = permission;
                            }
                        });
                    } else {
                        window.webkitNotifications.requestPermission(function(ssss){
                            rrr = ssss === 'granted';
                            serviceList.noNotify = !rrr;
                        });
                    }
                }
            } else {
                console.warn("Notifications are not supported for this Browser/OS version yet.");
            }

            return res;
        },

        mobileDetection : {
            Android:function () {
                return navigator.userAgent.match(/Android/i);
            },
            BlackBerry:function () {
                return navigator.userAgent.match(/BlackBerry/i);
            },
            iOS:function () {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            Opera:function () {
                return navigator.userAgent.match(/Opera Mini/i);
            },
            Windows:function () {
                return navigator.userAgent.match(/IEMobile/i);
            },
            any:function () {
                return (this.Android() || this.BlackBerry() || this.iOS() || this.Opera() || this.Windows()) || false;
            }
        },

        MyFormatTime : function (time, short){
            var res = "";

            var ss = time % 60;
            var hh = parseInt(time / 3600);
            var nn = parseInt(time / 60) - (hh * 60);

            if (short){
                res = ((nn < 10) ? ("0" + nn) : nn) + ":" + ((ss < 10) ? ("0" + ss) : ss);
            } else {
                res = ((hh < 10) ? ("0" + hh) : hh) + ":" + ((nn < 10) ? ("0" + nn) : nn) + ":" + ((ss < 10) ? ("0" + ss) : ss);
            }

            return res;
        },

        startOfDay : function(day){
            var now = day.getTime();

            return  now - (day.getHours()*1000*60*60 + day.getMinutes()*1000*60 + day.getSeconds()*1000 + day.getMilliseconds());
        },

        detectLang : function (init){
            init = init === "undefined" || !init ? null : init;
            
            var locale = init || ( (window.navigator.language || window.navigator.userLanguage).slice(0, 2).toLowerCase() );
            var lang = locale;

            if (locale !== 'en' && locale !== 'ru' && locale !== 'uk') {
                locale = MC_RESOURCE.TextSource.www[_api] + 'en';
                lang = 'en';
            } else {
                locale = MC_RESOURCE.TextSource.www[_api] + locale;
            }

            webix.storage.local.put(mcConst.storageFields.lang, lang);

            return [locale, lang];
        },

        Lang : function(id, items, term){
            var opt = {};

            if (serviceList.isObject(id)){
                opt = id;
            } else {
                opt = {
                    id   : id,
                    items: items,
                    term : term,
                    html : false
                };
            }

            var res = mcConst[opt.from ? "LMSG_" + opt.from : "LMSG"][opt.id.toString()];

            if (opt.html){
                if (serviceList.isArray(opt.items)){
                    opt.items.forEach(function (t, i) {
                        if (t) {
                            opt.items[i] = t.replace(/</ig, "&lt;");
                        }
                    });
                } else
                if (opt.items) {
                    opt.items = opt.items.replace(/</ig, "&lt;");
                }
            }

            return opt.items ? serviceList.myReplace(res, opt.items, opt.term) : res;
        },

        getElementByClass : function(classList, _node){
            var res  = null;
            var node = _node || document;

            if(document.getElementsByClassName) {
                res = node.getElementsByClassName(classList)
            } else {
                var list = node.getElementsByTagName('*');
                var length = list.length;
                var classArray = classList.split(/\s+/);
                var classes = classArray.length;
                var result = [];

                for (var i = 0; i < length; i++) {
                    for (var j = 0; j < classes; j++)  {
                        if (list[i].className.search('\\b' + classArray[j] + '\\b') != -1) {
                            result.push(list[i]);

                            break
                        }
                    }
                }

                res = result;
            }

            return res;
        },

        myReplace : function(source, _items, term){
            var res = source;
            var items = [];

            if (_items !== undefined && source !== undefined){
                var _term = term || "%s";

                if (!serviceList.isArray(_items)) {
                    items.push(_items);
                } else {
                    items = _items;
                }

                if (items.length > 0){
                    res = source.toString().replace(_term, items.shift());
                    res = serviceList.myReplace(res, items, _term);
                }
            }

            return res;
        },

        initResize : function(source, Name){
            mcConst.scrResize = source;
            mcConst.isShowed  = Name;
        },

        showView : function(view){
            if (view && view.className.indexOf('hidden') !== -1) {
                view.className = view.className.replace(' hidden', "");
            }
        },

        hideView : function(view){
            if (view && view.className.indexOf('hidden') === -1) {
                view.className += ' hidden';
            }
        },

        showCurrentView : function(Name, $rootScope, view, options){
            options = options || {};

            if (mcConst.isShowed !== Name) {
                $rootScope.$broadcast('hide' + mcConst.isShowed);
                $rootScope.$broadcast('setLocation', ['/' + $rootScope.currentRootPath + '/' + Name + '/', options.callBack, options.title]);

                serviceList.showView(view);

                mcConst.isShowed = Name;
            }
        },

        getLangItemsFromList : function(from, to, correct){
            var res = [];

            correct = correct || 0;

            for (var i = from; i <= to; i++){ // 249 492
                res.push({
                    id    : (i - from + correct).toString(),
                    value : serviceList.Lang(i)
                })
            }

            return res;
        },

        getLanguagesItems : function(from, to, correct){
            var res = [];

            correct = correct || 0;

            for (var i = from; i <= to; i++){ // 249 492
                res.push({
                    id    : (i - from + correct).toString(),
                    value : mcConst.LanguagesList[i]
                })
            }

            return res;
        },

        GetFioFormatList : function(){
            return serviceList.getLangItemsFromList(975, 983);/*.sort(function(a, b){
            return serviceList.sortAB(a.value.toLowerCase(), b.value.toLowerCase());
        });*/
        },

        sortAB : function(a,b,invert){
            return (a > b) ? (invert ? -1 : 1) : ((a < b) ? (invert ? 1 : -1) : 0);
        },

        GetCountriesList : function(){
            var res = serviceList.getLanguagesItems(249, 492, 1).sort(function(a, b){
                return serviceList.sortAB(a.value.toLowerCase(), b.value.toLowerCase());
            });

            res.unshift({
                id: '-1',
                value: serviceList.Lang(140) // "140":"Ничего не выбрано",
            });

            return res;
        },

        GetMaritalStatusList : function(){
            return serviceList.getLangItemsFromList(151, 157, 1);
        },

        GetSpokenLangList : function(){
            var res = serviceList.getLanguagesItems(180, 248, 1).sort(function(a, b){
                return serviceList.sortAB(a.value.toLowerCase(), b.value.toLowerCase());
            });

            res.unshift({
                id: '-1',
                value: serviceList.Lang(140) // "140":"Ничего не выбрано",
            });

            return res;
        },

        GetInterestsList : function(){
            var res = serviceList.getLangItemsFromList(494, 543, 1);

            res.unshift({
                id: '-1',
                value: serviceList.Lang(140) // "140":"Ничего не выбрано",
            });

            return res;
        },

        GetPastList : function(){
            var res = serviceList.getLangItemsFromList(546, 553, 1);

            res.unshift({
                id: '-1',
                value: serviceList.Lang(140) // "140":"Ничего не выбрано",
            });

            return res;
        },

        GetPastOrgList : function(){
            var res = serviceList.getLangItemsFromList(554, 573, 1);

            res.unshift({
                id: '-1',
                value: serviceList.Lang(140) // "140":"Ничего не выбрано",
            });

            return res;
        },

        GetWeekDays : function(){
            return serviceList.getLangItemsFromList(646, 652);
        },

        SaveSessionSettings : function(login, pwd, servPwd, rm, email){
            if (serviceList.isObject(login)){
                pwd     = login.pwd;
                servPwd = login.servPwd;
                rm      = login.rm;
                login   = login.login;
                // email   = login.Email;
            }

            webix.storage.local.put(mcConst.storageFields.Login, login);

            if (rm){
                webix.storage.local.put(mcConst.storageFields.Pwd, pwd);
                webix.storage.local.put(mcConst.storageFields.ServPwd, servPwd);
                webix.storage.local.put(mcConst.storageFields.Rm, true);

                // if (mcConst.storageFields.Email) webix.storage.local.put(mcConst.storageFields.Email, email); // for websupport
            } else {
                webix.storage.local.remove(mcConst.storageFields.Pwd);
                webix.storage.local.remove(mcConst.storageFields.ServPwd);
                webix.storage.local.remove(mcConst.storageFields.Rm);

                // if (mcConst.storageFields.Email) webix.storage.local.remove(mcConst.storageFields.Email); // for websupport
            }
        },

        LoadSessionSettings : function(){
            var res = {};

            res.login   = webix.storage.local.get(mcConst.storageFields.Login);
            res.pwd     = webix.storage.local.get(mcConst.storageFields.Pwd);
            res.servPwd = webix.storage.local.get(mcConst.storageFields.ServPwd);
            res.rm      = webix.storage.local.get(mcConst.storageFields.Rm);
            
            // if (mcConst.storageFields.Email) res.Email = webix.storage.local.get(mcConst.storageFields.Email);

            return res;
        },

        ClearSessionSettings: function(leaveUIN, noAutoconnectOnReload){
            if (!leaveUIN) {
                webix.storage.local.remove(mcConst.storageFields.Login);
            }

            webix.storage.local.remove(mcConst.storageFields.Pwd);
            webix.storage.local.remove(mcConst.storageFields.ServPwd);
            webix.storage.local.remove(mcConst.storageFields.Rm);

            if (noAutoconnectOnReload){
                webix.storage.local.put(mcConst.storageFields.AutoRld, true);
            } else {
                webix.storage.local.remove(mcConst.storageFields.AutoRld);
            }
        },

        toNormalDate : function (value, needTime){
            if (serviceList.isString(value)) {
                value = value.split('.');
            }

            var date = value[0] + '.' + //day
                value[1] + '.' + //month
                value[2];        //year

            var time = value[3] + ':' + //hour
                value[4] + ':' + //minutes
                value[5];        //seconds

            return date + ((needTime)? " " + time : "");
        },

        sortableDate : function(date, noSec){
            var dd = date.split('.');

            return dd[2] + '.' + dd[1] + '.' + dd[0] + ' ' + dd[3] + ':' + dd[4] + (!noSec ? ':' + dd[5] : '');
        },

        secToTime : function(sec){
            var ss = sec % 60;
            var dd = parseInt(sec / 86400);
            sec = sec - 86400*dd;
            var hh = parseInt(sec / 3600);
            var nn = parseInt(sec / 60) - (hh * 60);

            return (dd) + ':' + ((hh < 10) ? ("0" + hh) : hh) + ":" + ((nn < 10) ? ("0" + nn) : nn) + ":" + ((ss < 10) ? ("0" + ss) : ss);
        },

        formatNumber : function(numb){
            var stNumb = numb.toString();
            var res = [];
            var id = 1;

            for (var i = stNumb.length - 1; i >= 0; i --){
                res.unshift(((id === 3) ? " " : "") + stNumb[i]);

                id = (id === 3) ? 1 : (id + 1);
            }

            return res.join('');
        },

        convertBool : function (val) {
            switch (val) {
                case true:  val = '1'; break;
                case false: val = '0'; break;
                default:    val = val + "";
            }

            return val;
        },

        convertIntToBool : function (val) {
            return serviceList.isBoolean(val) ? val : val == 1;
        },

        clearPlaneObj : function(obj){
            for (var i in obj){
                obj[i] = null;
            }
        },

        Queue : function(lookupTime, loop){
            var self      = this;
            var needRun   = [];
            var canNext   = loop || false;
            var paramList = [];
            var nowRunned = false;
            var time      = lookupTime || 1000;

            var lookUp    = null;

            function start(){
                return setInterval(function(){
                    if (!nowRunned && needRun.length > 0){
                        nowRunned = true;

                        var arg = (serviceList.isArray(paramList[0])) ? paramList[0] : [paramList[0]];

                        needRun[0].apply(self, arg);
                    }
                }, time);
            }

            this.next = function(){
                if (needRun.length > 0){
                    needRun.shift();
                    paramList.shift();

                    nowRunned = false;
                } else
                if (!canNext){
                    clearInterval(lookUp);

                    self = null;
                }
            };

            this.addTask = function (qItem, params){
                if (needRun.length === 0 && !nowRunned) {
                    lookUp = start();
                }

                needRun.push(qItem);
                paramList.push(params);

                return needRun.length;
            };
        },

        TaskList : function(_scope){
            var self  = this;
            var list  = [];
            var scope = {};

            this.AddTask = function(task){
                list.push(task);
            };

            this.Next = function(){
                if (list[0]){
                    list.shift().apply(scope, arguments);
                } else {
                    self = null;
                }
            };

            this.Run = function(){
                self.Next();
            };

            scope = serviceList.Marge({
                next : self.Next,
                Next : self.Next
            }, _scope || {});
        },

        transformDataObject : function(source, dependency){
            var res = [];

            if (source && dependency){
                for ( var i = 0; i < source.length; i++){
                    var item = {};

                    for (var j = 0; j < dependency.length; j++){
                        item[dependency[j][1]] = source[i][dependency[j][0]].toString();
                    }

                    res.push(item);
                }
            } else {
                res = source;
            }

            return res;
        },

        networkInterfaces: function(IPVer, IPlist){
            var myType =(IPVer == 0) ? "IPv4" : "IPv6"; // $scope.data.IPVer
            var IPs    = [].concat(IPlist[myType]); // $scope.data.networkInterfaces[myType]

            for (var i = 0; i < IPs.length; i++){
                IPs[i] = {id : IPs[i], value: (( IPs[i] == '0.0.0.0') || (IPs[i] == '::')) ? serviceList.Lang(667) : IPs[i]};// "667": "слушать всё",
            }

            return IPs;
        },

        correctStringWithCRLF : function(val){
            return (serviceList.isString(val)) ? val.replace(/(?!\r)\n/g, '\r\n') : val;
        },

        removeCRFL: function(text){
            return text.toString().replace(/\n/g, '<br>').replace(/\r/g, '');
        },

        initChangesApplyForSettings: function($scope, $rootScope, CMD, applyText, storage){
            var backupItems = {};

            storage = storage || mcConst.dataModels.SettingsNetwork;

            function clearChangedData (){
                $scope.changedData.data.Items    = {};
                $scope.changedData.data.Desc     = "";
                $scope.changedData.data.ShowDesc = false;
            }

            $scope.changedData = {
                data : {
                    Desc   : "",
                    Items  : {},
                    ShowDesc : false,
                    Reopen : false
                },
                clearChangedData: clearChangedData,
                onApply : function() {
                    $scope.data = serviceList.Marge($scope.data, $scope.changedData.data.Items);
                    backupItems = serviceList.Marge({}, $scope.changedData.data.Items);

                    var data = {};

                    if ($scope.changedData.data.Items.hasOwnProperty("TURNPortTCP")){
                        data.turn = $scope.changedData.data.Items["TURNPortTCP"];
                    }
                    if ($scope.changedData.data.Items.hasOwnProperty("WEBTCPPort")){
                        data.web = $scope.changedData.data.Items["WEBTCPPort"];
                    }
                    if ($scope.changedData.data.Items.hasOwnProperty("TCPPort")){
                        data.core = $scope.changedData.data.Items["TCPPort"];
                    }
                    if ($scope.changedData.data.Items.hasOwnProperty("FTPPort")){
                        data.ftp = $scope.changedData.data.Items["FTPPort"];
                    }
                    if ($scope.changedData.data.Items.hasOwnProperty("FTPPortsPool")){
                        data.ftprange = $scope.changedData.data.Items["FTPPortsPool"];
                    }
                    if ($scope.changedData.data.Items.hasOwnProperty("TURNExternalConfig")){
                        data.turnconfig = $scope.changedData.data.Items["TURNExternalConfig"];
                    }

                    if (Object.keys(data).length){
                        $rootScope.$broadcast('SendCMDToServer', [
                            mcConst._CMD_.cs_adm_check_ports,
                            mcConst.SessionID,
                            JSON.stringify(data),
                            function () {
                                $scope.applyChange($scope.data);

                                clearChangedData();
                            }
                        ]);
                    } else {
                        $scope.applyChange($scope.data);

                        clearChangedData();
                    }
                },
                onClose : function(){
                    $scope.$emit("show" + $scope.Name, []);

                    clearChangedData();
                }
            };

            function changeApplyData (id, val){
                $scope.changedData.data.ShowDesc  = true;
                $scope.changedData.data.Items[id] = serviceList.correctStringWithCRLF(val);
                $scope.changedData.data.Desc      = serviceList.Lang(590); // "590": "Список измененных параметров:<br>",

                var item = "";

                for (var i in $scope.changedData.data.Items){
                    item = $scope.changedData.data.Items[i].toString().replace(/\\/g, '\\\\').replace(/</g, "&lt;");

                    $scope.changedData.data.Desc += "<br>" + i + ": <b>" + (
                        (
                            (i.indexOf('PWD') !== -1) ||
                            (i.toLowerCase().indexOf('pass') !== -1) ||
                            (i === "UseConnPass")
                        ) ? "*****" : item ) + "</b>"; // &#092;
                }

                $rootScope.$broadcast('show' + mcConst.dataModels.ApplyPanel, [$scope.changedData]);
            }

            function checkLastSlash(data, where) {
                if (data[where] && ["\\", "/"].indexOf(data[where][data[where].length - 1]) === -1){
                    data[where] += '\\';
                }
                // if (data.BackupsDir && (data.BackupsDir[data.BackupsDir.length - 1] != '\\') && (data.BackupsDir[data.BackupsDir.length - 1] != '/')){
                //     data.BackupsDir += '\\';
                // }
            }

            $scope.change = function(newV, oldV){
                if ($scope.skipChangeNow) return;

                var id = serviceList.copy(this.config.id, 3);
                var valid = true;
                // var restoreValue = false;

                if (newV == undefined){
                    newV = this.getValue();
                }

                if (oldV === undefined){
                    oldV = $rootScope.mcStorage[storage][id];
                }

                if (this.config.pathAlias){
                    newV = serviceList.trim(newV.replace(/\W/ig, ""));

                    this.$setValue(newV);
                } else
                if (this.config.view === "checkbox"){
                    newV = serviceList.convertIntToBool(newV);
                    oldV = serviceList.convertIntToBool(oldV);
                } else
                if (this.config.mcType === "port"){
                    valid = !isNaN(parseInt(newV)) && newV && (newV > 0) && (newV < 65534); //^\d+$/.test(newV);
                } else
                if (this.config.id === "stgRobotAvatarNum"){
                    valid = (/^\d+$/.test(newV)) && (newV >= 0) && (newV <= 239);
                } else
                if (this.config.id === "stgRobotName"){
                    valid = serviceList.trim(newV) !== "";
                } else
                if (this.config.id === "stgExternalIP" || this.config.id === "stwExternalIP"){
                    valid = serviceList.isValidIpAddress(newV) || serviceList.isValidHostName(newV) ? serviceList.trim(newV).indexOf(":") === -1 : false;

                    if (!valid){
                        newV = $rootScope.mcStorage[storage][id];
                    }

                    changeApplyData(id, newV);
                }

                if (valid && (mcConst.isShowed === $scope.Name) && (serviceList.correctStringWithCRLF(newV) !== oldV)){
                    if (this.config.pathAlias && !newV){
                        newV = oldV;
                    }

                    changeApplyData(id, newV);
                } else {
                    if (((this.config.view !== 'text') && (this.config.view !== 'textarea'))) {
                        this.$setValue(oldV);
                    }
                }
            };

            $scope.changeExc = function () {
                if (this.config && this.config.view === 'counter' || this.config.view === 'text') {
                    var newV = this.getValue();
                    var oldV = $scope.data[serviceList.copy(this.config.id, 3)];

                    if (!isNaN(newV)) {
                        $scope.change.apply(this, [newV, oldV]);
                    } else {
                        $scope.change.apply(this, [oldV, 1]);
                        this.$setValue(oldV);
                    }
                }
            };

            $scope.applyChange = function(data){
                // webix.message(applyText($scope.changedData.data.Items));

                if ($scope._onApply){
                    $scope._onApply(data);
                }

                ["BackupsDir", "FTPPublicDir", "FTPPersonalDir", "FilesDir", "LogsDir"].forEach(function (t) {
                    checkLastSlash(data, t);
                });

                var res = JSON.stringify(data, function(key, value){
                    return value;
                });

                $rootScope.$broadcast('SendCMDToServer', [
                    CMD,
                    mcConst.SessionID,
                    res,
                    function () {
                        webix.message(applyText(backupItems));
                        
                        $rootScope.mcStorage[storage] = serviceList.Marge($rootScope.mcStorage[storage], backupItems || {});
                    }
                ]);

                $rootScope.$broadcast('SendCMDToServer', [
                    mcConst._CMD_.cs_adm_get_server_options,
                    mcConst.SessionID
                ]);
            };
        },

        openNewWindow : function(url){
            var newWindow = window.open(url, '', 'menubar=no,resizable=0,directories=no,location=no,toolbar=no,status=no,screenX=0,screenY=0,width=1000,height=600');

            if (newWindow) newWindow.focus();
        },

        onOffToBool : function(val){
            return serviceList.isBoolean(val) ? val : val == 'on';
        },

        InObject : function(item, obj){
            var res = false;

            for(var i in obj) {
                if (item == obj[i]) {
                    res = true;
                    break;
                }
            }

            return res;
        },

        getIdxByIdFromData : function(data, id){
            var res = null;

            for (var i = 0; i < data.length; i ++){
                if (data[i].id == id) {
                    res = i;
                    break;
                }
            }

            return res;
        },

        getIdxByNameFromData : function(data, key, val){
            var res = null;

            for (var i = 0; i < data.length; i ++){
                if ((data[i][key] !== undefined) && (data[i][key] == val)) {
                    res = i;
                    break;
                }
            }

            return res;
        },

        getValueByNameFromData : function(data, key, val){
            var res = "";

            for (var i = 0; i < data.length; i ++){
                if ((data[i][key] !== undefined) && (data[i][key] == val)) {
                    res = data[i][key];
                    break;
                }
            }

            return res;
        },

        oldLicenseKey : function(key){
            var res = false;
            var reg = /^([A-Z0-9]{4}\-){6}[A-Z0-9]{4}$/;

            res = reg.test(serviceList.trim(key));

            if (res) {
                res = serviceList.trim(key);
            }

            return res;
        },

        checkLicenseKey : function(key){
            var res = false;
            var reg = /^([A-F0-9]{4}\-){10}[A-F0-9]{4}$/;

            res = reg.test(serviceList.trim(key));

            if (res) {
                res = serviceList.trim(key);
            }

            return res;
        },

        checkGuestKey : function(key){
            var res = false;
            var reg = /^([A-F0-9]{4}\-){5}[A-F0-9]{4}$/;

            res = reg.test(serviceList.trim(key));

            if (res) {
                res = serviceList.trim(key);
            }

            return res;
        },

        checkQuizKey : function(key){
            var res = false;
            var reg = /^[A-F0-9]{6,8}\-([A-F0-9]{4}\-){3}[A-F0-9]{4}$/;

            res = reg.test(serviceList.trim(key));

            if (res) {
                res = serviceList.trim(key);
            }

            return res;
        },

        renameProperty : function (oldName, newName) {
            if (this.hasOwnProperty(oldName)) {
                this[newName] = serviceList.trim(this[oldName]);

                delete this[oldName];
            }
            return this;
        },

        ListButtonSet: function(opt){
            function add(){
                $$(_idBtn).hide();
                $$(_idBFld).show();

                if ( options.hideSearchField ) $$(options.hideSearchField).hide();

                if (items.fields[0]) {
                    if (options.type != 3 || options.type !== "combo") {
                        items.fields[0].setValue("");
                        if (items.fields[1]) {
                            items.fields[1].setValue("");
                        }
                    }

                    items.fields[0].focus();

                    if (options.actions.preview){
                        options.actions.preview(items.fields[0]);
                    }
                } else {
                    throw new Error('No fields found!');
                }

                if (options.actions.afterShow){
                    options.actions.afterShow(items.fields);
                }
            }

            function save (){
                if (options.actions.save && options.actions.save.apply(null, items.fields)){
                    back();
                }
            }

            function back (){
                if (items.fields[0] && items.fields[0].hasOwnProperty('getPopup')){
                    items.fields[0].getPopup().hide();
                }

                $$(_idBFld).hide();
                $$(_idBtn).show();

                if ( options.hideSearchField ) $$(options.hideSearchField).show();
            }

            function del(){
                var _list        = $$(options.list);
                var selectedItem = _list.getSelectedItem();

                if (selectedItem && options.actions.del){
                    var len     = selectedItem[options.selectedItem] ? selectedItem[options.selectedItem].length : 0;
                    var delText = serviceList.Lang(1078, len > 15 ? serviceList.copy(selectedItem[options.selectedItem], 0, 15) + "..." : selectedItem[options.selectedItem]); // "1078":"Удалить %s из списка?",

                    if (serviceList.isArray(selectedItem)){
                        delText = serviceList.Lang(1142); // "1142":"Удалить отмеченные элементы?",
                    }

                    options.regShowWindow(serviceList.RandomHash(4), webix.confirm({
                        type  : "confirm-warning",
                        text  : delText,
                        ok    : serviceList.Lang(581), // "581": "Удалить",
                        cancel: serviceList.Lang(103), // "103": "Отмена",
                        callback:function(yes){
                            if (yes){
                                options.actions.del(selectedItem, _list);

                                if (serviceList.isArray(selectedItem)){
                                    for (var i = 0; i < selectedItem.length; i ++){
                                        serviceList.remove(selectedItem[i].id);
                                    }

                                    webix.message(serviceList.Lang(1506)); // "1506":"Элементы удалены",
                                } else {
                                    webix.message(serviceList.Lang(1077, selectedItem[options.selectedItem])); // "1077":"%s удален",

                                    _list.remove(selectedItem.id);
                                }

                                if (options.actions.afterDel) options.actions.afterDel(_list);
                            }
                        }
                    }));
                }
            }

            function clear(){
                //if ($$(options.list).serialize().length){
                options.regShowWindow(serviceList.RandomHash(4), webix.confirm({
                    type  : "confirm-warning",
                    text  : serviceList.Lang(1072),// "1072":"Очистить список?",
                    ok    : serviceList.Lang(581), // "619": "Очистить",
                    cancel: serviceList.Lang(103), // "103": "Отмена",
                    callback:function(yes){
                        if (yes){
                            if (options.actions.clear()){
                                $$(options.list).clearAll();
                            }
                        }
                    }
                }));
                //}
            }

            function afterRender(){
                // items.fields[0] = this;

                webix.UIManager.addHotKey("Enter", function() {
                    save();

                    return false;
                }, this);

                webix.UIManager.addHotKey("Esc", function() {
                    back();

                    return false;
                }, this);
            }

            var options = serviceList.Marge({
                type   : '1',
                actions: {
                    del    : null,
                    clear  : null,
                    save   : null,
                    preview: null,
                    enable : null,
                    disable: null
                },
                text : {
                    field1 : "", // "1075":"Введите IP, маску или диапазон",
                    field2 : "", // serviceList.Lang(1032) "1032":"Комментарий:",
                    field3 : ""  // serviceList.Lang(1032) "1032":"Комментарий:",
                },
                visibleBtns: {
                    add: true,
                    del: true,
                    cls: true
                },
                list : null,
                listData : [],
                regShowWindow: null,
                selectedItem: 'value'
            }, opt || {});

            var res     = null;

            if (serviceList.isFunction(options._back)){
                options._back(back);
            }

            if (!options.regShowWindow){
                var errtext = 'Needs \"regShowWindow\" for show popup windows in ' + options.list;

                console.error(errtext);

                webix.message({ type:"error", text: errtext, expire : mcConst.errMessageExpire * 2});
            } else {
                var _idBtn  = serviceList.RandomHash(10);
                var _idBFld = serviceList.RandomHash(10);
                var items   = {
                    fieldBlock: null,
                    fields    : [],
                    list      : null
                };

                res = { rows : [
                    { id: _idBtn, cols: [ // блок с кнопками: добавить удалить очистить
                        { view: "button", value: serviceList.Lang(50), hidden: !options.visibleBtns.add, click: add, css: "applyButton"},// "50" : "Добавить",
                        { view: "button", value: serviceList.Lang(52), hidden: !options.visibleBtns.del, click: del, type: "danger"},    // "52" : "Удалить",
                        { view: "button", value: serviceList.Lang(619), hidden: !options.visibleBtns.cls,click: clear}                   // "619": "Очистить",
                    ]},
                    { id: _idBFld, hidden: true, rows: [{}]} // появляющийся блок
                ]};

                switch (options.type){
                    case 'textComment':
                    case '1':
                        res.rows[1].rows = [
                            { view: "text", placeholder: options.text.field1, on: { onAfterRender: function() { items.fields[0] = this; afterRender.apply(this, arguments); } } },
                            { cols: [
                                { view: "text", placeholder: options.text.field2, // id: "ipfAcceptAddComment",
                                    on: { onAfterRender: function() { items.fields[1] = this; afterRender.apply(this, arguments); } }
                                },
                                { view: "button", value: serviceList.Lang(104), width: 100, click: save}, // "104": "Сохранить",
                                { view: "button", value: serviceList.Lang(103), width: 100, click: back, type: "danger"}  // "103": "Отмена",
                            ]}
                        ];
                    break;

                    case 'text':
                    case '2':
                        res.rows[1].cols = [
                            { view: "text", placeholder: options.text.field1, on: { onAfterRender: function() { items.fields[0] = this; afterRender.apply(this, arguments); } } },// "1075":"Введите IP, маску или диапазон",
                            { view: "button", value: serviceList.Lang(104), width: 100, click: save}, // "104": "Сохранить",
                            { view: "button", value: serviceList.Lang(103), width: 100, click: back, type: "danger"} // "103": "Отмена",
                        ];
                    break;

                    case 'combo':
                    case '3':
                        res.rows[1].cols = [
                            { view: "combo", options: options.listData, on: { onAfterRender: function() { items.fields[0] = this; afterRender.apply(this, arguments); } } },
                            { view: "button", value: serviceList.Lang(13), width: 100, click: save, css: "applyButton"}, // "13" : "Ок",
                            { view: "button", value: serviceList.Lang(103), width: 100, click: back, type: "danger"} // "103": "Отмена",
                        ];
                    break;

                    case 'textRichselectComment':
                    case '4':
                        res.rows[1].rows = [
                            { cols: [
                                { view: "text", placeholder: options.text.field1, on: { onAfterRender: function() { items.fields[0] = this; afterRender.apply(this, arguments); } } },
                                { view: "richselect", placeholder: options.text.field2, options: options.listData, on: { onAfterRender: function() { items.fields[1] = this } } }
                            ]},
                            { cols: [
                                { view: "text", placeholder: options.text.field3, // id: "ipfAcceptAddComment",
                                    on: { onAfterRender: function() { items.fields[2] = this; afterRender.apply(this, arguments); } }
                                },
                                { view: "button", value: serviceList.Lang(104), width: 100, click: save}, // "104": "Сохранить",
                                { view: "button", value: serviceList.Lang(103), width: 100, click: back, type: "danger"}  // "103": "Отмена",
                            ]}
                        ];
                    break;
                }
            }

            return res;
        },

        findItemInArrayOfObj: function( arr, val, id, lowerCase ){
            for (var i = 0; i < arr.length; i++){
                if (!id){
                    for (var j in arr[i]){
                        if (lowerCase){
                            if (arr[i][j].toLowerCase() == val.toLowerCase()){
                                return i;
                            }
                        } else
                        if (arr[i][j] == val){
                            return i;
                        }
                    }
                } else
                if (lowerCase){
                    if (arr[i][id].toLowerCase() == val.toLowerCase()){
                        return i;
                    }
                } else
                if (arr[i][id] == val){
                    return i;
                }
            }

            return -1;
        },

        ContextMenu : function(_master, oldMenu, cb, onShow){
            function selectAll (){
                if (_master.selectAll){
                    _master.selectAll();
                } else {
                    _master.selectRange(_master.getFirstId(), _master.getLastId());
                }
            }

            if (oldMenu) {
                oldMenu.destructor();
            }

            return webix.ui({
                view  : "context",
                width : 220,
                master: _master,
                body  : { rows: [
                    { view: "button", value: serviceList.Lang(1105), click: function(){ // "1105":"Выделить все",
                        selectAll();

                        var context = this.getTopParentView();

                        if (cb) cb.call(context.getContext().obj, 'selectAll');

                        context.hide();
                    }},
                    { view: "button", value: serviceList.Lang(1106), click: function(){ // "1106":"Снять выделение",
                        if (_master.unselectAll){
                            _master.unselectAll()
                        } else {
                            _master.clearSelection();
                        }

                        var context = this.getTopParentView();

                        if (cb) cb.call(context.getContext().obj, 'clear');

                        context.hide();
                    }},
                    { view: "button", value: serviceList.Lang(1107), click: function(){ // "1107":"Инвертировать выделение",
                        var selectedItems = _master.getSelectedItem();

                        if (serviceList.isObject(selectedItems)){
                            selectedItems = [selectedItems];
                        }

                        selectAll();

                        var context = this.getTopParentView();

                        for (var i = 0; selectedItems && i < selectedItems.length; i ++){
                            _master.unselect(selectedItems[i].id);
                        }

                        if (cb) cb.call(context.getContext().obj, 'invert');

                        context.hide();
                    }}
                ]},
                on: { onShow: function() {
                    if (onShow) onShow.apply(this, []);
                }}
            });
        },

        getAllUserForFillList: function(list, cb, $rootScope){
            var usersCash = $rootScope.mcStorage[mcConst.dataModels.UserManager];

            if (usersCash && usersCash.Params === "All" && !list.length){
                cb.apply(usersCash, [usersCash.Users]);
            } else
            if (!usersCash || usersCash.Params !== "All" || (list.length > 0 && usersCash.Users.length !== list.length)){
                $rootScope.$broadcast('getAllUserList', [false, function() {
                    usersCash = $rootScope.mcStorage[mcConst.dataModels.UserManager];

                    cb.apply(usersCash, [usersCash.Users]);
                }]);
            }
        },

        getAllUserWithParams: function(cb, $rootScope, params){
            var usersCash = $rootScope.mcStorage[mcConst.dataModels.UserManager];

            if (usersCash && usersCash.Params === "All" &&  params === "All"){
                cb.apply(usersCash, [usersCash.Users]);
            } else {
                $rootScope.$broadcast('SendCMDToServer', [
                    mcConst.lockInterface,
                    mcConst._CMD_.cs_adm_list_users,
                    mcConst.SessionID,
                    !params ? 'All' : params.Params || 'All',
                    !params ? mcConst.userFields : params.Filters || mcConst.userFields,
                    function (data) {
                        $rootScope.mcStorage.UserManager = data;

                        cb.apply(data, [data.Users]);
                    }
                ]);
            }
        },

        getMcSettings: function($rootScope, show, allways){
            if (!$rootScope.mcStorage.SettingsNetwork || allways){
                $rootScope.$broadcast('SendCMDToServer', [
                    mcConst.lockInterface,
                    mcConst._CMD_.cs_adm_get_server_options,
                    mcConst.SessionID,

                    function (data){
                        $rootScope.mcStorage.SettingsNetwork = data;

                        $rootScope.$broadcast('SendCMDToServer', [
                            mcConst.lockInterface,
                            mcConst._CMD_.cs_adm_get_server_info,
                            mcConst.SessionID,

                            function( data ){
                                $rootScope.mcStorage.ServerInfo = data;

                                if ( show ) show();
                            }
                        ]);
                    }
                ]);
            } else {
                if ( show ) show();
            }
        },

        getTitle: function(path){
            var res = "";

            switch (path){
                case "ServerInfo":      res = serviceList.Lang(10);   break; // "10" : "Информация о сервере",
                case "UserManager":     res = serviceList.Lang(49);   break; // "49" : "Список пользователей",
                case "UserProfile":     res = serviceList.Lang(1484); break; // "1484":"Профиль пользователя",
                case "GroupRights":     res = serviceList.Lang(57);   break; // "57" : "Группы прав"
                case "GroupUsers":      res = serviceList.Lang(916);  break; // "916":"Пользователи групп",
                case "Contacts":        res = serviceList.Lang(587);  break; // "587": "Общий список контактов",
                case "WorkPositions":   res = serviceList.Lang(588);  break; // "588": "Должности компании",
                case "WebSupport":      res = serviceList.Lang(938);  break; // "938":"Web-поддержка",
                case "MyChatGuest":     res = serviceList.Lang(945);  break; // "945":"MyChat Guest",
                case "LicenseMyChat":   res = serviceList.Lang(944);  break; // "944":"MyChat Server",
                case "LicenseGuest":    res = serviceList.Lang(945);  break; // "945":"MyChat Guest",
                case "UsersImports":    res = serviceList.Lang(960);  break; // "960":"Импорт пользователей",
                case "Operators":       res = serviceList.Lang(817);  break; // "817":"Модераторы",
                case "Bans":            res = serviceList.Lang(1029); break; // "1029":"Забаненные пользователи",
                case "AutoChannels":    res = serviceList.Lang(1039); break; // "1039":"Автосоздаваемые конференции",
                case "RemoteSettings":  res = serviceList.Lang(1329); break; // "1329":"Дистанционные настройки клиента",
                case "History":         res = serviceList.Lang(1134); break; // "1134":"Просмотр протоколов",
                case "FilterAntiflood": res = serviceList.Lang(1057); break; // "1057":"Антифлуд",
                case "FilterBadWords":  res = serviceList.Lang(1058); break; // "1058":"Плохие слова",
                case "FilterIP":        res = serviceList.Lang(1059); break; // "1059":"IP фильтры",
                case "FilterMAC":       res = serviceList.Lang(1060); break; // "1060":"MAC фильтры",
                case "FilterNames":     res = serviceList.Lang(1061); break; // "1061":"Блокировки названий",
                case "SettingsNetwork": res = serviceList.Lang(591);  break; // "591": "Сетевые настройки MyChat",
                case "SettingsInfo":    res = serviceList.Lang(596);  break; // "596": "Информация",
                case "SettingsLogs":    res = serviceList.Lang(598);  break; // "598": "Протоколирование",
                case "SettingsFTP":     res = serviceList.Lang(599);  break; // "599": "FTP файловый сервер",
                case "SettingsWEB":     res = serviceList.Lang(600);  break; // "600": "WEB-сервисы",
                case "SettingsBackup":  res = serviceList.Lang(601);  break; // "601": "Резервные копии",
                case "SettingsService": res = serviceList.Lang(602);  break; // "602": "Обслуживание",
                case "SettingsAPI":     res = serviceList.Lang(603);  break; // "603": "Integration API",
                case "SettingsSMTP":    res = serviceList.Lang(921);  break; // "921":"Настройка SMTP",
                case "Others":          res = serviceList.Lang(672);  break; // "672": "Дополнительно",
            }

            return res;
        },

        formatDeptList: function( data ){
            var separator = '';
            var levels = {};
            var i = 0;
            var res = [];
            var normalData = [];
            var idx;
            var deptList = [];

            while (data.length > 0 || i < data.length){
                if (data[i].ParentID == 0) {
                    normalData.push(data[i]);

                    data.splice(i, 1);
                } else {
                    idx = serviceList.findItemInArrayOfObj(normalData, data[i].ParentID, "GroupID");

                    if (idx == -1) {
                        i++;
                    } else {
                        normalData.push(data[i]);

                        data.splice(i, 1);
                    }
                }

                if (data.length > 0 && i == data.length){
                    i = 0;
                }
            }

            for (i = 0; i < normalData.length; i++){
                if (normalData[i].ParentID == 0) {
                    levels[normalData[i].GroupID] = 0;
                } else {
                    levels[normalData[i].GroupID] = levels[normalData[i].ParentID] + 1;
                }

                separator = new Array(levels[normalData[i].GroupID] + 1).join('&#151;');

                res.push({
                    id: normalData[i].GroupID,
                    value: separator + normalData[i].GroupName
                });
            }

            for (i = 0; i < normalData.length; i++){
                if (normalData[i].ParentID == 0){
                    deptList.push(res[i]);
                } else {
                    deptList.splice(serviceList.findItemInArrayOfObj(deptList, normalData[i].ParentID, "id") + 1, 0, res[i]);
                }
            }

            return deptList;
        },

        copyToBuffer: function(){
            setTimeout(function(){
                webix.message(serviceList.Lang(1483)); // "1483":"Лог скопирован в буфер обмена!",
            }, 10);

            return $$("logsContainer").$view.innerText.replace(/\n/g, '\r\n');
        },

        convertDomainToDn : function(dn){
            if (dn.indexOf('=') === -1){
                dn = dn.split('.');

                for (var i = 0; i < dn.length; i++){
                    dn[i] = 'DC=' + dn[i];
                }

                dn = dn.join(',').toUpperCase();
            } else {
                dn = dn.toUpperCase();
            }

            return dn;
        },

        convertDataToTree: function(data, withMe){
            function add(current, parent){
                var item = null;

                if (current.IsGroup){
                    item = {
                        DisplayName: current.GroupName || current.DisplayName,
                        id         : current.ID || current.id,
                        ParentID   : current.ParentID,
                        GroupID    : current.GroupID,
                        IsGroup    : true,
                        folder     : true,
                        data       : current.data || []
                    };
                } else {
                    if (!withMe && current.UIN == mcConst.UserInfo.UIN){
                        return false;
                    }

                    item = {
                        DisplayName: current.DisplayName,
                        id         : current.ID || current.id,
                        ParentID   : current.ParentID,
                        State      : current.State,
                        UIN        : current.UIN,
                        TeamLead   : current.TeamLead
                    };
                }

                parent.push(item);

                return true;
            }

            var res = [];
            var structure = [];
            var _data = [].concat(data);
            var i = 0;
            var needAdd = null;

            while (_data.length > 0){
                if (_data[i].ParentID == 0){
                    needAdd = add(_data[i], res);
                    if (needAdd) add(res[res.length - 1], structure);

                    _data.splice(i, 1);
                } else {
                    var idx = serviceList.findItemInArrayOfObj(structure, _data[i].ParentID, "GroupID");

                    if (idx >= 0){
                        needAdd = add(_data[i], structure);
                        if (needAdd) add(structure[structure.length - 1], structure[idx].data);

                        _data.splice(i, 1);
                    } else {
                        i++;
                    }
                }

                if (i == _data.length) {
                    i = 0;
                }
            }

            return res;
        },

        hideFrame: function(id){
            var view = document.getElementById(id);

            if (view){
                view.style.display = 'none';
            }
        },

        showFrame: function(id){
            var view = document.getElementById(id);

            if (view){
                view.style.display = 'block';
            }
        },

        getFrame: function(id, src){
            var res = src || document.getElementById(id);

            if (res && !res.showFrame && !res.hideFrame) {
                res.showFrame = function() {
                    serviceList.showFrame(id) };
                res.hideFrame = function() {
                    serviceList.hideFrame(id) };
            }

            return res;
        },

        convertObjToArray: function(obj, keyToField, copy){
            var res = [];

            for (var i in obj){
                if (serviceList.isObject(obj[i])){
                    if (keyToField) obj[i][keyToField] = i;

                    res.push(copy ? serviceList.Marge({}, obj[i]) : obj[i] );
                }
            }

            return res;
        },

        getStateStatuses: function(state){
            return {
                Online  : state.Online  ? serviceList.StringToArray(state.Online, ',') : serviceList.StringToArray(state.Users, ','),
                Offline : state.Offline ? serviceList.StringToArray(state.Offline, ',') : [],
                States  : state.States  ? serviceList.StringToArray(state.States, ',') : serviceList.StringToArray(state.Statuses, ',')
            };
        },

        addEvent : function(object, type, callback) {
            if (object == null || typeof(object) == 'undefined') return;
            if (object.addEventListener) {
                object.addEventListener(type, callback, false);
            } else if (object.attachEvent) {
                object.attachEvent("on" + type, callback);
            } else {
                object["on"+type] = callback;
            }
        },

        getWindowSize: function(){
            var wndWidth = 0;
            var wndHeight = 0;

            if (typeof (window.innerWidth) == 'number') {
                wndWidth = window.innerWidth;
                wndHeight = window.innerHeight;
            } else {
                if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
                    wndWidth = document.documentElement.clientWidth;
                    wndHeight = document.documentElement.clientHeight;
                } else {
                    if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
                        wndWidth = document.body.clientWidth;
                        wndHeight = document.body.clientHeight;
                    }
                }
            }

            return {
                width  : wndWidth,
                height : wndHeight
            };
        },

        convertDnArrayToTreeTable: function(dnList, base){
            var res = [];
            var dnStructure = {};
            var dn = "distinguishedName";

            function createStructure(obj, structure, parent){
                function add (arr, item){
                    var link = {
                        value: item
                    };

                    if (structure.length === 0){
                        link = serviceList.Marge(link, obj);
                    } else {
                        link['$row'] = "value";
                        link['open'] = true;
                        link['data'] = [];
                    }

                    arr.push(link);

                    return link;
                }

                if (structure.length){
                    var item = structure.pop().replace('CN=', '');

                    parent = parent || res;

                    var idx = serviceList.findItemInArrayOfObj(parent, item, "value");

                    createStructure(obj, structure, idx === -1 ? add(parent, item).data : parent[idx].data);
                }
            }

            for (var i = 0; i < dnList.length; i++){
                dnList[i][dn] = dnList[i][dn].replace(',' + base, '');

                if (!dnStructure[dnList[i][dn]]){
                    dnStructure[dnList[i][dn]] = dnList[i][dn].split(',');

                    createStructure(dnList[i], [].concat(dnStructure[dnList[i][dn]]), null);
                }
            }

            return res;
        },

        makeIceServers: function (data, isWeb){
            /** @namespace data.IPList*/
            /** @namespace data.TURNPort*/
            /** @namespace data.Credential */
            var res = [];
            var ipList = data.IPList.split(',');

            if (ipList[0] === ""){
                ipList[0] = isWeb ? window.location.host : mcConst.ServerInfo.Host;
            }

            for (var i = 0; i < ipList.length; i++){
                var tcp = 'turn:' + ipList[i] + ':' + data.TURNPort +'?transport=tcp';
                var udp = 'turn:' + ipList[i] + ':' + data.TURNPort +'?transport=udp';

                res.push({
                    urls       : []
                        .concat(isWeb ? tcp : [])
                        .concat(isWeb || (mcConst.ClientSettings && mcConst.ClientSettings.MediaNetworkTransportTCP) ? tcp : [])
                        .concat(isWeb || (mcConst.ClientSettings && mcConst.ClientSettings.MediaNetworkTransportUDP) ? udp : []),

                    credential : data.Credential,
                    username   : data.UserName
                });
            }

            return res;
        },

        checkRightsCollection: function(_ids, equals){
            var res = false;
            var id = null;

            for (var i = 0; i < _ids.length; i ++){
                id = parseInt(_ids[i]) - 1;

                res = equals
                    ? res && (mcConst.MyRightsSet.RightsSet[id] == '1')
                    : res || (mcConst.MyRightsSet.RightsSet[id] == '1');
            }

            return res;
        },

        MyTimer: function (_target){
            var Now = 0;
            var id = null;

            this.Start = function(){
                Now = 0;

                clearInterval(id);

                id = setInterval(function(){
                    Now++;

                    if (_target) {
                        _target.text(serviceList.MyFormatTime(Now, true));
                    }
                }, 1000);
            };

            this.Pause = function(newTime){
                clearInterval(id);

                Now = newTime || Now;
            };

            this.Stop = function(){
                if (_target) _target.text(serviceList.MyFormatTime(0, true));

                clearInterval(id);

                return serviceList.MyFormatTime(Now, true);
            };
        },

        openLink: function(link, param){
            var params = param || "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
            window.open(link, "", params);
        },

        showImportResult: function(data, $rootScope){
            var add = [];
            var upd = [];
            var err = [];
            var res = "";

            if (data && data.Results && data.Users){
                for (var i = 0; i < data.Results.length; i++){
                    switch (data.Results[i]){
                        case '0': case 0:
                        add.push(data.Users[i]);
                        break;

                        case '1': case 1:
                        upd.push(data.Users[i]);
                        break;

                        default:
                            err.push(data.Users[i]);
                    }
                }

                if (add.length){
                    res += "<span class='blue _grName'>" + mcLang(1552) + '</span><br>';// "1552":"Добавлены пользователи:",
                    res += add.join('<br>') + '<br><br>';
                }

                if (upd.length){
                    res += "<span class='green _grName'>" + mcLang(1553) + '</span><br>';// "1553":"Обновлены пользователи:",
                    res += upd.join('<br>') + '<br><br>';
                }

                if (err.length){
                    res += "<span class='red _grName'>" + mcLang(1554) + '</span><br>';// "1554":"Не добавленные пользователи:",
                    res += err.join('<br>');
                }

                var wnd = webix.ui({
                    view: "window",
                    position: "center",
                    modal: true,
                    width: 300,
                    height: 500,
                    head: mcLang(971), // "971":"Результат:",
                    body: { rows: [
                        { template: res, borderless: true, scroll: "y" },
                        { view: "button", value: mcLang(12), click: function(){
                            this.getTopParentView().hide();
                            this.getTopParentView().destructor();
                        }} //"12" : "Закрыть",
                    ]}
                });

                $rootScope.regShowWindow(serviceList.RandomHash(4), wnd);

                wnd.show();

                if (add.length || upd.length){
                    $rootScope.$broadcast('refreshUserManagerOnNextShow', []);
                }
            }
        },

        getUserStateText: function(_state, noColor){
            var state = "";

            switch (_state){
                case mcConst.states.offline:
                    state = serviceList.Lang(1641); break; // "1641":"Не в сети",

                case mcConst.states.online:
                    state = (!noColor ? '<span class="green">' : "") + serviceList.Lang(1642) + (!noColor ? '</span>' : ""); break; // "1642":"В сети",

                case mcConst.states.webOnline:
                    state = (!noColor ? '<span class="green">' : "") + serviceList.Lang(1642) + (!noColor ? '</span>' : ""); break; // "1642":"В сети",

                case mcConst.states.away:
                    state = (!noColor ? '<span class="blue">' : "") + serviceList.Lang(1643) + (!noColor ? '</span>' : ""); break; // "1643":"Нет на месте",

                case mcConst.states.dnd:
                    state = (!noColor ? '<span class="red">' : "") + serviceList.Lang(1644) + (!noColor ? '</span>' : ""); break; // "1644":"Не беспокоить",
            }

            return state;
        },

        getColorForStatus: function(status){
            var res = "#545454";

            status = parseInt(status);

            switch (status){
                case mcConst.states.offline: res = '#545454';  break; // "29" : "Не в сети",

                case mcConst.states.online: res = '#24F427'; break; // "30" : "В сети",

                case mcConst.states.webOnline: res = '#24F427'; break; // "30" : "В сети",

                case mcConst.states.away: res = 'blue'; break; // "31" : "Нет на месте",

                case mcConst.states.dnd: res = 'red'; break; // "32" : "Не беспокоить",
            }

            return res;
        },

        smartReplace: function (source, options) {
            for (var item in options){
                source = source.replace(new RegExp('{' + item + '}', 'g'), options[item]);
            }

            return source;
        },

        getIPs: function (callback){
            function handleCandidate(candidate){
                //match just the IP address
                var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
                var ip_addr = ip_regex.exec(candidate)[1];

                //remove duplicates
                if(ip_dups[ip_addr] === undefined)
                    callback(ip_addr);

                ip_dups[ip_addr] = true;
            }

            var ip_dups = {};

            //compatibility for firefox and chrome
            var RTCPeerConnection = window.RTCPeerConnection
                || window.mozRTCPeerConnection
                || window.webkitRTCPeerConnection;
            var useWebKit = !!window.webkitRTCPeerConnection;

            //bypass naive webrtc blocking using an iframe
            if(!RTCPeerConnection){
                //NOTE: you need to have an iframe in the page right above the script tag
                //
                //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
                //<script>...getIPs called in here...
                //
                var win = iframe.contentWindow;
                RTCPeerConnection = win.RTCPeerConnection
                    || win.mozRTCPeerConnection
                    || win.webkitRTCPeerConnection;
                useWebKit = !!win.webkitRTCPeerConnection;
            }

            //minimal requirements for data connection
            var mediaConstraints = {
                optional: [{RtpDataChannels: true}]
            };

            var servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};

            //construct a new RTCPeerConnection
            var pc = new RTCPeerConnection(servers, mediaConstraints);

            //listen for candidate events
            pc.onicecandidate = function(ice){

                //skip non-candidate events
                if(ice.candidate)
                    handleCandidate(ice.candidate.candidate);
            };

            //create a bogus data channel
            pc.createDataChannel("");

            //create an offer sdp
            pc.createOffer(function(result){

                //trigger the stun server request
                pc.setLocalDescription(result, function(){}, function(){});

            }, function(){});

            //wait for a while to let everything done
            setTimeout(function(){
                //read candidate info from local description
                var lines = pc.localDescription.sdp.split('\n');

                lines.forEach(function(line){
                    if(line.indexOf('a=candidate:') === 0)
                        handleCandidate(line);
                });
            }, 1000);

            //Test: Print the IP addresses into the console
            //getIPs(function(ip){console.log(ip);});
        },

        treeWalker: function(treeArray, deepIn, cb){
            if (serviceList.inArray(treeArray)){
                for (var i = 0; i < treeArray.length; i++){
                    if (cb) cb(treeArray[i]);

                    if (treeArray[i].hasOwnProperty(deepIn)) serviceList.treeWalker(treeArray[i][deepIn], deepIn, cb);
                }
            }
        },

        updateStatuses: function (stList, dataList){
            function setState(_user) {
                if (_user.hasOwnProperty("UIN")){
                    if (stList.Statuses && stList.Users) {
                        _user.State = stList.Statuses[stList.Users.indexOf(_user.UIN.toString())];
                    } else {
                        _user.State = stList[_user.UIN.toString()] !== undefined ? stList[_user.UIN.toString()] : mcConst.states.offline;
                    }
                }
            }

            if (stList && dataList){
                if (serviceList.isArray(dataList)){
                    dataList.forEach(setState);
                } else {
                    dataList.each(setState);
                }
            }
        },

        getCaretPosition: function  (ctrl) {
            var CaretPos = 0;

            if (document.selection) {
                var Sel = document.selection.createRange();

                Sel.moveStart('character', - ctrl.value.length);

                CaretPos = Sel.text.length;
            } else

            // Fucking firefox support
            if (ctrl.selectionStart || ctrl.selectionStart == '0'){
                CaretPos = ctrl.selectionStart;
            }

            return CaretPos;

        },

        setCaretPosition: function (ctrl, pos){
            if(ctrl.setSelectionRange) {
                ctrl.setSelectionRange(pos, pos);
            } else
            if (ctrl.createTextRange) {
                var range = ctrl.createTextRange();

                range.collapse(true);
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
            }
        },

        goToHelp : function (_path, go) {
            var path = (_path || window.location.hash).replace(/^#\/|^\/|\/$/g, "");
            var localPath =  serviceList.isIE()
                ? window.location.protocol + "//" + window.location.host
                : window.location.origin;

            if (_path.toLowerCase().indexOf("http") === 0){
                window.open(_path, '', '');
            } else
            if (mcConst.accordance.hasOwnProperty(path) && mcConst.accordance[path] !== ""){
                window.open(localPath + mcConst.accordance[path], '', '');
            } else
            if (go){
                window.open(localPath + "/" + path, '', '');
            }
        },

        HotkeyManager: function(debug){
            var keyList     = {};
            var presetList  = {};
            var maxKeyLevel = 0;
            var firedKeys   = {};
            var sourceMap   = {}; // key: [marker1, marker2, ...]
            var sourceMarker= "hotKeyMarker" + serviceList.RandomHash(5);

            function convertToKeyString(obj, code){
                return  (obj.ctrlKey ? "ctrl+" : "") +
                    (obj.shiftKey? "shift+": "") +
                    (obj.altKey  ? "alt+"  : "") +
                    code;
            }

            function findByKeyCode(name, key) {
                var res = null;

                presetList[name].source.forEach(function (preset) {
                    if (convertToKeyString(preset, preset.key) == key){
                        res = preset;
                    }
                });

                return res;
            }

            function registerKeys(name, preset){
                var source = preset.source;

                for (var i = 0; i < source.length; i++){
                    var key = convertToKeyString(source[i], source[i].key);

                    if (!keyList.hasOwnProperty(key)){
                        keyList[key] = {};
                    }

                    if (debug) console.log('Registered key: ' + key + "\npreset: " + name);

                    keyList[key][name] = source[i].func;

                    if (sourceMap[key]){
                        sourceMap[key].push(preset.marker);
                    } else {
                        sourceMap[key] = [preset.marker];
                    }
                }

                if (preset.target && !preset.ID){
                    preset.ID = webix.event(preset.target, "keydown", function(e){
                        var keyCode     = convertToKeyString(e, e.keyCode);
                        var skipDefault = false;
                        var where       = this;

                        if (keyList.hasOwnProperty(keyCode) &&
                            where.hasOwnProperty(sourceMarker) &&
                            sourceMap.hasOwnProperty(keyCode) &&
                            sourceMap[keyCode].indexOf(where[sourceMarker]) != -1
                        ) {

                            if (debug) {
                                console.log('Fired key: '+ keyCode);
                                console.log(e);
                            }

                            if (!firedKeys.hasOwnProperty(keyCode)) {
                                firedKeys[keyCode] = 'fired';

                                for (var i in keyList[keyCode]){
                                    if (where[sourceMarker] == presetList[i].marker){
                                        if (presetList[i].level == maxKeyLevel){
                                            var _preset = findByKeyCode(i, keyCode); // находим совпадающий индекс сочетания клавиш

                                            if (!_preset._locked){ //  если у него нет лока - выполняем
                                                // keyList[keyCode][i].call(where, e);

                                                skipDefault = !keyList[keyCode][i].call(where, e); //true;
                                            }
                                        } else {
                                            var source = presetList[i].source;

                                            for (var j in source){
                                                if (convertToKeyString(source[j], source[j].key) == keyCode){
                                                    skipDefault = source[j].skipDefault;

                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }

                                (function (key) {
                                    setTimeout(function () {
                                        delete firedKeys[key];
                                    }, 10);
                                })(keyCode);
                            }

                            if (skipDefault){
                                e.preventDefault();

                                return false;
                            }
                        }
                    });
                }
            }

            function removeKeys(name){
                for (var keyCode in keyList){
                    if (keyList[keyCode].hasOwnProperty(name)){
                        if (presetList[name].level == maxKeyLevel && maxKeyLevel > 0){
                            var entries = 0;
                            var prevKeyLevel = 0;

                            Object.keys(presetList).forEach(function (preset) {
                                if (presetList[preset].level == presetList[name].level){
                                    entries ++;
                                }

                                if (presetList[preset].level > prevKeyLevel && presetList[preset].level !== maxKeyLevel){
                                    prevKeyLevel = presetList[preset].level;
                                }
                            });

                            if (entries == 1){
                                maxKeyLevel = prevKeyLevel;
                            }
                        }

                        if (debug) console.log('Removing key: ' + keyCode + "\npreset: " + name);

                        removeLock(keyCode, presetList[name].key);

                        sourceMap[keyCode].splice(sourceMap[keyCode].indexOf(presetList[name].marker), 1);

                        if (sourceMap[keyCode].length == 0){
                            delete sourceMap[keyCode];
                        }

                        delete keyList[keyCode][name];
                    }
                }

                webix.eventRemove(presetList[name].ID);

                delete presetList[name];
            }

            function lockAction(key, except) {
                for (var i in presetList){
                    presetList[i].source.forEach(function (preset) {
                        if (i != except && key == convertToKeyString(preset, preset.key)){
                            if (!preset.hasOwnProperty("_locked")){
                                preset._locked = 1;
                            } else {
                                preset._locked ++;
                            }
                        }
                    });
                }
            }

            function removeLock(key) {
                for (var i in presetList){
                    presetList[i].source.forEach(function (preset) {
                        if (key == convertToKeyString(preset, preset.key) && preset.hasOwnProperty("_locked") && preset._locked > 0){
                            preset._locked --;
                        }
                    });
                }
            }

            this.addPreset = function(name, preset, target, disablePrevious){
                if (!presetList.hasOwnProperty(name)){
                    var marker = serviceList.RandomHash(10);

                    if (target.hasOwnProperty(sourceMarker)){
                        marker = target[sourceMarker];
                    } else {
                        target[sourceMarker] = marker;
                    }

                    presetList[name] = {
                        source: preset,
                        target: target,
                        marker: marker,
                        ID: null
                    };

                    if (disablePrevious) {
                        maxKeyLevel ++;
                    } else {
                        preset.forEach(function (item) {
                            if (item.lockPrev){
                                lockAction(convertToKeyString(item, item.key), name);
                            }
                        })
                    }

                    presetList[name].level = maxKeyLevel;

                    registerKeys(name, presetList[name]);
                } else {
                    // console.warn("Preset \"" + name + "\" is present");

                    return false;
                }
            };

            this.removePreset = function(name){
                if (presetList.hasOwnProperty(name)){
                    removeKeys(name);
                } else {
                    return false;
                }
            };
        },

        utcTime: function(msg, decode) {
            var dt = serviceList.isNumber(msg) ? (new Date(msg)) : (msg.dtUTC || msg.dt || msg);

            return dt
                ? serviceList.formatDate(new Date(
                    (new (Function.prototype.bind.apply(
                        Date,
                        [null].concat(serviceList.formatDate(dt, "yyyy.mm.dd.hh.nn.ss.zzz").split('.').map(function (val, idx) {
                            return idx === 1 ? val - 1 : val;
                        }))
                    ))).getTime() + (new Date()).getTimezoneOffset() * 1000 * 60 * (!decode ? -1 : 1)
                ), "dd.mm.yyyy.hh.nn.ss.zzz")
                : ""
                ;
        },

        reloadOrChangeProtocol: function () {
            if (mcConst.changeProtocol && mcConst.changeProtocol !== location.protocol) {
                location.protocol = mcConst.changeProtocol;

                window.open(location.href);
            } else {
                location.search = "";
                location.reload(true);
            }
        },

        myReplaceFormated : function(source, items){
            if (serviceList.isObject(items) && serviceList.isString(source)){
                for (var i in items){
                    source = source.replace(new RegExp("#{" + i + "}", "g"), items[i]);
                }
            }

            return source;
        },

        createKanbanLink: function (projectID, taskID, commentID) {
            return serviceList.getLocalHostPath(location.protocol !== 'file:') +
                "/" + mcConst.pathAliases.AliasKanban + "/#project=" + projectID + (taskID ? "&task=" + taskID + (commentID ? "&comment=" + commentID : "") : "");
        },

        createForumLink: function (path){
            return serviceList.isIE()
                ? window.location.protocol + "//" + window.location.host + window.location.pathname + mcConst.pathAliases.AliasForum + "/#" + path
                : window.location.origin + window.location.pathname + mcConst.pathAliases.AliasForum + "/#" + path;
        },

        getCommonFilesPath: function (isWebClient) {
            return this.myReplaceFormated("ftp://#{user}:#{pwd}@#{host}:#{port}/", {
                host : isWebClient ? window.location.host : mcConst.ServerInfo.Host,
                user : mcConst.FTP.CommonUser,
                pwd  : mcConst.FTP.CommonPWD,
                port : mcConst.UserInfo.PortFTP
            });
        },

        SHA1: function () {
            var sha1 = new Rusha();
            sha1.resetState();

            return sha1;
        },

        convertToEntities : function(tstr) {
            function dec2hex(i){
                var result = "0000";

                if      (i >= 0    && i <= 15)    { result = "000" + i.toString(16); }
                else if (i >= 16   && i <= 255)   { result = "00"  + i.toString(16); }
                else if (i >= 256  && i <= 4095)  { result = "0"   + i.toString(16); }
                else if (i >= 4096 && i <= 65535) { result =         i.toString(16); }

                return result
            }
            var bstr = "";

            if (tstr){
                for(var i = 0; i < tstr.length; ++i)
                {
                    if(tstr.charCodeAt(i) > 127)
                    {
                        bstr += "\\u" + dec2hex(tstr.charCodeAt(i));
                    } else {
                        bstr += tstr.charAt(i);
                    }
                }
            } else {
                throw new Error('convertToEntities: incoming data is empty or undefined: ' + tstr);
                //console.err('convertToEntities: incoming data is empty or undefined', true);
            }

            return bstr;
        },

        extractFileName : function(Path){
            var count = 0;

            for (var i = Path.length - 1; i >= 0; i--){
                count ++;

                if ((Path[i] === '\\') || (Path[i] === '/')) {
                    return Path.slice(i + 1, i + count);
                }
            }

            return Path;
        },

        extractFileExtension : function(Path){
            var path = (Path || "").split('.');

            return path[path.length - 1];
        },

        getLocalHostPath: function (isWebClient) {
            return isWebClient
                ? ( serviceList.isIE()
                        ? window.location.protocol + "//" + window.location.host
                        : window.location.origin
                )
                : ((mcConst.UserInfo.HTTPS ? "https://" : "http://") + (mcConst.ServerInfo.IPv6 ? "[" + mcConst.ServerInfo.Host + "]" : mcConst.ServerInfo.Host) + (
                    mcConst.UserInfo.HTTPS
                    ? (mcConst.UserInfo.PortNode != 443 ? ':' + mcConst.UserInfo.PortNode : '')
                    : (mcConst.UserInfo.PortNode != 80  ? ':' + mcConst.UserInfo.PortNode : ''))
                );
        },

        createHostPath: function (_host, _port, noProtocol) {
            var port  = _port || mcConst.UserInfo.PortNode;
            var host  = _host || mcConst.ServerInfo.Host;
            var https = window.location.protocol !== 'file:' ? window.location.protocol === "https:" : mcConst.UserInfo.HTTPS;
            
            return (noProtocol ? "" : (https ? "https://" : "http://")) + (host.indexOf(":") !== -1 ? (https ? (port != 443 ? ':' + port : '') : (port != 80  ? ':' + port : '')) : host);
        },

        formatFileSize: function(size){
            var index = 0;

            while (size > 1024){
                index ++;

                size = size / 1024;
            }

            return Math.round(size * 100)/100 + " " + ["B","KB","MB","GB","TB","PB","EB"][index];
        },

        fileTimeStamp: function (dd) {
            var currentTimeZoneOffsetInMS = (new Date()).getTimezoneOffset() * 60 * 1000;
            var now = dd ? new Date(dd) : new Date();
            var then = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                0,0,0
            );
            var diff = ((now.getTime() - then.getTime()) || (24 * 60 * 60 * 1000)) + currentTimeZoneOffsetInMS;

            return diff + "." + moment(now).diff(moment([0,0,0]), 'days');
        },

        getSelectedText: function (element){
            var res = {
                selectionStart : element.selectionStart,
                selectionEnd   : element.selectionEnd
            };

            // nothing is selected
            if (res.selectionStart !== res.selectionEnd) {
                var string = element.value;

                res.prefix  = string.substring(0, res.selectionStart);
                res.infix   = string.substring(res.selectionStart, res.selectionEnd);
                res.postfix = string.substring(res.selectionEnd);
            }

            // element.value = prefix + 'REPLACED TEXT' + postfix;

            return  res;
        },

        setSelectionText: function(inputBox, start, end){
            if (start > end) {
                start = end;
            }

            if ("selectionStart" in inputBox) { //gecko
                inputBox.setSelectionRange(start, end);
            } else {
                var r = inputBox.createTextRange();
                r.collapse(true);
                r.moveStart('character',start);
                r.moveEnd('character',end - start);
                r.select();
            }
        },
        
        convertArrayToObj: function (arr, item) {
            var res = {};

            if (item && serviceList.isString(item) && serviceList.isArray(arr)){
                arr.forEach(function (val) {
                    res[val[item]] = val;
                })
            } else {
                console.error('convertArrayToObj: is not Array or Item is not string!');
            }

            return res;
        },

        convertArrayObjToObj: function(arr, keyField){
            var res = {};

            for (var i = 0; i < arr.length; i++){
                if (arr[i].hasOwnProperty(keyField)){
                    res[arr[i][keyField]] = arr[i];
                }
            }

            return res;
        },

        getAvatar: function (sex) {
            var avatar = "";

            switch (sex){
                case 0: // alien
                    avatar = serviceList.insertIco("fa-user taskAvatar"); break;

                case 1: // male
                    avatar = serviceList.insertIco("fa-male taskAvatar"); break;

                case 2: // female
                    avatar = serviceList.insertIco("fa-female taskAvatar"); break;
            }

            return avatar;
        },

        getPriority: function (priority) {
            var res = "";

            switch (parseInt(priority)){
                case mcConst.priority.LOW      : res = mcLang(61); break;
                case mcConst.priority.MEDIUM   : res = mcLang(62); break;
                case mcConst.priority.HI       : res = mcLang(63); break;
                case mcConst.priority.IMPORTANT: res = mcLang(64); break;
                case mcConst.priority.URGENT   : res = mcLang(65); break;
                case mcConst.priority.CRITICAL : res = mcLang(66); break;
            }

            return res;
        },

        openKanbanLinkIfCan : function (e, $rootScope) {
            var res = false;

            if (e.target.nodeName === "A" && (
                    (e.target.origin + e.target.pathname == window.location.origin + window.location.pathname) ||
                    ((serviceList.isIE() && e.target.protocol + "//" + e.target.host + e.target.pathname) == (window.location.protocol + "//" + window.location.host + window.location.pathname))
                )){
                setTimeout(function () {
                    $rootScope.$broadcast('openKanbanURI', [e.target.href]);
                }, 10);

                e.preventDefault();

                res = true;
            }

            return res;
        },

        replaceKanbanLink: function (link, text) {
            var res = '<a href="' + link + '" title="' + link + '" ' + (link.indexOf('mailto') == -1 ? 'target="_blank"' : '') + ' class="internalLink">' + (text || link) + '</a>';

            if ((new RegExp(serviceList.isIE()
                    ? window.location.protocol + "//" + window.location.host + window.location.pathname
                    : window.location.origin + window.location.pathname
                )).test(link)){

                var parse = purl(link);

                var projectID = parse.fparam("project");
                var taskID    = parse.fparam("task");
                var commentID = parse.fparam("comment");

                res = '<a href="' + link + '" title="' + link + '" ' + (link.indexOf('mailto') == -1 ? 'target="_blank"' : '') + ' class="internalLink">';

                if (commentID){
                    res += "COMMENT #" + commentID;
                } else
                if (taskID){
                    res += "TASK #" + taskID;
                } else
                if (projectID){
                    res += "PROJECT #" + projectID;
                }

                res += '</a>';
            }

            return res;
        },

        getByCssClass: function(classList, _node){
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
                        if (list[i].className.search('\\b' + classArray[j] + '\\b') !== -1) {
                            result.push(list[i]);

                            break
                        }
                    }
                }

                res = result;
            }

            return res;
        },

        disableContextMenu : function(_view, exception){
            webix.event(_view.$view, "contextmenu", function(e){
                function skipItems(items, where) {
                    var flag = true;

                    if (items && items.length){
                        items.forEach(function (item) {
                            if (where.length && where.indexOf(item) !== -1){
                                flag = false;
                            }
                        });
                    }

                    return flag;
                }

                if ((
                        (e.target.nodeName !== "INPUT") &&
                        (e.target.nodeName !== "TEXTAREA") &&
                        skipItems(exception, e.target.className.split(" ").concat(e.target.parentNode.className.split(" ")).concat(e.target.parentNode.parentNode.className.split(" ")))
                    ) ||
                    (e.target.type === "button")) {

                    e.preventDefault();
                }
            });
            // webix.event(_view.$view, "contextmenu", function(e){
            //     if ((e.target.nodeName != "INPUT") && (e.target.nodeName != "TEXTAREA") || (e.target.type == "button")) {
            //         e.preventDefault();
            //     }
            // });
        },

        setStatusForUser: function(_user, state){
            var users = serviceList.getElementByClass(mcConst.storageOpts.STATUSICO + _user);

            for (var i = 0; i < users.length; i++){
                users[i].style.color = serviceList.getColorForStatus(state);
            }
        },

        Base64 : {
            // private property
            _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

            // public method for encoding
            encode : function (input) {
                var output = "";
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                var i = 0;

                input = Base64._utf8_encode(input);

                while (i < input.length) {

                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }

                    output = output +
                        this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                        this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

                }

                return output;
            },

            // public method for decoding
            decode : function (input) {
                var output = "";
                var chr1, chr2, chr3;
                var enc1, enc2, enc3, enc4;
                var i = 0;

                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

                while (i < input.length) {

                    enc1 = serviceList.Base64._keyStr.indexOf(input.charAt(i++));
                    enc2 = serviceList.Base64._keyStr.indexOf(input.charAt(i++));
                    enc3 = serviceList.Base64._keyStr.indexOf(input.charAt(i++));
                    enc4 = serviceList.Base64._keyStr.indexOf(input.charAt(i++));

                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;

                    output = output + String.fromCharCode(chr1);

                    if (enc3 !== 64) {
                        output = output + String.fromCharCode(chr2);
                    }

                    if (enc4 !== 64) {
                        output = output + String.fromCharCode(chr3);
                    }

                }

                output = serviceList.Base64._utf8_decode(output);

                return output;

            },

            // private method for UTF-8 encoding
            _utf8_encode : function (string) {
                string = string.replace(/\r\n/g,"\n");
                var utftext = "";

                for (var n = 0; n < string.length; n++) {

                    var c = string.charCodeAt(n);

                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    } else
                    if((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    } else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }

                }

                return utftext;
            },

            // private method for UTF-8 decoding
            _utf8_decode : function (utftext) {
                var string = "";
                var i  = 0;
                var c  = 0;
                var c1 = 0;
                var c2 = 0;
                var c3 = 0;

                while ( i < utftext.length ) {

                    c = utftext.charCodeAt(i);

                    if (c < 128) {
                        string += String.fromCharCode(c);
                        i++;
                    } else
                    if((c > 191) && (c < 224)) {
                        c2 = utftext.charCodeAt(i+1);
                        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                        i += 2;
                    } else {
                        c2 = utftext.charCodeAt(i+1);
                        c3 = utftext.charCodeAt(i+2);
                        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                        i += 3;
                    }

                }

                return string;
            }
        },

        isOdd : function (num) { return num % 2;},

        replaceMcComponents : function (text, isWeb) {
            var items = text.split(mcConst.terminator2);
            var elem  = "";
            var smileFile = "";

            items.forEach(function (item, idx) {
                if (serviceList.isOdd(idx)){
                    elem = item.split(mcConst.terminator3);

                    switch (item[0]) {
                        case ")":
                            elem[0] = elem[0].replace(")", "");

                            if (mcConst.SmileysSet[elem[0]]){
                                smileFile = mcConst.SmileysSet[elem[0]][elem[1]];
                            }

                            if (smileFile && (isWeb || !mcConst.ClientSettings.SysEventsDisableEmotions)){
                                items[idx] = serviceList.myReplaceFormated(
                                "<img src='#{path}/#{smile}'>",
                                    {
                                        path : MC_RESOURCE.TextSource.smileys + mcConst.SmileysSet[elem[0]].name,
                                        smile: smileFile
                                    }
                                );
                            } else {
                                items[idx] = elem[1];
                            }
                        break;

                        case "F":
                            var style = elem[0].split("#");
                            style = style[style.length - 1];

                            items[idx] = elem[1];

                            for (var i = 0; i < style.length; i++){
                                switch (style[i]) {
                                    case "B": items[idx] = "<b>" + items[idx] + "</b>"; break;
                                    case "I": items[idx] = "<i>" + items[idx] + "</i>"; break;
                                    case "U": items[idx] = "<u>" + items[idx] + "</u>"; break;
                                    case "S": items[idx] = "<strike>" + items[idx] + "</strike>"; break;
                                }
                            }
                        break;
                            
                        case ">":
                            var uin = elem[0].replace(">", "");

                            items[idx] = "<span class='brown bolder'>@" + elem[1] + "</span>";
                        break;

                        case "A":
                            var link = elem[0].replace("A", "");

                            if (link.indexOf("\\") === 0) {
                                link = link.replace("\\\\", "local://").replace(/\\/g, "/");
                            }

                            items[idx] = link + mcConst.myChatLinkTitle + elem[1];
                        break;
                    }
                }
            });
            
            return items.join("");
        },

        numberList: function (length, forvardZero) {
            var strLength = length.toString().length;
            var res = (new Array(length || 1)).join('.').split('.');

            res = res.map(function (itm, idx) {
                var st = idx.toString();

                return forvardZero ? (new Array(strLength + 1 - st.length)).join('0') + st : st;
            });

            return res;
        },

        forvardZero: function (st, strLength, symbol) {
            st = st.toString();
            
            return (new Array(strLength + 1 - st.length)).join(symbol || '0') + st;
        },

        toHex: function (numb, hexLen){
            var str = "";

            numb = parseInt(numb, 10);

            while (numb > 0){
                str  = hexCodes[numb % 16] + str;
                numb = Math.floor(numb / 16);
            }

            while (str.length < hexLen){
                str = "0" + str;
            }

            return str;
        },

        FadeControl: function Fade(elem) {
            var el   = elem;
            var stop = null;

            this.in = function () {
                stop = "out";
    
                var last = new Date();
                var tick = function() {
                    if (stop === "in") {
                        stop = null;
                    } else {
                        el.style.opacity = + el.style.opacity + (new Date() - last) / 400;

                        last = new Date();

                        if (el.style.opacity <= 1) {
                            (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
                        } else {
                            stop = null;
                        }
                    }
                };

                tick();
            };

            this.out = function () {
                stop = "in";

                var last = new Date();
                var tick = function() {
                    if (stop === "out"){
                        stop = null;
                    } else {
                        el.style.opacity = + el.style.opacity - (new Date() - last) / 400;

                        last = new Date();

                        if (el.style.opacity > 0) {
                            (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
                        } else {
                            stop = null;
                        }
                    }
                };

                tick();
            };
        },

        Capitalize: function (str) {
            return str[0].toUpperCase() + str.substring(1).toLowerCase();
        },

        ObjToString : function(_obj){
            var res = "";

            if (serviceList.isString(_obj) || serviceList.isNumber(_obj)){
                res = _obj.toString() + "";
            } else {
                try {
                    res = JSON.stringify(_obj);
                } catch (e){
                    res = _obj.toString() + "";
                }
            }

            return res;
        },

        typeFlag: function (displayFlag, lookField) {
            var lng = $$(displayFlag);
            var lastChar = $$(lookField).getValue();
            lastChar = lastChar[lastChar.length - 1];

            if (lastChar){
                if (lastChar.match(/[a-zA-Z]/)) {
                    lng.define('template', 'EN');
                    lng.refresh();
                } else
                if (lastChar.match(/[а-яА-Я]/)){
                    lng.define('template', 'RU');
                    lng.refresh();
                } else
                if (lastChar.match(/[їЇіІєЄ]/)){
                    lng.define('template', 'UA');
                    lng.refresh();
                }
            }
        },

        buildForumStructure: function (struct, data, ids, structCash, exeptTopicks) {
            var newIds  = [];
            var newData = [];
            var idx     = 0;
            var item    = null;

            while (idx < data.length){
                item = data[idx];

                if (item){
                    if (item.Type === mcConst.msgTypes.topic && exeptTopicks){
                        data.splice(idx, 1);
                    } else

                    if (serviceList.inArrayNoStrict(item.ParentID, ids) !== -1){
                        item.id = item.Type + "_" + item.ID;

                        structCash[mcConst.msgTypes.section + "_" + item.ParentID].Item.data.push(item);

                        structCash[item.id] = {
                            Item: item
                        };

                        if (item.Type === mcConst.msgTypes.section) {
                            newIds.push(item.ID);

                            structCash[item.id].Item.data = [];
                            structCash[item.id].Data      = structCash[item.id].Item.data;
                        }

                        data.splice(idx, 1);
                    } else {
                        newData.push(item);

                        idx ++;
                    }
                } else {
                    i ++;
                }

                item = null;
            }

            return data.length > 0 ? serviceList.buildForumStructure(struct, newData, newIds, structCash, exeptTopicks) : struct;
        },

        insertAtCursor: function (textarea, val, isPara) {
            var res = 0;

            if (document.selection) {
                var sel = document.selection.createRange();

                textarea.focus();

                sel.text = val;

                res = sel.text.toString().length - 1;
            } else
            if (textarea.selectionStart || textarea.selectionStart == '0') {
                var startPos = textarea.selectionStart;
                var endPos   = textarea.selectionEnd;

                var prevText = textarea.value.substring(0, startPos);
                var nextText = textarea.value.substring(endPos, textarea.value.length);

                textarea.value =
                    (isPara && prevText.length && prevText[prevText.length - 1] !== "\n" ? prevText + "\n" : prevText) +
                     val +
                    (isPara && nextText.length && nextText[0] !== "\n" ? "\n" + nextText : nextText);

                textarea.selectionStart = startPos + val.length + (isPara ? 1 : 0);
                textarea.selectionEnd   = startPos + val.length + (isPara ? 1 : 0);

                res = textarea.selectionEnd;
            } else {
                textarea.value += (isPara && textarea.value.length && textarea.value[textarea.value.length - 1] !== "\n") ? "\n" + val : val;

                res = textarea.value.length - 1;
            }

            return res;
        },

        parseAttachment: function (text, files, pref, cb, duManager, generateLinks){
            var link  = "";
            var closeSymbol = "}";
            var isWeb = location.protocol !== 'file:';

            if (text.indexOf(pref) >=0 ){
                text = text.split(pref);

                for (var i = 0; i < text.length; i++){
                    if (!i && text[i].length){
                        if (cb) {
                            text[i] = cb(text[i], files);
                        }

                        continue;
                    }

                    var idx       = text[i].indexOf(closeSymbol);
                    var name      = serviceList.copy(text[i], 0, idx);
                    var endOfLine = serviceList.copy(text[i], idx + 1, text[i].length - 1);
                    var parsedEndLine = "";

                    if (files && files.hasOwnProperty(name)){
                        if (pref === mcConst.prefix.file){
                            link = serviceList.myReplaceFormated(
                                '<a href="#{link}" class="internalLink" title="#{link}" target="_blank">#{name}</a>',
                                {
                                    link: serviceList.getLocalHostPath(isWeb) + "/" + mcConst.pathAliases.AliasFiles + "/kanban/" + files[name].Hash + "/" + name,
                                    name: serviceList.insertIco("fa-file-o", "fs90") + name
                                }
                            );
                        } else

                        if (pref === mcConst.prefix.image){
                            imgIndex++;

                            if (generateLinks){
                                generateLinks(files[name], name);
                            }

                            link = serviceList.myReplaceFormated(
                                '<a href="#{hrefImg}" class="internalLink" target="_blank"><img src="#{loadImage}" alt=""></a>',
                                {
                                    hrefImg  : files[name].lnkHref ? files[name].lnkHref : "#",
                                    loadImage: files[name].imgSrc  ? files[name].imgSrc  : mcConst.imagesPath.loadImage
                                }
                            );

                            duManager.loadThumbs([files[name].Hash, name]);
                        }

                        if (cb) {
                            parsedEndLine = cb(endOfLine, files);
                        }

                        text[i] = link + (parsedEndLine || endOfLine);
                    } else {
                        if (cb) {
                            parsedEndLine = cb(endOfLine, files);

                            text[i] = link + (parsedEndLine || endOfLine);
                        }
                    }
                }
                
                text = text.join('');
            } else
            if (cb) {
                text = cb(text, files);
            }

            return text;
        },

        checkNumbersCounter: function(code){
            if (this.config.view === "counter" && serviceList.inArray(code, mcConst.keyCodes.Digits.concat(mcConst.keyCodes.EditSymbols)) === -1){
                return false;
            }
        },

        isImage: function (file) {
            return serviceList.inArrayNoStrict(serviceList.extractFileExtension(file), ["png", "jpg", "jpeg", "gif", "bmp"]) !== -1;
        },

        getCurrentChantTypeForFiles: function (type) {
            // var currentChat = type;
            var res         = 1;

            switch (type){
                case "UIN"   : res = mcConst.whereFiles.private;break;
                case "UID"   : res = mcConst.whereFiles.conf;   break;
                case "Forum" : res = mcConst.whereFiles.forum;  break;
                case "Kanban": res = mcConst.whereFiles.kanban; break;
                case "BBS"   : res = mcConst.whereFiles.bbs;    break;
            }

            return res;
        }
};
    
    var multiple    = {
        kanban: {
            FilterFiled : function (options){
                function clearFilter(filter, noFocus){
                    if (clearShowed && !options.noCloseBtn) {
                        $$("clearBtn" + rnd).hide();

                        clearShowed = false;
                    }

                    options.thisFilter.setValue('');
                    options.thisFilter.$setValue('');

                    if (!filter) {
                        doFilter(noFocus);
                    } else {
                        options.List.filter("");
                    }

                    if (options.onClear) {
                        options.onClear();
                    }
                }

                function checkParams(text, obj, paramList, strict) {
                    var fp = [];
                    var show = true;

                    for (var i = 0; i < paramList.length; i++){
                        var param = paramList[i];

                        if (serviceList.isArray(obj[param])){
                            fp.push(obj[param].join('|').toLowerCase());
                        } else
                        if (param.indexOf(':') === -1){
                            if (obj[param] !== undefined) fp.push(obj[param].toString().toLowerCase());
                        } else {
                            var _param = param.split(':');

                            fp = fp.concat(obj[_param[0]].toString().toLowerCase().split(_param[1]));
                        }
                    }

                    if (serviceList.isString(text)){
                        if (strict){
                            show = fp.indexOf(text.toString().toLowerCase()) !== -1;
                        } else {
                            show = fp.join('|').indexOf(text) !== -1;
                        }
                    } else

                    if (serviceList.isBoolean(text)){
                        show = fp.indexOf(text.toString().toLowerCase()) !== -1;
                    } else

                    if (serviceList.isArray(text)){
                        for (var i = 0; i < text.length; i ++){
                            if (fp.indexOf(text[i].toString().toLowerCase()) === -1) {
                                show = false;

                                break;
                            }
                        }
                    }

                    return show;
                }

                function doFilter(noFocus) {
                    if (options.List) {
                        var text        = serviceList.trim(options.thisFilter.getValue().toString()).toLowerCase();
                        var listFilters = options.List._otherFilterOptions ? Object.keys(options.List._otherFilterOptions) : [];
                        var ofo         = options.List._otherFilterOptions;

                        if (text === "" && !listFilters.length){
                            clearFilter(true);

                            if (!noFocus) {
                                options.thisFilter.focus();
                            }
                        } else {
                            var res = [];

                            options.List.filter(function(obj){
                                var filterResult = true;
                                var subFilter    = true;

                                if (!options.filterParams || options.filterParams.length == 0){
                                    options.filterParams = ['value'];
                                }

                                if (text !== ""){
                                    filterResult = checkParams(text, obj, options.filterParams);
                                }

                                if (filterResult && listFilters.length){
                                    for (var i = 0; i < listFilters.length; i ++){
                                        var searchText = ofo[listFilters[i]].items;

                                        if (serviceList.isString(searchText)){
                                            subFilter = subFilter && checkParams(searchText, obj, ofo[listFilters[i]].fields);
                                        } else

                                        if (serviceList.isArray(searchText)){
                                            subFilter = ofo[listFilters[i]].union === mcConst.methods.AND;

                                            for (var j = 0; j < searchText.length; j ++){
                                                subFilter = ofo[listFilters[i]].union === mcConst.methods.OR
                                                    ? subFilter || checkParams(searchText[j], obj, ofo[listFilters[i]].fields, true)
                                                    : subFilter && checkParams(searchText[j], obj, ofo[listFilters[i]].fields, true)
                                                ;

                                                if (ofo[listFilters[i]].union === mcConst.methods.AND){
                                                    break;
                                                }
                                            }
                                        }

                                        if (!subFilter) {
                                            break;
                                        }
                                    }
                                }

                                filterResult = filterResult && subFilter;

                                return filterResult ? !!res.push(obj) : false;
                            });

                            if (options.onAfterFilter){
                                options.onAfterFilter(res);

                                res = null;
                            }
                        }

                        if (!clearShowed && text !== "" && !options.noCloseBtn) {
                            clearShowed = true;

                            $$("clearBtn" + rnd).show();

                            if (!noFocus) setTimeout(function () {
                                options.thisFilter.focus();
                            }, 5);
                        }
                    }
                }

                var clearShowed = false;
                var rnd         = Math.random();
                var _filter     = { rows: [
                    { height: (options.topSpacer === undefined)? 0 : options.topSpacer },

                    { cols: [
                        { view: "search", padding: 0, css: 'noPaddingChild', placeholder: options.searchText || serviceList.Lang(10), keyPressTimeout: 400, on: { // "10" :"Введите текст для поиска",
                            onKeyPress: function (code, e) {
                                if (code === 27 && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                                    var needFocus = this.getValue().length;

                                    clearFilter();

                                    if (needFocus) {
                                        this.focus();
                                    }
                                }
                            },
                            onTimedKeypress : function () {
                                doFilter();
                            },
                            onAfterRender : function(){
                                options.thisFilter = this;
                                _filter.thisFilter = this;
                                
                                options.List = $$(options.listName);

                                setTimeout(function () {
                                    _filter.thisFilter.getInputNode().setAttribute("autocomplete", "off");
                                }, 100);
                            }
                        }},

                        { id: "clearBtn" + rnd, view: "button", type: "iconButton", icon: "times", width: 27, hidden: true, click: function () {
                            setTimeout(function () {
                                clearFilter();
                            }, 50);
                        }}
                    ]},

                    { height: options.bottomSpacer === undefined ? 4 : options.bottomSpacer }
                ]};

                if (options.id){
                    _filter.id = options.id;
                }

                if (options.rows){
                    _filter = serviceList.Marge(_filter, options.rows);
                }

                _filter.relocateList = function (newList, noFocus) {
                    var needClear = !!options.List;

                    options.listName = newList;
                    options.List = $$(newList);

                    if (options.List){
                        if (needClear) {
                            clearFilter(null, noFocus);
                        }
                    } else {
                        options.listName = "";
                        options.List = null;
                    }
                };

                _filter.doFilter = doFilter;
                _filter.clearFilter = clearFilter;

                return _filter;
            },
            createLink  : function (projectID, taskID, commentID) {
                return serviceList.isIE()
                    ? window.location.protocol + "//" + window.location.host + window.location.pathname + "#project=" + projectID + (taskID ? "&task=" + taskID + (commentID ? "&comment=" + commentID : "") : "")
                    : window.location.origin + window.location.pathname + "#project=" + projectID + (taskID ? "&task=" + taskID + (commentID ? "&comment=" + commentID : "") : "");
            },
            insertIco   : function (ico, size, attr){
                return "<span class='webix_icon byCenter " + ico + " " + ((size) ? size : "fa-lg") + "' " + (attr ? (serviceList.isString(attr) ? attr : attr.join(' ')) : "") + "></span>"
            }
        },

        admin: {
            FilterFiled : function (options){
                function clearFilter(){
                    if (clearShowed) {
                        $$("clearBtn" + rnd).hide();

                        clearShowed = false;
                    }

                    options.prevText = "";

                    options.thisFilter.$setValue('');
                    options.List.filter("");

                    if (options.onClear) {
                        options.onClear();
                    }
                }

                function doFilter(reFilter, noFocus) {
                    var saveText = options.thisFilter.getValue().toString();
                    var text = serviceList.trim(saveText).toLowerCase();

                    if (text == ""){
                        clearFilter();

                        if (!options.escPressed && !noFocus) {
                            options.thisFilter.focus();
                        }
                    } else {
                        var res = [];

                        if (!options.prevText || options.prevText != text || reFilter){
                            options.prevText = text;

                            options.List.filter(function(obj){
                                var fp = [];

                                if (!options.filterParams || options.filterParams.length == 0){
                                    options.filterParams = ['value'];
                                }

                                for (var i = 0; i < options.filterParams.length; i++){
                                    if (serviceList.isArray(obj[options.filterParams[i]])){
                                        fp.push(obj[options.filterParams[i]].join('|'));
                                    } else {
                                        fp.push(obj[options.filterParams[i]]);
                                    }
                                }

                                var filter = fp.join('|');

                                filter = filter.toString().toLowerCase();

                                if (filter.indexOf(text) != -1) {
                                    res.push(obj);
                                }

                                return (filter.indexOf(text) != -1);
                            });

                            if (options.onAfterFilter){
                                options.onAfterFilter(res);

                                res = null;
                            }

                            if (!clearShowed) {
                                clearShowed = true;

                                var pos = serviceList.getCaretPosition(options.thisFilter.getInputNode());

                                $$("clearBtn" + rnd).show();

                                options.thisFilter.$setValue(saveText);
                                
                                if (!noFocus) {
                                    options.thisFilter.focus();

                                    serviceList.setCaretPosition(options.thisFilter.getInputNode(), pos);
                                }
                            }
                        }
                    }
                }

                var rnd = Math.random();
                var clearShowed = false;
                var _filter = { rows: [
                    { cols: [
                        { view: "text", padding: 0, css: 'noPaddingChild', tooltip: options.tooltip || "", placeholder: options.searchText || serviceList.Lang(71), keyPressTimeout: 500, on: { // "71" : "Введите текст для поиска"
                            onKeyPress: function (code, e) {
                                options.escPressed = false;

                                if (code === 27 && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                                    options.escPressed = true;

                                    options.nowCleared = options.thisFilter.getValue().toString() != "";

                                    clearFilter();

                                    if (options.nowCleared) {
                                        this.focus();
                                    } else {
                                        this.blur();

                                        webix.UIManager.setFocus(document);
                                    }
                                }
                            },
                            onTimedKeypress : function () {
                                if (webix.UIManager.hasFocus(this)) {
                                    doFilter();
                                }
                            },
                            onAfterRender : function(){
                                options.thisFilter = this;
                                _filter.thisFilter = this;
                                options.List       = $$(options.listName);

                                this.getInputNode().setAttribute("autocomplete", "off");
                            }
                        }},

                        { id: "clearBtn" + rnd, view: "button", type: "iconButton", icon: "times", width: 27, hidden: true, click: clearFilter } // , css: "noBorder webixBlue"
                    ]},

                    { height: (options.bottomSpacer == undefined)? 4 : options.bottomSpacer }
                ]};

                if (options.id){
                    _filter.id = options.id;
                }

                _filter.doFilter = doFilter;
                _filter.clearFilter = clearFilter;

                return _filter;
            },
            checkRights : function (_id){
                var id = parseInt(_id) - 1;

                return mcConst.MyRightsSet.RightsSet[id] === '1' && (!_gLock.navAccess || (_gLock.navAccess && !_gLock.navAccess[_id]));
            }
        },

        chat: {
            FilterFiled : function (options){
                function clearFilter(){
                    if (clearShowed) {
                        $$(CLEAR).hide();

                        clearShowed = false;
                    }

                    options.thisFilter.$setValue('');
                    options.List.filter("");

                    if (options.onClear) {
                        options.onClear();
                    }
                }

                var rnd         = serviceList.RandomHash(6);
                var EDITOR      = (options.id || rnd) + "Editor";
                var CLEAR       = "clearBtn" + (options.clearID || rnd);
                var clearShowed = false;

                var _filter     = { id: options.id || (rnd + 'FilterBlock'), rows: [
                    { cols: [
                        { id: EDITOR, view: "text", padding: 0, css: 'noPaddingChild', placeholder: options.placeholder || "Search", keyPressTimeout: 500, on: { // "71" : "Введите текст для поиска"
                            onKeyPress: function(code, e){
                                if (options.keyEvents.hasOwnProperty(code)){
                                    if (options.keyEvents[code](options.List.getSelectedItem())) {
                                        e.preventDefault();
                                    }
                                }
                            },

                            onTimedKeypress : function(){
                                var origin = serviceList.trim(this.getValue().toString());
                                var text   = origin.toLowerCase();

                                if (text === ""){
                                    clearFilter();

                                    this.focus();
                                } else {
                                    options.List.filter(function(obj){
                                        var fp = [];

                                        if (!options.filterParams || options.filterParams.length === 0){
                                            options.filterParams = ['value'];
                                        }

                                        for (var i = 0; i < options.filterParams.length; i++){
                                            if (serviceList.isArray(obj[options.filterParams[i]])){
                                                fp.push(obj[options.filterParams[i]].join('|'));
                                            } else {
                                                fp.push(obj[options.filterParams[i]]);
                                            }
                                        }

                                        var filter = fp.join('|');

                                        filter = filter.toString().toLowerCase();

                                        return (filter.indexOf(text) !== -1);
                                    });

                                    if (!clearShowed) {
                                        clearShowed = true;

                                        if (!options.noClearBtn) {
                                            $$(CLEAR).show();
                                        }

                                        this.$setValue(origin);
                                        this.focus();
                                    }
                                }

                                if (options.OnEnterText){
                                    options.OnEnterText(origin);
                                }
                            },
                            onAfterRender : function(){
                                options.thisFilter = this;
                                options.List       = $$(options.listName);
                                options.hotkeyID   = serviceList.RandomHash(10);

                                if (serviceList._hotkeys){
                                    serviceList._hotkeys.addPreset(options.hotkeyID, [{
                                        key : mcConst.keyCodes.esc,

                                        func: function () {
                                            if (options.thisFilter.getValue().toString() !== "") {
                                                options.nowCleared = true;
                                            }

                                            clearFilter();

                                            options.thisFilter.focus();
                                        }
                                    }], options.thisFilter.getNode());
                                }
                            },
                            onDestruct: function () {
                                serviceList._hotkeys.removePreset(options.hotkeyID);
                            }
                        }},

                        { id: CLEAR, view: "button", type: "iconButton", icon: "times", width: 27, hidden: true, on: {onItemClick: clearFilter} } // , css: "noBorder webixBlue"
                    ]},

                    { height: (options.bottomSpacer == undefined)? 4 : options.bottomSpacer }
                ]};

                _filter.EDITOR = EDITOR;
                _filter.CLEAR  = CLEAR ;
                _filter.clearFilter = clearFilter;

                return _filter;
            }
        },

        forum: {
            FilterFiled : function (options){
                function clearFilter(){
                    if (clearShowed) {
                        $$("clearBtn" + rnd).hide();

                        clearShowed = false;
                    }

                    options.thisFilter.$setValue('');
                    options.List.filter("");

                    if (options.onClear) {
                        options.onClear();
                    }
                }

                var rnd = Math.random();
                var clearShowed = false;
                var res = { rows: [
                    { height: (options.topSpacer === undefined)? 0 : options.topSpacer },

                    { cols: [
                        { view: "search", padding: 0, css: 'noPaddingChild', placeholder: serviceList.Lang(options.placeHolder || 10), keyPressTimeout: 600, on: { // "10" :"Введите текст для поиска",
                            onKeyPress: function (code, e) {
                                if (code === 27 && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                                    clearFilter();

                                    this.focus();
                                }
                            },
                            onTimedKeypress : function(){
                                var text = serviceList.trim(this.getValue().toString()).toLowerCase();

                                if (!options.List) {
                                    options.List = $$(options.listName);
                                }

                                if (text == ""){
                                    clearFilter();

                                    this.focus();
                                } else {
                                    options.List.filter(function(obj){
                                        var fp = [];

                                        if (!options.filterParams || options.filterParams.length == 0){
                                            options.filterParams = ['value'];
                                        }

                                        for (var i = 0; i < options.filterParams.length; i++){
                                            fp.push(obj[options.filterParams[i]]);
                                        }

                                        var filter = fp.join('|');

                                        filter = filter.toString().toLowerCase();

                                        return (filter.indexOf(text) != -1);
                                    });

                                    if (!clearShowed) {
                                        clearShowed = true;

                                        var pos = serviceList.getCaretPosition(this.getInputNode());

                                        $$("clearBtn" + rnd).show();

                                        this.$setValue(text);
                                        this.focus();

                                        serviceList.setCaretPosition(this.getInputNode(), pos);
                                    }
                                }
                            },
                            onAfterRender : function(){
                                options.thisFilter = this;
                                options.List = $$(options.listName);
                            }
                        }},

                        { id: "clearBtn" + rnd, view: "button", type: "iconButton", icon: "times", width: 27, hidden: true, click: clearFilter } // , css: "noBorder webixBlue"
                    ]},

                    { height: (options.bottomSpacer == undefined)? 4 : options.bottomSpacer }
                ]};

                if (options.id){
                    res.id = options.id;
                }

                if (options.rows){
                    res = serviceList.Marge(res, options.rows);
                }

                res.relocateList = function (newList) {
                    options.List = $$(newList);

                    clearFilter();
                };

                return res;
            },
            createLink  : function (path) {
                return serviceList.isIE()
                    ? window.location.protocol + "//" + window.location.host + window.location.pathname + "#" + path
                    : window.location.origin + window.location.pathname + "#" + path;
            },
            disableContextMenu : function (_view, exception){
                webix.event(_view.$view, "contextmenu", function(e){
                    function emersion(target, count) {
                        var res = [];
                        var parent = target.parentElement;

                        if (parent){
                            res = res.concat(parent.className.split(" "));

                            if (count){
                                count --;
                            }

                            if (parent.nodeName !== "#document" && count > 0){
                                res = res.concat(emersion(parent, count));
                            }
                        }

                        return res;
                    }

                    function skipItems(items, where, target) {
                        var flag = true;

                        if (items && items.length){
                            items.forEach(function (item) {
                                if ((where.length && where.indexOf(item) !== -1) || emersion(target, 4).indexOf(item) !== -1){
                                    flag = false;
                                }
                            });
                        }

                        return flag;
                    }

                    if (((e.target.nodeName !== "INPUT") && (e.target.nodeName !== "TEXTAREA") && skipItems(exception, e.target.className.split(" "), e.target))
                        || (e.target.type === "button")) {
                        e.preventDefault();
                    }
                });
            }
        }
    };

    if (_api && multiple[_api]){
        Object.keys(multiple[_api]).forEach(function (keyName) {
            serviceList[keyName] = multiple[_api][keyName];
        });
    }

    return serviceList;
}

(function(){
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (callback, thisArg) {
            var T, k;

            if (!this) {
                throw new TypeError(' this is null or not defined');
            }

            var O = Object(this);
            var len = O.length >>> 0;

            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }

            if (arguments.length > 1) {
                T = thisArg;
            }

            k = 0;

            while (k < len) {
                var kValue;

                if (k in O) {
                    kValue = O[k];
                    callback.call(T, kValue, k, O);
                }

                k++;
            }
        };
    }
})();
