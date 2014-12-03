$(function() {
	$("[action]").click(function(){
		var action = $(this).attr("action");
		var isajax = $(this).attr("ajax");
		if(!isajax){
			console.log("sss");
		}
	});
});