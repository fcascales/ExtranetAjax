<?php
/*
   permission.php - ProInf.net, 2010-X

   Permisos de acceso del usuario a las diferentes páginas de la extranet
*/

require_once('db.php');

/* ============================================== */

if (!isset($_SESSION)) { session_start(); }

/* PERMISSION =================================== */

class Permission {

  private static function getPages() { // Obtiene a qué páginas HTML tiene permiso el usuario
    $pages = '';    
    if (isset($_SESSION['user'])) {
      if (isset($_SESSION['pages'])) {
        $pages = $_SESSION['pages'];
      }
      else {
        $db = new DB();
        $user = $_SESSION['user'];
        $sql = "SELECT if(administracion<>0,'ALL',coalesce(paginas,'')) AS paginas FROM usuarios WHERE id_usuario={user}";
        $result = $db->query_to_assoc($sql, array('user'=>$user));
        if ($result) $pages = $result['paginas'];
        $_SESSION['pages'] = $pages;
      }
    }
    return $pages; // Ej: "horario,citas" corresponde a "horario.html" y "citas.html"
  }
  
  private static function getPage($page=null) { // Obtiene si el usuario puede acceder a la página indicada.
    if ($page == null) {
      $page = $_SERVER["REQUEST_URI"]; // Página actual
    }
    $page = self::getFilename($page);   
    $pages = self::getPages();
    if ($pages == 'ALL') return true;
    $subject = '['.str_replace(',', '][', $pages).']';
    if (stripos($subject, "[$page]") === false) return false;
    else return true;
  }
  
  private static function getStartPage() { // Se toma com página de inicio la primera de las indicadas
    $pages = self::getPages();
    if ($pages == 'ALL') return 'index';
    $list = explode(',', $pages);
    return $list[0];
  }
  
  public static function validate($response, $page) {
    $response->permission = self::getPage($page); // ¿Tiene acceso a la página actual?  
    if ($response->permission == false) {
      $response->redirect = self::getStartPage();
      //$response->pages = self::getPages(); // Páginas a las que puede acceder
    }
    return $response->permission;
  }
   
  // utils --------------------------------------
  
  private static function getFilename($path) { // Sólo el nombre del archivo, sin los directorios ni la extensión
    $info = pathinfo($path);
    $ext = '.'.$info['extension'];
    $name = basename($path, $ext);
    return $name;
  }
  
  // test ---------------------------------------
  
  public static function test() {
    echo 'user: '.$_SESSION['user'].'<br>';
    echo 'pages: '.$_SESSION['pages'].'<br>';
    echo 'getPages: '.self::getPages().'<br>';
    echo 'getPage(profesor): '.self::getPage('profesor').'<br>';
    echo 'getPage(horario): '.self::getPage('horario').'<br>';
    echo 'getPage(clientes): '.self::getPage('clientes').'<br>';
    echo 'getPage(): '.self::getPage().'<br>';
    echo 'getStartPage(): '.self::getStartPage().'<br>';
  }
  
} // class Permission

/* ============================================== */
// TEST

//echo Permission::test(); // COMENTAR !!!

?>