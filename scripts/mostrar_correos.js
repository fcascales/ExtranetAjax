/*
  mostrar_correos.js — proinf.net — feb-2011
*/


/* GRUPOS ---------------------------------------- */

var Correos = {

  init: function() {
    UserSession.validate();

    $('title').down().down().writeAttribute('href','').writeAttribute('title','Cerrar ventana').observe('click', function() { window.close(); });
    //$('logo').down().writeAttribute('href','').observe('click', function() { window.close(); });

    //document.body.addClassName('popup');

    var query = Util.queryString(); // toQueryString
    var grupo = query['grupo'].stripScripts().stripTags();

    $('subtitle').update(grupo).show();
    document.title = 'Correos de '+grupo;

    DB.table('grupos_correos', function(list) {

      var items = [];
      list.each(function(item) {
        items.push(item['socio'] + ' <' + item['correo'] + '>');
      });
      $('mails').value = items.join(', ');


    }, { filters:{ id_grupo:query['id_grupo'] } });


  } // init

}; // Correos

/* ---------------------------------------------- */

Event.observe(window,'load', Correos.init);


/* */
