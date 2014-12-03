<!DOCTYPE html>
<html lang="<?=$this->lang;?>">

<head>
<?=$this->meta;?>
<title><?=$this->title;?></title>
<?=$this->css;?>
</head>

<body>

    <div class="container">
        <div class="row">
            <div class="col-md-4 col-md-offset-4">
                <div class="login-panel panel panel-default">
                    <div class="panel-heading">
                        <h3 class="panel-title"><?= $this->panel_title; ?></h3>
                    </div>
                    <div class="panel-body">
					<?= $this->content; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
<?= $this->js; ?>

</body>

</html>