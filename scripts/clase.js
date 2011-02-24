/*
  clase.js - proinf.net - agosto-2009

  Requiere: prototype.js, extranet.js, record.js, color.js, validate.js
*/

/* INIT ========================================= */

function init() {

  UserSession.validate();

  $('fecha').observe('change', Clase.calc_date);
  $('hora_inicio').observe('change', Clase.calc_time);
  $('duracion').observe('change', Clase.calc_time);

  /*var template = new Template(
    '<li id="id_#{id}"><img /><code><em>#{num_clase}</em>/#{total_clases}</code><em title="#{curso}">#{id_curso} - #{id_materia}</em><code>#{num_semana}º</code><span>#{dia_semana} #{fecha_clase} de #{hora_inicio} a #{hora_fin}</span><code>#{duracion}</code><strong>#{id_trabajador}</strong></li>\n'
  );
  Record.init('clases', template, Clase.validar,
    ['id_trabajador','id_curso', 'id_cliente'],
    {id_trabajador:'trabajadores', id_materia:'materias'});*/

  var record = new DB.Record('cursos_clases', {
    onValidate: Clase.validar,
    comboboxes: {id_trabajador:'trabajadores', id_materia:'materias'}
  });
  var list = new DB.List('cursos_clases', {
    link_record: record,
    template: '<li id="#{id}"><span class="status"></span><img /><code><em>#{num_clase}</em>/#{total_clases}</code><em title="#{curso}">#{id_curso} - #{id_materia}</em><code>#{num_semana}º</code><span>#{dia_semana} #{fecha_clase} de #{hora_inicio} a #{hora_fin}</span><code>#{duracion}</code><strong>#{id_trabajador}</strong><span>#{sesion}</span></li>\n',
    urlFilters: ['id_trabajador','id_curso','id_cliente']
  });

   /*new Ajax.Autocompleter('search_input', 'search_choices', '/server/autocompleter.php', {
    parameters: 'cmd=clase',
    indicator: 'search_indicator',
    updateElement: function(li) { record.dbGet(li.id.substring(3)); }
  }); */
}

Event.observe(window,'load', init);

/* ---------------------------------------------- */

var Clase = {

  validar: function() {
    $('lnk_curso').writeAttribute('href', 'curso.html?id=' + $F('id_curso'));
    $('lnk_print').writeAttribute('href', '/server/config/pdf.php?cmd=hoja-horas&id=' + $F('id'));
  },

  calc_date: function(event) { // Calcula día de la semana y número de semana
    var date = $F('fecha').parseDateTime();
    if (date != null) {
      $('dia_semana').value = date.getWeekdayName().toLowerCase();
      $('num_semana').value = date.getWeekOfYear();
    }
  },

  calc_time: function(event) { // Calcula la hora final
    var inicio_numbers = Validate.extractNumbers($F('hora_inicio'));
    var duracion = $F('duracion');
    if (inicio_numbers.length >= 1 && isNaN(duracion) == false) {
      var time = new Date(0,0,0);
      time.setHours(inicio_numbers[0]);
      if (inicio_numbers.length >= 2) {
        time.setMinutes(inicio_numbers[1]);
      }
      time.setMinutes(time.getMinutes()+parseInt(duracion*60,10));
      $('hora_fin').value =
        Validate.rightzeros(time.getHours(),2) + ':' +
        Validate.rightzeros(time.getMinutes(),2);
    }
  }

}; // Clase

/* */
