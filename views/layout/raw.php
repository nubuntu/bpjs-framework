<!DOCTYPE html>
<html lang="<?=$this->lang;?>">

<head>
<?=$this->meta;?>
<title><?=$this->title;?></title>
<?=$this->css;?>
<style>
#page-wrapper{
	margin:0;
}
@media print {

	@page {
    margin: 0;
}
  body{
	  background-color:#FFF;
	padding:0;
    margin:0;
  }
  .navbar,#page-wrapper > .row:first-child{
        display: none !important;
  }
  
}
</style>
<?= $this->js; ?>

</head>

<body>

            	<?=$this->content;?>
</body>

</html>