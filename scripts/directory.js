/*
  directory.js — proinf.net — feb-2011

  Requiere: prototype.js, extranet.js, dir.js
*/

/* INIT ========================================= */

var Directory = {

  init: function() {
    UserSession.validate();

    $('cmd_reload').observe('click', Directory.cmd_reload);
    $('cmd_newdir').observe('click', Directory.cmd_newdir);
    $('cmd_delete').observe('click', Directory.cmd_delete);
    $('cmd_rename').observe('click', Directory.cmd_rename);
    $('cmd_select').observe('click', Directory.cmd_select);
    $('cmd_copy').observe('click', Directory.cmd_copy);
    $('cmd_move').observe('click', Directory.cmd_move);
    $('cmd_view').observe('change', Directory.cmd_view);
    $('cmd_fulltree').observe('change', Directory.cmd_fulltree);

    Directory.table = new Dir.Table();
    Directory.table.onCheck = Directory.onCheck;

    $('cmd_view').value = Util.queryString('view') || 'list';
  },

  //---------------------------------------------
  // Comandos

  cmd_reload: function(event) {
    Event.stop(event);
    Directory.table.reload();
    Directory.table.reloadTree();
  },

  cmd_newdir: function(event) {
    Event.stop(event);
    var dir = prompt('Introduce el nombre del nuevo directorio'); if (dir == null) return;
    dir = dir.strip(); if (dir == '') return;
    Directory.table.newdir(dir);
  },

  cmd_delete: function(event) {
    Event.stop(event);
    var num_checks = Directory.table.getChecked().length;
    if (num_checks > 0) {
      if (confirm("¿Borrar "+num_checks+" elementos seleccionados?")) {
        Directory.table.delete();
      }
    }
  },

  cmd_rename: function(event) {
    Event.stop(event);
    var name = Directory.table.getSelected(); if (name == null) return;
    var newname = prompt('Introduce el nuevo nombre', name); if (newname == null) return;
    newname = newname.strip(); if (newname == '') return;
    Directory.table.rename(newname);
  },

  cmd_select: function(event) {
    Event.stop(event);
    var num_checks = Directory.table.checks.length;
    if (num_checks == 0) Directory.table.setChecked('*.*');
    else Directory.table.setChecked('');
  },

  cmd_copy: function(event) {
    Event.stop(event);
    if (Directory.table.copyAvailable()) {
      var items = Directory.getItemsToCopyOrMove();
      var target = Directory.table.dir_checks;
      if (confirm("¿Copiar aquí"+items+"desde '"+target+"' ?")) {
        //alert('en obras');
        //Directory.table.resolveConflicts()
        Directory.table.copy();
      }
    }
  },

  cmd_move: function(event) {
    Event.stop(event);
    if (Directory.table.moveAvailable()) {
      var items = Directory.getItemsToCopyOrMove();
      var target = Directory.table.dir_checks;
      if (confirm("¿Mover aquí"+items+"desde '"+target+"' ?")) {
        // Directory.table.resolveConflicts()
        // Directory.table.move();
        alert('en obras');
      }
    }
  },

  cmd_view: function(event) {
    Event.stop(event);
    var opcion = $F('cmd_view');
    Directory.table.setView(opcion);
  },

  cmd_fulltree: function(event) {
    Event.stop(event); // alert($('cmd_fulltree').checked);
    Directory.table.setFullTree($('cmd_fulltree').checked);
  },

  //---------------------------------------------
  // Auxiliar

  getItemsToCopyOrMove: function() {
    var checks = Directory.table.checks;
    if (checks.length <= 10) {
      return "\n\n\t"+checks.join("\n\t")+"\n\n";
    }
    else {
      return " "+checks.length+" elementos ";
    }
  },

  //---------------------------------------------
  // Eventos

  onCheck: function(dir, dir_checks, checks) {
    var disable = function(element, condition) {
      if (condition) $(element).addClassName('disabled');
      else $(element).removeClassName('disabled');
    };
    var num_checks = checks.length;
    var subtitle = '';

    if (num_checks >= 1) subtitle = 'Seleccionado '+num_checks+' en <strong>'+dir_checks+'</strong>';
    $('dir_title').update(dir);
    $('dir_subtitle').update(subtitle).show();

    disable('cmd_delete', num_checks==0 || dir!=dir_checks);
    disable('cmd_rename', num_checks!=1 || dir!=dir_checks);
    disable('cmd_copy',   num_checks==0 || dir==dir_checks);
    disable('cmd_move',   num_checks==0 || dir==dir_checks);

    if (num_checks == 0) $('cmd_select').update('Seleccionar');
    else $('cmd_select').update('Deseleccionar');
  }

}; // Directory

Event.observe(window,'load', Directory.init);

/* */
