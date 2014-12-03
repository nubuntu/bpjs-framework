<?php
namespace NC;
define("NC", 1);
define("BASE", __DIR__);
define("DS", DIRECTORY_SEPARATOR);
class base {
	public $db;
	public $config;
	public $session;
	public $cookie;
	public $request;
	private $command;
	private $controller;
	public $posts;
	public $baseurl;
	public $baselink;
	function __construct($config = array()) {
		$this->config  = $config;
		$this->session = (object) $_SESSION;
		$this->cookie  = (object) $_COOKIE;
		$this->posts=(object)$_REQUEST;
		$route = $_SERVER['PHP_SELF'];
		$route = explode("index.php/",$route);
		$this->baseurl=str_replace("/index.ph","",substr($route[0],0,strlen($route[0])-1));
		if(isset($route[1])){
			$this->command = $route[1];
			//die($this->command);
		} else {
			$this->command = "site";
		}
		$this->request=explode("/",$this->command);
		
		
	}
	public static function getInstance($config = array()) {
		static $instance;
		if (!$instance) {
			$instance = new base($config);
		}
		return $instance;
	}
	function run() {
		$db               = "\NC\system\db\\" . $this->config->db->driver;
		$this->db         = new $db($this->config->db);
		$controllername = strtolower($this->request[0]);
		$action           = "action";
		$action .= isset($this->request[1]) ? ucfirst($this->request[1]) : "Index";
		if($controllername=="system"){
			$this->controller = new \NC\system\Controller;
		}else{
			$controller       = ucfirst($controllername) . "Controller";
			$this->controller = new $controller;
		}
		if(method_exists($this->controller,$action)){
			$this->controller->$action();
		}else{
			$this->controller->render(strtolower(str_replace("action","",$action)));
		}

	}
	function setCookie($name,$value) {
		$expire = time() + 60 * 60 * 24 * 30;
		setcookie($name, serialize($value), $expire);
	}
	function getCookie($name){
		if(!isset($_COOKIE[$name])) {
			return false;
		} else {
    		return unserialize($_COOKIE[$name]);
		}
	}
	function clearCookie(){
		if (isset($_SERVER['HTTP_COOKIE'])) {
    		$cookies = explode(';', $_SERVER['HTTP_COOKIE']);
    		foreach($cookies as $cookie) {
        		$parts = explode('=', $cookie);
        		$name = trim($parts[0]);
        		setcookie($name, '', time()-1000);
        		setcookie($name, '', time()-1000, '/');
    		}
		}
	}

}

function load($namespace) {
	$splitpath = explode('\\', $namespace);
	$path      = '';
	$name      = '';
	$firstword = true;
	for ($i = 0; $i < count($splitpath); $i++) {
		if ($splitpath[$i] && !$firstword) {
			if ($i == count($splitpath) - 1) {
				$name = $splitpath[$i];
			} else {

				$path .= DS . $splitpath[$i];
			}
		}

		if ($splitpath[$i] && $firstword) {
			if ($splitpath[$i] != __NAMESPACE__) {
				break;
			}

			$firstword = false;
		}
	}
	if (!$firstword) {
		$fullpath = __DIR__ . $path . DS . $name . '.php';
		if(file_exists($fullpath)){
			return include_once ($fullpath);
		}
	} else {
		if (strpos($splitpath[0], "Controller")) {
			$fullpath = BASE . DS . 'controllers' . DS . $splitpath[0] . '.php';
			if(file_exists($fullpath)){
				return include_once ($fullpath);
			}
		}
	}
	return false;
}

function loadPath($absPath) {
	return include_once ($absPath);
}
spl_autoload_register(__NAMESPACE__ . '\load');
?>