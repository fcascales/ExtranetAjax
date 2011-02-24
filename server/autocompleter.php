<?php
/*
   autocompleter.php - ProInf.net, 2009

   Es un servidor AJAX que proporcina listas HTML <ul><li>
   para Ajax.Autocompleter (script.aculo.us)
*/

/* INCLUDE ====================================== */

require_once('json/JSON.php');
require_once('db.php');
require_once('config/sql.php');
require_once('response.php');

/* AUTOCOMPLETER ================================ */

class Autocompleter {

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

/* ---------------------------------------------- */

  public function cmd_search($table, $search, $type='html') {  // Busca
    $sql = SQL::$search[$table];
    if ($sql == null) return $this->response->error('Sin SQL');

    $words = preg_split('/[\s,]+/',$search);   //$words = split(' ',$search);
    // TODO: Controlar que no haya demasiadas palabras ya que las permutaciones pueden ser muy grandes
    $regexp = Autocompleter::get_sql_regexp($words);

    $this->db_connect();
    //$list = $this->db->query_to_list($sql, array('search'=>"%$search%")); // LIKE
    $list= $this->db->query_to_list($sql, array('search'=>$regexp));  // REGEXP
    if ($list == null) return $this->response->error('No list');

    if ($type == 'json') {
      $this->response->list = $list;
      return $list;
    }
    else if ($type == 'html') {
      $ul = array();
      foreach($list as $element) {
        $id = $element['id'];
        $class = isset($element['class'])? $element['class']: $table; //$table;
        $label = $element['label'];
        $label = Autocompleter::html_mark($label, $words);

        $li = "<li id=\"ac_$id\" class=\"$class\">$label</li>";
        $ul[] = $li;
      }
      $html = "<ul>\n" . implode("\n",$ul) . "</ul>\n";
      return $html;
    }
  }

  /*---
  public function cmd_table($table, $id) { // Muestra una tabla de búsqueda
    $sql = SQL::$autocompleter[$table];
    if ($sql == null) return $this->response->error('Sin SQL');

    $this->db_connect();
    $list = $this->db->query_to_list($sql, array('id'=>$id));
    if ($list == null) return $this->response->error('No list');

    $ul = array();
    $header = null;
    foreach($list as $element) {

      if ($header === null) {
        $header = array();
        foreach($element as $key=>$value) {
          $label = str_replace('_',' ',$key);
          $header[] = "<span>$label</span>";
        }
        $ul[] = '<li class="autocomplete_header">' . implode("",$header)  . '</li>';
      }

      $li = array();
      foreach($element as $key=>$value) {
        $text = htmlentities($value, ENT_QUOTES, 'UTF-8');
        $li[] =  "<span class=\"ac_$key\">$text</span>";
      }
      $ul[] = "<li>" . implode("",$li)  . "</li>";
    }
    $html = "<ul>\n" . implode("\n",$ul) . "</ul>\n";
    return $html;
  }---*/

  private static function html_mark($text, $words) {
  // Convierte el texto a HTML remarcando las palabras indicadas
     //////$text = str_replace($search, "<strong>$search</strong>", $text);
    foreach($words as $word) {
      $text = preg_replace("/($word)/i",'┤${1}├',$text);
    }
    $text = htmlentities($text, ENT_QUOTES, 'UTF-8');
    $text = str_replace('┤', '<strong>', $text);
    $text = str_replace('├', '</strong>', $text);
    return $text;
  }

  private static function get_sql_regexp($words) {
  // Retorna una expresión regular  MySQL que busca todas las palabras en cualquier orden en que estén
  // ['en', un'] --> 'en.*un|un.*en'
    $p = new Permutation();
    $permutations = $p->permute_array($words);
    $list = array();
    foreach ($permutations as $permutation) {
      $list[] = join('.*', $permutation);
    }
    $regexp =  join('|', $list);
    ////echo "regexp=$regexp<br />" ;
    return $regexp;
  }

} // class Autocompleter

/* PERMUTATION ================================== */
/*---

$perm = new Permutation();
$result = $perm->permute_array(split(' ','en un lugar'));
foreach ($result as $element) {
  print join(' ',$element) . '<br />';
}

en un lugar
un en lugar
en lugar un
lugar en un
un lugar en
lugar un en

---*/

class Permutation {

  private $permuted_array;

  public function permute_array ($items) {
    $this->permuted_array = array();
    $this->permute_array_recursive($items);
    return $this->permuted_array;
  }

  // Finding all permutations of an array — PHP Cookbook — O'Reilly
  private function permute_array_recursive($items, $perms = array( )) {
    if (empty($items)) {
        $this->permuted_array[] = $perms;
    }
    else {
      for ($i = count($items) - 1; $i >= 0; --$i) {
         $newitems = $items;
         $newperms = $perms;
         list($foo) = array_splice($newitems, $i, 1);
         array_unshift($newperms, $foo);
         $this->permute_array_recursive($newitems, $newperms);
       }
       return $permuted_array;
    }
  }

} // Permutation

/* MAIN ========================================= */

class Main {

  public static function init() {
    $response = new Response();

    if ($response->ok) {
      $query = ($_POST)?$_POST:$_GET;
      $autocompleter = new Autocompleter($response);

      if ($query['cmd'] == 'search') { // Para DB.Dropdown --> JSON
        $response->time = $query['time'];
        if (!$query['debug']) {
          header('Cache-control: no-cache');
          header('Pragma: no-cache');
          header('Content-type: application/json');
          header('Status: 200 OK', false, 200);
        }
        $result = $autocompleter->cmd_search($query['query'], $query['search'], 'json');
        $json = new Services_JSON();
        echo ($json->encode($response));
      }
      else { // Para Ajax.Autocompleter --> HTML
        header('Cache-control: no-cache');
        header('Pragma: no-cache');
        header('Content-type: text/html; charset=UTF-8', true);
        header('Status: 200 OK', false, 200);
        $result = $autocompleter->cmd_search($query['cmd'], $query['search'], 'html');
        $html = $response->ok? $result: '<ul></ul>';
        echo ($html);
      }
    }

    if ($query['debug'])  {
      echo "<br />User = ${_SESSION['user']}<br />";
      foreach ($response as $key=>$value) {
        echo "$key = $value<br />";
      }
    }
  } // init

} // Main

/* ============================================== */

Main::init();

/* ============================================== */

/*
   Test:
      ?cmd=all&search=cad
      ?cmd=all&search=e-
      ?cmd=all&search=c0
      ?cmd=all&search=qui
      ?cmd=all&search=eva
      ?debug=1&cmd=curso&search=Ex
      ?debug=1&cmd=all&search=n+mi
      ?cmd=all&search=joomla+ctug
      // ?debug=1&cmd=ultimos_precios_cliente&id=1222665861
      ?debug=1&cmd=search&query=all&search=cad
*/

?>