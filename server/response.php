<?php
/*
  response.php - ProInf.net, julio-agosto 2009

  Almacena la respuesta

  Actualizaciones:
    2009-X-16 - Posibilidad de iniciarse como $public=true
*/

require_once('session.php');

/* RESPONSE ===================================== */

class Response { // Convertible a JSON

  public $ok;  // true or false
  public $message;

  public function __construct($public=false) {
    if ($public == false) {
      $this->ok = Session::isConnected();
      $this->message = $this->ok?'OK':'Acceso denegado';
    }
    else {
      $this->ok = true;
      $this->message = 'OK';
    }
  }

  public function error($message='Acceso denegado') {
    $this->ok = false;
    $this->message = $message;
    return false;
  }


} // class Response

?>