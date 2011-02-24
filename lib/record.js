/*
  record.js — proinf.net — ago/sep-2009, ene/feb-2011
  version 1.3

  Todas estas clases utilizan peticiones AJAX para obtener los valores.
  Se necesita un servidor AJAX que las atienda: Puede ser PHP, Java, o lo que sea.

  Clases:
    DB          - Métodos estáticos comunes
    DB.Record   - Un formulario para un registro de la BD con Nuevo/Borrar/Guardar
    DB.List     - Un listado de los registros de la BD (con agrupación e histórico).
    DB.Table    - Muestra información en forma de tabla
    DB.Grid     - Detalle tabular para la edición de varios registros simultáneamente.
    DB.Dropdown - Lista desplegable, especialmente útil para DB.Grid
    DB.Calendar - Un calendario semanal a partir de una lista de fechas

   [DB.Select - Un <select> que se utiliza en vez de un <input>]<---descartado aunque funcionaba bien

  Requiere:
    prototype.js, extranet.js

  Actualizaciones:
    2011-02-06 — Añadido onSelectRow en DB.Grid
    2011-02-07 — Corregido DB.proc
    2011-02-09 — El DB.Dropdown funciona en las líneas de un <textarea>
    2011-02-10 — DB.Record permite pasar callback en dbInsert y dbUpdate
*/



/* DB  ========================================== */

/*
  Clase con métodos estáticos y contenedor del resto de clases
*/
var DB = {

  url: 'server/private.php', // Ruta del servidor predeterminado

  dropdown: undefined, // DB.Dropdown actualmente activo
  dropdowns: {}, // Lista indexada por query. Cada elemento contiene los valores del DB.Dropdown
  waiting: {}, // Lista indexada por query. Cada elemento contiene una lista de DB.Dropdown que esperan la finalización del AJAX.

  /*
    Obtiene un único valor.
    El valor encontrado se retorna mediante una función porque la petición es asíncrona.

    Ejemplos:
      DB.lookup(105, 'poblaciones', function(value) { alert(value); });
      DB.lookup(2009, 'proximo-numero-factura', function(value) { $('codigo_factura').value = value; });
  */
  lookup: function(id, query, callback) {
    var parameters = {
      cmd: 'lookup',
      query: query,
      id: id
    };
    Extranet.request(parameters, function(json) { // json: {ok,message,value}
      if (json.ok == true) callback(json.value);
      else Msg.flashError('Buscar '+query, json.message);
    }.bind(this), DB.url);
  }, // lookup


  /*
    Obtiene un array de hash, correspondiente a los registros de una tabla.

    Ejemplos:
      DB.table('festivos', callback, {filters:{dia_inicio:'2009-01-01',dia_fin:'2009-12-31'}});
      DB.table('mininos', function(list) { alert(Object.toJSON(list)); });
  */
  table: function(query, callback, options) {
    options = options || {};
    var filters = Object.toQueryString(options.filters || {});
    var parameters = {
      cmd: 'table',
      query: query,
      filters: filters
    }
    Extranet.request(parameters, function(json) { // json: {ok,message,array}
      if (json.ok == true) callback(json.list);
      else Msg.flashError('Tabla '+query, json.message);
    }, DB.url);
  }, // table


  /*
    Ejecuta un procedimiento almacenado del servidor de BD
  */
  proc: function(query, options) { // options: {callback:func(ok)}
    var parameters = {
      cmd: 'proc',
      query: query
    };
    options = options || {};
    Extranet.request(parameters, function(json) { // json: {ok,message}
      if (options['callback'] != undefined) options['callback'](json.ok);
      else {
        if(json.ok == true) Msg.flashOk('Proc '+query, json.message);
        else Msg.flashError('Proc '+query, json.message);
      }
    }.bind(this), DB.url);
  }, // proc


  /*
    Rellena un combobox con datos provinientes del servidor.
    El HTML debe tener un <select>  especificado en el primer parámetro.
    Relación entre elementos y campos: <optgroup label="{group}"><option value="{id}" class="{class}">{label}</option>…
    La función callback sirve para darle el valor correcto al <select> una vez han llegado los datos.

    Ejemplos:
      DB.combobox('id_pais', 'paises');
      DB.combobox('id_cliente', 'clientes', {filters:{pais:'Francia',año:2010}});
      DB.combobox('id_proveedor', 'proveedores, {callback: function(combobox) { $(combobox).value = 123; }});
  */
  combobox: function(select, query, options) { // options: {filters:{}, callback:function}
    var parameters = {
      cmd: 'combobox',
      query: query,    // comando en el servidor
      combobox: $(select).identify() // id DOM del <select>
    };
    options = options || {}
    if (options['filters'] != undefined) {
      parameters['filters'] = Object.toQueryString(options['filters']);
    }
    Extranet.request(parameters, function(json) { // json: {ok,message,combobox,list:[{id,label,group,class},…]} (group y class son opcionales)
      if (json.ok == true) {
        $(json.combobox).childElements().invoke('remove');
        $(json.combobox).insert(new Element('OPTION', {value:''}));
        var optgroups = {};
        for (var i=0; i<json.list.length; ++i) {
          var fields = json.list[i];
          var option = new Element('OPTION', {value:fields.id}).update(fields.label);
          if (fields['class'] != undefined) {
            option.writeAttribute('class',fields['class']);
          }
          if (fields.group == undefined) {
            $(json.combobox).insert(option);
          }
          else { // Con grupos
            var optgroup = optgroups[fields.group];
            if (optgroup == undefined) {
              optgroup = new Element('OPTGROUP', {label:fields.group});
              optgroups[fields.group] = optgroup;
              $(json.combobox).insert(optgroup);
            }
            optgroup.insert(option);
          }
        }
        $(json.combobox).value = ''; //0

        if (options['callback'] != undefined) {
          options['callback'](json.combobox);
        }
      }
      else {
        Msg.error('Combobox '+query, json.message);
      }
    }.bind(this), DB.url);
  }, // combobox


  /*
    Actualiza la lista de todos los DB.Dropdown que comparten el mismo 'query'
  */
  update_dropdowns: function(query, filters) { // AJAX request
    var parameters = {
      cmd: 'combobox',
      query: query
    };
    if (filters != undefined) {
      parameters['filters'] = Object.toQueryString(filters);
    }
    Extranet.request(parameters, function(json) { // json: {ok,message,list:[{id,label,group,class},…]}
      if (json.ok == true)
        DB.dropdowns[query] = json.list;
      else
        Msg.flashError('Update dropdowns '+query, json.message);
    }, DB.url);
  }, // dropdown



  /*
    Copia de seguridad de la BD
  */
  backup: function() {
    var parameters = {
      cmd: 'backup'
    };
    Msg.warning('Backup','Realizando la copia de seguridad…');
    Extranet.request(parameters, function(json) { // json: {ok,message,file}
      if (json.ok == true) {
        var link = '<a href="'+json.link+'">'+json.archive+'</a>'; //new Element('A',{href: json.link}).update(json.archive);
        Msg.ok('Backup', link);
      }
      else {
        Msg.error('Backup',json.message);
      }
    }, DB.url);
  } // backup


}; // DB









/* RECORD  ====================================== */

/*
  Gestión de una ficha referida a un único registro de una tabla de la BD.
  Las operaciones que incluye son: Nuevo/Guardar/Borrar/Leer
  Necesita código HTML complementario: <form><input>…<select>…<textarea>…</form>
  Se necesita el id del formulario 'record' y de los tres botones: 'cmd_new', 'cmd_save', 'cmd_delete'
  El campo ID de la tabla debe ser un <input> llamado obligatoriamente "id"

  Ejemplos:
    new DB.Record('cursos', {comboboxes:{id_trabajador:'trabajadores',id_materia:'materias'}} );

  Por hacer:
    Un DB.Record puede mostrar detalles tabulares mediante uno o varios DB.Grid ¡HECHO!
*/
DB.Record = Class.create({ // ProInf.net — ago-2009

  /*
    query: comando del servidor
    options: {id, container, onValidate, comboboxes, dropdowns, commands, byDefault, title, link_list}
  */
  initialize: function(query, options) {
    this.query = query;
    this.fields = {}; // Memoria de los últimos campos mostrados

    // Options
    options = options || {};
    this.id = options.id || Util.queryString('id') || null; // null si es una nueva ficha
    this.container = $(options.container) || $('record');  // Elemento DOM que muestra el formulario de la ficha
    this.onValidate = options.onValidate || undefined; // Después de mostrar un registro existente o nuevo. Parámetros: fields
    this.comboboxes = options.comboboxes || {}; // <option> de los <select> a partir de la BD
    this.dropdowns = options.dropdowns || {}; // Listas desplegables con DB.Dropdown
    this.commands = options.commands || {'new':'cmd_new', 'save':'cmd_save', 'delete':'cmd_delete'};
    this.byDefault = options.byDefault || {}; // Valores por omisión de los campos cuando es un nuevo registro
    this.link_list = options.link_list || undefined; // Enlace con un DB.List
    this.title = options.title || undefined; // Título de la página
    //this.checkValues = options.checkValues || [0,1]; // Valores de los checkbox: desmarcado y marcado

    // Link to list
    if (this.link_list != undefined) { this.link_list.link_record = this; }
    this.link_grids = {}; // DB.Grid actualiza estos enlaces.

    // Events
    var observe = function(cmd, listener) { if ($(cmd) != null) $(cmd).observe('click', listener); }
    observe($(this.commands['new']), this.cmd_new.bindAsEventListener(this));
    observe($(this.commands['save']), this.cmd_save.bindAsEventListener(this));
    observe($(this.commands['delete']), this.cmd_delete.bindAsEventListener(this));

    // Al picar un checkbox modificar su propiedad value a true o false
    this.container.select('input[type=checkbox]').each(function(element) {
      element.value = '';
      element.observe('click', function(event) {
        this.value = this.checked? 1: 0;  // true, false
      });
    });

    // Change event - Marcar con la clase 'dirty' los campos que han cambiado
    var elements = this.container.select('*[name]');
    for (var i=0; i<elements.length; ++i) {
      var element = elements[i];
      element.observe('change', this.elementOnChange.bindAsEventListener(this));
    }

    // Comboboxes: rellenar <select> con <option>
    for(var id in this.comboboxes) {
      DB.combobox(id, this.comboboxes[id], {callback: function(combobox) {
        if (this.isNew()) this.formDefault(combobox);
        else $(combobox).value = this.fields[combobox];
      }.bind(this) });
    }

    // Dropdowns: lista desplegables JavaScript
    for (var id in this.dropdowns) {
      // TODO: Añadir la posibilidad de que el drop down separe el valor mostrado del seleccionado
      new DB.Dropdown(id, this.dropdowns[id]); //, {positioning:'offset'});
    }

    // Title
    if (this.title != undefined) this.title = new Template(this.title);

    // Show
    if (this.isNew()) this.formClear();
    else this.dbGet(this.id);
  },

  // public interface ---------------------------

  /*automatic_dirty: function() { // Al cambiar el contenido de un campo lo marca con la clase 'dirty'
    this.container.select('*[name]').each(function(element) {
      element.observe('change', function(event) {
        this.addClassName('dirty');
      });
    });
  },*/

  isNew: function() {
    return this.id == null;
  },

  // events -------------------------------------

  cmd_new: function(event) {
    Event.stop(event);
    this.formClear();
  },
  cmd_save: function(event) {
    Event.stop(event);
    if (this.id == null) { this.dbInsert(); }
    else { this.dbUpdate(); }
  },
  cmd_delete: function(event) {
    Event.stop(event);
    if (this.id == null) { this.formClear(); }
    else {
      if (confirm('¿Borrar "'+$F('id')+'"?')) {
        this.dbDelete();
      }
    }
  },

  elementOnChange: function(event) {
    var element = Event.element(event);
    element.addClassName('dirty');

    // Rejillas de detalle
    if (this.isNew()) {
      for (var key in this.link_grids) {
        var grid = this.link_grids[key];
        if (grid.datalink.master == element.id) { // Actualizar valor del master field
          grid.updateFromMaster();
        }
      }
    }
  },

  // select -------------------------------------

  /*
    Obtiene un registro y actualiza los <input> que tengan los nombre de campo
    callback es opcional. Recibe fields y retorna booleano para indicar si ha sido procesada una respuesta
  */
  dbAutocalc: function(id, query, callback) {
    if (id == '') return;
    var parameters = {
      cmd: 'get',
      query: query,
      id: id
    };
    Extranet.request(parameters, function(json) { // fields
      if (json.ok == true) {
        var processed = (callback == undefined)? false: callback(json.fields);
        if (processed) {
          for(var field in json.fields) {
            var id = $(field);
            var value = json.fields[field];
            if (id != null && value) {
              id.addClassName('dirty').value = value;
            }
          }
        }
      }
    }, DB.url);
  },

  // private form -------------------------------

  change_id: function(id) {
    if (this.link_list != undefined) this.link_list.itemCurrent(id);
    this.id = id;
  },

  formReset: function() {
    this.container.select('.error').invoke('removeClassName','error');
    ////this.container.select('.warning').invoke('removeClassName','warning');
    this.container.select('.dirty').invoke('removeClassName','dirty');
    this.container.select('.date').each(function(element){  Validate.attr_date(element); });
  },

  getFields: function(options) { // Obtiene los campos del formulario para insertar o actualizar la BD
    options = options || {};
    var hash = options.hash || false; // url encoded or hashed array
    var dirty = options.dirty || false; // changed elements or all elements
    var result = hash? {} : '';

    if (dirty) { // Sólo los elementos que han cambiado
      /*fields = Form.serialize(this.container, true); // hash
      dirty_names = this.container.select('.dirty').collect(function(element){ return element.name; });
      for (var field in fields) { if (dirty_names.include(field) == false) fields[field] = undefined; }*/
      this.container.select('.dirty').each(function(element) {
        if (hash) result[element.name] = element.value;
        else result += (result==''?'':'&') + encodeURIComponent(element.name) + '=' + encodeURIComponent(element.value);
      });
    }
    else { // todos los elementos
      result = Form.serialize(this.container, hash);
    }
    return result;
  }, // getFields

  formDefault: function(key) { // Pone los valores predeterminados
    if (key == undefined) {
      var queryString = Util.queryString();
      for (var key in queryString) {
        if (key == 'id') continue;
        var field = $(key);
        if (field != null) field.addClassName('dirty').value = queryString[key];
      }
      for (var key in this.byDefault) {
        var field = $(key);
        if (field != null) field.addClassName('dirty').value = this.byDefault[key];
      }
    }
    else {
      var field = $(key);
      var value = this.byDefault[key] || Util.queryString(key) || null;
      if (field != null && value != null) field.addClassName('dirty').value = value;
    }
  }, // formDefault

  // form ---------------------------------------

  formShow: function(fields) { // Añade los campos al formulario

    // Internal function
    check_checkbox = function(field) {
     if (/*$(field).tagName == 'INPUT' &&*/ $(field).readAttribute('type') == 'checkbox') {
        // value puede ser: '', 'false', 'true', '0', '-1', '1',
        if ($(field).value.toLowerCase() == 'false') $(field).checked = false;
        else if ($(field).value.toLowerCase() == 'true') $(field).checked = true;
        else $(field).checked = parseInt($(field).value, 10) != 0;
      }
    }

    this.change_id(fields['id']);
    for (var field in fields) {
      if ($(field) != null) {
        $(field).value = fields[field];
        check_checkbox(field);
      }
    }
    this.formReset();
    this.updateSlaves();

    if (this.title != undefined) document.title = this.title.evaluate(fields);

    // Fire event
    if (this.onValidate != undefined) this.onValidate(fields);

  }, // formReset

  formClear: function() { // Borra el formulario
    check_checkbox = function (element) {
      if (/*$(element).tagName == 'INPUT' &&*/ $(element).readAttribute('type') == 'checkbox') {
        element.checked = false;
      }
    }

    // Vaciar campos
    this.change_id (null);
    $('id').value = '';
    this.container.select('*[name]').each(function(element,index) {
      element.value = '';
      check_checkbox(element);
    });
    /*this.container.select('*').each(function(element,index) {
      if (element.readAttribute('name') != null) {
        element.value = '';
        check_checkbox(element);
      }
    });*/

    // Reiniciar
    this.formReset();
    this.formDefault();
    this.updateSlaves();

    if (this.title != undefined) document.title = this.title.evaluate(null);

    // Fire event
    if (this.onValidate != undefined) { this.onValidate(null); } // this.getFields({dirty:false, hash:true})

  }, // formClear

  // grid ---------------------------------------

  updateSlaves: function() {
    for (var key in this.link_grids) {
      var grid = this.link_grids[key];
      grid.updateFromMaster();
    }
  },

  // permanence  --------------------------------

  dbGet: function(id) { // Obtiene un único registro de la BD
    if (id == null) return;
    var parameters = {
      cmd: 'get',
      query: this.query,
      id: id
    };
    Extranet.request(parameters, function(json) { // json: {ok,message,fields}
      if (json.ok == true) {
        this.fields = json.fields; // remember
        this.formShow(json.fields);
      }
      else {
        Msg.error('Seleccionar '+this.query, json.message);
      }
    }.bind(this), DB.url);
  },

  dbInsert: function(options) { // Inserta un registro en la BD
    var fields = this.getFields({dirty:true, hash:false});
    if (fields == '') { Msg.flashWarning('No hay campos que insertar'); return false; }
    options = options || {};
    var parameters = {
      cmd: 'insert',
      query: this.query,
      fields: fields
    };
    Extranet.request(parameters, function(json) { // json: {ok,message,id,fields}
      if (json.ok == true) {
        Msg.flashOk('Insertar '+this.query, json.id);
        if (json.fields) this.formShow(json.fields);
        if (this.link_list != undefined) {
          this.link_list.dbItem(json.id);
        }
      }
      else {
        Msg.flashError('Insertar '+this.query, json.message);
      }
      if (json.verbose) Msg.info(json.verbose);
      if (options['callback'] != undefined) options['callback'](json.ok);
    }.bind(this), DB.url);
    return true;
  },

  dbUpdate: function(options) { // Actualiza un registro en la BD
    var fields = this.getFields({dirty:true, hash:false});
    if (fields == '') { Msg.flashWarning('No hay campos que actualizar'); return false; }
    options = options || {};
    var parameters = {
      cmd: 'update',
      query: this.query,
      id: this.id,
      fields: fields
    };
    Extranet.request(parameters, function(json) { // json: {ok,message,id,newid,fields}
      if (json.ok == true) {
        Msg.flashOk('Actualizar '+this.query, json.id);
        if (json.fields) this.formShow(json.fields);
        if (this.link_list != undefined) {
          this.link_list.itemChangeId(json.id, json.newid);
          this.link_list.dbItem(json.newid);
        }
      }
      else {
        Msg.flashError('Actualizar '+this.query, json.message);
      }
      if (json.verbose) Msg.info(json.verbose);
      if (options['callback'] != undefined) options['callback'](json.ok);
    }.bind(this), DB.url);
    return true;
  },

  dbDelete: function() {
    var parameters = {
      cmd: 'delete',
      query: this.query,
      id: this.id
    };
    Extranet.request(parameters, function(json) { // json: {ok,message,id}
      if (json.ok == true) {
        Msg.flashOk('Borrar '+this.query, json.id);
        this.formClear();
        if (this.link_list != undefined) {
          //this.link_list.listExtract(json.id);
          this.link_list.itemClass(json.id, 'deleted');
        }
      }
      else {
        Msg.flashError('Borrar '+this.query, json.message);
      }
      if (json.verbose) Msg.info(json.verbose);
    }.bind(this), DB.url);
  }

}); // DB.Record








/* LIST ========================================= */

/*
  Gestión de un listado de la BD.
  El id de la lista HTML es 'list' que se puede subdividir en grupos llamados 'list_group1', 'list_group2'
  El listado se puede bajar en dos partes: el habitual y el histórico o históricos
  Es útil para ver los registros DB.Record utilizando para ello la opción link_record

  Ejemplos:
    new DB.List('cursos', { template:'<li id="#{id_curso}">#{nombre_curso}</li>', urlFilters: ['id_trabajador','id_curso','id_cliente'] } );

  Por hacer:
    Que el template se pueda leer desde el HTML.
    Que un DB.Record puede tener más de un DB.List
*/
DB.List = Class.create({ // ProInf.net - ago-2009

  /*
    query: comando del servidor
    options: {id, container, prefix, template, commands, filters, urlFilters, afterItem, clickItem, link_record}
  */
  initialize: function(query, options) {
    this.query = query;

    // Options
    options = options || {};
    this.id = options.id || Util.queryString('id') || null; // null si no hay ningún elemento seleccionado
    this.container = $(options.container) || $('list'); // Elemento DOM que muestra el listado
    this.prefix = options.prefix || (this.query + '_'); // Prefijo al ID de los elementos de la lista
    this.template = options.template || '<li id="#{id}">#{id}</li>'; // Prototype Template
    this.commands = options.commands || { list:'cmd_list', historic:'cmd_historic' };
    this.filters = options.filters || {}; // Hash de los filtros con el nombre del campo y su valor
    this.urlFilters = options.urlFilters || []; // Array con los nombres de párametros URL que hacen de filtro
    this.afterItem = options.afterItem || undefined; // Tras añadir un elemento a la lista. Parámetros: element, fields
    this.clickItem = options.clickItem || undefined; // Al hacer clic en la lista. Parámetros: element, fields
    this.link_record = options.link_record || undefined; // Enlace con DB.Record

    // Link to record
    if (this.link_record != undefined) { this.link_record.link_list = this; }

    // Ajustar id de la plantilla
    this.template = this.template.replace('id="#{id}"', 'id="'+this.prefix+'#{id}"');
    this.ITEM_TEMPLATE = new Template(this.template);

    // Historic
    //var getFirstElement = function(selector) { return this.container.select(selector)[0]; }
    var observe = function(cmd, listener) { if ($(cmd) != null) $(cmd).observe('click', listener); }
    observe(this.commands['list'], this.cmd_list.bindAsEventListener(this));
    observe(this.commands['historic'], this.cmd_historic.bindAsEventListener(this));

    // Filters
    if (this.urlFilters != undefined) {
      for(var i=0; i<this.urlFilters.length; ++i) {
        this.addURLFilter(this.urlFilters[i]);
      }
      for (var filter in this.filters) {
        Interface.activateTab('tab_list');
        break;
      }
    }

    /*// Only record?
    if (this.link_record != undefined) {
      if (this.link_record.isNew() == false) {
        this.container.hide();
        return; // no dbList
      }
    }*/

    // List
    this.dbList();
  },

  // listen events ------------------------------

  cmd_list: function(event) {
    Event.stop(event);
    this.dbList();
  },
  cmd_historic: function(event) {
    Event.stop(event);
    this.dbHistoric();
  },

  // utilities ----------------------------------

  addURLFilter: function(filter) { // Ej: '...?id_curso=E-01-09' --> { id_curso:'E-01-09' }
    var value = Util.queryString(filter);
    if (value != null) {
      this.filters[filter] = value;
    }
  },

  // select -------------------------------------

  dbItem: function(id) { // Recupera un único elemento de la lista y actualiza ese elemento
    var parameters = {
      cmd: 'list',
      query: this.query,
      id: id
    };
    Extranet.request(parameters, function(json) { // / json: {ok,message,list:[{fields}]}
      if (json.ok == true) {
        var fields = json.list[0];
        this.itemPut(fields, {single:true});
        this.itemCurrent(fields['id']);
      }
      else {
        Msg.flashError('Elemento '+this.query, json.message);
      }
    }.bind(this), DB.url);
  }, // dbItem

  dbHistoric: function() {
    this.dbList('historic');
  },

  dbList: function(historic) { // Obtiene toda la lista de la BD
  // El parámetro historic sirve para ampliar los datos originales, ver el histórico
    var parameters = {
      cmd: 'list',
      query: this.query,
      filters: Object.toQueryString(this.filters)
    };
    if (historic != undefined) {
      this.historic = historic;
      parameters['historic'] = historic;
    }
    //// for (var filter in this.filters) { parameters[filter] = this.filters[filter];  }

    Extranet.request(parameters, function(json) { // json: {ok,message,list:[{fields}…]}
      if (json.ok == true) {
        if (this.historic == '') { // Borrar los elementos previos
          this.container.select('li[id]').invoke('stopObserving').invoke('remove');
        }
        this.counters = {};
        for (var i=0; i<json.list.length; ++i) {
          var fields = json.list[i];
          this.itemPut(fields);
        }
        for (var group in this.counters) { // Mostrar el número de regs. en el elemento que encabeza la lista
          var counter = this.counters[group];
          var title = $(this.container.identify()+'_'+group).previous();
          if (title != null) title.update(group.capitalize()+' <var>'+counter+'</var>');
        }
        if ($('subtitle') != null && json.labels != undefined) { // Poner las etiquetas de filtros en el subtítulo de la página
          var subtitle = '';
          for (var key in json.labels) {
            subtitle += '<span>' + json.labels[key] + '</span>';
          }
          $('subtitle').update(subtitle).show();
        }
        this.itemCurrent(this.id); // Marcar el elemento actual
      }
      else {
        Msg.flashError('Listar '+this.query, json.message);
      }
    }.bind(this), DB.url);

  }, // dbList

  // items --------------------------------------

  itemGet: function(id) { // Obtiene un elemento de la lista
    return $(this.prefix + id);
  },

  itemCurrent: function (id) { // Marca o desmarca un elemento de la lista como actual
    var setClassCurrent = function(id, ok) {
      var item = this.itemGet(id);
      if (item != null) {
        if (ok) item.addClassName('current');
        else item.removeClassName('current');
      }
    }.bind(this);
    setClassCurrent(this.id, false);
    setClassCurrent(this.id = id, true);
  },

  itemRemove: function(id) { // Elimina un elemento de la lista
    var item  = this.itemGet(id);
    if (item != null) item.stopObserving().remove();
  },

  itemClass: function(id, css_class) { // '', 'inserted', 'deleted', 'updated'
    item = this.itemGet(id);
    if (item != null) item.addClassName(css_class);
  },

  itemChangeId: function(old_id, new_id) { // Cambia el id de un elemento
    var old_item = this.itemGet(old_id);
    if (old_item != null) old_item.writeAttribute('id', this.prefix + new_id);
  },

  itemPut: function(fields, options) { // Añade un elemento a la lista o lo actualiza si ya estaba
    options = options || {};
    var single = options.single || false; // Es un elemento individual o forma parte de un listado
    var list = this.container;
    var item = this.itemGet(fields['id']);
    var type = single?(item==null?'inserted':'updated'):'';

    // Añadirlo o actualizarlo al DOM
    var html = this.ITEM_TEMPLATE.evaluate(fields);
    if (item == null) {
      if (fields.group != undefined) { // Group items
        var idgroup = this.container.identify()+'_'+fields.group;
        var sublist = $(idgroup); // TODO: Sino existiese la sublista añadirla sobre la marcha
        if (sublist != null) {
          list = sublist;
          if (this.counters[fields.group] == undefined) this.counters[fields.group] = 0;
          this.counters[fields.group]++;
        }
      }
      if (single) list.insert({top:html}); else list.insert(html);
    }
    else {
      item.stopObserving().replace(html);
    }
    item = this.itemGet(fields['id']);
    this.itemClass(fields['id'], type);

    // Enlace con DB.Record
    if (this.link_record != undefined) {
      item.link_list = this;
      item.observe('click', function(event) {
        var id = this.getAttribute('id').substr(this.link_list.prefix.length);
        this.link_list.link_record.dbGet(id);
        Interface.activateTab('tab_record');
      });
    }

    // Pulsar en el elemento (TODO: Probar a ver si funciona)
    if (this.clickItem != undefined) {
      item.clickItem = this.clickItem;
      item.fields = fields;
      item.observe('click', function(event) {
        this.clickItem(this, this.fields);
      });
    }

    // Fire event
    if (this.afterItem != undefined) this.afterItem(item, fields);

  } // itemPut

}); // DB.List








/* Table ======================================== */

/*
  Muestra datos en forma de una tabla (sólo lectura)
  El HTML sólo necesita un contenedor: un <div>.
  El encabezado será de la clase CSS "header" y los campos serán de la clase "field_campo1", "field_campo2", etc.
  Si hay un campo llamado `class` se usará para estilos css de la fila

  Ejemplos:
    new DB.Table('precios').getData();
    new DB.Table('facturas').getData({id_cliente:120, año:2009});
    new DB.Table('clientes', {header:false, tags:['UL','LI','SPAN','STRONG']}).getData();
    new DB.Table('citas', {onClick: function(fields) { alert(Object.toJSON(fields)); }}).getData();
    new DB.Table('facturas', {links:{id_factura:'facturas.html?id=#{id_factura}'}}).getData();
*/
DB.Table = Class.create({ // ProInf.net - ago-2009

  /*
    query: comando al servidor y el id del contenedor HTML si no especifica la opción table
    options: {container, tags, filters, header, onClick, links, verbose}
  */
  initialize: function(query, options) { // var table =
    this.query = query; // Comando a enviar para recuperar los datos de la tabla
    this.count = 0;

    options = options || {};
    this.container = $(options.container) || $(query) || $('table'); // Elemento DOM que muestra la tabla <div id="table"><table>...</table></div>
    this.tags = options.tags || ['TABLE','TR','TD','TH']; //  ['UL','LI','SPAN','STRONG']
    this.filters = options.filters || {};
    this.header = (options.header == undefined)? true: options.header;
    this.onClick = options.onClick || undefined;
    this.onLoad = options.onLoad || undefined;
    this.links = options.links || {};
    this.verbose = options.verbose || false;

    // Paginación
    this.num_page = options.num_page || 1;
    this.page_size = options.page_size || 10;
    this.total_pages = 0;

    // Tener preparado los textos como plantillas
    for (var field in this.links) this.links[field] = new Template(this.links[field]);
  },

  //---------------------------------------------
  // Getters & setters

  getCount: function() { return this.count;  },
  getTarget: function() { return this.container; },

  //---------------------------------------------
  // Base

  tableRemove: function() {
    var element = this.container.down();
    if (element != null) {
      element.childElements().invoke('stopObserving').invoke('remove');
      element.remove();
    }
    this.count = 0;
  },

  tableMake: function (list) { // Crea una tabla.
    this.count = list.length;
    var table = new Element(this.tags[0]); // TABLE
    if (this.header && list.length > 0) {
      var fields = list[0];
      var header = new Element(this.tags[1], {'class':'header'}); // TR
      for (var field in fields) {
        if (field == 'class') continue;
        var cell = new Element(this.tags[3]).update(field); // TH
        header.insert(cell);
      }
      table.insert(header);
    }
    for (var i=0; i<list.length; ++i) {
      var fields = list[i];
      var row = new Element(this.tags[1]); // TR
      for (var field in fields) {
        if (field == 'class') {
          row.addClassName(fields[field]);
        }
        else {
          var cell = new Element(this.tags[2], {'class':'field_'+field}); // TD
          var content = fields[field];
          if (this.links[field] != undefined) {
            var link = this.links[field].evaluate(fields);
            content = new Element('A',{href:link}).update(content);
          }
          cell.update(content);
          row.insert(cell);
        }
      }
      table.insert(row);
      if (this.onClick != undefined) {
        ////row.link_table = this;
        row.observe('click',this.cmd_click.bindAsEventListener(this));
      }
    }
    this.container.insert(table);
  },

  //---------------------------------------------
  // static methods (no necesita this)

  row_to_fields: function(row)  { // Convierta las etiquetas <td> en campos enumerables
    var fields = {};
    var cells = row.childElements();
    for (var i=0; i<cells.length; ++i) {
      var cell = cells[i];
      var field = cell.className.substring(6); // 'field_'
      var content = cell.innerHTML;
      fields[field] = content;
    }
    return fields;
  },

  //---------------------------------------------
  // Events

  cmd_click: function(event) { // Al picar una fila de la tabla. Aquí this es <tr>
    //Event.stop(event);
    /*---var fields = this.link_table.row_to_fields(this);
    this.link_table.onClick(fields);---*/
    var row = Event.findElement(event, this.tags[1]);
    var fields = this.row_to_fields(row);
    this.onClick(fields);
  },

  //----------------------------------------------
  // Public methods

  toggleData: function(filters) {  // Muestra u oculta los datos de forma alternativa
    if (this.container.visible()) {
      this.container.hide();
    }
    else {
      this.getData(filters);
      this.container.show();
    }
  },

  getData: function (filters, options) {  // Ej: table.getData({id_cliente: $F('id_cliente')});
    if (filters == undefined) filters = this.filters;
    var parameters = {
      cmd: 'table',
      query: this.query,
      filters: Object.toQueryString(filters)
    };

    options = options || {};
    if (options.num_page != undefined) {
      this.num_page = options.num_page;
      this.page_size = options.page_size || this.page_size;
      parameters.num_page = this.num_page;
      parameters.page_size = this.page_size;
    }

    Extranet.request(parameters, function(json) { // json: {ok,message,list[{fields}…]}
      this.tableRemove();
      if (json.ok == true) {
        this.tableMake(json.list);
        if (json.num_page != undefined) {
          this.num_page = json.num_page;
          this.total_pages = json.total_pages;
        }
        if (this.onLoad != undefined) {
          this.onLoad(this.num_page, this.total_pages);
        }
      }
      else {
        if (this.verbose) Msg.flashError('Tabla '+this.query, json.message);
      }
    }.bind(this), DB.url);
  } // getData

}); // DB.Table







/* Grid ========================================= */

/*
  Datos tabulares editables. Los datos se guardan todos a un mismo tiempo.
  Operaciones: Añadir/Editar/Borrar. La fila en blanco puede aparecer abajo o arriba.
  El HTML debe tener la estructura de la tabla: el encabezado y una fila de datos (@see DB.Grid.parse_columns)
  El id de <table> será 'grid' si no se indica la opción 'container'
  Todos las entradas serán <input>, no se admite <select> ni <textarea>, aún así pueden haber listas desplegables.
  Es muy útil como detalle de un DB.Record: mostrar registros relacionados con un determinado registro.
  Se pueden poner los datos directamente o provinientes de una petición AJAX.
  Si un campo se le asigna un 'dropdown' y se llama "campo_dropdow" significa que el campo precedente llamado "campo"
  contendrá el valor real del desplegable, mientras "campo_dropdown" servirá para almacenar el valor mostrado
  El primer <input> de la fila debe ser el campo ID de la tabla

  Teclado:
    CTRL+COMILLAS: Copia el valor del campo de la fila anterior
    CTRL+INICIO: Recupera el estado inicial de la fila, antes de las posibles modificaciones
    FLECHA ARRIBA O ABAJO: Sube o baja por las filas

  Ejemplos:
    var grid = new DB.Grid('clases', {orientation:'top', filters:{año:2009, profesor:'JUAN'}});
    new DB.Grid('facturas', {comboboxes:{id_empleado:'empleados', estado:['nuevo','enviada','cobrada'], revisado:{'0':'no', '-1':'sí'}}});
    new DB.Grid('poblaciones', {data:[{id:1,poblacion:'uno'},{id:2,poblacion:'dos'},{id:3,poblacion:'tres'}]});

  Pendiente:
    - this.columns podría extraerse directamente de los datos
    - Crear una clase de <input> que no se guardase

  HTML:
    <table id="grid">
      <thead>
        <tr>
          <th></th>
          <th>Id</th>
          <th name="campo1">titulo1</th>
          <th name="campo2">titulo2</th>
       </tr>
      </thead>
      <tbody>
        <tr>
          <th></th>
          <td><input type="text" name="id" disabled="true" /></td>
          <td><input type="text" name="campo1" /></td>
          <td><input type="text" name="campo2" /></td>
          <th><a href="#">Borrar</a></th>
        </tr>
        ...
      </tbody>
    </table>
*/
DB.Grid = Class.create({ // ProInf.net - sept-2009

  /*
    query: comando del servidor
    options: {container, columns, data, filters, dropdowns, byDefault, orientation, afterAddRow, afterChange, onCalcRow, commands, link_record, datalink, calcTotal}
  */
  initialize: function(query, options) {
    this.query = query; // Comando a enviar para recuperar los datos de la tabla
    //this.tagNames = {}; // 'INPUT' si no se indica otra cosa. Ver: parse_columns() y addRow

    options = options || {};
    this.container = $(options.container) || $(query) || $('grid');  // Elemento DOM que muestra el esta rejilla
      this.thead = this.container.select('thead')[0];
      this.tfoot = this.container.select('tfoot')[0];
      this.tbody = this.container.select('tbody')[0];

    this.columns = options.columns || this.parse_columns() || {}; // Nombres de los campos y sus atributos leídos del HTML
    this.data = options.data || null; // Datos de la rejilla
    this.filters = options.filters || {}; // Hash de los filtros con el nombre del campo y su valor
    this.byDefault = options.byDefault || {}; // Valores por omisión cuando es una nueva fila
    this.dropdowns = options.dropdowns || {}; // Listas desplegables asociada a 1 o 2 <input>
    this.orientation = options.orientation || 'bottom'; // Posición de la fila en blanco: 'top', 'bottom'
    this.afterAddRow = options.afterAddRow || undefined; // Parámetro <tr>
    this.afterChange = options.afterChange || undefined; // Parámetro <input>
    this.onCalcRow = options.onCalcRow || undefined; // Obtiene por parámetro fields y tr y retorna fields
    this.afterLoad = options.afterLoad || undefined; // Después de leer datos AJAX
    this.onSelectRow = options.onSelectRow || undefined; // Actual fila
    this.commands = options.commands || {'save':'cmd_save', 'cancel':'cmd_cancel', 'total':'cmd_total'};
    this.link_record = options.link_record || undefined; // Enlace con un DB.Record. Necesita option.datalink
    this.datalink = options.datalink || {}; // Relación maestro/detalle, por ej: {master:'id_field', slave:'id_field'}
    this.calcTotal = options.calcTotal || {}; // Funciones para calcular el total de cada columna. Recibe un array y retorna un valor.

    // Propiedades
    for (var column in this.columns) { this.columnId = column; break; } // La 1ª columna tiene el identificador

    // Link to record
    if (this.link_record != undefined) {
      this.link_record.link_grids = this.link_record.link_grids || {};
      this.link_record.link_grids[this.container.identify()] = this;
    }

    // Events
    var observe = function(cmd, listener) { if ($(cmd) != null) $(cmd).observe('click', listener); }
    observe($(this.commands['save']), this.cmd_save.bindAsEventListener(this));
    observe($(this.commands['cancel']), this.cmd_cancel.bindAsEventListener(this));
    observe($(this.commands['total']), this.cmd_total.bindAsEventListener(this));

    this.parse_columns(); // Actualiza: this.columns y this.columnId

    if (Object.isArray(this.data)) this.putData(this.data);
    else if (this.query != '') this.dbLoad();
    else this.clear();
  },

  // public interface ---------------------------

  // utilities ----------------------------------

  /*
    Obtiene la estructura de columnas a partir del DOM

    Pendiente:
    - Quizás sería mejor leer el HTML y crear un Template
  */
  parse_columns: function() {
    var attributes = 'type name id class style disabled readonly'.split(' ');
    var names = this.container.select('tbody tr:first-child *[name]').collect(function(element) {
      return element.name;
    });
    var columns = {};
    //this.tagNames = {};
    for (var n=0; n<names.length; ++n) {
      var column = names[n];
      var input = this.tbody.select('*[name='+column+']')[0];
      var parameters = {};
      //this.tagNames[column] = input.tagName;
      for (var a=0; a<attributes.length; ++a) {
        var attribute = attributes[a];
        var value = input.readAttribute(attribute);
        if (value != null) parameters[attribute] = value;
      }
      columns[column] = parameters;
    }
    return columns; ////alert('columnId='+this.columnId+'\ncolumns='+Object.toJSON(this.columns));
  },

  // events -------------------------------------

  cmd_save: function(event) {
    Event.stop(event);
    this.dbSave();
  },
  cmd_cancel: function(event) {
    Event.stop(event);
    this.undoRow(this.index);
  },
  cmd_total: function(event) {
    Event.stop(event);
    this.total();
  },

  inputOnKeyDown: function(event) {
    if (DB.dropdown != undefined) return; // Hay una lista desplegada

    var input = Event.element(event);

    var QUOTES = 50;
    switch(event.keyCode) {
      case Event.KEY_UP: // FLECHA ARRIBA = Ir a la fila de arriba
        Event.stop(event);
        if (this.orientation == 'top') this.inputDown();
        else this.inputUp();
        break;
      case Event.KEY_DOWN: // FLECHA ABAJO = Ir a la fila de abajo
        Event.stop(event);
        if (this.orientation == 'top') this.inputUp();
        else this.inputDown();
        break;
      case Event.KEY_HOME: // CONTROL+INICIO = Recupera la fila original
        if (event.ctrlKey) {
          Event.stop(event);
          /*var value = this.getValue(); // Restaura el valor inicial
          if (value != undefined) input.value = value;*/
          this.undoRow(this.index);
        }
        break;
      case QUOTES: // CONTROL+COMILLAS = Copiar el valor de arriba
        if (event.ctrlKey && this.isFirstRow() == false) {
          var up = this.getInput(input.name, this.index-1);
          if (up.value != '') {
            Event.stop(event);
            input.value = up.value;
            this.setDirty(input);
          }
        }
        break;
      default:
        //alert(event.keyCode+' '+event.ctrlKey);
    }
  },

  inputOnChange: function(event) {
    var element = Event.element(event);
    var tr = element.up(1);
    this.setDirty(element);

    this.fireAfterChange(element, tr); //if (this.afterChange != undefined) this.afterChange(element);
    this.fireOnCalcRow(tr);
  },

  inputOnFocus: function(event) {
    var input = Event.element(event);
    var tr = input.up(1);
    this.setIndex(tr.index);
    this.setColumn(input.name);
  },

  rowOnDelete: function(event) {
    Event.stop(event);
    var a = Event.element(event);
    var tr = a.up(1);
    tr.toggleClassName('deleted');
    if (tr.hasClassName('deleted')) a.writeAttribute('title','Recuperar');
    else a.writeAttribute('title','Borrar');
  },

  // fire event ---------------------------------

  fireOnCalcRow: function(tr) {
    if (this.onCalcRow != undefined) {
      var fields = this.getRowFields(tr);
      fields = this.onCalcRow(fields, tr);
      if (fields != undefined) {
        this.setRowFields(fields, tr);
      }
    }
  },

  fireAfterChange: function(input, tr) {
    if (this.afterChange != undefined) {
      var fields = this.afterChange(input);
      if (fields != undefined) {
        this.setRowFields(fields, tr);
      }
    }
  },

  fireOnSelectRow: function() {
    if (this.onSelectRow != undefined) {
      var fields = this.getRowFields();
      this.onSelectRow(fields);
    }
  },

  // methods ------------------------------------

  inputUp: function() {
    if (this.isFirstRow() == false) {
      this.setIndex(this.index - 1);
      this.getInput().focus();
    }
  },
  inputDown: function() {
    if (this.isLastRow() == false) {
      this.setIndex(this.index + 1);
      this.getInput().focus();
    }
  },

  /*
    Calcula el total de cada columna. La tabla debe tener TFOOT
    La función debe realizar el cálculo sobre un array de valores.
  */
  total: function() {
    if (this.tfoot == null) return;
    for (var column in this.calcTotal) {
      var func = this.calcTotal[column];
      var values = this.getData(column);
      this.setFoot(column, func(values));
    }
  },

  // getters & setters --------------------------

  setDirty: function(input) { // Marca el INPUT y el TR como modificado
    input.addClassName('dirty');
    input.up(1).addClassName('updated');
    if (this.isLastRow()) {
      //this.addRow.bind(this).delay(0.4/*second*/);
      this.addRow();
    }
  },

  getCount: function() { return this.count; }, // Número de filas
  getIndex: function() { return this.index; }, // Fila actual

  getRow: function(index) { // Retorna el TR indicado
    if (index == undefined) index = this.index;
    var childs = this.tbody.childElements();
    var row /*this.lastRow*/ = (this.orientation == 'top')? childs[childs.length-index-1]: childs[index];
    return row; //this.lastRow;
  },
  getColumnHead: function(column) { // Retorna el TH de la columna actual o el indicado
    if (column == undefined) column = this.column;
    return this.thead.select('*[name='+this.column+']')[0];
  },
  getInput: function(column, index) { // Retorna el INPUT actual o el indicado
    if (column == undefined) column = this.column;
    if (index == undefined) index = this.index;
    return this.getRow(index).select('*[name='+column+']')[0];
  },
  getInputFromRow: function(column, tr) {
    return tr.select('*[name='+column+']')[0];
  },

  setFoot: function(column, value) {
    var foot = this.tfoot.select('*[name='+column+']')[0];
    if (foot.tagName == 'INPUT') foot.value = value;
    else foot.update(value);
  },

  setIndex: function(index) { // Actualiza el índice de TR
    if (this.index != index) {
      if (this.index >= 0 && this.index < this.count) this.getRow().removeClassName('current');
      this.index = index;
      this.getRow().addClassName('current');
      this.fireOnSelectRow();
      ////if (this.isLastRow()) this.getRow().addClassName('new');
    }
  },
  setColumn: function(column) { // Actualiza el nombre de columna
    if (this.column != column) {
      if (this.column != '') this.getColumnHead().removeClassName('current');
      this.column = column;
      this.getColumnHead().addClassName('current');
    }
  },

  isFirstRow: function(index) {
    if (index == undefined) index = this.index;
    return this.index == 0; // (this.orientation == 'top')? (this.index == this.count-1): (this.index == 0);
  },
  isLastRow: function(index) {
    if (index == undefined) index = this.index;
    return this.index == this.count-1; //(this.orientation == 'top')? (this.index == 0): (this.index == this.count-1);
  },

  isBlankChild: function(i) { // La fial en blanco en referencia a: `this.tbody.childElements`
    return ((this.orientation=='top' && i==0) || (this.orientation!='top' && i==this.count-1));
  },

  /*getIdRow: function(index) { // Obtiene el id del tr
    return this.container.identify()+'_'+index;
  },*/

  // master -------------------------------------

  updateFromMaster: function() { // Se llama desde DB.Record para sincronizar sus detalles
    var id = $F(this.datalink.master);
    this.filters = {};
    this.filters[this.datalink.slave] = id;

    if (id == '') this.clear();
    else this.dbLoad(this.filters);

    if (this.link_record.isNew()) this.container.addClassName('hidden');
    else this.container.removeClassName('hidden');
  },

  // grid ---------------------------------------

  clear: function() {
    this.reset();
    this.addRow();
    this.setIndex(this.count - 1);
  },

  reset: function() { // public // Reinicia la tabla
    this.tbody.select('tr').invoke('remove');
    this.index = -1; // Fila actual
    this.count = 0; // Número de filas
    this.column = ''; // Nombre de la columna actual
    for (var column in this.calcTotal) this.setFoot(column, '…');
  }, // reset

  // row ----------------------------------------

  /*
    Los valores de los <input> vienen de fields
    dirty indica que está modificado y hace falta guardar
  */
  newRow: function(fields, dirty) { // Retorna una nueva fila <tr>
    fields = fields || {};
    dirty = dirty || false;

    var tr = new Element('TR'); // Fila
    if (dirty) tr.addClassName('updated');
    tr.insert(new Element('TH')); // Icono

    var previousInput = null;

    for (var column in this.columns) {
      // value
      var value = ''; //fields[column] || this.filters[column] || this.byDefault[column] || ''; // Asignación directa no funciona si hay un valor 0
      var isDefault = false; //(fields[column] == undefined) && (this.filters[column] != undefined || this.byDefault[column] != undefined);

      if (fields[column] != undefined) {
        value = fields[column];
      }
      else if (this.filters[column] != undefined) {
        value = this.filters[column];
        isDefault = true;
      }
      else if (this.byDefault[column] != undefined) {
        value = this.byDefault[column];
        isDefault = true;
      }

      // input
      var parameters = this.columns[column];
      var input = new Element('INPUT', parameters);
      input.value = value;
      if (dirty || isDefault) input.addClassName('dirty');

      if (parameters['disabled'] == undefined && parameters['readonly'] == undefined) {
        input.observe('keydown', this.inputOnKeyDown.bindAsEventListener(this));
        input.observe('focus', this.inputOnFocus.bindAsEventListener(this));
        input.observe('change', this.inputOnChange.bindAsEventListener(this));

        // combobox
        if (this.dropdowns[column] != undefined) {
          var options = {};
          if (column.endsWith('_dropdown')) {
            var name = column.substr(0, column.length - '_dropdown'.length);
            if (previousInput != null && previousInput.name == name) options['idElement'] = previousInput;
          }
          new DB.Dropdown(input, this.dropdowns[column], options);
        }
      }
      previousInput = input;

      // cell
      var td = new Element('TD');
      td.insert(input);
      tr.insert(td);
    }
    var th = new Element('TH'); // Comando
    var a = new Element('A',{href:'#', title:'Borrar'}).update('<span>borrar</span>');
    a.observe('click', this.rowOnDelete.bindAsEventListener(this));
    th.insert(a);
    tr.insert(th);

    try { Validate.automatic(tr); } catch(err) {}
    try { Calendar.automatic(tr); } catch(err) {}

    this.fireOnCalcRow(tr);

    return tr;
  }, // newRow

  addRow: function(fields, dirty) { // Añade una fila <tr>
    var tr = this.newRow(fields, dirty);
    tr.index = this.count;

    if (this.orientation == 'top') this.tbody.insert({top:tr});
    else this.tbody.insert(tr); // bottom

    this.count++;
    ////this.setIndex(this.count - 1);

    if (this.afterAddRow != undefined) this.afterAddRow(tr);

    return tr;
  }, // addRow

  changeRow: function(row, fields, dirty) { // Cambia una fila <tr> por otra <tr>
    var tr = this.newRow(fields, dirty);
    tr.index = row.index;

    row.select('*').invoke('stopObserving');
    row.insert({after:tr}).stopObserving().remove();

    return tr;
  }, // changeRow

  removeRow: function(row) { // Borra la fila <tr>
    row.select('*').invoke('stopObserving');
    row.stopObserving().remove();
    // this.count--; // No tocar la cuenta
    // Sería necesario reindexar las filas,
    //  pero no se hace aquí porque quizás haya que borrar varias filas
  },

  reindexRows: function() { // Renumera las filas <tr> (por si se han borrado algunas)
    var rows = this.tbody.childElements();
    this.count = rows.length;
    for (var i=0; i<rows.length; ++i) {
      if (this.orientation == 'top')
        rows[i].index = this.count-i-1;
      else
        rows[i].index = i;
    }
    this.setIndex(this.count - 1);
  },

  undoRow: function(index) { // Recupera el valor inicial de la fila
    if (index == undefined) index = this.index;
    if (index >= this.data.length) return false;
    var fields = this.data[index];
    for (var column in fields) {
      var input = this.getInput(column, index);
      input.value = fields[column];
      if (this.dirty == false) input.removeClassName('dirty');
    }
    if (this.dirty == false) this.getRow(index).removeClassName('updated');
    this.fireOnCalcRow(this.getRow(index));
    return true;
  },

  // rows ---------------------------------------

  markDeleted: function() { // public
    var rows = this.tbody.childElements();
    for (var i=0; i<rows.length-1; ++i) {
      var tr = rows[i];
      tr.toggleClassName('deleted');
    }
  },

  // data ---------------------------------------

  getValue: function(column, index) { // Obtiene un único valor
    if (column == undefined) column = this.column;
    if (index == undefined) index = this.index;
    if (index >= this.data.length) return undefined;
    var columns = this.data[index];
    return columns[column];
  },

  getRowFields: function(tr) { // Obtiene un hash
    if (tr == undefined) tr = this.getRow();
    var fields = {};
    for (var column in this.columns) {
      var input = tr.select('*[name='+column+']')[0]; // this.getInput(column, index);
      fields[column] = input.value;
    }
    return fields;
  },
  setRowFields: function(fields, tr) { // Actualiza los valores de la fila indicada
    for (var column in this.columns) {
      var input = tr.select('*[name='+column+']')[0]; // this.getInput(column, index);
      if (fields[column] != undefined) {
        if (input.value != fields[column]) {
          input.addClassName('dirty').value = fields[column];
        }
      }
    }
  },

  /*
    Retorna un array con todos los valores de la columna indicada
    o un array de hash de toda la tabla si no se indicó ninguna columna
  */
  getData: function(column) {
    var index = 0;
    var data = [];
    var rows = this.tbody.childElements();
    this.count = rows.length;

    if (column == undefined) { // [{},…]
      for (var i=0; i<rows.length; ++i) {
        if (this.isBlankChild(i)) continue;
        var fields = {};
        var tr = rows[i];
        if (tr.hasClassName('deleted')) continue;
        for (var column in this.columns) {
          var input = this.getInputFromRow(column, tr);
          fields[column] = input.value;
        }
        data[index++] = fields;
      }
    }
    else { // array con los valores de la columna: […]
      for (var i=0; i<rows.length; ++i) {
        if (this.isBlankChild(i)) continue;
        var tr = rows[i];
        if (tr.hasClassName('deleted')) continue;
        var input = this.getInputFromRow(column, tr);
        data[index++] = input.value;
      }
    }
    return data;
  },

  putData: function(data, options) { // public // Array de hash --> input
    data = data || [];
    options = options || {};
    if (options.dirty == undefined) options.dirty = true;
    this.dirty = options.dirty; // Marcar como modificado (necesita guardarse) desde el inicio
    this.data = data;
    this.reset();
    for (var i=0; i<data.length; ++i) {
      var fields = data[i];
      if (fields) this.addRow(fields, this.dirty);
      /*---for (var column in fields) { // FIXED: Este código era realmente lento
        var input = this.getInput(column);
        input.value = fields[column];
        if (this.dirty) input.addClassName('dirty');
      }
      if (this.dirty) this.getRow().addClassName('updated');---*/
    }
    this.addRow();
    this.setIndex(this.count - 1);
  }, // putData

  getDataToSave: function(options) { // input --> Array of hash
    options = options || {};
    var dirty = options.dirty || false; // Los que cambiaron o sino todos

    var index = 0;
    var data = [];
    var actions = [];
    var rows = this.tbody.childElements();
    this.count = rows.length;

    for (var i=0; i<rows.length; ++i) {
      if (this.isBlankChild(i)) continue;

      var tr = rows[i];
      var id = this.getInputFromRow(this.columnId, tr).value;
      var action = '';
      if (tr.hasClassName('deleted')) {
        if (id != '') action = 'delete';
      }
      else if (tr.hasClassName('updated')) {
        action = (id == '')? 'insert': 'update';
      }

      if (dirty == false || action != '') {
        var fields = {};
        for (var column in this.columns) {
          if (column.endsWith('_dropdown') || column.endsWith('_label')) continue;

          var input = this.getInputFromRow(column, tr);

          if ( dirty==false || (action!='insert' && column==this.columnId) || (action!='delete' && input.hasClassName('dirty')) ) {
            if (column == this.columnId)
              fields['id'] = input.value;
            else
              fields[column] = input.value;
          }
        }
        data[index] = fields;
        actions[index] = action;
        ++index;
      }
    }
    return {data:data, actions:actions};
  }, // getDataToSave

  /*
    Después de guardar actualiza con los nuevos datos las filas que han cambiado
    oks indica que filas se cambiaron en la BD y newdata tiene los nuevos datos

    oks: [true|false,...]
    newdata: [{field:value,...},...]
  */
  putDataFromSave: function(oks, newdata) {
    var index = 0;
    var rows = this.tbody.childElements();
    this.count = rows.length;

    for (var i=0; i<rows.length; ++i) {
      if (this.isBlankChild(i)) continue;

      var tr = rows[i];
      if (tr.hasClassName('updated') || tr.hasClassName('deleted')) {
        var ok = oks[index];
        var record = newdata[index];
        index++;
        if (ok) {
          if (tr.hasClassName('updated')) {
            var fields = {};
            for (var column in this.columns) { // Recuperar los datos de la fila actual
              var input = this.getInputFromRow(column, tr);
              fields[column] = input.value;
            }
            for (var column in record) { // Nuevos datos para la fila actual
              var value = record[column];
              fields[column] = value;
            }
            this.changeRow(tr, fields);
          }
          else {
            this.removeRow(tr);
          }
        }
      }
    }
    this.reindexRows();
  }, // putDataFromSave

  clearNewRowsDeleted: function() {
    var rows = this.tbody.childElements();
    this.count = rows.length;
    for (var i=0; i<rows.length; ++i) {
      var tr = rows[i];
      if (this.isBlankChild(i)) {
        tr.removeClassName('deleted');
      }
      else {
        var id = this.getInputFromRow(this.columnId, tr).value;

        if (tr.hasClassName('deleted') && id=='') { // Si está marcada para borrar y no existe en la BD
          this.removeRow(tr);
        }
      }
    }
    this.reindexRows();
  },

  // permanence ---------------------------------

  /*
    Obtiene un registro y actualiza los <input> según los nombres de campo de la fila actual
    callback - es opcional. Recibe fields y retorna booleano. Si retorna FALSE actualiza los <input>
  */
  dbAutocalc: function(id, query, callback) {
    if (id == '') return;
    if (callback != undefined) this.callback = callback;
    var parameters = {
      cmd: 'get',
      query: query,
      id: id
    };
    Extranet.request(parameters, function(json) { // fields
      if (json.ok == true) {
        var processed = (this.callback == undefined)? false: this.callback(json.fields);
        if (processed == false) {
          var tr = this.getRow();
          for (var column in json.fields) {
            var input = this.getInputFromRow(column, tr);
            var value = json.fields[column];
            if (input != null && input.value != value) {
              input.addClassName('dirty').value = value;
              tr.addClassName('updated');
            }
          }
        }
      }
    }.bind(this), DB.url);
  },

  dbLoad: function(filters) { // public // Recupera datos
    if (filters != undefined) this.filters = filters;
    var parameters = {
      cmd: 'grid',
      query: this.query,
      filters: Object.toQueryString(this.filters)
    };
    Extranet.request(parameters, function(json) { // json: {ok,message,list:[{fields},…]}
      if (json.ok == true) {
        //Msg.flashOk('Datos cargados', json.message);
        this.putData(json.list, {dirty:false});
      }
      else {
        Msg.flashWarning('Rejilla '+this.query, json.message);
        this.clear();
      }
      if (this.afterLoad != undefined) this.afterLoad(json.list);
    }.bind(this), DB.url);
  }, // dbLoad


  dbSave: function() { // Guarda los datos
    var result = this.getDataToSave({dirty:true});
    if (result.data.length == 0) {
      Msg.flashWarning('No hay nada que guardar');
      this.clearNewRowsDeleted();
      return;
    }

    ////alert(Object.toJSON(result)); return; // Comentar esta línea

    var parameters = {
      cmd: 'save',
      query: this.query,
      actions: result.actions.join(','),
      data: Object.toJSON(result.data)
    };

    Extranet.request(parameters, function(json) { // json: {ok,message}

      if (json.ok == true) Msg.flashOk('Guardar '+this.query, json.message);
      else Msg.error('Guardar '+this.query, json.message);

      this.putDataFromSave(json.oks, json.newdata);
      if (json.verbose) Msg.info(json.verbose);
    }.bind(this), DB.url);

  } // dbSave

}); // DB.Grid






/* DROPDOWN ===================================== */

/*
  Muestra una lista desplegable que se asocia a un elemento <input> aunque puede ser <div> u otro.
  No necesita código HTML de apoyo.
  Si el elemento es <input> la lista es filtrada al teclear (desde el lado cliente)
  Es como un combobox o <select> porque diferenciamos entre el valor seleccionado y el mostrado
  Funciona como Ajax.autocompleter pero en este caso sólo se hace una petición al servidor por comando.
  La lista puede trabajar con un <input>: el valor seleccionado en 'element'
    o con dos <input>: el valor mostrado en 'element' y el valor seleccionado en 'idElement'.
  Si había un valor en 'idElement' se utiliza para encontrar el valor de 'element'
  Es muy útil en DB.Grid ya que para una misma columna sólo hace una petición AJAX.

  Teclado:
    ALT+FLECHA ABAJO: Desplegar lista
    ESC: Ocultar lista
    FLECHA ARRIBA/ABAJO: Retroceder o avanzar por la lista
    ENTER ó TAB: Realizar la selección

  Ejemplos:
    new DB.Dropdown('numeros',     [0,1,2,3,4,5,6,7,8,9] );
    new DB.Dropdown('estaciones',  ['primavera','verano','otoño','invierno'] );
    new DB.Dropdown('sino',        {'0':'no', '-1':'sí'} );
    new DB.Dropdown('poblaciones', 'poblaciones', {idElement:'id_poblaciones'} ); // AJAX request
    new DB.Dropdown('paises',      {'a':'andorra', 'b':'bélgica', 'c':'canadá', 'd':'dinamarca'}, {idElement:'id_paises'} );
    new DB.Dropdown('buscar',     'clientes', {type:'autocomplete', waiting:'icon-searching', selectElement:function(value,label,li) {alert(value);} });

  Actualizaciones:
    * Hay la opcion de que se comporter igual que Ajax.autocompleter
    * Admite <textarea> y funciona dentro de cada una de sus líneas

  Pendiente:
    * Al desplazarse con las flechas seguir el scroll
*/
DB.Dropdown = Class.create({ // ProInf.net — ago-2009
  /*
    element: elemento en el que se mostrará la lista desplegable, normalmente un <input>
    query: opciones de la lista: array [], hash {} o comando AJAX ""
    options: {idElement, filters, callback, cssclass, positioning, type, selectElement, waiting}
  */
  initialize: function(element, query, options) {
    this.element = $(element); // Elemento que activa la lista y recibe su resultado; el valor mostrado (a no ser que se especique idElement)
    this.query = query; // Array de opciones, hash de opciones o petición AJAX (string)

    // Opciones
    options = options || {};
    this.filters = options.filters || undefined; // Se aplican sobre la petición AJAX
    this.callback = options.callback || undefined; // Después de mostrar la lista
    this.idElement = $(options.idElement) || undefined; // Elemento que recibe el valor seleccionado, el valor mostrado corresponde entonces a element
    this.cssclass = options.cssclass || null; // Clase de la lista desplegada (además de dropdown)
    this.positioning = options.positioning || 'offset'; // Forma de calcular el posicionamiento: 'none','clone','offset'
    this.type = options.type || 'auto';  // Tipo de datos de list: 'array', 'hash', 'ajax', 'autocomplete' (obligatorio para autocomplete)
    this.selectElement = options.selectElement || undefined; // Evento al cambiar el texto (para autocomplete)
    this.waiting = $(options.waiting) || undefined; // Elemento DOM con la animación de esperando (para autocomplete)

    // Propiedades
    this.container = null; // Contenedor de la lista: <div class="dropdown"><ul><li id="dd_id">label</li>…</ul></div>
    this.prefix = 'dd_'; // Prefijo al id "<li id="dd_id">label</li>"
    this.list = null; // Contiene el array o el hash de opciones y si es ajax el array de hash
    this.noblur = false; // No quitar la lista al desenfocar <input> cuando se esté creando la lista
    this.change = true; // Enviar evento 'change' al cambiar el valor de los <input> al inicializar
    this.item = null; // Elemento <li> actual
    ////this.first = null; // Primer <li> filtrado por teclado. Si no hay filtro vale null

    // Eventos
    this.element.observe('click', this.elementClick.bindAsEventListener(this));
    if (this.element.tagName == 'INPUT' || this.element.tagName == 'TEXTAREA') {
      this.element.observe('blur', this.elementBlur.bindAsEventListener(this));
      this.element.observe('keydown', this.inputOnKeyDown.bindAsEventListener(this));
    }

    // Tipo de comando
    if (this.type == 'auto') {
      if (typeof(this.query) == 'string') this.type = 'ajax';
      else if (Object.isArray(this.query)) this.type = 'array';
      else this.type = 'hash';
    }

    if (this.type == 'autocomplete') { // Que el navegador no autorrellene el <input>
      if (this.element.tagName == 'INPUT' || this.element.tagName == 'TEXTAREA') {
        this.element.setAttribute('autocomplete', 'off');
      }
    }

    switch (this.type) {
      case 'array': this.list = query; break;
      case 'hash': this.list = query; this.setLabelFromList(); break;
      case 'ajax': this.request_list(); break;
      case 'autocomplete': break;
    }

  }, // initialize

  // public interface ---------------------------

  isDropdown: function() {
    return this.container != null;
  },

  // getters & setters --------------------------

  getValue: function(element) {
    element = element || (this.idElement != undefined? this.idElement: this.element);
    if (element.tagName == 'INPUT') return element.value;
    else if (element.tagName == 'TEXTAREA') return Util.getCurrentTextareaLine(element);
    else return element.innerHTML.stripTags();
  },
  setValue: function(value) {
    var element = this.idElement != undefined? this.idElement: this.element;
    if (element.tagName == 'INPUT') {
      element.value = value;
      if (this.change == true) Util.fireEvent(element, 'change');
    }
    else if (element.tagName == 'TEXTAREA') {
      Util.replaceCurrentTextareaLine(element, value);
      element.selectionStart = element.value.length;
      if (this.change == true) Util.fireEvent(element, 'change');
    }
    else element.update(value);
  },
  setLabel: function(label) {
    if (this.idElement != undefined) {
      if (this.element.tagName == 'INPUT') {
        this.element.value = label;
        if (this.change == true) Util.fireEvent(this.element, 'change');
      }
      else if (this.element.tagName == 'TEXTAREA') {
        Util.replaceCurrentTextareaLine(element, label);
        element.selectionStart = element.value.length;
        if (this.change == true) Util.fireEvent(this.element, 'change');
      }
      else this.element.update(label);
    }
  },
  setLabelFromList: function() {
    this.change = false;
    this.setLabel(this.getListLabel());
    this.change = true;
  },

  getItemValue: function(item) {
    if (item.id != '') return item.id.substr(this.prefix.length);
    else return item.innerHTML.stripTags();
  },
  getItemLabel: function(item) {
    return item.innerHTML.stripTags()
  },

  getListLabel: function(key) {
    if (key == undefined) key = this.getValue();
    switch (this.type) {
      case 'array': return this.list.indexOf(key)>=0? key: null;
      case 'hash': return this.list[key];
      case 'ajax':
        //var label = this.getMemory(key);
        //if (label != undefined) return label;
        for (var i=0; i<this.list.length; ++i) {
          var item = this.list[i];
          if (item['id'] == key) {
            var label = item['label'];
            //this.setMemory(key, label);
            return label;
          }
        }
        return null;
    }
  },

  /*getMemory: function(key) {
    DB.hashs = DB.hashs || {};
    DB.hashs[this.query] = DB.hashs[this.query] || {};
    return DB.hashs[this.query][key];
  },
  setMemory: function(key, value) {
    DB.hashs[this.query][key] = value;
  },*/

  // events -------------------------------------

  elementClick: function(event) {
    //Event.stop(event);
    if (this.container == null) this.listMake();
    else this.listRemove();
  },
  elementBlur: function(event) {
    if (this.noblur == false) {
      Event.stop(event);
      this.elementBlurDelayed.bind(this).delay(0.5/*seconds*/); // DESCOMENTAR ESTA LÍNEA
    }
  },
  elementBlurDelayed: function() {
    this.setLabelFromList(); // Restaurar element desde idElement por si el texto de element fuese incorrecto
    this.listRemove();
  },

  inputOnKeyDown: function(event) {
    //$('test').update($('test').innerHTML + ' ' + event.keyCode); // COMENTAR

    if (this.container == null) {
      switch(event.keyCode) {
        case Event.KEY_DOWN: // ALT y flecha abajo
          if (event.altKey) this.listMake();
          return;
        case 115 /* F4 */:
          this.listMake();
          return;
        case Event.KEY_RETURN:
          if (this.element.tagName == 'TEXTAREA') { this.listMake(); return; }
      }
    }
    else { // Lista ya desplegada
      switch(event.keyCode) {
        ////case Event.KEY_TAB:
        case Event.KEY_RETURN:
          this.selectItem();
          Event.stop(event);
          return;
        case 115 /* F4 */:
        case Event.KEY_ESC:
          this.listRemove();
          Event.stop(event);
          return;
        case Event.KEY_UP:
          this.previousItem();
          Event.stop(event);
          return;
        case Event.KEY_DOWN:
          this.nextItem();
          Event.stop(event);
          return;
      }
    }

    if (event.keyCode >= 48 || event.keyCode == 8 /*BACKSPACE*/ || event.keyCode == 46 /*SUPR*/ ) {
      if (this.timeout) clearTimeout(this.timeout);
      if (this.type == 'autocomplete')
        this.timeout = setTimeout(this.request_autocompleter.bind(this), 400/*milliseconds*/);
      else
        this.timeout = setTimeout(this.listFilter.bind(this), 400/*milliseconds*/);
    }
  },

  itemHover: function(event) {
    var item = Event.findElement(event, 'LI');
    this.changeItem(item);
  },

  itemClick: function(event) {
    //Event.stop(event);
    var item = Event.findElement(event, 'LI');
    this.selectItem(item);
  },

  // items --------------------------------------

  selectItem: function(item) { // Seleccionar un elemento de la lista
    this.listRemove();
    this.element.focus();
    if (item == undefined) item = this.item;
    var value = this.getItemValue(item);
    var label = this.getItemLabel(item);

    if (this.selectElement != undefined) {
      this.selectElement(value, label, item);
    }
    else {
      this.setValue(value);
      this.setLabel(label);
    }
  },

  previousItem: function() { // Seleccionar el elemento anterior de la lista
    var item = this.item;
    do {
      item = item.previous();
      if (item == undefined) return;
    } while (item.visible() == false);
    this.changeItem(item);
  },

  nextItem: function() { // Seleccionar el siguiente elemento de la liata
    var item = this.item;
    do {
      item = item.next();
      if (item == undefined) return;
    } while (item.visible() == false);
    this.changeItem(item);
  },

  changeItem: function(item) {
    if (this.item != null) this.item.removeClassName('selected');
    this.item = item;
    this.item.addClassName('selected');
  },

  makeItem: function(id,label) {
    if (this.type == 'autocomplete') {
      label = label.replace(this.regexp, '<strong>$1</strong>');
    }
    //else label = label.escapeHTML();

    var li = new Element('LI', {id: this.prefix+id}).update(label);
    if (id == this.value) {
      li.addClassName('current'); // El valor actual
      li.addClassName('selected');
      this.changeItem(li);
    }
    li.observe('click', this.itemClick.bindAsEventListener(this));
    li.observe('mouseover', this.itemHover.bindAsEventListener(this));
    return li;
  }, // itemMake

  // list ---------------------------------------

  listFilter: function() { // Filtra la lista según lo tecleado
    this.listMake();

    var value = this.getValue(this.element); //this.element.value; // 2011-02-09
    var items = this.container.down().childElements();
    var regexp = new RegExp('('+RegExp.escape(value)+')','i');
    var first = null;
    for (var i=0; i<items.length; ++i) {
      var item = items[i];
      var label = this.getItemLabel(item);
      if (regexp.test(label)) {
        var html = label.replace(regexp, '<strong>$1</strong>');
        item.update(html);
        item.show();
        if (first == null) first = item;
      }
      else item.hide();
    }
    if (first != null) this.changeItem(first);
  },

  listMake: function() { // Crea la lista
    if (this.container != null || this.list == null) return;
    else this.container = new Element('DIV', {'style':'display:none;'});

    if (this.cssclass != null) this.container.addClassName(this.cssclass);
    else if (this.type == 'autocomplete') this.container.addClassName('autocomplete');
    else this.container.addClassName('dropdown');

    var ul = new Element('UL');
    this.value = this.getValue();
    this.item = null;
    //ul.insert(new Element('LI')); // Elemento vacío

    switch (this.type) {
      case 'ajax':
        this.list = DB.dropdowns[this.query]; // Actualiza la lista a la última versión disponible (ver DB.update_dropdowns)
        break;
      case 'autocomplete':
        this.regexp = Util.regexpAnyWord(this.getValue());
        break;
    }
    switch (this.type) {
      case 'array': // [label,…] → <li>label</li>…
        this.count = this.list.length;
        for (var i=0; i<this.count; ++i) {
          var id = this.list[i];
          var li = this.makeItem(id,id);
          ul.insert(li);
        }
        break;
      case 'hash': // {id:label,…} → <li id="dd_id">label</li>…
        this.count = 0;
        for (var id in this.list) {
          var li = this.makeItem(id,this.list[id]);
          ul.insert(li);
          ++this.count;
        }
        break;
      case 'ajax':
      case 'autocomplete':
      // [{id,label},…]             → <li id="dd_id">label</li>…
      // [{id,label,group,class},…] → <li id="dd_id" class="class separator">label</li>…
        var group = null;
        this.count = this.list.length;
        for (var i=0; i<this.count; ++i) {
          var fields = this.list[i];
          var li = this.makeItem(fields['id'],fields['label']);
          if (fields['class'] != undefined) li.addClassName(fields['class']);
          if (fields['group'] != undefined && fields['group'] != group) {
            group = fields['group'];
            if (i != 0) li.addClassName('separator');
          }
          ul.insert(li);
        }
        break;
    }
    this.container.insert(ul);

    if (this.count != 0 && this.item == null) {
      this.changeItem(/*this.container.down()*/ul.firstDescendant());
    }

    this.noblur = true; // BEGIN NO BLUR

    this.placeContainer();
    this.container.show();

    // Mostrar el elemento seleccionado aunque esté fuera del área visible (scroll)
    if (this.item != null && this.type != 'autocomplete') {
      location.href = '#'+this.item.id; history.back(); //location.replace('#'+this.item.id); //window.clearTimeout(this.timeout);
      this.element.focus();
    }

    this.noblur = false; // END NO BLUR

    if (DB.dropdown != undefined) DB.dropdown.listRemove(); // Borrar otro dropdown que estuviese desplegado
    DB.dropdown = this;

    if (this.callback != undefined) this.callback();
  }, // listMake

  placeContainer: function() {
    switch (this.positioning) {
      case 'none':
        this.element.insert({after:this.container});
        break;
      case 'clone': // Copiado de Ajax.Autocompleter
        this.element.insert({after:this.container});
        this.container.style.position = 'absolute';
        Position.clone(this.element, this.container, {
          setHeight: false,
          offsetTop: this.element.offsetHeight
        });
        break;
      case 'offset':
        $(document.body).insert(this.container);
        var offset = this.element.cumulativeOffset();
        var x = offset.left;
        var y = offset.top + this.element.getHeight();
        this.container.setStyle({ position:'absolute', left:x+'px', top:y+'px' });
        break;
    }
  }, // placeContainer

  listRemove: function() {
    if (this.container == null) return;
    this.container.select('li').invoke('stopObserving').invoke('remove');
    this.container.remove();
    this.container = null;
    DB.dropdown = undefined;
  },

  // ajax ---------------------------------------

  /*
    Emula Ajax.Autocompleter pero la respuesta recibida el JSON en vez de HTML
  */
  request_autocompleter: function() {
    var parameters = {
      cmd: 'search',
      query: this.query,
      search: this.getValue()
    };
    if (this.waiting != undefined) this.waiting.show();
    Extranet.request(parameters, function(json) { // json: {ok, message, list:[{id,label,group},…]}
      if (this.waiting != undefined) this.waiting.hide();
      if (json.ok) {
        this.list = json.list;
        this.listRemove();
        this.listMake();
      }
      else {
        this.listRemove();
        ////Msg.flashError('Autocomplete '+this.query, json.message);
      }
    }.bind(this), 'server/autocompleter.php');
  },

  /*
    El objetivo es minimizar el número de peticiones AJAX.
    Todos los dropdown que tengan el mismo 'query' pueden compartir la misma petición.
  */
  request_list: function() { // AJAX request
    DB.dropdowns = DB.dropdowns || {};
    if (Object.isArray(DB.dropdowns[this.query])) { // ¿La búsqueda ha finalizado?
      this.end_request();
    }
    else if (DB.dropdowns[this.query] == undefined) { // ¿Aún no empezó la búsqueda?
      DB.dropdowns[this.query] = 'waiting…'; // Comienza la búsqueda
      var parameters = {
        cmd: 'combobox',
        query: this.query
      };
      if (this.filters != undefined) {
        parameters['filters'] = Object.toQueryString(this.filters);
      }
      Extranet.request(parameters, function(json) { // json: {ok,message,list:[{id,label,group,class},…]}
        if (json.ok == true) {
          DB.dropdowns[this.query] = json.list; // Búsqueda finalizada; recordar para los demás
          this.notify_end_request();
          this.end_request();
        }
        else {
          Msg.flashError('Desplegable '+this.query, json.message);
        }
      }.bind(this), DB.url);
    }
    else { // La búsqueda está en marcha
      this.waiting_end_request();
    }
  }, // request_list

  // waiting request ----------------------------

  waiting_prepare: function() {
    DB.waiting = DB.waiting || {};
    DB.waiting[this.query] = DB.waiting[this.query] || [];
  },
  waiting_end_request: function() {
    this.waiting_prepare();
    DB.waiting[this.query].push(this);
  },
  notify_end_request: function() {
    this.waiting_prepare();
    for (var i=0; i<DB.waiting[this.query].length; ++i) {
      var dropdown = DB.waiting[this.query][i];
      dropdown.end_request();
    }
    DB.waiting[this.query].clear();
  },
  end_request: function() {
    this.list = DB.dropdowns[this.query];
    this.setLabelFromList();
  }

}); // DB.Dropdown






/*
  Calendario por semanas de los días seleccionados.
  Necesita un array de fechas directo o por AJAX.
  El calendario es una <table> de la clase CSS 'dbcalendar'.
  Los días <td> se marcan con 'dbcalendar-past' o 'dbcalendar-futur'.
  Distinguimos los días en meses pares 'dbcalendar-even' de los días en meses impares 'dbcalendar-odd'.
  El fin de semana es 'dbcalendar-weekend' y el mes 'dbcalendar-month'.

  Requisitos:
    date.js (proinf.net)

  Ejemplos:
    new DB.Calendar('calendario-curso', {dates:'2009-09-23 2009-09-28 2009-09-30'.split(' ')});
    new DB.Calendar('calendario-curso').loadDates({id_curso:'AB-01-09'});
*/
DB.Calendar = Class.create({ // Proinf.net - sep-23

  /*
    query: comando del servidor y nombre del contenedor
    options: {container, dates, filters, emptyWeeks}
  */
  initialize: function(query, options) {
    this.query = query;

    options = options || {};
    this.container = $(options.container) || $(query);
    this.dates = options.dates || undefined; // Array de fechas
    this.filters = options.filters || {}; // Filtros para AJAX
    this.emptyWeeks = options.emptyWeeks || false; // ¿Mostrar semanas vacías?

    if (Object.isArray(this.dates)) this.putDates(this.dates);
    else this.loadDates(this.filters);
  },

  // data ---------------------------------------

  putDates: function (dates) {
    // Estructura
    var table = new Element('TABLE',{'class':'dbcalendar'});
    var thead = new Element('THEAD');
    var tbody = new Element('TBODY');
    table.insert(thead);
    table.insert(tbody);

    // Encabezado
    var tr = new Element('TR');
    tr.insert(new Element('TD'));
    for (var i=0; i<7; ++i) {
      var weekDay = Date.WEEKDAYS_NAMES[i].substr(0,3);
      var th = new Element('TH').update(weekDay);
      if (i>=5) th.addClassName('dbcalendar-weekend');
      tr.insert(th);
    }
    thead.insert(tr);

    // Convertir a fechas
    for (var i=0; i<dates.length; ++i) {
      var date = dates[i];
      if (typeof(date) == 'string') dates[i] = date.parseDateTime();
    }

    // Datos
    if (dates.length > 0) {
      dates.sort(function(a,b) { return a-b; });
      var index = 0;
      var date = dates[0].getMonday();
      var monthYear = '';
      var lastMonthYear = '';
      var month = -1;
      var today = new Date();
      while(index < dates.length) {
        var tr = new Element('TR');
        var weekOfYear = date.getWeekOfYear();
        tr.insert(new Element('TH').update(weekOfYear));
        var ok = false;
        for (var i=0; i<7; ++i) {
          month = date.getMonth();
          var dayOfMonth = date.getDate();
          var td = new Element('TD').update(dayOfMonth);
          if (index < dates.length && date.equalsDate(dates[index])) {
            ok = true;
            do { ++index; } while (index < dates.length && date.equalsDate(dates[index]));
            if (date < today) td.addClassName('dbcalendar-past');
            else td.addClassName('dbcalendar-futur');
            td.writeAttribute('title', date.toCustomDateString());
          }
          if (i>=5) td.addClassName('dbcalendar-weekend');
          if (i==6) monthYear = date.getMonthName() + ' ' + date.getFullYear();
          td.addClassName(((month % 2) == 0)? 'dbcalendar-even': 'dbcalendar-odd');
          tr.insert(td);
          date.addDays(1);
        }
        if (this.emptyWeeks == false && ok == false) continue;
        if (monthYear != lastMonthYear) {
          lastMonthYear = monthYear;
          var td = new Element('TD', {'class':'dbcalendar-month'}).update(monthYear);
          td.addClassName(((month % 2) == 0)? 'dbcalendar-even': 'dbcalendar-odd');
          tr.insert(td);
        }
        tbody.insert(tr);
      }
    }

    this.container.update(table);
  },

  // ajax ---------------------------------......

  loadDates: function (filters) {
    parameters = {
      cmd: 'table',
      query: this.query,
      filters: Object.toQueryString(filters)
    };
    Extranet.request(parameters, function(json) {
      if (json.ok == true) {
        var dates = Util.toArray(json.list).flatten();
        this.putDates(dates);
      }
      else {
        Msg.flashError('Calendar '+this.query, json.message);
        this.container.update('');
      }
    }.bind(this), DB.url);
  }

}); // DB.Calendar


/* */
