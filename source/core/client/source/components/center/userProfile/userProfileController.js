"use strict";

function userProfileController($scope, $rootScope){
    $scope.Name = mcConst.dataModels.UserProfile;
    $scope.userData = null;
    $scope.noImage  = '<img id="upFotoCanvas" src="' + mcConst.imagesPath.all + 'noimage.png" border="0">';
    $scope.displayName = "";

    var _view     = null;

    // ===================================================

    $scope.registerHotKeys = function () {
        $rootScope.hotKeyDispatcher.addPreset($scope.Name, [{
            key   : mcConst.keyCodes.esc,
            lockPrev: true,
            func  : $scope.closeProfile
        }], document);
    };

    $scope.removeHotKeys = function () {
        $rootScope.hotKeyDispatcher.removePreset($scope.Name);
    };

    $scope.drawFoto = function(fotoData){
        if (fotoData && fotoData.CRC32){
            $scope.uFoto.define('template', '<img id="uFotoCanvas" src="data:image/jpg;base64,' + fotoData.Foto +'">');
        } else {
            $scope.uFoto.define('template', $scope.noImage);
        }

        $scope.uFoto.refresh();
    };

    $scope.clearFoto = function(){
        webix.confirm({
            type  : "confirm-warning",
            text  : mcService.Lang(553), // "553":"Удалить фотографию?",
            ok    : mcService.Lang(519), // "519":"Удалить",
            cancel: mcService.Lang(33),  // "33" :"Отмена",
            callback:function(yes){
                if (yes){
                    $rootScope.$broadcast('SendCMDToServer', [
                        mcConst._CMD_.cs_set_uin_foto,
                        mcConst.SessionID,
                        ""
                    ]);

                    $$('upFoto').define('template', '<img id="upFotoCanvas" src="" border="0">');
                    $$('upFoto').refresh();

                    webix.message(mcService.Lang(554)); // "554":"Фото удалено",
                }
            }
        });
    };

    $scope.uploadFoto = function(item){
        var file = item.file;
        var type = item.type.toLowerCase();
        var res  = true;

        if(file && (type == "jpg" || type == "png")){
            $rootScope.$broadcast(mcConst.lockInterface, []);

            var reader = new FileReader(); // We need to use a FileReader to actually read the file.

            reader.onload = function(event){
                $$('upFoto').define('template', '<canvas id="upFotoCanvas" height="' + mcConst.userFoto.h + '" width="' + mcConst.userFoto.w + '"></canvas>');
                $$('upFoto').refresh();

                var img = new Image();

                img.src = event.target.result;

                img.onload = function(){
                    var _canvas = document.createElement('canvas');
                    var resized = document.getElementById('upFotoCanvas');

                    _canvas.width  = img.width;
                    _canvas.height = img.height;

                    if ((_canvas.height <= mcConst.userFoto.h) && (_canvas.width <= mcConst.userFoto.w)){
                        resized.width  = _canvas.width;
                        resized.height = _canvas.height;
                    } else
                    if (_canvas.width >= _canvas.height) {
                        resized.width  = mcConst.userFoto.w;
                        resized.height = _canvas.height / (_canvas.width / mcConst.userFoto.w);
                    } else {
                        resized.width  = _canvas.width / (_canvas.height / mcConst.userFoto.h);
                        resized.height = mcConst.userFoto.h;
                    }

                    var ctx = _canvas.getContext('2d');

                    ctx.fillStyle = '#fff';
                    ctx.fillRect(0, 0, _canvas.width, _canvas.height);
                    ctx.drawImage(img, 0, 0, img.width, img.height);

                    canvasResize(_canvas, resized, function(){
                        $rootScope.$broadcast('SendCMDToServer', [
                            mcConst._CMD_.cs_set_uin_foto,
                            mcConst.SessionID,
                            resized.toDataURL('image/jpeg').replace('data:image/jpeg;base64,', '')
                        ]);

                        $rootScope.$broadcast('hide' + mcConst.lockInterface, []);
                    });
                };
            };

            reader.onerror = function(){ // err
                $rootScope.$broadcast('ErrorMsg', ['client', mcService.Lang(555) + file.name]); // "555":"Ошибка чтения файла: ",

                $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

                res = false;
            };

            reader.readAsDataURL(file);
        } else {
            $rootScope.$broadcast('ErrorMsg', ['client', mcService.Lang(555) + file.name]); // "555":"Ошибка чтения файла: ",

            $rootScope.$broadcast('hide' + mcConst.lockInterface, []); // unlock

            res = false;
        }

        if (!res) {
            return res;
        }
    };
    
    $scope.closeProfile = function () {
        $rootScope.$broadcast("changeCenterView");
    };

    $scope.saveProfile = function(){
        $scope.data.Birthday = mcService.formatDate($scope.data.Birthday, 'dd.mm.yyyy');

        $rootScope.$broadcast('SendCMDToServer' , [
            mcConst._CMD_.cs_set_uin_info,
            mcConst.SessionID,
            JSON.stringify($scope.data)
        ]);

        webix.alert(mcLang(117)); // "117": "Изменения сохранены",

        if (!$scope.notMyProfile){
            $scope.saveBtn.hide();
        }
    };

    $scope.change = function(){
        var id  = this.data.id.toString().replace(/^up/, '');
        var val = this.getValue();

        if (mcService.isString(val)){
            val = mcService.trim(val.replace(/\u2022|\u0002|\u0003|\u000b|\r|\n/g, ""));
            
            if (!val){
                $scope.data[id] = val;
            }
        } else {
            $scope.data[id] = val;
        }

        if (!$scope.notMyProfile) {
            $scope.saveBtn.show();
        }
    };

    $scope.getData = function(uin){
        var task = new mcService.TaskList();

        task.AddTask(function () {
            $rootScope.$broadcast('SendCMDToServer' , [
                mcConst.lockInterface,
                mcConst._CMD_.cs_get_uin_info,
                mcConst.SessionID,
                uin,

                function (data) {
                    $scope.data = data;

                    task.Next();
                }
            ]);
        });

        task.AddTask(function () {
            $rootScope.$broadcast('SendCMDToServer', [
                mcConst._CMD_.cs_get_uin_foto,
                mcConst.SessionID,
                $scope.data.UIN,

                function (foto) {
                    $scope.show();

                    $scope.drawFoto(foto);
                }
            ]);
        });

        task.Run();
    };

    $scope.show = function(){
        $scope.notMyProfile = $scope.data.UIN != mcConst.UserInfo.UIN;
        $scope.displayName  = $scope.data.DisplayNick || mcConst.UserInfo.Nick;

        _view = initUserProfile($scope);

        Object.keys($scope.data).forEach(function (item) {
            var elem = $$('up' + item);

            if (elem && elem.setValue){
                elem.setValue($scope.data[item]);

                if (["CompNetName", "IP", "MAC", "LastAccess", "UIN"].indexOf(item) === -1){
                    elem[$scope.notMyProfile ? "disable" : "enable"]();
                }
            }
        });

        $scope.saveBtn.hide();

        $scope.fotoEditBtns[$scope.notMyProfile ? "hide" : "show"]();

        $scope.profileHeaderDisplayName.define('template', $scope.displayName);
        $scope.profileHeaderDisplayName.refresh();
    };

    // ====================================================

    $scope.$on('onGetUserProfileInfo', function(e, args){
        $scope.data = args[0];

        $rootScope.$broadcast('SendCMDToServer', [
            mcConst._CMD_.cs_get_uin_foto,
            mcConst.SessionID,
            $scope.data.UIN,

            function (foto) {
                $scope.show();

                $scope.drawFoto(foto);
            }
        ]);
    });

    $scope.$on('hide' + $scope.Name, function(){
        _view.hide();
        
        $scope.removeHotKeys();
    });

    $scope.$on('show' + $scope.Name, function(e, args){
        $scope.container = args[0];

        $scope.wndSize = $rootScope.wndSize;

        $scope.getData(args[1] || mcConst.UserInfo.UIN);

        $scope.registerHotKeys();
    });

    $rootScope.$broadcast('windowResize', [function(w, h){
        if (isMobile && _view){
            _view.define('height', h);
            _view.resize();
            _view.resizeChildren();
        }
    }]);

}