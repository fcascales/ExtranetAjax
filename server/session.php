<?php
/*
  session.php — ProInf.net, 2009
  version 1.2

  Gestiona la conexión del usuario

  Actualizaciones:
    2011-02-11 — Uso de 'array_key_exists'
*/

require_once('db.php');
require_once('logins.php');
require_once('log.php');
require_once('captcha.php');

/* ============================================== */

if (!isset($_SESSION)) { session_start(); }

/* SESSION ====================================== */

class Session {

  // response methods ···························

  public static function validate($response) {
    $response->ok = Session::isConnected();
    $response->user = Session::getUser();
  }
  public static function disconnect($response) {
    Session::setAutologin(false);
    $_SESSION['connected'] = false;
    $_SESSION['user'] = '';
    unset($_SESSION['connected']);
    unset($_SESSION['user']);
    unset($_SESSION['login_id']);
    $response->ok = true;
  }
  public static function random($response) {
    Session::calcRandom();
    $response->random = $_SESSION['random'];
    $response->ok = true;
  }
  public static function login($response, $user, $ticket, $remember, $captcha) {
    $_SESSION['connected'] = false;
    $_SESSION['user'] = '';
    ////Log::add('captcha',Captcha::test($captcha)?'s':'n');
    /*---if (!Captcha::test($captcha)) {
      Session::calcRandom();
      $response->random = $_SESSION['random'];
      $response->message = 'Captcha erróneo';
      return;
    }---*/
    if ($user != '' and $ticket != '') {
      $db = new DB($response);
      $sql = "SELECT clave AS password FROM ext_usuarios WHERE id_usuario={user} AND administracion<>0";
      $result = $db->query_to_assoc($sql, array('user'=>$user));
      if ($result) {
        $password = $result['password'];
        $random = $_SESSION['random'];
        $melange = md5($password . $random);
        if ($melange == $ticket) {
          $_SESSION['connected'] = true;
          $_SESSION['user'] = $user;

          $response->ok = true;
          $response->message = 'OK';
          $response->user = $_SESSION['user'];

          if ($remember == 'true') {
            $db->set_response(new stdClass()); // Para que no modifique $response
            Session::setAutologin(true, $db);
          }
        }
      }
    }
    if ($response->ok == false) {
      Session::calcRandom();
      $response->random = $_SESSION['random'];
      $response->message = 'Acceso denegado';
    }
    Logins::addLogin($db, $user, $response->ok);
  }

  public static function password($response, $old_password, $new_password) { // Cambiar la contraseña
    $user = Session::getUser();
    $sql = "SELECT id_usuario FROM ext_usuarios WHERE id_usuario={user} AND clave={password}";
    $db = new DB($response);
    $test = $db->query_lookup($sql, array('user'=>$user, 'password'=>$old_password));
    if ($test != $user) return $response->error();
    $sql = "UPDATE ext_usuarios SET clave={password} WHERE id_usuario={user}";
    $response->ok = $db->execute_query($sql, array('user'=>$user, 'password'=>$new_password));
  }

  // autologin ··································

  private static function setAutologin($ok, $db=null) { // Guarda la IP con el usuario si es $ok y sino borra la IP
    if ($db == null) $db = new DB();
    $user = $_SESSION['user'];
    if ($ok) {
      $sql = "UPDATE ext_usuarios SET ip={ip} WHERE id_usuario={user}";
      $ip = Session::getIP();
      $db->execute_query($sql, array('user'=>$user, 'ip'=>$ip));
    }
    else {
      $sql = "UPDATE ext_usuarios SET ip=NULL WHERE id_usuario={user}";
      $db->execute_query($sql, array('user'=>$user));
    }
  }
  private static function getAutologin($db=null) { // Retorna el usuario de la actual IP o null
    if ($db == null) $db = new DB();
    $ip = Session::getIP();
    $sql = "SELECT id_usuario FROM ext_usuarios WHERE ip={ip}";
    $user = $db->query_lookup($sql, array('ip'=>$ip));
    return $user;
  }
  private static function autologin() { // Si realiza el autologin da true y sino false
    $db = new DB();
    $user = Session::getAutologin($db);
    if ($user != null) {
      $_SESSION['connected'] = true;
      $_SESSION['user'] = $user;
      Logins::addLogin($db, $user, true);
      return true;
    }
    return false;
  }

  // private methods ····························

  private static function calcRandom() {
    srand((double)microtime()*1234567); //srand(floor(time());
    $_SESSION['random'] = strtolower(md5(rand()));
  }

  // public methods ·····························

  public static function isConnected () { // ¿El usuario está conectado?
    if (isset($_SESSION['connected'])) {
      if ($_SESSION['connected'] == true) {
        return true;
      }
    }
    return Session::autologin(); // Al comentar esta línea se desactivará el autologin
    //return false;
  }
  public static function getUser() {
    if (isset($_SESSION['connected'])) {
      if ($_SESSION['connected'] == true) {
        return $_SESSION['user'];
      }
    }
    return null;
  }
  public static function getDate() {
    date_default_timezone_set('Europe/Madrid'); // GMT
    return date('Y-m-d');
  }

  public static function getIP() // IP Real del visitante - Damian Aguilar
  {
    if ($_SERVER) {
      if (array_key_exists('HTTP_X_FORWARDED_FOR',$_SERVER)) { //  $_SERVER['HTTP_X_FORWARDED_FOR']) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
      }
      elseif (array_key_exists('HTTP_CLIENT_IP', $_SERVER)) { //$_SERVER['HTTP_CLIENT_IP']) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
      }
      else {
        $ip = $_SERVER['REMOTE_ADDR'];
      }
    }
    else {
      if (getenv('HTTP_X_FORWARDED_FOR')) {
        $ip = getenv('HTTP_X_FORWARDED_FOR');
      }
      elseif (getenv('HTTP_CLIENT_IP')) {
        $ip = getenv('HTTP_CLIENT_IP');
      }
      else {
        $ip = getenv('REMOTE_ADDR');
      }
    }
    return $ip;
  }

} // class Session

/* ============================================== */
?>