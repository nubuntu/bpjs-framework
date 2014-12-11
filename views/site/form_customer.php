<?php
$db = $this->base->db;
$post = $this->base->posts;
$app = new \NC\asset\App;
$form = new \NC\system\Form;
$form->setTitle("Customer ['new']");
$form->jform['columns']=2;
$form->showkey=false;
$form->setTable($db,"film","film_id");
$custom = array(
			"title"=>array("title"=>"Judul","required"=>true),
			"description"=>array("title"=>"Deskripsi","required"=>true)
		);
$form->fieldMerge($custom);	

$suggestparam = array(
			"table"=>"language",
			"value"=>"language_id",
			"display"=>"name"			);
$form->setSuggest("language_id",$suggestparam);	
$form->setSuggest("original_language_id",$suggestparam);	
$form->trigger();
?>
    
<script type="text/javascript">

    jQuery(document).ready(function ($) {
  
 
<?php echo $form->render();?>
});
</script>
<?php echo $form->gethtml();?>