<?php
  require_once('template.php');
  $template = new Template('Socios nuevos');
  $template->begin();
?>

<div id="container">

  <div class="box">
    <div id="socios_nuevos"><!--Lista de socios nuevos desde el formulario web Hazte socio--></div>
  </div>

  <div id="help">
    <h2>Ayuda</h2>
    <p>
      Selecciona el socio para ver todos sus campos o para borrarlo.<br />
      Cuando un socio nuevo se guarda deja de aparecer como nuevo.
    </p>
  </div><!--#help-->

</div><!--#container-->

<?php $template->end(); ?>