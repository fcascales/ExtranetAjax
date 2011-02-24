<?php
/*
  dirserver.php — ProInf.net — feb-2011

  Es un servidor AJAX que responde con JSON.
  El cliente es "dir.js"

  Actualizaciones:
*/

/* INCLUDE ====================================== */

require_once('json/JSON.php');
require_once('dir.php');
require_once('response.php');
require_once('log.php');
require_once('util.php');

define('VERBOSE',false);

/* DIRSERVER ==================================== */

class DirServer { // Obtiene los archivos de una carpeta

  private $response; // Array asociativo con las claves: 'ok' y 'message'

  //---------------------------------------------
  // Constructor

  public function __construct ()  {
    $this->response = new Response();
    $json = new Services_JSON();

    Log::addQuery();

    $query = ($_POST)?$_POST:$_GET;
    reset($query);
    foreach($query as $key=>$value) { // Copiar parámetros de entrada en la salida
      if (strpos('ok message', $key) === false) { // Excepto estos parámetros
        $this->response->$key = $value;
      }
    }

    if ($this->response->ok) {
      if (array_key_exists('dir', $query)) { // Se ha especificado algún directorio
        $dir = self::validate_dir($query['dir']); // Lista de directorios permitidos
        if ($dir !== false) {
          switch ($query['cmd']) {
            case 'dir':
              $this->cmd_dir($dir);
              break;
            case 'tree':
              $this->cmd_tree($dir);
              break;
            case 'newdir':
              $this->cmd_newdir($dir, $query['name']);
              break;
            case 'delete':
              $items = explode('/', $query['items']);
              $this->cmd_delete($dir, $items);
              break;
            case 'rename':
              $this->cmd_rename($dir, $query['name'], $query['newname']);
              break;
            case 'copy':
              break;
            case 'move':
              break;
          }
        } else $this->response->error("Acceso prohibido al directorio");
      } else $this->response->error("Falta indicar el directorio");
    }

    if (array_key_exists('debug',$_GET)) { // Depuración
      echo "user=".$_SESSION['user']."  ok=".($this->response->ok?'si':'no')." message=".$this->response->message."<br />";
      self::debug('JSON', $json->encode($this->response));
    }
    else {
      header('Cache-control: no-cache');
      header('Pragma: no-cache');
      header('Content-type: application/json');
      header('Status: 200 OK', false, 200);
      echo ($json->encode($this->response));
    }
  }

  /*
   * Lista de directorios permitidos
   * y conversión al directorio físico
   */
  private static function validate_dir($dir) {
    if (strstr($dir, 'uploads', true) !== false) return "../$dir";
    if (strstr($dir, 'stories', true) !== false) return "../../images/$dir";
    return false;
  }

  //---------------------------------------------
  // Comandos

  private function cmd_dir($base) {
    $dir = new Dir($base, $this->response);
    $dirs = $dir->get_hashdirs();
    $files = $dir->get_hashfiles();
    $this->response->dirs  = $dirs;
    $this->response->files = $files;
    $this->response->numdirs = count($dirs);
    $this->response->numfiles = count($files);
  }

  private function cmd_tree($base) {
    $dir = new Dir($base, $this->response);
    $tree = $dir->get_tree();
    $this->response->tree = $tree;
  }

  private function cmd_newdir($base, $name) {
    $dir = new Dir($base, $this->response);
    $dir->newdir($name);
  }

  private function cmd_delete($base, $items) {
    if (count($items)==1 && $items[0]=='') {
      return $this->response->error("No hay nada que borrar");
    }
    $dir = new Dir($base, $this->response);
    $oks = 0; $fails = 0;
    foreach ($items as $item) {
      if($dir->delete($item)) $oks++; else $fails++;
    }
    $this->ok = $oks > 0;
    $this->response->message = "";
    if ($oks   > 0) $this->response->message .= "He borrado $oks elementos.";
    if ($fails > 0) $this->response->message .= "No pude borrar $fails elementos. ";
  }

  private function cmd_rename($base, $name, $newname) {
    $dir = new Dir($base, $this->response);
    $dir->rename($name, $newname);
  }

  //---------------------------------------------
  // Methods (private)

  //---------------------------------------------
  // Static

  public static function debug($title, $msg) {
    echo utf8_encode("<p><strong>{$title}:</strong><br />{$msg}</p>\n\n");
  }

} // DirServer

/* ============================================== */

new DirServer();

/* ============================================== */

/*
  Pruebas:
  ?debug=1&cmd=dir&dir=uploads
*/

?>