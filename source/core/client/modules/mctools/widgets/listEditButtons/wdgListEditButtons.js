 "use strict";

 (function () {
     if (window.mcWidgets){
         window.mcWidgets.ListEditButtons = function ListEditButtons($rootScope){
             var textSource = {
                 add  : mcLang(50),
                 edit : mcLang(51),
                 del  : mcLang(52),
                 clone: mcLang(579)
             };

             function show(params, fillparams){
                 var wndId = mcService.RandomHash(7);

                 $rootScope.hotKeyDispatcher.addPreset(wndId, [{
                     key : mcConst.keyCodes.enter,
                     func: function(){
                         var form = params.dialog.getChildViews()[1];

                         if (params.confirm.apply(form, [].concat(form.getChildViews())) !== true) { // если возвращает true, то зыкрывать диалоговое окно не нужно, в поле для ввода текста есть ошибка и т.д.
                             params.dialog.close();
                         }
                     }
                 }, {
                     key : mcConst.keyCodes.esc,
                     func: function(){
                         params.dialog.close();
                     }
                 }], document, true);

                 params.dialog = webix.ui(mcService.Marge(params.options, {
                     view     : "window",
                     position : "center",
                     id       : wndId,
                     body     : {
                         view : 'form',
                         rules:{
                             "Name"    : webix.rules.isNotEmpty
                         },
                         elements : [{
                             view       : "text",
                             label      : params.editTitle, // mcService.Lang(904), // "904":"Название должности",
                             name       : 'Name',
                             labelPosition : 'top',
                             required   : "true"
                         }]
                         .concat(params.additionalItems ? params.additionalItems : [])
                         .concat({
                             cols : [{
                                 view  : "button",
                                 value : mcService.Lang(104), // "104": "Сохранить",
                                 click : function() {
                                     var form = this.getFormView();

                                     if (params.confirm.apply(form, [].concat(form.getChildViews())) !== true) { // если возвращает true, то зыкрывать диалоговое окно не нужно, в поле для ввода текста есть ошибка и т.д.
                                         params.dialog.close();
                                     }
                                 }
                             }, {
                                 view  : "button",
                                 type  : "danger",
                                 value : mcService.Lang(103), // "103": "Отмена",
                                 click : function(){
                                     params.dialog.close();
                                 }
                             }]
                         })
                     },
                     on : {
                         onShow : function(){
                             if (mcService.isString(params.list)) {
                                 params.list = $$(params.list);
                             }

                             if (fillparams) {
                                 this.getChildViews()[1].getChildViews().forEach(function(item, id){
                                     if (params.fillItems[id] != undefined) item.setValue(params.list.getSelectedItem()[params.fillItems[id]]);
                                 });
                             }

                             this.getChildViews()[1].getChildViews()[0].focus();

                             $rootScope.$broadcast('addShowedWindow', [wndId, this]); // сообщаем менеджеру переходов между экранами, что появилось новое окно и его нужно закрыть при изменении экрана
                         },
                         onDestruct : function(){
                             $rootScope.hotKeyDispatcher.removePreset(wndId);
                         }
                     }
                 }));

                 params.dialog.show();
             }

             function startDel(params) {
                 if (mcService.isString(params.list)) {
                     params.list = $$(params.list);
                 }

                 var item = params.list.getSelectedItem();

                 if (item){
                     $rootScope.$broadcast('addShowedWindow', [mcService.RandomHash(4), webix.confirm({
                         type  : "confirm-warning",
                         text  : mcService.myReplace(params.actionTitles.del, params.delName ? item[params.delName] : null), // "902":"Удалить должность \"%s\"?",
                         ok    : mcService.Lang(581), // "581": "Удалить",
                         cancel: mcService.Lang(103), // "103": "Отмена",
                         callback:function(yes){
                             if (yes){
                                 params.actions.del(item);
                             }
                         }
                     })]);
                 }
             }

             this.initTextSource = function (source) {
                 textSource = mcService.Marge(textSource, source);
             };

             this.editButtons = function(_params){
                 var res    = {};
                 var params = null;

                 var _actions = {
                     add: function(){
                         params.confirm = params.actions.add;
                         params.options.head = params.actionTitles.add;

                         show(params);
                     },
                     del: function(){
                         startDel(params);
                     },
                     edit: function(){
                         params.confirm = params.actions.edit;
                         params.options.head = params.actionTitles.edit;

                         show(params, true);
                     },
                     clone: function(){
                         params.confirm = params.actions.clone;
                         params.options.head = params.actionTitles.clone;

                         show(params, true);
                     }
                 };

                 params = mcService.Marge({
                     additionalItems: [],
                     list      : null,
                     fillItems : [],
                     confirm   : null,
                     actions   : {},
                     editTitle : "",
                     delDesc   : "",
                     delName   : "",
                     vertical  : false,
                     onShow    : null,
                     dialog    : null,
                     hotkeyPreset: mcService.RandomHash(10),

                     options : {
                         modal : true,
                         head  : "",
                         width : 300
                     },
                     actionTitles: {
                         add: "",
                         del: "",
                         edit: "",
                         clone: ""
                     },
                     hotKeys : {},
                     showed   : {
                         add  : true,
                         del  : true,
                         edit : true,
                         clone: true
                     }
                 }, _params);

                 params.hotKeys.add   = mcService.Marge({
                     keyTitle: "",
                     key     : null,
                     altKey  : false,
                     shiftKey: false,
                     ctrlKey : false,
                     func    : _actions.add
                 }, params.hotKeys.add  );
                 params.hotKeys.del   = mcService.Marge({
                     keyTitle: "",
                     key     : null,
                     altKey  : false,
                     shiftKey: false,
                     ctrlKey : false,
                     func    : _actions.del
                 }, params.hotKeys.del  );
                 params.hotKeys.edit  = mcService.Marge({
                     keyTitle: "",
                     key     : null,
                     altKey  : false,
                     shiftKey: false,
                     ctrlKey : false,
                     func    : _actions.edit
                 }, params.hotKeys.edit );
                 params.hotKeys.clone = mcService.Marge({
                     keyTitle: "",
                     key     : null,
                     altKey  : false,
                     shiftKey: false,
                     ctrlKey : false,
                     func    : _actions.clone
                 }, params.hotKeys.clone);

                 var bAdd   = { view: "button", value: textSource.add,   tooltip: params.hotKeys.add ? params.hotKeys.add.keyTitle : "", click: _actions.add };  // "50" : "Добавить",
                 var bEdit  = { view: "button", value: textSource.edit,  tooltip: params.hotKeys.edit ? params.hotKeys.edit.keyTitle : "", click: _actions.edit};  // "51" : "Изменить",
                 var bDel   = { view: "button", value: textSource.del,   tooltip: params.hotKeys.del ? params.hotKeys.del.keyTitle : "", click: _actions.del, type: "danger"}; // "52" : "Удалить",
                 var bClone = { view: "button", value: textSource.clone, tooltip: params.hotKeys.clone ? params.hotKeys.clone.keyTitle : "", click: _actions.clone}; // "579": "Клонировать",

                 res[params.vertical ? "rows" : "cols"] = []
                     .concat(params.actions.add   && params.showed.add   ? mcService.Marge({}, bAdd  ) : [])
                     .concat(params.actions.edit  && params.showed.edit  ? mcService.Marge({}, bEdit ) : [])
                     .concat(params.actions.del   && params.showed.del   ? mcService.Marge({}, bDel  ) : [])
                     .concat(params.actions.clone && params.showed.clone ? mcService.Marge({}, bClone) : [])
                 ;

                 return {
                     btnList  : res,

                     startEdit: function(edit){
                         if (edit === false) {
                             _actions.add();
                         } else {
                             _actions.edit();
                         }
                     },

                     startDel : _actions.del,

                     enableHotKeys : function () {
                         var _keys = [];

                         Object.keys(params.hotKeys).forEach(function (_key) {
                             if (params.hotKeys[_key].key) {
                                 _keys.push(params.hotKeys[_key]);
                             }
                         });

                         if (_keys.length){
                             $rootScope.hotKeyDispatcher.addPreset(params.hotkeyPreset, _keys, document, true);
                         }
                     },

                     disableHotKeys: function () {
                         $rootScope.hotKeyDispatcher.removePreset(params.hotkeyPreset);
                     }
                 };
             };
         }
     }
 })();
