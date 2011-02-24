/*
  calendar.js — proinf.net — ago-2009

  En el documento HTML hay que vincular:
    prototype.js - prototypejs.org
    date.js      - proinf.net
    calendar.js  - proinf.net
    calendar.css - proinf.net

  El único formato de fecha admitido es 'yyyy-mm-dd'

  Para que una etiqueta <input> tenga calendario emergente
  tan sólo hay que hacer que sea de la clase 'calendar'
  Por ej: <input type='text' id='fecha' class='calendar' />

  Aunque el elemento <input> no sea de la clase 'calendar'
  también se le puede hacer mostrar un calendario emergente:
    Calendar.observe('id_input');

  Y también se puede mostrar el calendario permanentemente
  dentro de una etiqueta <div> así:
    Calendar.make('id_div');

  Mejoras pendientes:
    - Al hacer clic fuera del calendario que este desaparezca - HECHO!
    - Que funcione con el teclado
    - Que se pueda pulsar en los días grises de los meses anterior y posterior
*/

function init() {
  //Calendar.make('calendar1');
  Calendar.automatic();
}

Event.observe(window,'load', init);

/* ---------------------------------------------- */

var Calendar = {

  date: new Date(), // fecha actual seleccionada
  input: null, // Elemento <input> que ha solicitado mostrar el calendario

  WEEK_TEMPLATE: new Template(
    '<ul id="calendar_week#{numweek}" class="calendar_week">\n'+
    ' <li class="calendar_numweek">#{numweek}</li>\n'+
    ' <li class="#{class1}">#{day1}</li>\n'+
    ' <li class="#{class2}">#{day2}</li>\n'+
    ' <li class="#{class3}">#{day3}</li>\n'+
    ' <li class="#{class4}">#{day4}</li>\n'+
    ' <li class="#{class5}">#{day5}</li>\n'+
    ' <li class="#{class6}">#{day6}</li>\n'+
    ' <li class="#{class7}">#{day7}</li>\n'+
    '</ul>\n'
  ),

  CALENDAR_TEMPLATE: new Template(
    '<ul class="calendar_nav">\n'+
    ' <li>\n'+
    '  <a id="calendar_prev_month" href="#" title="Mes anterior">&lt;</a>\n'+
    '  <span id="calendar_month">Enero</span>\n'+
    '  <a id="calendar_next_month" href="#" title="Mes siguiente">&gt;</a>\n'+
    ' </li>\n'+
    ' <li>\n'+
    '  <a id="calendar_prev_year" href="#" title="Año anterior">&lt;</a>\n'+
    '  <span id="calendar_year">2009</span>\n'+
    '  <a id="calendar_next_year" href="#" title="Año siguiente">&gt;</a>\n'+
    ' </li>\n'+
    '</ul>\n'+
    '<div id="calendar_body" class="calendar_body">\n'+
    ' <ul class="calendar_weekdays">\n'+
    '  <li></li>\n'+
    '  <li>lun</li>\n'+
    '  <li>mar</li>\n'+
    '  <li>mié</li>\n'+
    '  <li>jue</li>\n'+
    '  <li>vie</li>\n'+
    '  <li class="calendar_weekend">sáb</li>\n'+
    '  <li class="calendar_weekend">dom</li>\n'+
    ' </ul>\n'+
    '</div>\n'
  ),

  // events -------------------------------------

  prevYear: function(event) {
    Event.stop(event);
    Calendar.date.setFullYear(Calendar.date.getFullYear()-1);
    Calendar.update();
    Calendar.keepFocus();
  },
  nextYear: function(event) {
    Event.stop(event);
    Calendar.date.setFullYear(Calendar.date.getFullYear()+1);
    Calendar.update();
    Calendar.keepFocus();
  },
  prevMonth: function(event) {
    Event.stop(event);
    Calendar.date.setMonth(Calendar.date.getMonth()-1);
    Calendar.update();
    Calendar.keepFocus();
  },
  nextMonth: function(event) {
    Event.stop(event);
    Calendar.date.setMonth(Calendar.date.getMonth()+1);
    Calendar.update();
    Calendar.keepFocus();
  },

  keepFocus: function() {
    if (Calendar.input) {
      Calendar.input.focus();
      Calendar.nostop = true;
    }
  },

  // -------------

  /* Crea un calendario completo en el elemento indicado */
  make: function(id) {
    if ($(id) == null) return null;

    $(id).update(this.CALENDAR_TEMPLATE.evaluate({
      id: this.id
    })).addClassName('calendar_container');

    $('calendar_prev_year').observe('click', Calendar.prevYear);
    $('calendar_next_year').observe('click', Calendar.nextYear);
    $('calendar_prev_month').observe('click', Calendar.prevMonth);
    $('calendar_next_month').observe('click', Calendar.nextMonth);

    this.update();
  },

  update: function() { // Actualiza el calendario al cambiar de mes o año
    if (this.date == null) this.date = new Date();

    var cssclass = '';
    var year = this.date.getFullYear();
    var month = this.date.getMonth();
    var day = (new Date(year,month,1)).getMonday();

    $('calendar_year').update(year);
    $('calendar_month').update(this.date.getMonthName());
    $$('#calendar_body li').invoke('stopObserving');
    $$('#calendar_body .calendar_week').invoke('remove');

    for (var w=1; w<=6; ++w) {
      var params = {};
      params['numweek'] = day.getWeekOfYear();
      for (var d=1; d<=7; ++d) {
        var cssclass = '';
        if (day.equalsDate(this.date)) {
          cssclass = 'calendar_current';
        }
        else if (day.getMonth()!=month) {
          cssclass = 'calendar_off';
        }
        params['day'+d] = day.getDate();
        params['class'+d] = cssclass;
        day.addDays(1);
      }
      $('calendar_body').insert(this.WEEK_TEMPLATE.evaluate(params));

      // Events
      var elements = $('calendar_week'+params['numweek']).firstDescendant().nextSiblings();
      for (var e=0; e<elements.length; ++e) {
        var element = elements[e];
        if (element.hasClassName('calendar_off') == false) {
          element.observe('click',function(event) {
            Event.stop(event);
            Calendar.date.setDate(this.innerHTML);
            if (Calendar.input != null) {
              $(Calendar.input).value = Calendar.date.toSQLDateString();
              Util.fireEvent($(Calendar.input), 'change');
              Calendar.stop();
              return;
            }
            Calendar.update();
          });
        }
      }
    }
  },

  // CALENDAR POPUP =============================

  /* Busca los elementos de la clase calendar y hace que puedan desplegar este calendario */
  automatic: function(element) {
    if (element == undefined) element = document.body;
    element.select('.calendar').each (function(element) {
      Calendar.observe(element);
    });
  },

  observe: function(input) { // Asocia el calendario con un <input> de fecha
    $(input).observe('click', Calendar.start.bindAsEventListener($(input)));
    $(input).observe('blur', function(event) {
      Calendar.stop.delay(0.5 /* seconds waiting to done click an opportunity */);
    });
  },

  start: function(event) { // Muestra el calendario como popup
    Event.stop(event);
    if ($('calendar_popup') == null) {
      Calendar.input = $(this);
      Calendar.date = $F(Calendar.input).parseDateTime();
      var html = '<div id="calendar_popup" class="calendar_popup" style="display:none;">xxx</div>';
      $(document.body).insert(html); // $(Calendar.input).insert(html, 'after');
      var offset = $(Calendar.input).cumulativeOffset();
      var x = offset.left;
      var y = offset.top;
      y += $(Calendar.input).getHeight();
      Calendar.make('calendar_popup');
      $('calendar_popup').show();
      $('calendar_popup').setStyle({ position:'absolute' , left:x+'px', top:y+'px' });
      //$(document.body).observe('click', function() { Calendar.stop(); }); // done with blur
    }
    else {
      Calendar.stop();
    }
  },

  stop: function (event) { // Oculta el calendario mostrado como popup
    if (Calendar.nostop == true) {
      Calendar.nostop = false;
    }
    else if ($('calendar_popup') != null) {
      $$('#calendar_popup li').invoke('stopObserving');
      $('calendar_popup').remove();
      Calendar.input = null;
      $(document.body).stopObserving();
    }
  }

  /*---
  fireEvent: function(element,event) { // jehiah.cz/archive/firing-javascript-events-properly
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
  } ---*/


} // Calendar

/* */
