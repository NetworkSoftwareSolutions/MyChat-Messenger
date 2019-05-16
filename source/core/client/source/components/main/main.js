"use strict";

if (!window.old_IE) {
    var units   = []
            // .concat(location.protocol === 'file:' ? { module: 'cLog', args: []} : [])
            .concat({ module: 'mcPlaySound',     args: ['$rootScope']})
            .concat({ module: 'mcConnect',       args: []})
            .concat({ module: 'mcCmdLoop',       args: ['mcConnect',  '$rootScope']})
            .concat({ module: 'CallStates',      args: []})
            .concat({ module: 'MediaCall',       args: []})
            .concat({ module: 'mcMedia',         args: ['mcPlaySound','$rootScope', 'MediaCall', 'CallStates']})
            .concat({ module: 'mcDialogsList',   args: ['$rootScope', 'mcPlaySound']})
            .concat({ module: 'mcFileUploading', args: ['$rootScope']})
            .concat({ module: 'mcStorage',       args: ['$rootScope']})
            .concat({ module: 'mcUploadProgress',args: ['$rootScope']})
            .concat(location.protocol === 'file:' ? { module: 'mcStatistics', args: ['$rootScope']} : [])
            .concat({ module: 'mcCmdParser',     args: ['mcConnect',  '$rootScope', 'mcPlaySound', 'mcStatistics']})

            .concat({ module: "mainController",  args: ['$scope', '$rootScope', 'mcCmdParser', 'mcCmdLoop', '$http',
                                                        '$location', 'mcStatistics']})

            .concat({ module: 'loginController',            args: ['$scope', '$rootScope', '$location']})
            .concat({ module: 'commonContactsController',   args: ['$scope', '$rootScope']})
            .concat({ module: 'personalContactsController', args: ['$scope', '$rootScope']})
            .concat({ module: 'chatFrameController',        args: ['$scope', '$rootScope', 'mcPlaySound']})
            .concat({ module: 'confUserListController',     args: ['$scope', '$rootScope']})
            .concat({ module: 'confManagerController',      args: ['$scope', '$rootScope']})
            .concat({ module: 'dialogsController',          args: ['$scope', '$rootScope', 'mcPlaySound']})
            .concat({ module: 'mainMenuController',         args: ['$scope', '$rootScope']})
            .concat({ module: 'privateInfoController',      args: ['$scope', '$rootScope', 'mcMedia', 'mcPlaySound']})
            .concat({ module: 'userProfileController',      args: ['$scope', '$rootScope']})
            .concat({ module: 'chatWrapperController',      args: ['$scope', '$rootScope']})
            .concat({ module: 'bbsController',              args: ['$scope', '$rootScope', 'mcPlaySound']})
            .concat({ module: 'kanbanController',           args: ['$scope', '$rootScope']})
            .concat({ module: 'commonFilesController',      args: ['$scope', '$rootScope']})
            .concat({ module: 'historyDialogsController',   args: ['$scope', '$rootScope']})
            .concat({ module: 'broadcastController',        args: ['$scope', '$rootScope']})

            .concat(location.protocol === 'file:' ? { module: 'updateController',        args: ['$scope', '$rootScope']} : [])
            .concat(location.protocol === 'file:' ? { module: 'viewLogsController',      args: ['$scope', '$rootScope']} : [])
            .concat(location.protocol === 'file:' ? { module: 'serverManagerController', args: ['$scope', '$rootScope']} : [])
            .concat(location.protocol === 'file:' ? { module: 'receiveFilesController',  args: ['$scope', '$rootScope']} : [])
            .concat(location.protocol === 'file:' ? { module: 'settingsController',      args: ['$scope', '$rootScope']} : [])
        ;

    window.mcService = servicesController('chat');
    window.mcLang    = mcService.Lang;

    mcComponents.units(units).start();
}
