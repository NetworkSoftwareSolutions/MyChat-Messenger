/**
 * Created by Gifer on 25.09.2017.
 */
"use strict";

function McTextFinder($rootScope) {
    var textDiv   = "messageText";
    var openSpan  = '<fndel class="findItem" tabindex="0">';
    var openText  = '``open``';
    var closeSpan = '</fndel>';
    var closeText = '``close``';
    var hasResult = false;
    var currentText = "";
    var currentIdx  = 0;
    var findRes   = [];
    var pos       = 0;

    function focusElem(searchField) {
        pos = mcService.getCaretPosition(searchField.getInputNode());

        if (findRes[currentIdx]){
            findRes[currentIdx].focus();
            findRes[currentIdx].className += " findItemSelected";
        }

        searchField.focus();

        mcService.setCaretPosition(searchField.getInputNode(), pos);
    }

    function findText(frame, text, searchField){
        text = mcService.trim(text.toLowerCase());

        if (text !== "" && text !== currentText){
            if (hasResult) {
                clear(frame);
            }

            pos = 0;

            var msgDivList = frame.getElementsByClassName(textDiv);

            for (var idElm = 0; idElm < msgDivList.length; idElm ++ ) {
                var items = msgDivList[idElm].childNodes;
                var item;

                for (var chdID = 0; chdID < items.length; chdID ++ ){
                    item = items[chdID];

                    if (item.nodeName === "#text" || item.nodeName === "A"){
                        var byType   = item.nodeName === "A" ? "innerHTML" : "data";
                        var itemText = item[byType].toLowerCase();

                        if (itemText.length >= text.length && !(item.nodeName === "A" && item.innerText === "")){
                            var idx = itemText.indexOf(text);
                            var res = {};

                            if (idx !== -1) {
                                while (idx !== -1){
                                    res[idx] = openText;
                                    res[idx + text.length] = closeText;

                                    idx = itemText.indexOf(text, idx + 1);
                                }

                                item[byType] = item[byType].insertTextAtIndices(res);

                                hasResult = true;
                            }
                        }
                    }
                }

                if (hasResult){
                    msgDivList[idElm].innerHTML =
                        msgDivList[idElm].innerHTML
                            .replace(new RegExp(openText , "g"), openSpan)
                            .replace(new RegExp(closeText, "g"), closeSpan);
                }
            }

            currentText = text;

            findRes = document.getElementsByClassName("findItem");

            currentIdx = 0 ;

            focusElem(searchField);
        } else

        if (text === currentText && findRes[currentIdx]){
            findRes[currentIdx].className = findRes[currentIdx].className.replace(" findItemSelected", "");
            
            currentIdx ++;

            if (currentIdx === findRes.length){
                currentIdx = 0;
            }

            focusElem(searchField);
        }
    }

    function clear(frame) {
        var msgDivList = frame.getElementsByClassName(textDiv);

        if (findRes[currentIdx] && findRes[currentIdx].className) {
            findRes[currentIdx].className = findRes[currentIdx].className.replace(" findItemSelected", "");
        }

        for (var i = 0; i < msgDivList.length; i++){
            msgDivList[i].innerHTML = msgDivList[i].innerHTML.replace(new RegExp(openSpan, "g"), "").replace(new RegExp(closeSpan, "g"), "");
        }

        hasResult = false;

        currentText = "";
    }

    String.prototype.insertTextAtIndices = function(text) {
        return this.replace(/./g, function(character, index) {
            return text[index] ? text[index] + character : character;
        });
    };

    // ==================================

    var _msg = window._messages_.textFinder = {
        find_chat_text  : "find_chat_text",
        find_clear      : "find_clear"
    };

    $rootScope.$on(_msg.find_chat_text, function (e, args) {
        findText.apply(null, args);
    });

    $rootScope.$on(_msg.find_clear, function (e, args) {
        clear.apply(null, args);
    });
}
