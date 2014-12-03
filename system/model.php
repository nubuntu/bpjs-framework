<?php
namespace NC\system;
class Model {
	public $config;
	function __construct() {
		$base         = \NC\base::getInstance();
		$this->config = $base->config;
	}
}

?>