/*
  login.js - proinf.net - agosto-2009

  Mensajes para la conectar al usuario en la sesión

  Requiere: prototype.js y md5.js
*/

/* init ----------------------------------------- */

function init() {
  UserSession.validate();

  $('old_password').focus();

  $('form').observe('submit', FormPassword.connect);


}

Event.observe(window,'load', init);

/* ---------------------------------------------- */

var FormPassword = {

  connect: function(event) {
    Event.stop(event);

    Msg.hide();

    if ($F('old_password') == '') {
      Msg.warning('Aviso','Es obligatorio introducir la contraseña antigua');
      return;
    }
    else if ($F('new_password1').length < 10) {
      Msg.warning('Aviso','La contraseña debería tener al menos 10 caracteres');
      return;
    }
    else if ($F('new_password1') != $F('new_password2')) {
      Msg.error('Aviso','Las dos entradas de la nueva contraseña deberían ser iguales');
      return;
    }
    else if ($F('new_password1') == $F('old_password')) {
      Msg.warning('Aviso','La contraseña antigua no debería ser igual a la nueva');
      return;
    }

    var parameters = {
      'cmd': 'password',
      'old': MD5($F('old_password')),
      'new': MD5($F('new_password1')),
    };
    Extranet.request(parameters, function(json) {
      if (json.ok == true) {
        Msg.ok('Correcto','La contraseña ha sido cambiada');
      }
      else {
        Msg.error('Error',json.message);
      }
    });
  }

} // FormPassword

/* */
