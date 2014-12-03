<?php
namespace NC\system\db;

class mysql {
	private $config;
	private $sql;
	private $conn;
	var $recordset;
	var $table;
	var $fields;
	var $assign;
	var $primary;
	public function __construct($config) {
		$this->config = $config;
	}
	public function connect() {
		$this->conn = new \mysqli($this->config->host, $this->config->username, $this->config->password, $this->config->name);
		if (mysqli_connect_errno()) {
			printf("Connect failed: %s\n", mysqli_connect_error());
			exit();
		}

	}
	public function setQuery($q){
		$this->sql = $q;
	}
	public function query($affected_rows=true){
		$this->connect();
		if(!$result = $this->conn->query($this->sql)){
    		die('There was an error running the query [' . $this->conn->error . ']');
		}
		if($affected_rows){
			return $this->conn->affected_rows;
		}else{
			return $result;
		}
	}
	public function getResult(){
		$res = $this->query(false);
		$row = $res->fetch_array(MYSQLI_NUM);
		if(count($row)<1){
			return NULL;
		}else{
			return $row[0];
		}
	}
	public function getRes(){
		return $this->query(false);
	}
	public function getRow(){
		$res = $this->query(false);
		$row = $res->fetch_object();
		if(count($row)<1){
			return false;	
		}
		return $row;
	}
	public function getRows(){
		$res = $this->query(false);
		$rows = array();
		while($row=$res->fetch_object()){
			$rows[]=$row;
		}
		if(count($rows)<1){
			return false;
		}
		return $rows;
	}
	function loadResult()
	{
		return $this->getResult();
	}

	function loadObject( )
	{
		return $this->getRow();
	}
	function loadObjectList()
	{
		return $this->getRows();
	}
	function loadArrayList(){
		$cur =$this->query(false);
		$array = array();
		while ($row = $cur->fetch_array(MYSQLI_ASSOC)) {
				$array[] = $row;
		}
		return $array;	
	}
	function getListArray($query,$limitstart,$limit){
		$this->setQuery( $query." limit ".$limitstart.",".$limit);
		$cur = $this->query(false);
		$array = array();
		$i = 1;
		while ($row = $cur->fetch_array(MYSQLI_ASSOC)) {
				$row['record_number']= $i + $limitstart;
				$array[] = $row;
				$i++;
		}
		return $array;
	}
	function getList($query,$limitstart,$limit){
		$this->setQuery( $query." limit ".$limitstart.",".$limit);
		$cur = $this->query(false);
		$array = array();
		$i = 1;
		while ($row = $cur->fetch_object()) {
				$row->record_number= $i + $limitstart;
				$array[] = $row;
				$i++;
		}
		return $array;
	}
	

	function getListCount( $query )
	{
		$this->setQuery( $query );
		$rows = $this->loadObjectList();
		return count($rows);
	}			
	
	function getFields(){
		return $this->fields;
	}
	function setTable($t,$key='id',$isquery=false){
		$this->table = $t;
		$this->setField($isquery);
		$this->setPrimary($key);
	}
	function getEscaped( $text, $extra = false )
	{
		$result = mysqli_real_escape_string( $text );
		if ($extra) {
			$result = addcslashes( $result, '%_' );
		}
		return $result;
	}
	
	function setField($isquery=false){
		if(!$isquery):
		$q = "show columns from ".$this->table;
		$this->setQuery($q);
		$rows = $this->loadObjectList();
		$fields = new \stdClass();
		foreach($rows as $row){
			//$row->Field = str_replace(" ","_",$row->Field);
			$name = $row->Field;
			$fields->$name = $row->Type;
		}
		$this->fields = get_object_vars($fields);
		else:
			$q = "select tbl.* FROM (SELECT 1) AS ignore_me 
			LEFT JOIN (".$this->table.") AS tbl ON 1 = 1 LIMIT 1";
			$this->setQuery($q);
			$rows = $this->loadObjectList();
			$fields = new \stdClass();
			foreach($rows[0] as $row => $val){
				$name = $row;
				$fields->$name = "varchar";
			}
			$this->fields = get_object_vars($fields);
		endif;
	}
	function setPrimary($key){
      $this->primary = $key;    
  	}		
	function bind($data){
		$this->assign = '';	
		foreach($this->fields as $key => $value):
			if(isset($data[$key])): 		
			$this->assign[$key] = $data[$key];
			endif;
		endforeach;
	}
	function store(){
		$this->assign[$this->primary]=isset($this->assign[$this->primary])?$this->assign[$this->primary]:0;
		$q = "select count(*) from ".$this->table." where ".$this->primary." = '".mysqli_real_escape_string($this->conn,$this->assign[$this->primary])."'";
		$this->setQuery($q);
		$count = $this->loadResult();
		if($count >= 1):
		foreach($this->assign as $key => $value):
			if($key != $this->primary):
			$row[] = "`".$key."`= '".mysqli_real_escape_string($this->conn,$value)."'";
			endif;
		endforeach;
		$q = "update ".$this->table." set ".implode(',',$row)." where ".$this->primary." = '".mysqli_real_escape_string($this->conn,$this->assign[$this->primary])."'";
		else:
		foreach($this->assign as $key => $value):
			$row['field'][] = $key;
			$row['value'][] = "'".mysqli_real_escape_string($this->conn,$value)."'";
		endforeach;
		$q = "insert into ".$this->table."(`".implode("`,`",$row['field'])."`) VALUES (".implode(',',$row['value']).")";
		endif;
		//echo $q;
		$this->setQuery($q);
		return $this->query();	
	}
	function delete($post){
		$q = "delete from ".$this->table." where ".$this->primary." = '".mysqli_real_escape_string($this->conn,$post[$this->primary])."'";
		$this->setQuery($q);
		$this->query();	
	}
	function lastId(){
		return $this->conn->insert_id;
	}
	function lookUp($field,$table,$where){
		$q = "select ".$field." as result from ".$table." where ".$where;
		$this->setQuery($q);
		return $this->loadResult();	
	}
	function DCount($field,$table,$where){
		$q = "select count(".$field.") from ".$table." where ".$where;
		$this->setQuery($q);
		return $this->loadResult();	
	}
	function concat($field,$table,$where){
		$q = "select * from ".$table." where ".$where;
		$this->setQuery($q);
		$rows = $this->loadObjectList();
		foreach($rows as $row):
			$data[] = $row->$field;
		endforeach;
		return $data;
	}	
}
?>