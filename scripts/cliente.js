/*
  cliente.js - proinf.net - agosto-2009

  Requiere: prototype.js, extranet.js, record.js, color.js
*/

/* INIT ========================================= */

function init() {

  UserSession.validate();

  /*var template = new Template(
    '<li id="id_#{id}"><img /><strong>#{cliente}</strong><em>#{contacto}</em><sup>#{clasificacion}</sup></li>\n'
  );
  Record.init('clientes', template, Cliente.validar,
    [  ],
    { id_forma_pago:'formaspago'});
  */

  Cliente.record = new DB.Record('clientes', {
    onValidate: Cliente.validar,
    comboboxes: {id_forma_pago:'formaspago'},
    title: 'Cliente: #{cliente}'
  });

  Cliente.list = new DB.List('clientes', {
    link_record: Cliente.record,
    template:'<li id="#{id}"><span class="status"></span><img /><strong>#{cliente}</strong><em>#{contacto}</em><sup>#{clasificacion}</sup></li>\n'
  });

  /*new Ajax.Autocompleter('search_input', 'search_choices', '/server/autocompleter.php', {
    parameters: 'cmd=cliente',
    indicator: 'search_indicator',
    updateElement: function(li) { record.dbGet(li.id.substring(3)); }
  });*/
  new DB.Dropdown('search_input', 'cliente', {
    type: 'autocomplete',
    selectElement: function(id) { Cliente.record.dbGet(id); },
    waiting: 'search_waiting'
  });

  Cliente.tabs = new Interface.Tabs('tabs_detail', {targets:['clientes_contactos']});

  Cliente.contactos = new DB.Grid('clientes_contactos', {
    link_record: Cliente.record,
    datalink: {master:'id', slave:'id_cliente'},
    commands: {save:'contactos_save'},
    data:[]
  });
}

Event.observe(window,'load', init);

/* CLIENTE -------------------------------------- */

var Cliente = {

  validar: function() {
    $('lnk_cursos').writeAttribute('href', 'curso.html?id_cliente=' + $F('id'));
    $('lnk_facturas').writeAttribute('href', 'factura.html?id_cliente=' + $F('id'));
    $('lnk_auto').writeAttribute('href', '?id=' + $F('id'));
  }

}; // Trabajador

/* */
