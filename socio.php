<?php
  require_once('template.php');
  $template = new Template('Socio');
  $template->stylesheets('calendar');
  $template->scripts('date','calendar','validate');
  $template->begin();
?>

    <div class="box buttons record">

      <div id="search">
        <input type="text" id="search_input" name="search" autofocus="on" />
        <span  id="search_indicator" style="display:none;" /></span>
      </div>

      <form id="record" action="">
        <input type="hidden" id="nuevo" name="nuevo" />
        <fieldset>
          <legend>Datos</legend>
          <ul>
            <li><label for="id">Id</label><input type="text" id="id" class="key" disabled="true" /></li>
            <li><label for="nombre" class="required">Nombre</label><input type="text" id="nombre" name="nombre" /></li>
            <li><label for="apellidos" class="required">Apellidos</label><input type="text" id="apellidos" name="apellidos" /></li>
            <li><label for="nif">NIF</label><input type="text" id="nif" name="nif" class="nif" maxlength="9" /></li>
          </ul>
        </fieldset>
        <fieldset class="expandable">
          <legend>Personal</legend>
          <ul>
            <li><label for="nacimiento">Fecha nacimiento</label>
              <div>
                <input type="text" id="nacimiento" name="nacimiento" class="date calendar" />
                <label for="edad">Edad</label>
                <input type="text" id="edad" name="edad" class="" readonly="true" tabindex="-1" />
              </div>
            </li>
            <li><label for="telefono_particular">Teléfono particular</label>
              <div>
                <input type="text" id="telefono_particular" name="telefono_particular" class="telephone" />
                <label for="telefono_trabajo">Tel. trabajo</label>
                <input type="text" id="telefono_trabajo" name="telefono_trabajo" class="telephone" />
              </div>
            </li>
            <li><label for="correo">Correo</label><input type="text" id="correo" name="correo" class="email" /></li>
            <li><label for="direccion">Dirección</label><input type="text" id="direccion" name="direccion" /></li>
            <li><label for="poblacion">Población</label>
              <div>
                <input type="text" id="poblacion" name="poblacion" />
                <label for="cp">CP</label>
                <input type="text" id="cp" name="cp" class="" maxlength="5" />
              </div>
            </li>
          </ul>
        </fieldset>
        <fieldset class="expandable">
          <legend>Profesional</legend>
          <ul>
            <li><label for="num_colegiado">Número colegiado</label>
              <div>
                <input type="text" id="num_colegiado" name="num_colegiado" class="" />
                <label for="ano_licenciatura">Año licenciatura</label>
                <input type="text" id="ano_licenciatura" name="ano_licenciatura" class="number" maxlength="4" />
              </div>
            </li>
            <li><label>Opciones</label>
              <p>
                <input type="checkbox" id="titulo_mfic" name="titulo_mfic" class="" /><label for="titulo_mfic">Título MFiC</label>
                <input type="checkbox" id="via_mir" name="via_mir" class="" /><label for="via_mir">Vía MIR</label>
                <input type="checkbox" id="propietario_plaza" name="propietario_plaza" class="" /><label for="propietario_plaza">Propietario plaza</label>
              </p>
            </li>
            <li><label for="residente">Residente</label>
              <div>
                <input type="text" id="residente" name="residente" class="" maxlength="2" />
                <label for="ano_inicio_residencia">Año inicio residencia</label>
                <input type="text" id="ano_inicio_residencia" name="ano_inicio_residencia" class="number" maxlength="4" />
              </div>
            </li>
            <li><label for="lugar_trabajo">Lugar trabajo</label><input type="text" id="lugar_trabajo" name="lugar_trabajo" class="" /></li>
          </ul>
        </fieldset>
        <fieldset class="expandable shrink">
          <legend>Notas</legend>
          <textarea id="notas" name="notas"></textarea></li>
        </fieldset>

        <ul class="cmd">
          <li><a id="cmd_new" href="#">Nuevo</a></li>
          <li><a id="cmd_save" href="#">Guardar</a></li>
          <li><a id="cmd_delete" href="#">Borrar</a></li>
          <li><a id="lnk_auto" class="link" href="?id=">Autoenlace</a></li>
        </ul>
      </form>

    </div><!--.box-->


    <div id="detail" class="box expandable right tab_record tab_all">
      <h3>Detalle</h3>

      <div id="tabs_detail" class="tabs">
        <ul>
          <li><a id="tab_grupos" href="#">Grupos</a></li>
        </ul>
      </div><!--.tabs-->

      <form id="grupos_socios" class="grid" style="display:none;" >
        <table>
          <thead>
            <tr>
              <th></th>
              <th name="id_grupo_socio"></th>
              <th name="id_socio"></th>
              <th name="id_grupo"></th>
              <th name="id_grupo_dropdown"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th></th>
              <td><input type="hidden" name="id_grupo_socio" disabled="true" /></td>
              <td><input type="hidden" name="id_socio" /></td>
              <td><input type="hidden" name="id_grupo" /></td>
              <td><input type="text" name="id_grupo_dropdown" class="dropdown" /></td>
              <th><a href="#">Borrar</a></th>
            </tr>
          </tbody>
        </table>
        <p class="buttons">
          <a id="grupos_save" class="cmd_save" href="#">Guardar</a>
        </p>
      </form>


    </div><!--detail-->

    <!--div class="box list ">
      <p class="header"><b></b><b>Nombre</b><b>Apellidos</b><b>NIF</b></p>
      <ul id="list"></ul>
    </div-->

<?php $template->end(); ?>