<?php
namespace NCFramework\system\database;
use \NCFramework\system as system;

class sql extends system\database {
	public function test() {
		echo "sql";
	}
	function testparent() {
		parent::test();
	}
}
?>