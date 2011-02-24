<?php
/*
  private.php — ProInf.net, 2009

  Es un servidor privado AJAX que responde con JSON.
  El cliente es "record.js"

  Actualizaciones:
    2009-X-16 — Creación (separándolo de record.php)
*/

/* INCLUDE ====================================== */

require_once('record.php');

/* PRIVATE ====================================== */

class PrivateServer {

  public static function init() {
    $response = new Response();
    $json = new Services_JSON();

    Log::addQuery();

    // Copiar parámetros al response excepto algunos
    $query = ($_POST)?$_POST:$_GET; // $_QUERY
    reset($query);
    foreach($query as $key=>$value) {
      if (strpos('ok message fields filters list actions data',$key) == false) {
        $response->$key = $value;
      }
    }

    if ($response->ok) {

      $record = new Record($response);

      switch ($query['cmd']) {
        case 'lookup':
          $record->cmd_lookup($query['query'], $query['id']);
          break;
        case 'combobox':
          $filters = Util::url_assoc_decode($query['filters']);
          $record->cmd_combobox($query['query'], $filters);
          break;
        case 'hash':
          $filters = Util::url_assoc_decode($query['filters']);
          $record->cmd_hash($query['query'], $filters);
        case 'list':
          $filters = Util::url_assoc_decode($query['filters']);
          $record->cmd_list($query['query'], $query['historic'], $filters, $query['id']);
          break;
        case 'get':
          $record->cmd_get($query['query'], $query['id']);
          break;
        case 'insert':
          $fields = Util::url_assoc_decode($query['fields']);
          $record->cmd_insert($query['query'], $fields);
          break;
        case 'update':
          $fields = Util::url_assoc_decode($query['fields']);
          $record->cmd_update($query['query'], $query['id'], $fields);
          break;
        case 'delete':
          $record->cmd_delete($query['query'], $query['id']);
          break;
        case 'table':
          $filters = Util::url_assoc_decode($query['filters']);
          $record->cmd_table($query['query'], $filters, $query['num_page'], $query['page_size']);
          break;
        case 'grid':
          $filters = Util::url_assoc_decode($query['filters']);
          $record->cmd_grid($query['query'], $filters);
          break;
        case 'save':
          $actions = explode(',',$query['actions']);
          $data = Util::sanitize_quotes($query['data']);  //Log::add('query-data',$query['data']);Log::add('data',$data);
          $data = $json->decode($data);                   //Log::add('data-0-contacto',$data[0]->contacto);
          $data = Util::sanitize_json($data);             //Log::add('data-0-contacto.2',$data[0]->contacto);
          $record->cmd_save($query['query'], $actions, $data);
          break;
        case 'proc':
          $record->cmd_proc($query['query']);
          break;
        case 'backup':
          $record->cmd_backup();
          break;
        /*case default:
          require_once("${query['cmd']}.php");*/
      }
    }

    if (array_key_exists('debug',$_GET)) { //$_GET['debug']) {
      echo "user=${_SESSION['user']}  ok=$response->ok  message=$response->message<br />";
      //echo "historic=${query['historic']}<br />";
      PrivateServer::debug('JSON', $json->encode($response));
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

} // PrivateServer

/* ============================================== */

PrivateServer::init();

/* ============================================== */

/*
  Pruebas:
  ?debug=1&cmd=list&query=cursos
  ?debug=1&cmd=list&query=cursos&historic=historic
  ?debug=1&cmd=list&query=cursos&id_trabajador=JA
  ?debug=1&cmd=get&query=ultimo_precio_cliente&id=1222665861
  ?debug=1&cmd=lookup&query=next_id_curso&id=FTN
  ?debug=1&cmd=table&query=precios_cliente&id_cliente=1222665861
  ?debug=1&cmd=list&query=cursos&id=FTN-10-09
  ?debug=1&cmd=combobox&query=cursos&filters=id_cliente%3D1132840066
  ?debug=1&cmd=grid&query=festivos&filters=year%3D2009
  ?debug=1&cmd=table&query=estadistica-trabajadores&filters=worker%3D%2525%26year%3D2009%26month%3D9
  ?debug=1&cmd=save&query=bancos&actions=update%2Cinsert&data=%5B%7B%22id%22%3A%20%221079599571%22%2C%20%22banco%22%3A%20%22Caixa%20Terrassas%22%7D%2C%20%7B%22banco%22%3A%20%22zz%22%7D%5D
  ?debug=1&cmd=update&fields=contacto=<&id=1869979123&query=clientes
*/
?>
