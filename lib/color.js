/*
  color.js — proinf.net — ago-2009

  Asigna un color a un texto
*/

/* PSEUDORANDOM ================================= */

var Pseudorandom = new function() { // Un generador de números aleatorios simple
  this.seed = 123456789;

  // stackoverflow.com/questions/453479/how-good-is-java-util-random
  this.next = function() {
    this.seed ^= (this.seed << 21);
    this.seed ^= (this.seed >>> 35);
    this.seed ^= (this.seed << 4);
    return this.seed;
  };

  // Representación en color de un texto
  this.getColorFromString = function(string) {
    var color = '#';
    if (string == '') {
      color += 'ffffff';
    }
    else {
      var hash = 0;
      for (var i=0; i < string.length; ++i) {
        hash = hash*16 + string.charCodeAt(i) % 16;
      }
      this.seed = hash;
      for (var i=0; i<6; ++i) {
        //color += "0123456789abcdef".charAt (this.getNumber() % 16);
        color += "89abcdef".charAt (Math.abs(this.next()) % 8); // colores claros
      }
    }
    return color;
  };

}; // Pseudorandom

/* COLOR ======================================== */

// Esta clase evita tener que recalcular el color de un texto
var StringColors = {

  hash: {}, // Lista de textos asociados a colores

  getColorFromString: function(string) {
    for (var key in this.hash) {
      if (string == key) {
        return this.hash[key];
      }
    }
    this.hash[string] = Pseudorandom.getColorFromString(string);
    return this.hash[string];
  }
}; // StringColors
