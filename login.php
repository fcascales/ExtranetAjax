<?php
  require_once('template.php');
  $template = new Template('Conexión');
  $template->msg('Identifícate para entrar en la extranet.');
  $template->scripts('md5');
  $template->begin();
?>

  <form id="login" class="box" action="">
    <fieldset>
      <legend>Conexión</legend>
        <ul>
          <li><label for="user">Usuario</label><input type="text" id="user" name="user" autocomplete="off" autofocus="on" /></li>
          <li><label for="password">Contraseña</label><input type="password" id="password" name="password" autocomplete="off" /></li>
          <!--li><label for="captcha">Captcha</label><input type="text" id="captcha" name="captcha" autocomplete="off" /></li-->
          <!--li><img src="server/captcha.php?img=1" /></li-->
          <li><input type="submit" id="cmd_login" value="Conectar" />
        </ul>
    </fieldset>
    <div class="options"><input type="checkbox" id="remember" name="remember" /><label for="remember">Recordar en este equipo</label></div>
  </form>

<?php $template->end(); ?>