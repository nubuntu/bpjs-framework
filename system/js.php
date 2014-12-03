<?php
namespace NC\system;
class JS{
var $base;
function __construct(){
	$this->base      = \NC\base::getInstance();
}
function __toString(){
Header("Content-Type: application/x-javascript; charset=UTF-8");
?>
$(function() {
	var base = "<?=$this->base->baseurl;?>";
	$("a [action]").click(function(){
		var action = $(this).attr("action");
		var isajax = $(this).attr("ajax");
		if(!isajax){
			window.location.replace(base + "/" + action);
		}else{
        
        }
	});
});
<?php return "";}} ?>