<?php
/*
  captcha.php -  Francisco Cascales <fco@proinf.net>

  Enlaces de referencia:
    //http://www.leonelquinteros.com.ar/modules/blog/post.php?id_post=36

  Actualizaciones:
    2011-02-07 - CifrasEnLetras
    2011-02-07 - Uso de la función utf8_decode para que salgan los acentos
*/

// INCLUDE ======================================

require_once('cifras_en_letras.php');

//===============================================

if (!isset($_SESSION)) { session_start(); }

//===============================================

class Captcha {

  const ancho = 400;
  const alto = 20;

  public static function code() {
    // Genero el código y lo guardo en la sesión para consultarlo luego.
    //$code = substr(sha1(microtime() * mktime()), 0, 6);
    $secret = rand(0,9999);
    $_SESSION['captcha'] = sha1($secret);
    $code = CifrasEnLetras::convertirCifrasEnLetras($secret,'femenino');
    return $code;
  }

  public static function get() {

    $code = self::code();

    // La imagen
    $img = imagecreatetruecolor(self::ancho, self::alto)
      or die('Cannot initialize new GD image stream');

    // Colores
    $bgColor     = imagecolorallocate($img, 230, 230, 230);
    $stringColor = imagecolorallocate($img, 90, 90, 90);
    $lineColor   = imagecolorallocate($img, 245, 245, 245);

    // Fondo
    imagefill($img, 0, 0, $bgColor);

    // Líneas
    for ($i<0; $i<self::alto; $i+=5) {
      imageline($img, 0, $i, self::ancho, $i, $lineColor);
    }
    for ($i<0; $i<self::ancho; $i+=12) {
      imageline($img, $i, 0, $i, self::alto, $lineColor);
    }

    // Escribo el código
    imageString($img, /*font*/5, /*x*/8, /*y*/2, utf8_decode($code), $stringColor); // ok (not utf8)

    //$fontPath = '/extranet/styles/fonts/Liberation.ttf';
    //imagettftext ($img, /*size*/10, /*angle*/0, /*x*/8, /*y*/2, $stringColor, $fontPath, $code); // not running (ok utf8)


    // Salida imagen
    header("Content-type: image/png");
    imagepng($img);
  }

  public static function test($value) {
    return sha1($value) == $_SESSION['captcha'];
  }

} // class Captcha

//===============================================

if (isset($_GET['img'])) Captcha::get();


//===============================================

/**
// TEST

//print_r(get_loaded_extensions());
//print_r(var_dump(gd_info()));

//echo gd_version();
//echo gd_info();


Captcha::get();

**/

//===============================================

?>