<?php
/*
   horario.php - ProInf.net, julio-agosto 2009

   Es un servidor AJAX
   Recupera las citas de la BD, de la tabla "tasks" (que sigue el microformato hCalendar)
   Responde con un array de citas en formato JSON

   El cliente es "horario.js"
*/

require_once('json/JSON.php');
require_once('db.php');
require_once('config/sql.php');
require_once('response.php');

/* TASK ========================================= */

/*class Task { // Convertible a JSON

  // hCalendar microformat:
  public $id;          // Identificador
  public $summary;     // Título
  public $description; // Descripción
  public $dtstart;     // Fecha y hora de inicio
  public $dtend;       // Fecha y hora de fin
  public $calendar;    // Tipo de calendario (determina el color)
  public $sequence;    // Secuencia (libre)

  public function get($row) {
    $this->id          = $row['id'];
    $this->summary     = $this->convert($row['summary']);
    $this->description = $this->convert($row['description']);
    $this->dtstart     = $row['dtstart'];
    $this->dtend       = $row['dtend'];
    $this->calendar    = $row['calendar'];
    $this->sequence    = $row['sequence'];
  }

  private static function convert($text) {
    // CHARSET: 'ISO-8859-1' (Latin-1), 'UTF-8', ...
    ////return htmlentities($text, ENT_QUOTES, DB_CHARSET);
    return htmlentities($text, ENT_QUOTES, 'UTF-8');
  }

} // class Task*/

/* TASKS ======================================== */

class Tasks {

  private $response;
  private $db = null;

  public function __construct($response) {
    $this->response = $response;
    $this->response->list = array();
  }

  private function db_connect() {
    if ($this->db == null) {
      $this->db = new DB($this->response);
    }
  }

/* get tasks ------------------------------------ */

  public function get($table, $start, $end) {
    $sql = SQL::$schedule[$table];
    if ($sql === null) return $this->response->error('Sin SQL');

    $this->db_connect();
    $list = $this->db->query_to_list($sql, array('start'=>$start, 'end'=>$end));
    if ($list != false) {
      $this->response->list = array_merge($this->response->list, $list);
    }
  }

} // class Task

/* MAIN ========================================= */

class Main {

  public static function init() {
    $response = new Response();
    $json = new Services_JSON();

    if ($response->ok) {
      $tasks = new Tasks($response);
      $query = ($_POST)?$_POST:$_GET;

      switch ($query['cmd']) {
        case 'tasks':
          $start = $query['start'];
          $end = $query['end'];
          $tasks->get('tasks', $start, $end);
          $tasks->get('tasks-allday', $start, $end);
          break;
        /*case 'json':
          var $raw = $GLOBALS['HTTP_RAW_POST_DATA'];
          var $input = $json->decode($raw);
          break;*/
      }
    }

    if ($_GET['debug']) {
      echo($json->encode($response));
    }
    else {
      header('Cache-control: no-cache');
      header('Pragma: no-cache');
      header('Content-type: application/json'); //header('Content-type: text/xml; charset=UTF-8', true);
      header('Status: 200 OK', false, 200);     //header("Status: 400 Bad request", false, 400);
      echo ($json->encode($response));
    }
  }

} // Main

/* ============================================== */

Main::init();

/* ============================================== */

/*--- Cómo crear las consultas:

CREATE VIEW tasks AS
  SELECT
    CONCAT('clase',cc.id_clase) AS id,
    cc.id_curso AS summary,
    CONCAT(c.curso,' - ',cc.id_materia) AS description,
    DATE_ADD(cc.fecha, INTERVAL DATE_FORMAT(cc.hora_inicio,'%H:%i') HOUR_MINUTE) AS dtstart,
    DATE_ADD(DATE_ADD(cc.fecha, INTERVAL DATE_FORMAT(cc.hora_inicio,'%H:%i') HOUR_MINUTE), INTERVAL cc.duracion*60 MINUTE) AS dtend,
    cc.id_trabajador AS calendar,
    CONCAT(COALESCE(cc.num_clase,0),'/',COALESCE(cc.total_clases,0)) AS sequence
  FROM cursos_clases cc JOIN cursos c USING(id_curso)
  UNION
  SELECT
    CONCAT('cita',i.id_cita) AS id,
    i.tema AS summary,
    i.titulo AS description,
    DATE_ADD(i.fecha, INTERVAL DATE_FORMAT(i.hora,'%H:%i') HOUR_MINUTE) AS dtstart,
    DATE_ADD(DATE_ADD(i.fecha, INTERVAL DATE_FORMAT(i.hora,'%H:%i') HOUR_MINUTE), INTERVAL i.duracion*60 MINUTE) AS dtend,
    i.usuario AS calendar,
    'cita' AS sequence
  FROM citas i

CREATE VIEW tasks_allday AS
  SELECT
    CONCAT('festivo',f.id) AS id,
    'festivo' AS summary,
    f.descripcion AS description,
    f.fecha AS dtstart,
    DATE_ADD(f.fecha, INTERVAL '23:59:59' HOUR_SECOND) AS dtend,
    'festivo' AS calendar,
    'festivo' AS sequence
  FROM festivos f;
---*/


?>
