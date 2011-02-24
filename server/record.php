<?php
/*
  record.php — ProInf.net, 2009

  Es un servidor AJAX que responde con JSON.
  El cliente es "record.js"

  Clases:
    - Record
    - Util

  Actualizaciones:
    2009-X-16 — cmd_hash
*/

/* INCLUDE ====================================== */

require_once('json/JSON.php');
require_once('db.php');
require_once('config/sql.php');
require_once('response.php');
require_once('log.php');
require_once('util.php');

define('VERBOSE',false);

/* RECORD ======================================= */

class Record { // Obtiene resultados SQL

  private $response; // Array asociativo con las claves: 'ok' y 'message'
  private $db = null;

  public function __construct ($response)  {
    $this->response = $response;
    // No conectar aún con la BD, esperar hasta el último momento,
    //  una vez pasado el mayor número de filtros posible
  }

  private function db_connect() {
    if ($this->db == null) {
      $this->db = new DB($this->response);
    }
  }

/*----------------------------------------------- */
// page & pages

  public function cmd_page($query, $filters) { // Parecido a cmd_get
    $sql = SQL::$page[$query];
    if ($sql == null) return $this->response->error('Sin SQL');

    $this->db_connect();
    $this->response->fields = $this->db->query_to_assoc($sql, $filters);
    if ($this->response->fields == false) $this->response->error('No encontrado');
  }

  public function cmd_pages($query, $filters, $num_page, $page_size) { // Parecido a cmd_table
    $sql = SQL::$pages[$query];
    if ($sql == null) return $this->response->error('Sin SQL');
    $sql = $this->pagination($query, $sql, $num_page, $page_size); // FIXME: Si hay $filters la paginación no va a funcionar

    $this->db_connect();
    $this->response->list = $this->db->query_to_list($sql, $filters);
    if ($this->response->list == false) $this->response->error('No encontrado');
  }

/* ---------------------------------------------- */
// Obtiene un único valor

  public function cmd_lookup($query, $id) {
    $sql = SQL::$lookup[$query];
    if ($sql == null) return $this->response->error('Sin SQL');

    $this->db_connect();
    $this->response->value = $this->db->query_lookup($sql, array('id'=>$id));
  }

/* ---------------------------------------------- */
// Obtiene un listado para un combobox

  public function cmd_combobox($query, $filters) {
    $sql = SQL::$combobox[$query];
    if ($sql == null) return $this->response->error('Sin SQL');

    if (is_array($filters) && count($filters) > 0) {
      $sql = Record::apply_filters($sql, $filters);
    }

    $this->db_connect();
    $this->response->list = $this->db->query_to_list($sql);
    if ($this->response->list == false) $this->response->error('No encontrado');
  }

/* ---------------------------------------------- */
// Obtiene un listado que puede estar filtrado

  public function cmd_list($query, $historic, $filters, $id) {
    $sql = SQL::$list[$query];
    if ($sql == null) return $this->response->error('Sin SQL');

    //// $filters = Record::get_filters($query, $query);

    if (isset($id)) {
      $sql = str_replace('{filter}', 'TRUE', $sql); // Quitar el filtro de historic si hubiese
      $sql = Record::apply_filters($sql, array('id'=>$id));
    }
    else if (is_array($filters) && count($filters) > 0) { // Si hay filtros el historic no debe funcionar
      $sql = str_replace('{filter}', 'TRUE', $sql); // Quitar el filtro de historic si hubiese
      $sql = Record::apply_filters($sql, $filters);
      $this->response->labels = $this->get_filter_labels($filters);
    }
    else {
      if (isset($historic)) { $filter_name =  "$query-$historic"; }
      else { $filter_name = $query; }
      $filter = SQL::$list_filters[$filter_name];
      $sql = str_replace('{filter}', $filter, $sql);
    }

    $this->db_connect();
    $this->response->list = $this->db->query_to_list($sql);
    if ($this->response->list == false) $this->response->error('No encontrado');
  }

/* ---------------------------------------------- */
// Obtiene un listado para crear una tabla - DB.Table (record.js)

  public function cmd_table($query, $filters, $num_page, $page_size) {
    $sql = SQL::$table[$query];
    if ($sql == null) return $this->response->error('Sin SQL');
    $sql = $this->pagination($query, $sql, $num_page, $page_size); // FIXME: Si hay $filters la paginación no va a funcionar
    $this->db_connect();
    $this->response->list = $this->db->query_to_list($sql, $filters);
    if ($this->response->list == false) $this->response->error('No encontrado');
  }

/* ---------------------------------------------- */
// Obtiene un array asociativo- DB.Translations (record.js)

  public function cmd_hash($query, $filters) {
    $sql = SQL::$hash[$query];
    if ($sql == null) return $this->response->error('Sin SQL');

    $this->db_connect();
    $this->response->hash = $this->db->query_to_hash($sql, $filters);
    if ($this->response->hash == false) $this->response->error('No encontrado');
  }

/* ---------------------------------------------- */
// Obtiene un listado para una rejilla de datos - DB.Grid (record.js)

  public function cmd_grid($query, $filters) { // Ver cmd_save
    $sql = SQL::$grid[$query];
    if ($sql == null) return $this->response->error('Sin SQL');

    $this->db_connect();
    $this->response->list = $this->db->query_to_list($sql, $filters);
    if ($this->response->list == false) $this->response->error('No encontrado');
  }

/* ---------------------------------------------- */
// Obtiene los datos de un solo registro destinados a una ficha

  public function cmd_get($query, $id) {
    $sql = SQL::$get[$query];
    if ($sql == null) return $this->response->error('Sin SQL');

    $this->db_connect();
    $this->response->fields = $this->db->query_to_assoc($sql, array('id'=>$id));
    if ($this->response->fields == false) $this->response->error('No encontrado');
  }

/* ---------------------------------------------- */
// Inserta un registro

  public function cmd_insert($query, $fields) {
    // SQL
    $sql = SQL::getInsert($query, $fields);
    if ($sql == null) return $this->response->error('Sin SQL');
    $sql = DB::evaluate_params($sql, $fields);

    // Verbose
    if (VERBOSE) $this->response->verbose = "<b>sql</b>=<q>$sql</q>";
    //$this->response->fields = $fields;

    // Database
    $this->db_connect();
    $this->response->ok = $this->db->execute_query($sql);
    if ($this->response->ok == false) return;
    else Log::addSQL($sql);

    // Id inserted
    $id = $this->db->query_lookup(SQL::getLastInsertId($query));
    if ($id == null) return $this->response->error('ID null');
    $this->response->id = $id;

    // Remember
    Logins::addChange($this->db, 'INSERT', $query, $id);

    // Fields inserted (fields)
    $this->cmd_get($query, $id);
  }

/* ---------------------------------------------- */
// Actualiza un registro

  public function cmd_update($query, $id, $fields) {
    // SQL
    $sql = SQL::getUpdate($query, $fields);
    if ($sql == null) return $this->response->error('Sin SQL');
    $sql = DB::evaluate_params($sql, $fields);
    $sql = DB::evaluate_params($sql, array('id'=>$id));

//Log::add('cmd_update$fields', implode(';', $fields) );
//Log::add('cmd_update$sql', $sql);

    // Verbose
    if (VERBOSE) $this->response->verbose = "<b>sql</b>=<q>$sql</q>";
    //$this->response->fields = $fields;

    // Database
    $this->db_connect();
    $this->response->ok = $this->db->execute_query($sql);
    if ($this->response->ok == false) return;
    else Log::addSQL($sql);

    // Id (updated and original)
    $idfield = SQL::getIdField($query); //$idfield = SQL::$ids[$query];
    $newid = isset($fields[$idfield])? $fields[$idfield]: $id;
    $this->response->newid = $newid;
    $this->response->id = $id;

    // Remember
    Logins::addChange($this->db, 'UPDATE', $query, $id);

    // Fields updated (fields)
    $this->cmd_get($query, $newid);
  }

/* ---------------------------------------------- */
// Borra un registro

  public function cmd_delete($query, $id) {
    // SQL
    $sql = SQL::getDelete($query);
    if ($sql == null) return $this->response->error('Sin SQL');
    $sql = DB::evaluate_params($sql, array('id'=>$id));

    // Verbose
    if (VERBOSE) $this->response->verbose = "<b>sql</b>=<q>$sql</q>";

    // Database
    $this->db_connect();
    $this->response->ok = $this->db->execute_query($sql);
    if ($this->response->ok == false) return;
    else Log::addSQL($sql);

    // Id deleted
    $this->response->id = $id;

    // Remember
    Logins::addChange($this->db, 'DELETE', $query, $id);
  }

/* ---------------------------------------------- */
// Añade/modifica/borra varios registros (de una rejilla)

  /*
    $actions: ['insert'|'update'|'delete', ...]
    $data: [{campo=>valor, ...}, ...]
  */
  public function cmd_save ($query, $actions, $data) { // Ver cmd_grid

    $sqls = array();
    $oks = array();
    $msgs = array();
    $ids = array();
    $newdata = array();
    $result = true;

//$this->response->verbose = '';

    foreach($actions as $index=>$action) {

      // Obtener el valor de los campos como array asociativo
      $fields = $data[$index];
      if (is_object($fields)) $fields = Util::object_to_array($fields);

      // Crear un campo llamado id (si no existe) para que haga de filtro de update o delete
      $idfield = SQL::getIdField($query);
      if (isset($fields[$idfield]) && !isset($fields['id'])) $fields['id'] = $fields[$idfield];

      // Obtener la plantilla SQL
      switch ($action) {
        case 'insert': $sql = SQL::getInsert($query, $fields); break;
        case 'update': $sql = SQL::getUpdate($query, $fields); break;
        case 'delete': $sql = SQL::getDelete($query); break;
        default: continue;
      }

      if ($sql == null) {
        $ok = false;
        $msg = 'Sin SQL';
        $id = 0;
      }
      else {
        // Sustituir parámetros en el SQL
        $sql = DB::evaluate_params($sql, $fields);

        // Ejecutar las sentencias SQL
        $this->db_connect();
        $ok = $this->db->execute_query($sql);
        $msg = $this->response->message;

        if ($ok) {
          Log::addSQL($sql);

          // Obtener el valor de id
          switch($action) {
            case 'insert': $id = $this->db->query_lookup(SQL::getLastInsertId($query)); break;
            case 'update': $id = isset($fields[$idfield])? $fields[$idfield]: $fields['id']; break;
            case 'delete': $id = $fields['id']; break;
          }
          $fields[$idfield] = $id;

          // Leer el valor actual del registro (no es obligatorio)
          // ...
          // ...
        }
      }
      $sqls[] = $sql;
      $result = $ok and $result;
      $msgs[] = $ok? 'OK' : $msg;
      $oks[] = $ok;
      $ids[] = $id;
      $newdata[] = $fields;

//$this->response->verbose .= 'result='.($result?'s':'n').' ok='.($ok?'s':'n').' '.gettype($ok).', ';

    }


    if (VERBOSE) $this->response->verbose = implode('<br />',$sqls).'<br />oks: '.implode(',',$oks);
    $this->response->ok = $result;
    $this->response->oks = $oks;
    $this->response->newdata = $newdata;
    $this->response->message = $result? ('OK×'.count($oks)): ('<ul><li>'.implode('</li><li>',$msgs).'</li></ul>');

    // Remember
    Logins::addChange($this->db, 'SAVE', $query, '#'.count($actions));

    /*// Leer los nuevos datos
    $sql = SQL::getSelect($query, $ids);
    $this->response->newdata = ($sql == null)? array(): $this->db->query_to_list($sql);*/
  }

/* ---------------------------------------------- */
// Ejecutar un procedimiento almacenado

  public function cmd_proc($query) {
    // SQL
    $sql = "call $query()"; //SQL::$proc[$query];
    if ($sql == null) return $this->response->error('Sin SQL');

    // Database
    $this->db_connect();
    $this->response->ok = $this->db->execute_query($sql);
  }

/* ---------------------------------------------- */
// Copia de seguridad de la base de datos

  public function cmd_backup() {
    $this->db_connect();
    $this->db->backup();
  }


/* private -------------------------------------- */

/* get filters ·································· */

/*---
  private static function get_filters($query, $query) {
    $filter_fields = SQL::$filter_fields[$query];
    if ($filter_fields == null) return null;

    return Record::selectAssocByKeys($query, $filter_fields);
  }

  private static function selectAssocByKeys($assoc, $keys) {
  // Extrae del array asociativo las claves indicadas
  // Ej: selectAssocByKeys(array('id_cliente'=>3, 'id_factura'=>10, 'id_empleado'=>100), array('id_cliente','id_empleado'))
  // --> array('id_cliente'=>3, 'id_clase'=>100)
    $result = array();
    foreach ($keys as $key) {
      if (isset($assoc[$key])) {
        $result[$key] = $assoc[$key];
      }
    }
    return $result;
  }
---*/

/* apply filters ································ */

  private static function apply_filters($sql, $filters) {
    $where = Record::getWhere($filters);
    if ($where == '') return $sql;
    else return "SELECT * FROM ($sql) aa WHERE $where";
  }

  private static function getWhere($filters) {
  // Ej: getWhere(array('id_cliente'=>3, 'id_factura'=>10, 'id_empleado'=>100))
  // --> 'id_cliente=3 AND id_factura=10 AND idempleado=100'
    $where = '';
    foreach ($filters as $field=>$value) {
      if ($where != '') { $where .= ' AND '; }
      $where .= $field . '=' . DB::to_sql_param($value);
    }
    return $where;
  }

/* filter labels ································ */

  private function get_filter_labels($filters) {
    $result = new stdClass();
    foreach($filters as $field=>$value) {
      $query = str_replace('_id','',str_replace('id_', '', $field));
      $sql = SQL::$lookup[$query];
      if ($sql == null) continue;
      $this->db_connect();
      $value = $this->db->query_lookup($sql, array('id'=>$value));
      $result->$field = $value;
    }
    return $result;
  }

/* pagination ··································· */

  private function pagination($query, $sql, $num_page, $page_size) {
    if (isset($num_page) && isset($page_size)) { // Paginación
      $this->db_connect();
      $sql2 = SQL::getTotalPages($query, $page_size);
      $total_pages = $this->db->query_lookup($sql2);
      if ($num_page < 1) $num_page = 1; else if ($num_page > $total_pages) $num_page = $total_pages;
      $this->response->num_page = $num_page;
      $this->response->total_pages = $total_pages;
      $sql = SQL::getPage($sql, $num_page, $page_size);
      ////$this->response->verbose = $sql;
    }
    return $sql;
  }

} // class Record

?>