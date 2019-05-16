
function McSpellChecker() {
    var webFrame           = require('electron').webFrame;
    var SpellCheckProvider = require('electron-spell-check-provider');
    var spellLang          = "";
    var _spellchecker      = null;
    var enabled            = false;

    this.start = function (Lang) {
        switch (Lang){
            case 'ru': spellLang = "ru_RU"; break;
            case 'en': spellLang = "en_US"; break;

            default: spellLang = "en_US";
        }

        if (spellLang){
            _spellchecker = new SpellCheckProvider(spellLang);

            webFrame.setSpellCheckProvider(spellLang, true,
                _spellchecker.on('misspelling', function(suggestions) {
                    var text = window.getSelection().toString();

                    if (text) {
                        _spellchecker.addMenuItems({
                            isMisspelled        : true,
                            spellingSuggestions : suggestions.slice(0, 4)
                        });
                    }
                })
            );

            enabled = true;
        }
    };

    this.stop = function () {
        if (enabled){
            webFrame.setSpellCheckProvider(spellLang, false, {
                spellCheck: function (txt) {
                    return true;
                }
            });
        }

        enabled = false;
    };

    this.stat = function () {
        return enabled;
    };
}