/*
  index.js - proinf.net - agosto-2009
*/

function init() {

  UserSession.validate(function (ok) {
    if (ok) main();
  });

}

/*-----------------------------------------------*/

Event.observe(window,'load', init);

/*-----------------------------------------------*/

function main() {

  $('cmd_backup_database').observe('click', function() {
    DB.backup();
  });

  new DB.Dropdown('search_input', 'all', {
    type: 'autocomplete',
    selectElement: do_search,
    waiting: 'search_waiting'
  });

  DB.lookup(1, 'socios_nuevos', function(value) {
    var msg;
    switch (value) {
      case 0: return;
      case 1: msg = 'Hay <a href="socios_nuevos.php">un alta</a> del formulario "Hazte socio"'; break;
      default:msg = 'Hay <a href="socios_nuevos.php">'+value+' altas</a> del formulario "Hazte socio"'; break;
    }
    //Msg.warning(msg); //$('aviso').select('span')[0].update(msg).show();
    $('aviso').down().update(msg).show();
  });

  // Borrar registros con referencias externas inexistentes
  ////DB.proc('ext_limpieza', { callback:function(ok){} });
  DB.lookup(0, 'asear', function(value) {
    if (value > 0) {
      Msg.flashInfo('Mantenimiento', 'Eliminado '+value+' referencias externas inexistentes');
    }
  });

}

/*-----------------------------------------------*/

function do_search(id, label, li) { //(text, li) {
  var docs = ['socio'];
  for (var i=0; i<docs.length; ++i) {
    var doc = docs[i];
    if (li.hasClassName(doc)) {
      location.href = doc + '.php?id=' + id;
      return;
    }
  }
}

/*-----------------------------------------------*/

/* */
