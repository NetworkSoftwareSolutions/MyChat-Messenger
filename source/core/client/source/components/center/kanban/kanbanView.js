"use strict";

function initKanbanFrame($scope){
    var view = $$($scope.Name);

    if (!view){
        $$($scope.container).addView({
            id   : $scope.Name,
            view : "iframe",
            css  : "iFrameFit",
            src  : $scope.kanbanURL + $scope.getToken($scope.kanbanURL),
            on   : {
                // onAfterLoad: $scope.onLoadKanban
            }
        });

        view = $$($scope.Name);
        
        view.showFrame = function () {
            view.define('width', undefined);
            view.resize();

            mcService.showFrame($scope.Name);
        };

        view.hideFrame = function () {
            view.define('width', '0');
            view.resize();

            mcService.hideFrame($scope.Name);
        };
    } else {
        view.showFrame();
    }

    return view;
}