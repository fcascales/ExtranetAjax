<?php
/*
  socio.php - ProInf.net, 2011

  Inserta un socio del formulario web "Hazte socio"
  utilizando las funciones que brinda la extranet
*/

/*---*/

require_once('record.php');

class Socio {

  public static function insert($fields) {

    $fields['nuevo'] = 1;
    $fields['fecha_alta'] = '{fecha_alta}';

    $response = new stdClass();
    $response->ok = true;
    $record = new Record($response);
    $record->cmd_insert('socios', $fields);
    return $response->ok == true;

  }

} // class Socio

/*---*/

?>