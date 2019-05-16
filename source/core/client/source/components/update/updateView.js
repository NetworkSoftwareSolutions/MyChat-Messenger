"use strict";

function initUpdateWrapper($scope){
    var view = $$($scope.Name);

    if (view){
        view.destructor();
    }

    view = webix.ui({
        id       : $scope.Name,
        view     : "window",
        width    : 350,
        position : "center",
        head     : false,
        body     : { padding: 5, rows: [
            { template: "<div class='byCenter font115 lHeight36'>" + mcLang(613) + "</div>", borderless: true, autoheight: true, // "613":"Загрузка обновления...",
                on: {
                    onAfterRender: $scope.download
                }
            },
            
            $scope.duViews.progressWrapper
        ]}
    });

    view.show();

    return view;
}