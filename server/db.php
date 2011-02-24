<?php
/*
  db.php — ProInf.net — jul/ago-2009, feb-2011
  version 1.2

  Simplifica el acceso a la BD

  Actualizaciones:
    2009-X-16 — query_to_hash
    2011-II-08 — Cambiada la carpeta de la copia de seguridad
*/

require_once('config/connection.php');

/* DB =========================================== */

class DB {

  // configuration -----------------------------

  private $host     = DB_HOST;     // 'localhost';
  private $user     = DB_USER;     // 'root';
  private $password = DB_PASSWORD; // '';
  private $database = DB_DATABASE; // 'mibasededatos';

  // variables ----------------------------------

  private $db;
  private $rs;
  private $response; // Array asociativo con las claves: 'ok' y 'message'
  private $connected = false;

  // constructor & destructor -------------------

  public function __construct ($response=null)  {
    if ($response == null) $this->response = new stdClass ();
    else $this->response = $response;

    $this->open();
  }

  function __destruct() {
    $this->close();
  }

  // open & close db ----------------------------

  private function open() {
    if (!(
      @$this->db = mysql_pconnect($this->host, $this->user, $this->password)
    )) {
      $this->response->ok = false;
      $this->response->message = mysql_error();
      return false;
    }

    mysql_set_charset('utf8');

    if ($this->is_error(
      mysql_select_db($this->database, $this->db)
    )) return false;

    $this->connected = true;
    return $this->db;
  }
  private function close() {
    $this->connected = false;
    @mysql_close($this->db);
  }

  public function backup ($filename=null, $type='7z') { // type: 7z|gz
    if ($filename == null) {
      $now = date("Y-m-d_H-i-s");
      $filename = "{$this->database}_$now";
    }
    $backup = "$filename.sql";
    $archive = "$backup.$type";
    $dir = '/extranet/backups/';
    $path = $_SERVER['DOCUMENT_ROOT'].$dir;
    switch($type) {
      case 'gz':
        system("mysqldump --opt --host={$this->host} --user={$this->user} --password={$this->password} {$this->database} | gzip > $path/$archive");
        break;
      case '7z':
        system("mysqldump --opt --host={$this->host} --user={$this->user} --password={$this->password} {$this->database} > $path/$backup");
        system("7za a -p{$this->password} $path/$archive $path/$backup > /dev/null");
        system("rm $path/$backup");
        break;
    }
    $this->response->ok = file_exists("$path/$archive");
    $this->response->archive = $archive;
    $this->response->link = "$dir$archive";
    $this->response->message = ($this->response->ok? 'OK': 'Error');
    return $result? $file: false;
  }

  // query --------------------------------------

  private function open_query($query) {
    if (!$this->connected) return false;

    if ($this->is_error(
      $this->rs = mysql_query($query, $this->db)
    )) return false;

    return $this->rs;
  }

  private function close_query() {
    @mysql_free_result($this->rs);
  }

  // interface ----------------------------------

   // all records: array of associative array
   public function query_to_list($query, $params = null) {
    if ($params != null) $query = DB::evaluate_params($query, $params);
    if (($rs = $this->open_query($query)) == false) return false;
    $list = array();
    //$types = $this->get_types();
    while ($row = mysql_fetch_assoc($rs)) {
      /*foreach($row as $key=>$value) {
        $row[$key] = DB::encodeToCharset($value);
      }*/
      $list[] = $row;
    }
    $this->close_query();
    return $list;
  }

  // all records: one associative array (first field is key, second is value)
  public function query_to_hash($query, $params = null) {
    if ($params != null) $query = DB::evaluate_params($query, $params);
    if (($rs = $this->open_query($query)) == false) return false;
    $hash = array();
    while ($row = mysql_fetch_array($rs)) {
      $hash[$row[0]] = $row[1];
    }
    $this->close_query();
    return $hash;
  }

  // only first record: associative array
  public function query_to_assoc($query, $params = null) {
   if ($params != null) $query = DB::evaluate_params($query, $params);
    if (($rs = $this->open_query($query)) == false) return false;
    $row = mysql_fetch_assoc($rs); // false if not row
    $this->close_query();
    return $row;
  }

  // only first field of first record
  public function query_lookup($query, $params = null) {
    if ($params != null) $query = DB::evaluate_params($query, $params);
    if (($rs = $this->open_query($query)) == false) return null;
    $row = mysql_fetch_array($rs, MYSQL_NUM); // false if not row
    $this->close_query();
    if ($row == false) return null;
    return $row[0];
  }

  // delete, insert, replace, update
  public function execute_query($query, $params = null) {
    if ($params != null)  $query = DB::evaluate_params($query, $params);
    $result = $this->open_query($query);
    $this->close_query();
    return $result;
  }

  // getters ------------------------------------

  public function get_response() {
    return $this->response;
  }
  public function is_connected() {
    return $this->connected;
  }
  public function get_message() {
    return $this->response->message;
  }

  // setters ------------------------------------

  public function set_response($response) {
    $this->response = $response;
  }

  // private ------------------------------------

  private function is_error($test) {
    if (!$test) {
      $this->response->ok = false;
      $this->response->message = mysql_error($this->db);
      return true;
    }
    return false;
  }

  // static -------------------------------------

  public static function evaluate_params($query, $params) {
    foreach($params as $key=>$value) {
      $query = str_replace('{'.$key.'}', DB::to_sql_param($value), $query);
    }
    return $query;
  }

  private function get_types() { // Tipos de datos de la tabla
    $types = array();
    $i = 0;
    while($i < mysql_num_fields($this->rs)) {
      $meta = mysql_fetch_field($this->rs, $i);
      $types[$meta->name] = $meta->type;
      $i++;
    }
    return $types;
  }

  public static function to_sql_param($value) {
    switch (true) {
      case is_null($value):   return "NULL";
      case is_string($value): return "'" . DB::sanitize_param($value) . "'";
      case is_bool($value):   return $value?'true':'false';
      case is_int($value):    return $value;
      case is_float($value):
      case is_array($value):
      case is_object($value):
      default:                return $value;
    }
  }

  private static function sanitize_param($value) {
    //$value = get_magic_quotes_gpc() ? stripslashes($value) : $value;
    ////// $value = addslashes($value); // Barras invertidas delante de comilla simple, doble, barra invertida y NULL
    //$value = filter_var($value, FILTER_SANITIZE_STRING); // Demasiado fuerte para SQL
    /////if (function_exists('mysql_real_escape_string')) $value = mysql_real_escape_string($value);
    return filter_var($value, FILTER_SANITIZE_MAGIC_QUOTES);;
  }

  private static function to_charset($text) {
    // CHARSET: 'ISO-8859-1' (Latin-1), 'UTF-8', ...
    ////return htmlentities($text, ENT_QUOTES, DB_CHARSET);
    return htmlentities($text, ENT_QUOTES, 'UTF-8');
  }




} // class DB

/* ============================================== */

/*---TEST---
require_once('json/JSON.php');
require_once('connection.php');
$json = new Services_JSON();

$sql = "SELECT id_poblacion AS id, poblacion AS label FROM poblaciones WHERE poblacion LIKE {alfa} ORDER BY poblacion";
$response = new stdClass();
$db = new DB($response);
$list = $db->query_to_list($sql, array('alfa'=>"%m%"));
echo '$list = ' . $json->encode($list) . '<br/>';
echo '$response = ' . $json->encode($response) . '<br/>';
echo '<hr />';

$sql = "SELECT clave AS password FROM usuarios WHERE id_usuario={user} AND administracion<>0";
$assoc = $db->query_to_assoc($sql, array('user'=>'fco'));
echo '$assoc["password"] = ' . $assoc['password'] . ' [' . gettype($assoc['password']) . ']<br/>';
echo '$response = ' . $json->encode($response) . '<br/>';
echo '<hr />';

$sql = "select xxx";
$result = $db->execute_query($sql);
echo '$sql = ' . $sql . '<br/>';
echo 'exec = ' . $result . ' [' . gettype($result) . ']<br/>';
echo '$response = ' . $json->encode($response) . '<br/>';
$db->get_response()->message = '';
echo '<hr />';

$sql = 'insert into ciudades values ({id}, {ciudad})';
$args = array('id'=>3, 'ciudad'=>'Barcelona');
echo 'sql1 = ' . $sql . '<br/>';
echo 'sql2 = ' . DB::evaluate_params($sql, $args) . '<br/>';
echo '$response = ' . $json->encode($response) . '<br/>';
echo '<hr />';

$sql = "SELECT curso FROM cursos WHERE id_curso={id}";
$args = array('id'=>'FTN-01-09');
echo '$sql = ' . $sql . '<br/>';
echo '$value = ' . $db->query_lookup($sql, $args) . '<br/>';
echo '$response = ' . $json->encode($response) . '<br/>';
echo '<hr />';
---TEST---*/
?>
