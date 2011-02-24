/*
  citas.js

  Requiere: prototype.js, extranet.js, record.js
*/

/* CITAS ---------------------------------------- */

var Citas = {

  init: function() {
    UserSession.validate(function() {
      Citas.grid.byDefault.usuario = UserSession.user.toUpperCase();
    });

    var date = new Date();

    $('user').observe('change', Citas.change_filters.bindAsEventListener(this));
    $('year').observe('change', Citas.change_filters.bindAsEventListener(this));
    $('month').observe('change', Citas.change_filters.bindAsEventListener(this));

    DB.combobox('user','citas-usuarios',{ callback:function(combobox) { $(combobox).value = ''; } });
    DB.combobox('year','citas-años',{ callback:function(combobox) {  $(combobox).value = date.getFullYear(); } });
    $('month').value = date.getMonth()+1;

    Citas.grid = new DB.Grid('citas', {
      filters: {
        user: '%',
        year: date.getFullYear(),
        month:  date.getMonth()+1
      },
      //afterAddRow: Citas.afterAddRow,
      //afterChange: Citas.afterChange,
      onCalcRow: Citas.onCalcRow,
      dropdowns: {
        usuario: 'trabajadores'
      },
      orientation: 'top'
    });

    Citas.today = date.getOnlyDate();

  }, // init


  change_filters: function() {
    var like = function(value) {
      return value==''? '%': value;
    };
    Citas.grid.dbLoad({
      user:  like($F('user')),
      year:  like($F('year')),
      month: like($F('month'))
    });
  },

  /*change_year: function() {
    Citas.grid.dbLoad({year:$F('year')});
  },*/

  onCalcRow: function(fields, tr) {
    var date = fields['fecha'].parseDateTime();
    if (date == null) {
      tr.removeClassName('off');
    }
    else {
      if (date < Citas.today) tr.addClassName('off');
      else tr.removeClassName('off');
    }
    return fields;
  },

  /*afterAddRow: function(row) {
    ////Validate.automatic(row);
    ////Calendar.automatic(row);

    Citas.markPastDate(row.select('input[name=fecha]')[0]);
  },
  afterChange: function(input) {
    Citas.markPastDate(input);
  },

  markPastDate: function(input) {
    var date = input.value.parseDateTime();
    var tr = input.up(1);
    if (date < Citas.today) tr.addClassName('on');
    else tr.removeClassName('on');
  }*/

}; // Festivos

/* ---------------------------------------------- */

Event.observe(window,'load', Citas.init);

/* */