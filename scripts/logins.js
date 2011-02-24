/*
  logins.js

  Requiere: prototype.js, extranet.js, record.js
*/

/* LOGINS --------------------------------------- */

var Logins = {


  init: function() {

    UserSession.validate();

    $('num_page').observe('change', Logins.change_page);

    Logins.table = new DB.Table('logins', {page_size:25, onLoad: Logins.onLoad});
    Logins.change_page();

  }, // init

  onLoad: function(num_page, total_pages) {
    var options = '<option>' + $A($R(1,total_pages)).join('</option><option>') + '</option>';
    $('num_page').update(options);
    $('num_page').value = num_page;
  },

  change_page: function() {
    Logins.table.getData({/*filters*/}, {num_page: $F('num_page')});
  }

};

/* ---------------------------------------------- */

Event.observe(window,'load', Logins.init);

/* */