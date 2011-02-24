/*
  poblaciones.js

  Requiere: prototype.js, extranet.js, record.js
*/

/* POBLACIONES ---------------------------------- */

var Poblaciones = {

  init: function() {
    UserSession.validate();

    Poblaciones.grid = new DB.Grid('poblaciones', {
      dropdowns: {
        provincia: 'poblaciones-provincias'
      }
    });
  }

}; // Bancos

/* ---------------------------------------------- */

Event.observe(window,'load', Poblaciones.init);

/* */