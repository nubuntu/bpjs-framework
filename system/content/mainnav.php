<?php
$this->prepareMenu();
$topmenu = $this->getMenu();
?>
<div class="navbar-default sidebar" role="navigation">
                <div class="sidebar-nav navbar-collapse">
                    <ul class="nav" id="side-menu">
                    	<?php foreach($topmenu as $menu):?>
                        <li>
                            <a class="active" href="<?php echo $this->base->baseurl."/".$menu->link;?>"><i class="<?php echo $menu->style;?>"></i> <?php echo $menu->nama;?></a>
                            <?php
								$second = $this->getMenu($menu->id);
								if(count($second)>=1){
									echo '<ul class="nav nav-second-level">';
									foreach($second as $smenu):
							?>
                                <li>
                                    <a href="<?php echo $this->base->baseurl."/".$smenu->link;?>"><i class="<?php echo $smenu->style;?>"></i> <?php echo $smenu->nama;?></a>
                                </li>
                            <?php		
									endforeach;
									echo '</ul>';	
								}
							?>
                        </li>
                        <?php endforeach;?>

                    </ul>
                </div>
                <!-- /.sidebar-collapse -->
            </div>