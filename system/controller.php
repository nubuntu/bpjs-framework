<?php
namespace NC\system;
class Controller {
	var $config;
	var $base;
	var $view;
	function __construct(){
		$this->base      = \NC\base::getInstance();
	}
	function render($action="index") {
		$this->view = new \NC\system\View($action);
		$this->view->render();
		
	}
	function actionJs(){
		die(new \NC\system\js);
	}
	function getDB(){
		return $this->base->db;
	}
	function getRequest($key,$default=""){
		if(isset($this->base->posts->$key)){
			return $this->base->posts->$key;
		}else{
			return $default;
		}
	}
	function getRequests(){
		return $this->base->posts;
	}
	function redirect($action,$type="",$msg=""){
		$this->setSession("redirectmsg",array('type'=>$type,'msg'=>$msg));
		header("location:".$this->base->baseurl."/".$action);			

	}
	function setSession($name,$val){
		$this->base->setCookie($name,$val);
	}
	function getSession($name){
		return $this->base->getCookie($name);	
	}
	


}

?>