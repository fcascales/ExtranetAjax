<?php
/*
  util.php — ProInf.net — 2009, feb-2011

  Utilidades genéricas

  Actualizaciones:
    Separar la clase de record.php
*/


/* UTIL ========================================= */

class Util {

  public static function object_to_array ($obj) {
    $assoc = array();
    foreach ($obj as $key=>$value) {
      $assoc[$key] = $value;
    }
    return $assoc;
  }

  public static function url_assoc_decode ($encoded_assoc) {
    $assoc = array();
    if ($encoded_assoc != '') {
      $encoded_assoc = Util::sanitize_quotes($encoded_assoc);
      $array = explode('&', $encoded_assoc);
      foreach ($array as $element) {
        $dual = explode('=', $element); //split('=',$element);
        $key = urldecode($dual[0]);
        $value = urldecode($dual[1]);
        $value =
        $assoc[$key] = $value;
      }
    }
    return $assoc;
  }

  public static function string_begins_with($string, $prefix) {
    return (strncmp($string, $prefix, strlen($prefix)) == 0);
  }

  public static function sanitize_quotes($text) {
    $text = str_replace('\"','"',$text);
    $text = str_replace("\'","'",$text);
    return $text;
  }

  public static function sanitize_json($json) {
    if (is_array($json)) {
      foreach ($json as $index=>$element) {
        $json[$index] = Util::sanitize_json($element);
      }
    }
    else if (is_object($json)) {
      foreach ($json as $key=>$element) {
        $json->$key = Util::sanitize_json($element);
      }
    }
    else {
      $json = Util::sanitize_quotes($json);
    }
    return $json;
  }


} // class Util

?>