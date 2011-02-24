/*
  bandera.js - proinf.net - diciembre-2009

  Requiere: prototype.js, extranet.js, record.js
*/

/* INIT ========================================= */

function init() {

  UserSession.validate();

  var record = new DB.Record('mundo_banderas', {
    //comboboxes: {tipo:'tipos'},
    title: 'Bandera: #{pais}',
    dropdowns: {
      tipo:'mundo_tipos',
      continente:'mundo_continentes',
      gobierno:'mundo_gobiernos'
    }
  });

  var list = new DB.List('mundo_banderas', {
    link_record: record,
    template: '<li id="#{id}" title="#{oficial}">#{pais}</li>\n'
  });

  new DB.Dropdown('search_input', 'mundo_bandera', {
    type: 'autocomplete',
    selectElement: function(id) { record.dbGet(id); },
    waiting: 'search_waiting'
  });
}

Event.observe(window,'load', init);

/* BANDERA -------------------------------------- */

var Bandera = {


}; // Bandera

/* */
