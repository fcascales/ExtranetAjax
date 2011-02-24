<?php
/*
  xml.php

  Utilidades de conversión a XML

  v0.01 - Francisco Cascales <fco@proinf.net> 8-dic-2009
  v0.02 - 21-dic-2009 - list_to_nodes

*/

class XML {

  /*
    Convierte un array HASH en XML

    Se pasa de
      clave1=>valor1, clave2=>valor2, ...
    a
      <nodo id="clave1">valor1</nodo><nodo id="clave2">valor2</nodo>. ..
  */
  public static function hash_to_nodes ($nodeName, $list) {
    $array = array();
    foreach($list as $key=>$value) {
      $array[] = "<$nodeName id=\"$key\">$value</$nodeName>";
    }
    return implode('',$array);
  }

  /*
    Convierte un array asociativo en XML

    Se pasa de
      clave1=>valor1, clave2=>valor2, ...
    a
      <clave1>valor1</clave1><clave2>valor2</clave2> ...
  */
  public static function assoc_to_nodes ($assoc) {
    $array = array();
    foreach($assoc as $key=>$value) {
      $array[] = "<$key>$value</$key>";
    }
    return implode('',$array);
  }

  /*
    Un array asociativo en attributos XML

    Se pasa de
      clave1=>valor1, clave2=>valor2, ...
    a
      clave1="valor1" clave2="valor2" ...
  */
  public static function assoc_to_attribs ($assoc) {
    $array = array();
    foreach($assoc as $key=>$value) {
      $array[] = "$key=\"$value\"";
    }
    return implode(' ',$array);
  }

  /*
    Un array de arrays asociativos en nodos con atributos XML (v0.02)
    El primer elemento del array asociativo da el nombre del nodo y su valor,
    el resto de elementos serán atributos del nodo.

    Se pasa de un array de
      [clave1=>valor1, clave2=>valor2, clave3=>valor3], ···
    a
      <clave1 clave2="valor" clave3="valor3">valor1</nodo> ···
  */
  public static function list_to_nodes($list) {
    $array = array();
    foreach($list as $assoc) {
      $nodeName = '';
      $nodeValue = '';
      $attribs = array();
      foreach($assoc as $key=>$value) {
        if ($nodeName == '') {
          $nodeName = $key;
          $nodeValue = $value;
        }
        else {
          $attribs[] = "$key=\"$value\"";
        }
      }
      $array[] = self::make_node($nodeName, implode(' ',$attribs), $nodeValue);
    }
    return implode('',$array);
  }

  /*
    Ensambla el nombre del nodo, sus atributos y su contenido interior
  */
  public static function make_node ($nodeName, $attribs='', $innerXML='') {
    $separator = $attribs == ''? '': ' ';
    return "<$nodeName$separator$attribs>$innerXML</$nodeName>";
  }

} // class XML

?>
