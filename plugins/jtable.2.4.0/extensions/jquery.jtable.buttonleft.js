/** JTABLE Command Button Left extension 
  by: nubuntu
**/
(function ($) {
  var base={
	  	_create:$.hik.jtable.prototype._create,
		_addCellsToRowUsingRecord:$.hik.jtable.prototype._addCellsToRowUsingRecord,
		_addColumnsToHeaderRow:$.hik.jtable.prototype._addColumnsToHeaderRow,
		_updateRowTexts:$.hik.jtable.prototype._updateRowTexts,
		_toolbarsearch_addColumnsToHeaderRow:$.hik.jtable.prototype._toolbarsearch_addColumnsToHeaderRow,
		_createDateInputForField:$.hik.jtable.prototype._createDateInputForField,
		_createTextAreaForField:$.hik.jtable.prototype._createTextAreaForField,
		_createTextInputForField:$.hik.jtable.prototype._createTextInputForField,
		_createPasswordInputForField:$.hik.jtable.prototype._createPasswordInputForField	
	}
    $.extend(true, $.hik.jtable.prototype, {
		options: {
			buttonleft:true,
			messages:{
				viewRecord:"Detail",
				viewText:"View",
				close:"Close"
			}
		},
        /* Overrides base method to do editing-specific constructions.
        *************************************************************************/
        _create: function () {
            base._create.apply(this, arguments);            
        },
        /* Creates a date input for a field.
        *************************************************************************/
        _createDateInputForField: function (field, fieldName, value) {
            var $input = $('<input class="' + field.inputClass + '" id="Edit-' + fieldName + '" type="text" name="' + fieldName + '"></input>');
			$input.addClass("text ui-widget-content ui-corner-all");
            if(value != undefined) {
                $input.val(value);
            }
            
            var displayFormat = field.displayFormat || this.options.defaultDateFormat;
            $input.datepicker({ dateFormat: displayFormat });
            return $('<div />')
                .addClass('jtable-input jtable-date-input')
                .append($input);
        },

        /* Creates a textarea element for a field.
        *************************************************************************/
        _createTextAreaForField: function (field, fieldName, value) {
            var $textArea = $('<textarea class="' + field.inputClass + '" id="Edit-' + fieldName + '" name="' + fieldName + '"></textarea>');
			$textArea.addClass("text ui-widget-content ui-corner-all");
            if (value != undefined) {
                $textArea.val(value);
            }
            
            return $('<div />')
                .addClass('jtable-input jtable-textarea-input')
                .append($textArea);
        },

        /* Creates a standart textbox for a field.
        *************************************************************************/
        _createTextInputForField: function (field, fieldName, value) {
            var $input = $('<input class="' + field.inputClass + '" id="Edit-' + fieldName + '" type="text" name="' + fieldName + '"></input>');
			$input.addClass("text ui-widget-content ui-corner-all");
            if (value != undefined) {
                $input.val(value);
            }
            
            return $('<div />')
                .addClass('jtable-input jtable-text-input')
                .append($input);
        },

        /* Creates a password input for a field.
        *************************************************************************/
        _createPasswordInputForField: function (field, fieldName, value) {
            var $input = $('<input class="' + field.inputClass + '" id="Edit-' + fieldName + '" type="password" name="' + fieldName + '"></input>');
			$input.addClass("text ui-widget-content ui-corner-all");
            if (value != undefined) {
                $input.val(value);
            }
            
            return $('<div />')
                .addClass('jtable-input jtable-password-input')
                .append($input);
        },

		
        /* Adds column header cells to given tr element.
        *************************************************************************/
        _addColumnsToHeaderRow: function ($tr) {
			base._addColumnsToHeaderRow.apply(this,arguments);
			if(this.options.buttonleft){
			$tr.children(".jtable-command-column-header").each(function(){
				$tr.prepend(this);
				$(this).remove;
			});
			$tr.prepend(this._createEmptyCommandHeader());
			}
		},
        _toolbarsearch_addColumnsToHeaderRow: function ($tr) {
			base._toolbarsearch_addColumnsToHeaderRow.apply(this,arguments);
			if(this.options.buttonleft){
			$tr.children(".jtable-toolbarsearch-reset").each(function(){
				$tr.prepend(this);
				$(this).remove;
			});
			}
		},
        _showViewForm: function ($tableRow) {
            var self = this;
            var record = $tableRow.data('record');

            //Create edit form
            var $editForm = $('<form id="jtable-edit-form" class="jtable-dialog-form jtable-edit-form"></form>');

            //Create input fields
            for (var i = 0; i < self._fieldList.length; i++) {

                var fieldName = self._fieldList[i];
                var field = self.options.fields[fieldName];
                var fieldValue = record[fieldName];

                if (field.key == true) {
                    if (field.edit != true) {
                        //Create hidden field for key
                        $editForm.append(self._createInputForHidden(fieldName, fieldValue));
                        continue;
                    } else {
                        //Create a special hidden field for key (since key is be editable)
                        $editForm.append(self._createInputForHidden('jtRecordKey', fieldValue));
                    }
                }

                //Do not create element for non-editable fields
                if (field.edit == false) {
                    continue;
                }

                //Hidden field
                if (field.type == 'hidden') {
                    $editForm.append(self._createInputForHidden(fieldName, fieldValue));
                    continue;
                }

                //Create a container div for this input field and add to form
                var $fieldContainer = $('<div class="jtable-input-field-container"></div>').appendTo($editForm);

                //Create a label for input
                $fieldContainer.append(self._createInputLabelForRecordField(fieldName));

                //Create input element with it's current value
                var currentValue = self._getValueForRecordField(record, fieldName);
                $fieldContainer.append(
                    self._createInputForRecordField({
                        fieldName: fieldName,
                        value: currentValue,
                        record: record,
                        formType: 'edit',
                        form: $editForm
                    }));
            }
            
            self._makeCascadeDropDowns($editForm, record, 'edit');

            $editForm.submit(function () {
                self._onSaveClickedOnEditForm();
                return false;
            });

            //Open dialog
            self._$editingRow = $tableRow;
            self._$viewDiv.append($editForm).dialog('open');
        },			
		/** Overrides Method
		*****************************/
		_addCellsToRowUsingRecord: function ($row) {
			base._addCellsToRowUsingRecord.apply(this,arguments);
			var self = this;
			if(this.options.buttonleft){
				
				var $span = $('<span></span>').html(self.options.messages.viewText);
                var $button = $('<button title="' + self.options.messages.viewText + '" type="button" class="btn btn-primary btn-circle"><i class="fa fa-info"></i></button>')
                    
                    
                    .click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        self._showViewForm($row);
                    });
                $('<td></td>')
                    .addClass('jtable-command-column')
                    .append($button)
                    .prependTo($row);         			
			$row.children(".jtable-command-column").each(function(){
				$row.prepend(this);
				$(this).remove;
			});
			

			}
		},
        _updateRowTexts: function ($tableRow) {
			base._updateRowTexts.apply(this,arguments);	
			if(this.options.buttonleft){
			var $row = $tableRow;
			var self = this;
			$row.find(".jtable-command-column").each(function(){
				//console.log($(this).html());
				$(this).removeAttr('class');
				$row.find('td:last').remove();
			});
				var $span = $('<span></span>').html(self.options.messages.viewText);
                var $button = $('<button title="' + self.options.messages.viewText + '" type="button" class="btn btn-primary btn-circle"><i class="fa fa-info"></i></button>')
                    
                    
                    .click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        self._showViewForm($row);
                    });
                $('<td></td>')
                    .addClass('jtable-command-column')
                    .append($button)
                    .prependTo($row);  
            if (self.options.actions.updateAction != undefined) {
                var $span = $('<span></span>').html(self.options.messages.editRecord);
                var $button = $('<button title="' + self.options.messages.editRecord + '"></button>')
                    .addClass('jtable-command-button jtable-edit-command-button')
                    .append($span)
                    .click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        self._showEditForm($row);
                    });
                $('<td></td>')
                    .addClass('jtable-command-column')
                    .append($button)
                    .prependTo($row);
            }
            if (self.options.actions.deleteAction != undefined) {
                var $span = $('<span></span>').html(self.options.messages.deleteText);
                var $button = $('<button title="' + self.options.messages.deleteText + '"></button>')
                    .addClass('jtable-command-button jtable-delete-command-button')
                    .append($span)
                    .click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        self._deleteButtonClickedForRow($row);
                    });
                $('<td></td>')
                    .addClass('jtable-command-column')
                    .append($button)
                    .prependTo($row);
            }
			}
		}		
	});
	
})(jQuery);