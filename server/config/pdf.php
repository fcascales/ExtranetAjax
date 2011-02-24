<?php
/*
   pdf.php - ProInf.net, 2009

   Crea un informe en formato PDF.
*/

/* INCLUDE ====================================== */

require_once('../db.php');
require_once('sql.php');
require_once('../response.php');
require_once('../tcpdf/tcpdf.php');

define ('IMAGEN_ENCABEZADO', '../../styles/imgs/factura_encabezado.jpg');

/* RECORD ======================================= */

class Report { // PDF

  private $response; // Array asociativo con las claves: 'ok' y 'message'
  private $db = null;
  private $pdf = null;

  public function __construct ($response)  {
    $this->response = $response;
  }

  private function db_connect() {
    // No conectar aún con la BD, esperar hasta el último momento,
    //  una vez pasado el mayor número de filtros posible
    if ($this->db == null) {
      $this->db = new DB($this->response);
    }
  }

/* ---------------------------------------------- */

  public function cmd_factura($id) {

    // Base de datos
    $sql = SQL::$pdf['factura'];
    $sql2 = SQL::$pdf['factura-cursos'];
    if ($sql == null || $sql2 == null) return $this->response->error('Sin SQL');

    $this->db_connect();
    $filter = array('id'=>$id);
    $fields = $this->db->query_to_assoc($sql, $filter);
    $details = $this->db->query_to_list($sql2, $filter);
    if ($fields == false || $details == false) die('No he encontrado la factura');

    // Nombre archivo
    $subject = 'Factura';
    $name = $fields['id_factura']; ////.' '.$fields['id_curso'].' '.$fields['detalle'];
    if (count($details) > 0) $name .= ' '.$details[0]['id_curso'].' '.$details[0]['detalle'];

    // Inicio del PDF
    $pdf = new TCPDF(/*milímetros DIN-A4*/);
    $this->pdf = $pdf;
    $pdf->SetAuthor('ProInf.net');
    $pdf->SetSubject($subject);
    $pdf->SetTitle("$subject $name", true);
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->setMargins(35,25);
    $pdf->setCellPadding(1);

    $pdf->AddPage();

    $pdf->Image(IMAGEN_ENCABEZADO,/*xy*/25,25,/*wh*/65,0);
    $pdf->Ln(30);

    // Contenido del PDF
    $this->th(40, 'Número factura:');
    $this->td(110, $fields['id_factura'], 'L','B');
    $pdf->Ln();
    $this->th(40, 'Fecha:');
    $this->td(110, 'Barcelona, '.$fields['fecha_factura']);
    $pdf->Ln();
    $this->th(40, 'Forma pago:');
    $this->td(110, $fields['forma_pago'].' '.$fields['banco'].' '.$fields['cuenta_corriente']);
    /*$pdf->Ln();
    $this->th(40, 'Código curso:');
    $this->td(110, $fields['id_curso']);*/
    $pdf->Ln(10);

    $this->th(40, 'Cliente:');
    $this->td(110, $fields['cliente'], 'L','B');
    $pdf->Ln();
    $this->th(40, 'CIF:');
    $this->td(110, $fields['nif']);
    $pdf->Ln();
    $this->th(40, 'Dirección:');
    $this->td(110, $fields['direccion']);
    $pdf->Ln(10);

    if ($fields['para']) {
      $this->p(150, 'A la atención de '.$fields['para'], 'L', 'U');
      //$pdf->Ln();
    }
    if ($fields['encabezado'] && trim($fields['encabezado']) != '') {
      $this->p(150, $fields['encabezado']);
      $this->p(150, '');
      //$pdf->Ln();
    }

    $this->th(15, 'Horas','C');
    $this->th(75, 'Descripción');
    $this->th(30, 'Precio hora','R');
    $this->th(30, 'Total','R');
    $pdf->Ln();

    foreach ($details as $detail) {
      $this->td(15, $this->num($detail['horas']),'C');
      $this->td(75, $detail['id_curso'] . '—' . $detail['detalle']);
      $this->td(30, $this->num($detail['precio_hora']).' €','R');
      $this->td(30, $this->num($detail['subtotal']).' €','R');
      $pdf->Ln();
    }
    $pdf->Ln();

    $pdf->Cell(90);
    $this->th(30, 'Suma:','R');
    $this->td(30, $this->num($fields['subtotal']).' €','R');
    $pdf->Ln();
    if ($fields['retencion'] != 0) {
      $pdf->Cell(70);
      $this->td(20, $this->num($fields['retencion']).'%','C');
      $this->th(30, 'Retención:','R');
      $this->td(30, $this->num($fields['total_retencion']).' €','R');
      $pdf->Ln();
    }
    if ($fields['iva'] != 0) {
      $pdf->Cell(70);
      $this->td(20, $this->num($fields['iva']).'%','C');
      $this->th(30, 'IVA:','R');
      $this->td(30, $this->num($fields['total_iva']).' €','R');
      $pdf->Ln();
    }
    $pdf->Cell(90);
    $this->th(30, 'Total:','R');
    $this->td(30, $this->num($fields['total']).' €','R','B');
    $pdf->Ln();

    if ($fields['iva'] == 0) {
      //$pdf->Ln();
      $this->p(150, 'Exento de IVA (Art. 20, 9º Ley IVA)');
    }

    if ($fields['pie']) {
      //$pdf->Ln();
      $this->p(150, $fields['pie']);
      //$this->p(150, '');
    }

    // Fin del PDF
    $pdf->Output("$name.pdf",'I');
  } // cmd_factura

/* ---------------------------------------------- */

  public function cmd_hoja_horas($id) {

    if ($id == '') { // Hoja de horas vacía o en blanco
      $fields = array(
        'num_clase'=>'', 'id_curso'=>'', 'curso'=>'', 'fecha'=>'',
        'hora_inicio'=>'', 'hora_fin'=>'', 'duracion'=>'', 'id_materia'=>'', 'cliente'=>'',
        'trabajador'=>'', 'sesion'=>'');
    }
    else { // Base de datos
      $sql = SQL::$pdf['hoja-horas'];
      if ($sql == null) return $this->response->error('Sin SQL');
      $this->db_connect();
      $fields = $this->db->query_to_assoc($sql, array('id'=>$id));
      if ($fields == false) die('No he encontrado la hoja de horas');
    }

    // Nombre archivo
    $subject = 'Hoja de horas';
    $name = $fields['id_curso'].'_'.$fields['num_clase'];

    // Inicio del PDF
    $pdf = new TCPDF(/*milímetros DIN-A4*/);
    $this->pdf = $pdf;
    $pdf->SetAuthor('ProInf.net');
    $pdf->SetSubject($subject);
    $pdf->SetTitle("$subject $name", true);
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->setMargins(25,10/*left top right*/);
    $pdf->SetAutoPageBreak(true, 5/* bottom */);
    $pdf->setCellPadding(1);

    $pdf->AddPage();

    $pdf->Image(IMAGEN_ENCABEZADO,/*xy*/20,15,/*wh*/65,0);
    $pdf->Ln(30);

    // Contenido del PDF
    $this->height = 7;

    $this->th(30, 'Nº sesión:', 'R');
    $this->td(50, $fields['num_clase'], 'L', 'B');
    $this->span(10);
    $this->th(30, 'Fecha:', 'R');
    $this->td(50, $fields['fecha']);
    $pdf->Ln();

    $this->th(30, 'Código:', 'R');
    $this->td(50, $fields['id_curso']);
    $this->span(10);
    $this->th(30, 'Hora:', 'R');
    $this->td(50, $fields['hora_inicio']);
    $pdf->Ln();

    $this->th(30, 'Asunto:', 'R');
    $this->td(50, $fields['curso']);
    $this->span(10);
    $this->th(30, 'Duración:', 'R');
    $this->td(50, $fields['duracion']);
    $pdf->Ln();

    $pdf->Ln(5);

    $this->th(170, 'Descripción:');
    $pdf->Ln();
    //$this->height = 170;
    //$this->td(170, $fields['sesion']);
    $pdf->SetDrawColor(0x80, 0x80, 0x00);
    $this->p(170,$fields['sesion'],'L','',170, 1);
    $this->p(170, '');
    //$pdf->Ln();
    //$this->span();
    //$pdf->Ln();

    $this->height = 7;
    $this->th(30, 'Formador:','R');
    $this->td(50, $fields['trabajador']);
    $this->span(10);
    $this->th(30, 'Cliente:','R');
    $this->td(50, $fields['cliente']);
    $pdf->Ln();

    $this->height = 30;
    //$this->th(30, 'Firma:', 'R');
    $this->td(80, '');
    $this->span(10);
    //$this->th(30, 'Firma:', 'R');
    $this->td(80, '');

    // Encabezado
    $pdf->SetXY(105,20);
    $this->pdf->SetTextColor(0xEB, 0xEC, 0xCC);
    $pdf->SetFont('helvetica','B',24);
    $pdf->Cell(90,0,$subject,0,'','L',0,'',2);

    // Contenido de la sesión
    ////$pdf->setXY(60,20);

    // Fin del PDF
    $this->pdf->Output("$name.pdf",'I');

  } // cmd_hoja_horas

/* ---------------------------------------------- */

  public function cmd_curso($id, $id_trabajador, $notas) {

    // Base de datos
    $sql = SQL::$pdf['curso'];
    $sql2 = SQL::$pdf['curso-calendario'];
    if ($sql == null || $sql2 == null) return $this->response->error('Sin SQL');

    $this->db_connect();
    $filter = array('id'=>$id);
    $fields = $this->db->query_to_assoc($sql, $filter);
    $weeks = $this->db->query_to_list($sql2, $filter);
    if ($fields == false || $weeks == false) die('No he encontrado el curso');


    // Nombre archivo
    $subject = 'Curso';
    $name = $fields['id_curso'];

    // Inicio del PDF
    $pdf = new TCPDF(/*milímetros DIN-A4*/);
    $this->pdf = $pdf;
    $pdf->SetAuthor('ProInf.net');
    $pdf->SetSubject($subject);
    $pdf->SetTitle("$subject $name", true);
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->setMargins(30,20/*left top right*/);
    $pdf->SetAutoPageBreak(true, 5/* bottom */);
    $pdf->setCellPadding(1);

    $pdf->AddPage();

    $pdf->Image(IMAGEN_ENCABEZADO,/*xy*/25,10,/*wh*/65,0);
    $pdf->Ln(20);

    // Contenido del PDF
    $this->th(30, 'Curso:');
    $this->td(130, $fields['curso'], 'L', 'B');
    $pdf->Ln();
    $pdf->Ln(2);
    $this->th(30, 'Cliente:');
    $this->td(130, $fields['cliente']);
    $pdf->Ln();
    $this->th(30, 'Domicilio:');
    $this->td(130, $fields['domicilio']);
    $pdf->Ln();
    $pdf->Ln(2);
    $this->th(30, 'Duración:');
    $this->td(130, $fields['duracion']);
    $pdf->Ln();
    $this->th(30, 'Fechas:');
    $this->td(130, $fields['fechas']);
    $pdf->Ln();
    $pdf->Ln(1);
    $this->th(30, 'Semana:');
    $this->td(130, $fields['semana']);
    $pdf->Ln();
    $this->th(30, 'Horario:');
    $this->td(130, $fields['horario']);
    $pdf->Ln();
    /*$this->th(30, 'Tutor:');
    $this->td(130, $fields['trabajador']);
    $pdf->Ln();*/
    /*$this->th(30, 'Días:');
    $this->td(130, $fields['dias']);
    $pdf->Ln();*/

    $trabajador = '';
    foreach ($weeks as $week) {
      if (isset($id_trabajador)) {
        if ($id_trabajador != $week['id_trabajador']) continue;
      }
      if ($week['trabajador'] != $trabajador) {
        $trabajador = $week['trabajador'];

        $pdf->Ln();
        $this->th(30, 'Formador:');
        $this->td(130, $week['trabajador']);
        $pdf->Ln();
        $pdf->Ln(1);

        $this->th(18, '');
        $this->span(1);
        $this->th(20, 'lun','C');
        $this->th(20, 'mar','C');
        $this->th(20, 'mie','C');
        $this->th(20, 'jue','C');
        $this->th(20, 'vie','C');
        $this->span(1);
        $this->th(20, 'sab','C');
        $this->th(20, 'dom','C');
        $pdf->Ln();
      }

      $this->th(18, $week['sem'],'C');
      $this->span(1);
      $this->td(20, $week['lun'],'C');
      $this->td(20, $week['mar'],'C');
      $this->td(20, $week['mie'],'C');
      $this->td(20, $week['jue'],'C');
      $this->td(20, $week['vie'],'C');
      $this->span(1);
      $this->td(20, $week['sab'],'C');
      $this->td(20, $week['dom'],'C');
      $pdf->Ln();
    }
    $pdf->Ln();

    $this->p(160, isset($notas)? $notas: $fields['notas']);
    $pdf->Ln();

    // Fin del PDF
    $this->pdf->Output("$name.pdf",'I');

  } // cmd_curso

/* ---------------------------------------------- */

  public function cmd_aula ($id) {
    // Base de datos
    $sql = SQL::$pdf['aula'];
    $sql2 = SQL::$pdf['aula-alumnos'];
    if ($sql == null || $sql2 == null) return $this->response->error('Sin SQL');

    $this->db_connect();
    $filter = array('id'=>$id);
    $fields = $this->db->query_to_assoc($sql, $filter);
    $students = $this->db->query_to_list($sql2, $filter);
    if ($fields == false || $students == false) die('No he encontrado el curso');

    // Nombre archivo
    $subject = 'Aula';
    $name = $fields['id_curso'];

    // Inicio del PDF
    $pdf = new TCPDF('L'/*landscape*//*milímetros DIN-A4*/);
    $this->pdf = $pdf;
    $pdf->SetAuthor('ProInf.net');
    $pdf->SetSubject($subject);
    $pdf->SetTitle("$subject $name", true);
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->setMargins(20,20/*left top right*/);
    $pdf->SetAutoPageBreak(true, 5/* bottom */);
    $pdf->setCellPadding(1);

    $pdf->AddPage();

    $pdf->Image(IMAGEN_ENCABEZADO,/*xy*/15,10,/*wh*/65,0);
    $pdf->Ln(15);

    // Contenido del PDF
    $this->span(10, 'Curso:', 'L');
    $this->span(200, $fields['curso'], 'L', 'B');
    $pdf->Ln();
    $this->span(10, 'Aula:', 'L');

    /*// Encabezado
    $pdf->SetXY(220,20);
    $this->pdf->SetTextColor(0xEB, 0xEC, 0xCC);
    $pdf->SetFont('helvetica','B',36);
    $pdf->Cell(0,0,$subject,0,'','L',0,'',2);*/

    if (count($students) > 0) {

      $this->pdf->SetDrawColor(0,0,0);

      $fils = $fields['filas'];
      $cols = $fields['columnas'];

      $auto = ($fils==0 && $cols==0);

      $left = 25;
      $top = 50;

      if ($auto) {
        $fils = 4;
        $cols = 5;
        $fil = 1;
        $col = 1;
      }
      $width = 255/$cols;
      $height = 145/$fils;

      foreach ($students as $student) {

        if ($auto == false) {
          $col = $student['columna'];
          $fil = $student['fila'];
        }

        $x = $left + ($col - 1) * $width;
        $y = $top  + ($fil - 1) * $height;

        $pdf->Rect($x, $y, $width, $height);

        $pdf->setXY($x,$y+5);
        $this->span($width, $student['alumno'],'C','B');

        $pdf->setXY($x,$y+10);
        $this->span($width, $student['apellidos'],'C');

        if ($auto) {
          $col++;
          if ($col > $cols) {
            $col = 1;
            $fil++;
          }
        }
      }
    }

    // Fin del PDF
    $this->pdf->Output("$name.pdf",'I');

  } // cmd_aula

/* ---------------------------------------------- */
// Util

  private $height = 6; // Altura para td y th
  private $font_size = 12;

  private function num($num) {
    return number_format($num, 2, ',', '.');
  }

  private function span($width=0,$text='',$align='L',$style='') { // Texto en línea
    $font_size = $this->font_size;
    $border = 0;
    $ln = 0;
    $fill = 0;
    $link = '';
    $stretch = 1;
    //$this->pdf->SetDrawColor(0,0,0);
    //$this->pdf->SetFillColor(0,0,0);
    $this->pdf->SetTextColor(0,0,0);
    $this->pdf->SetFont('helvetica',$style,$font_size);
    $this->pdf->Cell($width,$height,$text,$border,$ln,$align,$fill,$link,$stretch);
  }
  private function p($width,$text,$align='L',$style='',$height=0, $border=0) { // Párrafo
    $font_size = $this->font_size;
    //$this->pdf->SetDrawColor(0,0,0);
    //$this->pdf->SetFillColor(0,0,0);
    $this->pdf->SetTextColor(0,0,0);
    $this->pdf->SetFont('helvetica',$style,$font_size);
    $this->pdf->MultiCell($width,$height,$text,$border,$align);
  }
  private function th($width,$text,$align='L') { // Celda de título
    $font_size = $this->font_size;
    $height = $this->height; // 6;
    $border = 1;
    $ln = 0;
    $fill = 1;
    $link = '';
    $stretch = 1;
    $this->pdf->SetDrawColor(0x99, 0x99, 0xCC);
    $this->pdf->SetFillColor(0xEE, 0xEE, 0xFF);
    $this->pdf->SetTextColor(0x33, 0x33, 0x66);
    $this->pdf->SetFont('helvetica','I',$font_size);
    $this->pdf->Cell($width,$height,$text,$border,$ln,$align,$fill,$link,$stretch);
  }
  private function td($width,$text,$align='L',$style='') { // Celda de datos
    $font_size = $this->font_size;
    $height = $this->height; //6;
    $border = 1;
    $ln = 0;
    $fill = 0;
    $link = '';
    $stretch = 1;
    $this->pdf->SetDrawColor(0x99, 0x99, 0xCC);
    $this->pdf->SetFillColor(0,0,0);
    $this->pdf->SetTextColor(0,0,0);
    $this->pdf->SetFont('helvetica',$style,$font_size);
    $this->pdf->Cell($width,$height,$text,$border,$ln,$align,$fill,$link,$stretch);
  }



} // class Report

/* MAIN ========================================= */

class Main {

  public static function init() {
    $response = new Response();

    if ($response->ok) {

      $query = ($_POST)?$_POST:$_GET;
      $report = new Report($response);

      switch ($query['cmd']) {
        case 'aula': $report->cmd_aula ($query['id']); break;
        case 'curso': $report->cmd_curso ($query['id'], $query['id_trabajador'], $query['notas']); break;
        case 'factura': $report->cmd_factura ($query['id']); break;
        case 'hoja-horas': $report->cmd_hoja_horas ($query['id']); break;
        default: $response->error('Comando incorrecto');
      }
    }
    if ($response->ok == false) {
      echo "<h1>Error</h1>";
      echo $response->message;
    }

  } // init

} // Main

/* ============================================== */

Main::init();

/* ============================================== */

/*
  Test:
  ?cmd=factura&id=
  ?cmd=curso&id=E-59-09
*/
?>
