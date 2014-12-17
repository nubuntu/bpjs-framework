<?php
namespace NC\system;
class View {
	public $base;
	public $config;
	public $action;
	private $data;
	private $layout="index";
	public $content;
	public $scripts;
	public  $menu;
	public $styles;
	public $format="html"; 
	function __construct($action) {
		$this->data=new \stdClass();
		$this->base      = \NC\base::getInstance();
		if(isset($this->base->posts->format)){
			$this->format = $this->base->posts->format;
		}
		$this->config = $this->base->config;
		$this->title=$this->config->sitename;
		$this->action = $action;
		$this->getContent();
		//$this->addScript('system/js');
		//$this->addScript('script/jquery-2.1.1.min.js');
		$this->addScript('plugins/jquery-ui-1.11.2/jquery-ui.min.js');
		$this->addScript('script/function.js');
		$this->addScript('plugins/jquery.msgbox/jquery.msgbox.i18n.js');
		$this->addScript('plugins/jquery.msgbox/jquery.msgbox.js');
		$this->addScript('plugins/jquery.dialogextend/jquery.dialogextend.min.js');
		$this->addScript('plugins/jquery.popupwindow/jquery.popupwindow.js');
		$this->addScript('plugins/jquery.switchButton/jquery.switchButton.js');
		$this->addScript('plugins/jform.1.0.0/jquery.jform.js');
		$this->addScript('plugins/jtable.2.4.0/jquery.jtable.js');
		$this->addScript('plugins/jtable.2.4.0/localization/jquery.jtable.id.js');
		$this->addScript('plugins/jtable.2.4.0/extensions/jquery.jtable.dialogcustom.js');
		$this->addScript('plugins/jtable.2.4.0/extensions/jquery.jtable.toolbarsearch.js');		
		$this->addScript('plugins/jtable.2.4.0/extensions/jquery.jtable.customdelete.js');	
		//$this->addScript('plugins/jtable.2.4.0/extensions/jquery.jtable.buttonhover.js');	
		$this->addScript('plugins/jtable.2.4.0/extensions/jquery.jtable.editinline.js');	
		$this->addScript('plugins/jtable.2.4.0/extensions/jquery.jtable.rowcustom.js');
		$this->addScript('plugins/jtable.2.4.0/extensions/jquery.jtable.buttonleft.js');
		$this->addScript('plugins/jtable.2.4.0/extensions/jquery.jtable.spreadsheet.js');
		$this->addScript('plugins/bootstrapvalidator/dist/js/bootstrapValidator.min.js');
		$this->addScript('plugins/jquery-validation-1.13.1/dist/jquery.validate.min.js');
		$this->addScript('script/custom.js');
		//$this->addStyle('plugins/jquery-ui-bootstrap/jquery.ui.theme.css');
		$this->addStyle('plugins/jquery-ui-1.11.2/jquery-ui.min.css');
		$this->addStyle('plugins/jquery-ui-1.11.2/jquery-ui.theme.css');
		$this->addStyle('plugins/jform.1.0.0/jquery.jform.css');
		$this->addStyle('plugins/jtable.2.4.0/themes/lightcolor/facebook/jtable.css');
		$this->addStyle('plugins/jquery.switchButton/jquery.switchButton.css');
		$this->addStyle('plugins/jquery.msgbox/themes/facebook/css/jquery.msgbox.css');
		$this->addStyle('plugins/bootstrapvalidator/dist/css/bootstrapValidator.min.css');
		$this->addStyle('style/custom.css');
		if(isset($this->base->posts->fullprint)){
			$this->setLayout("print");
		}

		$path = BASE . DS . 'views' . DS . $this->base->request[0] . DS . $this->action . '.php';
		if (file_exists($path)) {
			ob_start();
			include($path);			
			$this->content = ob_get_clean();
			if (ob_get_length() > 0) { ob_end_clean(); }
		}
		$this->generateLayout();
	}
	function __set($property, $value){
		$this->data->$property=$value;
	}
	function __get($property){
		if(isset($this->data->$property)){
			return $this->data->$property;
		}else{
			return null;
		}
	}
	function getContent(){
		$path = BASE . DS . 'system' . DS . 'content' . DS . 'topnav.php';
			ob_start();
			include($path);			
			$this->topnav = ob_get_clean();
			ob_end_clean();
		$path = BASE . DS . 'system' . DS . 'content' . DS . 'mainnav.php';
			ob_start();
			include($path);			
			$this->mainnav = ob_get_clean();
			if (ob_get_length() > 0) { ob_end_clean(); }
			
	}
	function setLayout($layout){
		$this->layout=$layout;
	}
	function render(){
		$this->generateMeta();
		$this->generateCSS();
		$this->generateJS();
		if($this->format=="html"){
			$path = BASE . DS . 'views' . DS .'layout'. DS . $this->layout . '.php';
		}else{
			$path = BASE . DS . 'views' . DS .'layout'. DS . $this->format.'.php';
		}
		if(file_exists($path)){
			include($path);
		}
		
	}
	
	function generateMeta(){
		$this->meta="";
		foreach($this->metadata as $md){
			$this->meta.="<meta";
			foreach($md as $m){
				$key = key($m);
				$this->meta.= " ".$key."='".$m->$key."'";
			}
			$this->meta.=">\n";
		}
		
	}
	function generateCSS(){
		$this->css="";
		foreach($this->cssdata as $cd){
			$this->css.="<link";
			foreach($cd as $c){
				$key = key($c);
				$this->css.= ($key!="href")?" ".$key."='".$c->$key."'" : " ".$key."='". $this->base->baseurl."/template/".$this->config->template."/".$c->$key."'";
			}
			$this->css.=">\n";
		}
		if(count($this->styles)>=1){
		foreach($this->styles as $style){
			$this->css.="<link href='". $this->base->baseurl."/$style' rel='stylesheet' type='text/css'>\n";
		}
		}
	}
	function generateJS(){
		$this->js="";
		foreach($this->jsdata as $jd){
			$this->js.="<script";
			foreach($jd as $j){
				$key = key($j);
				$this->js.= ($key!="src")?" ".$key."='".$j->$key."'" : " ".$key."='". $this->base->baseurl."/template/".$this->config->template."/".$j->$key."'";
			}
			$this->js.="></script>\n";
		}
		if(count($this->scripts)>=1){
		foreach($this->scripts as $script){
			$this->js.="<script src='". $this->base->baseurl."/$script' type='text/javascript'></script>\n";
		}
		}
	}	
	function generateLayout(){
		$data = file_get_contents(BASE.DS.'template'.DS.$this->config->template.DS.$this->layout.'.html');
		$html = new \NC\system\Html($data);
		$meta = $html->find("meta");
		$row=array();
		foreach($meta as $m){
			$row[]=$m->getAttributes();
		}
		$this->metadata=$row;
		$css = $html->find("link");
		$row=array();
		foreach($css as $c){
			$row[]=$c->getAttributes();
		}
		$this->cssdata=$row;
		$js= $html->find("script");
		$row=array();
		foreach($js as $j){
			$row[]=$j->getAttributes();
		}
		$this->jsdata=$row;		
		
	}
	function addScript($js){
		$this->scripts[] = $js;
	}
	function addStyle($css){
		$this->styles[] = $css;
	}
	function setSession($name,$val){
		$this->base->setCookie($name,$val);
	}
	function getSession($name){
		return $this->base->getCookie($name);	
	}
	function prepareMenu(){
		$db = $this->base->db;
		$user = $this->getSession("user");
		$q = "SELECT a.*, d.nama, d.link, d.style FROM group_menu AS a INNER JOIN user_groups AS b ON a.group_id = b.group_id INNER JOIN `user` AS c ON b.user_id = c.id INNER JOIN menu AS d ON a.menu_id = d.id where md5(c.id)='" .md5($user->id)."'
			 and a.published=1 order by a.ordering";
		$db->setQuery($q);
		$rows=$db->getRows();
		$this->menu = $rows;
	}
	function getMenu($parent=false){
		$rows=array();
		if($parent){
			foreach($this->menu as $menu){
				if($menu->parent==$parent){
					$rows[]=$menu;
				}
			}
		}else{
			if($this->menu){
			foreach($this->menu as $menu){
				if($menu->parent<1){
					$rows[]=$menu;
				}
			}
			}
		}
		return $rows;
	}
	function redirect($action){
		header("location:".$this->base->baseurl."/".$action);
	}
	function getMessage(){
		$arr = (object)$this->getSession("redirectmsg");
		if(isset($arr->type)){
			$this->setSession("redirectmsg",array("type"=>"","msg"=>""));
		}else{
			$arr = (object)array("type"=>"","msg"=>"sss");
		}
		return $arr;
	}

}

?>