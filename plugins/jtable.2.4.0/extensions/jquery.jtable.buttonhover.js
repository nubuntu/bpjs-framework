/** JTABLE Command Button Left extension 
  by: nubuntu
**/
(function ($) {
  var base={
		_createRowFromRecord:$.hik.jtable.prototype._createRowFromRecord,
		_createTable:$.hik.jtable.prototype._createTable
	}
    $.extend(true, $.hik.jtable.prototype, {
		options: {
			buttonhover:false
		},
        /* Creates a row from given record
        *************************************************************************/
        _createRowFromRecord: function (record) {
			var self = this;
            var $tr = $('<tr></tr>')
                .addClass('jtable-data-row')
                .attr('data-record-key', this._getKeyValueOfRecord(record))
                .data('record', record)
            this._addCellsToRowUsingRecord($tr);
			if(this.options.buttonhover){
				$tr.mouseover(function(){
				        var bottomWidth = $(this).css('width');
        				var bottomHeight = $(this).css('height');
        				var rowPos = $(this).position();
        				var bottomTop =  rowPos.top;
        				var bottomLeft = rowPos.left;
						var posRight = ($(window).width() - ($(window).left + $(window).outerWidth()));
						var $div = self._$table.find('.buttonoverlay')
						.empty()
						.css({
            				'top': bottomTop,
            				'right':posRight,
            				'width': '10%',
            				'height': bottomHeight
						});
						$(this).find('.jtable-command-button').each(function(key,val){
								$(this).clone().appendTo($div);											 
						});
						$div.show();
				});
			}
            return $tr;
        },
        _createTable: function () {
            base._createTable.apply(this,arguments);
			if(this.options.buttonhover){
				this._$mainContainer.css({'overflow':'auto'});
				this._createButtonHover();
			}
        },
		_createButtonHover:function(){
				var $div = $('<div />')
				.addClass('buttonoverlay')
				.css({
					 'display':'none',
					 'background-color':'Silver',
					 'position':'absolute',
					 'z-index':10000
				})
				.mouseleave(function() {
						$(this).slideUp();
    			})
				.appendTo(this._$table);
		}
	});
	
})(jQuery);