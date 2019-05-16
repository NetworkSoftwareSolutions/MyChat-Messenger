"use strict";

function initUserProfile($scope){
    function __textInput(id, pl, lb, change, disabled, hidden){
        return {
            view         : "text",
            id           : 'up' + id,
            // value        : $scope.data[id],
            labelPosition: 'top',
            css          : "noBGAll",
            placeholder  : mcLang(pl) || pl,
            label        : mcLang(lb) || lb,
            on           : { onTimedKeyPress: change  || function(){}},
            disabled     : disabled,
            hidden       : (hidden != undefined)? hidden : false
        }
    }

    var _view = $$($scope.Name);

    if (!_view){
        var width  = $scope.wndSize.width  >= 800 ? 600 : $scope.wndSize.width;
        var height = $scope.wndSize.height >= 800 ? 800 : $scope.wndSize.height;
        var labelWidth = 100;

        var _sex = [
            {id: '0', value: mcService.Lang(74)}, // "74" : "не определен",
            {id: '1', value: mcService.Lang(75)}, // "75" : "мужской",
            {id: '2', value: mcService.Lang(76)}  // "76" : "женский",
        ];

        var infoMain = { id: "profileBody" + $scope.Name, /*height: height - 33 - 34, width: width, */ css: "myScroll scrollMenu", rows: [
            { height: 4}
        ]};

        var infoMainFoto = { width: 180, rows: [
            { height: 3},
            { id: 'upFoto', template: $scope.noImage, height: 170, borderless: true, css: "byCenter"}
        ]};

        var _fotoBtns = { id: "fotoEditBtns"};

        _fotoBtns[width < 600 ? "cols" : "rows"] = [
            { view:"uploader",label: mcService.Lang(78), css: '', id: 'upLoadFoto',  autosend: false, upload: "", multiple: false, // "78" : "Загрузить фото",
                accept: ".jpg,.png,.jpeg", on : { onBeforeFileAdd: $scope.uploadFoto} },
            { view:"button",  label: mcService.Lang(79), css: 'button_danger', id: 'upClearFoto', click: $scope.clearFoto}  // "79" : "Очистить фото",
        ];

        infoMainFoto.rows.push(_fotoBtns);

        var infoMainDesc = [
            { view:"text",  id: 'upUIN',       value:$scope.data.UIN,       labelWidth: labelWidth,label:"UIN:", disabled: true},
            { view:"text",  id: 'upFirstName', value:$scope.data.FirstName, labelWidth: labelWidth,label:mcService.Lang(68),on:{onTimedKeyPress: $scope.change }, disabled: $scope.notMyProfile}, // "68" : "Имя:",
            { view:"text",  id: 'upMiddleName',value:$scope.data.MiddleName,labelWidth: labelWidth,label:mcService.Lang(69),on:{onTimedKeyPress: $scope.change }, disabled: $scope.notMyProfile}, // "69" : "Отчество:",
            { view:"text",  id: 'upLastName',  value:$scope.data.LastName,  labelWidth: labelWidth,label:mcService.Lang(70),on:{onTimedKeyPress: $scope.change }, disabled: $scope.notMyProfile}, // "70" : "Фамилия:",
            { view:"text",  id: 'upNick',      value:$scope.data.Nick,      labelWidth: labelWidth,label:mcService.Lang(57),on:{onTimedKeyPress: $scope.change }, disabled: $scope.notMyProfile}, // "57" : "Ник:",
            { view:"select",id: 'upSex',       value:$scope.data.Sex,       labelWidth: labelWidth,label:mcService.Lang(71),on:{onChange: $scope.change }, disabled: $scope.notMyProfile, options:_sex}, // "71" : "Пол:",
            { view:"text",  id: 'upEmail',     value:$scope.data.Email,     labelWidth: labelWidth,label:mcService.Lang(72),on:{onTimedKeyPress: $scope.change }, disabled: $scope.notMyProfile}  // "72" : "Основной E-mail:",
            //{ view: "text",   id: 'upRole',      value:$scope.data.Role,      labelWidth: labelWidth, label: mcService.Lang(73), disabled: true, css: "color54"}
        ];

        infoMain.rows.push({ cols: [
                { width: 15},
                { rows: infoMainDesc},
                infoMainFoto,
                { width: 5}
            ]});

        var systemInfo = { padding:14, rows: [
            {view:"text", id: 'upCompNetName', value:$scope.data.CompNetName,disabled:true,hidden:!$scope.data.CompNetName,labelWidth:labelWidth,label: mcLang(116)}, // "116": "Компьютер",
            {view:"text", id: 'upIP',          value:$scope.data.IP,         disabled:true,hidden:!$scope.data.IP,         labelWidth:labelWidth,label: mcLang(115)},// "115": "IP адрес",
            {view:"text", id: 'upMAC',         value:$scope.data.MAC,        disabled:true,hidden:!$scope.data.MAC,        labelWidth:labelWidth,label: mcLang(114)},// "114": "MAC адрес",
            {view:"text", id: 'upLastAccess',  value:$scope.data.LastAccess, disabled:true,hidden:!$scope.data.LastAccess, labelWidth:labelWidth*2,label: mcLang(113)}  // "113": "Последнее подключение",
        ]};

        var workInfo = { header:mcService.Lang(127), collapsed: true, css: "prInp", body: { rows: [ // "127": "Информация о компании (организации)",
            { height: 7 },

            __textInput('WorkCompanyName',118, 126, $scope.change, $scope.notMyProfile),
            __textInput('WorkPosition',    '', 124, $scope.change, true, !$scope.data.WorkPosition),
            __textInput('WorkDept',        '', 123, $scope.change, true, !$scope.data.WorkDept),
            __textInput('WorkOffice',     118, 122, $scope.change, $scope.notMyProfile, $scope.notMyProfile && !$scope.data.WorkOffice),
            __textInput('WorkPhone',      118, 121, $scope.change, $scope.notMyProfile, $scope.notMyProfile && !$scope.data.WorkPhone),
            __textInput('WorkFax',        118, 120, $scope.change, $scope.notMyProfile, $scope.notMyProfile && !$scope.data.WorkFax),
            __textInput('WorkPager',      118, 119, $scope.change, $scope.notMyProfile, $scope.notMyProfile && !$scope.data.WorkPager),

            __textInput('WorkCity',         118, 164, $scope.change, $scope.notMyProfile, $scope.notMyProfile && !$scope.data.WorkCity),
            __textInput('WorkStreetAddress',118, 163, $scope.change, $scope.notMyProfile, $scope.notMyProfile && !$scope.data.WorkStreetAddress),
            __textInput('WorkState',        118, 165, $scope.change, $scope.notMyProfile, $scope.notMyProfile && !$scope.data.WorkState),
            __textInput('WorkZIP',          118, 166, $scope.change, $scope.notMyProfile, $scope.notMyProfile && !$scope.data.WorkZIP),

            { view:"select",
                id           : 'upWorkCountry',
                value        : $scope.data.WorkCountry,
                labelPosition: 'top',
                label        : mcLang(167), // "167":"Страна",
                on           : { onChange: $scope.change },
                options      : mcService.GetCountriesList(),
                css          : "noBGAll",
                disabled     : $scope.notMyProfile,
                hidden       : $scope.notMyProfile && !$scope.data.WorkZIP
            },

            __textInput('WorkWWW',     118, 178, $scope.change, $scope.notMyProfile, $scope.notMyProfile && !$scope.data.WorkWWW),

            {height: 10}
        ]}};

        var peronalInfo = {header:mcService.Lang(148), collapsed: true, css: "prInp", body: { rows: [ // "148":"Личная информация",
            {height: 7},
            {view:"datepicker",
                id           : 'upBirthday',
                value        : $scope.data.Birthday,
                labelPosition: 'top',
                placeholder  : mcLang(118),
                label        : mcLang(149) + ":", on:{ onChange: $scope.change }, // "149":"Дата рождения:",
                disabled     : $scope.notMyProfile,
                hidden       : $scope.notMyProfile && !$scope.data.Birthday,
                suggest: {
                    type:"calendar",
                    body: {
                        minDate: new Date("1900.01.01"),
                        maxDate: new Date("3000.01.01")
                    }
                }
            },

            {view:"select",
                id           : 'upMaritalStatus',
                value        : $scope.data.MaritalStatus,
                labelPosition: 'top',
                label        : mcLang(150) + ":",
                on           : { onChange: $scope.change },
                options      : mcService.GetMaritalStatusList(),
                css          : "noBGAll",
                disabled     : $scope.notMyProfile,
                hidden       : $scope.notMyProfile && !$scope.data.MaritalStatus
            },

            __textInput('HomePhone',        118, 159, $scope.change, $scope.notMyProfile, $scope.notMyProfile && !$scope.data.HomePhone),
            __textInput('HomeFax',          118, 160, $scope.change, $scope.notMyProfile, $scope.notMyProfile && !$scope.data.HomeFax),
            __textInput('HomeCellular',     118, 161, $scope.change, $scope.notMyProfile, $scope.notMyProfile && !$scope.data.HomeCellular),
            __textInput('HomeStreetAddress',118, 163, $scope.change, $scope.notMyProfile, $scope.notMyProfile && !$scope.data.HomeStreetAddress),
            __textInput('HomeCity',         118, 164, $scope.change, $scope.notMyProfile, $scope.notMyProfile && !$scope.data.HomeCity),
            __textInput('HomeState',        118, 165, $scope.change, $scope.notMyProfile, $scope.notMyProfile && !$scope.data.HomeState),
            __textInput('HomeZIP',          118, 166, $scope.change, $scope.notMyProfile, $scope.notMyProfile && !$scope.data.HomeZIP),

            {view:"select",
                id           : 'upHomeCountry',
                value        : $scope.data.HomeCountry,
                labelPosition: 'top',
                label        : mcLang(167), // "167":"Страна",
                on           : { onChange: $scope.change },
                options      : mcService.GetCountriesList(),
                css          : "noBGAll",
                disabled     : $scope.notMyProfile,
                hidden       : $scope.notMyProfile && !$scope.data.HomeCountry
            },

            __textInput('HomeWWW',          118, 168, $scope.change, $scope.notMyProfile, $scope.notMyProfile && !$scope.data.HomeWWW),

            {height: 10}
        ]}};

        //===============================================

        var otherInfoAccordion = { cols: [
            { width: 5},{
                view : "accordion",
                multi: true,
                borderless: true,
                css: "headerAccordion",
                rows : [workInfo, peronalInfo]
            }, { width: 11}
        ]};

        infoMain.rows.push({height: 7});
        infoMain.rows.push(systemInfo);
        infoMain.rows.push({height: 7});
        infoMain.rows.push(otherInfoAccordion);
        infoMain.rows.push({height: 7});

        // ==========================================

        $$($scope.container).addView({
            id   : $scope.Name,
            css  : "color54",
            rows : [
                { css: "header", cols: [
                    { view: "button", type: "icon", icon: "arrow-left", label: mcService.Lang(63), width: 140, css: "headerBtn whiteBG", // "63" :"Назад",
                        click: $scope.closeProfile
                    },

                    // { view: "template", template: mcLang(586), autoheight: true, borderless: true, height: 34, css: "byCenter"}, // "586":"Протоколы",

                    { id: "profileHeaderDisplayName", view: "template", template: $scope.displayName, autoheight: true, borderless: true, height: 34, css: "byCenter myScroll"},

                    { view: "button", id: "saveBtn" + $scope.Name, type: "icon", icon: "check", label: mcService.Lang(77), click: $scope.saveProfile, // "77" : "Сохранить",
                        css: "headerBtn", width: 140, hidden: true
                    }
                ]},

                { height: 3, css: "whiteBG"},

                { view: "scrollview", body: infoMain }
            ]
        });

        _view = $$($scope.Name);

        //=============================================

        $scope.uFoto   = $$("upFoto");
        $scope.saveBtn = $$("saveBtn" + $scope.Name);
        $scope.profileHeaderDisplayName = $$("profileHeaderDisplayName");
        $scope.fotoEditBtns = $$("fotoEditBtns");

        if (isMobile){
            $$("profileBody" + $scope.Name).$view.id = "_profileBody" + $scope.Name;

            var viewer = new TouchScroll();

            viewer.init({
                id: "_profileBody" + $scope.Name,
                draggable: true,
                wait: false
            });
        }
    } else {
        _view.show();
    }

    return _view;
}