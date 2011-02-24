/*
  login.js - proinf.net - agosto-2009

  Mensajes para la conectar al usuario en la sesión

  Requiere: prototype.js y md5.js
*/

/* init ----------------------------------------- */

function init() {

  $('user').focus();
  $('waiting').hide();

  $('login').observe('submit', UserLogin.connect);

  UserLogin.init();
}

Event.observe(window,'load', init);

/* ---------------------------------------------- */

var UserLogin = {

  random: '',

  init: function() {
    var parameters = {
      cmd: 'random'
    }
    Extranet.request(parameters, function(json) {
      if (json.ok == true) {
        UserLogin.random = json.random;
        ////$('body').insert('random='+UserLogin.random+'<br />');
      }
    });
  },

  connect: function(event) {
    Event.stop(event);

    var hashed = MD5($F('password')).toLowerCase();
    var ticket = MD5(hashed + UserLogin.random).toLowerCase();
    var remember = $F('remember') != null;
    var captcha = ''; //$F('captcha');
    ////$('password').value = '';
    Msg.hide();
    ////$('body').insert('hashed='+hashed+'\nrandom='+UserLogin.random+'\nticket='+ticket+'<br />');
    var parameters = {
      cmd: 'login',
      user: $F('user'),
      ticket: ticket,
      remember: remember,
      captcha: captcha
    };
    Extranet.request(parameters, function(json) {
      if (json.ok == true) {
        Msg.ok('Acceso concedido');
        location.href = '/extranet/';
      }
      else {
        UserLogin.random = json.random;
        Msg.warning(json.message); // Acceso denegado
        ////$('body').insert('random='+UserLogin.random+'<br />');
      }
    });
  }

} // Login

/* */
