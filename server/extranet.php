<?php
/*
   extranet.php - ProInf.net, 2009

   Es un servidor AJAX
   Escucha peticiones GET
*/

/* INCLUDE ====================================== */

require_once('json/JSON.php');
require_once('db.php');
require_once('session.php');
require_once('response.php');

/* MAIN ========================================= */

class Main {

  public static function init() {
    $query = ($_POST)?$_POST:$_GET;
    $json = new Services_JSON();
    $response = new Response();
    $response->time = $query['time'];

    switch ($query['cmd']) {
      case 'validate':   Session::validate($response); break;
      case 'disconnect': Session::disconnect($response); break;
      case 'random':     Session::random($response); break;
      case 'login':      Session::login($response, $query['user'],$query['ticket'],$query['remember'],$query['captcha']); break;
      default:
        if ($response->ok) {
          switch ($query['cmd']) {
            case 'password':   Session::password($response, $query['old'], $query['new']); break;
          }
        }
    }


    if (array_key_exists('debug', $query)) {
      Main::debug('JSON', $json->encode($response));
    }
    else {
      header('Cache-control: no-cache');
      header('Pragma: no-cache');
      header('Content-type: application/json'); //header('Content-type: text/xml; charset=UTF-8', true);
      header('Status: 200 OK', false, 200);     //header("Status: 400 Bad request", false, 400);
      echo ($json->encode($response));
    }
  } // init

  public static function debug($title, $msg) {
    echo utf8_encode("<p><strong>{$title}:</strong><br />{$msg}</p>\n\n");
  }

} // Main

/* ============================================== */

Main::init();

/* ============================================== */

?>
