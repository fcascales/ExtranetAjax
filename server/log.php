<?php

/*
  logins.php - ProInf.net, 2009

  Almacena las sentencias SQL en el archivo "log.sql"
*/

require_once('session.php');

define('LOG',true);
define('RAW',true);

//Log::add('test','ok');

/* LOG ========================================== */

class Log {

  public static function addSQL($sql) {
    $user = Session::getUser();
    $ip = Session::getIP();
    $date = date('Y-m-d H:i:s');
    $sql = str_replace("\n", '\n', $sql);
    //Log::appendTextToFile('log.sql', "-- $date — $ip — $user\n$sql;\n");
    Log::appendTextToFile('log.sql', "$sql; -- $date — $ip — $user\n");
  }

  public static function addQuery() {
    if (LOG) {
      if (RAW) {
        Log::appendTextToFile('query.log', Log::getRawPost() . "\n"); // $HTTP_RAW_POST_DATA
      }
      else {
        $query = ($_POST)?$_POST:$_GET; // $_QUERY
        $list = array();
        foreach($query as $key=>$value) {
          $list[] = $key.'►'.$value;
        }
        Log::appendTextToFile('query.log', '▷'. implode('│',$list) . "\n");
      }
    }
  }

  public static function add($title, $text) {
    if (LOG) {
      Log::appendTextToFile('log.log', $title.'━▶'.$text."\n");
    }
  }


  // Utilities ----------------------------------

  static function getRawPost() {
    $putdata = fopen( "php://input", "rb");
    $result = '';
    while(!feof($putdata))
      $result .= fread($putdata, 4096 );
    fclose($putdata);
    return $result;
  }

  static function appendTextToFile ($file, $text)
  {
    if ($f = fopen($file, "a"))  {
      fputs ($f, $text, strlen($text));
      fclose ($f);
      return true;
    }
    else {
      // echo "No se puede abrir el archivo $line";
      return false;
    }
  }

} // class Log

?>