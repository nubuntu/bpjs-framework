<?php
$this->pagetitle="Data Group";
$db = $this->base->db;
$post = $this->base->posts;
$app = new \NC\asset\App;
$table = new \NC\system\Table;
$table->toolbarsearch = true;
$table->setTitle("Data Group");
$table->showkey=false;
$table->setTable($db,"`group`","id");
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