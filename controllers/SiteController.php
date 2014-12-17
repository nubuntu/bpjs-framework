<?php
use \NC\system as system;

class SiteController extends system\Controller {
	function actionIndex() {
		$this->render('login');
	}
	function actionHome(){
		$this->render();
	}
	function actionLogin(){
		$db= $this->getDB();
		$request = $this->getRequests();
		$q = "select * from user where md5(username)='".md5($request->username)."' and md5(password)='".md5($request->password)."'";
		$db->setQuery($q);
		$row = $db->getRow();
		if($row){
			$this->setSession("user",$row);
			$q = "SELECT a.*, d.nama, d.link, d.style FROM group_menu AS a INNER JOIN user_groups AS b ON a.group_id = b.group_id INNER JOIN `user` AS c ON b.user_id = c.id INNER JOIN menu AS d ON a.menu_id = d.id where md5(c.id)='" .md5($row->id)."'
			 and published=1 order by a.ordering";
			$db->setQuery($q);
			$rows=$db->getRows();
			if($rows){
				//$this->setSession("menu",$rows);
			}else{
				$this->redirect('user/index','error','Login Gagal, Anda tidak tergabung dalam divisi manapun, silahkan hubungi Administrator!!');
				
			}
			$q = "SELECT c.id, d.nama FROM group_akses AS a INNER JOIN user_groups ON a.group_id = user_groups.group_id INNER JOIN `user` AS c ON user_groups.user_id = c.id INNER JOIN akses AS d ON a.akses_id = d.id where md5(c.id)='" .md5($row->id)."'";
			$db->setQuery($q);
			$rows=$db->getRows();
			if($rows){
				//$this->setSession("akses",$rows);
			}else{
				$this->redirect('site/index','error','Login Gagal, Anda tidak memiliki akses sama sekali, silahkan hubungi Administrator!!');
				
			}
			$this->redirect('site/home');
		}else{
			$this->redirect('site/index','error','Login Gagal, Username atau Password Salah...!!');
		}
	}
	function actionLogout(){
		$this->base->clearCookie();
		$this->redirect('site/index');
	}
}

?>