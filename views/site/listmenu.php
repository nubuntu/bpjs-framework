<?php
$this->pagetitle="List Menu";
$db = $this->base->db;
$table = new \NC\system\Table;
$table->toolbarsearch = true;
$table->setTitle("List Menu");
$table->showkey=false;
$table->exc=array("nnnn","ordering","published","parent");
$table->setTable($db,"menu","id");
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