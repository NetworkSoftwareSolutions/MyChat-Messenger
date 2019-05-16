 /**
 * Created by Gifer on 03.02.2016.
 */

 "use strict";

 function CallStates(){
     var current_state       = 0;   // текущее состояние
     var universalStateEvent = null;
     var Self = this;

     function isArray(obj){
         return Object.prototype.toString.call( obj ) === '[object Array]';
     }

     this.list = {
         free                               : 0,   // свободен

         outgoing_call_try                  : 1,   // попытка исходящего звонка
         outgoing_call_busy                 : 2,   // исходящий звонок, абонент занят
         outgoing_call_rejected             : 3,   // абонент отказался принять ваш звонок
         outgoing_call_accepted             : 4,   // абонент принял ваш звонок
         outgoing_call_cancelled            : 5,   // отбой исходящего звонка мной, я передумал
         outgoing_call_cancelled_by_timeout : 6,   // исходящий звонок не состоялся, абонент не ответил по тайм-ауту
         outgoing_call_remote_error         : 7,   // какая-то ошибка при исходящем звонке, на удалённой стороне
         outgoing_call_my_error             : 8,   // какая-то ошибка при исходящем звонке, на моей стороне
         outgoing_call_started              : 9,   // исходящий звонок успешно начался
         outgoing_call_my_close             : 10,  // я завершил исходящий звонок
         outgoing_call_remote_close         : 11,  // мой исходящий звонок был завершен удалённой стороной

         incoming_call_try                  : 101, //+ попытка входящего звонка
         incoming_call_busy                 : 102, // входящий звонок невозможен, у меня занято
         incoming_call_rejected             : 103, // я отказался от входящего звонка
         incoming_call_accepted             : 104, // я согласился принять входящий звонок
         incoming_call_cancelled            : 105, // удалённая сторона досрочно отказалась от звонка, я не спел согласиться или отказаться
         incoming_call_cancelled_by_timeout : 106, // входящий звонок не состоялся, я не ответил по тайм-ауту
         incoming_call_remote_error         : 107, // какая-то ошибка при входящем звонке, на удалённой стороне
         incoming_call_my_error             : 108, // какая-то ошибка при входящем звонке, на моей стороне
         incoming_call_started              : 109, // входящий звонок успешно начался
         incoming_call_my_close             : 110, // я завершил входящий звонок
         incoming_call_remote_close         : 111  // вхолящий звонок завершил удалённый пользователь
     };

     this.setStateEvent = function(state, args){
         current_state = state;

         console.log('State changed to: ' + state);

         if (universalStateEvent){
             universalStateEvent.apply(current_state, isArray(args) ? args : [args]);
         }
     };

     this.setUniversalStateEvent = function(event){
         universalStateEvent = event;
     };

     this.currentState = function(){
         return current_state;
     };

     this.setCustomCallEvent = function(state/*, event*/){
         current_state = state;

         console.log('State changed to: ' + state);
     };

     this.clearState = function(){
         current_state   = Self.list.free;
         Self.isMyCall   = false;

         console.log('Clear State: ' + current_state);
     };

     this.isMyCall = false;
 }
