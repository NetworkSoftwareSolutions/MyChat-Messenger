"use strict";

function initCommonFiles($scope){
    var view = $$($scope.Name);

    function filesTemplate(obj) {
        return obj.name;
    }

    if (!view) {
        $$($scope.container).addView({
            id   : $scope.Name,
            rows : [
                { view: "list", id: "ftpList" + $scope.Name, template: filesTemplate, select: true}
            ]
        });

        view = $$($scope.Name);

        $scope.fileList = $$("ftpList" + $scope.Name);
    } else {
        view.show();
    }

    return view;
}