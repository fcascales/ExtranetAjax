/*
  trabajador.js - proinf.net - agosto-2009

  Requiere: prototype.js, extranet.js, record.js, color.js, validate.js
*/

/* INIT ========================================= */

function init() {

  UserSession.validate();

  $('id_trabajador').observe('change',Trabajador.validar_codigo);

  /*var template = new Template(
    '<li id="id_#{id}" title="#{trabajador} #{apellidos}">#{id}<sup>#{clasificacion}</sup></li>\n'
  );
  Record.afterListPut = function(element, fields) {
    $(element).setStyle({
      backgroundColor: StringColors.getColorFromString(fields['id'])
    });
    if (fields.clasificacion == 0) { $(element).addClassName('off'); }
  };

  Record.init('trabajadores', template, Trabajador.validar,
    [  ],
    {  id_poblacion:'poblaciones' });*/

  var record = new DB.Record('trabajadores', {
    onValidate: Trabajador.validar,
    comboboxes: {id_poblacion:'poblaciones'},
    title: 'Trabajador: #{id_trabajador}'
  });

  var list = new DB.List('trabajadores', {
    link_record: record,
    template: '<li id="#{id}" title="#{trabajador} #{apellidos}">#{id}<sup>#{clasificacion}</sup></li>\n',
    afterItem: Trabajador.item_style
  });

  /*new Ajax.Autocompleter('search_input', 'search_choices', '/server/autocompleter.php', {
    parameters: 'cmd=trabajador',
    indicator: 'search_waiting',
    updateElement: function(li) { record.dbGet(li.id.substring(3)); }
  });*/
  new DB.Dropdown('search_input', 'trabajador', {
    type: 'autocomplete',
    selectElement: function(id) { record.dbGet(id); },
    waiting: 'search_waiting'
  });
}

Event.observe(window,'load', init);

/* TRABAJADOR ----------------------------------- */

var Trabajador = {

  validar: function() {
    Trabajador.validar_codigo();
    $('lnk_cursos').writeAttribute('href', 'curso.html?id_trabajador=' + $F('id'));
    $('lnk_clases').writeAttribute('href', 'clase.html?id_trabajador=' + $F('id'));
  },

  validar_codigo: function() {
    $('id_trabajador').value = $F('id_trabajador').toUpperCase();
    $('id_trabajador').setStyle({
      backgroundColor: Pseudorandom.getColorFromString($F('id_trabajador'))
    });
  },

  item_style: function(element, fields) {
    $(element).setStyle({
      backgroundColor: StringColors.getColorFromString(fields['id'])
    });
    if (fields.clasificacion == 0) { $(element).addClassName('off'); }
  }

}; // Trabajador

/* */
