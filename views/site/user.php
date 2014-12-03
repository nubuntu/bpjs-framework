<?php
$this->pagetitle="Manajemen User & Group";
$db = $this->base->db;
$post = $this->base->posts;
$app = new \NC\asset\App;
$table = new \NC\system\Table;
$table->options = array(
"jeniskelamin"=>array(1=>"Perempuan",0=>"Laki-Laki")
);
$table->toolbarsearch = true;
$table->setTitle("Data User");
//$table->showkey=false;
$table->fields['Menu'] = array("width"=>"1%",
							"title"=>":: Menu ::",
							"create"=>false,
							"edit"=>false,
							"searchable"=>false,
							"sorting"=>false,
							"noprint"=>true,
							"type"=>"link",
							"content"=>array(
							 	array(
									"title"=>"Akses",
									"alt"=>"List Akses",
									"icon"=>"btn btn-primary btn-circle>fa fa-key",
									"display"=>"function(data){return 'user_access?uid=' + data.record.id + '&format=content';}"
								)
							 )
							);
$table->setTable($db,"`user`","id");

$toolbar1 =  array("icon"=>$this->base->baseurl."/images/group.png",
        		"text"=>'Group',
        		"click"=>"function () {
            		var \$link = $(\"<a href='group?format=raw' title='Data Group' alt='Data Group'>Data Group</a>\");
						\$.hik.jtable.prototype._popUp(\$link);
						return false;
        		}");
$table->addToolbar($toolbar1);

$table->fields['password']['type'] = "password";
$table->fields['email']['type'] = "email";
$table->fields['password']['list'] = false;
//$table->addDetail($detail,"id","id");
//$table->setCombo("noAccount",$q);
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