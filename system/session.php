<?php
namespace NC\system;
class Session {
	var $config;
	var $base;
	function __construct(){
		$this->base      = \NC\base::getInstance();
	}
	function setSession($name,$val){
		setcookie($name, $cookie_val, time() + (86400 * 30), "/");
	}
	function getSession($name){
		if(!isset($_COOKIE[$name])) {
			return false;
		} else {
    		return $_COOKIE[$name];
		}
	}


}

?>