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
			echo $q = "select a.*,d.nama,d.link,d.style from group_menu as a inner join user_groups as b on a.group_id=b.id 
			inner join user as c on b.user_id=c.id inner join menu as d on a.menu_id=d.id where md5(c.id)='" .md5($row->id)."'
			 and published=1 order by a.ordering";
			$db->setQuery($q);
			if($rows=$db->getRows()){
				$this->setSession("menu",$rows);
			}
			$q = "select a.*,d.nama from group_akses as a inner join user_groups as b on a.group_id=b.id 
			inner join user as c on b.user_id=c.id inner join akses as d on a.akses_id=d.id where md5(c.id)='" .md5($row->id)."'";
			$db->setQuery($q);
			if($rows=$db->getRows()){
				$this->setSession("akses",$rows);
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