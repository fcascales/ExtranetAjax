/*
  validate.js — proinf.net — ago-2009
  versión 1.2

  Busca los elementos <input> de las clases:
    email, telephone,
    nif, nie, cif,
    date, time,
    ccc, euro, percent

  para corregir los valores introducidos o marcar los posibles errores

  Requiere: prototype.js
  Clases incluidas: Validate y Format

  Actualizaciones:
    2011-02-05 Añadido to_phone. Nuevas funciones trim y areDigits
*/

function init() {
  Validate.automatic();
}
Event.observe(window,'load', init);

/* VALIDATE ===================================== */

var Validate = {

/* to functions ------------------------------- */
// Modifica el valor mostrado para que sea correcto

  to_number: function(value) {
    return Validate.to_euro(value);
  },
  to_euro: function(value) {
    var value = Validate.comma2dot(value);
    var calc = eval(value);
    value = isNaN(calc)? parseFloat(value): calc;
    if (isNaN(value)) value = 0;
    return value;
  },
  to_percent: function(value) {
    var value = Validate.comma2dot(value);
    var value = parseFloat(value);
    if (isNaN(value)) value = 0;
    else if (value > 1) value /= 100;
    return value;
  },
  to_date: function(value) {
  // '1/2/2009'  --> '2009-02-01'
  // '2009.5.13' --> '2009-05-13'
  // '11'        --> '2009-08-11'
  // '14 9'      --> '2009-09-14'
    var arr = Validate.extractNumbers(value);
    if (arr.length > 0) {
      if ((''+arr[0]).length == 4) { arr = arr.reverse(); }
      // Orden del array: día-mes-año
      var today = new Date();
      var day = arr[0];
      var month = (arr.length >= 2)? arr[1]-1: today.getMonth();
      var year = (arr.length >= 3)? arr[2]: today.getFullYear();
      var date = new Date(year, month, day);
      value = Validate.leftzeros(date.getFullYear(), 4) + '-';
      value += Validate.leftzeros(date.getMonth()+1,2) + '-';
      value += Validate.leftzeros(date.getDate(), 2);
    }
    return value;
  },
  to_time: function(value) {
    var arr = Validate.extractNumbers(value);
    if (arr.length > 0) {
      if (arr.length < 2) { arr.push(0); }
      value = Validate.leftzeros(arr[0], 2) + ':' + Validate.leftzeros(arr[1], 2);
    }
    return value;
  },
  to_phone: function(value) { // Ejemplo: "123456789" -> "123 456 789"
    value = Validate.trim(value);
    if (value.length == 9 && Validate.areDigits(value)) {
      value = value.substr(0,3) + ' ' + value.substr(3,3) + ' ' + value.substr(6,3);
    }
    return value;
  },

/* is functions ------------------------------- */
// Indican si el valor mostrado es el correcto

  is_nif: function(abc) { // Indica si es un NIF o NIE válido
    var inicial = abc.substr(0,1).toUpperCase();
    var index = 'XYZ'.indexOf(inicial); // X=0, Y=1, Z=2
    var letra = abc.substr(abc.length-1,1);
    var numero;
    if (index >= 0 /*NIE*/) numero = '012'.charAt(index) + abc.substr(1,abc.length-2);
    else /*NIF*/ numero = abc.substr(0,abc.length-1);
    if (!isNaN(letra) || isNaN(numero)) { return false; }
    return letra.toUpperCase() == 'TRWAGMYFPDXBNJZSQVHLCKET'.charAt(numero % 23);
  },
  is_cif: function(abc) {
    // TODO:
    return true;
  },
  is_ccc: function(str) { // Código de Cuenta Corriente
    var filter = /^(\d{4}\-\d{4}\-\d{2}\-\d{10})$/i;
    return filter.test(str);
  },
  is_email: function(str) {
    var filter = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return (filter.test(str));
  },
  is_url: function(str) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(str);
  },
  is_date: function(str) {
    var filter = /^(\d{4}\-\d{1,2}\-\d{1,2})$/i;
    return filter.test(str);
  },
  is_time: function(str) {
    var filter = /^(\d{1,2}\:\d{1,2})$/i;
    return filter.test(str);
  },

/* attribute functions -------------------------- */

  attr_date: function(element) {
    var date = element.value.parseDateTime();
    var title = date == null? '': date.toLongCustomDateString();
    element.writeAttribute('title', title);
  },

  goto_url: function(event) {
    //location.href = this.value;
    window.open(this.value, '_blank');
  },

/* interface ------------------------------------ */

  correction: function(id, func_name) { // Corrige el <input> Ej: Validate.correction('iva','percent');
    if ($F(id) != '') {
      $(id).value = Validate['to_'+func_name]($F(id));
    }
  },
  test: function(id, func_name) { // Comprueba el <input> Ej: Validate.test('nif_empleado', 'nif');
    if ($F(id) == '' || Validate['is_'+func_name]($F(id))) {
      $(id).removeClassName('error');
    }
    else {
      $(id).addClassName('error');
    }
  },

  automatic: function(element) { // Busca los elementos <input> y le añade un evento para corregir y comprobar
  // Primero corregir y luego comprobar
    if (element == undefined) element = document.body;
    element.select('input.cif').each (function(element) { element.observe('change', function(){ Validate.test(this,'cif'); }) });
    element.select('input.ccc').each (function(element) { element.observe('change', function(){ Validate.test(this,'ccc'); }) });
    element.select('input.date').each (function(element) { element.observe('change', function(){ Validate.correction(this,'date'); Validate.test(this,'date'); Validate.attr_date(this);  }) });
    element.select('input.email').each (function(element) { element.observe('change', function(){ Validate.test(this,'email'); }) });
    element.select('input.url').each (function(element) { element.observe('change', function(){ Validate.test(this,'url'); }); element.observe('dblclick', Validate.goto_url);  });
    element.select('input.euro,input.number').each (function(element) { element.observe('change', function(){ Validate.correction(this,'euro'); }) });
    element.select('input.nif').each (function(element) { element.observe('change', function(){ Validate.test(this,'nif'); }) });
    element.select('input.percent').each (function(element) { element.observe('change', function(){ Validate.correction(this,'percent'); }) });
    element.select('input.time').each (function(element) { element.observe('change', function(){ Validate.correction(this,'time'); Validate.test(this,'time'); }) });
  },

/* miscelanea ----------------------------------- */

  comma2dot: function(value) { // Cambia la coma por punto
    return value.replace(/[\,]/g, '.');
  },
  extractNumbers: function(txt) { // Extrae los números Ej: '123-45/67' -> [123,45,57]
    txt += '';
    var arr = new Array();
    var number = '';
    for (var i=0; i<txt.length; ++i) {
      var character = txt.charAt(i);
      var is_digit = (character >= '0') && (character <= '9');
      var is_last_character = i == (txt.length-1);
      if (is_digit) { number += character; }
      if (number != '' && (is_digit==false || is_last_character)) {
        arr.push(parseInt(number,10));
        number = '';
      }
    }
    return arr;
  },
  leftzeros: function(txt, num) { // rellenar con ceros por la izquierda
    txt += '';
    while(txt.length < num) { txt = '0'+txt; }
    return txt;
  },
  trim: function(text) { // http://www.somacon.com/p355.php
    return text.replace(/^\s+|\s+$/g,'');
  },
  areDigits: function(value) { // Ejemplo: "123456" -> true
    for (var i=0; i<value.length; ++i) {
      var character = value.charAt(i);
      var is_digit = character >= '0' && character <= '9';
      if (!is_digit) return false;
    }
    return true;
  }

} // Validate

/* FORMAT ======================================= */

var Format = {

  number: function(num, numdecs, sufix) {
  // Format.number(123456.789, 2, '€') --> '123.456,79 €'
    if (isNaN(numdecs)) numdecs = 2;
    var arr = (num+'').split('.');
    var integer = arr[0];     // '123456'
    var decimal = '.'+arr[1]; // '.789'
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(integer)) { // '123.456'
      integer = integer.replace(rgx, '$1' + '.' + '$2');
    }
    if (isNaN(decimal)) decimal = '';
    else decimal = ','+parseFloat(decimal).toFixed(numdecs).substr(2); // ',79'
    sufix = sufix?' '+sufix:''; // ' €'
    return (integer + decimal + sufix);
  }

}