/*
   horario.js - ProInf.net, julio-2009

   Muestra un calendario semanal de citas
   (Comportamientos del cliente AJAX)

   Requiere:
    - prototype.js - http://prototypejs.org/
    - date.js      - http://proinf.net/
    - color.js     - http://proinf.net/

   Parámetros URL:
    - 'date=yyyy-mm-dd'  - La fecha que se quiere visualizar inicialmente
    ? 'week=w&year=yyyy' - Número de semana del año y opcionalmente el año a visualizar
    - 'link=page.html'   - Página de enlace al hacer doble clic en una cita

   Enlace a la página de detalle (con doble clic):
    - 'page.html?id=0000&calendar=XXXX' - Al pulsar en una cita
    ? 'page.html?date=yyyy-mm-dd-hh-nn' - Si se pulsa en un hueco del horario
    - 'page.html? ... &back=yyyy-mm-dd' - Fecha para volver a la página del calendario

--------------------
  ? = PENDIENTE
*/

/* MAIN ========================================= */

/* global --------------------------------------- */

global = {
  'monday'    : param_date(), // Fecha de inicio de la semana '?date=yyyy-mm-dd'
  'today'     : new Date,  // La fecha de hoy

  'night'     : false,     // Mostrar las horas noctunas: 00:00 a 06:00
  'weekend'   : false,     // Mostrar el sábado y el domingo
  'overlap'   : false,     // Permitir solapamiento de unas citas con otras

  'numhours'  : 24,        // Número de horas de la rejilla: 17 o 24
  'firsthour' : 0,         // Primera hora: 0 o 7
  'numdays'   : 7,         // Número de días de la rejilla: 5 o 7

  'link'      :queryString('link') // Página a la que enlazan las citas
};


/* url ------------------------------------------ */

// Retorna un parámetro URL
// http://blog.falafel.com/2007/12/17/ParseAQueryStringInJavaScript.aspx
function queryString (key) {
  var re = new RegExp("[?&]" + key + "=([^&$]*)", "i");
  var offset = location.search.search(re);
  if (offset == -1) return null;
  return RegExp.$1;
}

// Recupera el valor de la fecha del parámetro '?date=yyyy-mm-dd'
//  y sino puede ser toma la fecha actual
function param_date() {
  var param = queryString('date');
  if (param != null) {
    var date = param.parseDateTime();
    if (isNaN(date) == false) {
      return date.getMonday();
    }
  }
  return new Date().getMonday();
}

/* init ----------------------------------------- */

function init()
{
  // Initialization

  Msg.clear();
  tip_search(false);

  opt_night();
  opt_weekend();

  // Events

  $('cmd_prev').observe('click',cmd_prev);
  $('cmd_next').observe('click',cmd_next);
  $('cmd_requery').observe('click',cmd_requery);

  $('input_search').observe('keyup', search_keyup);
  $('search').observe('submit',cmd_search);

  $('opt_night').observe('click', opt_night);
  $('opt_weekend').observe('click', opt_weekend);

  $('schedule').observe('dblclick',mouse_position);

  // AJAX

  request_tasks();
}

Event.observe(window,'load', init);

/* GUI ========================================== */

/* schedule ------------------------------------- */

function mouse_position (event) { // NO FUNCIONA!!!
  var x = Event.pointerX(event);
  var y = Event.pointerY(event);
  alert('x='+x+' y='+y);
  //getDimensions, getWidth, getHeight
  var element = $('schedule');
  if (Position.within(element,x,y)) {
    var px = Position.overlap('horizontal',element);
    var py = Position.overlap('vertical',element);
    alert('px='+px+' py='+py);
  }
}

/* search --------------------------------------- */

function search_keyup (event) {
  tip_search( event.keyCode != Event.KEY_RETURN );
}
function cmd_search (event) {
  Event.stop(event);
  var search = parse_search();
  tip_search(false);
  if (search == null) {
  }
  else if (isNaN(search) == false) {
    global.monday = search.getMonday();
    request_tasks();
  }
  $('input_search').focus();
}

function tip_search(show) {
  if (show == false) {
    $('tip_search').hide();
  }
  else {
    var search = parse_search();
    var str = null;
    if (search == null) {
      str = '?';
    }
    else if (isNaN(search) == false) {
      str = search.toCustomDateString();
    }
    if (str != null) {
      $('tip_search').update(str).show();
      //$('input_search').setAttribute('title',str);
    }
    else {
      $('tip_search').hide();
    }
  }
}

// Intenta obtener una fecha de los números y textos introducidos por el usuario
function parse_search() {
  var date = global.monday.clone();
  var query = $F('input_search').replace(/[-\/]/g, ' ').toLowerCase().strip();
  var list = query.split(' ');
  list.each (function(item, index) {
    if (isNaN(item) == false) {
      var number = parseInt(item, 10);
      switch (index) {
        case 0: date.setDate(number); break;
        case 1: date.setMonth(number-1); break;
        case 2: date.setFullYear(number); break;
      }
    }
    else {
      switch (item) {
        case 'hoy': date.setTime(new Date().getTime()); break;
        default: date = null;
      }
    }
  });
  return date;
}

/* options -------------------------------------- */

// Muestra u oculta las filas de las horas de la noche
function opt_night() {
  global.night = $F('opt_night') == 'on';
  global.numhours =  global.night ? 24 : 17;
  global.firsthour = global.night ? 0 : 7;

  $$('#hours>li').invoke('setStyle', {
    height: (100 / global.numhours) + '%'
  });

  $R(global.firsthour, 23).each (function (h, index) {
    $('hour'+h).setStyle ({
      top: (100 / global.numhours * index) + '%'
    }).show();
  });
  if (global.night == false) {
    $R(0,6).each (function (h, index) {
      $('hour'+h).hide();
    });
  }
  Tasks.place();
}

// Muestra u oculta las columnas de los días del fin de semana
function opt_weekend() {
  global.weekend = $F('opt_weekend') == 'on';
  global.numdays = global.weekend ? 7 : 5;

  $$('#days>li,#tasks>li').invoke('setStyle', {
    width: (100 / global.numdays) + '%'
  });

  $R('day0','day'+global.numdays, true).each (function (day, index) {
    $(day).setStyle ({
      left: (100 / global.numdays * index) + '%'
    }).show();
  });
  if (global.weekend == false) {
    $R('day5','day6').each (function (day, index) {
      $(day).hide();
    });
  }
  Tasks.place();
}

/* commands ------------------------------------- */

function cmd_prev(event) {
  Event.stop(event);
  global.monday.addDays(-7);
  request_tasks();
}
function cmd_next(event) {
  Event.stop(event);
  global.monday.addDays(7);
  request_tasks();
}
function cmd_requery(event) {
  Event.stop(event);
  request_tasks();
}

/* MESSAGE ====================================== */

var Msg = { // Muestra mensajes en la barra de estado

/* template ------------------------------------- */

  MSG_TEMPLATE: new Template('<strong>#{title}:</strong> #{msg}'),
  html: function (title,msg) { return this.MSG_TEMPLATE.evaluate({ title:title, msg:msg }); },

/* warnings ------------------------------------- */

  ok: function (title,msg) {
    $('msg').update(this.html(title,msg)).addClassName('ok').removeClassName('error');
  },
  error: function(title,msg) {
    $('msg').update(this.html(title,msg)).addClassName('error').removeClassName('ok');
  },
  show: function(html) {
    $('msg').update(html).removeClassName('ok','error');
  },

/* debug ---------------------------------------- */

  debug: function (title,msg) {
    if($('debug') == null) { $('main').insert('<div id="superdebug"><div id="debug"></div></div>'); }
    $('debug').insert('<p>'+this.html(title,msg)+'</p>');
    $('superdebug').show();
  },

/* wait ----------------------------------------- */

  waiting: function(ok) { // Una animación mientras se espera la respuesta del servidor
    if (ok == true) {
      $('waiting').show();
    }
    else {
      $('waiting').hide();
    }
  },

/* clear ---------------------------------------- */

  clear: function() {
    $('msg').update('').removeClassName('ok','error');
    this.waiting(false);
  }

} // Msg

/* AJAX ========================================= */

function request_tasks() {
  Show.days();
  Show.today();
  Show.hour();

  var start = global.monday.toSQLDateString();
  var end = global.monday.clone().addDays(7).toSQLDateString();

  try {

    new Ajax.Request('server/horario.php', {
      method: 'post', //'get',
      parameters: {
        cmd:   'tasks',
        start: start,
        end:   end
      },
      requestHeaders: {
        Accept: 'application/json'
      },
      onSuccess: function(transport) {
        //Msg.debug('responseText',transport.responseText);
        var json = transport.responseText.evalJSON(true);
        if (json) {
          if (json.ok) {
            if (Object.isArray(json.list)) {
              Msg.ok('Listo', 'Citas entre ' + start + ' y ' + end);
              Tasks.insert(json.list);
              Tasks.place();
            }
            else {
              Msg.error('Aviso', json.message);
            }
          }
          else {
            Msg.error('Error', json.message);
          }
        }
        else {
          Msg.error('Error JSON', transport.responseText);
        }
      },
      onFailure: function(transport) {
        Msg.error('Error AJAX',transport.responseText);
      },
      onCreate: function() {
        Tasks.remove();
        Msg.waiting(true);
      },
      onComplete: function() {
        if (Ajax.activeRequestCount <= 1) {
          Msg.waiting(false);
        }
      }
    });

  } catch (e) {
    Msg.error('request_tasks ' + e.name, e.message);
  }
}

/* TASK ========================================= */

var Task = {

/* id ------------------------------------------- */

  id: function(task) {
    return 'task'+task.id;
  },

  correct: function(task) {
    if (typeof(task.dtstart) == 'string') {
      task.dtstart = task.dtstart.parseDateTime();
    }
    if (typeof(task.dtend) == 'string') {
      task.dtend = task.dtend.parseDateTime();
    }
    if (global.monday.diffDays(task.dtstart) > 0) {
      task.dtstart.copyDate(global.monday);
    }
    if (global.sunday.diffDays(task.dtend) < 0) {
      task.dtend.copyDate(global.sunday);
    }
  },

/* html ----------------------------------------- */

  TASK_TEMPLATE: new Template( // hCalendar microformat
    '<li id="task#{id}" class="vevent">\n' +
      '<div class="summary">#{summary}</div>\n' +
      '<div class="description">#{description}</div>\n' +
      '<div class="time">de <abbr class="dtstart" title="#{dtstart}">#{start}</abbr>\n' +
      ' a <abbr class="dtend" title="#{dtend}">#{end}</abbr></div>\n' +
      '<div class="calendar">#{calendar}</div>\n' +
      '<div class="sequence">#{sequence}</div>\n' +
    '</li>\n'
  ),
  ALLDAY_TEMPLATE: new Template( // Cita que ocupa todo el día
    '<li id="task#{id}" class="allday" title="#{summary} - #{description}"><div>\n' +
      '<div class="description">#{description}</div>\n' +
    '</div></li>\n'
  ),
  INLINE_TEMPLATE: new Template( // Para mostrar en la barra de estado
    '<span style="color:#800">#{calendar}</span> ' +
    ' — <strong>#{summary}</strong> — <span style="color:#080">#{sequence}</span> — #{description}' +
    ' — de <span style="color:#008">#{start}</span> a <span style="color:#008">#{end}</span> — #{date}'
  ),

  toHTML: function(task,template) { // Convierte JSON a HTML
    if (template == undefined) template = this.TASK_TEMPLATE;
    return template.evaluate({
      id:          task.id,
      summary:     task.summary,
      description: task.description,
      dtstart:     task.dtstart.toISO8601String(),
      dtend:       task.dtend.toISO8601String(),
      calendar:    task.calendar,
      sequence:    task.sequence,
      start:       task.dtstart.toCustomTimeString(),
      end:         task.dtend.toCustomTimeString(),
      date:        task.dtstart.toCustomDateString()
    });
  },

/* link ----------------------------------------- */

  link: function(task) {
    if (global.link == null) return '';
    else return (global.link + '?' + Object.toQueryString({
      id:       task.id,
      calendar: task.calendar,
      back:     task.dtstart.toSQLDateString()
    }));
  },

/* position ------------------------------------- */

  place: function(task, overlap) { // Coloca una cita en su sitio
    if (overlap == undefined) overlap = global.overlap;

    // Hay que convertir las coordenadas temporales en espaciales

    // De 0..6 o de 0..4 (todo +1 si es para end)
    var begin_weekday = task.dtstart.getWeekday();
    var end_weekday   = task.dtend.getWeekday() + 1;

    // De 0..24 ó de 7..24
    var begin_minutes = task.dtstart.getTimeAsMinutes() - global.firsthour*60;
    var end_minutes   = task.dtend.getTimeAsMinutes()   - global.firsthour*60;
    begin_minutes = Math.max(begin_minutes, 0);

    // Porcentajes
    var x0 = 100*begin_weekday / global.numdays;
    var x1 = 100*end_weekday   / global.numdays;
    var y0 = 100*begin_minutes / (global.numhours*60);
    var y1 = 100*end_minutes   / (global.numhours*60);
    var width = x1 - x0;
    var height = y1- y0;

    if (overlap == false) { // Evitar solapamiento
      //Msg.debug('ch='+task.channel+' nºch='+task.numchannels+' tot.ch='+task.totalchannels);
      x0    += width*task.channel/task.totalchannels;
      width *= task.numchannels/task.totalchannels;
    }

    $(Task.id(task)).setStyle({
      position: 'absolute',
      left:     x0+'%',
      top:      y0+'%',
      width:    width+'%',
      height:   height+'%',
      backgroundColor: StringColors.getColorFromString( task.calendar )
    });

    //Msg.debug(id,$(id).style.left+','+$(id).style.right+','+ $(id).style.top+','+$(id).style.bottom+','+$(id).style.backgroundColor);
  }

} // Task


/* TASKS ======================================== */

var Tasks = {

  tasks: [], // Lista de todas las tareas leídas del servidor
  allday_tasks: [], // Extracción de las tareas que son para todo el día

/* remove --------------------------------------- */

  remove: function() { // Borra todas las citas
    for (var i=0; i<this.allday_tasks.length; ++i) {
      var task = this.allday_tasks[i];
      $(Task.id(task)).stopObserving();
    }
    for (var i=0; i<this.tasks.length; ++i) {
      var task = this.tasks[i];
      $(Task.id(task)).stopObserving();
    }
    this.allday_tasks = [];
    this.tasks = [];
    $$('#tasks>li').invoke('remove');
  },

/* insert --------------------------------------- */

  sort: function(tasks) {
    tasks.sort(function(a,b) {
      if (a.dtstart == b.dtstart) {
        return a.dtend - b.dtend;
      }
      else {
        return a.dtstart - b.dtstart;
      }
    });
  },

  extract_allday_tasks: function() {
    // Separar citas normales de citas de todo el día
    // Las citas de todo el día pueden durar varios días
    global.sunday = global.monday.clone().addDays(6);
    for (var i=0; i<this.tasks.length; ++i) {
      var task = this.tasks[i];

      Task.correct(task);

      var index = 0;
      if( task.dtstart.equalsTime(0,0,0) && task.dtend.equalsTime(23,59,59)) { // Es para todo el día
        // Si ocupa varios días, dividir en citas separadas para cada día
        for(var date=task.dtstart.clone(); date.diffDays(task.dtend)<=0; date.addDays(1)) {
          var newTask = Object.clone(task);
          newTask.dtstart = task.dtstart.clone().copyDate(date);
          newTask.dtend   = task.dtend.clone().copyDate(date);
          newTask.id      = task.id+'i'+index++;
          this.allday_tasks.push(newTask);
        }
        this.tasks[i] = null;
      }
    }
    this.tasks = this.tasks.compact(); // Elimina los valores nulos
    //Msg.debug('tasks',this.tasks.toJSON());
    //Msg.debug('allday',this.allday_tasks.toJSON());
  },

  insert: function(tasks) { // Inserta las citas ordenadamente dentro del documento HTML
    try {
      this.tasks = tasks;
      this.allday_tasks = [];

      this.extract_allday_tasks();

      this.sort(this.allday_tasks);
      for (var i=0;i<this.allday_tasks.length; ++i) {
        var task = this.allday_tasks[i];
        $('tasks').insert(Task.toHTML(task, Task.ALLDAY_TEMPLATE));
      }

      this.sort(this.tasks);
      for (var i=0;i<this.tasks.length; ++i) {
        var task = this.tasks[i];
        $('tasks').insert(Task.toHTML(task));
      }

      this.behaviours();

    } catch (e) {
      Msg.error('Tasks.insert '+e.name, e.message);
    }
  },

/* events --------------------------------------- */

  behaviours: function() {
    for (var i=0; i<this.tasks.length; ++i) {
      var id = 'task' + this.tasks[i].id;

      // Mientras se presione el ratón expandir hasta ocupar el ancho del día
      $(id).observe('mousedown', function(event) {
        Task.place(Tasks.getTaskFromElement(this), true);
      });
      $(id).observe('mouseup', function(event) {
        Task.place(Tasks.getTaskFromElement(this));
      });

      // Mientras esté dentro el ratón mostrar un mensaje en la barra de estado
      $(id).observe('mouseover', function(event) {
        var task = Tasks.getTaskFromElement(this);
        Msg.show(Task.toHTML(task, Task.INLINE_TEMPLATE));
        window.status = Task.link(task);
      });
      $(id).observe('mouseout', function(event) {
        Msg.show('');
        window.status = '';
      });

      // Al hacer doble clic enlazar a la página de detalle de la cita
      if (global.link != null) {
        $(id).observe('dblclick', function(event) {
          location.href = Task.link(Tasks.getTaskFromElement(this));
        });
      }
    }
  },

  getTaskFromElement: function(element) {
    var id = element.getAttribute('id');
    for (var i=0; i<this.tasks.length; ++i) {
      var task = this.tasks[i];
      if (id == Task.id(task)) {
        return task;
      }
    }
    return null;
  },

/* position ------------------------------------- */

  place: function() { // Posiciona todas las citas en su lugar
    if (global.overlap == false) { // Evitar solapamiento
      this.calcTasksChannels(this.tasks);
      this.calcTasksChannels(this.allday_tasks);
    }
    for (var i=0; i<this.allday_tasks.length; ++i) {
      Task.place(this.allday_tasks[i]);
    }
    for (var i=0; i<this.tasks.length; ++i) {
      Task.place(this.tasks[i]);
    }
  },

/* no overlap ----------------------------------- */

  /* Un día de la semana se subdivide en subcolumnas (llamados canales)
     que sirve para evitar solapamientos entre citas. — proinf.net
     Requisitos: Las citas han de estar ordenadas
     Resultado: las citas tendrán las siguientes nuevas propiedades:
       .channel       = Canal dónde empieza.      Ej: 0, 1, 2,
       .numchannels   = Nº de canales que ocupa.  Ej. 1, 2,
       .totalchannels = Total de canales que hay. Ej. 3
  */
  calcTasksChannels: function(tasks) {

    try {
      var channels = []; // La hora (en minutos) de desocupación de cada canal
      var currentDate = global.monday.clone().addDays(-1);
      var beginTask = 0; // Índice de la tarea de inicio

      // Calcular en que canal va cada cita
      for (var i=0; i<tasks.length; ++i) {
        var task = tasks[i];
        var start = task.dtstart.getTimeAsMinutes();
        var finish = task.dtend.getTimeAsMinutes();

        // Ver si es otro día o hay algún hueco en los canales de este día
        var freeChannel = true;
        if (currentDate.equalsDate(task.dtstart)) {
          for (var c=0; c<channels.length; ++c) {
            if (start < channels[c]) {
              freeChannel = false;
              break;
            }
          }
        }
        // Reiniciar los canales
        if (freeChannel) {
          if (i > 0) {
            var endTask = i-1;
            this.calcNumChannels(tasks, beginTask, endTask, channels);
          }
          currentDate = task.dtstart;
          beginTask = i;
          channels = [0];
        }

        // A ver en que canal cabe
        var fit = false;
        for (var c=0; c<channels.length; ++c) {
          if (start >= channels[c]) {
            channels[c] = finish;
            fit = true;
            task.channel = c;
            task.numchannels = 1;
            break;
          }
        }
        // Meterlo en un nuevo canal
        if (fit == false) {
          channels.push(finish);
          task.channel = channels.length-1;
          task.numchannels = 1;
        }

      } // for

      var endTask = tasks.length-1;
      this.calcNumChannels(tasks, beginTask, endTask, channels);

    } catch (e) {
      Msg.error('Tasks.calcTasksChannels '+e.name, e.message);
    }
  },

  /* Una vez se sabe en que canal va cada cita,
     ver si podría ocupar los canales de más a la derecha
  */
  calcNumChannels: function(tasks, begin, end, channels) {
    for (var i=begin; i<=end; ++i) {
      var task1 = tasks[i];
      task1.totalchannels = channels.length;
      var start1 = task1.dtstart.getTimeAsMinutes();
      var finish1 = task1.dtend.getTimeAsMinutes();
      for (var c=task1.channel+1; c<channels.length; ++c) {
        var fit = true;
        for (var j=begin; j<=end; ++j) {
          var task2 = tasks[j];
          if (task2.channel == c) { // Del canal adecuado
            var start2 = task2.dtstart.getTimeAsMinutes();
            var finish2 = task2.dtend.getTimeAsMinutes();
            if (start2 < finish1 && finish2 > start1) {
              fit = false;
              break;
            }
            else if (start2 >= finish1) {
              break; // porque están ordenados por hora
            }
          }
        }
        if (fit == true) {
          task1.numchannels++;
        }
        else {
          break; // Tampoco los canales siguientes
        }
      }
    }
  }


} // Tasks

/* SHOW ========================================= */

var Show = {

  DAY_TEMPLATE: new Template(
    '<small>#{month} #{year}</small> <strong>#{weekday} #{day}</strong>'
  ),

  // Muestras los encabezados de columnas de los días de la semana
  days: function() {
    var date = global.monday.clone();

    $R('day0','day6').each (function (day) {
      $(day).update(Show.DAY_TEMPLATE.evaluate({
        month:   date.getMonthName(),
        year:    date.getFullYear(),
        weekday: date.getWeekdayName(),
        day:     date.getDate()
      }));
      date.addDays(1);
    });

    $('week').update(global.monday.getWeekOfYear()+'º');
  },

  // Remarca el día actual
  today: function() {
    var date = global.monday.clone();
    for (var d=0; d<7; ++d) {
      if (global.today.equalsDate(date) == true) {
        $('day'+d).addClassName('current');
      }
      else {
        $('day'+d).removeClassName('current');
      }
      date.addDays(1);
    }
  },

  // Remarca la hora actual
  hour: function() {
    var hora = new Date().getHours();
    for (var h=0; h<24; ++h) {
      if (hora == h) {
        $('hour'+h).addClassName('current');
      }
      else {
        $('hour'+h).removeClassName('current');
      }
    }
  }

} // Show

/* UTIL ========================================= */

// Concatena un % al final
/*String.prototype.perCent = function() {
  return this + '%';
}*/
/*function isArray(o) {
  return Object.prototype.toString.call(o) === '[object Array]';
}*/

/* */
