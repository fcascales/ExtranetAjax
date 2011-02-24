<?php
  require_once('template.php');
  $template = new Template('Correo masivo');
  $template->stylesheets('fileuploader','dir');
  $template->scripts('date','calendar','validate','textilize','fileuploader');
  $template->begin();
?>

<div id="container">

  <div class="box buttons record">

    <form id="record" action="">
      <input type="hidden" id="id" name="id" />
      <input type="hidden" id="fecha_alta" name="fecha_alta" />
      <fieldset>
        <legend>Correo</legend>
        <ul>
          <!--li>
            <label for="id">Id</label>
            <input type="text" id="id" name="id" class="key" disabled="true" />
          </li-->
          <li>
            <label for="destinatario" class="required" >Destinatario</label>
            <textarea id="destinatario" name="destinatario" rows="1" spellcheck="false" title="En cada línea un destinatario"></textarea>
          </li>
          <li>
            <label for="asunto" class="required">Asunto</label>
            <textarea id="asunto" name="asunto" rows="2" ></textarea>
          </li>
          <li>
            <label for="adjunto">Adjunto</label>
            <div>
              <textarea id="adjunto" name="adjunto" rows="1" spellcheck="false" readonly="true"></textarea>
              <div id="file-uploader">
                <noscript>
                  <p class="msg error">No se puede subir archivos si Javascript está desactivado.</p><!-- or put a simple form for upload here -->
                </noscript>
              </div>
              <!--div id="file-uploader">
                <div class="qq-uploader">
                  <div style="display:none;" class="qq-upload-drop-area"><span>Arrastra un archivo aquí para subirlo</span></div>
                  <div style="position:relative; overflow: hidden; direction: ltr;" class="qq-upload-button">Sube un archivo
                    <input style="position: absolute; right: 0pt; top: 0pt; font-family: Arial; font-size: 118px; margin: 0pt; padding: 0pt; cursor: pointer; opacity: 0;" name="file" multiple="multiple" type="file">
                  </div>
                  <ul class="qq-upload-list">
                    <li class=" qq-upload-success">
                      <span class="qq-upload-file">Firefox_wallpaper.png</span>
                      <span style="display: inline;" class="qq-upload-size">3.0MB</span>
                      <span class="qq-upload-failed-text">Fallo</span>
                    </li>
                  </ul>
                </div>
              </div-->
            </div>
          </li>
        </ul>
      </fieldset>
      <fieldset class="expandable">
        <legend>Mensaje</legend>
        <textarea id="mensaje" name="mensaje" rows="20" ></textarea></li>
      </fieldset>

      <ul class="cmd">
        <li><a id="cmd_send" href="#">Enviar</a></li>
        <li><a id="cmd_new" href="#">Nuevo</a></li>
        <li><a id="cmd_save" href="#">Guardar borrador</a></li>
        <li><a id="cmd_delete" href="#">Borrar</a></li>
      </ul>
    </form>

  </div><!--.box-->


  <div class="box browse">
    <h2>Borradores y correos enviados</h2>
    <ul id="list">
      <li class="header"><b></b><b>Id</b><b>Destinatario</b><b>Asunto</b><b>Fecha</b><b>Envíado</b></li>
    </ul>
  </div>

  <div class="box">
    <fieldset id="help" class="expandable shrink">
      <legend>Ayuda</legend>
      <h3>Campo Destinatario</h3>
      <p>Pulsa <kbd>Enter</kbd> para indicar varios destinatarios</p>
      <h3>Campo Mensaje <sup><small>Textile</small></sup></h3>
      <p>Los párrafos se separan con líneas en blanco</p>
      <p><b>*</b>negrita<b>*</b></p>
      <p><b>_</b>cursiva<b>_</b></p>
      <p><b>* </b>lista de viñetas</p>
      <p><b># </b>lista numerada</p>
      <p><b>"</b>enlace<b>":</b>http://&hellip;</p>
      <p><b>!</b>imagen<b>!</b></p>
      <p><b>h1. </b>Encabezado</p>
      <p><b>h2. </b>Subencabezado</p>
      <p><b>|</b>celda<b>|</b>celda<b>|</b>
      <!--p><a href="http://textile.thresholdstate.com/" target="_blank">Más ayuda</a></p-->
    </fieldset>
  </div>

</div><!--#container-->

<div id="background_popup" style="display:none;"></div><!--#background_popup-->
<div id="container_popup" style="display:none;">
  <div id="popup">

    <h1>Revisión del correo</h1>
    <div>
      <fieldset>
        <legend>Destinatario</legend>
        <ul id="correo_destinatario"></ul>
      </fieldset>
      <fieldset>
        <legend>Asunto</legend>
        <span id="correo_asunto">Asunto</span>
      </fieldset>
      <fieldset>
        <legend>Adjunto</legend>
        <ul id="correo_adjunto" class="dir"></ul>
      </fieldset>
      <fieldset>
        <legend>Mensaje</legend>
        <div id="correo_mensaje">
          <p>Mensaje</p>
        </div>
      </fieldset>
    </div>

    <ul class="buttons">
      <li><a id="cmd_ok" href="#">Confirmar envío</a></li>
      <li><a id="cmd_cancel" href="#">Cancelar</a></li>
    </ul>

  </div><!--#popup-->
</div><!--#container_popup-->



<?php $template->end(); ?>