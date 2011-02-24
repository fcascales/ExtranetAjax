/*
  extranet.js — proinf.net — ago-2009, feb-2011
  version 1.3

  Contiene los métodos más habituales:
    Msg            - Para mostrar mensajes: flashOk, ok, etc.
    Extranet       - Para la gestión base de AJAX: request
    UserSession    - Para autenticar usuarios: validate, disconnect
    Util           - Miscelánea: queryString, fireEvent
    Interface      - Ayudas al interfaz
    Interface.Tabs - Pestañas

  Actualizaciones:
    2011-02-08 — Msg actualiza el span que contiene. Así el mensaje no ocupa el 100% de la página
    2011-02-08 — Añadido Util.popup para crear enlaces con ventanas emergentes
    2011-02-09 — Añadido Util.getCurrentTextareaLine y Util.replaceCurrentTextareaLine
    2011-02-10 — Añadido Interface.popup que muestra un div popup emergente
*/

function init() {
  Interface.automatic();

  $('msg').observe('click',function() { Msg.hide(); });
}
Event.observe(window,'load', init);

/* MESSAGE & FLASH ============================== */

var Msg = { // Muestra mensajes dentro de la página

  // flash ----------------------------------------
  // los mensajes hacen cola y duran un cierto tiempo

  // flash messages (durante unos segundos)
  flashOk:      function(title,msg) { this._comes({container:'flash', type:'ok',      title:title, msg:msg}); },
  flashError:   function(title,msg) { this._comes({container:'flash', type:'error',   title:title, msg:msg}); },
  flashWarning: function(title,msg) { this._comes({container:'flash', type:'warning', title:title, msg:msg}); },
  flashInfo:    function(title,msg) { this._comes({container:'flash', type:'info',    title:title, msg:msg}); },

  flashHide: function () {
    $('flash').writeAttribute('class',null)/*.hide()*/;
    if (Msg.fx != undefined) Msg.fx($('flash'),false); else $('flash').hide();
  },

  // msg ------------------------------------------
  // los mensajes se muestran inmeditamente y permanecen hasta que se les hace clic

  ok:      function(title,msg) { this._show({container:'msg', type:'ok',      title:title, msg:msg});  this._close_icon(); },
  error:   function(title,msg) { this._show({container:'msg', type:'error',   title:title, msg:msg});  this._close_icon(); },
  warning: function(title,msg) { this._show({container:'msg', type:'warning', title:title, msg:msg});  this._close_icon(); },
  info:    function(title,msg) { this._show({container:'msg', type:'info',    title:title, msg:msg});  this._close_icon(); },

  hide: function() {
    $('msg').writeAttribute('class',null)/*.hide()*/;
    if (Msg.fx != undefined) Msg.fx($('msg'),false); else $('msg').hide();
  },

  // waiting --------------------------------------
  // Indicador visual de que se está esperando (por AJAX)

  waiting: function(ok) {
    if (ok == true)
      $('waiting').show(); else
      $('waiting').hide();
  },

  // private --------------------------------------

  _MSG_TEMPLATE: new Template('<strong>#{title}:</strong> #{msg}'),

  _show: function(obj) { // obj: {container:flash|msg type:ok|error|warning|info, title, msg(optional) }
    var html = (obj.msg == undefined)? obj.title: this._MSG_TEMPLATE.evaluate(obj);
    $(obj.container).writeAttribute('class',null).addClassName(obj.type)/*.update(html)*//*.show()*/;
    $(obj.container).down().update(html); // <div id="#msg/#flash"><span>...
    if (Msg.fx != undefined) Msg.fx($(obj.container),true); else $(obj.container).show();
  },

  _close_icon: function() {
    if ($('msg_close') == null) $('msg').down().insert('<span id="msg_close" title="Cerrar"></span>');
  },

  // private flash queue --------------------------

  _seconds_to_hide: 3,
  _queue: [],
  _listen: null, // timeout

  _comes: function(obj) { // Llega un cliente
    if (this._listen == null) { // ¿El empleado está ocioso?
      this._listen = this._goes.bind(this).delay(this._seconds_to_hide); // Atiende al cliente
      this._show(obj);
    }
    else this._queue.push(obj); // El cliente se pone a la cola
  },
  _goes: function() { // Se va un cliente
    this.flashHide();
    this._listen = null; // El empleado deja de atender al cliente
    if (this._queue.length != 0) this._comes(this._queue.shift()); // Llama al siguiente de la cola
  }

} // Msg

/* EXTRANET, AJAX =============================== */

var Extranet = {

  callbacks: new Hash(), // private

  request: function(parameters, callback, url) {
    if (url == undefined) url = 'server/extranet.php';

    var time = (new Date()).getTime();
    parameters['time'] = time; // Es necesario que en la respuesta se devuelva este parámetro
    this.callbacks.set(time, callback);

    new Ajax.Request(url, {
      method: 'post', //'get',
      parameters: parameters,

      requestHeaders: {
        Accept:'application/json'
      },

      onCreate: function() {
        Msg.waiting(true);
      },
      onComplete: function() {
        if(Ajax.activeRequestCount <= 1) {
          Msg.waiting(false);
        }
      },

      onFailure: function(transport) {
        Msg.error('Error',transport.responseText);
      },
      onSuccess: function(transport) {
        var json = transport.responseText.evalJSON(true);
        var callback = Extranet.callbacks.get(json.time);
        if (callback != undefined) {
          Extranet.callbacks.unset(json.time);
          callback(json);
        }
      }
    });
  }

} // Extranet

/* SESSION ====================================== */

var UserSession = {

  connected: false,
  user: '',

  USER_CONNECTED: new Template(
    '<strong>#{user}</strong> — <a href="#" onclick="UserSession.disconnect(); return false;">Desconectar</a>'
  ),
  USER_OFFLINE: '<a href="login.php">Conectar</a>',

  validate: function(callback) {
    var parameters = {
      cmd:'validate'
    };
    Extranet.request(parameters, function (json) {
      if (json.ok == false) {
        $('body').hide();
        Msg.error('Acceso prohibido');
      }
      else {
        UserSession.connected = true;
        UserSession.user = json.user;
        $('body').show();
        $('connect').update(UserSession.USER_CONNECTED.evaluate({user:json.user}));
      }
      if (callback != undefined) callback(json.ok, json.user);
    });
  },

  disconnect: function(callback) {
    var parameters = {
      cmd:'disconnect'
    }
    Extranet.request(parameters, function(json) {
      if (json.ok == true) {
        Msg.ok('La sesión del usuario ha sido desconectada');
        $('body').hide();
        $('connect').update(UserSession.USER_OFFLINE);
      }
      if (callback != undefined) callback(json.ok);
    });
  }

} // UserSession

/* UTILITIES ==================================== */

var Util = {

  queryString: function (key) { // Retorna un parámetro URL si hay key y sino un array hashed con todo
  // http://blog.falafel.com/2007/12/17/ParseAQueryStringInJavaScript.aspx
    if (key == undefined) {
      var hash = {};
      var query = (location.search.charAt(0) == '?')? location.search.substring(1): location.search;
      var pairs = query.split('&');
      for (var i=0; i<pairs.length; ++i) {
        var pair = pairs[i].split('=');
        var key = decodeURIComponent(pair[0]);
        var value = decodeURIComponent(pair[1]);
        hash[key] = value;
      }
      return hash;
    }
    else {
      var params_url = location.search || location.hash; // ?param=value o #param=value
      var re = new RegExp("[?&#]" + key + "=([^&$]*)", "i");
      var offset = params_url.search(re);
      if (offset == -1) return null;
      return RegExp.$1;
    }
  },

  fireEvent: function(element, event) { // http://jehiah.cz/archive/firing-javascript-events-properly
    if (document.createEventObject){
        // dispatch for IE
        var evt = document.createEventObject();
        return element.fireEvent('on'+event,evt)
    }
    else{
        // dispatch for firefox + others
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true ); // event type,bubbling,cancelable
        return !element.dispatchEvent(evt);
    }
  }, // fireEvent

  sumArray: function(values) { // Calcula el total de los valores del array
    var result = 0;
    for (var i=0; i<values.length; ++i) {
      var value = values[i];
      if (value == undefined || value == '' || isNaN(value)) continue;
      result += parseFloat(value);
    }
    return result;
  }, // sumArray

  toArray: function(values) {
  // Convierte un hash o array de hash en sólo array
  // Ej: {{uno:1, dos:2},{tres:3, cuatro:4}} --> [[1,2],[3,4]]
  // si le añadimos flatten() tendremos un array unidimensional
    if (typeof(values) == 'string' || isNaN(values) == false) {
      return values;
    }
    else {
      var result = [];
      if (Object.isArray(values)) {
        for (var i=0; i<values.length; ++i) {
          var value = values[i];
          result[i] = Util.toArray(value);
        }
      }
      else if (typeof(values) == 'object') {
        var i = 0;
        for (var key in values) {
          var value = values[key];
          result[i++] = Util.toArray(value);
        }
      }
      return result;
    }
  }, // toArray

  regexpAnyWord: function(text) { // Crea una expresion regular que casa con cualquier palabra del texto
    var words = text.split(' ');
    var list = [];
    for (var i=0; i<words.length; ++i) {
      var word = words[i];
      list.push( RegExp.escape(word) );
    }
    return new RegExp('(' + list.join('|') + ')', 'ig');
  }, // wordsToRegExp

  popup: function(idlink, href, width, height, target) {
  // Modifica un enlace para que abra una ventana emergente
  // Los dos primeros parámetros son obligatorios
  // http://www.maestrosdelweb.com/editorial/formenlaces/
    width = width || 400;
    height = height || 300;
    target = target || 'popup';
    var top = (screen.height - height) /2;
    var left = (screen.width - width) / 2;
    var plantilla = new Template("window.open(this.href,this.target,'top=#{top}, left=#{left}, width=#{width}, height=#{height}');return false;");
    $(idlink).writeAttribute('href', href).writeAttribute('target',target);
    $(idlink).writeAttribute('onClick', plantilla.evaluate({top:top, left:left, width:width, height:height}));
    return $(idlink);
  }, // popup

  getCurrentTextareaLine: function(textarea) { // Obtiene la línea donde está el cursor de un área de texto
    textarea = $(textarea);
    var valor = textarea.value;
    var inicio = textarea.selectionStart;
    var fin = valor.indexOf('\n', inicio);
    if (fin == -1) fin = valor.length;
    inicio = valor.lastIndexOf('\n', fin - 1) + 1;
    var linea = valor.substring(inicio, fin);
    return linea;
  }, // getCurrentTextareaLine

  replaceCurrentTextareaLine: function(textarea, linea) { // Reemplaza la línea donde está el cursor de un área de texto
    textarea = $(textarea);
    var valor = textarea.value;
    var inicio = textarea.selectionStart;
    var lineas = valor.split('\n');
    var cuenta = 0;
    var fin = 0;
    for (var i=0; i<lineas.length; ++i) {
      if (inicio < fin + lineas[i].length + 1) {
        lineas[i] = linea;
        inicio = fin;
        fin = inicio + linea.length;
        break;
      }
      fin += lineas[i].length + 1;
    }
    valor = lineas.join('\n');
    textarea.value = valor;
    textarea.selectionStart = inicio;
    textarea.selectionEnd = fin;
    return textarea;
  } // replaceCurrentTextareaLine

}

/* INTERFACE =========================================== */

var Interface = { // — ProInf

  automatic: function() {
    Interface.automatic_tabs();
    Interface.automatic_expandable();
    Interface.configure_popup();
  },

  /* configura popup */
  configure_popup: function() {
    if ($('background_popup')) { // Cerrar al picar fuera
      $('background_popup').observe('click', function() { Interface.popup(false); } );
    }
  },

  /* Busca los elementos de las clases expandable y hace que lo sean */
  automatic_expandable: function() {
    $$('.expandable').each (function(element) {
      element.down().observe('click', function(event) {
         this.up().toggleClassName('shrink');
      });
    });
  },

  /* Busca las pestañas y hace que funcionen */
  automatic_tabs: function() {
    var tabs = $('tabs');
    if (tabs != null) Interface.tabs = new Interface.Tabs(tabs);
  },

  activateTab: function(tab) {
    if (Interface.tabs != undefined) {
      var tab_id = Interface.tabs.current().id;
      if (tab_id != 'all' && tab_id != 'tab_all')
        Interface.tabs.activate(tab);
    }
  },

  /* Un DIV emergente por encima del resto de la página para mostrar algún diálogo
     <div id="background_popup" style="display:none;"></div>
     <div id="container_popup" style="display:none;"><div id="popup"></div></div>
  */
  popup: function(enabled) {
    if (enabled) {
      $('background_popup').show();
      $('container_popup').show();
    }
    else {
      $('background_popup').hide();
      $('container_popup').hide();
    }
  }

  /*expandable: function (id, compress) { // Hace que sea expandible el elemento padre
    if (compress == undefined) { compress = true; }
    if (compress) {
      $(id).up().setStyle({ height:'0px' });
      $(id).nextSiblings().invoke('hide');
    }
    $(id).observe('click', function(event) {
      if (this.up().getStyle('height') == '0px') {
        this.up().setStyle({height:'' });
        this.nextSiblings().invoke('show');
      }
      else {
        this.up().setStyle({ height:'0px' });
        this.nextSiblings().invoke('hide');
      }
    });
  }*/

};

/* TABS ----------------------------------------- */

/*
  Hace que una lista de enlaces muestre u oculte una serie de elementos.
  Estos elementos se pueden especificar o se pueden seleccionar vía clases CSS.
  El id del enlace es el nombre de las clase que se mostrará al picar en ese enlace.

  Ejemplo:
    new Tabs('tabs_detalles', {targets:['pendiente','oferta','novedad']});
*/
Interface.Tabs = Class.create({ // ProInf.net — sep-2009

  /*
    container: el contenedor del menú <div><ul><li>...</ul></div>
    options.targets: array de los elementos a mostrar u ocultar
  */
  initialize: function(container, options) {
    this.container = $(container);
    if (this.container == null) return;

    options = options || {};
    this.targets = options.targets || [];

    for (var i=0; i<this.targets.length; ++i) {
      var target = $(this.targets[i]);
      target.hide();
    }

    this.index = 0;
    this.links = this.container.select('a');
    for (var i=0; i<this.links.length; ++i) {
      var link = this.links[i];

      var cssclass = '.' + link.id;
      if (cssclass != '.') $$(cssclass).invoke('hide');

      link.observe('click', this.linkClick.bindAsEventListener(this));
      if (link.hasClassName('current')) this.index = i;
    }
    this.swapLink(this.index);
  },

  // public interface ---------------------------

  // link se refiere al enlace <a> como elemento, id ó índice
  activate: function(link) {
    var index = isNaN(link)? this.links.indexOf($(link)): link;
    if (index >= 0 && index < this.links.length) this.swapLink(index);
  },

  current: function() {
    return this.links[this.index];
  },

  // events -------------------------------------

  linkClick: function(event) {
    Event.stop(event);
    var link = Event.findElement(event, 'A');
    var index = this.links.indexOf(link);
    this.swapLink(index);
  },

  // methods ------------------------------------

  swapLink: function(index) {
    this.activateLink(false);
    this.index = index;
    this.activateLink(true);
  },

  activateLink: function(active) {
    var link = this.links[this.index];
    if (active) {
      link.addClassName('current');
      link.blur();
    }
    else link.removeClassName('current');

    if (this.index < this.targets.length) {
      var target = $(this.targets[this.index]);
      if (active) target.show();
      else target.hide();
    }
    var cssclass = '.' + link.id;
    if (cssclass != '.') $$(cssclass).invoke(active? 'show': 'hide');
  }


}); // class Interface.Tabs



/* */
