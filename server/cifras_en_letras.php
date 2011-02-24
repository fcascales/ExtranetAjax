<?php
/**
  CifrasEnLetras sirve para expresar una serie de cifras en letras.
  A modo de ejemplo convierte "22"> en "veintidós".
  Puede convertir un número entre una y ciento veintiséis cifras como máximo.

  Ejemplos de uso:
    CifrasEnLetras::convertirEurosEnLetras(22.34) --> "veintidós euros con treinta y cuatro céntimos"
    CifrasEnLetras::convertirNumeroEnLetras("35,67") --> "treinta y cinco con sesenta y siete"

  Enlaces de referencia:
    http://es.wikipedia.org/wiki/Anexo:Lista_de_n%C3%BAmeros
    http://es.encarta.msn.com/encyclopedia_761577100/Signos_matem%C3%A1ticos.html
    http://es.wikipedia.org/wiki/Nombres_de_los_n%C3%BAmeros_en_espa%C3%B1ol

  Licencia:
    http://creativecommons.org/licenses/GPL/2.0/deed.es
    Este software está sujeto a la CC-GNU GPL</a>

@author Francisco Cascales <fco@proinf.net>
@version 0.01,  8-dic-2007 - Inicio del proyecto (en Java)
@version 0.02, 12-dic-2007 - Cifras en femenino
@version 0.03, 17-dic-2007 - Formatear cifras separándolas en grupos
@version 0.04, 22-dic-2007 - Múltiplos de millón con preposición "de" antes del concepto
@version 0.05,  7-ene-2008 - Mejoras estructurales
@version 0.05,  2-nov-2009 - Convertido a PHP

*/

//===============================================

class CifrasEnLetras {

  //---------------------------------------------
  // CONSTANTES
  const PREFIJO_ERROR = 'Error: ';
  const COMA = ',';
  const MENOS = '-';

  //---------------------------------------------
  // ENUMERACIONES
  const NEUTRO = 'neutro';
  const MASCULINO = 'masculino';
  const FEMENINO = 'femenino';

  //---------------------------------------------
  // LISTAS

  public static $listaUnidades = array( // Letras de los números entre el 0 y el 29
    "cero", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
    "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve",
    "veinte", "veintiún", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"
  );
  public static $listaDecenas = array( // Letras de las decenas
    "", "diez", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"
  );
  public static $listaCentenas = array ( // Letras de las centenas
    "", "cien", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"
  );
  public static $listaOrdenesMillonSingular = array ( // Letras en singular de los órdenes de millón
    "", "millón", "billón", "trillón", "cuatrillón", "quintillón",
    "sextillón", "septillón", "octillón", "nonillón", "decillón",
    "undecillón", "duodecillón", "tridecillón", "cuatridecillón", "quidecillón",
    "sexdecillón", "septidecillón", "octodecillón", "nonidecillón", "vigillón"
  );
  public static $listaOrdenesMillonPlural = array ( // Letras en plural de los órdenes de millón
    "", "millones", "billones", "trillones", "cuatrillones", "quintillones",
    "sextillones", "septillones", "octillones", "nonillones", "decillones",
    "undecillones", "duodecillones", "tridecillones", "cuatridecillones", "quidecillones",
    "sexdecillones", "septidecillones", "octodecillones", "nonidecillones", "vigillones"
  );

  // ORDINALES (Wikipedia: "Nombres de los números en español", "Número ordinal")

  public static $listaUnidadesOrdinales = array ( // Letras de los ordinales entre 0º y 19º
    "ningún", "primer", "segundo", "tercer", "cuarto", "quinto", "sexto", "séptimo", "octavo", "noveno",
    "décimo", "undécimo", "duodécimo", "decimotercer", "decimocuarto", "decimoquinto", "decimosexto", "decimoséptimo", "decimoctavo", "decimonoveno"
  );
  public static $listaDecenasOrdinales = array ( // Letras de las decenas ordinales
    "", "décimo", "vigésimo", "trigésimo", "cuadragésimo", "quincuagésimo", "sexagésimo", "septuagésimo", "octogésimo", "nonagésimo"
  );
  public static $listaCentenasOrdinales = array ( // Letras de las centenas ordinales
    "", "centésimo", "ducentésimo", "tricentésimo", "cuadringentésimo", "quingentésimo", "sexcentésimo", "septingentésimo", "octingentésimo", "noningentésimo"
  );
  public static $listaPotenciasDiezOrdinales = array ( // Letras de las potencias de diez ordinales
    "", "décimo", "centésimo", "milésimo", "diezmilésimo", "cienmilésimo", "millonésimo"
  );

  //---------------------------------------------
  // MÉTODOS PRINCIPALES

  /* Convierte a letras los números entre 0 y 29
  */
  protected static function convertirUnidades($unidades, $genero='neutro') {
    if ($unidades == 1) {
      if ($genero == 'masculino') return 'uno';
      elseif ($genero == 'femenino') return 'una';
    }
    else if ($unidades == 21) {
      if ($genero == 'masculino') return 'veintiuno';
      elseif ($genero == 'femenino') return 'veintiuna';
    }
    return self::$listaUnidades[$unidades];
  }

  /* Convierte a letras las centenas
  */
  protected static function convertirCentenas($centenas, $genero='neutro') {
    $resultado = self::$listaCentenas[$centenas];
    if ($genero == 'femenino') $resultado = str_replace('iento','ienta', $resultado);
    return $resultado;
  }

  /* Primer centenar: del cero al noventa y nueve
  */
  public static function convertirDosCifras($cifras, $genero='neutro') {
    $unidad = $cifras % 10;
    $decena = intval($cifras / 10);
    if ($cifras < 30) return self::convertirUnidades($cifras, $genero);
    elseif ($unidad == 0) return self::$listaDecenas[$decena];
    else return self::$listaDecenas[$decena].' y '.self::convertirUnidades($unidad, $genero);
  }

  /* Primer millar: del cero al novecientos noventa y nueve
  */
  public static function convertirTresCifras($cifras, $genero='neutro') {
    $decenas_y_unidades = $cifras % 100;
    $centenas = intval($cifras / 100);
    if ($cifras < 100) return self::convertirDosCifras($cifras, $genero);
    elseif ($decenas_y_unidades == 0) return self::convertirCentenas($centenas, $genero);
    elseif ($centenas == 1) return 'ciento '.self::convertirDosCifras($decenas_y_unidades, $genero);
    else return self::convertirCentenas($centenas, $genero).' '.self::convertirDosCifras($decenas_y_unidades, $genero);
  }

  /* Primer millón: del cero al novecientos noventa y nueve mil noventa y nueve
  */
  public static function convertirSeisCifras($cifras, $genero='neutro') {
    $primer_millar = $cifras % 1000;
    $grupo_miles = intval($cifras / 1000);
    $genero_miles = $genero=='masculino'? 'neutro': $genero;
    if ($grupo_miles == 0) return self::convertirTresCifras($primer_millar, $genero);
    elseif ($grupo_miles == 1) {
      if ($primer_millar == 0) return 'mil';
      else return 'mil '.self::convertirTresCifras($primer_millar, $genero);
    }
    elseif ($primer_millar == 0) return self::convertirTresCifras($grupo_miles, $genero_miles).' mil';
    else return self::convertirTresCifras($grupo_miles, $genero_miles).' mil '.self::convertirTresCifras($primer_millar, $genero);
  }

  /*
    Números enteros entre el cero y novecientos noventa y nueve mil novecientos noventa y nueve vigillones... etc, etc.
    Es decir entre el 0 y el (10^126)-1 o bien números entre 1 y 126 cifras.
    Las cifras por debajo del millón pueden ir en masculino o en femenino.
  */
  public static function convertirCifrasEnLetras($cifras, $genero='neutro', $separadorGruposSeisCifras=' ') {

    // Inicialización
    $cifras = trim($cifras);
    $numeroCifras = strlen($cifras);

    // Comprobación
    if ($numeroCifras == 0) return self::PREFIJO_ERROR.'No hay ningún número';
    for ($indiceCifra=0; $indiceCifra<$numeroCifras; $indiceCifra++) {
      $cifra = substr($cifras, $indiceCifra, 1);
      $esDecimal = strpos('0123456789', $cifra) !== false;
      if (!$esDecimal) return self::PREFIJO_ERROR.'Uno de los caracteres no es una cifra decimal';
    }
    if ($numeroCifras > 126) return self::PREFIJO_ERROR.'El número es demasiado grande ya que tiene más de 126 cifras';

    // Preparación
    $numeroGruposSeisCifras = intval($numeroCifras / 6) + (($numeroCifras % 6)? 1: 0);
    $cerosIzquierda = str_repeat('0', $numeroGruposSeisCifras*6 - $numeroCifras);
    $cifras = $cerosIzquierda.$cifras;
    $ordenMillon = $numeroGruposSeisCifras - 1;

    // Procesamiento
    $resultado = array();
    for ($indiceGrupo=0; $indiceGrupo<$numeroGruposSeisCifras*6; $indiceGrupo+=6) {
      $seisCifras = substr($cifras, $indiceGrupo, 6);

      if ($seisCifras != 0) {
        if (count($resultado) > 0) $resultado[] = $separadorGruposSeisCifras;

        if ($ordenMillon == 0) {
          $resultado[] = self::convertirSeisCifras($seisCifras, $genero);
        }
        elseif ($seiscifras == 1) {
          $resultado[] = 'un '.self::$listaOrdenesMillonSingular[$ordenMillon];
        }
        else {
          $resultado[] = self::convertirSeisCifras($seisCifras, 'neutro').' '.
                         self::$listaOrdenesMillonPlural[$ordenMillon];
        }
      }
      $ordenMillon--;
    }

    // Finalización
    if (count($resultado) == 0) $resultado[] = self::$listaUnidades[0];
    return implode('', $resultado);
  }

  /*
    Expresa un número con decimales y signo en letras acompañado del tipo de medida
    para la parte entera y la parte decimal.
    - Los caracters no numéricos son ignorados.
    - Los múltiplos de millón tienen la preposición 'de' antes de la palabra.
    - El género masculino o femenino sólo puede influir en las cifras inferiores al millón.
  */
  public static function convertirNumeroEnLetras(
    $cifras, $numeroDecimales=-1,
    $palabraEnteraSingular='', $palabraDecimalSingular='',
    $esFemeninaPalabraEntera=false, $esFemeninaPalabraDecimal=false,
    $palabraEnteraPlural='', $palabraDecimalPlural='')
  {



  }

  /* Función auxiliar de convertirNumeroEnLetras para procesar por separado la parte entera y la decimal
  */
  private static function procesarEnLetras($cifras, $palabraSingular, $palabraPlural, $esFemenina) {
  }

  /* Euros
  */
  public static function convertirEurosEnLetras($euros) {

  }


} // class CifrasEnLetras

//===============================================

// TEST

function test($cifras, $prueba, $referencia) {
  return '<li>'.($prueba==$referencia? 'correcto': 'ERROR').': '.$cifras.' = '.$prueba.'</li>';
}
function test_2cifras() {
  $lista = array(0=>"cero", 1=>"un", 2=>"dos", 7=>"siete", 10=>"diez", 12=>"doce", 22=>"veintidós", 30=>"treinta", 50=>"cincuenta", 66=>"sesenta y seis", 84=>"ochenta y cuatro", 99=>"noventa y nueve");
  echo '<h3>Convertir 2 cifras</h3><ul>';
  foreach($lista as $cifras=>$referencia) {
    echo test($cifras, CifrasEnLetras::convertirDosCifras($cifras), $referencia);
  }
  for ($i=0; $i<10; $i++) {
    $cifras = rand(0, 99);
    echo '<li>aleatorio: '.$cifras.' = '.CifrasEnLetras::convertirDosCifras($cifras).'</li>';
  }
  echo '</ul>';
}
function test_3cifras() {
  $lista = array(44=>"cuarenta y cuatro", 300=>"trescientos", 100=>"cien", 121=>"ciento veintiún", 438=>"cuatrocientos treinta y ocho", 999=>"novecientos noventa y nueve");
  echo '<h3>Convertir 3 cifras</h3><ul>';
  foreach($lista as $cifras=>$referencia) {
    echo test($cifras, CifrasEnLetras::convertirTresCifras($cifras), $referencia);
  }
  for ($i=0; $i<10; $i++) {
    $cifras = rand(100,999);
    echo '<li>aleatorio: '.$cifras.' = '.CifrasEnLetras::convertirTresCifras($cifras).'</li>';
  }
  echo '</ul>';
}
function test_6cifras() {
  $lista = array(781=>"setecientos ochenta y un", 1000=>"mil", 1001=>"mil un", 1200=>"mil doscientos", 320000=>"trescientos veinte mil", 458926=>"cuatrocientos cincuenta y ocho mil novecientos veintiséis", 999999=>"novecientos noventa y nueve mil novecientos noventa y nueve");
  echo '<h3>Convertir 6 cifras</h3><ul>';
  foreach($lista as $cifras=>$referencia) {
    echo test($cifras, CifrasEnLetras::convertirSeisCifras($cifras), $referencia);
  }
  for ($i=0; $i<10; $i++) {
    $cifras = rand(1000,999999);
    echo '<li>aleatorio: '.$cifras.' = '.CifrasEnLetras::convertirSeisCifras($cifras,'femenino').'</li>';
  }
  echo '</ul>';
}
function test_cifras() {
  $maximo = rand(1,126);
  $list = array();
  echo '<h3>Convertir cifras en letras</h3><ul>';
  for ($i=1; $i<$maximo; $i++) {
    $list[] = substr('0123456789000000000000', rand(0,19), 1);
  }
  $cifras = implode('',$list);
  echo '<li>aleatorio: '.$cifras.' =<br />'.CifrasEnLetras::convertirCifrasEnLetras($cifras,'femenino','<br />').'</li>';
  echo '</ul>';
}

//-----------------------------------------------

if (isset($_GET['test'])) {
  echo '<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body>';
  test_2cifras();
  test_3cifras();
  test_6cifras();
  test_cifras();
  echo '</body></html>';
}

//===============================================

?>