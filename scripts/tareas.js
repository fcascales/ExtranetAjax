/*
  tareas.js

  Requiere: prototype.js, extranet.js, record.js
*/

/* TAREAS ---------------------------------------- */

var Tareas = {

  init: function() {
    UserSession.validate(function() {
      Tareas.grid.byDefault.id_usuario = UserSession.user.toUpperCase();
    });

    $('year').observe('change', Tareas.change_year_finish.bindAsEventListener(this));
    $('finish').observe('change', Tareas.change_year_finish.bindAsEventListener(this));

    DB.combobox('year','tareas-años',{ callback:function(combobox) {
      $(combobox).value = (new Date()).getFullYear();
    } });

    Tareas.grid = new DB.Grid('tareas', {
      filters: {
        year: (new Date()).getFullYear(),
        finish: 0
      },
      ////afterAddRow: Tareas.afterAddRow,
      dropdowns: {
        id_usuario: 'trabajadores',
        prioridad: [0,1,2,3,4,5,6,7,8,9],
        acabada_dropdown: {'0':'no', '-1':'sí'}
      },
      byDefault: {
        prioridad: 0,
        acabada: 0,
      },
      orientation: 'top'
    });

  }, // init


  change_year_finish: function() {
    Tareas.grid.dbLoad({
      year: $F('year'),
      finish: $F('finish')
    });
  }

  /*afterAddRow: function(row) {
    Validate.automatic(row);
    Calendar.automatic(row);
  }*/

}; // Tareas

/* ---------------------------------------------- */

Event.observe(window,'load', Tareas.init);

/* */