<?php
$this->pagetitle="Menu";
$db = $this->base->db;
$post = $this->base->posts;
$app = new \NC\asset\App;
$table = new \NC\system\Table;
$table->toolbarsearch = true;
$q = "select id,nama from `group` order by nama";
$db->setQuery($q);
$res = $db->getRes();
$groups=array();
while($row=$res->fetch_object()){
		$groups[$row->id]=$row->nama;
}
$q = "select id,nama from `menu` order by nama";
$db->setQuery($q);
$res = $db->getRes();
$menus=array();
while($row=$res->fetch_object()){
		$menus[$row->id]=$row->nama;
}
$table->options = array(
"published"=>array(1=>"True",0=>"False"),
"group_id"=>$groups,
"menu_id"=>$menus
);
$table->setTitle("Menu Management");
//$table->showkey=false;
$table->setTable($db,"group_menu","id");
$toolbar1 =  array("icon"=>$this->base->baseurl."/images/menu.png",
        		"text"=>'List Menu',
        		"click"=>"function () {
            		var \$link = $(\"<a href='listmenu?format=raw' title='List Menu' alt='List Menu'>List Menu</a>\");
						\$.hik.jtable.prototype._popUp(\$link);
						return false;
        		}");
$table->addToolbar($toolbar1);
$table->setTH(array("group_id"=>"Group","menu_id"=>"Menu"));
$table->custom[] = "obj.fields.published.display = function(data){
		if(data.record.published==true){
		var \$link = $('<button type=\"button\" class=\"btn btn-info btn-circle\"><i class=\"fa fa-check\"></i></button>');
		}else{
		var \$link = $('<button type=\"button\" class=\"btn btn-warning btn-circle\"><i class=\"fa fa-times\"></i></button>');
		}
		return \$link;
}";
$table->trigger();
?>
    
<script type="text/javascript">

    jQuery(document).ready(function ($) {
   $( document ).tooltip();	
 
<?php echo $table->render();?>
 
        //Load all records when page is first shown
});
</script>
<?php echo $table->gethtml();?>