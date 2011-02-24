/* 
  calendario.js - proinf.net - agosto-2009

  Crea un calendario del año compacto dónde 
  las filas son semanas,
  las columnas son días de la semana y 
  los meses se colorean y etiquetan.

  Se utiliza para seleccionar una semana y vincular
  al horario de esa semana

  Requiere: prototype.js y date.js y calendario.css
*/

function init() {  

  $('cmd_prev').observe('click', Weeks.prevYear);
  $('cmd_next').observe('click', Weeks.nextYear);
  
  UserSession.validate();

  Weeks.make();
}  
  
Event.observe(window,'load', init);

/* ---------------------------------------------- */

var Weeks = {

  year: (new Date()).getFullYear(),
  week: -1, // Semana seleccionada

  // events -------------------------------------

  prevYear: function(event) {
    Event.stop(event);
    Weeks.year--;
    Weeks.make();
  },
  nextYear: function(event) {
    Event.stop(event);
    Weeks.year++;
    Weeks.make();
  },

  // -------------

  WEEK_TEMPLATE: new Template (
    '<ul id="week#{week}" class="week">\n'+
    ' <li class="#{classW}">#{week}</li>\n'+
    ' <li class="#{class1}" title="#{title1}">#{day1}</li>\n'+
    ' <li class="#{class2}" title="#{title2}">#{day2}</li>\n'+
    ' <li class="#{class3}" title="#{title3}">#{day3}</li>\n'+
    ' <li class="#{class4}" title="#{title4}">#{day4}</li>\n'+
    ' <li class="#{class5}" title="#{title5}">#{day5}</li>\n'+
    ' <li class="#{class6}" title="#{title6}">#{day6}</li>\n'+
    ' <li class="#{class7}" title="#{title7}">#{day7}</li>\n'+
    ' <li class="#{classM}">#{month}</li>\n'+
    '</ul>\n'),

  LINK_TEMPLATE: new Template (
    'horario.html?date=#{monday}'),

  make: function() {
    $('year').update(Weeks.year);
    $$('.week').invoke('stopObserving').invoke('remove');
    Weeks.week = -1;

    //if (UserSession.connected == false) return;   

    var mondayWeek1 = Date.getMondayFromWeekYear(1,Weeks.year);
    var numDays = Date.getMondayFromWeekYear(1,Weeks.year+1).diffDays(mondayWeek1);
    var numWeeks = Math.floor(numDays / 7);
    var date = mondayWeek1.clone();
    var datePrevWeek = date.clone().addDays(-7);
    var oldmonth = 11;
    var cssclass = month==0?'odd':'even';
    var today = new Date();
    var current = today.getWeekAndYear(); 
    var ww = 1;    

    for (var w=1; w<=numWeeks; ++w) {
      if (w == 27) { ww++; }
      var parameters = { week: w };
      for (var d=1; d<=7; ++d) { 
        var cssborder = '';       
        var month = date.getMonth();
        if (oldmonth != month) {          
          ////if (month == 6) { ww++; }
          cssclass = cssclass=='odd'?'even':'odd';
          if (w != numWeeks) {
            parameters['classM'] = cssclass;
            parameters['month'] = date.getMonthName();
          }          
          oldmonth = month;
          cssborder += ' east';
        }    
        if (month != datePrevWeek.getMonth()) {
          cssborder += ' north';
        }   
        parameters['class'+d] = cssclass + (date.equalsDate(today)?' today':'') + cssborder;
        parameters['day'+d] = date.getDate();
        parameters['title'+d] = date.toCustomDateString();
        date.addDays(1); 
        datePrevWeek.addDays(1);
      }  
      if (parameters['month'] == undefined) {
        parameters['month'] = '';
        parameters['classM'] = '';
      }
      parameters['classW'] = (w==current.week && this.year==current.year)?'current':'';
      
      $('weeks'+ww).insert(this.WEEK_TEMPLATE.evaluate(parameters));

      $('week'+w).observe('click', function(event) {
        $(this).addClassName('selected');
        if (Weeks.week != -1) { 
          $('week'+Weeks.week).removeClassName('selected'); 
        }
        Weeks.week = this.getAttribute('id').substr(4);
        var monday = Date.getMondayFromWeekYear(Weeks.week, Weeks.year).toSQLDateString();
        location.href = Weeks.LINK_TEMPLATE.evaluate({
          monday:monday
        });
      });
    }
  }


} // Weeks

/* */
