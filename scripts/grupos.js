/*
  grupos.js — proinf.net — feb-2011

  Requiere: prototype.js, extranet.js, record.js
*/

/* GRUPOS ---------------------------------------- */

var Grupos = {

  init: function() {

    UserSession.validate();

    $('cmd_mails').observe('click', Grupos.showMails);

    Grupos.grid = new DB.Grid('grupos', {
      dropdowns: {
        id_responsable_dropdown:'socios'
      },
      orientation: 'bottom',
      onSelectRow: Grupos.selectRow
    });

    Grupos.table = new DB.Table('grupos_socios', {
      tags:['DIV','SPAN','SPAN','SPAN'],
      links:{socio:'socio.php?id=#{id_socio}'}
    });

  }, // init

  id_grupo: 0,

  selectRow: function(fields) {
    Grupos.id_grupo = fields.id_grupo;
    Grupos.table.getData({id_grupo:fields.id_grupo});
    $('grupo').update(fields.grupo);
    if (fields.grupo) {
      var query = Object.toQueryString({ id_grupo:fields.id_grupo, grupo:fields.grupo });
      Util.popup('cmd_mails', 'mostrar_correos.php?'+query, 800, 600).show();
    }
    else {
      $('cmd_mails').hide();
    }
  },


  showMails: function() {
  }

}; // Grupos

/* ---------------------------------------------- */

Event.observe(window,'load', Grupos.init);

/* */