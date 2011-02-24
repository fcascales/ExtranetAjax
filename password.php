<?php
  require_once('template.php');
  $template = new Template('Cambiar la contraseña');
  $template->msg('Introduce la contraseña antigua y luego la nueva dos veces.');
  $template->scripts('md5');
  $template->begin();
?>

  <form id="form" class="box">
    <fieldset>
      <legend>Antigua</legend>
      <ul>
        <li><label for="old_password">Contraseña</label><input type="password" id="old_password" name="old_password" autocomplete="off" /></li>
      </ul>
    </fieldset>
    <fieldset>
      <legend>Nueva</legend>
      <ul>
        <li><label for="new_password1">Contraseña (1)</label><input type="password" id="new_password1" name="new_password1" autocomplete="off" /></li>
        <li><label for="new_password2">Contraseña (2)</label><input type="password" id="new_password2" name="new_password2" autocomplete="off" /></li>
      </ul>
    </fieldset>
    <div><input type="submit" id="cmd" value="Cambiar" /></div>
  </form>

<?php $template->end(); ?>