/**
 * jquery.msgbox v8.0
 * http://jmsgbox.com
 */


(function($, undefined){
	
	/* Key shortcuts */
	var KEYS = {
		Esc: 27,
		Space: 32,
		Left: 37,
		Right: 39,
		Up: 38,
		Down: 40,
		Tab: 9,
		Enter: 13
	};
	
	var DEFAULTS = {
		fixed: true,		// whether the position of the box is fixed
		overlay: true,		// show overlay ?
		overlayEvent: 'flash',
							// click overlay to flash|close or function?
		id: 0,				// you need an ID to identify instances, only applicable for $.msgbox
		open: false,		// show msgbox when initialized ? By default, $(...).msgbox will not show, $.msgbox will do.
							// However, you could use $.msgbox({...,open:false,...}) to force it hidden on initialization
		drag: window,		// whether the msgbox is draggable, true|false|jQuery Selector(drag within the element)
		resize: true,		// specify false to disable resize, or a scale as the minimal scale to be resized.
		title: false,		// the title of the msgbox
		type: 'html',		// the type of the content, text|ajax|html|iframe|confirm|alert|prompt|warning|info=alert|error|success|photo|image=photo|album|gallery=album
		content: false,		// the content
		icons: [],			// the icons to control the msgbox, min|max|close
		buttons: [],		// the buttons OK, Cancel, or custom buttons?
		buttonEvents: {},	// the behavior of the buttons {'OK': function(){ alert('You clicked OK.'); }}
		keyEvents: {		
			Esc: 'close',
			Space: 'play',
			Left: 'prev',
			Right: 'next',
			Enter: 'play'
		},					// key bindings, use string to call the api or specify a function
		prefix: 'jMsgbox',	// the class prefix of overlay: jMsgbox-overlay, the box: jMsgbox-msgbox
		width: 600,			// the width of msgbox
		height: 450,		// the height of msgbox
		initialWidth: 350,	// the initial width of msgbox, when loaded, it will be animated to options.width and options.height
		initialHeight: 220, // see initialHeight
		top: false,			// the position of msgbox, if false, will show in the middle of the window
		left: false,
		titleHeight: 30,	// the height of the title of it is not specified in css
		footHeight: 40,
		transition: "swing",// the transition, only jquery-build transitions supported (swing, linear)
		speed: 300,			// the speed of the animation of open and close
		opacity: .9,		// the opacity of the overlay, you can use !important to override this in css
		zIndex: 99,			// the initial z-index of overlay and wrap. Just in case some other elements in document have greater z-index
		lang: 'en',			// the language, jquery.msgbox.i18n.js need
		minPos: 'top',		// or bottom, the position of the "task bar"
		minWidth: 200,		// the width of minimized msgbox, height is titleHeight
		
		photoAuto: true,	// whether to play the album automatically on first open
		photoSpeed: 2500,	// the interval of showing photos
		photoScaled: false,	// whether to scale the photo the scale of (options.width, options.height)
		photoFade: 500,		// whether to use fade transition to show photos, false, or a miniseconds
		
		padding: 0,			// the padding of the content
		
		imgError: 'Failed to load image.',	// the error message when loading image
		xhrError: 'Failed to load URL.',	// the error message when using ajax
											// these will be overrided by $.msgboxI18N.en.imgError
											//						and   $.msgboxI18N.en.xhrError
		
		// callbacks
		onOpen: false,
		onClose: false,
		onLoad: false,
		onBeforeClose: false
	};
	
	// helper functions
	var createElement = function(tag, className, style, attr) {
		style = style || {};
		attr  = attr  || {};
		return $(document.createElement(tag)).addClass(className).attr(attr).css(style);
	};
	
	// Get the window height using innerHeight when available to avoid an issue with iOS
	// http://bugs.jquery.com/ticket/6724
	// inspired from colorbox (http://www.jacklmoore.com/colorbox/)
	var winheight = function() {
		return window.innerHeight ? window.innerHeight : $(window).height();
	};
	
	// i18n, if text translation exists, return it, otherwise return the text itself
	// xhrError and imgError will return options.xhrError, options.imgError
	var _ = function (text, lang) {
		if (!$.msgboxI18N || !$.msgboxI18N[lang] || !$.msgboxI18N[lang][text])
			return text;
		return $.msgboxI18N[lang][text];
	};
	
	// class MSGBOX
	var MSGBOX = function (obj, options) {
		
		// variable starts with $ are jquery object
		/* the overlay */
		this.$overlay;
		/* the whole wapper of msgbox */
		this.$wrap;
		/* the control panel containing the icons */
		this.$controls;
		/* the icons (prev|play|next|min|max|close) */
		this.$icons    = {};
		/* the title wrap */
		this.$title;
		/* the content wrapper */
		this.$content;
		/* the content loaded */
		this.$loaded;
		/* the prompt input */
		this.$prompt;
		/* the iframe */
		this.$iframe;
		/* the foot wrapper */
		this.$foot;
		/* the img for photo/gallery */
		this.$img;
		/* the buttons in the foot */
		this.$buttons = {};
		/* the resize handler in the right bottom */
		this.$resize;
		/* the trigger of msgbox */
		this.$trigger = obj;
		
		/* the options */
		this.options    = options;
		/* the returned value, used for confirm/prompt */
		this.v;
		/* flag, whether the content is loaded */
		this.loaded     = false;
		/* flag, whether msgbox is minimized */
		this.minimized  = false;
		/* flag, whether msgbox is maximized */
		this.maximized  = false;
		/* flag, whether msgbox is opened */
		this.opened     = false;
		/* the drag data used to calculate the  position of msgbox */
		this.dragData   = {};
		/* the resize data used to calculate the dimension of msgbox */		
		this.resizeData = {};
		/* for album
		   playing = -2, force paused when closed
		   playing = -1, paused
		   playing = setTimeout, playing*/
		this.playing    = false;
		/* whether title is specified by user. If it is, title will not be replaced.  */
		this.titleSpecified = false;
		/* the index of the photo in the gallery */
		this.index      = 0;
		
		/* complete the missing options or options in some situation */
		this._completeOptions();
		/* assemble the doms(elements) */
		this._assemble();
		/* append the elements to body */
		this._append();
		/* bind the events for the elements/keys */
		this._bindEvents();
		/* open msgbox if options.open is true */
		if (this.options.open) this.open();
	};
	
	// methods of MSGBOX
	MSGBOX.prototype = {
		
		// private functions are starting with _
		
		// complete the options
		_completeOptions: function () {
			switch (this.options.type) {
				case 'confirm':
				case 'prompt':
					// give the buttons
					if (this.options.buttons!==null && this.options.buttons.length == 0) 
						this.options.buttons = ['OK', 'Cancel'];
					if (this.options.icons!==null && this.options.icons.length == 0) 
						this.options.icons   = ['close'];
					// give the dimension
					if (this.options.width == DEFAULTS.width && this.options.height == DEFAULTS.height) { // user not specify dimension
						this.options.width = this.options.initialWidth;
						this.options.height = this.options.initialHeight;
					}
					break;
				
				case 'alert':
				case 'warning':
				case 'info':
				case 'error':
				case 'success':
					// give the buttons
					if (this.options.buttons!==null && this.options.buttons.length == 0) 
						this.options.buttons = ['OK'];
					if (this.options.icons!==null && this.options.icons.length == 0) 
						this.options.icons   = ['close'];
					// give the dimension
					if (this.options.width == DEFAULTS.width && this.options.height == DEFAULTS.height) { // user not specify dimension
						this.options.width = this.options.initialWidth;
						this.options.height = this.options.initialHeight;
					}
					break;
				
				case 'photo':
				case 'image':
					// give the trigger as the handler
					if (this.$trigger && !this.options.content)
						this.options.content = this.$trigger;
					// give the icons
					if (this.options.icons!==null && this.options.icons.length == 0) 
						this.options.icons   = ['close'];
					// disable resize by default
					this.options.resize = false;
					break;
				
				case 'album':
				case 'gallery':
					// get the selector of the gallery
					if (this.$trigger && !this.options.content)
						this.options.content = this.$trigger.selector;
					// give the icons
					if (this.options.icons!==null && this.options.icons.length == 0) 
						this.options.icons   = ['prev', 'play', 'next', 'close'];
					// disable resize by default
					this.options.resize = false;
					break;
				
				default:
					// default icons
					if (this.options.icons!==null && this.options.icons.length == 0)
						this.options.icons   = ['max', 'close'];
					break;
			}
			
			// get the url from trigger if it not specified
			if (($.inArray(this.options.type, ['ajax', 'iframe']) > -1) && !this.options.content && this.$trigger) {
				this.options.content = this.$trigger.attr('href');
			}
			
			if (!this.options.width) this.options.width = this.options.initialWidth;
			if (!this.options.height) this.options.height = this.options.initialHeight;
			
			// give default message
			if (!this.options.content && $.inArray(this.options.type, ['ajax', 'iframe', 'photo', 'image', 'album', 'gallery']) == -1 )
				this.options.content = 'jquery.msgbox v ' + $.msgbox.version;
			
			// not foot height if no buttons
			if (this.options.buttons === null || this.options.buttons.length == 0)
				this.options.footHeight = 0;
			
			// only one instance support for $(...).msgbox
			if (this.$trigger) this.options.id = 0; 
			
			// title is specified?
			if (this.options.title) this.titleSpecified = true;
			// give default speed for the photo fading animation
			if (this.options.photoFade === true) this.options.photoFade = DEFAULTS.photoFade;
			if (this.options.photoFade === false) this.options.photoFade = 0;
			
			// specify the default error for xhrError and imgError from options
			$.msgboxI18N    = $.msgboxI18N || {};
			$.msgboxI18N.en = $.msgboxI18N.en || {};
			$.msgboxI18N.en.xhrError = $.msgboxI18N.en.xhrError || this.options.xhrError;
			$.msgboxI18N.en.imgError = $.msgboxI18N.en.imgError || this.options.imgError;
			
		},
		
		// assemble the html elements
		_assemble: function () {
			// overlay
			this.$overlay = createElement('div', this.options.prefix+'-overlay', {
				position: 'fixed',
				top: 0,
				left: 0,
				height: '100%',
				width: '100%',
				opacity: this.options.opacity,
				display: 'none'
			});
			// wrap
			// calculate position of msgbox
			var top  = this.options.top !== false ? this.options.top : (winheight() - this.options.initialHeight) / 2 - this.options.titleHeight;
			var left = this.options.left !== false ? this.options.left : ($(window).width() - this.options.initialWidth) / 2;
			this.$wrap = createElement('span', this.options.prefix+'-wrap', {
				display: 'none',
				width: this.options.initialWidth,
				height: this.options.initialHeight,
				position: this.options.fixed ? 'fixed' : 'absolute',
				overflow: 'hidden',
				top: this.options.fixed ? top : top + $(window).scrollTop(),
				left: this.options.fixed ? left : left + $(window).scrollLeft()
			});
			
			// title
			this.$title = createElement('div', this.options.prefix + '-title', {
				position: 'relative',
				height: this.options.titleHeight,
				cursor: this.options.drag ? 'move' : 'auto'
			});
			if (this.options.title) this.$title.html(this.options.title);
			
			// control panel
			var iconCss = {display: 'inline-block'}
			this.$icons.prev  = createElement('a', this.options.prefix + '-prev', iconCss, {href: 'javascript:;', title:_('Prev', this.options.lang)});
			this.$icons.next  = createElement('a', this.options.prefix + '-next', iconCss, {href: 'javascript:;', title:_('Next', this.options.lang)});
			this.$icons.play  = createElement('a', this.options.prefix + '-play', iconCss, {href: 'javascript:;', title:_('Play/Pause', this.options.lang)});
			this.$icons.min   = createElement('a', this.options.prefix + '-min', iconCss, {href: 'javascript:;', title:_('Minimize', this.options.lang)});
			this.$icons.max   = createElement('a', this.options.prefix + '-max', iconCss, {href: 'javascript:;', title:_('Maximize', this.options.lang)});
			this.$icons.close = createElement('a', this.options.prefix + '-close', iconCss, {href: 'javascript:;', title:_('Close', this.options.lang)});
			this.$controls    = createElement('span', this.options.prefix + '-controls', {
				position: 'absolute',
				height: '100%'
			});
			if (this.options.icons!==null) {
				for (var i=0; i<this.options.icons.length; i++) {
					this.$controls.append(this.$icons[this.options.icons[i]]);
				}	
			}
			
			// foot
			var buttonAttr = {type: 'button'};
			this.$buttons.OK     = createElement('input', this.options.prefix + '-ok', {}, buttonAttr);
			this.$buttons.Cancel = createElement('input', this.options.prefix + '-cancel', {}, buttonAttr);
			this.$buttons.OK.val(_('OK', this.options.lang));
			this.$buttons.Cancel.val(_('Cancel', this.options.lang));
			
			this.$foot = createElement('div', this.options.prefix + '-foot', {
				position: 'relative',
				height: this.options.footHeight
			});
			if (this.options.buttons!==null) {
				var x = 0;
				for (var i=0; i<this.options.buttons.length; i++) {
					if (!this.$buttons[this.options.buttons[i]])
						this.$buttons[this.options.buttons[i]] = createElement(
							'input',
							this.options.prefix + '-button-' + (++x), {},
							buttonAttr
						).val(this.options.buttons[i]);
					this.$foot.append(this.$buttons[this.options.buttons[i]]);
				}
			}
			
			// resize
			this.$resize = createElement('a', this.options.prefix + '-resize', {
				cursor: 'se-resize',
				position: 'absolute',
				bottom: '0px',
				right: '0px',
				display: 'inline-block'
			}, {href: 'javascript:;'});
			
			if (!$.support.boxSizing) { // fix ie7's bug that scrollbar appears when an absolute element with bottom:0 and right:0 in a relative container
				this.$resize.css({
					right: '5px',
					bottom: '5px'
				});
			}
			
			// content
			this.$content = createElement('div', this.options.prefix + '-content', {
				overflow: 'hidden',
				position: 'relative'
			});
			
			// prompt
			this.$prompt = createElement('input', this.options.prefix + '-prompt-input', {}, {
				type: 'text'
			});
			
			this.$loaded = createElement('div', this.options.prefix + '-loaded', {
				padding: this.options.padding,
				width: '100%',
				height: '100%',
				overflow: $.inArray(this.options.type, ['photo', 'image', 'album', 'gallery']) == -1 ? 'auto' : 'hidden'
			});
			
			this.$loading = createElement('div', this.options.prefix + '-loading', {
				height: '100%',
				width:  '100%'
			});
		},
		
		// append the element to DOM
		_append: function () {
			if (this.options.overlay) $(document.body).append(this.$overlay);
			$(document.body).append(this.$wrap.append(this.$title.append(this.$controls), this.$content.append(this.$loaded)));
			if (this.options.buttons !== null && this.options.buttons.length > 0) {
				this.$foot.appendTo(this.$wrap);
				if (this.options.resize) this.$resize.appendTo(this.$foot);
			} else {
				if (this.options.resize) this.$resize.appendTo(this.$content);
			} 
		},
		
		_bindEvents: function () {
			var that = this;
			
			// the trigger
			if (this.$trigger) {
				this.$trigger.bind ('click.' + this.options.prefix, function (e) {
					e.preventDefault();
					that.focus();
				});	
			}
			
			this.enableResize();
			this.enableDrag();
			
			if (this.options.overlay && this.options.overlayEvent) {
				var fn = false;
				if ($.isFunction(this.options.overlayEvent))
					fn = this.options.overlayEvent;
				else if ($.isFunction(this[this.options.overlayEvent])) {
					fn = this[this.options.overlayEvent];
				}
				if (fn) this.$overlay.bind('click.' + this.options.prefix, function () {
					fn.apply(that);
				});
			}
			
			// bind events for buttons
			switch (this.options.type) {
					
				case 'confirm':
					
					if (!(this.options.buttonEvents.OK)) {
						this.options.buttonEvents.OK = function () {
							this.close(function () { this.v = true; });
						}
					}
					
					if (!(this.options.buttonEvents.Cancel)) {
						this.options.buttonEvents.Cancel = function () {
							this.close(function () { this.v = false; });
						}
					}
					break;
				
				case 'prompt':
					
					if (!(this.options.buttonEvents.OK)) {
						this.options.buttonEvents.OK = function () {
							this.close(function () { this.v = this.$prompt.val(); });
						}
					}
					
					if (!(this.options.buttonEvents.Cancel)) {
						this.options.buttonEvents.Cancel = function () {
							this.close(function () { this.v = undefined; });
						}
					}
					break;
				
				default:
					
					if (!(this.options.buttonEvents.OK)) {
						this.options.buttonEvents.OK = 'close';
					} 
					break;
			}
			
			$.each (this.options.buttonEvents, function (button, fn) {
				if (!$.isFunction(fn)) fn = $.isFunction(that[fn]) ? that[fn] : false;
				if (!fn) return;
				that.$buttons[button].bind('click.' + that.options.prefix, function(){
					fn.apply(that);
				});
			});
			
			// bind events for icons
			$.each (this.$icons, function (icon, $icon) {
				var fn;
				switch (icon) {
					case 'close':
						fn = function (e) { e.stopPropagation(); that.close();};
						$icon.bind('click.' + that.options.prefix, fn);
						break;
					case 'max':
						fn = function (e) { e.stopPropagation(); that.max();  };
						$icon
							.unbind('click.max.' + that.options.prefix)
							.one('click.max.' + that.options.prefix, fn);
						break;
					case 'min':
						fn = function (e) { e.stopPropagation(); that.min(); };
						$icon
							.unbind('click.min.' + that.options.prefix)
							.one('click.min.' + that.options.prefix, fn);
						break;
					case 'play':
						fn = function (e) { e.stopPropagation(); that.play(); };
						$icon.bind('click.play.' + that.options.prefix, fn);
						break;
					case 'prev':
						fn = function (e) { e.stopPropagation(); that.prev(); };
						$icon.bind('click.prev.' + that.options.prefix, fn);
						break;
					case 'next':
						fn = function (e) { e.stopPropagation(); that.next(); };
						$icon.bind('click.next.' + that.options.prefix, fn);
						break;
				}
				
			});
			
			this.$wrap.bind('mousedown.' + that.options.prefix, function () {
				$(this).css('z-index', ++ $.msgbox._zIndex);
				$.msgbox._focused = that;
			});
			
			// key binds
			$.each (this.options.keyEvents, function(key, fn) {
				key = KEYS[key] || key;
				if (!key) return;
				
				if (!$.isFunction(fn)) fn = $.isFunction(that[fn]) ? that[fn] : false;
				if (!fn) return;
				
				$(document).bind('keydown.' + that.options.prefix, function(e) {
					if (e.keyCode !== key) return;
					if ($.msgbox._focused != that) return;
					fn.apply(that);
				});
			});
			
			
		},
		
		_loadImg: function ($handler, callback) {
			if (!$handler || $handler.length == 0) return;
			
			var that = this;
			// purge
			//this.$content.contents().filter(function(){
			//	return this.nodeType == 3 || (!$(this).is(that.$img) && !$(this).is(that.$resize));
			//}).remove();
			
			this.$loading = createElement('div', this.options.prefix + '-loading', {
				height: '100%',
				width:  '100%'
			}).appendTo(this.$loaded);
		
			if (!this.titleSpecified) this.title ($handler.attr('title'));
			
			var imgload = function () {
				that.$loading.remove();
				that.$loading = undefined;
				
				if (that.options.photoScaled) { // scaled to height and width
					var shouldBeHeight = that.options.height - that.options.titleHeight - that.options.footHeight;
					var imgHeight = that.$img.outerHeight(true);
					var imgWidth  = that.$img.outerWidth(true);
					var ratio = 1;
					
					if (imgHeight > shouldBeHeight) 
						ratio = shouldBeHeight / imgHeight;
					if (imgWidth*ratio > that.options.width)
						ratio = that.options.width / imgWidth;
					
					var realWidth = imgWidth * ratio, realHeight = imgHeight * ratio;
					that.$img.css ({
						position: 'absolute',
						width : (imgWidth * ratio) + 'px',
						height: (imgHeight * ratio)  + 'px'
					});
					
					if (realHeight <= shouldBeHeight)
						that.$img.css('top', ((shouldBeHeight - realHeight) / 2) + 'px');
					if (realWidth <= that.options.width) 
						that.$img.css('left', ((that.options.width - realWidth) / 2) + 'px');
					
					
				} else {
					that.options.height = that.$img.outerHeight(true) + that.options.titleHeight + that.options.footHeight;
					that.options.width  = that.$img.outerWidth(true);
				}
				
				that.$img.fadeIn (that.options.photoFade);
				that.loaded = true;
				if (that.options.onLoad) that.options.onLoad.apply(that);
				if (callback) callback.apply(that);
			};

			if (!this.$img) {
				this.$img = createElement('img', this.options.prefix + '-photo');
			
				$.each (['alt', 'longdesc', 'aria-describedby'], function (i, val) {
					var attr = $handler.attr(val) || $handler.attr('data-'+val) || "";
					that.$img.attr(val, attr);
				});
				
				this.$img.hide().appendTo(this.$loaded)
					.error(function(){
						that.$loading.remove();
						that.$loading = undefined;
						that.loaded = true;
						that.content(_('imgError', that.options.lang));
					});
			}
			this.$img.hide().unbind('load.' + this.options.prefix)
				.bind('load.' + this.options.prefix, imgload);
			
			setTimeout(function(){
				that.$img.attr('src', $handler.attr('href'));
			}, 1);
						
		},
		
		_load: function (callback) {
			if (this.loaded) return;
			
			
			switch (this.options.type) {
				case 'text':
					this.$loaded.text(this.options.content);
					this.loaded = true;
					if (callback) callback.apply(this);
					if (this.options.onLoad) this.options.onLoad.apply(this);
					break;
				
				case 'html':
					var content = $.type(this.options.content)==='object'
									? this.options.content.show()
									: this.options.content;

					this.$loaded.append(content);
					this.loaded = true;
					if (callback) callback.apply(this);
					if (this.options.onLoad) this.options.onLoad.apply(this);
					break;
				
				case 'alert':
				case 'warning':
				case 'info':
				case 'error':
				case 'success':
				case 'confirm':
					var content = $.type(this.options.content)==='object'
									? this.options.content.show()
									: this.options.content;
					
					this.$loaded.append(content).addClass(
						  this.options.prefix + '-shortcut '
						+ this.options.prefix + '-' + this.options.type);
					this.loaded = true;
					if (callback) callback.apply(this);
					if (this.options.onLoad) this.options.onLoad.apply(this);
					break;
					
				case 'prompt':
					var content = $.type(this.options.content)==='object'
									? this.options.content.show()
									: this.options.content;
					
					this.$loaded.append(content).append(this.$prompt).addClass(
						  this.options.prefix + '-shortcut '
						+ this.options.prefix + '-' + this.options.type);
					
					this.loaded = true;
					if (callback) callback.apply(this);
					if (this.options.onLoad) this.options.onLoad.apply(this);
					break;
				
				case 'ajax':
					this.$loading = createElement('div', this.options.prefix + '-loading', {
						height: '100%',
						width:  '100%'
					}).appendTo(this.$content);
					var that = this;
					this.$loaded.load(this.options.content, function(data, state){
						that.$loading.remove();
						that.$loading = undefined;
						that.$loaded.appendTo(that.$content);
						if (state == 'error') 
							that.$loaded.html(_('xhrError', that.options.lang));
						that.loaded = true;
						if (callback) callback.apply(that);
						if (that.options.onLoad) that.options.onLoad.apply(that);
					});
					break;
				
				case 'photo':
				case 'image':
					var $handler = $(this.options.content);
					this._loadImg($handler, callback);
					break;
				
				case 'album':
				case 'gallery':
					var index = this.$trigger ? this.$trigger.index(this.options.content) : 0;
					this.index = index < 0 ? 0 : index;
					var $handler = $(this.options.content).eq (this.index);
					
					var that = this;
					
					this._loadImg($handler, function(){
						that.$img
							.unbind('click.' + that.options.prefix)
							.bind('click.' + that.options.prefix, function () {
								that.next();
						});
						if (callback) callback.apply(that);
					});
					
					break;
				
				case 'iframe':
					var $loading = createElement('div', this.options.prefix + '-loading', {
						height: this.$content.innerHeight() + 'px',
						width:  '100%'
					}).appendTo(this.$content);
					if (!this.options.title) {
						this.title(_('Loading', this.options.lang) + ' ...');
						this.options.title = false;
					}
					
					var that = this;
					this.$iframe = createElement('iframe', this.options.prefix + '-iframe', {
						height: '100%',
						width:  '100%',
						border: 'none',
						display: 'none'
					},{
						frameborder: 0,
						marginheight: '0px',
						marginwidth: '0px',
						scrolling: 'auto',
						src: this.options.content
					}).appendTo(that.$loaded).one('load', function() {
						$loading.remove();
						that.$iframe.show();
						if (!that.options.title) {
							var title = "";
							try {
								title = $('title', that.$iframe.contents()).text();
							} catch(e) {} // not available for cross-domain
							that.title(title);	
						}
						that.loaded = true;
						if (that.options.onLoad) that.options.onLoad.apply(that);
						if (callback) callback.apply(that);
					});
					break;
			}
				

		},
		
		_restoreFromMin: function (callback) {
			if (!this.minimized) return;
			
			var that = this;
			this.animate (this.minimized, function () {
				that.minimized = false;
				that.$icons.min.removeClass (that.options.prefix + '-restore');
				that.$wrap.css('position', that.options.fixed ? 'fixed' : 'absolute');
				that.$icons.min
					.unbind('click.min.'+ that.options.prefix)
					.one ('click.min.'+ that.options.prefix, function () { that.min(); });
				that.enableDrag();
				that.enableResize();
				if (callback) callback.apply(that);
			});
		},
		
		_min: function (where, callback) {
			if (this.minimized) return;
			
			var orgState = {
				width   : parseInt(this.$wrap.css('width')),
			    height  : parseInt(this.$wrap.css('height')),
			    top     : parseInt(this.$wrap.css('top')),
			    left    : parseInt(this.$wrap.css('left'))
			};
			
			var that = this;
			this.animate (where, function () {
				that.minimized = orgState;
				that.$icons.min.addClass (that.options.prefix + '-restore');
				that.$wrap.css('position', 'fixed');
				that.$icons.min
					.unbind('click.restore.'+ that.options.prefix)
					.one ('click.restore.'+ that.options.prefix, function () { that.restore(); });
				if (!this.$trigger) that.disableDrag();
				that.disableResize();
				if (callback) callback.apply(that);
			});
			
		},
		
			
		enableDrag: function () {
			if (this.options.drag === false) return;
			
			var that = this;
			
			this.$title.css('cursor', 'move').bind('mousedown.drag.' + this.options.prefix, function (e) {
				
				that.dragData.x = e.pageX;
				that.dragData.y = e.pageY;
				that.dragData.top    = parseInt(that.$wrap.css('top'));
				that.dragData.left   = parseInt(that.$wrap.css('left'));
				that.dragData.width  = parseInt(that.$wrap.css('width'));
				that.dragData.height = parseInt(that.$wrap.css('height'));
				
				$(document).one('mouseup.drag.' + that.options.prefix, function (e) {
					
					that.dragData = {};
					$(this).unbind(' mousemove.drag.' + that.options.prefix);
					
				}).bind('mousemove.drag.' + that.options.prefix, function (e) {
					
					e.preventDefault();
					
					if ($.isEmptyObject(that.dragData)) return;
					var left  = that.dragData.left + e.pageX - that.dragData.x;
					var top   = that.dragData.top  + e.pageY - that.dragData.y;
					var width = that.dragData.width;
					var height= that.dragData.height;
					var $container = $(that.options.drag);
					
					if ($container.length > 0) {
						var offset = $container.offset();
						if (!offset) offset = {left:0, top:0}; // if it is window
						if (!that.options.fixed) {
							offset.left += $(window).scrollLeft();
							offset.top  += $(window).scrollTop();
						}
						var mleft  = offset.left;
						var mtop   = offset.top;
						var maleft = offset.left + $container.innerWidth();
						var matop  = offset.top  + $container.innerHeight();
						left = left <= mleft ? mleft : left;
						left = left + width > maleft ? maleft - width : left;
						top  = top + height > matop ? matop - height : top;
						top  = top <= mtop ? mtop : top;
					}
					
					that.animate({width: width, height:height, top: top, left: left}, undefined, 0);
					
				});
			})
		},
		
		
		disableDrag: function () {
			this.$title.css('cursor', 'auto').unbind('mousedown.drag.' + this.options.prefix);
		},
		
		enableResize: function () {
			
			if (this.options.resize === false) return;
			
			// resize
			var that = this;
			this.$resize.show().bind('mousedown.resize.' + this.options.prefix ,function (e) {
				
				that.resizeData.x = e.pageX;
				that.resizeData.y = e.pageY;
				that.resizeData.width  = parseInt(that.$wrap.css('width'));
				that.resizeData.height = parseInt(that.$wrap.css('height'));
				that.resizeData.top    = parseInt(that.$wrap.css('top'));
				that.resizeData.left   = parseInt(that.$wrap.css('left'));
				
				$(document).bind('mouseup.resize.' + that.options.prefix, function (e) {
					
					that.resizeData = {};
					$(this).unbind('mouseup.resize.' + that.options.prefix + ' mousemove.resize.' + that.options.prefix);
					
				}).bind('mousemove.resize.' + that.options.prefix, function (e) {
					
					e.preventDefault();
					
					if ($.isEmptyObject(that.resizeData)) return;
					var width  = that.resizeData.width + e.pageX - that.resizeData.x;
					var height = that.resizeData.height+ e.pageY - that.resizeData.y;
					width  = width < that.options.resize.width ? that.options.resize.width : width;
					height = height < that.options.resize.height ? that.options.resize.height : height;
					that.animate({width: width, height:height, top: that.resizeData.top, left: that.resizeData.left}, undefined, 0);
					
				});	
			});
		},
		
		disableResize: function () {
			this.$resize.hide().unbind('mousedown.resize.' + this.options.prefix);
		},
		
		
		// get/set position
		// sc : {top:top, left:left, width:width, height:height}
		animate: function (sc, callback, speed) {
			sc = sc || {};
			sc = $.extend({}, {
				top: this.options.top,
				left: this.options.left,
				width: this.options.width,
				height: this.options.height,
				opacity: 1
			}, sc);
			
			if (speed === undefined) speed = this.options.speed;
			
			var top  = (winheight() - sc.height) / 2 - this.options.titleHeight;
			var left = ($(window).width() - sc.width) / 2;
			top = top < 0 ? 0 : top;
			
			if (sc.top === false) 
				sc.top =  this.options.fixed ? top : top + $(window).scrollTop();
			if (sc.left === false)
				sc.left = this.options.fixed ? left : left + $(window).scrollLeft();
			
			var that = this; 
			
			this.$overlay.fadeTo(speed, this.options.opacity);
			
			var step = function () {
				that.$content.height (that.$wrap.height() - that.options.titleHeight - that.options.footHeight);
			}
			
			this.$wrap.dequeue().animate(sc, {
				duration: speed,
				complete: function () {
					step ();
					if (callback) callback.apply(that);
				},
				step: step,
				easing: this.options.transition
			});
		},
		
		flash : function (opacity, interval, callback) {
			opacity = opacity || .3;
			interval = interval || 100;

			var that = this;
			this.$title.fadeTo(0, opacity)
				.delay(interval)
				.fadeTo(0, 1)
				.delay(interval)
				.fadeTo(0, opacity)
				.delay(interval)
				.fadeTo(0, 1)
				.queue(function(){
					if (callback) callback.apply(that);
					$(this).dequeue();
				});
		},
		
		play: function (callback) {
			if (this.options.type != 'album' && this.options.type != 'gallery') return;
			
			if (this.playing && this.playing!=-1 && this.playing!=-2) {
				this.pause();
				return;  // already playing
			}
			
			var that = this;
			
			this.$icons.play
				.removeClass(this.options.prefix + '-pause');
			
			this.playing = setTimeout(function(){
				that.next(callback);
			}, that.options.photoSpeed);
		},
		
		pause: function () {
			if (this.options.type != 'album' && this.options.type != 'gallery') return;
			if (!this.playing || this.playing === -1 || this.playing === -2) return; // already paused or not started
			
			if (this.playing) {
				clearTimeout(this.playing);
				this.playing = -1;
			}
			
			var that = this;
			this.$icons.play
				.addClass(this.options.prefix + '-pause');
		},
		
		next: function (callback) {
			if (this.options.type != 'album' && this.options.type != 'gallery') return;
			this.index ++;
			this.index = this.index >= $(this.options.content).length ? 0 : this.index;
			var $handler = $(this.options.content).eq (this.index);
			
			var that = this;

			if (that.playing && that.playing!=-1 && that.playing!=-2) 
				clearTimeout(that.playing);
				
			this._loadImg($handler, function(){
				if (that.playing && that.playing!=-1 && that.playing!=-2) {
					that.playing = setTimeout (function(){
						that.next(callback);
					}, that.options.photoSpeed);
				}
				that.animate();
				if (callback) callback.apply(that);
			});
			
		},
		
		prev: function (speed, callback) {

			if (this.options.type != 'album' && this.options.type != 'gallery') return;
			this.index --;
			this.index = this.index >= $(this.options.content).length ? 0 : this.index;
			var $handler = $(this.options.content).eq (this.index);
			
			var that = this;

			if (that.playing && that.playing!=-1 && that.playing!=-2) 
				clearTimeout(that.playing);
				
			this._loadImg($handler, function(){
				if (that.playing && that.playing!=-1 && that.playing!=-2) {
					that.playing = setTimeout (function(){
						that.next(callback);
					}, that.options.photoSpeed);
					
				}
				that.animate();
				if (callback) callback.apply(that);
			});
			
		},
		
		// show the msgbox
		open : function (callback) {
			if (this.opened) return;
			
			this.$overlay.show().css('z-index', ++$.msgbox._zIndex);
			this.$wrap.show().css('z-index', $.msgbox._zIndex);
			
			// adjust titleHeight and footHeight
			this.options.titleHeight = this.$title.outerHeight(true); // adjust
			this.$title.css({'line-height': this.options.titleHeight + 'px'});
			
			if (this.options.footHeight > 0) {
				this.options.footHeight = this.$foot.outerHeight(true);
				//this.$foot.css({'line-height': this.options.footHeight + 'px'});
			}
			
			this.$content.height (this.$wrap.height() - this.options.titleHeight - this.options.footHeight);
			
			// resize min scale
			if (this.options.resize === true) {
				this.options.resize = {
					width:  this.options.minWidth,
					height: (this.options.buttons !== null && this.options.buttons.length > 0)
						? this.options.titleHeight + this.options.footHeight + 5
						: this.options.titleHeight + 5
				};
			}
			
								
			var that = this;
			var rightAfterOpen = function () {
				that.opened = true;
				$.msgbox._focused = that;
				if (that.options.onOpen) that.options.onOpen.apply(that);
				if (callback) callback.apply(that);
			};
			var mayPlayAlbum = function () {
				if ((that.options.type == 'album' || that.options.type == 'gallery')
				  && that.options.photoAuto && that.options.photoSpeed
				  && (!that.playing || that.playing == -2)) {
					that.play();
				}
			};
			
			if (this.loaded) { // reopen
				this.animate(undefined, function(){
					rightAfterOpen();
					mayPlayAlbum();
				});
			} else { // newly open
				this._load(function() {
					that.animate(undefined, rightAfterOpen);
					mayPlayAlbum();
				});
			}
		},
		
		// get the returned value
		val: function () {
			return this.v;
		},
		
		close: function (callback) {
			if (!this.opened) return;

			if (this.options.onBeforeClose && this.options.onBeforeClose.apply(this) === false) return;
			
			if (this.playing && this.playing != -1 && this.playing != -2) {
				clearTimeout(this.playing);
				this.playing = -2;  // pause
			}
			
			var that = this;
			var _close = function (callback) {
				that.animate({ width: that.options.initialWidth, height: that.options.initialHeight, opacity:0 }, function(){
					that.$overlay.fadeOut('fast', function() {
						that.opened = false;
						that.$wrap.hide();
						that.$overlay.hide();
						
						if (callback) callback.apply(that);
						if (that.options.onClose) that.options.onClose.apply(that);
					});	
				});
			};
			
			if (!this.$trigger && this.minimized) $.msgbox._arrangeMin(this, 'out', function(){
				_close(callback);
			});
			else _close(callback);
		},
		
		remove: function () {
			if (this.$trigger)
				this.$trigger.unbind('click.' + this.options.prefix);
			this.$overlay.remove();
			this.$wrap.remove();
		},
		
		// get/set title
		title: function (t) {
			if (t === undefined) return this.options.title;
			this.options.title = t;
			
			var that = this;
			this.$title.contents().filter(function(){
				return this.nodeType == 3 || !$(this).is(that.$controls)
			}).remove();
			this.$title.prepend(t);
			return this;
		},
		
		reload: function (callback) {
			this.loaded = false;
			if (this.options.type == 'iframe') {
				this.$iframe.remove();
			} else {
				if (this.$loaded) this.$loaded.remove();
			}
			this._load(callback);
		},
		
		focus: function (callback) {
			this.$overlay.css('z-index', ++$.msgbox._zIndex);
			this.$wrap.css('z-index', $.msgbox._zIndex);	
			
			var that = this;
			if (!this.opened) {
				this.open(callback);
			} else if (this.minimized) {
				this.restore(function(){
					$.msgbox._focused = that;
					if (callback) callback.apply(that);
				});
			} else {
				this.flash(undefined, undefined, function(){
					$.msgbox._focused = that;
					if (callback) callback.apply(that);
				});
			}
		},
		
		restore: function (callback) {
			if (this.minimized) {
				this.$trigger
					? this._restoreFromMin(callback)
					: $.msgbox._arrangeMin(this, 'out', callback);
			} else if (this.maximized) {
				var that = this;
				this.animate (this.maximized, function(){
					that.maximized = false;
					that.$icons.max.removeClass(that.options.prefix + '-restore');
					that.$wrap.css('position', that.options.fixed ? 'fixed' : 'absolute');
					that.$icons.max
						.unbind('click.max.' + that.options.prefix)
						.one ('click.max.' + that.options.prefix, function () { that.max(); });
					that.enableDrag();
					that.enableResize();
					if (callback) callback.apply(that);
				});
			}
		},
			
		min: function (callback) {
			if (this.minimized) {
				this.restore(callback);
			} else {
				this.$trigger ? this._min({
					width: this.options.minWidth,
					height: this.options.titleHeight
				}) : $.msgbox._arrangeMin(this, 'in', callback);
			}
		},
		
		max: function (callback) {
			if (this.maximized) {
				this.restore(callback)
				return;
			}
			
			var that = this, orgState = $.extend({}, this.minized);
			
			if (this.minimized) {
				
				this.minimized = {
					top: 0,
					left: 0,
					width: $(window).width(),
					height: winheight()
				}
				
				$.msgbox._arrangeMin(this, 'out', function () {
					that.maximized = orgState;
					that.$icons.max.addClass(that.options.prefix + '-restore');
					that.$wrap.css('position', 'fixed');
					that.$icons.max
						.unbind('click.restore.' + that.options.prefix)
						.one ('click.restore.' + that.options.prefix, function () { that.restore(); });
					that.disableDrag();
					that.disableResize();
					if (callback) callback.apply(that);
				});
				
			} else {
				var orgState = {
					width   : parseInt(this.$wrap.css('width')),
					height  : parseInt(this.$wrap.css('height')),
					top     : parseInt(this.$wrap.css('top')),
					left    : parseInt(this.$wrap.css('left'))
				};
				
				var that = this;
				this.animate ({
					top: 0,
					left: 0,
					width: $(window).width(),
					height: winheight()
				}, function () {
					that.maximized = orgState;
					that.$icons.max.addClass(that.options.prefix + '-restore');
					that.$wrap.css('position', 'fixed');
					that.$icons.max
						.unbind('click.restore.' + that.options.prefix)
						.one ('click.restore.' + that.options.prefix, function () { that.restore(); });
					that.disableDrag();
					that.disableResize();
					if (callback) callback.apply(that);
				});
			}
		},
		
		content: function (ctt) {
			var that = this;
			if (ctt === undefined) {
				return this.$loaded.html();
			} else {
				this.$loaded.html(ctt);
			}
			return true;
		}
	};
	
	$.fn.msgbox = function (options) {
		
		if (typeof options == 'object') {
			
			options = $.extend(true, {}, DEFAULTS, options);
			
			var selector = $(this).selector; // selector will lost in each loop
			return this.each (function (){
				var $obj = $(this);
				$obj.selector = selector;
				var msgbox = new MSGBOX ($obj, options);
				$(this).data('msgbox.' + options.id, msgbox);
			});
		
		} else {
			options = options || 0;
			var msgbox = $(this).data('msgbox.' + options);
			
			return msgbox;
		}
		return this;
	};
	
	$.msgbox = function (options) {
		
		if (typeof options == 'object') {
			
			var open = options.open === undefined ? true : options.open;
			options = $.extend(true, {}, DEFAULTS, options);
			
			var msgbox = $(document.body).data ('msgbox.' + options.id);
			if (msgbox) {
				msgbox.focus();
			} else {
				msgbox = new MSGBOX(false, options);
				$(document.body).data ('msgbox.' + options.id, msgbox);
				if (open) msgbox.open();
			}
			return msgbox;
		
		} else {
			
			options = options || 0;
			var msgbox = $(document.body).data ('msgbox.' + options);
			
			return msgbox;
		}
		
	};
	
	$.extend ($.msgbox, {
		defaults: function (options) {
			$.extend (DEFAULTS, options);
			$.msgbox._zIndex = DEFAULTS.zIndex;
		},
		
		version: '8.0',
		
		_focused: null,  // the focused instance
		
		_zIndex: DEFAULTS.zIndex,
		
		closeAll: function (callback) {
			var msgboxes = $(document.body).data();
			var q = $({});
			
			$.each (msgboxes, function (key, msgbox) {
				if (key.indexOf('msgbox.') === 0 && msgbox.opened) {
					q.queue('closeAll', function (next) {
						msgbox.close(next);
					});
				}
			});
			
			if (callback) q.queue('closeAll', callback);
			q.dequeue('closeAll');
		},
		
		restoreAll: function (callback) {
			var msgboxes = $(document.body).data();
			var q = $({});
			
			$.each (msgboxes, function (key, msgbox) {
				if (key.indexOf('msgbox.') === 0 && msgbox.minimized) {
					q.queue('restoreAll', function (next){
						msgbox.restore(next);
					});
				}
			});
			
			if (callback) q.queue('restoreAll', callback);
			q.dequeue('restoreAll');
		},
		
		minAll: function (callback) {
			var msgboxes = $(document.body).data();
			var q = $({});
			
			$.each (msgboxes, function (key, msgbox) {
				if (key.indexOf('msgbox.') === 0 && !msgbox.minimized) {
					q.queue('minAll', function(next) {
						msgbox.min(next);
					});
				}
			});
			
			if (callback) q.queue('minAll', callback);
			q.dequeue('minAll');
		},
		
		_arrangeMin: function (msgbox, action, callback){
			var msgboxes = $(document.body).data();
			if (!msgboxes) return;
			
			var minMbs = [], totalWidth = 0, index = 0, keys = [], gap = 3, q = $({});
			
			$.each (msgboxes, function (key, mb) {
				if (key.indexOf('msgbox.')===0
				  && (mb.minimized || key == 'msgbox.' + msgbox.options.id)
				  && mb.options.minPos == msgbox.options.minPos) {
					minMbs[key] = mb;
					keys.push(key);
					totalWidth += mb.options.minWidth + gap;
				}
			});
			
			keys.sort(); 
			index = $.inArray('msgbox.' + msgbox.options.id, keys);
			
			if (action == 'in') {
				
				var ratio = 1, left = 0, thisWidth;
				if (totalWidth > $(window).width()) ratio = $(window).width() / totalWidth;
				thisWidth = msgbox.options.minWidth * ratio;

				$.each (keys, function (x, key) {
					if (x == index) { 
						q.queue('min', function(next){ 
							msgbox._min ({
								left: left,
								top: msgbox.options.minPos == 'bottom' ? winheight() - msgbox.options.titleHeight : 0,
								width: thisWidth,
								height: msgbox.options.titleHeight	
							}, function () {
								left += thisWidth + gap;
								next();
							});
						});
					} else { 
						var width = minMbs[key].options.minWidth * ratio;
						q.queue('min', function(next) {
							minMbs[key].animate ({
								left: left,
								top: minMbs[key].options.minPos == 'bottom' ? winheight() - minMbs[key].options.titleHeight : 0,
								width: width,
								height: minMbs[key].options.titleHeight	
							}, function () {
								left += width + gap;
								next();
							}, 50);
						});
					}	
				});
				
			} else {
				
				totalWidth -= msgbox.options.minWidth;
				var ratio = 1;
				if (totalWidth > $(window).width()) ratio = $(window).width() / totalWidth;
				
				var left = 0;
				
				q.queue ('min', function(next){
					msgbox._restoreFromMin(next);
				});
				
				$.each (keys, function (x, key) {
					if (x != index) 
						q.queue('min', function(next){
							var width = minMbs[key].options.minWidth * ratio;
							minMbs[key].animate({
								left: left,
								top: msgbox.options.minPos == 'bottom' ? winheight() - minMbs[key].options.titleHeight : 0,
								width: width,
								height: minMbs[key].options.titleHeight
							}, next, 50);
							left += width  + gap;
						});	
				});
			}
			
			if (callback) {
				q.queue ('min', callback);
			}
			
			q.dequeue('min');
		}
	});
	
})(jQuery, undefined);