jQuery(document).ready(function ($) {
	$( "#Tanggal" ).datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat:"yy-mm-dd"
	});
	$(".Tanggal").each(function(index, element) {
		$(this).datepicker({
			changeMonth: true,
			changeYear: true,
			dateFormat:"yy-mm-dd"
		});    
	});
	var _alert = window.alert;
	window.alert = function (msg) {
		$.msgbox({
			lang:'id_ID',
			type:'alert',
			content: msg
		});
	};
});