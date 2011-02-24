/*
  public.js — proinf.net — oct-2009

  Todas estas clases utilizan peticiones AJAX para obtener los valores.
  Se necesita un servidor AJAX que las atienda: Puede ser PHP, Java, o lo que sea.

  Clases:
    Public.Translations - Traducciones sobre el HTML a través de selectores CSS

  Requiere: prototype.js, extranet.js
*/


/* PUBLIC  ====================================== */

/*
  Clase con métodos estáticos y contenedor del resto de clases
*/
var Public = {
  url: '/server/public.php', // Ruta del servidor predeterminado
}

/* TRANSLATIONS ================================= */

/*
  Traducciones sobre el HTML

  var translations = new Public.Translations().load();
*/
Public.Translations = Class.create({ // Proinf.net - oct-16

  /*
    query: comando del servidor y nombre del contenedor
    options: {callback}
  */
  initialize: function(options) {
    this.lang = '';
    options = options || {};
    this.callback = options.callback || undefined;
  },

  load: function(lang) { // Recupera un único elemento de la lista y actualiza ese elemento
    if (lang == undefined) lang = Util.queryString('lang');
    var parameters = {
      cmd: 'translations',
      lang: lang
    };
    //if (lang) parameters['lang'] = lang;
    Extranet.request(parameters, function(json) { // / json: {ok,message,list:[{fields}]}
      if (json.ok == true) {
        this.lang = json.lang;
        this.translate(json.hash);
      }
      else {
        Msg.flashError('Translate '+this.query, json.message);
      }
    }.bind(this), Public.url);
  }, // load

  /*
  */
  translate: function(hash) { // hash:{}
    //var body = $(document.body);
    /*
    var nodes=html.childNodes
    for (i=0; i<nodes.length; i++)
      alert(docnodes[i].tagName)*/

    for (var selector in hash) {
      var text = hash[selector];

      var list = selector.split(',');
      for (var i=0; i<list.length; ++i) {
        var select = list[i];
        var attrib = null;
        var element = null;

        var pos = select.indexOf('{');
        if (pos >= 0) {
          attrib = select.substring(pos+1, select.length-1);
          select = select.substring(0,pos);
        }

        if (select == 'html') { // Ej: html{xml:lang}, html{lang}
          var html = document.documentElement;
          if (attrib != null) html.setAttribute(attrib, text);
        }
        else if (select == 'meta') { // Ej: meta{language}
          if (attrib != null) this.setMeta(attrib, text);
        }
        else { //Ej: #login h2, #feed{title}, #login label[for=user]
          $$(select).each( function(element, index) {
            if (attrib == null) element.update(text);
            else element.writeAttribute(attrib, text);
          });
        }
      }
    }
    if (this.callback != undefined) this.callback(this.lang);
  }, // translate

  setMeta: function (name, content) {
    var list = document.getElementsByTagName('meta');
    for (var i=0; i<list.length; ++i) {
      var meta = list[i];
      if (meta.getAttribute('name') == name) {
        meta.setAttribute('content', content);
      }
    }
  }



}); // Public.Translations



/* */
