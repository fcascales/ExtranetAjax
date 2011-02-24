<?php
  require_once('template.php');
  $template = new Template('Últimas conexiones');
  $template->begin();
?>

  <div id="container">
     <div class="box">

      <div id="page">
        <label for="num_page">Página:</label>
        <select id="num_page">
          <option>1</option>
          <option>2</option>
          <option>3</option>
        </select>
      </div>

      <div id="logins" class="table"><!-- tabla de conexiones --></div>

    </div><!--.box-->
  </div><!--#container-->

<?php $template->end(); ?>