/** JTABLE dialogcustom extension 
 by : nubuntu
**/

(function ($) {
  var base={
	  	_create:$.hik.jtable.prototype._create,
		_createAddRecordDialogDiv:$.hik.jtable.prototype._createAddRecordDialogDiv,
		_createEditDialogDiv:$.hik.jtable.prototype._createEditDialogDiv,
		_createViewDialogDiv:$.hik.jtable.prototype._createViewDialogDiv,
		_createErrorDialogDiv:$.hik.jtable.prototype._createErrorDialogDiv
	}	
    $.extend(true, $.hik.jtable.prototype, {
        _create: function () {
            base._create.apply(this, arguments);            
            this._createViewDialogDiv();
        },		
		_getFullOptions:function($dlg,newwin){
			newwin = typeof newwin !== 'undefined' ? newwin : false;
			$dlg = typeof $dlg !== 'undefined' ? $dlg : false;

			if(newwin){
			   var newBtn = $('<div class="ui-dialog-titlebar-buttonpane" style="position: absolute; top: 50%; right: 8em; margin-top: -10px; height: 18px;"><a class="ui-dialog-titlebar-newwin ui-corner-all ui-state-default" href="#" role="button" title="New Window"><span class="ui-icon ui-icon-newwin">newwindow</span></a></div>'
			   );
			   newBtn.click(function(){
				  	var link = $dlg.find('iframe').attr("src");
					var win = window.open(link, '_blank');
					if(win){
					    win.focus();
					}else{
					    alert('Please allow popups for this site');
					}					
				   $dlg.dialog('close');
			   });
			}else{
				var newBtn = $('<div/>');
			}
			var option = {
		         "create": function() {    ///// CREATE FUNCTION TO ADD CUSTOM BUTTON
            		$(this).prev('.ui-dialog-titlebar').find('.ui-dialog-title').after(newBtn);
            	},		
        "closable" : true,
        "maximizable" : true,
        "minimizable" : true,
        "collapsable" : true,
        "dblclick" : "collapse",
        "titlebar" : "transparent",
        "minimizeLocation" : "right",
        "icons" : {
          "close" : "ui-icon-closethick",
          "maximize" : "ui-icon-arrow-4-diag",
          "minimize" : "ui-icon-minus",
          "collapse" : "ui-icon-triangle-1-s",
          "restore" : "ui-icon-bullet"
        },
        "load" : function(evt, dlg){},
        "beforeCollapse" : function(evt, dlg){},
        "beforeMaximize" : function(evt, dlg){},
        "beforeMinimize" : function(evt, dlg){},
        "beforeRestore" : function(evt, dlg){},
        "collapse" : function(evt, dlg){},
        "maximize" : function(evt, dlg){},
        "minimize" : function(evt, dlg){},
        "restore" : function(evt, dlg){}				
			}
			return option;
		},
        /* Creates and prepares edit dialog div
        *************************************************************************/
        _createViewDialogDiv: function () {
            var self = this;

            //Create a div for dialog and add to container element
            self._$viewDiv = $('<div></div>')
                .appendTo(self._$mainContainer);

            //Prepare dialog
            self._$viewDiv.dialog({
                autoOpen: false,
                show: self.options.dialogShowEffect,
                hide: self.options.dialogHideEffect,
                minWidth:350,
				height: 'auto',
				width: 350,
                modal: false,
                title: self.options.messages.viewRecord,
                buttons:
                        [{  //cancel button
                            text: self.options.messages.close,
                            click: function () {
                                self._$viewDiv.dialog('close');
                            }
                        }],
                close: function () {
                    var $viewForm = self._$viewDiv.find('form:first');
                    $viewForm.remove();
                }
            }).dialogExtend(this._getFullOptions());
        },				
        /* Creates and prepares error dialog div.
        *************************************************************************/
        _createErrorDialogDiv: function () {
			base._createErrorDialogDiv.apply(this,arguments);
      		this._$errorDialogDiv.dialogExtend(this._getFullOptions());			
        },
        _createAddRecordDialogDiv: function () {
			base._createAddRecordDialogDiv.apply(this,arguments);
			this._$addRecordDiv.dialog({
                width: 'auto',
                minWidth:350,
				height: 'auto',
				width: 350,
                modal: false
				});			
            this._$addRecordDiv.dialogExtend(this._getFullOptions());
        },		
        _createEditDialogDiv: function () {
			base._createEditDialogDiv.apply(this,arguments);
			this._$editDiv.dialog({
                width: 'auto',
                minWidth:350,
				height: 'auto',
				width: 350,
                modal: false
				});
            this._$editDiv.dialogExtend(this._getFullOptions());
        }				
	});
	
})(jQuery);
