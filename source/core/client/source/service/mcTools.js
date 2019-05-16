/**
 * Created by Gifer on 21.07.2015.
 */

var _Dragging = function(){
    return {
        move : function(divid, xpos, ypos){
            divid.style.left = xpos + 'px';
            divid.style.top  = ypos + 'px';
        },
        startMoving : function(divid, container, evt){
            evt = evt || window.event;

            var posX  = evt.clientX,
                posY  = evt.clientY,
                diffX = posX - divid.offsetLeft,
                diffY = posY - divid.offsetTop,

                parent = document.getElementById(container),

                eWi = parseInt(divid.offsetWidth),
                eHe = parseInt(divid.offsetHeight),
                cWi = parseInt(parent.offsetWidth),
                cHe = parseInt(parent.offsetHeight);

            document.onmousemove = function(evt){
                evt = evt || window.event;

                var posX = evt.clientX,
                    posY = evt.clientY,
                    aX = posX - diffX,
                    aY = posY - diffY;

                if (aX < 0) aX = 0;
                if (aY < 0) aY = 0;
                if (aX + eWi > cWi) aX = cWi - eWi;
                if (aY + eHe > cHe) aY = cHe -eHe;

                _Dragging.move(divid,aX,aY);
            }
        },
        stopMoving : function(){
            document.onmousemove = function(){}
        }
    }
}();

// =================================================================

function setLocalizations(){
    webix.i18n.parseFormat = '%d.%m.%Y';
    webix.i18n.locales["en"] = webix.i18n.locales["en-US"];

    webix.i18n.locales["ru"]={
        groupDelimiter:",",
        groupSize:3,
        decimalDelimeter:".",
        decimalSize:2,

        dateFormat:"%d.%m.%Y",
        timeFormat:"%h:%i %A",
        longDateFormat:"%d %F %Y",
        fullDateFormat:"%d/%m/%Y %h:%i %A",

        price:"${obj}",
        priceSettings:null, //use number defaults


        fileSize: ["b","Kb","Mb","Gb","Tb","Pb","Eb"],

        calendar: {
            monthFull  : ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ],
            monthShort : ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек" ],
            dayFull    : ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
            dayShort   : ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
            hours      : "Час",
            minutes    : "Минут",
            done       : "Готово"
        },
        controls:{
            select:"Выбрать"
        }
    };

    webix.i18n.locales["uk"]={
        groupDelimiter:",",
        groupSize:3,
        decimalDelimeter:".",
        decimalSize:2,

        dateFormat:"%d.%m.%Y",
        timeFormat:"%h:%i %A",
        longDateFormat:"%d %F %Y",
        fullDateFormat:"%d/%m/%Y %h:%i %A",

        price:"${obj}",
        priceSettings:null, //use number defaults


        fileSize: ["b","Kb","Mb","Gb","Tb","Pb","Eb"],

        calendar: {
            monthFull  : ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень" ],
            monthShort : ["Січ", "Лют", "Бер", "Квт", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру" ],
            dayFull    : ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"],
            dayShort   : ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
            hours      : "Годинн",
            minutes    : "Хвилин",
            done       : "Готово"
        },
        controls:{
            select:"Обрати"
        }
    };
}

Date.prototype.startOfDay = function(){
    var now = this.getTime();

    return  now - (this.getHours()*1000*60*60 + this.getMinutes()*1000*60 + this.getSeconds()*1000 + this.getMilliseconds());
};

