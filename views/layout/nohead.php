<!DOCTYPE html>
<html lang="<?=$this->lang;?>">

<head>
<?=$this->meta;?>
<title><?=$this->title;?></title>
<?=$this->css;?>
<?= $this->js; ?>

</head>

<body>

    <div id="wrapper">

        <!-- Navigation -->
        <nav class="navbar navbar-default navbar-static-top" role="navigation" style="margin-bottom: 0">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="index.php"><?php echo $this->config->sitename;?></a>
            </div>
			<?=$this->topnav;?>
            <?=$this->mainnav;?>
            <!-- /.navbar-static-side -->
        </nav>

        <div id="page-wrapper">
            <div class="row">
            	<?=$this->content;?>
            </div>
            <!-- /.row -->
        </div>
        <!-- /#page-wrapper -->

    </div>
</body>

</html>
