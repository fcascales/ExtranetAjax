<?php
/*
  logins.php - ProInf.net, 2009

  Contabiliza las conexiones efectuadas almacenando datos en la tabla "ext_logins"

  CREATE TABLE ext_logins (
    id int(11) NOT NULL auto_increment,
    date date NOT NULL COMMENT 'Fecha de la conexión',
    ip char(12) NOT NULL default '' COMMENT 'IP desde dónde se conecta',
    user char(10) NOT NULL default '' COMMENT 'Usuario',
    num_logins int(11) NOT NULL default '0' COMMENT 'Nº de conexiones del usuario en esa fecha y esa IP',
    num_errors int(11) NOT NULL default '0' COMMENT 'Nº de conexiones erróneas',
    changes text COMMENT 'Cambios realizados, por ejemplo: UPDATE trabajadores(FCO), INSERT cursos(FTN-10-09), etc.',
    revised tinyint(1) NOT NULL default '0' COMMENT 'Revisado cuando el num_errors es alto',
    PRIMARY KEY (date,ip,user),
    KEY new_index (id)
  ) ENGINE=MyISAM CHARSET=utf8 COMMENT='Contabiliza las conexiones en la extranet'
*/

require_once('session.php');

/* LOGINS ======================================= */

class Logins {

  public static function addLogin($db, $user, $ok) { // Registra el intento de login

    ////echo "<b>addLogin</b>:user=$user,ok=".($ok?'Y':'N');

    $login_id = Logins::getLoginId($db, $user);
    if ($login_id != null) {
      $set = $ok? "num_logins = num_logins + 1": "num_errors = num_errors + 1";
      $sql = "UPDATE ext_logins SET $set WHERE id={id}";
      $result = $db->execute_query($sql, array('id'=>$login_id));
    }
    else {
      $date = Session::getDate();
      $ip = Session::getIP();
      $num_logins = $ok? 1:0;
      $num_errors = $ok? 0:1;
      $sql = "INSERT INTO ext_logins (date,ip,user,num_logins,num_errors) VALUES ({date},{ip},{user},{num_logins},{num_errors})";
      $sql = DB::evaluate_params($sql, array('date'=>$date, 'ip'=>$ip, 'user'=>$user, 'num_logins'=>$num_logins, 'num_errors'=>$num_errors));
      $result = $db->execute_query($sql);
      if ($result) $_SESSION['login_id'] = $db->query_lookup("SELECT last_insert_id()");
    }

    ////echo ",result=".($result?'Y':'N').",id=$id,sql=$sql<br>";

    return $result;
  } // addLogin


  public static function addChange($db, $cmd, $table, $id) { // Registra un cambio en la BD
    $user = Session::getUser();
    $login_id = Logins::getLoginId($db, $user);
    if ($login_id != null) {
      $change = "$cmd $table($id)";
      $sql = "UPDATE ext_logins SET changes = if(changes is null,{change},concat(changes,', ',{change})) WHERE id={id}";
      $result = $db->execute_query($sql, array('change'=>$change, 'id'=>$login_id));
    }
    ////echo "<b>addChange</b>:result=".($result?'Y':'N').",user=$user,login_id=$login_id,sql=$sql<br>";
  } // addChange


  // Utilities ----------------------------------

  static function getLoginId($db, $user) {
    if (isset($_SESSION['login_id'])) {
      $login_id = $_SESSION['login_id'];
    }
    else {
      $date = Session::getDate();
      $ip = Session::getIP();
      $sql = "SELECT id FROM ext_logins WHERE date={date} and ip={ip} and user={user}";
      $login_id = $db->query_lookup($sql, array('date'=>$date, 'ip'=>$ip, 'user'=>$user));
    }
    return $login_id; // es null si no se encontró
  }

} // class Logins

/* ============================================== */

/*---PRUEBA---
  require_once('connection.php');
  require_once('db.php');
  if (!isset($_SESSION)) { session_start(); }

  echo '<h1>Probando logins</h1>';

  $db = new DB();
  echo '<b>db</b>:connected='.($db->is_connected()?'Y':'No').',message='.($db->get_message()).'<br>';

  unset($_SESSION['login_id']);

  Logins::addLogin($db, 'ZZ', false);
  Logins::addLogin($db, 'ZZ', false);
  Logins::addLogin($db, 'ZZ', true);

  Logins::addChange($db, 'INSERT', 'personas', '123');
  Logins::addChange($db, 'UPDATE', 'provincias', 'MA');
  Logins::addChange($db, 'DELETE', 'albaranes', '1001');
---*/
?>