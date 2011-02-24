/*
  socio.js - proinf.net - agosto-2009

  Requiere: prototype.js, extranet.js, record.js, validate.js
*/

/* INIT ========================================= */

function init() {

  UserSession.validate();

  $('nacimiento').observe('change', Socio.calcEdad);

  $('record').select('input.telephone').each (function(element) {
    element.observe('change', function() {
      Validate.correction(this,'phone');
    })
  });

  Socio.record = new DB.Record('socios', {
    onValidate: Socio.onValidate,
    title: 'Socio: #{nombre} #{apellidos}',
    dropdowns: {
      residente:'R1 R2 R3 R4'.split(' ')
    }
  });

  /*if (Util.queryString('id') == null) {
    Socio.list = new DB.List('socios', {
      link_record: Socio.record,
      template: '<li id="#{id}"><span class="status"></span><span>#{nombre}</span><span>#{apellidos}</span><span>#{nif}</span></li>\n',
      urlFilters: ['id_socio']
    });
  }*/

  new DB.Dropdown('search_input', 'socio', {
    type: 'autocomplete',
    selectElement: function(id) { Socio.record.dbGet(id); },
    waiting: 'search_waiting'
  });

  Socio.tabs = new Interface.Tabs('tabs_detail', {targets:['grupos_socios']});

  Socio.grupos = new DB.Grid('grupos_socios', {
    link_record: Socio.record,
    datalink: {master:'id', slave:'id_socio'},
    commands: {save:'grupos_save'},
    dropdowns: { id_grupo_dropdown: 'grupos' },
    data:[]
  });
}

Event.observe(window,'load', init);

/* Socio ----------------------------------- */

var Socio = {

  onValidate: function(fields) {
    $('lnk_auto').writeAttribute('href', '?id=' + $F('id'));
    Socio.calcEdad();
    if ($('nuevo').value == 1) {
      $('nuevo').value = 0; // Si se guarda que deje de estar marcado como nuevo (Hazte socio)
      $('nuevo').addClassName('dirty');
    }
  },

  calcEdad: function() {
    var nacimiento = new Date($F('nacimiento'));
    var hoy = new Date();
    var edad = hoy.getFullYear() - nacimiento.getFullYear();
    var cumple = new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate());
    if (cumple.getTime() > hoy.getTime()) edad--;
    $('edad').value = isNaN(edad)? '':edad + ' años';
  }

}; // Socio

/* */
