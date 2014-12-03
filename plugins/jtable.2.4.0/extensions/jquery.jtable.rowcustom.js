/** JTABLE rowcustom extension 
 by : nubuntu
**/

(function ($) {
    $.extend(true, $.hik.jtable.prototype, {
		/** Overrides Method
		*****************************/
        /* Gets text for a field of a record according to it's type.
        *************************************************************************/
		_createCellForRecordField: function (record, fieldName) {
            var field = this.options.fields[fieldName];
            var fieldValue = record[fieldName];

			if(field.type=="link"){
            	return $('<td></td>')
                .addClass(this.options.fields[fieldName].listClass)
                .append((this._getDisplayLink(record, fieldName)));
			}else if(this.options.editinline.enable){
            	return $('<td></td>')
                .addClass(this.options.fields[fieldName].listClass)
                .append((this._getDisplayTextEditInline(record, fieldName)));
			}else{
			     return $('<td></td>')
                .addClass(this.options.fields[fieldName].listClass)
                .append((this._getDisplayTextForRecordField(record, fieldName)));

			}
        },
        /* Updates cells of a table row's text values from row's record values.
        *************************************************************************/
        _updateRowTexts: function ($tableRow) {
            var record = $tableRow.data('record');
            var $columns = $tableRow.find('td');
            for (var i = 0; i < this._columnList.length; i++) {
				var fieldName =this._columnList[i];
				var field = this.options.fields[fieldName];
				if(field.type=="link"){
            		var displayItem= this._getDisplayLink(record, fieldName);
				}else if(this.options.editinline.enable){
            		var displayItem= this._getDisplayTextEditInline(record, fieldName);
				}else{
				     var displayItem= this._getDisplayTextForRecordField(record, fieldName);
				}
                if ((displayItem != "") && (displayItem == 0)) displayItem = "0";
                $columns.eq(this._firstDataColumnOffset + i).html(displayItem || '');
            }

            this._onRowUpdated($tableRow);
        },
		_popUp:function(el){
			var $dialog = $('<div></div>').css('overflow', 'hidden')
               .html('<iframe style="border: 0px; " src="' + el.attr("href") + '" width="100%" height="100%"></iframe>')
               .dialog({
                   autoOpen: false,
                   height: 400,
                   width: 800,
                   title: el.attr("alt")
               });
			   var option = this._getFullOptions($dialog,true);
      		$dialog.dialogExtend(option);
 
			$dialog.dialog('open');		
		},
		_getDisplayLink:function(record,fieldName){
	            var self = this;
				var field = this.options.fields[fieldName];
    	        var fieldValue = record[fieldName];
				var contents=field.content;
				
				var $div=$('<div/>').addClass("divLink").css("display","inline-block");
				for(var i=0;i<contents.length;i++){
					
					var links = contents[i];
					if(links.popup){
	        		var $txt = $('<a class="popupwindow" href="' + links.display({record:record}) + '" title="' + links.alt + '" alt="' + links.alt + '">' + links.title + '</a>');
					$txt.popupwindow({});
					}else{
	        		var $txt = $('<a href="' + links.display({record:record}) + '" title="' + links.alt + '" alt="' + links.alt + '">' + links.title + '</a>');
					$txt.click(function () {
						self._popUp($(this));
						return false;
					});
					}
					var $td = $("<div/>").css({"display":"table-cell","padding-left":"5px","padding-right":"5px"}).append($txt);
					if(links.icon){
						var param = links.icon.split(">");
						var $button = $("<button title='" + links.title + "' type='button' class='" + param[0] +"'>\
						<i class='" + param[1] +"'></i></button>").click(function(){
							$txt.click();
						});
						$td.append($button);
						$txt.hide();
					}
					$div.append($td);				
				}
										
				return $div;	

		}
	});
	
})(jQuery);
