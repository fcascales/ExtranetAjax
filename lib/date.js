/*
   date.js — proinf.net — agosto-2009

   Extensión de los métodos Date
*/

/* INSTANCE METHODS ============================= */

var instanceMethods = {

/* getters -------------------------------------- */

  getMonthName: function() {
    return Date.MONTHS_NAMES[this.getMonth()];
  },
  getWeekday: function() { // ISO-8601: 0=lun, 1=mar, 2=mié, ... 6=dom — proinf.net
    var day = this.getDay();
    return ((day == 0) ? 6 : day-1);
  },
  getWeekdayName: function() {
    return Date.WEEKDAYS_NAMES[this.getWeekday()];
  },
  getTimeAsMinutes: function() { // Hora y minutos como minutos
    return (this.getHours()*60 + this.getMinutes() );
  },
  getDayOfYear: function() { // javascript.about.com/library/blweekyear.htm
    var onejan = new Date(this.getFullYear(),0,1);
    return Math.ceil((this - onejan) / Date.MILLISECONCS_PER_DAY);
  },
  isLeapYear: function() { // www.javascriptkata.com/2007/05/24/how-to-know-if-its-a-leap-year/
    return new Date(this.getFullYear,1,29).getDate() == 29;
  },
  getMonday: function () {  // Obtiene el lunes de esta semana — proinf.net
    var date = this.clone();
    date.setDate(date.getDate() - date.getWeekday());
    return date;
  },
  getDaysInMonth: function() { // 28, 29, 30 o 31 — proinf.net
    var date = new Date(this.getFullYear(), this.getMonth()+1, 1);
    date.setDate(date.getDate()-1);
    return date.getDate();
  },
  getOnlyDate: function() { // Elimina la información de la hora
    var date = this.clone();
    date.setHours(0); date.setMinutes(0); date.setSeconds(0); date.setMilliseconds(0);
    return date;
  },
  getOnlyTime: function() { // Elimina la información de la fecha
    var date = this.clone();
    date.setFullYear(0); date.setMonth(0); date.setDate(0);
    return date;
  },
  getTimeAsHours: function() {
    return this.getHours() + this.getMinutes()/60 + this.getSeconds()/3600;
  },

/* week ----------------------------------------- */

  getWeekOfYear: function () {
    return this.getWeekAndYear().week;
  },
  getWeekAndYear: function () { // — proinf.net
    // Calcula el número de semana del año y el año de esa semana.
    // ISO8601: - La semana empieza el lunes y acaba el domingo.
    //  - La primera semana de un año es la que primera que tiene un jueves de ese año.
    var yearWeek = this.getFullYear();

    // Si el jueves de la semana es del año pasado se ha de contar como semana del año pasado
    // Si el jueves de la semana es del año siguiente se ha de contar como semana del año siguiente
    var yearOfThursday = this.getMonday().addDays(3).getFullYear();
    yearWeek += (yearOfThursday - yearWeek); // -1, 0, +1

    // Obtener el día de inicio de la semana que podría encontrarse seguramente en este año o quizás en el anterior
    var oneJan = new Date(yearWeek,0,1);
    var offset = 3-((3+oneJan.getWeekday())%7); // ó [0,-1,-2,-3,3,2,1][oneJan.getWeekday()]
    var mondayWeek1 = oneJan.clone().addDays(offset);

    var numDays = Math.ceil((this-mondayWeek1) / Date.MILLISECONCS_PER_DAY)
    var numWeek = Math.floor(numDays / 7) + 1;

    return { week:numWeek, year:yearWeek, monday:mondayWeek1, days:numDays };
  },


/* operations ----------------------------------- */

  clone: function() { // kendsnyder.com/sandbox/date/
    return new Date(this.getTime());
  },
  equalsDate: function(date) {
    return (
      this.getFullYear() == date.getFullYear() &&
      this.getMonth() == date.getMonth() &&
      this.getDate() == date.getDate()
    );
  },
  equalsTime: function(hour, minute, second) {
    return (
      this.getHours() == hour &&
      this.getMinutes() == minute &&
      this.getSeconds() == second
    );
  },
  addDays: function(number) {
    this.setDate(this.getDate() + number);
    return this;
  },
  diffDays: function(date) { // Número de días de diferencia entre una fecha y otra
    var date1 = this.getOnlyDate();
    var date2 = date.getOnlyDate();
    return Math.floor((date1.getTime() - date2.getTime()) / Date.MILLISECONCS_PER_DAY);
  },
  copyDate: function(date) {
    this.setFullYear(date.getFullYear());
    this.setMonth(date.getMonth());
    this.setDate(date.getDate());
    return this;
  },

/* formats -------------------------------------- */

  toCustomDateString: function () { // Fecha personalizada: 'ddd d-mmm-yyyy'
    return isNaN(this) ? '?' : (
      this.getWeekdayName().substr(0,3) + ' ' +
      this.getDate() + '-' +
      this.getMonthName().substr(0,3) + '-' +
      this.getFullYear()
    );
  },
  toLongCustomDateString: function () { // dddd, D de MMMM de YYYY
    return isNaN(this) ? '' : (
      this.getWeekdayName() + ', ' +
      this.getDate() + ' de ' +
      this.getMonthName() + ' de ' +
      this.getFullYear()
    );
  },
  toCustomTimeString: function () { // Hora personalizada: 'hh:mm'
    return isNaN(this) ? '?' : this.toLocaleTimeString().substring(0,5);
  },
  toSQLDateString: function() { // Formato SQL: 'yyyy-mm-dd'
    var two = function (n) { return (n<10?'0':'')+n; }
    return (
      this.getFullYear() + '-' +
      two(this.getMonth()+1) + '-' +
      two(this.getDate())
    );
  },

/* ISO 8601 format ------------------------------ */

  getTimezoneOffsetISO8601: function() { // Retorna: 'Z', '-01', '+02', etc.
    var minutes = this.getTimezoneOffset();
    if (minutes == 0) {
      return 'Z';
    } else {
      var tz = Math.abs(minutes/60).toString();
      return (minutes<0?'-':'+')+(tz.length==1?'0':'')+tz;
    }
  },
  toISO8601String: function() { // Formato: 'yyyy-mm-ddThh:mm:ssTZ
    var two = function (n) { return (n<10?'0':'')+n; }
    return (
      this.getFullYear() + '-' +
      two(this.getMonth()+1) + '-' +
      two(this.getDate()) + 'T' +
      two(this.getHours()) + ':' +
      two(this.getMinutes()) + ':' +
      two(this.getSeconds()) +
      this.getTimezoneOffsetISO8601()
    );
  }

};

/* ·············································· */

for (var name in instanceMethods) {
  Date.prototype[name] = instanceMethods[name];
}

/* STATIC METHODS =============================== */

var staticMethods = {
  MONTHS_NAMES:  'enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre'.split(' '),
  WEEKDAYS_NAMES: 'lunes martes miércoles jueves viernes sábado domingo'.split(' '),
  SQL_FORMAT: '%Y-%m-%d %H:%M:%S',
  MILLISECONCS_PER_DAY: 24*60*60*1000,

  getMondayFromWeekYear: function(week,year) { // — proinf.net
    // Calcula el lunes de la semana W del año Y (opcional)
    if (year == undefined) { year = (new Date()).getFullYear(); }
    var oneJan = new Date(year,0,1);
    var offset = 3-((3+oneJan.getWeekday())%7); // ó [0,-1,-2,-3,3,2,1][oneJan.getWeekday()]
    var mondayWeek1 = oneJan.clone().addDays(offset);
    return mondayWeek1.clone().addDays((week-1)*7);
  }

};

/* ·············································· */

for (var name in staticMethods) {
  Date[name] = staticMethods[name];
}

/* STRING ======================================= */

String.prototype.parseDateTime = function() { // — proinf.net
  // Crear fecha a partir de un texto en formato
  //  "yyyy-mm-dd hh:nn:ss", "yyyy-mm-dd" ó "hh:nn:ss" ó "hh:nn"

  var year=0, month=0, day=0;
  var hour=0, minute=0, second=0;
  var i=0;
  var ok = false;
  if (this.length == 19 || this.length == 10) {
    year   = parseInt(this.substring(i,i+4), 10); i+=5;
    month  = parseInt(this.substring(i,i+2), 10); i+=3;
    day    = parseInt(this.substring(i,i+2), 10); i+=3;
    ok = true;
  }
  if (this.length == 19 || this.length == 8) {
    hour   = parseInt(this.substring(i,i+2), 10); i+=3;
    minute = parseInt(this.substring(i,i+2), 10); i+=3;
    second = parseInt(this.substring(i,i+2), 10);
    ok = true;
  }
  if (this.length == 5) { // hh:nn
    hour   = parseInt(this.substring(i,i+2), 10); i+=3;
    minute = parseInt(this.substring(i,i+2), 10); i+=3;
    ok = true;
  }
  if (ok) return new Date (year, month-1, day, hour, minute, second);
  else return null;
}

/* */
