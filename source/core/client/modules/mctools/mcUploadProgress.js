function mcUploadProgress() {
    webix.type(webix.ui.list, {
        name: "myUploader",
        template: function (data) {
            var current_size = mcService.formatFileSize((data.size / 100) * data.percent);

            return mcService.myReplaceFormated(
                "<div class='uploader_overall'>" +
                "   <div class='uploader_status'>" +
                "       <div class='uploader_progress' style='width:#{width}'></div>" +
                "       <div class='uploader_message'>#{txt}</div>" +
                "   </div>" +
                "</div>",
                {
                    name: data.name,
                    width: data.percent + "%",
                    txt: current_size + (data.sizetext ? (" / " + data.sizetext + " ") : " ") + data.percent + "%"
                }
            );
        },
        status: function (f) {
            var messages = {
                server: f.sizetext + " - Done!",
                error: "Error",
                client: "Ready",
                transfer: f.sizetext
            };
            return messages[f.status];

        },
        height: 35
    });
}