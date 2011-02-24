<?php
/*
  mail.php — ProInf.net — feb-2011

  Envío de correo
*/

/* INCLUDE ====================================== */

require_once('json/JSON.php');
require_once('db.php');
require_once('config/sql.php');
require_once('response.php');
require_once('log.php');

require_once('phpmailer/class.phpmailer.php');
require_once('config/phpmailer.php');

require_once('textile/classTextile.php');

define('DEBUG',false);

/* PRIVATE ====================================== */

class Mail {

  private $mailer;
  private $response;
  private $emails; // Lista de los correos usados para evitar duplicados

  //---------------------------------------------

  public function cmd_massmail($id) {
    $sql = SQL::$get['correos_masivos']; if ($sql == null) return $this->response->error('Sin SQL (1)');
    $db = new DB($this->response);
    $fields = $db->query_to_assoc($sql, array('id'=>$id)); if ($fields == false) return $this->response->error("Correo masivo no encontrado (id=$id)");

    if ($fields['fecha_alta'] != '') return $this->response->error("Este correo masivo ya fue enviado (id=$id)");

    $this->mailer = phpmailer();
    $this->emails = array();
    $this->mailer->Subject = $fields['asunto'];
    $this->mailer->Body    = self::getTextile($fields['mensaje']);
    //$this->mailer->AltBody = $fields['mensaje']; // Versión en texto plano

    $this->AddBCC("sbmfic@sbmfic.org", "SBMFiC");
    $this->AddBCC("fco@proinf.net", "Francisco José Cascales"); // Comentar esta línea

    // Adjuntos
    $files = explode("\n", $fields['adjunto']);
    foreach($files as $file) {
      $file = trim($file);
      if ($file != '') {
        $path = "../uploads/$file";
        if (file_exists($path)) {
          $this->mailer->AddAttachment($path);
        }
        else {
          return $this->response->error("No encuentro el archivo adjunto '$file'");
        }
      }
    }

    // Destinatarios
    $recipient = explode("\n", $fields['destinatario']);
    foreach($recipient as $target) {
      $target = utf8_decode($target);
      $target = trim($target);
      if ($target == '') {
        // Ignorar
      }
      else if (substr($target,0,2) == '@@') { // todos los correos
        $sql = SQL::$mail['todos_correos']; if ($sql == null) return $this->response->error('Sin SQL (2)');
        $list = $db->query_to_list($sql); if ($list == false) return $this->response->error('Correos no encontrados');
        foreach($list as $record) {
          self::debug('T', "${record['nombre']}:${record['correo']}");
          if (!$this->AddBCC($record['correo'], $record['nombre'])) return;
        }
      }
      else if (substr($target,0,1) == '@') { // un grupo
        $grupo = substr($target,1);
        $sql = SQL::$mail['grupos_correos']; if ($sql == null) return $this->response->error('Sin SQL (3)');
        $list = $db->query_to_list($sql, array('grupo'=>$grupo)); if ($list == false) return $this->response->error('Grupo no encontrado');
        foreach($list as $record) {
          self::debug($grupo, "${record['nombre']}:${record['correo']}");
          if (!$this->AddBCC($record['correo'], $record['nombre'])) return;
        }
      }
      else {
        $pos = strpos($target, '<');
        if ($pos === false) { // un correo manual
          self::debug('uno',$target);
          if(!$this->AddBCC($target)) return;
        }
        else { // un socio
          $nombre = substr($target,0,$pos-1);
          $correo = substr($target,$pos+1,strlen($target)-$pos-2);
          self::debug('par',"$nombre:$correo");
          if(!$this->AddBCC($correo, $nombre)) return;
        }
      }
    }

    if($this->mailer->Send()) { // if (true)

      $date = self::current_date();
      $count = count($this->emails);

      $this->response->ok = true;
      $this->response->message = "Se han enviado $count mensajes";
      $this->response->date = $date;
      $this->response->count = $count;

      $sql = SQL::$mail['correo_masivo_enviado'];
      $db->execute_query($sql, array('id'=>$id, 'date'=>$date));
    }
    else {
      $this->response->error('No se pudo enviar el correo');
    }
  } // cmd_massmail

  //---------------------------------------------

  public function cmd_textile($id) {
    $sql = SQL::$get['correos_masivos']; if ($sql == null) return $this->response->error('Sin SQL');
    $db = new DB($this->response);
    $fields = $db->query_to_assoc($sql, array('id'=>$id)); if ($fields == false) return $this->response->error("Correo masivo no encontrado (id=$id)");

    $this->response->ok = true;
    $this->response->message = self::getTextile($fields['mensaje']);
  } // cmd_textile

  //---------------------------------------------

  function getTextile($text) {
    // Comillas angulares simples, dobles y flechas
    $text = str_replace(array("'<",">'",'"<','>"','<<','>>','<-','->'),
      array('&lsaquo;','&rsaquo;','&laquo;','&raquo;','&laquo;','&raquo;','&larr;','&rarr;'), $text);

    // Textile
    $textile = new Textile();
    $html = $textile->TextileThis($text);

    // Mostrar bordes de tablas
    $html = str_replace('<table', '<table style="border-collapse:collapse;" border="1" cellpadding="4" ', $html);

    // Enlazar protocolo://direccion/ruta/
    $html = ereg_replace(
      "(>| )([a-zA-Z]+://([.]?[a-zA-Z0-9_/-?&%])*)(<| )",
      "\\1<a target=\"_blank\" href=\"\\2\">\\2</a>\\4", $html);

    // Enlazar www.algo-mas
    $html = ereg_replace(
      "(>| )(www([-]*[.]?[a-zA-Z0-9_/-?&%])*)(<| )",
      "\\1<a target=\"_blank\" href=\"http://\\2\">\\2</a>\\4", $html);

    $especial = array( // Modificar los caracteres especiales que da Textile
      '&#169;'=>'&copy;',     '&#174;'=>'&reg;',
      '&#176;'=>'&deg;',      '&#177;'=>'&plusmn;',
      '&#188;'=>'&frac14;',   '&#189;'=>'&frac12;',
      '&#190;'=>'&frac34;',   '&#215;'=>'&times;',
      '&#8211;'=>'&ndash;',   '&#8212;'=>'&mdash;',
      '&#8216;'=>'&lsquo;',   '&#8217;'=>'&rsquo;',
      '&#8220;'=>'&ldquo;',   '&#8221;'=>'&rdquo;',
      '&#8230;'=>'&hellip;',  '&#8482;'=>'&trade;'
    );
    $html = str_replace(array_keys($especial), array_values($especial), $html);

    // Restringir ancho
    $html = '<div style="max-width:600px;">'."\n$html\n".'</div>';

    return $html;
  }

  //---------------------------------------------

  private function AddBCC($correo, $nombre='') {
    if (in_array($correo, $this->emails)) {
      return true; // Duplicado
    }
    else if (!$this->mailer->AddBCC ($correo, $nombre)) {
      $this->response->error("Dirección errónea: |$nombre|$correo|");
      return false;
    }
    $this->emails[] = $correo;
    return true;
  }

  //---------------------------------------------

  public function init() {
    $this->response = new Response();
    $json = new Services_JSON();

    $query = ($_POST)?$_POST:$_GET; // $_QUERY

     // Copiar parámetros al response excepto algunos
    reset($query);
    foreach($query as $key=>$value) {
      if (strpos('',$key) == false) {
        $this->response->$key = $value;
      }
    }

    if ($this->response->ok) {
      switch ($query['cmd']) {
        case 'massmail':
          $this->cmd_massmail($query['id']);
          break;
        case 'textile':
          $this->cmd_textile($query['id']);
          break;
      }
    }

    if (array_key_exists('debug',$_GET)) { // $_GET['debug']) {
      echo '<p>user='.$_SESSION['user'].' ok='.$this->response->ok.' message='.$this->response->message.'</p>';
      Mail::debug('JSON', $json->encode($this->response));
    }
    else {
      header('Cache-control: no-cache');
      header('Pragma: no-cache');
      header('Content-type: application/json');
      header('Status: 200 OK', false, 200);
      echo ($json->encode($this->response));
    }
  } // init

  //---------------------------------------------

  public static function debug($title, $msg='') {
    if (DEBUG) {
      $msg = htmlentities($msg);
      echo utf8_encode("$title&mdash;<strong>$msg</strong>&mdash;<br />\n");
    }
  }

  public static function current_date() {
    date_default_timezone_set('Europe/Madrid'); // GMT
    return date('Y-m-d');
  }

} // Mail

/* ============================================== */

$mail = new Mail();
$mail->init();

/* ============================================== */

/*
  Pruebas:
  ?cmd=massmail&id=2&debug=1
*/
?>
