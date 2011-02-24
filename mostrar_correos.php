<?php
  require_once('template.php');
  $template = new Template('Mostrar Correos');
  $template->begin();
?>

<div id="container">

  <form id="form_mails" class="" action="">
    <textarea id="mails" autocomplete="off" ><!--correos a copiar--></textarea>
    <input id="cmd_close" type="button" value="cerrar" onClick="window.close();" />
  </form>

  <div class="box">
    <h2>Ayuda</h2>
    <ul>
      <li>Haz clic en el cuadro de los correos</li>
      <li>Pulsa <kbd>Ctrl+A</kbd> para seleccionarlos todos</li>
      <li>Pulsa <kbd>Ctrl+C</kbd> para copiarlos</li>
      <li>Crea un nuevo correo electrónico</li>
      <li>Elige el campo de destinatarios <em>Con copia oculta</em></li>
      <li>Pulsa <kbd>Ctrl+V</kbd> para pegar los correos.</li>
    </ul>
  </div>

</div>

<?php $template->end(); ?>