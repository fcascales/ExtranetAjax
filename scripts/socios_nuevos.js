/*
  socios_nuevos.js

  Requiere: prototype.js, extranet.js, record.js
*/

/* SOCIOS NUEVOS ---------------------------------------- */

var SociosNuevos = {

  init: function() {

    UserSession.validate();

    SociosNuevos.table = new DB.Table('socios_nuevos', {
      links:{socio:'socio.php?id=#{id_socio}'}
    }).getData();

  } // init

}; // SociosNuevos

/* ---------------------------------------------- */

Event.observe(window,'load', SociosNuevos.init);

/* */