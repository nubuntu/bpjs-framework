<?php
namespace NC\system;
class Form{
	var $id=null;
	var $div;
	var $url;
	var $action;
	var $db;
	var $jform;
	var $table;
	var $title;
	var $toolbar=array();
	var $clicktoolbar=array();
	var $fields;
	var $opt;
	var $combo;
	var $options;
	var $qdata;
	var $custom;
	var $func=array();
	var $exc=array();
	var $details;
	var $childkey;
	var $isdetail;
	var $editable=true;
	var $selects;
	var $toolbarsearch=false;		
	var $toolbarleft=false;		
	var $editinline=array();
	var $maxtext = 0;
	var $titletext="ucfirst";
	var $showkey = true;
	var $defaultWidth = "large";
	var $DateFormat="yy-mm-dd";
	var $isquery=false;
	var $query;
	var $where=false;
	var $joinedTable=array();
	var $suggest=array();
	var $formCreated="function(event,data){data.form.enterNext()}";
	var $formSubmitting="function(event,data){}";
	var $formClosed="function(event,data){}";
	public $base;
	function &getObj(){
		static $instance;
		if(!$instance):
			$instance = new Form();
		endif;
		return $instance;			
	}
	function __construct(){
		if(!isset($_SESSION)) {
    		 session_start();
		}	
		//$this->base      = \NC\base::getInstance();
		$this->setUrl($_SERVER['REQUEST_URI']);
		$this->setDiv("jform-data-".$this->randString());
		$this->editinline = array("enable"=>false,"img"=>"");
		$this->isdetail=false;
		
		//$this->db = $this->base->db;
		
		
	}
	function randString($length = 10) {
		$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		$charactersLength = strlen($characters);
		$randomString = '';
		for ($i = 0; $i < $length; $i++) {
			$randomString .= $characters[rand(0, $charactersLength - 1)];
		}
		return $randomString;
	}	
	function setUrl($url){
		$this->url=$url;
		$mark =strpos($url,"?") ? "&" : "?";
		$action = $url. $mark."jform-action=data";
		$create = $url. $mark."jform-action=create";
		$update = $url. $mark."jform-action=update";
		$delete = $url. $mark."jform-action=delete";
		$ac = $url. $mark."jform-action=autocomplete";
		$as = $url. $mark."jform-action=autosuggest";
		$this->action['listAction'] = $action;
		$this->action['createAction'] = $create;
		$this->action['updateAction']=$update;
		$this->action['deleteAction']=$delete;
		$this->action['autocompleteAction']=$ac;		
		$this->action['autosuggestAction']=$as;		
	}
	function setManual($url){
		$mark =strpos($url,"?") ? "&" : "?";
		$action = $url. $mark."action=dataquery";
		$create = $url. $mark."action=createquery";
		$update = $url. $mark."action=updatequery";
		$delete = $url. $mark."action=deletequery";
		$this->action['listAction'] = $action;
		$this->action['createAction'] = $create;
		$this->action['updateAction']=$update;
		$this->action['deleteAction']=$delete;		
	}
	function disable(){
   		$numargs = func_num_args();
	    $arg_list = func_get_args();
    	for ($i = 0; $i < $numargs; $i++) {
			$m = ($arg_list[$i]);
			if($m=="view"){
				$this->jform['view']=false;
			}
			unset($this->action[$m.'Action']);
    	}	
		
	}
	function listOnly(){
		$this->disable("create","update","delete");
	}
	function setDiv($div){
		$this->div = $div;
	}
	function setQuery($db,$q,$key='id',$detail=false){
		$this->setManual($_SERVER['REQUEST_URI']);
		$this->jform['defaultSorting'] ="$key DESC";
		$this->query=$q;
		$this->isquery=true;
		$this->db = $db;
		$this->db->setTable($q,$key,true);
		$this->getFields();
	}	
	function setTable($db,$t,$key='id',$detail=false){
		$this->jform['defaultSorting'] ="$key DESC";
		if($detail):
			$this->isdetail=true;
			$this->action['updateAction'] = $this->action['updateAction']."&detail=null";
		endif;
		$this->db = $db;
		$this->table = $t;
		$this->db->setTable($t,$key);
		$this->getFields();
	}
	function setTitle($title){
		$this->jform['title'] = $title;
		$this->jform['paging'] = true;
		$this->jform['pageSize'] = 10;
		$this->jform['sorting'] = true;
		$this->jform['width'] ='100%';
		$this->jform['defaultDateFormat']=$this->DateFormat;
		$this->jform['editinline'] =$this->editinline;
		$this->jform['toolbarsearch'] =$this->toolbarsearch;
		$this->jform['toolbarleft'] =$this->toolbarleft;
		$this->jform['maxtext'] =$this->maxtext;
		$this->jform['view']=true;
		$this->jform['formCreated']=$this->formCreated;
		$this->jform['formSubmitting']=$this->formCreated;
		$this->jform['formClosed']=$this->formClosed;
		$this->jform['messages']['required']="Isian ini tidak boleh kosong...";
		//$this->jform['jqueryuiTheme']=true;
		//$this->jform['ajaxSettings']=array("contentType"=>"application/json; charset=utf-8");		
		if(count($this->base)>=1){
			foreach($this->base as $key => $val){
				 $this->jform[$key] =$val;			
			}
		}		
	}
	function addToolbar(){
		$arg = func_get_args();
		if(count($arg)>=1):
			for($i = 0; $i < count($arg); $i++):
				$click=$arg[$i]['click'];
				unset($arg[$i]['click']);
				$this->toolbar['items'][] = $arg[$i];
				$this->clicktoolbar[]=$click;
			endfor;
		endif;
	}
	function render(){
		$this->jform['actions'] = $this->action;
		if(isset($this->toolbar['items'])){
		if(count($this->toolbar['items'])>=1):
			$this->toolbar['hoverAnimation']= true;
			$this->toolbar['hoverAnimationDuration']=60;
			$this->jform['toolbar'] = $this->toolbar;
		endif;
		}
		$this->jform['fields'] = $this->fields;
		$html = "var obj =".$this->json_encok($this->jform).";";
		//$html.= "$('#".$this->div."').jtable(obj);";
		$p = array('"%%%','%%%"');
		$r = array('','');
		$html = str_replace($p,$r,$html);
		if(count($this->options)>=1):
		$html.= $this->getoption();
		endif;
		if(count($this->clicktoolbar)>=1):
			for($i = 0; $i < count($this->clicktoolbar); $i++):
				$html.= "
				";
				$html.="obj.toolbar.items[$i].click=".$this->clicktoolbar[$i];
			endfor;								
		endif;
		if(count($this->custom)>=1):
			for($i = 0; $i < count($this->custom); $i++):
				$html.= "
				";
				$html.=$this->custom[$i];							
			endfor;
		endif;
		if(count($this->func)>=1):
			foreach($this->func as $key => $val):
				$html.= "
				";
				foreach($val as $k => $v):
					$html.= "
					";
					$html.="obj.fields.$key.$k=$v";
				endforeach;							
			endforeach;
		endif;

		$html.= "
		$('.".$this->div."').jform(obj);";
		if(count($this->opt)>=1):
		$html.="
				 $('#ResetButton').click(function (e) {
		      e.preventDefault();
               $('#q').val('');
        $('#LoadRecordsButton').click();
        });
 $('#LoadRecordsButton').click(function (e) {
            e.preventDefault();
            $('.".$this->div."').jtable('load', {
                q: $('#q').val(),
                opt: $('#opt').val()
            });
        });
 
        //Load all records when page is first shown
        $('#LoadRecordsButton').click();";
		else:
            $html.="
			$('.".$this->div."').jform('load');";		
		endif;
		return $html;
	}
	function gethtml(){
		$html='';
	if(count($this->opt)>=1):
		$html.= '<div class="filtering">
    <form>
        Cari: 
          <input type="text" name="q" id="q" value="'.$_REQUEST['q'].'"/>
        Berdasarkan: 
        <select id="opt" name="opt">';
		$i = 0;
		foreach($this->opt as $key => $val):
			$selected = ($i < 1) ? 'selected="selected" ' : '';	
            $html .='<option '.$selected.'value="'.$key.'">'.$val.'</option>';
		$i++;
		endforeach;
        $html.='</select>
        <button type="submit" id="LoadRecordsButton">Search</button>
        <button type="submit" id="ResetButton">Reset</button>
    </form>
</div>';
	endif;
		$html.='<div class="'.$this->div.'" style="width:100%;"></div>';
		return $html;	
	}
	function getTitle($text){
		switch($this->titletext){
			case 'ucase':
				$text = strtoupper($text);
			case 'lcase':
				$text = strtolower($text);			
			case 'ucfirst':
				$text = ucfirst($text);
			default:
				$text = $text;			
			break;
		}
		return $text;	
	}
	function newField($title,$type="text"){
		$field = array("title"=>$title,"width"=>$this->defaultWidth);
		return $field;		
	}
	function getFields(){
		$this->fields['record_number'] = array(
                    "title"=>'#',
                    "width"=>'small',
					"list"=>false,
                    "edit"=>false,
                    "create"=>false,					
					"sorting"=>false,
					"type"=>"text",
					"searchable"=>false);
		$this->fields[$this->db->primary] = array(
					"title"=>"ID",
					"width"=>'small',
                    "key"=>true,
                    "edit"=>false,
                    "create"=>false,
					"type"=>"text",
                    "list"=>false
                );
		if($this->showkey){			
			$this->fields[$this->db->primary]['list']=true;
		}
		$rows = $this->db->getFields();
		foreach($rows as $key => $val){			
			if($key!=$this->db->primary):
				if(!array_search($key,$this->exc)):
				$vals = explode("(",$val);
				switch($vals[0]):
					case 'date':
						$this->fields[$key] = array("title"=>$this->getTitle($key),"width"=>$this->defaultWidth,"type"=>"date");						
					break;
					case 'text':
						$this->fields[$key] = array("title"=>$this->getTitle($key),"width"=>$this->defaultWidth,"type"=>"textarea");					
					break;
					case 'tinyint':
						$this->fields[$key] = array("title"=>$this->getTitle($key),"width"=>$this->defaultWidth,"type"=>"checkbox",
						"values"=>array(0=>"False",1=>"True"),"defaultValue"=>0);					
					break;
					/**
					case 'int':						
						$this->fields[$key] = array(
							"title"=>$this->getTitle($key),
							"width"=>$this->defaultWidth,
							"type"=>"text",
							"display"=>"function(data){return data.record.$key?data.record.$key.toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.'):data.record.$key;}");					
					break;
					**/
					default:
						$this->fields[$key] = array("title"=>$this->getTitle($key),"width"=>$this->defaultWidth,"type"=>"text");
					break;					
				endswitch;
				if(isset($this->options[$key])):
					$this->fields[$key]['options'] = $this->options[$key];
					unset($this->fields[$key]['display']);
				endif;
				endif;
			endif;
		}
		return $this->fields;		
	}
	function pushFields($rows){
		foreach($rows as $key => $val){
			$val['type']=isset($val['type'])?$val['type']:"text";
			if($key!=$this->db->primary):
				$this->fields[$key] = $val;
			endif;
		}	
	}
	function setOpt($opt){
		$this->opt = $opt;
	}
	function trigger(){
		if(isset($_REQUEST['jform-action'])):
				$action = $_REQUEST['jform-action'];
				if(method_exists($this,$action)):
					$this->$action();
				endif;
		endif;	
	}
	function joinTable($table,$child,$parent,$fields){
		for($i=0;$i<count($fields);$i++){
			$this->fields[$fields[$i]] = array("title"=>$fields[$i],"width"=>$this->defaultWidth,"joined"=>true);
		}
		$this->fields[$parent]['child']=$table;
		$this->joinedTable[$table]=array("parent"=>$parent,"child"=>$child,"fields"=>$fields);
	}
	function autocomplete(){
		$child = isset($_REQUEST['child']) ? $_REQUEST['child']:"";  
		$keyword = isset($_REQUEST['keyword']) ? $_REQUEST['keyword']:"";
	  	$table = $this->joinedTable[$child];
		$q = "select ".implode(",",$table['fields'])." from $child where ".$table['child']."='".$keyword."'";
		$this->db->setQuery($q);
		$row = $this->db->getRow();
		die(json_encode($row));
	}
	function setSuggest($field,$param){
		$this->fields[$field]['suggest']=$param;
		$this->suggest[$field]=$param;
	}
	function autosuggest(){
		$field = isset($_REQUEST['field']) ? $_REQUEST['field']:"";
		$keyword = isset($_REQUEST['keyword']) ? $_REQUEST['keyword']:"";
		$suggest = $this->suggest[$field];
		$added="";
		if(isset($suggest['added'])){
			$added = ",".implode(",",$suggest['added']);
		}
		$q = "select ".$suggest['value']." as id,".$suggest['display']." as value". $added." from ".$suggest['table']." where LOWER(".$suggest['value'].") like '%".strtolower($keyword)."%' or LOWER(".$suggest['display'].") like '%".strtolower($keyword)."%' order by ".$suggest['value']." desc limit 0,10 ";
		$this->db->setQuery($q);
		$rows = $this->db->getRows();
		die(json_encode($rows));		

	}
	function data(){
		if(count($this->joinedTable)>=1):
			$this->dataJoin();
		endif;
		if($this->isquery):
			$this->dataquery();
		endif;	
		if(isset($_REQUEST['detail'])):
			$this->datadetail();
		endif;
		$offset = isset($_REQUEST['jtStartIndex']) ? $_REQUEST['jtStartIndex']:0;  
		$rows = 1;
		$q = isset($_REQUEST['q'])?$_REQUEST['q']:"";
		$sort = isset($_REQUEST['jtSorting']) ? $_REQUEST['jtSorting']:$this->db->primary.' desc';
		$opt = isset($_REQUEST['opt'])?$_REQUEST['opt']:array();
		$options = isset($_REQUEST['options'])?$_REQUEST['options']:array();
		$join = array();
		$where ='';
		if($q){
			for($i = 0; $i < count($opt); $i++):  
				$fld = $opt[$i];
				if(isset($options[$opt[$i]])){
					$option = $options[$opt[$i]];
					$fld="t$i.".$option['field'];
					$join[] = " INNER JOIN ".$option['table']." as t$i on ".$this->table.".".$option['depend']."=t$i.".$option['depends'];
				}
				$where[] = $fld." like '%".$q[$i]."%'";
			endfor;
			$where = $this->where ? " where ".$this->where." And ".implode(" And ",$where) : " where ".implode(" And ",$where);
		}else{
			$where = $this->where ? " where ".$this->where:"";
		}
		$join = count($join)<1?"":implode("",$join);  
		$q = "select count(*) FROM ".$this->table.$join.$where;
		$this->db->setQuery($q);
		$total= $this->db->loadResult();
		$q = "SELECT * FROM ".$this->table.$join.$where." order by ".$sort;  
		$items = $this->db->getList($q,$offset,$rows);	
		$jFormResult = array();
		$jFormResult['Result'] = "OK";
		$jFormResult['Records'] = $items;
		$jFormResult['TotalRecordCount'] = $total;
		die(json_encode($jFormResult));
	}
	function dataJoin(){
		$offset = isset($_REQUEST['jtStartIndex']) ? $_REQUEST['jtStartIndex']:0;  
		$rows = isset($_REQUEST['jtPageSize']) ? $_REQUEST['jtPageSize']:10 ;
		$q = isset($_REQUEST['q'])?$_REQUEST['q']:"";
		$sort = isset($_REQUEST['jtSorting']) ? $_REQUEST['jtSorting']:$this->db->primary.' desc';
		$opt = isset($_REQUEST['opt'])?$_REQUEST['opt']:array();
		$options = isset($_REQUEST['options'])?$_REQUEST['options']:array();
		$join = array();
		$where ='';
		$t=0;
		
		if($q){
			for($i = 0; $i < count($opt); $i++):  
				$fld = $opt[$i];
				if(isset($options[$opt[$i]])){
					$option = $options[$opt[$i]];
					$fld="t$i.".$option['field'];
					$join[] = " INNER JOIN ".$option['table']." as t$i on ".$this->table.".".$option['depend']."=t$i.".$option['depends'];
				}
				$where[] = is_null($this->id)?$fld." like '%".$q[$i]."%'":$fld."='".$q[$i]."'";
			endfor;
			$where = $this->where ? " where ".$this->where." And ".implode(" And ",$where) : " where ".implode(" And ",$where);
		}else{
			$where = $this->where ? " where ".$this->where:"";
		}
		$addedfield=array();
		foreach($this->joinedTable as $key => $val){
			$t++;
			$join[] = " INNER JOIN ".$key." as j$t on ".$this->table.".".$val['parent']."=j$t.".$val['child'];
			$addedfield[]="j$t.".implode(",j$t.",$val['fields']);
		}
		$join = count($join)<1?"":implode("",$join);  
		$q = "select count(*) FROM ".$this->table.$join.$where;
		$this->db->setQuery($q);
		$total= $this->db->loadResult();
		$q = "SELECT ".$this->table.".*,".implode(",",$addedfield)." FROM ".$this->table.$join.$where." order by ".$sort;  
		$items = $this->db->getList($q,$offset,$rows);	
		$jFormResult = array();
		$jFormResult['Result'] = "OK";
		$jFormResult['Records'] = $items;
		$jFormResult['TotalRecordCount'] = $total;
		die(json_encode($jFormResult));
	}
	function datadetail(){
		$detail = isset($_REQUEST['detail'])?$_REQUEST['detail']:"";
		$offset = isset($_REQUEST['jtStartIndex']) ? $_REQUEST['jtStartIndex']:0;  
		$rows = isset($_REQUEST['jtPageSize']) ? $_REQUEST['jtPageSize']:10 ;
		$sort = isset($_REQUEST['jtSorting']) ? $_REQUEST['jtSorting']:$this->db->primary.' desc';
		  
		$q = "select count(*) FROM ".$this->table." where ".$this->childkey." = '$detail'";
		$this->db->setQuery($q);
		$total= $this->db->loadResult();  
		$q = "SELECT * FROM ".$this->table." where ".$this->childkey." = '$detail' order by ".$sort;  
		$items = $this->db->getList($q,$offset,$rows);			
		$jFormResult = array();
		$jFormResult['Result'] = "OK";
		$jFormResult['Records'] = $items;
		$jFormResult['TotalRecordCount'] = $total;
		die(json_encode($jFormResult));
		
	
	}
	function create(){
		$post =  $_REQUEST;
		$jFormResult = array();
		$this->db->bind($post);
		$this->db->store();
		$post[$this->db->primary] = $this->db->lastId();
		$jFormResult['Record'] = $post;
		$jFormResult['Result'] = "OK";
		$log['action'] = "create";
		$log['table'] = $this->db->table;
		$log['key'] = $this->db->primary;
		$log['data'] = $post;
		die(json_encode($jFormResult));						
	}
	function update(){
		$post =  $_REQUEST;
		if($this->editable):
			$this->db->bind($post);
			$this->db->store();
		endif;
		$jFormResult = array();
		$jFormResult['Result'] = "OK";	
		die(json_encode($jFormResult));			
	}
	function delete(){
		$post =  $_REQUEST;
		$this->db->delete($post);
		$jFormResult = array();
		$jFormResult['Result'] = "OK";
		$log['action'] = "delete";
		$log['table'] = $this->db->table;
		$log['key'] = $this->db->primary;
		$log['data'] = $post;	
		die(json_encode($jFormResult));			
	}
	function dataquery(){
		$offset = isset($_REQUEST['jtStartIndex']) ? $_REQUEST['jtStartIndex']:0 ;  
		$rows = isset($_REQUEST['jtPageSize']) ? $_REQUEST['jtPageSize']:10 ;
		$q = isset($_REQUEST['q'])?$_REQUEST['q']:"";
		$sort = isset($_REQUEST['jtSorting']) ? $_REQUEST['jtSorting']:$this->db->primary.' desc';
		
		//echo $sort;
		$opt = isset($_REQUEST['opt'])?$_REQUEST['opt']:array();
		$where ='';
		if($q):
			if(!is_array($q)):
				$where = " where `$opt` like '%$q%'";
			else:
				for($i = 0; $i < count($opt); $i++):  
					$where[] = "`".$opt[$i]."` like '%".$q[$i]."%'";
				endfor;
				$where = " where ".implode(" And ",$where);  
			endif;
		endif;
		
		$qry = explode("from",strtolower($this->query));
		$q = "select count(*) FROM ".$qry[1].$where;
		$this->db->setQuery($q);
		$total= $this->db->loadResult();  
		$q = $this->query.$where." order by ".$sort;  
		$items = $this->db->getList($q,$offset,$rows);			
		$jFormResult = array();
		$jFormResult['Result'] = "OK";
		$jFormResult['Records'] = $items;
		$jFormResult['TotalRecordCount'] = $total;
		die(json_encode($jFormResult));
	}
	function cmb(){
		$combo = $_REQUEST['combo'];
		$this->db->setQuery($this->combo[$combo]);
		$rows = $this->db->loadObjectList();
		$jFormResult = array();
		$jFormResult['Result'] = "OK";
		$jFormResult['Options'] = $rows;
		die(json_encode($jFormResult));

	}
	function setCombo($cmb,$q){
		$this->combo[$cmb] = $q;
		$this->option = $cmb;
		$mark =strpos($this->url,"?") ? "&" : "?";
		$this->fields[$cmb]["options"] = "function(data){return '".$this->url.$mark."action=cmb&combo=".$cmb."';}";
	}
	function setComboCustom($custom,$cmb,$q){
		$this->combo[$cmb] = $q;
		$this->option = $cmb;
		$mark =strpos($this->url,"?") ? "&" : "?";
		$this->fields[$custom]["options"] = "function(data){return '".$this->url.$mark."action=cmb&combo=".$cmb."';}";
	}	
	function getoption(){
		foreach($this->options as $key => $val):
			$html="";
			if(!$this->editinline){
			$html= "
				obj.fields.$key.options = $val;
				";				
			}
		endforeach;
	}
	function justInclude(){
   		$numargs = func_num_args();
	    $arg_list = func_get_args();
    	$f = array();
		for ($i = 0; $i < $numargs; $i++) {
			$m = $arg_list[$i];
			$f[$m] = $this->fields[$m];	
    	}
		$this->fields =$f;		
	}
	function hideInList(){
   		$numargs = func_num_args();
	    $arg_list = func_get_args();
    	$f = array();
		for ($i = 0; $i < $numargs; $i++) {
			$m = $arg_list[$i];
			$this->fields[$m]['list']=false;
    	}	
	}
	function hideIn(){
   		$numargs = func_num_args();
	    $arg_list = func_get_args();
    	$f = array();
		$action = $arg_list[0]; 
		for ($i = 1; $i < $numargs; $i++) {
			$m = $arg_list[$i];
			switch($action){
				case 'all':
					$this->fields[$m]['list']=false;
					$this->fields[$m]['create']=false;
					$this->fields[$m]['edit']=false;
				break;	
				case 'list':
					$this->fields[$m]['list']=false;
				break;	
				case 'create':
					$this->fields[$m]['create']=false;
				break;
				case 'edit':
					$this->fields[$m]['edit']=false;
				break;						
			}
    	}	
	}
	function setTH($arr){
    	foreach ($arr as $key => $val) {
			$this->fields[$key]['title'] = $val;
    	}		
	}
	function getTable(){
		return $this->jform;
	}
	function addDetail($tbl,$name,$parent){
			$this->fields[$name]['display'] ='';
			$this->fields[$name]['edit'] =false;
			$this->fields[$name]['create'] =false;
			$this->fields[$name]['width'] ='5%';
			
			$tbl->render();
			$table = $tbl->jtable;
			$table['fields'][$parent] = array("type"=>"hidden","defaultValue"=>"");
			
			$im = "../images/list_metro.png";			
			$func = "function (data) {
                        var \$img = $('<img src=\"$im\" title=\"Lihat/Edit Detail\" />');
                        \$img.click(function () {
var obj$parent = ".$this->json_encok($table).";
							obj$parent.actions.listAction = '".$this->url."?action=data&detail=' + data.record.$parent;
							obj$parent.actions.createAction = '".$this->url."?action=create&detail=' + data.record.$parent;
							obj$parent.actions.updateAction = '".$this->url."?action=update&detail=' + data.record.$parent;
							obj$parent.actions.deleteAction = '".$this->url."?action=delete&detail=' + data.record.$parent;";
											if(count($tbl->func)>=1):
			foreach($tbl->func as $key => $val):
				$func.= "
				";
				foreach($val as $k => $v):
					$func.= "
					";
					$func.="obj$parent.fields.$key.$k=$v;";
				endforeach;							
			endforeach;
		endif;				
							
                        $func .=  "\$('#".$this->div."').jtable('openChildTable',\$img.closest('tr'),obj$parent,
							function (data) { //opened handler
                                    data.childTable.jtable('load');
                                });
													});";

													
				$func.="		return \$img;
					}";
			$this->func[$name]['display'] = $func;							
								 	 
			
			
	}
  function json_encok($a=false)
  {
    if (is_null($a)) return 'null';
    if ($a === false) return 'false';
    if ($a === true) return 'true';
    if (is_scalar($a))
    {
      if (is_float($a))
      {
        // Always use "." for floats.
        return floatval(str_replace(",", ".", strval($a)));
      }

      if (is_string($a))
      {
        static $jsonReplaces = array(array("\\", "/", "\n", "\t", "\r", "\b", "\f", '"'), array('\\\\', '\\/', '\\n', '\\t', '\\r', '\\b', '\\f', '\"'));
		if(strpos(trim($a),"function(")===false):
        	return '"' . str_replace($jsonReplaces[0], $jsonReplaces[1], $a) . '"';
		else:
			return $a;
		endif;
      }
      else
        return $a;
    }
    $isList = true;
    for ($i = 0, reset($a); $i < count($a); $i++, next($a))
    {
      if (key($a) !== $i)
      {
        $isList = false;
        break;
      }
    }
    $result = array();
    if ($isList)
    {
      foreach ($a as $v) $result[] = $this->json_encok($v);
      return '[' . join(',', $result) . ']';
    }
    else
    {
      foreach ($a as $k => $v) $result[] = $k.':'.$this->json_encok($v);
      return '{' . join(',', $result) . '}';
    }
  }
	function getoptions(){
		$request =  $_REQUEST;
		$key = $request['key'];
		$options = $_SESSION['options'];
		$option = $options[$key];
		$where = "";
		if($option['dependsOn']){
			if($request[$option['depend']]!=0){
				$where = "where ".$option['depends']."='".$request[$option['depend']]."'";
			}
		}
		$q = "select ".$option['relkey']." as Value,".$option['field']." as DisplayText from ".$option['table']." $where order by ".$option['field'];
		$this->db->setQuery($q);
		$rows = $this->db->loadObjectList();
		$jFormResult = array();
		$jFormResult['Result'] = "OK";
		$jFormResult['Options'] = $rows;
		die(json_encode($jFormResult));
	
	}
	function getdisplay(){
		$request =  $_REQUEST;
		$key = $request['key'];
		$displays = $_SESSION['options'];
		$option = $displays[$key];
		$where = "where ".$option['depends']."='".$request[$option['depends']]."'";
		$q = "select ".$option['relkey']." as Value,".$option['field']." as DisplayText from ".$option['table']." $where order by ".$option['field'];
		$this->db->setQuery($q);
		$rows = $this->db->loadObject();
		$jFormResult = array();
		$jFormResult['Result'] = "OK";
		$jFormResult['data'] = $rows;
		die(json_encode($jFormResult));
	
	}			
	function setOptions($key,$table=null,$relkey='id',$field=null,$depends=NULL,$depend=NULL,$dependson=false){
		$options = $_SESSION['options'];
		$options[$key] = array("table"=>$table,"id"=>$key,"relkey"=>$relkey,"field"=>$field,"depend"=>$depend,"depends"=>$depends,"dependsOn"=>$dependson);
		$this->fields[$key]['options'] =  $this->url."&action=getoptions&key=".$key;
		if($dependson){
			//$depend = is_null($depend) ? $depends : $depend;
			$this->fields[$key]['options'] =  "function(data){
				if(data.sorce=='list'){
					return '".$this->url."&action=getoptions&key=$key&$depend=0'; 
				}
					return '".$this->url."&action=getoptions&key=$key&$depend=' + data.dependedValues.$depend; 				
			}";
			$this->fields[$key]['dependsOn']=$depend;

		}
		$_SESSION['options'] = $options;
	}
	function setDisplay($key,$table=null,$relkey='id',$field=null,$depends=NULL,$depend=NULL){
		$displays = $_SESSION['options'];
		$displays[$key] = array("table"=>$table,"id"=>$key,"relkey"=>$relkey,"field"=>$field,"depend"=>$depend,"depends"=>$depends);
		$url =  $this->url."&action=getdisplays&key=".$key;
		$this->fields[$key]['display'] =  "function(data){
					var res='';
					$.ajax({
  						url:'".$this->url."&action=getdisplay&key=$key&$depends=' + data.record.$depend,
 						dataType: 'json',
  						async: false,
  						success: function(json) {
							res=json.data.DisplayText;
						}
					});
					return res;					
									
			}";
		$_SESSION['options'] = $displays;
	}
	function fieldCustom($field,$param){
		$this->fields[$field] = array_merge($this->fields[$field],$param);
	}
	function moveAfter($fieldname,$target){
		$field = $this->fields[$fieldname];
		$arr = array();
		foreach($this->fields as $key => $val){
			$arr[$key] = $val;
			if($key == $target){
				unset($this->fields[$fieldname]);
				$arr[$fieldname] = $field;
			}			
		}	
		$this->fields=$arr;
	}
	function fieldMerge($param){
		foreach($param as $key => $val){
			$this->fieldCustom($key,$val);
		}
	}
	function addFieldAfter($name,$value,$before){
		$fields =$this->fields;
		$this->fields = array();
		foreach($fields as $key => $val){
			$this->fields[$key] = $val;
			if($key==$before){
				$this->fields[$name] = $value;		
			}
		}
	}
	function addFieldBefore($name,$value,$after){
		$fields =$this->fields;
		$this->fields = array();
		foreach($fields as $key => $val){
			if($key==$after){
				$this->fields[$name] = $value;		
			}
			$this->fields[$key] = $val;
		}
	}
	function setAkses($app,$tbl=""){
		if($tbl==""){
			$tbl=$this->table;
		}
		if(!$app->hasAccess(strtolower($tbl).".create")){
			$this->disable("create");	
		}
		if(!$app->hasAccess(strtolower($tbl).".update")){
			$this->disable("update");	
		}
		if(!$app->hasAccess(strtolower($tbl).".delete")){
			$this->disable("delete");	
		}
		if(!$app->hasAccess(strtolower($tbl).".read")){
			$this->disable("view");	
		}		
			
	}
	function edit($key){
		$this->jform['display']="edit";
		$this->id=$key;
		$_REQUEST['opt'][]=$this->db->primary;
		$_REQUEST['q'][]=$key;
	}
}
?>