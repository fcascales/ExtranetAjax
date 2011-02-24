/*
  dir.js — proinf.net — feb-2011
  version 1.0

  Gestión de los archivos de un directorio
  Se comunica con el servidor "dirserver.php" con JSON

  Requiere:
    prototype.js, extranet.js

  Actualizaciones:
*/


var Dir = {

  url: 'server/dirserver.php', // Ruta del servidor predeterminado

}; // Dir


/* Table ======================================== */

/*
  Navegación por directorios.
  Operaciones comunes sobre archivos y directorios.
  El HTML sólo necesita un contenedor: un <div id="dir">.

  Ejemplos:
    new Dir.Table(); // ?dir=carpeta
    new Dir.Table('carpeta/subcarpeta');
*/
Dir.Table = Class.create({ // ProInf.net - dic-2011

  /*
    dir: comando al servidor y el id del contenedor HTML si no especifica la opción table
    options: {container:domId, tree_container:domId, onCheck:function, path:string, fulltree:boolean}
  */
  initialize: function(dir, options) {
    this.dir = dir || Util.queryString('dir'); // Directorio actual. Es base o una subcarpeta de base
    this.base = this.dir; // Inicio de la navegación
    this.previous = this.dir; // El directorio antes de cambiar al actual (para poder deshacer load si error)
    this.count = 0; // Nº de carpetas y ficheros (no usado)
    this._tmp_afterload = undefined; // Para uso interno (útil para seleccionar el elemento renombrado)

    // La selección de los elementos
    this.checks = []; // Array de los elementos seleccionados (pueden ser del dir. actual o de otro)
    this.dir_checks = this.dir; // Directorio donde se han seleccionado

    options = options || {};
    this.container = $(options.container) || $('dir'); // DOM: <div id="dir"><table>...</table></div>
    this.treeContainer = $(options.tree_container) || $('dir_tree'); // DOM: <div id="dir_tree"><ul>...
    this.onCheck = options.onCheck || undefined; // Al seleccionar ficheros/directorios
    this.view = options.view || Util.queryString('view') || 'list'; // Mostrar en 'listado' o 'miniaturas'
    this.fulltree = options.fulltree || false; // Mostrar todo el árbol o sólo los ancestros e hijos
    this.path = options.path || Util.queryString('path') || ''; // Ruta para llegar al directorio base
    if (this.path != '') if (this.path[this.path.length-1] != '/') this.path += '/'; // Finalizar en /

    this.reload();
    this.reloadTree();
  },

  //---------------------------------------------
  // Comandos (public)

  reload: function () { // Recarga el listado de directorios/ficheros
    this._load();
  },

  reloadTree: function() { // Recarga el árbol de subdirectorios
    if (this.treeContainer != null) this._tree();
  },

  newdir: function(dir) { // Crea un directorio
    this._tmp_newdir = dir;
    this._tmp_afterload = this._check_newdir;
    this._cmd({ cmd:'newdir', name:dir });
  },
  _check_newdir: function() { // Selecciona la carpeta después de recargar los datos
    if (this.checks.length == 0) { // No deseleccionemos lo anterior
      this.setChecked([this._tmp_newdir]); // delete this._tmp_newdir;
    }
    this.reloadTree();
  },

  delete: function() { // Borra los directorios/ficheros marcados
    var items = this.checks.join('/');
    this._cmd({ cmd:'delete', items:items });
  },

  rename: function(newname) { // Renombra un directorio/fichero
    var name = this.getSelected();
    if (name != null) {
      this._tmp_newname = newname;
      this._tmp_afterload = this._check_newname;
      this._cmd({ cmd:'rename', name:name, newname:newname });
    }
  },
  _check_newname: function() { // Seleccionar el nuevo nombre despúes de recargar los datos
    this.setChecked([this._tmp_newname]); // delete this._tmp_newname;
  },

  /*// renames...
  renames: function(newnames) { // TO-DO
  },*/

  /*
    TODO
    Pensar cómo solucionar si el fichero ya existe, si es más nuevo o que
    Quizás antes de enviar la orden habría que almacenar la respuesta para
    todos los archivos que se da
    Será necesario guardar en el array dir.checks el tamaño y fecha para
    poder comparar
    ¿Aquí o en directory.js ??
  */
  copy: function() { // TODO
    if (this.copyAvailable()) {
      // TODO
      // ...
      var items = this.checks.join('/');
      var target = this.dir_checks;
      //this._cmd({ cmd:'copy', target:target, items:items });
    }
  },
  move: function() { // TODO
    if (this.moveAvailable()) {
      // TODO
      // ...
      var items = this.checks.join('/');
      var target = this.dir_checks;
      //this._cmd({ cmd:'move', target:target, items:items });
    }
  },

  copyAvailable: function() {
    return this.dir != this.dir_checks && this.checks.length > 0;
  },
  moveAvailable: function() {
    return this.dir != this.dir_checks && this.checks.length > 0;
  },

  //---------------------------------------------
  // Información (public)

  getTarget: function() { return this.container; },

  setView: function(view) {
    view = view.toLowerCase();
    if (view != this.view && (view=='list' || view=='thumbnails' || view=='compact')) {
      this.view = view;
      this._tableMake();
    }
  },

  setFullTree: function(value) {
    if (this.fulltree != value) {
      this.fulltree = value;
      this._treeTrim();
    }
  },

  /*
    pattern es ''    --> Se deselecciona todo
    pattern es '*.*' --> Se selecciona todo
    pattern es array --> Se selecciona los elementos indicados
  */
  setChecked: function(pattern) { // Pone un array con los directorios/ficheros marcados
    this.dir_checks = this.dir;
    this.checks = [];

    var links = this.container.select("th a");
    for (var i=0; i<links.length; ++i) { // Dejar el bucle con el for
      var link = links[i];
      var item = link.innerHTML; if (item == '..') continue;
      var tr = link.up().up();
      var check = tr.down().down();

      var select;
      if (pattern == '') select = false;
      else if (pattern == '*.*') select = true;
      else select = pattern.indexOf(item) != -1;

      if (select) {
        tr.addClassName('selected');
        check.checked = true;
        this.checks.push(item);
      }
      else {
        tr.removeClassName('selected');
        check.checked = false;
      }
    }
    this._markTree();
    this.fireOnCheck(); // Sincronizado al acabar el for
  },

  getChecked: function() { // Obtiene un array con los elementos marcados del dir. actual
    if (this.dir == this.dir_checks) return this.checks;
    else return [];
  },
  /*---getChecked: function() { // Obtiene un array con los elementos marcados del dir. actual
    this.dir_checks = this.dir;
    this.checks = [];
    this.container.select("tr.selected th a").each(function(link) {
      var item = link.innerHTML;
      if (item != '..') this.checks.push(item);
    });
    return this.checks;
  },---*/

  getSelected: function() { // Nombre del fichero/directorio seleccionado (si hay uno y sólo uno)
    if (this.dir == this.dir_checks && this.checks.length == 1) {
      return this.checks[0];
    }
    else return null;
  },

  //---------------------------------------------
  // Tabla HTML (private)

  _remove: function(container) {
    var element = container.down();
    if (element != null) {
      element.childElements().invoke('stopObserving').invoke('remove');
      element.remove();
    }
    container.update('');
  },

  _insertCells: function(row, link, size, date, path) {
    var check = new Element('INPUT', {'type':'checkbox'});
    check.observe('click', this.cmd_check.bindAsEventListener(this));
    var cell1 = new Element('TD').update(check);
    var cell2 = new Element('TH').update(link);
    var cell3 = new Element('TD').update(size);
    var cell4 = new Element('TD').update(date);
    row.insert(cell1);
    row.insert(cell2);
    row.insert(cell3);
    row.insert(cell4);
    if (path != undefined && this.view == 'thumbnails' && this.isImage(path)) {
      var thumb = new Element('IMG', {src:path, width:128, height:128});
      thumb.observe('click', this.cmd_check.bindAsEventListener(this));
      cell2.insert(thumb);
      row.addClassName('thumb');
    }
  },

  _rowDir: function(dir, fields) {
    var path = this.dir+'/'+dir;
    var link = new Element('A', {'href':'#'}).update(dir);
    var row = new Element('TR', {'class':'dir'});
    link.observe('click', this.cmd_dir.bindAsEventListener(this));
    this._insertCells(row, link, fields['size'], fields['date']);
    return row;
  },

  _tableMake: function () { // Crea una tabla.
    this._remove(this.container);

    var table = new Element('TABLE', {'class':this.view/*, style:'position:relative;'*/});
    if (this.dir != this.base) {
      var row = this._rowDir('..', {'size':'', 'date':''});
      row.down().down().hide(); // checkbox
      table.insert(row);
    }
    for (var dir in this.dirs) {
      var row = this._rowDir(dir, this.dirs[dir]);
      table.insert(row);
    }
    for (var file in this.files) {
      var fields = this.files[file];
      var path = this.path+this.dir+'/'+file;
      var link = new Element('A', {'target':'_blank', 'href':path}).update(file);
      if (this.isImage(path)) { // Opcional
        Util.popup(link, path, 500, 500, 'image');
        link.observe('mouseover', this.cmd_preview_over.bindAsEventListener(this));
        link.observe('mouseout', this.cmd_preview_out.bindAsEventListener(this));
      }
      var row = new Element('TR', {'class':'file'});
      this._insertCells(row, link, fields['size'], fields['date'], path);
      table.insert(row);
    }
    this.container.insert(table);

    if (this.dir == this.dir_checks) this.setChecked(this.checks);
    this.fireOnCheck();

    this.preview = new Element('IMG', {id:'dir_preview', style:'display:none;', width:128, height:128});
    this.container.insert(this.preview);
  },

  //---------------------------------------------
  // Árbol de subdirectorios (private)

  _treeMake: function(tree) { // Make HTML
    this._remove(this.treeContainer);
    root = {};
    root[this.base] = tree;
    this._treeMake_builder(this.treeContainer, root);
    this._markTree();
    if (this.fulltree == false) this._treeTrim();
  },
  _treeMake_builder: function(container, tree) {
    if (tree == null) return;
    var list = new Element('UL');
    for (var dir in tree) {
      var link = new Element("A", {href:'#'}).update(dir);
      link.observe('click', this.cmd_tree.bindAsEventListener(this));
      var item = new Element("LI").update(link);
      this._treeMake_builder(item, tree[dir]);
      list.insert(item);
    }
    container.insert(list);
  },

  _markTree: function() { // Mark CSS class
    if (this.treeContainer != null) {
      $(this.treeContainer).select('li').invoke('removeClassName', 'target');
      $(this.treeContainer).select('li').invoke('removeClassName', 'source');
      this._markTree_builder(this.dir, 'target');
      if (this.checks.length > 0) this._markTree_builder(this.dir_checks, 'source');
    }
  },
  _markTree_builder: function(dir, classname) {
    var dir = this.dirname(dir);
    $(this.treeContainer).select('a').each(function(link) {
      if (link.innerHTML == dir) {
        link.up().addClassName(classname);
      }
    });
  },

  _treeTrim: function() { // Podar el árbol
    if (this.treeContainer != null) {
      if (this.fulltree == true) {
        $(this.treeContainer).select('li').invoke('show');
      }
      else {
        $(this.treeContainer).select('li').invoke('hide'); // Todos ocultos
        $(this.treeContainer).select('li.target>ul>li').invoke('show'); // Hijos del actual
        var targets = $(this.treeContainer).select('li.target');
        if (targets != null) this._treeTrim_showAncestors(targets[0]); // Ancestros del actual
        var sources = $(this.treeContainer).select('li.source');
        if (sources != null) this._treeTrim_showAncestors(sources[0]); // Ancestros del origen
      }
    }
  },
  _treeTrim_showAncestors: function(element) {
    while (element) {
      var tag = element.nodeName.toUpperCase();
      if (tag == 'LI') element.show();
      else if (tag != 'UL') break;
      element = element.up();
    }
  },

  //---------------------------------------------
  // Enviar mensaje al servidor (private)

  _cmd: function (parameters, verbose) { // Envía una orden al servidor
    var cmd = parameters['cmd'];
    verbose = cmd=='delete';
    parameters['dir'] = this.dir;
    Extranet.request(parameters, function(json) { // json: {ok,message}
      if (json.ok == true) {
        if (verbose) Msg.flashInfo('Info', json.message);
        this.reload();
      }
      else Msg.flashError('Error', json.message);
    }.bind(this), Dir.url);
  }, // _cmd

  _load: function () { // Obtener el listado de carpetas y ficheros del servidor
    var parameters = { cmd:'dir', dir:this.dir };
    Extranet.request(parameters, function(json) { // json: {ok,message,dirs|files[{name[files,date]},…]}
      if (json.ok == true) {
        if (json.numdirs == 0) json.dirs = {};
        if (json.numfiles == 0) json.files = {};
        this.count = json.numdirs + json.numfiles;
        this.cd(this.dir);
        this.dirs = json.dirs;
        this.files = json.files;
        this._tableMake();
        if (this._tmp_afterload != undefined) {
          this._tmp_afterload();
          this._tmp_afterload = undefined;
        }
      }
      else {
        this.cd(this.previous);
        Msg.flashError('Error', json.message);
      }
    }.bind(this), Dir.url);
  }, // _load

  _tree: function () { // Obtener árbol de subcarpetas del servidor
    var parameters = { cmd:'tree', dir:this.base };
    Extranet.request(parameters, function(json) { // json: {ok,message}
      if (json.ok == true) {
        this._treeMake(json.tree);
      }
      else Msg.flashError('Error', json.message);
    }.bind(this), Dir.url);
  }, // _tree

  //---------------------------------------------
  // Events (private)

  cmd_dir: function(event) { // Al picar en un directorio
    Event.stop(event);
    var dir = event.element().innerHTML; // Event.element(event);
    this.previous = this.dir;
    if (dir == '..') {
      this.dir = this.parent();
    }
    else {
      this.dir = this.dir+'/'+dir;
    }
    this.reload();
  },

  cmd_tree: function(event) { // Al picar en el árbol de subdirectorios
    Event.stop(event);
    var element = event.element();
    var dir = '';
    while (element) { // Ascendiendo en el DOM para obtener la ruta completa
      var tag = element.nodeName.toUpperCase();
      if (tag == 'A' || tag == 'UL') {}
      else if (tag == 'LI') {
        if (dir != '') dir = '/'+dir;
        dir = element.down().innerHTML+dir;
      }
      else break;
      element = element.up();
    }
    //alert(dir);
    if (dir != this.dir) {
      this.previous = this.dir;
      this.dir = dir;
      this.reload();
    }
  },

  cmd_check: function(event) { // Al picar una fila de la tabla.
    //Event.stop(event); // comentar
    var row = event.element().up().up(); // element.nodeName es INPUT o IMG
    var check = row.down().down();
    row.toggleClassName('selected');
    check.checked = row.hasClassName('selected');
    if (this.dir != this.dir_checks) {
      this.dir_checks = this.dir;
      this.checks = [];
    }
    var item = row.select('th a')[0].innerHTML;
    if (check.checked) this.checks.push(item); // this.num_checks++;
    else this.checks = this.checks.without(item); // this.num_checks--;
    this.fireOnCheck();
  },

  cmd_preview_over: function(event) {
    Event.stop(event);
    if (this.view == 'compact' || this.view == 'list') {
      // Empieza la descarga del la vista previa
      var link = event.element();
      this.preview.writeAttribute({alt:link.innerHTML, title:link.innerHTML, src:link.href});
      var top = (link.measure('top')+link.measure('height'))+'px';
      var left = link.measure('left')+'px';
      this.preview.setStyle({position:'absolute', top:top, left:left});
      ////this.preview.show(); // comentar

      // Mostrar la vista previa tras unos instantes
      var seconds = (this.view == 'list')? 1 : 0.5;
      this._preview_timer = this._preview_delayed.bindAsEventListener(this).delay(seconds);
    }
  },
  _preview_delayed: function() { // Auxiliar de cmd_preview_over
    this.preview.show();
  },
  cmd_preview_out: function(event) {
    Event.stop(event);
    window.clearTimeout(this._preview_timer);
    this.preview.hide();
  },

  //---------------------------------------------
  // Miscelánea (private)

  cd: function(dir) { // change directory
    this.dir = dir;
    this._markTree();
    if (this.fulltree == false) this._treeTrim();
    this.fireOnCheck(); // Avisar porque la selección puede ser de otra carpeta
  },

  parent: function(dir) {
    var pos = this.dir.lastIndexOf('/');
    if (pos == -1) return this.base;
    else return this.dir.substr(0, pos);
  },

  dirname: function(dir) { // 'dir/subdir' --> 'subdir'
    var pos = dir.lastIndexOf('/');
    if (pos == -1) return dir;
    else return dir.substr(pos+1);
  },

  fireOnCheck: function() {
    if (this.onCheck != undefined) {
      this.onCheck(this.dir, this.dir_checks, this.checks);
    }
  },

  isImage: function(path) {
    var dot = path.lastIndexOf('.'); if (dot == -1) return false;
    var ext = path.substr(dot).toLowerCase();
    return ext=='.jpg' || ext=='.jpeg' || ext=='.gif' || ext=='.png';
  }

}); // Dir.Table



/* */
