var MC_RESOURCE = {
    "Frameworks": [
        "modules/moment/min/moment.min.js",
        "modules/moment/locale/ru.js",
        "modules/moment/locale/uk.js",
        "modules/frameworks/webix/codebase/webix_debug.js"
    ],
    "Release": [
        "source/js/chat.min.js"
    ],
    "Develop": [
        "modules/cmd/cmd.js",
        "modules/cmd/ecmd.js",
        "source/service/mcConst.js",
        
        "modules/mctools/sha1/rusha_debug.js",
        "modules/mctools/media/adapter.js",
        "modules/mctools/media/mediaCall.js",
        "modules/mctools/media/callStates.js",
        "modules/mctools/media/mcPlaySound.js",
        "modules/mctools/media/cPanel.js",
        "modules/mctools/canvas_resize.js",
        "modules/mctools/mcConnect.js",
        "modules/mctools/mcCmdLoop.js",
        "modules/mctools/mcFileUploading.js",
        "modules/mctools/browser.js",
        "modules/mctools/TouchScroll.js",
        "modules/mctools/purl.js",
        "modules/mctools/mcComponents.js",
        "modules/mctools/mcStorage.js",
        "modules/mctools/mcStatistics.js",
        "modules/mctools/downloadUploadManager.js",
        "modules/mctools/console_logging/clog.js",
        "modules/mctools/smoothscroll/smoothscroll.js",
        "modules/mctools/mcService/mcServices.js",
        "modules/mctools/mcUploadProgress.js",

        "source/service/mcCmdParser.js",
        "source/service/mcDialogsList.js",
        "source/service/mcTools.js",
        "source/service/mcMedia.js",
        "source/service/mcPrivatesList.js",
        "source/service/mcConferenceList.js",
        "source/service/mcStatusesList.js",
        "source/service/mcHistoryDialogsList.js",
        "source/service/mcFramesList.js",
        "source/service/mcUsersCustomOptions.js",

        "modules/controllers/ctrlServersManager.js",
        "modules/controllers/initClientData.js",
        "modules/controllers/mcTextFinder.js",
        "modules/controllers/mcSpellChecker.js",
        "modules/mctools/widgets/buttonsListWithContext/wdgButtonsListWithContext.js",

        "source/components/commonView/treeContacts.js",

        "source/components/login/loginView.js",
        "source/components/login/loginController.js",

        "source/components/serverManager/serverManagerView.js",
        "source/components/serverManager/serverManagerController.js",

        "source/components/right/commonContacts/commonContactsView.js",
        "source/components/right/commonContacts/commonContactsController.js",
        "source/components/right/personalContacts/personalContactsView.js",
        "source/components/right/personalContacts/personalContactsController.js",
        "source/components/right/confUserList/confUserListView.js",
        "source/components/right/confUserList/confUserListController.js",
        "source/components/right/privateInfo/privateInfoView.js",
        "source/components/right/privateInfo/privateInfoController.js",
        "source/components/right/commonFiles/commonFilesView.js",
        "source/components/right/commonFiles/commonFilesController.js",
        "source/components/right/historyDialogs/historyDialogsView.js",
        "source/components/right/historyDialogs/historyDialogsController.js",
        "source/components/right/receiveFiles/receiveFilesView.js",
        "source/components/right/receiveFiles/receiveFilesController.js",

        "source/components/left/dialogs/dialogsView.js",
        "source/components/left/dialogs/dialogsController.js",
        "source/components/left/mainMenu/mainMenuView.js",
        "source/components/left/mainMenu/mainMenuController.js",

        "source/components/confManager/confManagerView.js",
        "source/components/confManager/confManagerController.js",

        "source/components/center/chatFrame/chatFrameView.js",
        "source/components/center/chatFrame/chatFrameController.js",
        "source/components/center/bbs/bbsView.js",
        "source/components/center/bbs/bbsController.js",
        "source/components/center/kanban/kanbanView.js",
        "source/components/center/kanban/kanbanController.js",
        "source/components/center/userProfile/userProfileView.js",
        "source/components/center/userProfile/userProfileController.js",
        "source/components/center/viewLogs/viewLogsView.js",
        "source/components/center/viewLogs/viewLogsController.js",
        "source/components/center/settings/settingsView.js",
        "source/components/center/settings/settingsController.js",

        "source/components/update/updateView.js",
        "source/components/update/updateController.js",

        "source/components/broadcast/receive/broadcastView.js",
        "source/components/broadcast/receive/broadcastController.js",
        "source/components/broadcast/send/sendBroadcastView.js",
        "source/components/broadcast/send/sendBroadcastController.js",

        "source/components/chatWrapper/chatWrapperView.js",
        "source/components/chatWrapper/chatWrapperController.js",

        "source/components/main/mainController.js",
        "source/components/main/main.js"
    ],
    "ElectronTextSource": "modules/electrontextsource/",
    "TextSource": {
        "errors"   : {
            "client"  : "modules/textsource/errors/client/",
            "server"  : "modules/textsource/errors/server/"
        },
        "languages": "modules/textsource/languages/",
        "mslHints" : "modules/textsource/mslHints/",
        "system"   : "modules/textsource/system/",
        "www"      : {
            "admin"   : "modules/textsource/www/admin/",
            "chat"    : "modules/textsource/www/chat/",
            "forum"   : "modules/textsource/www/forum/",
            "kanban"  : "modules/textsource/www/kanban/",
            "support" : "modules/textsource/www/support/"
        },
        "smileys"  : "modules/smileys/"
    }
}