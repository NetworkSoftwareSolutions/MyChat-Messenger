webix.protoUI({
	name:"codemirror-editor",
	defaults:{
		mode:"text/x-pascal",
		lineNumbers:true,
		matchBrackets:true,
		theme:"neat"
	},
	$init:function(config){
		this.$view.innerHTML = "<textarea style='width:100%;height:100%;'></textarea>";
		this.$ready.push(this._render_when_ready);
	},

	// _render_cm_editor:function(){ // загрузку сделаю сам
	//
	// 	webix.require("pascalHints.js", this._render_when_ready, this);
	// },

	_render_when_ready:function(){
		webix.require.disabled = true;

		var extraPascalHints = window.extraPascalHints || {};

		this.editor = CodeMirror.fromTextArea(this.$view.firstChild, {
			mode         : this.config.mode,
			lineNumbers  : this.config.lineNumbers,
			matchBrackets: this.config.matchBrackets,
			theme        : this.config.theme,
			hintOptions  : {
				completeSingle: false
			}
		});

		var server = new CodeMirror.TernServer({
			defs: [extraPascalHints],
			queryOptions: {
				completions: {
					caseInsensitive: true
				}
			},
			hintDelay: 15000
		});

		this.editor.setOption("extraKeys", {
			"Ctrl-Space": function(cm) {
				server.complete(cm);
			},
			"Ctrl-U"    : function(cm) { server.showType(cm); },
			"Ctrl-O"    : function(cm) { server.showDocs(cm); },
			"Alt-."     : function(cm) { server.jumpToDef(cm); },
			"Alt-,"     : function(cm) { server.jumpBack(cm); },
			"Ctrl-Q"    : function(cm) { server.rename(cm); },
			"Ctrl-."    : function(cm) { server.selectName(cm); }
		});

		// this.editor.on("cursorActivity", function(cm) {
		// 	server.updateArgHints(cm);
		// });

		this.setValue(this.config.value);

		if (this._focus_await)
			this.focus();

		this.callEvent("onReady", []);
	},

	_set_inner_size:function(){
		if (!this.editor || !this.$width) return;

		this._updateScrollSize();
		this.editor.scrollTo(0,0); //force repaint, mandatory for IE
	},
	_updateScrollSize:function(){
		var box = this.editor.getWrapperElement();
		var height = (this.$height || 0) + "px";

		box.style.height = height;
		box.style.width = (this.$width || 0) + "px";

		var scroll = this.editor.getScrollerElement();
		if (scroll.style.height != height){
			scroll.style.height = height;
			this.editor.refresh();
		}
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
		if(this.editor){
			this.editor.setValue(value);
			//by default - clear editor's undo history when setting new value
			if(!this.config.preserveUndoHistory)
				this.editor.clearHistory();
			this._updateScrollSize();
		}
	},

	getValue:function(){
		return this.editor?this.editor.getValue():this.config.value;
	},

	focus:function(){
		this._focus_await = true;
		if (this.editor)
			this.editor.focus();
	},

	getEditor:function(){
		return this.editor;
	},


	//undo, redo, etc
	undo:function(){
		this.editor.undo();
	},
	redo:function(){
		this.editor.redo();
	},
	undoLength:function(){
		return this.editor.historySize().undo;
	}
}, webix.ui.view, webix.EventSystem);