/*
  agenda.js

  Requiere: prototype.js, extranet.js, record.js
*/

/* AGENDA ----------------------------------- */

var Agenda = {

  init: function() {
    UserSession.validate();

    $('filtro').observe('change', Agenda.change_filter.bindAsEventListener(this));
    $('buscar').observe('click', Agenda.change_filter.bindAsEventListener(this));

    var filtro = {filtro:''};
    Agenda.table = new DB.Table('agenda', {
      links:{
        nombre:'#{class}.html?id=#{id}',
        correo:'mailto:#{correo}'
      }
    });
    Agenda.table.getData(filtro);
    
    $('filtro').focus();

  }, // init

  change_filter: function() {
    var like = function(value) {
      if (value == '') return '';
      else if (value.indexOf('%') != -1) return value;
      else return '%'+value.replace(/[ -]/g,'%')+'%';
    };
    var filtro = like($F('filtro'));
    Msg.flashInfo('Filtro',filtro);
    Agenda.table.getData({filtro:filtro});
  }

};

/* ---------------------------------------------- */

Event.observe(window,'load', Agenda.init);

/* */