/*
  curso.js - proinf.net - agosto-2009

  Requiere: prototype.js, extranet.js, record.js, color.js, validate.js
*/


/* PRN ========================================== */

var Print = { // Muestra algunas opciones antes de mostrar el PDF

  timeout: undefined,

  onMouseOver: function() {
    Print.timeout = Print.show.delay(2  /*seconds*/);
  },
  onMouseOut: function() {
    if (Print.timeout) clearTimeout(Print.timeout);
  },

  show: function() {
   var offset = $('lnk_print').cumulativeOffset();
   $('prn').setStyle({ position:'absolute', left:offset.left+'px', top:offset.top+'px' });
   $('prn').removeClassName('hidden');
  },

  cmd_ok: function(event) {
    Event.stop(event);

    var args = {
      cmd: 'curso',
      id: $F('id'),
      id_trabajador: $F('prn_id_trabajador').toUpperCase(),
      notas: $F('prn_notas')
    };
    window.open('/server/config/pdf.php?' + $H(args).toQueryString());

    $('prn').addClassName('hidden');
  },
  cmd_cancel: function(event) {
    Event.stop(event);
    $('prn').addClassName('hidden');
  },

}; // Print

/* PRECIOS CLIENTE ============================== */

var PreciosCliente = {

  cmd: function(event) { // Muestra los datos económicos de los últimos cursos de este cliente
    PreciosCliente.table.toggleData({id_cliente: $F('id_cliente')});
  },

  getFields: function (fields) {
    for (var field in fields) {
      if ($(field) != null) {
        $(field).addClassName('dirty').value = fields[field];
      }
    }
  }

}; // PreciosCliente


/* CLASES ======================================= */

var Clases = {

  onCalcRow: function(fields, tr) { // Calcula el día de la semana cuando la fecha cambia e indica si es una fecha del pasado
    var date = fields['fecha'].parseDateTime();
    if (date == null) {
      fields['dia_label'] = '';
      tr.removeClassName('even').removeClassName('odd').removeClassName('off');
    }
    else {
      fields['dia_label'] = date.getWeekdayName().substr(0,3);

      if (date.getWeekOfYear() % 2 == 0) tr.removeClassName('odd').addClassName('even');
      else tr.removeClassName('even').addClassName('odd');

      var today = new Date().getOnlyDate();
      if (date < today) tr.addClassName('off');
      else tr.removeClassName('off');
    }
    return fields;
  }, // onCalcRow

  sortByDate: function() { // Ordena las clases por la fecha y recalcula los campos num_clase y total_clases
    var data = Clases.clases.getData();

      data.sort(function(a,b) {
             if (a.fecha < b.fecha) return -1;
        else if (a.fecha > b.fecha) return 1;
        else if (a.hora_inicio < b.hora_inicio) return -1;
        else if (a.hora_inicio > b.hora_inicio) return 1;
        else return 0;
      });

      var count = data.length;
      for (var i=0; i<count; ++i) {
        data[i].num_clase = i+1;
        data[i].total_clases = count;
      }

    Clases.clases.putData(data);
  }, // sortByDate

  deleteAll: function(event) {
    Event.stop(event);
    Clases.clases.markDeleted();
  }, // deleteAll

  autofill: function(event) { // Calcula las clases que corresponden con la temporalización
    Event.stop(event);

    // Subfunciones
    error = function(title, msg) {
      Msg.error(title,msg);
      return false;
    }
    test = function(testValue, id, msg) {
      $(id).removeClassName('error');
      if (testValue) {
        msgs.push(msg);
        $(id).addClassName('error');
      }
    }
    Clase = function(i,nc,tc,ic,f,hi,d,im,it) {
      this.id_clase = i;
      this.num_clase = nc;
      this.total_clases = tc;
      this.id_curso = ic;
      this.dia_label = f.getWeekdayName().substr(0,3);
      this.fecha = f.toSQLDateString();
      this.hora_inicio = hi.toCustomTimeString();
      this.duracion = d;
      this.id_materia = im;
      this.id_trabajador = it;
    }

    // Obtener los datos introducidos
    var id_curso = $F('id_curso');
    var id_trabajador = $F('id_trabajador');
    var fecha_inicio = $F('fecha_inicio');
    var hora_inicio = $F('hora_inicio');
    var hora_fin = $F('hora_fin');
    var total_horas = $F('total_horas');
    var semana = [];
    var materias = Curso.materias.getData();
    var festivos = Clases.festivos || [];

    // Días de la semana
    var dias = ['dilluns','dimarts','dimecres','dijous','divendres','dissabte','diumenge'];
    for (var i=0; i<7; ++i) {
      var value = $(dias[i]).value;
      if (value == 'true' || value == '-1' || value == '1') semana.push(i);
    }

    // Comprobar que estén todos los datos necesarios
    var msgs = [];
    Msg.hide();
    test (id_curso == '', 'id_curso','el código del curso');
    test (id_trabajador == '', 'id_trabajador','el trabajador');
    test (fecha_inicio == '', 'fecha_inicio','la fecha de inicio');
    test (hora_inicio == '', 'hora_inicio','la hora de inicio');
    test (hora_fin == '', 'hora_fin','la hora final');
    test (total_horas == '', 'total_horas','el total de horas');
    test (semana.length == 0, 'weekdays', 'los días de la semana');
    test (materias.length == 0, 'tab_materias', 'las materias a impartir');
    if (msgs.length > 0) return error('Falta', msgs.join(', '));

    // Convertir variables a su tipo real
    fecha_inicio = fecha_inicio.parseDateTime();
    hora_inicio = hora_inicio.parseDateTime();
    hora_fin = hora_fin.parseDateTime();
    total_horas = parseFloat(total_horas);

    // Duración de la clase
    var horas = hora_fin.getTimeAsHours() - hora_inicio.getTimeAsHours();
    if (horas <= 0) return error('Incorrecto', 'No es posible que la clase dure "'+horas+'"');

    // Variables de trabajo
    var fecha = fecha_inicio;
    var index_clase = 0;
    var acum_horas = 0;
    var index_materia = 0;
    var id_materia = '';
    var acum_horas_materia = 0;
    var horas_materia = 0;
    var id_clase = '';

    // Clases
    var clases = Clases.clases.getData();

    // Mientras queden horas de clase que dar
    while (acum_horas < total_horas) {

      // Materias a impartir durante el curso
      if (index_materia < materias.length && acum_horas_materia >= horas_materia) {
        acum_horas_materia = 0;
        id_materia = materias[index_materia]['id_materia'] || 'sin-materia';
        horas_materia = parseFloat(materias[index_materia]['horas'] || '0');
        index_materia++;
      }

      // Duración de la clase. La última puede durar menos
      var duracion = (acum_horas + horas > total_horas)? (total_horas - acum_horas): horas;

      // Si hay id_clase actualizará el registro y sino lo insertará
      if (index_clase < clases.length) id_clase = clases[index_clase]['id_clase'] || '';
      else id_clase = '';

      // Almacenar
      clases[index_clase++] = new Clase(id_clase,index_clase,0,id_curso,fecha,hora_inicio,duracion,id_materia,id_trabajador);

      // Acumular
      acum_horas += horas;
      acum_horas_materia += horas;
      if (acum_horas >= total_horas) break;

      // Siguiente día de clase
      do {
        fecha.addDays(1);
      } while (
        semana.indexOf(fecha.getWeekday()) == -1 ||
        festivos.indexOf(fecha.toSQLDateString()) != -1
      );
    }

    // Actualizar el total de clases
    for (var i=0; i<index_clase; ++i) clases[i].total_clases = index_clase;

    // Lo que sobró
    for (var i=index_clase; i<clases.length; ++i) {
      var id_clase = clases[i].id_clase;
      if (id_clase == '') clases[i] = null;
      else clases[i] = new Clase(id_clase,0,0,id_curso,'','','','borrar','borrar');
    }

    // Guardar
    Clases.clases.putData(clases);

  } // autofill

}; // Clases


/* CURSO ======================================== */

var Curso = {

  onValidate: function(fields) {
    $('lnk_aula').writeAttribute('href', '/server/config/pdf.php?cmd=aula&id=' + $F('id'));
    $('lnk_alumno').writeAttribute('href', 'alumno.html?id_curso=' + $F('id'));
    $('lnk_clase').writeAttribute('href', 'clase.html?id_curso=' + $F('id'));
    $('lnk_auto').writeAttribute('href', '?id=' + $F('id'));
    $('lnk_print').writeAttribute('href', '/server/config/pdf.php?cmd=curso&id=' + $F('id'));
    if ($F('id') == '') { $('cmd_code').show(); } else { $('cmd_code').hide(); } // Mostrar el botón si es nuevo
    Curso.calcTimes();

    $('precios_cliente').hide();

    if (Curso.alumnos != undefined) Curso.alumnos.getData({id_curso:$F('id')});
    if (Curso.facturas != undefined) Curso.facturas.getData({id_curso:$F('id')});
    if (Curso.trabajadores != undefined) Curso.trabajadores.getData({id_curso:$F('id')});
    if (Curso.calendario != undefined) Curso.calendario.loadDates({id_curso:$F('id')});

    if (fields != null) Curso.contactos_del_cliente(fields['id_cliente']);
  }, // onValidate

  calcNextCode: function(event) { // Calcula el siguiente código de factura disponible
    Event.stop(event);
    var resp = prompt('Introduce tipo de curso E=empresa, FTN=fomento, CP=particular, H=oculto');
    if (resp != null) {
      DB.lookup(resp.toUpperCase(), 'next_id_curso', function(value) {
        $('id_curso').value = value;
        Util.fireEvent( $('id_curso'), 'change');
      });
    }
  }, // calcNextCode

  calcLastCustomerPrice: function (event) { // Actualiza precio_hora, precio_hora_cliente, iva y retencion
    if (Curso.record.isNew()) {
      Curso.record.dbAutocalc($F('id_cliente'), 'ultimo_precio_cliente');
    }
  }, // calcLastCustomerPrice

  calcTimes: function() { // Calcula la duración de la clase
    var formattime = function(time) {
      if (time.length > 0 && time.indexOf(':') == -1) time += ':00';
      return time;
    }
    var gethours = function(time) {
      if (time.length == 0) return 0;
      var arr = time.split(':');
      var hours = parseFloat(arr[0]) + parseFloat(arr[1])/60;
      return isNaN(hours)? 0: hours;
    }

    var inicio = formattime($F('hora_inicio'));
    var fin = formattime($F('hora_fin'));
    var duracion = gethours(fin) - gethours(inicio);

    $('duracion').value = Format.number(duracion,2,'h');
  }, // calcTimes

  cmd_facturas: function(event) {
    Event.stop(event);
    Curso.facturas = new DB.Table('cursos-facturas', {
      ////onClick: function(fields) { location.href = 'factura.html?id='+fields['id_factura']; },
      links: { id_factura:'factura.html?id=#{id_factura}' }
    });
    Curso.facturas.getData({id_curso:$F('id')});
  },

  cmd_trabajadores: function(event) {
    Event.stop(event);
    Curso.trabajadores = new DB.Table('cursos-trabajadores', {
      links: { trabajador:'trabajador.html?id=#{trabajador}' }
    });
    Curso.trabajadores.getData({id_curso:$F('id')});
  },

  cmd_calendario: function(event) {
    Event.stop(event);
    Curso.calendario = new DB.Calendar('curso-calendario', { filters:{id_curso:$F('id')} });
  },

  cmd_alumnos: function(event) {
    Event.stop(event);
    Curso.alumnos = new DB.Table('cursos-alumnos', {
      //links: { alumno:'alumno.html?id=#{id}' }
      links: { id:'alumno.html?id=#{id}', correos:'mailto:#{correos}' }
    });
    Curso.alumnos.getData({id_curso:$F('id')});
  },

  contactos_del_cliente: function(id_cliente) { // Muestra los contactos del cliente seleccionado
    $('id_contacto').select('option').invoke('show');
    if (id_cliente != undefined && id_cliente != '') {
      var selector = 'option:not(.contacto_'+id_cliente+')';
      $('id_contacto').select(selector).invoke('hide');
    }
  },

}; // Curso


/* INIT ========================================= */

function init() {
  UserSession.validate();

  $('cmd_code').observe('click', Curso.calcNextCode);
  $('cmd_precios_cliente').observe('click', PreciosCliente.cmd);
  $('hora_inicio').observe('change', Curso.calcTimes);
  $('hora_fin').observe('change', Curso.calcTimes);
  $('id_cliente').observe('change', Curso.calcLastCustomerPrice);
  $('clases_sort').observe('click', Clases.sortByDate);
  $('clases_autofill').observe('click', Clases.autofill);
  $('clases_delete').observe('click', Clases.deleteAll);
  $('msg').observe('click', function() { $$('.error').invoke('removeClassName','error'); });
  $('cmd_alumnos').observe('click', Curso.cmd_alumnos);
  $('cmd_facturas').observe('click', Curso.cmd_facturas);
  $('cmd_trabajadores').observe('click', Curso.cmd_trabajadores);
  $('cmd_calendario').observe('click', Curso.cmd_calendario);

  $('prn_ok').observe('click', Print.cmd_ok);
  $('prn_cancel').observe('click', Print.cmd_cancel);
  $('lnk_print').observe('mouseover', Print.onMouseOver);
  $('lnk_print').observe('mouseout', Print.onMouseOut);
  ////$('prn').observe('mouseout', Print.cmd_cancel);

  $('id_cliente').observe('change', function(event) {
    Curso.contactos_del_cliente($F('id_cliente'));
  });

  /*new Ajax.Autocompleter('search_input', 'search_choices', '/server/autocompleter.php', {
    parameters: 'cmd=curso',
    indicator: 'search_waiting',
    updateElement: function(li) { Curso.record.dbGet(li.id.substring(3)); }
  });*/
  new DB.Dropdown('search_input', 'curso', {
    type: 'autocomplete',
    selectElement: function(id) { Curso.record.dbGet(id); },
    waiting: 'search_waiting'
  });

  Curso.record = new DB.Record('cursos', {
    onValidate: Curso.onValidate,
    comboboxes: {id_cliente:'clientes', id_trabajador:'trabajadores', id_contacto:'contactos-cliente'},
    dropdowns: {
      total_horas:[2,3,4,8,10,12,16,20,40,60],
      hora_inicio:'08:30 09:00 09:30 10:00 15:00 16:00 17:00 18:00 18:30 19:00'.split(' '),
      hora_fin:'11:30 12:00 13:00 14:00 18:00 19:00 20:00 20:30 21:00 22:00'.split(' ')
    },
    title: 'Curso: #{id_curso}'
  });

  PreciosCliente.table = new DB.Table('precios_cliente', { onClick:PreciosCliente.getFields });

  Curso.list = new DB.List('cursos', {
    link_record: Curso.record,
    template: '<li id="#{id}"><span class="status"></span><img /><strong>#{id_curso}</strong><em>#{curso}</em><sup>#{inicio}</sup><sub>#{fin}</sub><code>#{total_curso}</code><code>#{total_factura}</code><code>#{total_pendiente}</code></li>\n',
    urlFilters: ['id_cliente','id_trabajador']
  });

  Curso.tabs = new Interface.Tabs('tabs_detail', {targets:['cursos_materias','cursos_clases','alumnos','estadisticas']});
  Curso.tabs2 = new Interface.Tabs('tabs_statistics', {targets:['calendario','facturas','trabajadores']});

  Curso.materias = new DB.Grid('cursos_materias', {
    link_record: Curso.record,
    datalink: {master:'id_curso', slave:'id_curso'},
    commands: {save:'materias_save', total:'materias_total'},
    dropdowns: {id_materia:'materias', horas:[2,3,4,8,10,12,16,20,40,60]},
    calcTotal: {horas:Util.sumArray},
    data:[]
  });

  Clases.clases = new DB.Grid('cursos_clases', {
    link_record: Curso.record,
    datalink: {master:'id_curso', slave:'id_curso'},
    commands: {save:'clases_save', total:'clases_total'},
    dropdowns: {id_materia:'materias', id_trabajador:'trabajadores'},
    calcTotal: {duracion:Util.sumArray},
    onCalcRow: Clases.onCalcRow,
    data:[]
  });

  var date = new Date();
  DB.table('festivos',
    function(list) {
      Clases.festivos = Util.toArray(list).flatten(); //alert(Object.toJSON(Clases.festivos));
    }, {
      filters: {
        start:date.toSQLDateString(),
        end:date.addDays(200).toSQLDateString()
      }
    }
  );

} // init

Event.observe(window,'load', init);

/* */