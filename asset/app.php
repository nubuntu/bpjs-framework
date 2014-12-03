<?php
namespace NC\asset;
class App {
	var $base;
	var $db;
	var $request;
	var $user;
	function __construct() {
		$this->base  = \NC\base::getInstance();
		$this->db = $this->base->db;
		$this->user = $this->base->getCookie("user");
		$this->request = $this->base->posts;
	}
}

?>