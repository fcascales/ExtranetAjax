/*
  pagos.js

  Requiere: prototype.js, extranet.js, record.js
*/

/* PAGOS ---------------------------------------- */

var Pagos = {

  init: function() {
    var date = new Date();

    $('month').observe('change', Pagos.change_filters.bindAsEventListener(this));
    $('year').observe('change', Pagos.change_filters.bindAsEventListener(this));
    $('trabajador').observe('change', Pagos.change_filters.bindAsEventListener(this));
    $('curso').observe('change', Pagos.change_filters.bindAsEventListener(this));
    $('banco').observe('change', Pagos.change_filters.bindAsEventListener(this));

    $('month').value = date.getMonth()+1;
    DB.combobox('year','años',{ callback:function(combobox) {  $(combobox).value = date.getFullYear(); } });
    DB.combobox('trabajador','trabajadores',{ callback:function(combobox) { $(combobox).value = ''; } });
    //DB.combobox('curso','cursos',{ callback:function(combobox) { $(combobox).value = ''; } });
    DB.combobox('banco','bancos',{ callback:function(combobox) { $(combobox).value = ''; } });

    Pagos.grid = new DB.Grid('pagos', {
      filters: {
        month:  date.getMonth()+1,
        year: date.getFullYear(),
        trabajador: '%',
        curso: '%',
        banco: '%'
      },
      onCalcRow: Pagos.onCalcRow,
      dropdowns: {
        id_trabajador: 'trabajadores',
        id_curso: 'cursos',
        id_banco_dropdown: 'bancos'        
      },
      orientation: 'top'
    });

    Pagos.today = date.getOnlyDate();

  }, // init


  change_filters: function() {
    var like = function(value) {
      return value==''? '%': value;
    };
    Pagos.grid.dbLoad({
      month: like($F('month')),
      year:  like($F('year')),
      trabajador: like($F('trabajador')),
      curso: like($F('curso')),
      banco: like($F('banco'))      
    });
  },


  onCalcRow: function(fields, tr) {
    var date = fields['fecha'].parseDateTime();
    if (date == null) {
      tr.removeClassName('off');
    }
    else {
      if (date < Pagos.today) tr.addClassName('off');
      else tr.removeClassName('off');
    }
    return fields;
  },

}; // Pagos

/* ---------------------------------------------- */

Event.observe(window,'load', Pagos.init);

/* */