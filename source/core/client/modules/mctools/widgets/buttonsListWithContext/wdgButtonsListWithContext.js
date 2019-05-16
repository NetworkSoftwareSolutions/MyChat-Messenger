 "use strict";

 (function () {
     if (window.mcWidgets){
         window.mcWidgets.ButtonsListWithContext = function ButtonsListWithContext($rootScope){
             function show(btn, options, list, fillParams){
                 var wndId = mcService.RandomHash(7);

                 if (mcService.isString(list)) {
                     list = $$(list);
                 }

                 $rootScope.hotKeyDispatcher.addPreset(wndId, [{
                     key : mcConst.keyCodes.enter,
                     lockPrev: true,
                     func: function(){
                         var form = btn.dialog.getChildViews()[1];

                         if (btn.confirm.apply(form, [].concat(form.getChildViews()).concat(list ? list.getSelectedItem() : [])) !== true) {
                             // если возвращает true, то зыкрывать диалоговое окно не нужно, в поле для ввода текста есть ошибка и т.д.
                             btn.dialog.close();
                         }
                     }
                 }, {
                     key : mcConst.keyCodes.esc,
                     lockPrev: true,
                     func: function(){
                         btn.dialog.close();
                     }
                 }], document, true);

                 btn.dialog = webix.ui(mcService.Marge(options, {
                     view     : "window",
                     position : "center",
                     id       : wndId,
                     head     : btn.title,
                     body     : {
                         view : 'form',
                         rules:{
                             "Name"    : webix.rules.isNotEmpty
                         },
                         elements : [{
                             view       : "text",
                             label      : btn.editTitle,
                             name       : 'Name',
                             labelPosition : 'top',
                             required   : "true"
                         }]
                         .concat(btn.additionalItems ? btn.additionalItems : [])
                         .concat({
                             cols : [{
                                 view  : "button",
                                 value : btn.okTitle,
                                 click : function() {
                                     var form = this.getFormView();

                                     if (btn.confirm.apply(form, [].concat(form.getChildViews()).concat(list ? list.getSelectedItem() : [])) !== true) { // если возвращает true, то зыкрывать диалоговое окно не нужно, в поле для ввода текста есть ошибка и т.д.
                                         btn.dialog.close();
                                     }
                                 }
                             }, {
                                 view  : "button",
                                 type  : "danger",
                                 value : btn.cancelTitle,
                                 click : function(){
                                     btn.dialog.close();

                                     if (btn.abort){
                                         btn.abort();
                                     }
                                 }
                             }]
                         })
                     },
                     on : {
                         onShow : function(){
                             if (fillParams) {
                                 this.getChildViews()[1].getChildViews().forEach(function(item, id){
                                     if (btn.fillItems[id] != undefined) item.setValue(list.getSelectedItem()[btn.fillItems[id]]);
                                 });
                             }

                             this.getChildViews()[1].getChildViews()[0].focus();

                             // $rootScope.$broadcast('addShowedWindow', [wndId, this]); // сообщаем менеджеру переходов между экранами, что появилось новое окно и его нужно закрыть при изменении экрана
                         },
                         onDestruct : function(){
                             $rootScope.hotKeyDispatcher.removePreset(wndId);
                         }
                     }
                 }));

                 if (!btn.onBeforeShow || (btn.onBeforeShow && btn.onBeforeShow.apply(btn, [list.getSelectedItem(), list]))){
                     btn.dialog.show();
                 } else {
                     btn.dialog.close();
                 }
             }

             var self = this;
             var params = [];

             this.editButtons = function(_params){
                 var resButtons = {};

                 params = mcService.Marge({
                     buttons   : [{
                         additionalItems: [],
                         type           : 'add', // add, edit, del
                         confirm        : null,
                         abort          : null,
                         addToContext   : false,
                         showedInList   : true,
                         css            : '',
                         contextCss     : '',
                         label          : '',
                         icon           : '',
                         contextIcon    : '',
                         title          : '',
                         editTitle      : '',
                         fillItems      : [],
                         delName        : '',
                         onBeforeShow   : null,
                         onBeforeDelete : null
                     }],

                     fillItems : [],
                     list      : null,
                     vertical  : false,
                     onHideContext: null,
                     onShowContext: null,

                     options   : {
                         modal : true,
                         head  : '',
                         width : 300
                     },
                     contextOpt: {
                         width: 200
                     }
                 }, _params);

                 var btnsList  = [];
                 var direction = params.vertical ? "rows" : "cols";

                 params.buttons.forEach(function (btn) {
                     var _btn = {};

                     function closeContext() {
                         if (btn.addToContext && self.contextMenu){
                             if (self.contextMenu) {
                                 self.contextMenu.hide();
                             }
                         }
                     }

                     switch (btn.type){
                         case 'add':
                             _btn = { view: "button", click: function(){ // "50" : "Добавить",
                                 closeContext();

                                 show(btn, params.options, params.list);
                             }};
                         break;

                         case 'edit':
                             _btn = { view: "button", click: function(){ // "51" : "Изменить",
                                 closeContext();

                                 show(btn, params.options, params.list, true);
                             }};
                         break;

                         case 'del':
                             _btn = { view: "button", type: "danger", click: function(){ // "52" : "Удалить",
                                 closeContext();

                                 if (mcService.isString(params.list)) {
                                     params.list = $$(params.list);
                                 }

                                 var item = params.list.getSelectedItem();

                                 if (item && (!btn.onBeforeDelete || (btn.onBeforeDelete && btn.onBeforeDelete.apply(btn, [item, params.list])))){
                                     $rootScope.$broadcast('addShowedWindow', [mcService.RandomHash(4), webix.confirm({
                                         type  : "confirm-warning",
                                         text  : mcService.myReplace(btn.title, btn.delName ? item[btn.delName] : null), // "902":"Удалить должность \"%s\"?",
                                         ok    : btn.delTitle,
                                         cancel: btn.cancelTitle,
                                         callback:function(yes){
                                             if (yes){
                                                 btn.confirm(item);
                                             }
                                         }
                                     })]);
                                 }
                             }};
                         break;
                     }

                     if (!btn.fillItems || !btn.fillItems.length){
                         btn.fillItems = params.fillItems;
                     }

                     _btn._opt = btn;

                     btnsList.push(_btn);
                 });

                 resButtons[direction] = [];

                 btnsList.forEach(function (__btn) {
                     var btn = mcService.Marge({}, __btn);

                     if (btn._opt.confirm && btn._opt.showedInList){
                         if (btn._opt.icon){
                             btn.type  = 'icon';
                             btn.icon  = btn._opt.icon;
                             btn.label = btn._opt.label;
                         } else {
                             btn.value = btn._opt.label;
                         }

                         btn.css  = btn._opt.css || undefined;

                         resButtons[direction].push(mcService.Marge({}, btn));
                     }
                 });

                 function attachContext() {
                     if (!self.contextMenu){
                         var contextButtons = [];

                         btnsList.forEach(function (__btn) {
                             var btn = mcService.Marge({}, __btn);

                             if (btn._opt.confirm && btn._opt.addToContext){
                                 if (btn._opt.contextIcon){
                                     btn.type  = 'icon';
                                     btn.icon  = btn._opt.contextIcon;
                                     btn.label = btn._opt.label;
                                 } else {
                                     btn.value = btn._opt.label;
                                 }

                                 if (params.contextOpt.btnHeight){
                                     btn.height = params.contextOpt.btnHeight;
                                 }

                                 btn.css  = btn._opt.contextCss || undefined;
                                 btn._opt = mcService.Marge({
                                     okTitle        : mcLang(28), // "28" :"Сохранить",
                                     cancelTitle    : mcLang(29), // "29" :"Отмена",
                                     delTitle       : mcLang(581) // "581": "Удалить",
                                 }, btn._opt);

                                 contextButtons.push(mcService.Marge({}, btn));
                             }
                         });

                         var ctx = mcService.Marge(params.contextOpt, {
                             view  : "context",
                             master: mcService.isString(params.list) ? $$(params.list) : params.list,
                             body  : { rows: contextButtons },
                             on    : {}
                         });

                         if (params.onShowContext){
                             ctx.on.onShow = params.onShowContext;
                         }

                         if (params.onHideContext){
                             ctx.on.onHide = params.onHideContext;
                         }

                         if (contextButtons && contextButtons.length){
                             self.contextMenu = webix.ui(ctx);
                         }
                     }
                 }

                 if (!resButtons[direction].length) {
                     resButtons.width  = 1;
                     resButtons.height = 1;
                 }

                 return {
                     btnList   : resButtons,
                     emitAction: function(idx, edit){
                         var isString = mcService.isString(idx) && isNaN(parseInt(idx));

                         if (isString){
                             idx = mcService.findItemInArrayOfObj(params.buttons, idx, 'name');
                         }

                         if (params.buttons[idx]){
                             show(params.buttons[idx], params.options, edit);
                         }
                     },
                     hideContext : function () {
                         if (self.contextMenu) {
                             self.contextMenu.hide();
                         }
                     },
                     attachContext: attachContext
                 };
             };
         }

     } else {
         console.error('window.mcWidgets is not defined!');
     }
 })();
