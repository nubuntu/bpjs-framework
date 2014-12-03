<?php
$app = new \NC\asset\App;
$db = $this->base->db;
$this->pagetitle="Profile";
$post = $this->base->posts;
if(isset($post->action)){
	switch($post->action){
		case "save":
			$post->id=$app->user->id;
			$db->setTable("`user`","id");
			$db->bind((array) $post);
			$res = $db->store();
			die($res);
		break;	
	}
}

?>
<div class="panel panel-default">
                        <div class="panel-heading">
                            Detail Profile <?=$app->user->nama;?>
                        </div>
                        <div class="panel-body">
                            <div class="row">
                                <div class="col-lg-12">
                                    <form role="form" id="profileForm" action="profile">
                                        <div class="form-group">
                                            <label>Username</label>
                                            <input name="username" class="form-control" value="<?=$app->user->username;?>">
                                        </div>
                                        <div class="form-group">
                                            <label>Password</label>
                                            <input name="password" type="password" class="form-control" placeholder="Change Password">
                                        </div>
                                        <div class="form-group">
                                            <label>Nama</label>
                                            <input name="nama" class="form-control" value="<?=$app->user->nama;?>">
                                        </div>                                        
                                        <div class="form-group">
                                            <label style="display:inline-block; margin-right:10px;">Jenis Kelamin</label>
                                            <label class="radio-inline">
                                                <input type="radio" name="jeniskelamin" id="male" value="0" <?=$app->user->jeniskelamin==0?"checked=checked":"";?>>Laki-Laki
                                            </label>
                                            <label class="radio-inline">
                                                <input type="radio" name="jeniskelamin" id="female" value="1" <?=$app->user->jeniskelamin==1?"checked=checked":"";?>>Perempuan
                                            </label>
                                        </div>
                                        <div class="form-group">
                                            <label>Email</label>
                                            <input type="email" name="email" class="form-control" value="<?=$app->user->email;?>">
                                        </div>                                        
                                        <div class="form-group">
                                            <label>Phone</label>
                                            <input type="tel" name="phone" class="form-control" value="<?=$app->user->phone;?>">
                                        </div>
                                        <input type="hidden" name="format" value="source"/>
                                        <input type="hidden" name="action" value="save"/>
                                        <button type="submit" class="btn btn-default">Submit</button>
                                    </form>
                                </div>
                                <!-- /.col-lg-6 (nested) -->

                            </div>
                            <!-- /.row (nested) -->
                        </div>
                        <!-- /.panel-body -->
                    </div>
<script>
jQuery(document).ready(function ($) {
    $('#profileForm').bootstrapValidator({
        message: 'Isian tersebut tidak memenuhi kriteria atau salah...s',
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            username: {
                message: 'Username tidak memenuhi kriteria',
                validators: {
                    notEmpty: {
                        message: 'Username tidak boleh kosong'
                    },
                    stringLength: {
                        min: 6,
                        max: 30,
                        message: 'Username harus berisi minimal 6 karakter, maksimal 30 karakter'
                    },
                    regexp: {
                        regexp: /^[a-zA-Z0-9_]+$/,
                        message: 'Username hanya boleh berisi abjad, angka atau underscore'
                    }
                }
            },
            nama: {
                message: 'Nama tidak memenuhi kriteria',
                validators: {
                    notEmpty: {
                        message: 'Nama tidak boleh kosong'
                    }
                }
            },
            password: {
                message: 'Password tidak memenuhi kriteria',
                validators: {
                    notEmpty: {
                        message: 'Password tidak boleh kosong'
                    },
                    stringLength: {
                        min: 6,
                        max: 30,
                        message: 'Password harus berisi minimal 6 karakter, maksimal 30 karakter'
                    },
                    regexp: {
                        regexp: /^[a-zA-Z0-9_]+$/,
                        message: 'Password hanya boleh berisi abjad, angka atau underscore'
                    }
                }
            },
            email: {
                validators: {
                    notEmpty: {
                        message: 'Email tidak boleh kosong'
                    },
                    emailAddress: {
                        message: 'Email tidak memenuhi kriterai'
                    }
                }
            }
        }
    }).on('success.form.bv', function(e) {
            e.preventDefault();
            var $form = $(e.target);
            var bv = $form.data('bootstrapValidator');
            $.post($form.attr('action'), $form.serialize(), function(result) {
            	console.log(result);
			});
        });	
});
</script>                    