<?php
  require_once('template.php');
  $template = new Template('Grupos');
  $template->scripts('calendar','validate');
  $template->begin();
?>

<div id="container">

  <form id="grid" class="box grid" action="">
    <table>
      <thead>
        <tr>
          <th></th>
          <th name="id_grupo">id</th>
          <th name="grupo" class="required">grupo</th>
          <th name="id_responsable"></th>
          <th name="id_responsable_dropdown">responsable</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th></th>
          <td><input type="text" name="id_grupo" disabled="true" /></td>
          <td><input type="text" name="grupo" /></td>
          <td><input type="hidden" name="id_responsable" /></td>
          <td><input type="text" name="id_responsable_dropdown" class="dropdown" /></td>
          <th><a href="#">Borrar</a></th>
        </tr>
      </tbody>
    </table>
    <p class="buttons">
      <a id="cmd_save" href="#">Guardar</a>
    </p>
  </form>

  <div class="box">
    <h2 id="grupo"></h2>
    <p><a id="cmd_mails" href="#">Obtener todos los correos</a></p>
    <div id="grupos_socios"><!--Lista de socios del grupo seleccionado--></div>
  </div>

</div><!--#container-->

<?php $template->end(); ?>