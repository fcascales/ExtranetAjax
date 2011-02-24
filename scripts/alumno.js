/*
  alumno.js - proinf.net - agosto-2009

  Requiere: prototype.js, extranet.js, record.js, color.js, validate.js
*/

/* INIT ========================================= */

function init() {

  UserSession.validate();

  Alumno.record = new DB.Record('alumnos', {
    onValidate: Alumno.onValidate,
    title: 'Alumno: #{alumno} #{apellidos}'
  });

  if (Util.queryString('id') == null) {

    Alumno.list = new DB.List('alumnos_cursos', {
      link_record: Alumno.record,
      template: '<li id="#{id}"><span class="status"></span><span>#{alumno}</span><span>#{apellidos}</span><span>#{id_curso}</span></li>\n',
      urlFilters: ['id_curso']
    });

  }

  new DB.Dropdown('search_input', 'alumno', {
    type: 'autocomplete',
    selectElement: function(id) { Alumno.record.dbGet(id); },
    waiting: 'search_waiting'
  });

  Alumno.tabs = new Interface.Tabs('tabs_detail', {targets:['alumnos_cursos']});


    Alumno.cursos = new DB.Grid('alumnos_cursos', {
      link_record: Alumno.record,
      datalink: {master:'id', slave:'id_alumno'},
      commands: {save:'cursos_save'},
      data:[]
    });



}

Event.observe(window,'load', init);

/* ALUMNO ----------------------------------- */

var Alumno = {

  onValidate: function() {
    $('lnk_auto').writeAttribute('href', '?id=' + $F('id'));
  }


}; // Alumno

/* */
