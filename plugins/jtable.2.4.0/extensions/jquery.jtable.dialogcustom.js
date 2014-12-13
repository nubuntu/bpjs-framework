/** JTABLE dialogcustom extension 
 by : nubuntu
**/

(function ($) {
  var base={
	  	_create:$.hik.jtable.prototype._create,
		_createAddRecordDialogDiv:$.hik.jtable.prototype._createAddRecordDialogDiv,
		_createEditDialogDiv:$.hik.jtable.prototype._createEditDialogDiv,
		_createViewDialogDiv:$.hik.jtable.prototype._createViewDialogDiv,
		_createJFormDialogDiv:$.hik.jtable.prototype._createJFormDialogDiv,
		_createErrorDialogDiv:$.hik.jtable.prototype._createErrorDialogDiv,
		_createInputForRecordField:$.hik.jtable.prototype._createInputForRecordField
	}	
    $.extend(true, $.hik.jtable.prototype, {
        _create: function () {
            base._create.apply(this, arguments);            
            this._createViewDialogDiv();
			this._createJFormDialogDiv();
        },		
		_getFullOptions:function($dlg,newwin,url){
			var self=this;
			newwin = typeof newwin !== 'undefined' ? newwin : false;
			$dlg = typeof $dlg !== 'undefined' ? $dlg : false;

			if(newwin){
			   var newBtn = $('<div class="ui-dialog-titlebar-buttonpane" style="position: absolute; top: 50%; right: 8em; margin-top: -10px; height: 18px;"><a class="ui-dialog-titlebar-newwin ui-corner-all ui-state-default" href="#" role="button" title="New Window"><span class="ui-icon ui-icon-newwin">newwindow</span></a></div>'
			   );
			   newBtn.click(function(){
				  	var link = url===undefined?$dlg.find('iframe').attr("src"):url;
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
        /* Creates an input element according to field type.
        *************************************************************************/
        _createInputForRecordField: function (funcParams) {
            var fieldName = funcParams.fieldName,
                value = funcParams.value,
                record = funcParams.record,
                formType = funcParams.formType,
                form = funcParams.form;

            //Get the field
            var field = this.options.fields[fieldName];

            //If value if not supplied, use defaultValue of the field
            if (value == undefined || value == null) {
                value = field.defaultValue;
            }

            //Use custom function if supplied
            if (field.input) {
                var $input = $(field.input({
                    value: value,
                    record: record,
                    formType: formType,
                    form: form
                }));

                //Add id attribute if does not exists
                if (!$input.attr('id')) {
                    $input.attr('id', 'Edit-' + fieldName);
                }
				
                //Wrap input element with div
                return $('<div />')
                    .addClass('jtable-input jtable-custom-input')
                    .append($input);
            }

            //Create input according to field type
		
            if (field.type == 'date') {
                return this._createDateInputForField(field, fieldName, value);
            } else if (field.type == 'textarea') {
                return this._createTextAreaForField(field, fieldName, value);
            } else if (field.type == 'password') {
                return this._createPasswordInputForField(field, fieldName, value);
            } else if (field.type == 'checkbox') {
                return this._createCheckboxForField(field, fieldName, value);
            } else if (field.options) {
                if (field.type == 'radiobutton') {
                    return this._createRadioButtonListForField(field, fieldName, value, record, formType);
                } else {
                    return this._createDropDownListForField(field, fieldName, value, record, formType, form);
                }
            } else {
                return this._createTextInputForField(field, fieldName, value);
            }
        },
        /* Creates a standart textbox for a field.
        *************************************************************************/
        _createTextInputForField: function (field, fieldName, value) {
            var $input = $('<input class="' + field.inputClass + '" id="Edit-' + fieldName + '" type="text" name="' + fieldName + '"></input>');
            if (value != undefined) {
                $input.val(value);
            }
            
            return $('<div />')
                .addClass('jtable-input jtable-text-input')
                .append($input);
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
				height: 585,
				width: 525,
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
        _createJFormDialogDiv: function () {
            var self = this;

            //Create a div for dialog and add to container element
            self._$jformDiv = $('<div id="jform-data"></div>')
                .appendTo(self._$mainContainer);

            //Prepare dialog
            self._$jformDiv.dialog({
                autoOpen: false,
                show: self.options.dialogShowEffect,
                hide: self.options.dialogHideEffect,
                minWidth:350,
				height: 'auto',
				width: 'auto',
                modal: false,
                title: "",
                close: function () {
                    var $jForm = self._$jformDiv.find('.jform-main-container');
                    $jForm.remove();
					$(this).dialog('destroy');                   
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
				height: 585,
				width: 525,
                modal: false
				});			
            this._$addRecordDiv.dialogExtend(this._getFullOptions());
        },		
        _createEditDialogDiv: function () {
			base._createEditDialogDiv.apply(this,arguments);
			this._$editDiv.dialog({
                width: 'auto',
                minWidth:350,
				height: 585,
				width:525,
                modal: false
				});
            this._$editDiv.dialogExtend(this._getFullOptions());
        }				
	});
	
})(jQuery);
