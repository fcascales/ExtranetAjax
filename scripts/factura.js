/*
  factura.js

  Requiere: prototype.js, extranet.js, record.js, color.js, validate.js
*/

/* INIT ========================================= */

function init() {

  UserSession.validate();

  $('cmd_code').observe('click', Factura.cmd_code);
  $('cmd_charge').observe('click', Factura.cmd_charge);
  $('cmd_calc').observe('click', Factura.cmd_calc);
  $('cobros_autofill').observe('click', Cobros.autofill);

  $('id_cliente').observe('change', function() { if ($F('id_cliente') != '') Cursos.updateDropdowns($F('id_cliente')); });

  /*new Ajax.Autocompleter('search_input', 'search_choices', '/server/autocompleter.php', {
    parameters: 'cmd=factura',
    indicator: 'search_indicator',
    updateElement: function(li) { Factura.record.dbGet(li.id.substring(3)); }
  });*/
  new DB.Dropdown('search_input', 'factura', {
    type: 'autocomplete',
    selectElement: function(id) { Factura.record.dbGet(id); },
    waiting: 'search_waiting'
  });

  Factura.record = new DB.Record('facturas', {
    onValidate: Factura.onValidate,
    comboboxes: {id_cliente:'clientes', id_forma_pago:'formaspago', id_banco:'bancos'},
    title: 'Factura: #{id_factura}'
  });

  Factura.list = new DB.List('facturas', {
    link_record: Factura.record,
    template: '<li id="#{id}"><span class="status"></span><img /><strong>#{id_factura}</strong><sup>#{fecha_factura}</sup><em>#{cursos}</em><code>#{total}</code><span>#{cliente}</span></li>\n',
    urlFilters: ['id_cliente','id_curso']
  });

  Factura.tabs = new Interface.Tabs('detail', {targets:['cursos','cobros']});

  Cursos.grid = new DB.Grid('facturas_cursos', {
    container: 'cursos',
    link_record: Factura.record,
    datalink: {master:'id_factura', slave:'id_factura'},
    commands: {save:'cursos_save', total:'cursos_total'},
    dropdowns: {id_curso:'cursos-cliente'},
    calcTotal: {horas:Util.sumArray, subtotal:Util.sumArray},
    onCalcRow: Cursos.onCalcRow,
    afterChange: Cursos.afterChange,
    afterLoad: Cursos.afterLoad,
    data:[]
  });

  Cobros.grid = new DB.Grid('facturas_cobros', {
    container: 'cobros',
    link_record: Factura.record,
    datalink: {master:'id_factura', slave:'id_factura'},
    commands: {save:'cobros_save', total:'cobros_total'},
    calcTotal: {importe:Util.sumArray, cobrado:Util.sumArray, diferencia:Util.sumArray},
    onCalcRow: Cobros.onCalcRow,
    data:[]
  });
}

Event.observe(window,'load', init);

/* COBROS ======================================= */

var Cobros = {

  onCalcRow: function(fields, tr) { // diferencia entre importe y cobrado
    var input = function(id) {
      var txt = fields[id];
      txt = txt.replace(/[\,]/g, '.');
      var num = parseFloat(txt);
      return isNaN(num)? 0: num;
    }
    var output = function(id, num) {
      if (isNaN(num)) num = '';
      else num = num.toFixed(2);
      fields[id] = num;
    }
    var importe = input('importe');
    var cobrado = input('cobrado');
    var diferencia = importe - cobrado;
    output('diferencia', diferencia);

    tr.removeClassName('ok').removeClassName('ko');
    if (importe != 0) {
      if (diferencia == 0) tr.addClassName('ok'); else tr.addClassName('ko');
    }

    return fields;
  },

  autofill: function(event) { // Autorellena los cobros
    Event.stop(event);

    var data = Cobros.grid.getData();
    if (data.length > 0) {
      Msg.flashError('Autorrellenar', 'Ya hay cobros introducidos');
      return;
    }
    var subtotal = Util.sumArray(Cursos.grid.getData('subtotal'));
    var total = subtotal * (1 - parseFloat($F('retencion')) + parseFloat($F('iva')));
    var cobro = {};
    cobro['id_cobro'] = '';
    cobro['id_factura'] = $F('id');
    cobro['vencimiento'] = new Date().toSQLDateString();
    cobro['importe'] = total;
    cobro['cobrado'] = total;
    cobro['diferencia'] = '0.00';
    data[0] = cobro;
    Cobros.grid.putData(data);
  }

};

/* CURSOS ======================================= */

var Cursos = {

  onCalcRow: function(fields, tr) { // Calcular el subtotal a partir del precio_hora y las horas
    var input = function(id) {
      var txt = fields[id];
      txt = txt.replace(/[\,]/g, '.');
      var num = parseFloat(txt);
      return isNaN(num)? 0: num;
    }
    var output = function(id, num) {
      if (isNaN(num)) num = '';
      else num = num.toFixed(2);
      fields[id] = num;
    }
    var horas    = input('horas');
    var precio   = input('precio_hora');
    var subtotal = input('subtotal');

    if (horas==0 && precio!=0) horas = subtotal/precio;
    else if (precio==0 && horas!=0) precio = subtotal/horas;
    else subtotal = horas * precio;

    output('horas', horas);
    output('precio_hora', precio);
    output('subtotal', subtotal);

    return fields;
  }, // onCalcRow

  afterChange: function(input) {
    if (input.name == 'id_curso') {
      var id_curso = input.value;
      Cursos.grid.dbAutocalc(id_curso, 'de-curso-a-factura', function(fields) {
        if ($F('encabezado') == '') $('encabezado').addClassName('dirty').value = fields['encabezado'];
        if ($F('retencion') == '') $('retencion').addClassName('dirty').value = fields['retencion'];
        if ($F('iva') == '') $('iva').addClassName('dirty').value = fields['iva'];
        return false; // Para que autorellene el detalle
      });
      ////Factura.record.dbAutocalc(id_curso, 'de-curso-a-factura'); // Ya no es necesario
    }
  }, // afterChange

  afterLoad: function(list) {
    Factura.calc(false);
  }, // afterLoad

  updateDropdowns: function(id_cliente) {
    DB.update_dropdowns ('cursos-cliente', {id_cliente:id_cliente} );
  } // updateDropdowns

};


/* FACTURA ====================================== */

var Factura = {

  onValidate: function(fields) {
    ////$('lnk_curso').writeAttribute('href', 'curso.html?id=' + $F('id_curso'));
    $('lnk_auto').writeAttribute('href', '?id=' + $F('id'));
    $('lnk_print').writeAttribute('href', '/server/config/pdf.php?cmd=factura&id=' + $F('id'));

    Factura.show_revisado();
    Factura.calc(true);

    if ($F('id') == '') { $('cmd_code').show(); } else { $('cmd_code').hide(); } // Mostrar el botón si es nuevo

    if (fields != null) Cursos.updateDropdowns(fields['id_cliente']);

    ////Factura.record.dbCombobox('id_curso','cursos'); // Quitar filtro del combobox cursos
    //$('id_curso').select('option').invoke('show'); // Muestra todos los cursos del combobox
    ////$('id_curso').select('option').invoke('removeClassName', 'hide');
  },


//···············································
// events

  cmd_code: function(event) { // Calcula el siguiente código de factura disponible
    Event.stop(event);
    var resp = prompt('Introduce tipo de factura P=particular, C=cliente');
    if (resp != null) {
      resp = resp.charAt(0).toUpperCase()
      DB.lookup(resp, 'next_id_factura', function(value) {
        $('id_factura').value = value;
        Util.fireEvent($('id_factura'), 'change');
      });
    }
  },

  cmd_charge: function(event) { // Marca o desmarca la factura como cobrada
    Event.stop(event);

    if ($F('revisado') == 0) {
      if (confirm('¿Marcar la factura como cobrada?')) {
        $('revisado').addClassName('dirty').value = -1;
      }
    }
    else {
      if (confirm('¿Desmarcar la factura como cobrada?')) {
         $('revisado').addClassName('dirty').value = 0;
      }
    }
    Factura.show_revisado();
  },

  cmd_calc: function(event) { // Calcula el subtotal, la retención, el IVA y el total de la factura
    Event.stop(event);
    Factura.calc(false);
  },

//···············································

  calc: function(reset) {
    var input = function(id) {
      var txt = $F(id);
      txt = txt.replace(/[\,]/g, '.');
      var num = parseFloat(txt);
      return isNaN(num)? 0: num;
    }
    var output = function(id, num) {
      if (isNaN(num)) num = 0;
      else num = num.toFixed(2);
      $(id).value = Format.number(num,2,'€');
    }

    var subtotal = reset? 0: Util.sumArray(Cursos.grid.getData('subtotal'));
    var retencion = input('retencion');
    var iva = input('iva');

    output('subtotal', subtotal);
    output('total_retencion', subtotal*retencion);
    output('total_iva', subtotal*iva);
    output('total',subtotal*(1+iva-retencion));
  }, // calc

  show_revisado: function() { // Muestra el estado de cobrado o no cobrado
    if ($F('revisado') == 0) {
      $('id_factura').removeClassName('yes').addClassName('no');
      $('icon_revisado').removeClassName('yes').addClassName('no');
    }
    else {
      $('id_factura').removeClassName('no').addClassName('yes');
      $('icon_revisado').removeClassName('no').addClassName('yes');
    }
  } // show_revisado

//···············································

  /*change_curso: function(event) { // Actualizar el detalle según el curso
    Event.stop(event);
    Record.dbLookup($F('id_curso'), 'curso', function(value) {
      $('detalle').value = value;
    });
  },*/

//···············································

  /*de_curso_a_factura: function (event) {  // Actualiza id_cliente, num_horas, precio_hora, subtotal, retencion, iva, para, encabezado y detalle
    if (Factura.record.isNew()) {
      Factura.record.dbAutocalc($F('id_curso'), 'de_curso_a_factura');
    }
  },*/

  /*cursos_del_cliente: function(event) { // Muestra los cursos del cliente seleccionado
    //if ($F('id_cliente') == '') DB.combobox('id_curso','cursos');
    //else DB.combobox('id_curso','cursos-cliente',{filters:{id_cliente:$F('id_cliente')}});

    //$('id_curso').select('option').invoke('removeClassName', 'hide');
    //if ($F('id_cliente') != '')  {
    //  var selector = 'option:not(.cliente_'+$F('id_cliente')+')';
    //  $('id_curso').select(selector).invoke('addClassName', 'hide');
    //}

    $('id_curso').select('option').invoke('show');
    if ($F('id_cliente') != '') {
      var selector = 'option:not(.cliente_'+$F('id_cliente')+')';
      $('id_curso').select(selector).invoke('hide');
    }
  },*/

  /*calc: function(dirty) {
    var input = function(id) {
      var txt = $F(id);
      txt = txt.replace(/[\,]/g, '.');
      var num = parseFloat(txt);
      return isNaN(num)? 0: num;
    }
    var output = function(id, num, dirty) {
      if (isNaN(num)) return '';
      num = num.toFixed(2);
      $(id).value = num;
      if (dirty === true) $(id).addClassName('dirty');
    }
    var format = function(id) {
      $(id).value = Format.number($F(id),2,'€');
    }

    if (dirty == undefined) dirty = true;

    var horas     = input('horas');
    var precio    = input('precio_hora');
    var subtotal  = input('subtotal');
    var retencion = input('retencion');
    var iva       = input('iva');

    var old_horas = horas;
    var old_precio = precio;
    var old_subtotal = subtotal;

    if (horas==0 && precio!=0) horas = subtotal/precio;
    else if (precio==0 && horas!=0) precio = subtotal/horas;
    else subtotal = horas * precio;

    if (iva > 1) iva /= 100;
    if (retencion > 1) retencion /= 100;

    var total_retencion = subtotal * retencion;
    var total_iva = subtotal * iva;
    var total = subtotal * (1 - retencion + iva);

    if (horas != old_horas) output('horas', horas, dirty);
    if (precio != old_precio) output('precio_hora', precio, dirty);
    if (subtotal != old_subtotal) output('subtotal', subtotal, dirty);
    //output('retencion', retencion, dirty);
    //output('iva', iva, dirty);
    output('total_retencion', total_retencion);
    output('total_iva', total_iva);
    output('total', total);

    format('total_retencion');
    format('total_iva');
    format('total');
  }*/

}; // Factura

/* */