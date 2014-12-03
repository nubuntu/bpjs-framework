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

    <div id="wrapper">
        <div id="page-wrapper">
            <div class="row">
                <div class="col-lg-12">
                    <h1 class="page-header"><?=$this->pagetitle;?></h1>
                </div>
                <!-- /.col-lg-12 -->
            </div>
            <!-- /.row -->
            <div class="row">
            	<?=$this->content;?>
            </div>
            <!-- /.row -->
        </div>
        <!-- /#page-wrapper -->

    </div>
</body>

</html>