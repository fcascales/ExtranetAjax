<?php
/*
  dir.php — ProInf.net — feb-2011
  version 0.8

  Gestión de un directorio

  SEGURIDAD:
  Incluir un archivo ".htaccess" en el directorio base
    # Evitar la ejecución de código PHP
    php_flag engine off
    # Evita abrir ningún archivo
    <Directory />
    Order Deny,Allow
    Deny from All
    </Directory>

  Actualizaciones:
    2011-02-22 — Árbol de directorios
*/

/* DIR ========================================== */

class Dir {

  // configuration -----------------------------

  private $dir;     // Ruta del directorio base

  private $response;// Array asociativo con las claves: 'ok' y 'message'

  private $files;   // Array asociativo de los archivos (con su tamaño y fecha)
  private $dirs;    // Array asociativo de los subdirectorios (con su tamaño y fecha)
  private $tree;    // Array asociativo anidado con el árbol de subdirectorios

  // constructor & destructor -------------------

  public function __construct ($dir, $response=null)  {
    $this->dir = $dir;
    if ($response == null) $this->response = new stdClass();
    else $this->response = $response;

    $this->read_directory();
    $this->tree = null;
  }

  function __destruct() {
  }

  // interface ----------------------------------

  public function reload() {
    return $this->read_directory(); // false/true
  }

  public function newdir($name) {
    if (self::invalid($name, 'slash', 'dot')) return $this->error("Nombre de directorio '$name' no permitido");
    $dir = $this->dir.'/'.trim($name);
    if (mkdir($dir)) return true;
    else return $this->error("No puedo crear el directorio '$name'");
  }

  public function rename($name, $newname) {
    if (self::invalid($name, 'slash', 'hide')) return $this->error("Nombre de fichero '$newname' no permitido");
    if (array_key_exists($name, $this->dirs) || array_key_exists($name, $this->files)) {
      $item    = $this->dir.'/'.trim($name);
      $newitem = $this->dir.'/'.trim($newname);
      if (rename($item, $newitem)) return true;
      else return $this->error("No puedo cambiar el nombre de '$name' a '$newname'");
    }
    else return $this->error("No encuentro '$name' para renombrarlo");
  }

  /* IDEA: renombrar varios archivos, cambiando el nombre o la extensión
    comprobando previamente que no existirán archivos duplicados */

  public function delete($name) {
    if (array_key_exists($name, $this->dirs)) {
      $dir = $this->dir.'/'.$name;
      if (rmdir($dir)) return true;
      else return $this->error("No puedo borrar el directorio '$name'");
    }
    elseif (array_key_exists($name, $this->files)) {
      $file = $this->dir.'/'.$name;
      if (unlink($file)) return true;
      else return $this->error("No puedo borrar el fichero '$file'");
    }
    else return $this->error("No encuentro '$name' para borrarlo");
  }

  public function copy($name, $dest) {
    if (array_key_exists($name, $this->dirs)) {
      if (self::invalid($dest, 'hide')) return $this->error("Nombre de directorio '$newname' no permitido");
      $source = $this->dir.'/'.$name;
      $target = $this->dir.'/'.$dest;
      $errors = self::copy_dir($source, $target);
      if ($errors == 0) return true;
      else return $this->error("No puedo copiar el directorio '$name' debido a $errors errores");
    }
    elseif (array_key_exists($name, $this->files)) {
      if (self::invalid($dest, 'hide')) return $this->error("Nombre de fichero '$newname' no permitido");
      $source = $this->dir.'/'.$name;
      $target = $this->dir.'/'.$dest;
      if (copy($source, $target)) return true; // Sobreescribe el archivo existente
      else return $this->error("No puedo copiar el fichero '$file'");
    }
    else return $this->error("No encuentro '$name' para copiarlo");
  }

  public function move($name, $dest) {
  }

  // getters ------------------------------------

  public function get_response() { return $this->response;  }

  public function get_hash() { return array('files'=> $this->files, 'dirs'=> $this->dirs); }

  public function get_hashfiles() { return $this->files;  } // [name=>[size,date], ... ]
  public function get_hashdirs()  { return $this->dirs;   } // [name=>[size,date], ... ]

  public function get_filenames() { return array_keys($this->get_hashfiles()); } // [ name, ... ]
  public function get_dirnames()  { return array_keys($this->get_hashdirs()); }  // [ name, ... ]

  public function get_textile() { // |name|file/size|date|\n...
    $rows = array();
    foreach ($this->dirs as $name=>$params) {
      $rows[] = "|$name/|${params['size']}|${params['date']}|";
    }
    foreach ($this->files as $name=>$params) {
      $rows[] = "|$name|${params['size']}|${params['date']}|";
    }
    return implode("\n", $rows);
  }

  public function get_table() { // HTML: <table><tr>...
    $rows = array();
    $option = ''; //'<td><input type="checkbox" /></td>';
    foreach ($this->dirs as $name=>$params) {
      $rows[] = "<tr class=\"dir\">$option<th>$name</th><td>${params['size']}</td><td>${params['date']}</td></tr>";
    }
    foreach ($this->files as $name=>$params) {
      $path = $this->dir.'/'.$name;
      $link = '<a target="_blank" href="'.$path.'">'.$name.'</a>';
      $rows[] = "<tr class=\"file\">$option<th>$link</th><td>${params['size']}</td><td>${params['date']}</td></tr>";
    }
    return "<table class=\"dir\">\n".implode("\n", $rows)."\n</table>\n";
  }

  // tree ---------------------------------------

  public function get_tree() { // [dir=>[subdir1, subdir2=>[subdir2-1, ...], ...], ...]
    if ($this->tree == null) {
      $this->tree = $this->read_tree($this->dir);
      ////if ($root) $this->tree = array($this->dir=> $this->tree);
    }
    return $this->tree;
  }

  public function get_tree_textile() {
    $this->rows = array();
    $this->tree_textile($this->get_tree(), "*");
    return implode("\n", $this->rows);
  }
  private function tree_textile($tree, $asterisks) {
    foreach($tree as $dir=>$subdirs) {
      $this->rows[] = "$asterisks $dir";
      if ($subdirs != null) $this->tree_textile($subdirs, "$asterisks*");
    }
  }

  public function get_tree_list() { // HTML: <ul><li>...
    $this->rows = array();
    $this->tree_list($this->get_tree());
    return implode("", $this->rows);
  }
  private function tree_list($tree) {
    $this->rows[] = "<ul>\n";
    foreach($tree as $dir=>$subdirs) {
      $this->rows[] = "<li>$dir";
      if ($subdirs != null) {
        $this->tree_list($subdirs);
      }
      $this->rows[] = "</li>";
    }
    $this->rows[] = "</ul>\n";
  }

  // private ------------------------------------

  /*
   * Obtiene un listado de directorios/ficheros
   * Crea unos arrays asociativos con información del tamaño y fecha
   */
  private function read_directory() {
    $this->files = array();
    $this->dirs = array();
    if (@$dir = dir($this->dir)) {
      while (($name = $dir->read()) !== false) {
        $path = $this->dir.'/'.$name;
        if ($name == '.' || $name == '..') {
          // Directorios actual y anterior
        }
        elseif ($name[0] == '.') {
          // Archivos ocultos
        }
        elseif (is_dir($path)) {
          $this->dirs[$name] = array(
            'size'=> self::num_files($path),
            'date'=> self::file_date($path)
          );
        }
        elseif (is_file($path)) {
          //$info = pathinfo($entry); // dirname, basename, extension, filename
          $this->files[$name] = array(
            'size'=> self::format_bytes(filesize($path)),
            'date'=> self::file_date($path)
          );
        }
        elseif (is_link($path)) { // readlink
        }
      }
      $dir->close();
      ksort($this->files);
      ksort($this->dirs);
      return true;
    }
    else return $this->error("No puedo leer el directorio '".$this->dir."'");
  }

  /*
   * Lee el árbol de directorios recursivamente
   * Retorna arrays asociativos anidados
   */
  private function read_tree($base) {
    if (@$dir = dir($base)) {
      $list = array();
      while (($name = $dir->read()) != false) {
        $path = "$base/$name";
        if ($name[0] != '.' && is_dir($path)) {
          $list[$name] = $this->read_tree($path);
        }
      }
      $dir->close();
      if (count($list) == 0) return null;
      else {
        ksort($list);
        return $list;
      }
    }
    else return null;
  }

  // errores ------------------------------------

  private function is_error($test, $msg='') {
    if (!$test) {
      $this->error($msg);
      return true;
    }
    return false;
  }

  private function error($msg) {
    $this->response->ok = false;
    $this->response->message = "Error: $msg";
    return false;
  }

  // static -------------------------------------

  public static function to_html($text) {
    // CHARSET: 'ISO-8859-1' (Latin-1), 'UTF-8', ...
    return htmlentities($text, ENT_QUOTES, 'UTF-8');
  }

  public static function format_bytes($size) {
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    for ($i = 0; $size >= 1024 && $i < 4; $i++) $size /= 1024;
    return round($size, 2).' '.$units[$i];
  }

  public static function file_date($path) {
    return date ("Y-m-d H:i:s", filemtime($path));
  }

  /*
   * Número de ficheros/directorios del directorio indicado
   */
  public static function num_files($base) {
    $count = 0;
    if (@$dir = dir($base)) {
      while (($name = $dir->read()) !== false) {
        $path = "$base/$name";
        if ($name == '.' || $name == '..') {}
        elseif (is_dir($path) || is_file($path)) $count++;
      }
      $dir->close();
    }
    return $count;
  }

  /*
   * Copia un directorio en otro directorio
   * Retorna el número de errores habido
   */
  private static function copy_dir($source, $target) {
    $errors = 0;
    if (@$dir = dir($source)) {
      if (@mkdir($target)) {
        while (($name = $dir->read()) !== false) {
          if ($name != '.' && $name != '..') {
            if (is_dir("$source/$name")) {
              $errors += self::copy_dir("$source/$name", "$target/$name");
            }
            else {
              if (copy("$source/$name", "$target/$name")) {}
              else $errors++;
            }
          }
        }
      }
      else $errors++;
      $dir->close();
    }
    else $errors++;
    return $errors;
  }

  /*
    Primer argumento: nombre de fichero/directorio
    Otros argumentos:
      'slash'  inválido si contiene /
      'dot'    inválido si contiene .
      'hide'   inválido si el nombre empieza por .
      'parent' inválido si contiene ..
  */
  private static function invalid() {
    for ($i=0; $i<func_num_args(); $i++) {
      $argument = func_get_arg($i);
      if ($i == 0) {
        $path = $argument;
        if (trim($path) == '') return true;
        $info = pathinfo($path);
      }
      elseif ($argument == 'slash')  { if (strpos($path, '/') !== false) return true; }
      elseif ($argument == 'dot')    { if (strpos($path, '.') !== false) return true; }
      elseif ($argument == 'hide')   { if ($info['basename'][0] == '.') return true; }
      elseif ($argument == 'parent') { if (strpos($path, '..') !== false) return true; }
    }
    return false;
  }

} // class Dir

/* ============================================== */
  /*function static dir_size($dir) {
    $size = 0;
    foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory)) as $file){
        $size += $file->getSize();
    }
    return $size;
  }*/
  /*public function lines($entry) {
    return file($entry);
    return file_get_contents($entry);
  }*/
  /*public function download($entry) {
    $file = "$dir/$entry";
    if (file_exists($entry)) {
      header('Content-Description: File Transfer');
      header('Content-Type: application/octet-stream');
      header('Content-Disposition: attachment; filename='.basename($file));
      header('Content-Transfer-Encoding: binary');
      header('Expires: 0');
      header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
      header('Pragma: public');
      header('Content-Length: '.filesize($file));
      ob_clean();
      flush();
      readfile($file);
      exit;
    }
  }*/
/* ============================================== */

/*---TEST---

//var_dump(get_defined_vars());

$dir = new Dir('../uploads');

echo "<h1>Dir</h1>\n";

echo "<h2>List</h2>\n<ul>\n<li>".implode("</li>\n<li>",$dir->get_filenames())."</li>\n</ul>\n";

echo "<h2>Textile</h2>\n<pre>",$dir->get_textile()."</pre>\n";

$table = $dir->get_table();
echo "<h2>Table</h2>\n".$table."\n<pre>".Dir::to_html($table)."</pre>\n";

echo "<h2>Hash</h2>\n<pre>\n";
var_dump($dir->get_hash());
echo "</pre>\n";

echo "<h2>Tree</h2>\n<pre>\n";
var_dump($dir->get_tree());
echo "</pre>\n";

echo "<h2>Tree textile</h2>\n<pre>",$dir->get_tree_textile()."</pre>\n";

$list = $dir->get_tree_list();
echo "<h2>Tree list</h2>\n".$list."\n<pre>".Dir::to_html($list)."</pre>\n";

---TEST---*/

/* ============================================== */

?>
