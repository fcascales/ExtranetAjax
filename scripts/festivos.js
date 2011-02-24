/*
  festivos.js

  Requiere: prototype.js, extranet.js, record.js
*/

/* FESTIVOS ------------------------------------- */

var Festivos = {

  init: function() {
    UserSession.validate();

    $('year').observe('change', Festivos.change_year.bindAsEventListener(this));

    DB.combobox('year','festivos-años',{ callback:function(combobox) {
      $(combobox).value = (new Date()).getFullYear();
    } });

    Festivos.grid = new DB.Grid('festivos', {
      filters: {year:(new Date()).getFullYear()},
      ////afterAddRow: Festivos.afterAddRow,
      dropdowns: {descripcion: 'festivos-descripciones'},
      orientation: 'top'
    });

    /*this.grid.putData([
      {id_festivo:100, fecha:'2009-01-02', descripcion:'Hola'},
      {id_festivo:102, fecha:'2009-03-22', descripcion:'Pepe'},
      {id_festivo:103, fecha:'2009-04-13', descripcion:'Ana'},
      {id_festivo:104, fecha:'2009-06-16', descripcion:'Hola'},
      {id_festivo:105, fecha:'2009-07-07', descripcion:'Pepe'},
      {id_festivo:106, fecha:'2009-08-15', descripcion:'Ana'},
      {id_festivo:107, fecha:'2009-09-09', descripcion:'Hola'},
      {id_festivo:108, fecha:'2009-10-06', descripcion:'Pepe'},
      {id_festivo:109, fecha:'2009-11-11', descripcion:'Ana'}
    ]);*/
  }, // init


  change_year: function() {
    Festivos.grid.dbLoad({year:$F('year')});
  },

  /*afterAddRow: function(row) {
    Validate.automatic(row);
    Calendar.automatic(row);
  }*/

}; // Festivos

/* ---------------------------------------------- */

Event.observe(window,'load', Festivos.init);

/* */