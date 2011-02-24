<?php
  require_once('template.php');
  $template = new Template('Tareas');
  $template->stylesheets('calendar');
  $template->scripts('date','calendar','validate');
  $template->begin();
?>

  <div class="box">

    <div id="search">
      <label for="year">Año:</label>
      <select id="year">
        <option>2008</option>
        <option>2009</option>
        <option>2010</option>
      </select>
      <label for="finish">Acabada:</label>
      <select id="finish">
        <option value="0">No</option>
        <option value="-1">Sí</option>
      </select>
    </div>

    <form id="grid" class="grid" action="">
      <table>
        <thead>
          <tr>
            <th></th>
            <th name="id_tarea"></th>
            <th name="id_usuario">usuario</th>
            <th name="prioridad" title="Prioridad"><span class="down">prior.</span></th>
            <th name="fecha_tarea"><span class="down">fecha</span></th>
            <th name="tarea">tarea</th>
            <th name="acabada"></th>
            <th name="acabada_dropdown">acabada</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th></th>
            <td><input type="hidden" name="id_tarea" disabled="true" /></td>
            <td><input type="text" name="id_usuario" class="dropdown" /></td>
            <td><input type="text" name="prioridad" class="dropdown" /></td>
            <td><input type="text" name="fecha_tarea" class="date calendar" /></td>
            <td><input type="text" name="tarea" /></td>
            <td><input type="hidden" name="acabada" /></td>
            <td><input type="text" name="acabada_dropdown" class="dropdown" /></td>
            <th><a href="#">Borrar</a></th>
          </tr>
        </tbody>
      </table>
      <p class="buttons">
        <a id="cmd_save" href="#">Guardar</a>
      </p>
    </form>

  </div><!--.box-->

<?php $template->end(); ?>