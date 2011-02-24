/*
  statistics.js

  Requiere: prototype.js, extranet.js, record.js
*/

/* STATISTICS ----------------------------------- */

var Statistics = {

  init: function() {
    UserSession.validate();

    $('year').observe('change', Statistics.change_year.bindAsEventListener(this));

    DB.combobox('year','clases-años',{ callback:function(combobox) {
      $(combobox).value = (new Date()).getFullYear();
    } });

    var filter = {year:(new Date()).getFullYear()};
    Statistics.table = new DB.Table('estadistica-clases');
    Statistics.table.getData(filter);

  }, // init

  change_year: function() {
    Statistics.table.getData({year:$F('year')});
  }

};

/* ---------------------------------------------- */

Event.observe(window,'load', Statistics.init);

/* */