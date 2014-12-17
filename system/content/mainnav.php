<?php
$this->prepareMenu();
$topmenu = $this->getMenu();

?>
<div class="navbar-default sidebar" role="navigation">
                <div class="sidebar-nav navbar-collapse">
                    <ul class="nav" id="side-menu">
                    	<?php foreach($topmenu as $menu):
								$second = $this->getMenu($menu->id);
								$arrow = count($second)>=1?"<span class='fa arrow'></span>":"";						
						?>		
                        <li>
                            <a href="<?php echo $this->base->baseurl."/".$menu->link;?>"><i class="<?php echo $menu->style;?>"></i> <?php echo $menu->nama;?><?=$arrow;?></a>
                            <?php
								if(count($second)>=1){
									echo '<ul class="nav nav-second-level">';
									foreach($second as $smenu):
									$activeurl =str_replace( $this->base->baseurl,"",$_SERVER['REQUEST_URI']);
									$active = $activeurl=="/".$smenu->link?"activemenu":"";
							?>
                                <li class="<?=$active;?>">
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