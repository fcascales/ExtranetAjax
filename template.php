<?php
/*
    template.php — Fco.Cascales — 2011-II-04
    Plantilla de las páginas HTML
*/

class Template {

  private $title;
  private $basename;
  private $msg;
  private $scripts;
  private $stylesheets;

  private function addScript($script) {
    $this->scripts[] = '<script type="text/javascript" src="'.$script.'"></script>';
  }
  private function addStylesheet($sheet) {
    $this->stylesheets[] = '<link rel="stylesheet" type="text/css" href="'.$sheet.'" />';
  }
  private static function show($line) {
    echo $line."\n";
  }

  public function __construct ($title)  {
    $this->title = $title;
    $parts = pathinfo($_SERVER["SCRIPT_NAME"]);
    $this->basename = $parts['filename'];
    $this->msg = '';
    $this->scripts = array();
    $this->stylesheets = array();
  }

  public function scripts() {
    foreach (func_get_args() as $name => $value) {
      $this->addScript("lib/$value.js");
    }
  }

  public function stylesheets() {
   foreach (func_get_args() as $name => $value) {
      $this->addStylesheet("styles/$value.css");
    }
  }

  public function msg($msg) {
    $this->msg = $msg;
  }

  public function begin() {
    $this->addScript('scripts/'.$this->basename.'.js');
    $this->addStylesheet('styles/'.$this->basename.'.css');
    $style = $this->msg == ''? 'style="display:none;"': '';
    self::show('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">');
    self::show('<html xmlns="http://www.w3.org/1999/xhtml">');
    self::show('<head>');
    self::show('<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />');
    self::show('<title>Extranet SBMFiC &mdash; '.$this->title.'</title>');
    self::show('<meta name="verify-v1" content="" />');
    self::show('<meta name="Googlebot" content="nofollow" />'); // No indexar en Google
    self::show('<meta name="robots" content="noindex, nofollow" />'); // No indexar en buscadores
    self::show('<link rel="shortcut icon" href="styles/favicon/extranet.ico" />');
    self::show('<link rel="stylesheet" type="text/css" href="styles/styles.css" />'); // Hoja de estilos general
    self::show(implode("\n", $this->stylesheets));
    self::show('<script type="text/javascript" src="lib/prototype.js"></script>');
    self::show('<script type="text/javascript" src="lib/extranet.js"></script>');
    self::show('<script type="text/javascript" src="lib/record.js"></script>');
    self::show(implode("\n", $this->scripts));
    self::show('<style type="text/css">body{display:none;}</style>'); // http://blog.unijimpe.net/prevenir-el-clickjacking-con-javascript/
    //self::show('<style type="text/css">body{opacity:.1;}</style>');
    self::show('</head>');
    self::show('<body>');
    self::show('<div id="main">');
    self::show('<div id="header">');
    self::show('<div id="logo"><a href="/extranet/" title="Ir al índice"><img src="/extranet/styles/imgs/sbmfic_extranet.png"></a></div>');
    self::show('<div id="title">');
    self::show('<h1><a href="/extranet/" title="Ir al índice">Extranet SBMFiC &mdash; '.$this->title.'</a></h1>');
    self::show('<h2 id="subtitle" style="display:none;"></h2>'); // Subtítulo oculto por omisión
    self::show('</div><!--#title-->');
    self::show('<div id="flash" style="display:none;"><span></span></div>'); // Mensaje que duran unos instantes
    self::show('<div id="connect"><a href="login.php">Conectar</a></div>');
    self::show('</div><!--#header-->');
    self::show('<div id="msg" class="info" '.$style.' ><span>'.$this->msg.'</span></div>'); // Mensaje que dura hasta hacerle clic
    self::show('<div id="body" '.$style.' >');
  }

  public function end() {
    self::show('</div><!--#body-->');
    self::show('<div id="footer">');
    self::show('<div id="waiting" style="display:none;">cargando datos</div>'); // Mientras hay una petición AJAX activa
    self::show('<div id="copyright">ProInf.net &copy; 2011</div>');
    self::show('</div>');
    self::show('</div><!--#main-->');
    self::show('<script type="text/javascript">if(self==top){document.getElementsByTagName("body")[0].style.display=\'block\';}</script>'); // http://blog.unijimpe.net/prevenir-el-clickjacking-con-javascript/
    //self::show('<script type="text/javascript">if(self==top){document.getElementsByTagName("body")[0].style.opacity=1;}</script>');
    self::show('</body>');
    self::show('</html>');
  }


} // Template


?>