webix.protoUI({
	name:"simplemde-editor",
    noresize: false,
	defaults: {},
	$init:function(config){
		this.$view.innerHTML = "<textarea style='width:100%;height:100%;'></textarea>";
		this.$ready.push(this._render_spl_editor);
	},
	_render_spl_editor:function(){
		if (!window.SimpleMDE){
			webix.require("simplemde/simplemde.min.css");

			var deps = [
				"simplemde/simplemde.min.js"
			];

			webix.require(deps, this._render_when_ready, this);
		} else {
			this._render_when_ready();
		}
	},

	_render_when_ready:function(){
        var self = this;

		this.editor = new SimpleMDE({
            element     : this.$view.firstChild,
            placeholder : this.config.placeholder || "",
			autoDownloadFontAwesome: false,
            spellChecker: false,
            toolbar     : [
                "bold", "italic", "heading-1", "heading-2", "heading-3", "|",
                "code", "horizontal-rule", "unordered-list", "ordered-list", "quote", "|",
                "clean-block", "strikethrough", "link", "image", "table", "|",
                "preview", "side-by-side", "fullscreen", "|",
                {
                    name: "save",
                    action: function customFunction(editor){
                        self.callEvent("onSave", [self.getValue()]);

                        //self.setValue("");
                    },
                    className: "fa fa-save",
                    title: "Save Button"
                }
            ]
        });

		//webix.markdownRender = this.editor.options.previewRender;

        this.setValue(this.config.value);

        this.editor.codemirror.on('refresh', function () {
            //console.log(arguments);
            if (!self.noresize){
                self._updateScrollSize(self.editor.isFullscreenActive());
            }
        });

        if (this._focus_await)
			this.focus();
	},

	_set_inner_size:function(){
		if (!this.editor || !this.$width) return;

		this._updateScrollSize();
		this.editor.codemirror.scrollTo(0,0); //force repaint, mandatory for IE
	},
	_updateScrollSize:function(fullscreen){
        this.noresize = true;

		var box      = this.editor.codemirror.getWrapperElement();
        var toolbar  = this.editor.gui.toolbar;
        var statusbar= this.editor.gui.statusbar;
        var heightTb = toolbar.offsetHeight + (fullscreen ? 0 : statusbar.offsetHeight) + 20;
        var parentHeight =  fullscreen ? document.body.offsetHeight : (this.$height || 0);
		var height   = parentHeight - heightTb + "px";

		box.style.height = height;
		box.style.width = (fullscreen ? document.body.offsetWidth : this.$width || 0) - 20 + "px";

		var scroll = this.editor.codemirror.getScrollerElement();

		if (scroll.style.height != height){
			scroll.style.height = height;
			this.editor.codemirror.refresh();
		}

        this.noresize = false;
	},
	$setSize:function(x,y){
		if (webix.ui.view.prototype.$setSize.call(this, x, y)){
			this._set_inner_size();
		}
	},

	setValue:function(value){
		if(!value && value !== 0)
			value = "";

		this.config.value = value;

		if (this.editor){
			this.editor.value(value);

            //by default - clear editor's undo history when setting new value
			if(!this.config.preserveUndoHistory)
				this.editor.codemirror.clearHistory();

			this._updateScrollSize();
		}
	},

	getValue:function(){
		return this.editor ? this.editor.value() : this.config.value;
	},

	focus:function(){
		this._focus_await = true;

        if (this.editor)
			this.editor.codemirror.focus();
	},

	getEditor:function(){
		return this.editor;
	},


	//undo, redo, etc
	undo:function(){
		this.editor.codemirror.undo();
	},
	redo:function(){
		this.editor.codemirror.redo();
	},
	undoLength:function(){
		return this.editor.codemirror.historySize().undo;
	}
}, webix.ui.view, webix.EventSystem);