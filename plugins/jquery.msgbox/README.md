jquery.msgbox
=============

A jquery popup/modal/dialog plugin. Version 8.0

Documentation and examples: http://jmsgbox.com

Browser support: morden browsers, IE7+

Required: jquery 1.7+

*Previous version could be found at https://code.google.com/p/jquery-msgbox/*


Why another jquery popup plugin ?
---------------------------------

Most of the exising jquery popup plugins are lacking some of the features:

* Multiple instances support
* Resize handler to resize the popup box
* Maximization/Minimization of the popup box
* Dragging support
* Theme customization
* Key bindings support
* Working as a photo slideshow

Features
-------------

*(c) could be customized*

* Key bindings (c)
* Overlay events (c)
* Draggable
* Resizable
* Icons, (prev,play,next,min,max,close) (c)
* Buttons in footer, and their events could be fully customized (c)
* Working as a photo viewer
* Themes (c)
* Multiple instances (task tar simulation)
* Internationalization (c)
* API

Basic usage
-----------

	$(".trigger").msgbox({
		type: 'html',
		content: '<p>Hello</p>'
	});

	// calling API
	$(".trigger").msgbox().close();
	
	// multiple instances
	$.msgbox({
		type: 'text',
		content: 'instance1',
		id: 0
	});
	$.msgbox({
		type: 'html',
		content: 'instance2',
		id: 'msgbox1'
	});
	
	// calling API
	$.msgbox(0).close();
	$.msgbox('msgbox1').min();
