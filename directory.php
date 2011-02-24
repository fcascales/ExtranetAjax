<?php
  require_once('template.php');
  $template = new Template('Directorio');
  $template->stylesheets('dir');
  $template->scripts('dir');
  $template->begin();
?>

<div id="container">

  <div class="box dir tree">
    <h3>Árbol</h3>
    <div id="dir_tree"><!--Generado desde Dir.Table--></div>
    <hr />
    <div class="options">
      <input type="checkbox" id="cmd_fulltree" autocomplete="off"  />
      <label for="cmd_fulltree">Árbol completo</label>
    </div>
  </div>

  <div class="box dir table">
    <h2 id="dir_title">&nbsp;</h2>
    <div id="dir"><!--Generado desde Dir.Table--></div>
    <p id="dir_subtitle">&nbsp;</p>
  </div>

  <!--div style="float:left;"-->
    <div class="box dir commands">
      <h3>Comandos</h3>
      <ul>
        <li><a id="cmd_reload" href="#">Recargar</a></li>
        <li><a id="cmd_select" href="#">Seleccionar</a></li>
        <li>
          <select id="cmd_view" autocomplete="off">
            <option value="list">Listado</option>
            <option value="thumbnails">Miniaturas</option>
            <option value="compact">Compacto</option>
          </select>
        </li>
      </ul>
      <hr />
      <ul>
        <li><a id="cmd_newdir" href="#">Nueva carpeta</a></li>
        <li><a id="cmd_rename" href="#" class="disabled">Renombrar</a></li>
        <li><a id="cmd_copy"   href="#" class="disabled">Copiar</a></li>
        <li><a id="cmd_move"   href="#" class="disabled">Mover</a></li>
        <li><a id="cmd_delete" href="#" class="disabled">Borrar</a></li>
      </ul>
    </div>
    <!--br style="clear:both;" />
    <div class="box dir commands">
    </div-->
  <!--/div-->

</div>

<?php $template->end(); ?>