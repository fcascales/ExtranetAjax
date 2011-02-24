/*
  bancos.js

  Requiere: prototype.js, extranet.js, record.js
*/

/* BANCOS --------------------------------------- */

var Bancos = {

  init: function() {
    UserSession.validate();

    Bancos.bancos = new DB.Grid('bancos', {
      commands:{save:'bancos_save'}
    });

    Bancos.formas_pago = new DB.Grid('formas_pago', {
      commands:{save:'formas_pago_save'}
    });
  }

}; // Bancos

/* ---------------------------------------------- */

Event.observe(window,'load', Bancos.init);

/* */