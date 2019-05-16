"use strict";

function initPersonalContacts($scope){
    var view = __treeContacts($scope, mcLang(17)); // "17" :"Личные контакты",

    var addNewGroup = $$("addNewGroup" + $scope.Name);

    if (!addNewGroup){
        view.parentContainer.addView({
            view : "button",
            id   : "addNewGroup" + $scope.Name,
            value: mcLang(561), // "561":"Добавить группу",
            click: function () {
                $scope.contextPersonalContacts.emitAction('createGroup');
            }
        });
    }

    if (!$scope.contextPersonalContacts){
        $scope.contextPersonalContacts = $scope._contextMenuList.editButtons({
            buttons : []
                .concat([{
                    name           : 'createGroup',
                    type           : 'add', // add, edit, del
                    confirm        : $scope.contextMenu.addGroup,
                    addToContext   : true,
                    showedInList   : false,
                    contextCss     : 'byCenter whiteAll noUpperCase',
                    label          : mcLang(561), // "561":"Добавить группу",
                    title          : mcLang(561), // "561":"Добавить группу",
                    editTitle      : mcLang(35),  // "35" :"Название",
                    okTitle        : mcLang(77),  // "77" :"Сохранить",
                    cancelTitle    : mcLang(33)   // "33" :"Отмена",
                }])
                .concat([{
                    name           : 'addContact',
                    type           : 'add', // add, edit, del
                    confirm        : $scope.contextMenu.addUser,
                    addToContext   : true,
                    showedInList   : false,
                    contextCss     : 'byCenter whiteAll noUpperCase',
                    label          : mcLang(562), // "562":"Добавить контакт",
                    title          : mcLang(562), // "562":"Добавить контакт",
                    editTitle      : mcLang(564), // "564":"Укажите UIN",
                    okTitle        : mcLang(77),  // "77" :"Сохранить",
                    cancelTitle    : mcLang(33)   // "33" :"Отмена",
                }])
                .concat([{
                    name           : 'editGroup',
                    type           : 'edit', // add, edit, del
                    confirm        : $scope.contextMenu.renameGroup,
                    addToContext   : true,
                    showedInList   : false,
                    contextCss     : 'byCenter whiteAll noUpperCase',
                    label          : mcLang(563), // "563":"Переименовать",
                    title          : mcLang(563), // "563":"Переименовать",
                    editTitle      : mcLang(35),  // "35" :"Название",
                    okTitle        : mcLang(77),  // "77" :"Сохранить",
                    cancelTitle    : mcLang(33)   // "33" :"Отмена",
                }])
                .concat([{
                    name           : 'delItem',
                    type           : 'del', // add, edit, del
                    confirm        : $scope.contextMenu.del,
                    addToContext   : true,
                    showedInList   : false,
                    contextCss     : 'byCenter whiteAll noUpperCase',
                    delName        : "DisplayName",
                    label          : mcLang(519), // "519":"Удалить",
                    cancelTitle    : mcLang(33),   // "33" :"Отмена",
                    title          : mcLang(565)   // "565":"Удалить <br>%s?",
                }]),

            fillItems     : ["DisplayName"],
            list          : $scope.Name,
            onShowContext : $scope.onShowPopMenu,
            onHideContext : $scope.removeHotKeys,
            contextOpt    : {
                width: 170,
                padding: 0,
                btnHeight: 30
            }
        });

        $scope.contextPersonalContacts.attachContext();
    }

    return view;
}