/*
  statistics.js

  Requiere: prototype.js, extranet.js, record.js
*/

/* STATISTICS ----------------------------------- */

var Statistics = {

  init: function() {
    UserSession.validate();

    var date = new Date();

    $('customer').observe('change', Statistics.change_filters.bindAsEventListener(this));
    $('year').observe('change', Statistics.change_filters.bindAsEventListener(this));
    $('month').observe('change', Statistics.change_filters.bindAsEventListener(this));

    DB.combobox('customer','clientes',{ callback:function(combobox) {
      $(combobox).value = '';
    } });
    DB.combobox('year','cobros-años',{ callback:function(combobox) {
      $(combobox).value = (new Date()).getFullYear();
    } });
    $('month').value = date.getMonth()+1;

    Statistics.table = new DB.Table('estadistica-cobros');
    Statistics.table.getData({
      customer: '%',
      year:     date.getFullYear(),
      month:    date.getMonth()+1
    });

  }, // init

  change_filters: function() {
    var like = function(value) {
      return value==''? '%': value;
    };
    Statistics.table.getData({
      customer: like($F('customer')),
      year:     like($F('year')),
      month:    like($F('month'))
    });
  }

};

/* ---------------------------------------------- */

Event.observe(window,'load', Statistics.init);

/* */