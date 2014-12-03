<?php
$db = $this->base->db;
$post = $this->base->posts;
$this->pagetitle=$post->tbl;
$table = new \NC\system\Table;
$table->toolbarsearch = true;
$table->setTitle("Data ".$post->tbl);
$table->setTable($db,$post->tbl,$post->pkey);
$table->trigger();
?>
    
<script type="text/javascript">

    jQuery(document).ready(function ($) {
<?php echo $table->render();?>
	});
</script>
<?php echo $table->gethtml();?>