/* 


*/

/************************************************************************
* CORE jFORM                                                    *
*************************************************************************/
(function ($) {

    $.widget("nubuntu.jform", {

        /************************************************************************
        * DEFAULT OPTIONS / EVENTS                                              *
        *************************************************************************/
        options: {

            //Options
            actions: {},
            fields: {},
			width:"100%",
			inputWidth:"50%",
			columns:1,
			display:"create",
            animationsEnabled: true,
            defaultDateFormat: 'yy-mm-dd',
			showTitle:true,
			showSubmit:true,

            formCreated: function (event, data) { },
            formSubmitting: function (event, data) { },
            formClosed: function (event, data) { },

            messages: {
				required:'This Field Is Required',
				success_create:'Berhasil Diupdate',
				success_update:'Berhasil Disimpan',
				error_validate:'Please Fill all fields'
            }
        },

        /************************************************************************
        * PRIVATE FIELDS                                                        *
        *************************************************************************/

        _$mainContainer: null, 
        _$form: null, 
		_$titleDiv: null,
		_$divSubmit: null, 
		_$title:null,
		_$divColumns:null,
		_$hiddenFields:[],
		_valid:{},
		_$submit:function(){
			
		},

        /************************************************************************
        * CONSTRUCTOR AND INITIALIZATION METHODS                                *
        *************************************************************************/

        /* Contructor.
        *************************************************************************/
        _create: function () {
            //Creating DOM elements
			this._initFields();
            this._createMainContainer();
			this._createForm();
			this._createFormTitle();
			this._createColumns();
			this._createElements();
			this._createSubmit();
			this._triggerAction();
        },

        /* Creates the main container div.
        *************************************************************************/
        _createMainContainer: function () {
            this._$mainContainer = $('<div />').width(this.options.width)
                .addClass('jform-main-container')
                .appendTo(this.element);
        },

        _createFormTitle: function () {
            var self = this;

            if (!self.options.title) {
                return;
            }
			
            var $titleDiv = $('<div />')
                .addClass('title')
				 .appendTo(self._$form);
			self._$title = $('<h2/>').append(self.options.title).appendTo($titleDiv);	 
            self._$titleDiv = $titleDiv;
        },

        _createForm: function () {
            this._$form = $('<form></form>')
                .addClass('jform')
                .appendTo(this._$mainContainer);

        },
		_createColumns:function(){
			var self=this;
			var col = self.options.columns;
			self._$divColumns = $('<div/>').addClass('jform-column')
								.addClass("jform-column-" + col)
								.appendTo(self._$form);
		},
		_initFields:function(){
			var self=this;
			$.each(self.options.fields, function (fieldName, props) {
				var field = self.options.fields[fieldName];
				field.title = props.title ? props.title : fieldName;
				field.width = props.width ? props.width : 'large';
				field.icon = props.icon ? props.icon : props.type;
				self.options.fields[fieldName]=field;
			});
		},
		_createElements:function(){
			var self=this;
			$.each(self.options.fields, function (fieldName, props) {
				if(props.list==false){
					self._createInputHidden(fieldName,props);
					return true;
				}
				self._$divColumns.append(self._createElement(fieldName,props));
			});
			
		},
		_createElement:function(fieldName,props){
			var self=this;
			var $elementDiv= self._createElementIcon(props);
			if(props.type=="group"){
				return self._createInputGroup($elementDiv,fieldName,props);
			}
			$elementDiv.append(self._createLabel(fieldName,props))
						.append(self._createInput(fieldName,props));
			return $elementDiv;	
		},
		_createElementIcon:function(props){
			var icon = props.icon;
			if(props.icon=="text"){
				icon = "input";
			}
			var $div=  $('<div/>').addClass('element-' + icon);
			if(props.type!="checkbox"){
				$div.addClass('jform-column-avoid');
			}
			return $div;
			
		},
		_createLabel:function(fieldName,props){
			if(props.type=="separator"){
				return $("<h3 class='section-break-title'>" + props.title + "</h3><hr class='separator'/>")
			}else if(props.type=="checkbox"){
				return;
			}else{
				return $("<label/>").attr("for","jform-"+ fieldName).addClass("title").append(props.title);
			}
		},
		_createInput:function(fieldName,props){
			var self=this;
			var $input=null;
			var $div = $('<div/>').addClass('item-cont jform-input').append(self._createIcon(fieldName,props));
			switch(props.type){
				case "textarea":
					$input=this._createInputTextArea(fieldName,props);
				break;
				case "date":
					$input=this._createInputDate(fieldName,props);
				break;
				case "separator":
					return;
				break;
				case "checkbox":
					return this._createInputCheckbox(fieldName,props);
				break;
				case "select":
					$input = this._createInputSelect(fieldName,props);
				break;
				default:
					$input=this._createInputText(fieldName,props);
				break
				
			}
			$input.click(function(){
				$(this).select();
			});
			if(props.key){
				$input.attr("id","pkey");
			}
			$div.prepend($input);			
			return $div;
		},
		_createInputText:function(fieldName,field){
			var $input = $('<input type="text" name="jform-'+ fieldName + '" id="jform-'+ fieldName + '">');
			$input = this._setWidth($input,field);
			$input = this._addProp($input,field);
			if(field.suggest){
				$input = this._bindSuggest($input,fieldName,field);
			}
			return $input;
		},
		_createInputCheckbox:function(fieldName,field){
			var $input = $('<div class="column column1"><label><input type="checkbox" name="jform-' + fieldName + '" id="jform-'+ fieldName + '" value="0"><span>'+field.title+'</span></label></div>');
			//$input = this._addProp($input,field);
			$("input[type=checkbox]",$input).change(function(){
				if($(this).prop("checked")==true){
					$(this).val(1);
				}else{
					$(this).val(0);
				}
			});
			return $input;
		},
		_createInputSelect:function(fieldName,field){
			var self=this;
			var $input = $('<div/>');
			var $span = $('<span/>');
			$input = this._setWidth($input,field);
			$input = this._addProp($input,field);
			var $select = $('<select/>').attr("name","jform-" + fieldName).attr("id","jform-"+ fieldName);
			var options =[];
			if(field.source){
			if(field.source=="url"){
				$.ajax({
		        	url:field.options,
		         	async:false,
        		 	success: function(data) {
						options=eval("("+data+")");			
                  	}
    			});
			}else{
				$.ajax({
		        	url:self.options.actions.autoselectAction,
					data:{field:fieldName},
					dataType:'json',
		         	async:false,
        		 	success: function(json) {
						options=json.data;			
                  	}
    			});			
			}
			}else{
				$.each(field.options,function(key,val){
					var option={};
					option.value = key;
					option.text = val; 
					options.push(option);
				});
				
			}
			$select.append($('<option>', { value :"" }).text("")); 
			$.each(options, function(key, value) {   
     			$select.append($('<option>', { value : value.value }).text(value.text)); 
			});
			$span.append($select)
					.append('<i></i><span class="icon-place"></span>')
					.appendTo($input);
			return $input;
		},		
		_createInputGroup:function($div,fieldName,field){
			var self=this;
			$div.removeClass("element-group").addClass("element-name");
			var childcount = Object.keys(field.child).length;
			var width = 100/childcount;
			var $label = self._createLabel(fieldName,field).css("text-align","center");
			$div.append($label);
			$.each(field.child,function(key,value){
				var $span = $('<span/>').addClass("nameLast").width(width + "%")
							.append(self._createLabel(key,value));
				var $input = self._createInputText(key,value);			
				$input = self._addProp($input,field);
				$span.append($input).appendTo($div);				
				
			});
			return $div;
		},
		_createInputDate:function(fieldName,field){
			var dateFormat = field.displayFormat ? field.displayFormat : this.options.defaultDateFormat; 
			var $input = $('<input type="text" name="jform-'+ fieldName + '" id="jform-'+ fieldName + '">');
			$input.datepicker({
				changeMonth: true,
				changeYear: true,
				dateFormat:"yy-mm-dd"
			}); 
			$input = this._setWidth($input,field);
			$input = this._addProp($input,field);
			return $input;   
		},
		_createInputTextArea:function(fieldName,field){
			$input = $('<textarea name="jform-'+ fieldName + '" id="jform-'+ fieldName + '"/>');
			$input = this._setWidth($input,field);
			$input = this._addProp($input,field);
			return $input;
		},
		_createInputHidden:function(fieldName,field){
			var $input = $('<input type="hidden" name="jform-'+ fieldName + '" id="jform-'+ fieldName + '">');
			if(field.key){
				$input.attr("id","pkey");
			}

			this._$hiddenFields.push($input);
		},
		_createIcon:function(fieldName,props){
			return $('<span class="icon-place"></span>');		
		},
		_createHidden:function(){
			var self=this;
			var $hidden = self._$hiddenFields;
			if($hidden.length>=1){
				for(var i=0;i<$hidden.length;i++){
					self._$submit.before($hidden[i]);
				}
			}
		},
		_createSubmit:function(){
			var self=this;
			self._$submit=$('<input type="submit" value="Submit">');
			self._$divSubmit = $('<div/>').addClass("submit").append(self._$submit);
			self._$form.append(self._$divSubmit);
			self._createHidden();
		},
		_setWidth:function($input,field){
			if(field.width=="small" || field.width=="medium" || field.width=="large"){
				$input.addClass(field.width);
			}else{
				$input.css("width",field.width);
			}
			return $input;
		},
		_addProp:function($input,field){
			$input.prop("readonly",field.readonly)
				  .prop("disabled",field.disabled)
  				  .prop("required",field.required);
			return $input; 									
		},
		_bindSuggest:function($input,fieldName,field){
			var self=this;
			var props = field;
			this._$hiddenFields.push($('<input type="hidden" name="jform-'+ fieldName + '-id"/>'));
			$input.dblclick(function(){
				var $inputid=$("input[name=" + $input.attr('name') + "-id]");
				
				if($inputid.val().trim()==$(this).val().trim()){
					if($(this).val().trim().length>=1){
							$.ajax({
		         				url:self.options.actions.autosuggestAction,
		         				data:{field: fieldName,keyword:$input.val(),single:true },
								async:false,
        		 				success: function(response) {
									var json=$.parseJSON(response);
									var $inputid=$("input[name=" + $input.attr('name') + "-id]");
									$inputid.val( json.id );
									$input.val(json.value);
									if(props.suggest.added){
									$.each(props.suggest.added,function(key,value){
										$("input[name=jform-" + value + "]").val(eval("json." + value));
									});
									}
                  				}
    						});    						
					}
				}
			
			});
			$input.autocomplete({
				minLength: 3,
    			source: function( request, respond ) {
       				$.post(self.options.actions.autosuggestAction, 
					{field: fieldName,keyword:$input.val() },
            		function( response ) {
							json=JSON.parse(response);
                			respond(json);
        			});
    			},
				select: function( event, ui ) {
					var $inputid=$("input[name=" + $input.attr('name') + "-id]");
					$inputid.val( ui.item.id );
					if(props.suggest.added){
					$.each(props.suggest.added,function(key,value){
						$("input[name=jform-" + value + "]").val(eval("ui.item." + value));
					});
					}
				},
    			change: function (event, ui) {
					
					var $inputid=$("input[name=" + $input.attr('name') + "-id]");
					if($inputid.val().trim().length<1){
        			if ( !ui.item){
						/**
						if($input.val().trim().length>=3){
       						$.post(self.options.actions.autosuggestAction, 
								{field: fieldName,keyword:$input.val() },
            					function( response ) {
									var json=$.parseJSON(response);
									json = json[0];
									var $inputid=$("input[name='" + $input.attr('name') + "-id'");
									$inputid.val( json.id );
									$input.val(json.value);
									if(props.suggest.added){
									$.each(props.suggest.added,function(key,value){
										$("input[name='jform-" + value + "'").val(eval("json." + value));
									});
									}
                					
        					});
						}
						**/
					}else{
			       		$input.val("");
						$inputid.val("");
						if(props.suggest.added){
						$.each(props.suggest.added,function(key,value){
							$("input[name=jform-" + value + "]").val("");
						});
						}

				    }
					}
    			}				
			});
			return $input;
		},
		load:function(){
			this._enterNext();
			this._validate();
			console.log(this.options.display);
			if(this.options.display=='edit'){
				this._prepareData();
			}else{
				this._prepareValue();
			}
		},
		_prepareData:function(){
			var self=this;
			$.post(self.options.actions.listAction,function(data){
				var json = $.parseJSON(data);
				
				$.each(json.Records[0],function(fieldName,value){
					self.options.fields[fieldName].value=value;
					if(self.options.fields[fieldName].suggest){
						$("input[name=jform-" + fieldName + "-id]").val(value);
						$("*[name='jform-" + fieldName + "']").val(value).dblclick();
					}else if(self.options.fields[fieldName].type=="checkbox"){
						if(value=="0" || value==0 || value=="" || value==null){
							 $("*[name='jform-" + fieldName + "']").val(value).prop("checked",false).change();
						}else{
							 $("*[name='jform-" + fieldName + "']").val(value).prop("checked",true).change();							
						}
					}else{
						$("*[name='jform-" + fieldName + "']").val(value).change();
					}
					self._prepareEvent(fieldName);
				});				
			});
		},
		_prepareValue:function(){
			var self=this;
				$.each(self.options.fields,function(fieldName,field){
					
					if(field.value){
					var value = field.value;
					if(field.suggest){
						$("input[name=jform-" + fieldName + "-id]").val(value);
						$("*[name='jform-" + fieldName + "']").val(value).dblclick();
					}else if(field.type=="checkbox"){
						if(value=="0" || value==0 || value=="" || value==null){
							 $("*[name='jform-" + fieldName + "']").val(value).prop("checked",false).change();
						}else{
							 $("*[name='jform-" + fieldName + "']").val(value).prop("checked",true).change();							
						}
					}else{
						$("*[name='jform-" + fieldName + "']").val(value).change();
					}
					}
					self._prepareEvent(fieldName);
				});
								
		},
		_prepareEvent:function(fieldName){
			var self=this;
			if(self.options.fields[fieldName].change){
				var basechange = $("*[name='jform-" + fieldName + "']").change;
				$("*[name='jform-" + fieldName + "']").change(function(){
					self.options.fields[fieldName].change(self,$(this));
				});
			}
			
		},
		_enterNext:function(){
	       var _i =0;
		   var self=this;
		   var $form=this._$form;
    	   $('input[type=text], textarea, select',$form).each(function(index){
    			_i = index;
				if($(this).prop("readonly")==true || $(this).prop("disabled")==true){
					return;
				}
            	$(this).addClass('tab'+index).keydown(function(event){
                    if(event.keyCode==13){
                        $('.tab'+(index+1)).focus();
                        event.preventDefault();
                    }
                });
		   });
        },		
		
		_validate:function(){
			var self=this;
		   var $form=this._$form;
    	   $('input[type=text], textarea, select',$form).each(function(index){
    			if($(this).prop("required")){
				$(this).blur(function(){
					var $div = $(this).closest('.item-cont');
					if($(this).val()=="" || $(this).val().trim().length<1){
						$div.addClass("error-field");
						$(this).addClass("error-label");
						$(this).attr("placeholder",self.options.messages.required);
						eval("self._valid." + $(this).attr("name").replace("jform-","") +"=false");
					}else{	
						$div.removeClass("error-field");
						$(this).removeClass("error-label");
						$div.remove('label.error');
						eval("self._valid." + $(this).attr("name").replace("jform-","") +"=true");
					}
				});
				$(this).change(function(){
					$(this).blur();
				});
			}
		   });
			$form.submit(function(e){
				e.preventDefault();
					$form.find("*[required]").each(function(index, element) {
    					$(this).change();
                    });
					if(Object.keys(self._valid).length>=1){
						$.each(self._valid,function(key,val){
							if(val!=true){
								alert(self.options.messages.error_validate);
								return false;
							}
						});
					}
					$pkey = $("#pkey").val().trim();
					var action = $pkey=="" || $pkey.length<1 ? "create" : "update";
					var success_msg = eval("self.options.messages.success_" + action)
					var data = $form.serializeArray();
					for(var i=0;i < data.length;i++){
						var clearname = data[i].name.replace("jform-","");
						if(self.options.fields[clearname]){
						if(self.options.fields[clearname].suggest){
							data[i].value = $form.find("input[name=" + data[i].name + "-id]").val();	
						}
						data[i].name = data[i].name.replace("jform-","");
						}
						console.log(data[i]);
					}
					$form.find("input:checkbox:not(:checked)").each(function(index, element) {
						var input = {}
						input.name=$(this).attr("name").replace("jform-","");
						input.value=0;
						data[i]=input;
						i++;
                    });
					data = $.param(data);
					$.post(eval("self.options.actions." + action + "Action"),data,
						function(respon){
							var json = $.parseJSON(respon);
							if(json.Result=='OK'){
								var action = self.options.edit ? "update" : "create";
								alert(eval("self.options.messages.success_" + action));
								if(action=="create"){
									var pkey = $("#pkey").attr("name").replace("jform-","");
									var record = json.Record;
									$("#pkey").val(eval("record." + pkey));
								}								
							}else{

							}
						}
					).done(function(){
					});
			});
		   var _getError=function($input){
				$input.attr("placeholder",self.options.messages.required);
		   }
		},
		_triggerAction:function(){
			if(!this.options.showTitle){
				this._$titleDiv.hide();
			}
			if(!this.options.showSubmit){
				this._$divSubmit.hide();
			}
		}
   
    });

}(jQuery));