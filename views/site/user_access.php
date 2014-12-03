<?php
$app = new \NC\asset\App;
$db = $this->base->db;
$post =$this->base->posts;
$user_id = $post->uid;
if(isset($post->action)){
	$gid = $post->gid;
	switch($post->action){
		case "grant":		
			$q = "insert into user_groups(user_id,group_id) values($user_id,$gid)";
		break;
		case "revoke":
			$q = "delete from user_groups where user_id=$user_id and group_id=$gid";
		break;
		case "grantacl":
			$aid = $post->aid;		
			$q = "insert into group_akses(akses_id,group_id) values($aid,$gid)";
		break;
		case "revokeacl":
			$aid = $post->aid;		
			$q = "delete from group_akses where akses_id=$aid and group_id=$gid";
		break;		
	}
	$db->setQuery($q);
	$db->query();
	die("success");
}
$q = "select id,nama from `user` where md5(id)='".md5($user_id)."'";
$db->setQuery($q);
$user  = $db->getRow();
$this->pagetitle="Akses ".$user->nama;

$q ="select * from `group`";
$db->setQuery($q);
$rows = $db->getRows();
$q = "select * from akses";
$db->setQuery($q);
$akses = $db->getRows();
$q ="select a.id from `group` as a inner join user_groups as b on a.id=b.group_id where b.user_id=".$user->id;
$db->setQuery($q);
$res=$db->getRes();
$groups=array();
while($r=$res->fetch_object()){
	$groups[$r->id]=true;
}

?>
<div id="groups">
<?php foreach($rows as $row):
$q="select akses_id from group_akses where group_id=".$row->id;
$db->setQuery($q);
$res = $db->getRes();
$aclList=array();
while($a=$res->fetch_object()){
	$aclList[$a->akses_id]=true;
}
?>
<div class="panel panel-default">
<div class="panel-heading checkbox" rel="<?=$row->nama;?>">
	<strong class="groupname"><?=$row->nama;?></strong>
	<div class="switch-wrapper">
		<input type="checkbox" class="groupcheck" <?=isset($groups[$row->id])?"checked":"";?> name="id[]" value="<?=$row->id?>"/>
    </div>
</div>
<div class="panel-body">
<?php foreach($akses as $acl):?>
	<?=$acl->nama;?>
	<div class="switch-wrapper"> 
        	<input type="checkbox" rel="<?=$row->id;?>" class="aclcheck" <?=isset($aclList[$acl->id])?"checked":"";?> name="<?=$acl->id;?>-id[]" value="<?=$acl->id?>"/>			
     </div>
<?php endforeach;?>     
</div>
</div> 
 <?php endforeach;?>
</div>
<script>
jQuery(document).ready(function ($) {
	$("input[type=checkbox]").switchButton({
		show_labels: false
	});	
	
	$(".groupcheck").change(function(){
		if($(this).is(":checked")){
			var url ="user_access?action=grant&gid=" + $(this).val() + "&uid=<?=$user->id;?>";
		}else{
			var url ="user_access?action=revoke&gid=" + $(this).val() + "&uid=<?=$user->id;?>";
		} 
		$.post(url,function(data){
			console.log(data);
		});
	});
	$(".aclcheck").change(function(){
		if($(this).is(":checked")){
			var url ="user_access?action=grantacl&aid=" + $(this).val() + "&gid=" + $(this).attr("rel") +"&uid=<?=$user->id;?>";
		}else{
			var url ="user_access?action=revokeacl&aid=" + $(this).val() + "&gid=" + $(this).attr("rel")+"&uid=<?=$user->id;?>";
		} 
		$.post(url,function(data){
			console.log(data);
		});		
			
	});	
});
</script>
