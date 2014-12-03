<?php
$msg = $this->getMessage();
$this->setLayout("login");
$this->panel_title="Silahkan Login";
?> 
 <form role="form" action="<?php echo $this->base->baseurl."/site/login";?>" method="post">
                            <fieldset>
                                <div class="form-group">
                                    <input class="form-control" placeholder="Username" name="username" type="username" autofocus>
                                </div>
                                <div class="form-group">
                                    <input class="form-control" placeholder="Password" name="password" type="password" value="">
                                </div>
                                <?php if($msg->type=='error'):?>
									<div class="alert alert-danger"><?=$msg->msg;?></div>
                                <?php endif;?>
                                <input type="submit" class="btn btn-lg btn-success btn-block" value="Login"/>
                            </fieldset>
                        </form>