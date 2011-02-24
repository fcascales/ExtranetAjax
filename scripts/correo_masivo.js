/*
  correo_masivo.js — proinf.net — feb-2011

  Requiere: prototype.js, extranet.js, record.js
*/

/* CORREO MASIVO -------------------------------- */

var CorreoMasivo = {

  init: function() {
    UserSession.validate();

    $('cmd_send').observe('click', CorreoMasivo.sendMailStep1);
    $('destinatario').observe('change', CorreoMasivo.adjustNumRows);
    $('cmd_ok').observe('click', CorreoMasivo.sendMailStep3);
    $('cmd_cancel').observe('click', CorreoMasivo.sendMailCancel);

    CorreoMasivo.record = new DB.Record('correos_masivos', {
      onValidate: CorreoMasivo.onValidate,
      title: 'Correo masivo: #{asunto}',
      dropdowns: {
        destinatario: 'destinatarios'
      }
    });

    CorreoMasivo.list = new DB.List('correos_masivos', {
      link_record: CorreoMasivo.record,
      template: '<li id="#{id}"><span class="status"></span><code>#{id}</code><em>#{destinatario}</em><strong>#{asunto}</strong><sup>#{fecha}</sup><span class="#{enviado}">#{enviado}</span></li>\n'
    });

    CorreoMasivo.uploader = new qq.FileUploader({
        // pass the dom node (ex. $(selector)[0] for jQuery users)
        element: document.getElementById('file-uploader'),
        // path to server-side upload script
        action: 'server/fileuploader.php'
    });

  }, // init

  onValidate: function() {
    CorreoMasivo.adjustNumRows();
    CorreoMasivo.attachmentToUploaderList();

    var yaEnviado = $F('fecha_alta') != '';
    if (yaEnviado) { $('cmd_save').hide(); /* $('cmd_delete').hide();*/ }
    else           { $('cmd_save').show(); /* $('cmd_delete').show();*/ }
  },

  attachmentToUploaderList: function() {
  // Recoge los archivos de textarea#adjunto y los coloca en ul.qq-upload-list
    var selected = $('file-uploader').select('ul.qq-upload-list');
    if (selected.length > 0) {
      var ul = selected[0];
      ul.update('');
      var files = $F('adjunto').split("\n");
      files.each(function(item) {
        if (item != "") {
          ul.insert('<li class="qq-upload-success"><span class="qq-upload-file">'+item+"</span></li>\n");
        }
      });
    }
  },

  uploaderListToAttachment: function() {
  // Recoge los archivos del ul.qq-upload-list y los pone en el textarea#adjunto
    $('adjunto').addClassName('dirty').value = '';
    var files = $('file-uploader').select('li.qq-upload-success span.qq-upload-file');
    files.each (function(item) {
      $('adjunto').value += item.innerHTML + "\n";
    });
  },

  reload: function() {
    CorreoMasivo.list.dbList();
    if ($F('id') != '') CorreoMasivo.record.dbGet($F('id'));
  },

  adjustNumRows: function() { // http://www.codecodex.com/wiki/Count_the_number_of_occurrences_of_a_specific_character_in_a_string
    var numNewLines = $F('destinatario').length - $F('destinatario').replace(/\n/g,'').length;
    $('destinatario').rows = numNewLines + 1;
  },

  sendMailStep1: function(event) { // Comprobar datos y guardar
    if ($F('destinatario')=='' || $F('asunto')=='' || $F('mensaje')=='') {
      return Msg.flashWarning('Los campos destinatario, asunto y mensaje son obligatorios');
    }
    else {
      CorreoMasivo.uploaderListToAttachment();
      /*---*/
      var ONuevoOEnviado = $F('id') == '' || $F('fecha_alta') != '';
      if (ONuevoOEnviado) { // Crear un nuevo registro
        $('id').value = '';
        $('destinatario').addClassName('dirty');
        $('asunto').addClassName('dirty');
        $('adjunto').addClassName('dirty');
        $('mensaje').addClassName('dirty');
        CorreoMasivo.record.dbInsert ({callback:CorreoMasivo.sendMailStep2});
      }
      else/*---*/ { // Probar de guardar y sino hace falta ir de todas formas al paso 2
        if (!CorreoMasivo.record.dbUpdate ({callback:CorreoMasivo.sendMailStep2})) {
          CorreoMasivo.sendMailStep2();
        }
      }
    }
  }, // sendMailStep1

  sendMailStep2: function() { // Después de guardar mostrar el div popup para pedir confirmación del envío
    Msg.flashHide();
    var destinatario = '<li>'+$F('destinatario').stripTags().replace(/\n/g,'</li><li>')+'</li>';
    var asunto = $F('asunto').stripTags();
    var adjunto = '<li>'+$F('adjunto').stripTags().replace(/\n/g,'</li><li>')+'</li>';
    var mensaje = textilize($F('mensaje')); //'<p>'+$F('mensaje').stripTags().replace(/\n\n/g,'</p><p>')+'</p>';
    $('correo_destinatario').update(destinatario);
    $('correo_asunto').update(asunto);
    $('correo_adjunto').update(adjunto);
    $('correo_mensaje').update(mensaje);
    $('correo_adjunto').select('li').each(function(item) {
      var file = item.innerHTML;
      if (file != '') item.update('<a target="file" href="uploads/'+file+'">'+file+'</a>');
    });
    Interface.popup(true);
    $('cmd_ok').show();
    $('cmd_cancel').show();
    CorreoMasivo.getTextile();
  },

  sendMailStep3: function(event) { // Confirmado el envío
    Event.stop(event);
    $('cmd_ok').hide();
    $('cmd_cancel').hide();
    var parameters = {
      cmd: 'massmail',
      id: $F('id')
    };
    Extranet.request(parameters, function(json) { // json: {ok,message,date}
      if (json.ok == true) {
        CorreoMasivo.record.dbGet($F('id'));
        Msg.ok('Correo', json.message);
        //$('fecha_alta').value = json.date; CorreoMasivo.onValidate();
        CorreoMasivo.reload();
      }
      else {
        Msg.error('Correo', json.message);
      }
      Interface.popup(false);
    }.bind(this), 'server/mail.php');

  }, // sendMailStep3

  sendMailCancel: function(event) { // En el div popup
    Event.stop(event);
    Interface.popup(false);
  },

  getTextile: function(event) { // Textile PHP overwrites textile JS
    var parameters = {
      cmd: 'textile',
      id: $F('id')
    };
    Extranet.request(parameters, function(json) { // json: {ok,message,date}
      if (json.ok == true) {
        $('correo_mensaje').update(json.message);
      }
    }.bind(this), 'server/mail.php');

  } // sendMailStep3


}; // CorreoMasivo

/* ---------------------------------------------- */

Event.observe(window,'load', CorreoMasivo.init);
//Event.observe(window,'focus', CorreoMasivo.reload); // Ocurre tras cargar la página o al volver desde otra página

/* */