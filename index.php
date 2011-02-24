<?php
  require_once('template.php');
  $template = new Template('Inicio');
  $template->begin();
?>

  <div id="search" class="">
    <input type="text" id="search_input" name="search" />
    <span  id="search_waiting" style="display:none;" /></span>
  </div>

  <div id="tabs" class="tabs">
    <ul>
      <li><a href="#" id="start" class="current">Inicio</a></li>
      <li><a href="#" id="config">Configuración</a></li>
      <li><a href="#" id="all" title="Todo">∞</a></li>
    </ul>
  </div>

  <div id="container">

    <div id="index1" class="box buttons start all">
      <h2>Principal</h2>
      <ul>
        <li><a href="socio.php"><span class="socio">Socios</span></a></li>
        <li><a href="grupos.php"><span class="grupo">Grupos</span></a></li>
        <li><a href="correo_masivo.php"><span class="correo">Correo masivo</span></a></li>
      </ul>
    </div>

    <div id="index2" class="box index config all">
      <h2>Seguridad</h2>
      <ul>
        <li><a href="password.php">Cambiar la contraseña</a></li>
        <li><a href="logins.php">Conexiones</a></li>
        <li><a href="#" id="cmd_backup_database">Copia de seguridad de la BD</a></li>
      </ul>
    </div>

    <div id="index3" class="box index config all">
      <h2>Gestor de archivos</h2>
      <ul>
        <li><a href="directory.php?dir=uploads&path=./">Adjuntados al correo</a></li>
        <li><a href="directory.php?dir=stories&path=../images/&view=thumbnails">Imágenes de la web</a></li>
      </ul>
    </div>

    <div id="aviso" class="start all">
      <span style="display:none;" class="msg warning"></span>
    </div>

  </div><!--#container-->

<?php $template->end(); ?>