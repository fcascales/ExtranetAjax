<?php
/*
   sql.php - ProInf.net, julio-agosto 2009

   Contenedor de todas las sentencias SQL
*/

/* SQL ========================================== */

class SQL { // Contiene todas las sentencias SQL

  /*public static function get($array, $key) {
    switch($array) {
      case 'schedule': return self::$schedule[$key];      // horario.php
      case 'search':   return self::$search[$key];        // Ajax.Autocompleter (scriptaculous/controls.js)
      case 'lookup':   return self::$lookup[$key];        // DB.lookup (record.js)
      case 'combobox': return self::$combobox[$key];      // DB.combobox (record.js)
      case 'list_filters': return self::$list_filters[$key];
      case 'list':     return self::$list[$key];          // DB.List (record.js)
      case 'table':    return self::$table[$key];         // DB.Table (record.js)
      case 'grid':     return self::$grid[$key];          // DB.Grid (record.js) 
      case 'get':      return self::$get[$key];           // DB.Record (record.js)
      case 'pdf':      return self::$pdf[$key];           // pdf.php
    }
  }*/


  /* 'dias-clase'=> "SELECT trim(group_concat('   ',elt(mes,'ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'),': ',dias)) FROM (SELECT month(fecha) as mes, trim(group_concat(concat(' ',date_format(fecha,'%e')))) as dias FROM cursos_clases WHERE id_curso='FTN-13-09' GROUP BY month(fecha) ORDER BY fecha) a"
      // oct: 2, 31, 30, 24, 23, 17, 16, 3,   nov: 21, 20, 14, 13, 7, 6, 27 */
      
  /*public static $schedule = array ( // horario.php
    'tasks'=>  "SELECT id, summary, description, dtstart, dtend, calendar, sequence FROM (select concat('clase',cc.id_clase) AS id,cc.id_curso AS summary,concat(c.curso,_latin1' - ',cc.id_materia) AS description,(cc.fecha + interval date_format(cc.hora_inicio,'%H:%i') hour_minute) AS dtstart,((cc.fecha + interval date_format(cc.hora_inicio,'%H:%i') hour_minute) + interval (cc.duracion * 60) minute) AS dtend,cc.id_trabajador AS calendar,concat(coalesce(cc.num_clase,0),'/',coalesce(cc.total_clases,0)) AS sequence from (cursos_clases cc join cursos c on((cc.id_curso = c.id_curso))) union select concat('cita',i.id_cita) AS id,i.tema AS summary,i.titulo AS description,(i.fecha + interval date_format(i.hora,'%H:%i') hour_minute) AS dtstart,((i.fecha + interval date_format(i.hora,'%H:%i') hour_minute) + interval (i.duracion * 60) minute) AS dtend,i.usuario AS calendar,'cita' AS sequence from citas i) aa WHERE dtstart >= {start} AND dtstart < {end} ORDER BY dtstart, dtend",
    'tasks-allday'=> "SELECT id, summary, description, dtstart, dtend, calendar, sequence FROM (select concat('festivo',f.id) AS id,'festivo' AS summary,f.descripcion AS description,f.fecha AS dtstart,(f.fecha + interval '23:59:59' hour_second) AS dtend,'festivo' AS calendar,'festivo' AS sequence from festivos f) aa WHERE dtstart >= {start} AND dtstart < {end} ORDER BY dtstart, dtend"
  );*/      
  
  public static $schedule = array ( // horario.php
    'tasks'=>  "SELECT id, summary, description, dtstart, dtend, calendar, sequence FROM tasks WHERE dtstart >= {start} AND dtstart < {end} ORDER BY dtstart, dtend",
    'tasks-allday'=> "SELECT id, summary, description, dtstart, dtend, calendar, sequence FROM tasks_allday WHERE dtstart >= {start} AND dtstart < {end} ORDER BY dtstart, dtend"
  );
   

  public static $search = array( // Ajax.Autocompleter (scriptaculous/controls.js)
                                 // Campos: "id" y "label". Filtro mediante expresión regular por {search}

    'all'=> "SELECT * FROM (SELECT 'curso' as `class`, id_curso as id, concat(id_curso,'—',curso) as label FROM cursos WHERE concat_ws(' ',id_curso,curso) regexp {search} ORDER BY right(id_curso,2) desc, id_curso desc LIMIT 10) cu UNION SELECT * FROM (SELECT 'cliente' as `class`, id_cliente as id, concat(cliente,'—',coalesce(contacto,''),'—',coalesce(nif,'')) as label FROM clientes WHERE concat_ws(' ',cliente,contacto,nif) regexp {search} ORDER BY cliente LIMIT 5) cl UNION SELECT * FROM (SELECT 'factura' as `class`, f.id_factura as id, concat(f.id_factura,'—',coalesce(group_concat(fc.detalle separator '—'),'')) as label FROM facturas f left join facturas_cursos fc using (id_factura) WHERE concat_ws(' ',f.id_factura,fc.detalle) regexp {search} GROUP BY f.id_factura ORDER BY right(f.id_factura,2) desc, f.id_factura desc LIMIT 10) fa UNION SELECT * FROM (SELECT 'trabajador' as `class`, id_trabajador as id, concat(id_trabajador,'—',trabajador,' ',coalesce(apellidos,'')) as label FROM trabajadores WHERE concat_ws(' ',id_trabajador,trabajador,coalesce(apellidos,'')) regexp {search} ORDER BY id_trabajador LIMIT 5) tr",

    'alumno'=> "SELECT id_alumno as id, concat(concat_ws(' ',alumno,apellidos),coalesce(concat('—',nif),'')) as label, 'alumno' as `class` FROM alumnos WHERE concat_ws(' ',alumno,apellidos,nif) regexp {search} ORDER BY alumno, apellidos LIMIT 25",

    'cliente'=> "SELECT id_cliente as id, concat(cliente,'—',coalesce(contacto,''),'—',coalesce(nif,'')) as label, 'cliente' as `class` FROM clientes WHERE concat_ws(' ',cliente,contacto,nif) regexp {search} ORDER BY cliente LIMIT 25",

    'curso'=> "SELECT id_curso as id, concat(id_curso,'—',curso) as label, 'curso' as `class` FROM cursos WHERE concat_ws(' ',id_curso,curso) regexp {search} ORDER BY right(id_curso,2) desc, id_curso desc LIMIT 25",

    'factura'=> "SELECT f.id_factura as id, concat(f.id_factura,'—',coalesce(group_concat(fc.detalle separator '—'),'')) as label, 'factura' as `class` FROM facturas f left join facturas_cursos fc using (id_factura) WHERE concat_ws(' ',f.id_factura,fc.detalle) regexp {search} GROUP BY f.id_factura ORDER BY right(f.id_factura,2) desc, f.id_factura desc LIMIT 25", /*"SELECT id_factura as id, concat(id_factura,'—',coalesce(detalle,'')) as label FROM facturas WHERE concat_ws(' ',id_factura,detalle) regexp {search} ORDER BY right(id_factura,2) desc, id_factura desc LIMIT 25",*/

    'mundo_bandera'=> "SELECT b.id, b.pais as label FROM mundo_banderas b WHERE concat_ws(' ',b.pais,b.oficial,b.country) regexp {search} ORDER BY b.pais LIMIT 35",

    'trabajador'=> "SELECT id_trabajador as id, concat(id_trabajador,'—',trabajador,' ',coalesce(apellidos,'')) as label, 'trabajador' as `class` FROM trabajadores WHERE concat_ws(' ',id_trabajador,trabajador,coalesce(apellidos,'')) regexp {search} ORDER BY id_trabajador LIMIT 25"

  );

  public static $lookup = array( // DB.lookup (record.js)
                                 // El SQL devuelve un sólo campo y se filtra por {id}

    'cliente'=> "SELECT cliente FROM clientes WHERE id_cliente={id}",

    'curso'=> "SELECT concat(id_curso,'—',coalesce(curso,'')) FROM cursos WHERE id_curso={id}",

    /*'festivos'=> "SELECT group_concat(date_format(fecha,'%Y-%m-%d')) FROM festivos WHERE fecha >= {id} and date_add(fecha,interval -1 year) < {id}",*/

    'trabajador'=> "SELECT trim(concat(id_trabajador,'—',trabajador,' ',coalesce(apellidos,''))) FROM trabajadores WHERE id_trabajador={id}",

    'next_id_curso'=> "SELECT concat(upper({id}), '-', coalesce(concat(repeat('0', 2-length(num)), num), '01'), '-', right(year(curdate()), 2)) FROM (SELECT max(substring(id_curso, instr(id_curso, '-')+1, 2))+1 as num FROM cursos WHERE substring(id_curso, 1, instr(id_curso, '-')-1) = {id} and right(id_curso, 2) = right(year(curdate()), 2)) a",

    'next_id_factura'=> "SELECT coalesce(concat(upper({id}),repeat('0',5-length(numero)),numero,'-',year), concat(upper({id}),'00001-',year)) FROM (SELECT max(substring(id_factura,2,5))+1 as numero, right(year(curdate()),2) as year FROM facturas WHERE left(id_factura,1)={id} and right(id_factura,2) = right(year(curdate()),2)) a"

  );

  public static $combobox = array ( // DB.combobox (record.js)
                                    // Campos obligatorios "id" y "label". Opcionales: "group" y "class".
                                    // <select><optgroup><option class>
                                    
    'años'=> "SELECT a as id, a as label FROM (select year(now())+1 a union select year(now())+0 union select year(now())-1 union select year(now())-2 union select year(now())-3) aa",

    'bancos'=> "SELECT id_banco as id, banco as label FROM bancos ORDER BY banco",

    'citas-años'=> "SELECT DISTINCT year(fecha) as id, year(fecha) as label FROM citas ORDER BY 1 desc",

    'citas-usuarios'=> "SELECT DISTINCT usuario as id, usuario as label FROM citas ORDER BY 1",

    'clientes'=> "SELECT id, label, if(clasificacion=0,'antiguos','actuales') as `group` FROM (SELECT id_cliente as id, cliente as label, coalesce((SELECT round(sum(total_horas)) FROM cursos cu WHERE cu.fecha_fin> subdate(curdate(),interval 2 year) and cu.id_cliente = c.id_cliente),0) as clasificacion FROM clientes c ORDER BY clasificacion desc, cliente) cc ",

    'clientes-class'=> "SELECT id, label, if(clasificacion=0,'antiguos','actuales') as `group`, coalesce(class,'noname') as class FROM (SELECT id_cliente as id, cliente as label, coalesce((SELECT round(sum(total_horas)) FROM cursos cu WHERE cu.fecha_fin> subdate(curdate(),interval 2 year) and cu.id_cliente = c.id_cliente),0) as clasificacion, replace(substring(replace(web,'www.',''),1,instr(replace(web,'www.',''),'.')-1),'http://','') as class FROM clientes c ORDER BY clasificacion desc, cliente) cc",

    'clases-años'=> "SELECT DISTINCT year(fecha) as id, year(fecha) as label FROM cursos_clases ORDER BY 1 desc",

    'cobros-años'=> "SELECT DISTINCT year(vencimiento) as id, year(vencimiento) as label FROM facturas_cobros ORDER BY 1 desc",

    'contactos-cliente'=> "SELECT id_contacto as id, contacto as label, concat('contacto_',id_cliente) as `class` FROM clientes_contactos ORDER BY contacto",

    'cursos'=> "SELECT id_curso as id, CONCAT(id_curso,'—',curso) as label, concat('20',right(id_curso,2)) as `group` FROM cursos ORDER BY right(id_curso,2) desc, substring(id_curso FROM 1 for instr(id_curso,'-')-1), substring(id_curso from instr(id_curso,'-')+1 for 2) desc , id_curso",

    'cursos-cliente'=> "SELECT  id_curso as id, id_cliente, CONCAT(id_curso,'—',curso) as label, concat('20',right(id_curso,2),'—',(SELECT cliente FROM clientes e WHERE e.id_cliente=c.id_cliente)) as `group` FROM cursos c ORDER BY right(id_curso,2) desc, substring(id_curso FROM 1 for instr(id_curso,'-')-1), substring(id_curso from instr(id_curso,'-')+1 for 2) desc , id_curso", // Para filtrar por id_cliente

    'cursos-factura'=> "SELECT id_curso as id, concat('cliente_',id_cliente,' ',if(exists(select id_factura from facturas f where f.id_curso = c.id_curso),'yes',' no')) as `class`, CONCAT(id_curso,'—',curso) as label, concat('20',right(id_curso,2)) as `group` FROM cursos c ORDER BY right(id_curso,2) desc, substring(id_curso FROM 1 for instr(id_curso,'-')-1), substring(id_curso from instr(id_curso,'-')+1 for 2) desc , id_curso",

    /*'cursos-clientes'=> "SELECT  id_curso as id, CONCAT(id_curso,'—',curso) as label, concat('20',right(id_curso,2)) as \"group\" FROM cursos WHERE id_cliente = {id} ORDER BY right(id_curso,2) desc, substring(id_curso FROM 1 for instr(id_curso,'-')-1), substring(id_curso from instr(id_curso,'-')+1 for 2) desc , id_curso",*/

    'duraciones'=> "SELECT DISTINCT duracion as id, round(duracion,2) as label FROM cursos_clases ORDER BY 1",

    'facturas-años'=> "SELECT DISTINCT year(fecha_factura) as id, year(fecha_factura) as label FROM facturas ORDER BY 1 desc",

    'festivos-años'=> "SELECT DISTINCT year(fecha) as id, year(fecha) as label FROM festivos ORDER BY 1 desc",

    'festivos-descripciones'=> "SELECT distinct descripcion as id, descripcion as label FROM festivos ORDER BY descripcion",

    'formaspago'=> "SELECT id_forma_pago as id, forma_pago as label FROM formas_pago ORDER BY 2",

    'materias'=> "SELECT DISTINCT lower(id_materia) as id, lower(id_materia) as label FROM cursos_materias WHERE not id_materia regexp '[0-9. ]'", /* "SELECT id_materia as id, id_materia as label FROM cursos_clases WHERE fecha > date_sub(curdate(), interval 1 year) GROUP BY id_materia ORDER BY count(*) desc", */

    'mundo_continentes'=> "SELECT DISTINCT continente as id, continente as label FROM mundo_banderas ORDER BY 1",
    'mundo_gobiernos'=> "SELECT DISTINCT gobierno as id, gobierno as label FROM mundo_banderas ORDER BY 1",
    'mundo_tipos'=> "SELECT DISTINCT tipo as id, tipo as label FROM mundo_banderas ORDER BY 1",

    'poblaciones'=> "SELECT id_poblacion as id, poblacion as label FROM poblaciones ORDER BY poblacion",

    'poblaciones-provincias' => "SELECT DISTINCT provincia as id, provincia as label FROM poblaciones ORDER BY 1",

    'tareas-años'=> "SELECT DISTINCT year(fecha_tarea) as id, year(fecha_tarea) as label FROM tareas ORDER BY 1 desc",

    'trabajadores'=> "SELECT id, label,  if(clasificacion=0,'antiguos','actuales') as `group` FROM (SELECT id_trabajador as id, concat(id_trabajador,'—',trabajador,' ',coalesce(apellidos,'')) as label,coalesce((SELECT round(sum(duracion)) FROM cursos_clases cc WHERE fecha> subdate(curdate(),interval 2 year) and cc.id_trabajador = t.id_trabajador group by id_trabajador),0) as clasificacion FROM trabajadores t ORDER BY clasificacion desc, id_trabajador) a",

  );

  /*public static $filter_fields = array( // Nombres de los campos que actuarán de filtro
    'clases'=> array('id_cliente', 'id_curso', 'id_trabajador'),
    'cursos'=> array('id_cliente', 'id_trabajador'),
    'facturas'=> array('id_cliente', 'id_curso')
  );*/

  public static $list_filters = array ( // filtros a aplicar en {filter} de $list
    'cursos_clases'=> "cc.fecha>date_sub(curdate(), interval 1 year) ",
    'clases-historic'=> "cc.fecha<=date_sub(curdate(), interval 1 year)",
    'cursos'=> "not(nuevo=0 and actual=0 and total_curso=total_factura)",
    'cursos-historic'=> "nuevo=0 and actual=0 and total_curso=total_factura",
    'facturas'=>"revisado=0",
    'facturas-historic'=>"revisado<> 0 or id_factura is null"
  );

  public static $list = array ( // DB.List (record.js)
                                // Si hay un campo "group" servirá para agrupar.
                                // Si puede haber histórico hay {filter}. El campo "id" es obligatorio.

    'alumnos_cursos'=> "SELECT id_alumno as id, alumno, apellidos, id_curso FROM alumnos left join alumnos_cursos using(id_alumno) ORDER BY alumno, apellidos",

    'cursos_clases'=> "SELECT id_clase as id, coalesce(cc.num_clase,0) as num_clase, coalesce(cc.total_clases,0) as total_clases, cc.id_curso, curso, date_format(cc.fecha,'%v') as num_semana, elt(date_format(cc.fecha,'%w'),'lun','mar','mié','jue','vie','sáb','dom') as dia_semana, date_format(cc.fecha,'%Y-%m-%d') as fecha_clase, date_format(cc.hora_inicio,'%H:%i') as hora_inicio,  time_format(sec_to_time(time_to_sec(cc.hora_inicio)+(cc.duracion*3600)), '%H:%i') as hora_fin, round(duracion,2) as duracion, cc.id_materia, cc.id_trabajador, id_cliente, CASE when cc.fecha>curdate() then 'futuro' when cc.fecha=curdate() then 'presente' when cc.fecha>date_sub(curdate(), interval 1 year) then 'reciente' else 'pasado' end as `group`, if(cc.sesion is null,'-','sí') as sesion  FROM cursos_clases cc left join cursos c using (id_curso) WHERE {filter} ORDER BY cc.fecha desc, cc.hora_inicio desc",

    'clientes'=> "SELECT *, case when nuevo<>0 then 'nuevo' when clasificacion=0 then 'antiguo' else 'habitual' end as `group` FROM (SELECT id_cliente as id, cliente, contacto, fecha_alta>subdate(curdate(),interval 1 year) as nuevo, coalesce((SELECT round(sum(total_horas)) FROM cursos cu WHERE coalesce(cu.fecha_fin,curdate())> subdate(curdate(),interval 2 year) and cu.id_cliente = c.id_cliente),0) as clasificacion FROM clientes c ORDER BY nuevo desc, clasificacion desc, cliente) a",

    'cursos'=> "SELECT *, if(fecha_fin <= curdate(),total_curso - total_factura,0) as total_pendiente, case when nuevo<>0 then 'nuevo' when actual<>0 then 'actual' when total_curso<>total_factura then 'pendiente' else 'acabado' end as `group`, coalesce(date_format(fecha_inicio,'%Y-%m-%d'),'sin inicio') as inicio, coalesce(date_format(fecha_fin,'%Y-%m-%d'),'sin fin') as fin FROM (SELECT id_curso as id, id_curso, id_trabajador, id_cliente, curso, fecha_inicio, fecha_fin, fecha_inicio >= curdate() as nuevo, fecha_inicio<=curdate() and coalesce(fecha_fin,curdate())>=curdate() as actual, round(precio_hora_cliente * total_horas) as total_curso, coalesce((SELECT round(sum(fc.subtotal)) FROM facturas_cursos fc inner join facturas f using (id_factura) WHERE fc.id_curso = c.id_curso and f.revisado<>0), 0) as total_factura FROM cursos c) a WHERE {filter} ORDER BY nuevo desc, actual desc, abs(total_pendiente) desc, right(id_curso,2) desc, id_curso desc", /*"SELECT *, if(fecha_fin <= curdate(),total_curso - total_factura,0) as total_pendiente, case when nuevo<>0 then 'nuevo' when actual<>0 then 'actual' when total_curso<>total_factura then 'pendiente' else 'acabado' end as `group`, coalesce(date_format(fecha_inicio,'%Y-%m-%d'),'sin inicio') as inicio, coalesce(date_format(fecha_fin,'%Y-%m-%d'),'sin fin') as fin FROM (SELECT id_curso as id, id_curso, id_trabajador, id_cliente, curso, fecha_inicio, fecha_fin, fecha_inicio >= curdate() as nuevo, fecha_inicio<=curdate() and coalesce(fecha_fin,curdate())>=curdate() as actual, round(precio_hora_cliente * total_horas) as total_curso, coalesce((SELECT round(sum(subtotal)) FROM facturas f WHERE f.id_curso = c.id_curso and f.revisado<>0),0) as total_factura FROM cursos c) a  WHERE {filter} ORDER BY nuevo desc, actual desc, abs(total_pendiente) desc, fecha_inicio desc",*/

    'facturas'=> "SELECT f.id_factura as id, f.id_factura, fecha_factura, group_concat(fc.id_curso order by fc.id_curso separator ', ') as cursos, id_cliente, cliente, round(sum(fc.precio_hora*fc.horas)) as total, case when revisado=0 then 'pendiente' else 'cobrado' end as `group` FROM facturas f left join facturas_cursos fc using(id_factura) left join clientes c using (id_cliente) WHERE {filter} GROUP BY f.id_factura ORDER BY f.revisado desc, f.fecha_factura desc", /*"SELECT coalesce(id_factura, id_curso) as id, id_factura, fecha_factura, id_curso, curso, f.id_cliente, cliente, round(coalesce(subtotal,0)) as total, case when revisado=0 then 'pendiente' when id_factura is null then 'oculta' else 'cobrado' end as `group`, date_format(fecha_factura,'%Y-%m-%d') as inicio FROM (facturas f left join clientes e using (id_cliente)) left join cursos c using(id_curso) WHERE {filter} ORDER BY revisado desc, fecha_factura desc",*/

    'mundo_banderas'=> "SELECT id, pais, oficial, inicio, fin FROM mundo_banderas ORDER BY pais",


    'trabajadores'=> "SELECT *, case when nuevo<>0 then 'nuevo' when clasificacion<>0 then 'habitual' else 'antiguo' end as `group` FROM (SELECT id_trabajador as id, trabajador,apellidos, fecha_alta>subdate(curdate(),interval 1 year) as nuevo, coalesce((SELECT round(sum(duracion)) FROM cursos_clases cc WHERE fecha> subdate(curdate(),interval 2 year) and cc.id_trabajador = t.id_trabajador group by id_trabajador),0) as clasificacion FROM trabajadores t ORDER BY nuevo desc, clasificacion desc, id_trabajador) a"

  );

  public static $table = array( // DB.Table (record.js) - Tablas para mostrar cualquier tipo de consulta en DB.Table
  
    'agenda'=> "SELECT nombre, telefono, correo, referencia, class, id FROM (SELECT id_alumno id, concat(alumno,' ',coalesce(apellidos,'')) nombre, telefonos telefono, correos correo, COALESCE(cursos,'AGENDA') referencia, 'alumno' class FROM (SELECT a.*, group_concat(ac.id_curso) cursos FROM alumnos a left join alumnos_cursos ac using (id_alumno) GROUP BY alumno, apellidos, telefonos, correos) aaa UNION SELECT id_trabajador id, concat(trabajador,' ',coalesce(apellidos,'')) nombre, telefono, correo, concat(id_trabajador) referencia, 'trabajador' class FROM trabajadores t UNION SELECT cc.id_cliente id, cc.contacto nombre, cc.telefono, cc.correo, concat(c.cliente) referencia, 'cliente' class FROM clientes_contactos cc inner join clientes c using(id_cliente)) xx WHERE replace(replace(concat(coalesce(nombre,''),coalesce(telefono,''),coalesce(correo,''),coalesce(referencia,'')),' ',''),'-','') LIKE {filtro} ORDER BY class='alumno', nombre LIMIT 100",

    'cursos-alumnos'=> "SELECT id_alumno as id, alumno, apellidos, telefonos, correos FROM alumnos inner join alumnos_cursos using(id_alumno) WHERE id_curso = {id_curso} ORDER BY alumno, apellidos",

    'curso-calendario'=> "SELECT DISTINCT cc.fecha FROM cursos_clases cc WHERE cc.id_curso = {id_curso} ORDER BY cc.fecha",

    'cursos-facturas'=> "SELECT if(id_factura is null,año,'') as año, coalesce(id_factura,'') as id_factura, if(id_factura is null,'',fecha_factura) as fecha, horas, if(id_factura is null,'',precio) as precio, subtotal, iva, retencion, total, if(id_factura is null,'',estado) as estado, concat_ws(' ',case when año is null then 'total' when id_factura is null then 'subtotal' else '' end, estado) as `class` FROM (SELECT year(fecha_factura) as año, f.id_factura, f.fecha_factura, round(avg(fc.precio_hora),2) as precio, round(sum(fc.horas),2) as horas, round(sum(fc.precio_hora*fc.horas),2) as subtotal, round(sum(fc.precio_hora*fc.horas*iva),2) as iva, round(sum(fc.precio_hora*fc.horas*-retencion),2) as retencion, round(sum(fc.precio_hora*fc.horas*(1+f.iva-f.retencion)),2) as total, if(revisado,'✓ ok','✘ falta') as estado FROM facturas f inner join facturas_cursos fc using (id_factura) WHERE fc.id_curso={id_curso} GROUP BY year(fecha_factura), f.id_factura WITH ROLLUP) a",

    'cursos-trabajadores'=> "SELECT trabajador, año, elt(mes,'ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic') as mes, num_clases, horas, subtotal, case when trabajador is null and año is null and mes is null then 'total' when año is null and mes is null then 'subtotal' when mes is null then 'subsubtotal' else '' end as `class` FROM (SELECT cc.id_trabajador as trabajador, year(cc.fecha) as año, month(cc.fecha) as mes, count(distinct id_clase) as num_clases, round(sum(cc.duracion),2) as horas, round(sum(c.precio_hora*duracion),2) as subtotal FROM cursos_clases cc inner join cursos c using (id_curso) WHERE cc.id_curso = {id_curso} GROUP BY cc.id_trabajador, year(fecha), month(fecha) WITH ROLLUP) a",

    'estadistica-clientes'=> "SELECT *, case when cliente is null and año is null and mes is null then 'total' when año is null and mes is null then 'subtotal' when mes is null then 'subsubtotal' else '' end as `class` FROM (SELECT e.cliente, year(fecha) as año, month(fecha) as mes, round(sum(duracion)) as horas_total,  round(sum(precio_hora_cliente*duracion)) as importe_total, count(id_clase) as num_clases, count(distinct cc.id_curso) as num_cursos  FROM cursos_clases cc inner join cursos c using (id_curso) inner join clientes e using(id_cliente) WHERE (e.id_cliente = {customer} or '%' = {customer}) and year(fecha) like {year} and month(fecha) like {month} GROUP BY e.cliente, year(fecha), month(fecha) WITH ROLLUP) a",

    'estadistica-clases'=> "SELECT *, case when mes is null then 'total' else '' end as `class` FROM (SELECT year(fecha) as año, month(fecha) as mes, round(sum(duracion)) as horas_total,  round(sum(precio_hora_cliente*duracion)) as importe_total, round(sum(if(cc.id_trabajador in ('FCO','QUIM'),duracion,0))) as horas_proinf, round(sum(precio_hora_cliente*if(cc.id_trabajador in ('FCO','QUIM'),duracion,0))) as importe_proinf, count(id_clase) as num_clases, count(distinct cc.id_curso) as num_cursos  FROM cursos_clases cc inner join cursos c using (id_curso) WHERE year(fecha)={year} GROUP BY month(fecha) WITH ROLLUP) a",

    'estadistica-cobros'=> "SELECT if(id is null,null,vencimiento) as vencimiento, round(importe,2) as importe, round(cobrado,2) as cobrado, round(diferencia,2) as diferencia, if(id is null, null, id_factura) as id_factura, if(id is null, null, cliente) as cliente, if(id is null, 'total',estado) as `class` FROM (SELECT id, vencimiento, sum(importe) as importe, sum(cobrado) as cobrado, sum(diferencia) as diferencia, estado, id_factura, cliente FROM (SELECT concat(vencimiento,id_factura) as id, fc.vencimiento, fc.importe, fc.cobrado, fc.importe-fc.cobrado as diferencia, case when fc.importe = fc.cobrado then 'cobrado' else 'falta' end as estado, fc.id_factura, e.cliente FROM facturas_cobros fc  left join facturas f using(id_factura) left join clientes e using (id_cliente) WHERE year(fc.vencimiento) like {year} and month(fc.vencimiento) like {month} and (id_cliente = {customer} or '%' = {customer}) GROUP BY fc.vencimiento, fc.id_factura ORDER BY fc.vencimiento desc) a GROUP BY id with rollup) aa ORDER BY id is null, vencimiento desc",

    'estadistica-facturas'=> "SELECT *, case when cliente is null and año is null and mes is null then 'total' when año is null and mes is null then 'subtotal' when mes is null then 'subsubtotal' else '' end as `class` FROM (SELECT e.cliente, year(fecha_factura) as año, month(fecha_factura) as mes, round(sum(fc.horas)) as horas_total,  round(sum(fc.precio_hora*fc.horas)*(1+f.iva-f.retencion),2) as importe_total, count(id_factura_curso) as num_cursos, count(distinct f.id_factura) as num_facturas  FROM facturas_cursos fc inner join facturas f using (id_factura) inner join clientes e using(id_cliente) WHERE (e.id_cliente = {customer} or '%' = {customer}) and year(fecha_factura) like {year} and month(fecha_factura) like {month} GROUP BY e.cliente, year(fecha_factura), month(fecha_factura) WITH ROLLUP) a",

    'estadistica-trabajadores'=> "SELECT *, case when id_trabajador is null and año is null and mes is null then 'total' when año is null and mes is null then 'subtotal' when mes is null then 'subsubtotal' else '' end as `class` FROM (SELECT cc.id_trabajador, year(fecha) as año, month(fecha) as mes, round(sum(duracion)) as horas_total,  round(sum(precio_hora_cliente*duracion)) as importe_total, count(id_clase) as num_clases, count(distinct cc.id_curso) as num_cursos  FROM cursos_clases cc inner join cursos c using (id_curso) WHERE cc.id_trabajador like {worker} and year(fecha) like {year} and month(fecha) like {month} GROUP BY cc.id_trabajador, year(fecha), month(fecha) WITH ROLLUP) a",

    'festivos'=> "SELECT fecha FROM festivos WHERE fecha between {start} and {end} ORDER BY 1",

    'logins'=> "SELECT l.id,date,coalesce(host,l.ip) as ip,user,num_logins,num_errors,changes,revised FROM logins l left join ips i using (ip) ORDER BY id desc",

    'pending'=> "SELECT * FROM (SELECT id_trabajador as usuario, 'clase' as tipo, case date(fecha) when curdate() then 'hoy' when curdate()+1 then 'mañana' when curdate()+2 then 'pasado mañana' else concat_ws(' ', 'dentro de', datediff(date(fecha), curdate()), 'días') end as tiempo, date_format(hora_inicio, '%H:%i') as hora, time_format(sec_to_time(time_to_sec(hora_inicio)+(duracion*3600)), '%H:%i') as hora_fin, concat_ws(' ', id_curso, '—', id_materia, '—', num_clase, '/', total_clases) as asunto, fecha FROM cursos_clases WHERE date(fecha) >= curdate() UNION SELECT usuario, 'cita' as tipo, case date(fecha) when curdate() then 'hoy' when curdate()+1 then 'mañana' when curdate()+2 then 'pasado mañana' else concat_ws(' ','dentro de',datediff(date(fecha),curdate()),'días') end as tiempo, date_format(hora,'%H:%i') as hora, time_format(sec_to_time(time_to_sec(hora)+(duracion*3600)), '%H:%i') as hora_fin, concat_ws(' ',tema,' - ',titulo) as asunto, fecha FROM citas c WHERE date(fecha) >= curdate() ORDER BY fecha) a ORDER BY fecha LIMIT 4",

    'precios_cliente'=> "SELECT round(precio_hora_cliente,2) as precio_hora_cliente, round(precio_hora,2) as precio_hora, round(retencion,2) as retencion, round(iva,2) as iva, concat_ws('—',id_curso,curso) as ultimo_curso, count(id_curso) as num_cursos FROM cursos c WHERE id_cliente={id_cliente} GROUP BY c.precio_hora_cliente ORDER BY right(id_curso,2) desc, id_curso desc LIMIT 10"

  );

  public static $grid = array ( // DB.Grid (record.js) Las claves son nombres de tabla

    'alumnos_cursos'=> "SELECT id_alumno_curso, id_alumno, id_curso, fila, columna FROM alumnos_cursos WHERE id_alumno = {id_alumno} ORDER BY id_curso",

    'bancos'=> "SELECT id_banco, banco, cuenta_corriente, notas FROM bancos ORDER BY banco",

    'citas'=> "SELECT id_cita, date_format(fecha,'%Y-%m-%d') as fecha, date_format(hora,'%H:%i') as hora, round(duracion,2) as duracion, usuario, tema, titulo FROM citas WHERE {year} in (year(fecha),'%') and {month} in (month(fecha),'%') and {user} in (usuario,'%')  ORDER BY fecha, hora", /*"SELECT id_cita, date_format(fecha,'%Y-%m-%d') as fecha, date_format(hora,'%H:%i') as hora, round(duracion,2) as duracion, usuario, tema, titulo FROM citas WHERE year(fecha) = {year} ORDER BY fecha, hora",*/

    'clientes_contactos'=> "SELECT id_contacto, id_cliente, contacto, telefono, correo, cargo FROM clientes_contactos WHERE id_cliente = {id_cliente} ORDER BY contacto",

    'cursos_clases'=> "SELECT id_clase, num_clase, total_clases, id_curso, date_format(fecha,'%Y-%m-%d') as fecha, date_format(hora_inicio,'%H:%i') as hora_inicio, round(duracion,2) as duracion, id_materia, id_trabajador FROM cursos_clases WHERE id_curso = {id_curso} ORDER BY fecha, hora_inicio, duracion",

    'cursos_materias'=> "SELECT id_curso_materia, id_curso, id_materia, round(horas,2) as horas, fecha_inicio FROM cursos_materias WHERE id_curso = {id_curso} ORDER BY 1",

    'facturas_cobros'=> "SELECT id_cobro, id_factura, vencimiento, round(importe,2) as importe, round(cobrado,2) as cobrado FROM facturas_cobros WHERE id_factura = {id_factura} ORDER BY vencimiento",

    'facturas_cursos'=> "SELECT id_factura_curso, id_factura, id_curso, detalle, round(horas,2) as horas, round(precio_hora,2) as precio_hora, round(subtotal,2) as subtotal FROM facturas_cursos WHERE id_factura = {id_factura} ORDER BY id_curso",

    'festivos'=> "SELECT id, fecha, descripcion FROM festivos WHERE year(fecha) = {year} ORDER BY fecha",

    'formas_pago'=> "SELECT id_forma_pago, forma_pago, num_vencimientos, dia_pago, notas FROM formas_pago ORDER BY forma_pago",

    'logins'=> "SELECT id, date, ip, user, num_logins, num_errors, changes FROM logins ORDER BY id desc",
    
    'pagos'=> "SELECT id_pago, id_trabajador, fecha, round(horas,2) horas, id_curso, round(pago,2) pago, id_banco, notas FROM pagos WHERE {year} in (year(fecha),'%') and {month} in (month(fecha),'%') and {trabajador} in (id_trabajador,'%') and id_curso like concat('%',{curso},'%') and {banco} in (id_banco,'%') ORDER BY fecha desc, id_trabajador, id_curso, id_banco ",

    'poblaciones'=> "SELECT id_poblacion, poblacion, provincia FROM poblaciones ORDER BY poblacion",

    'tareas'=> "SELECT id_tarea, fecha_tarea, tarea, prioridad, acabada, id_usuario FROM tareas WHERE year(fecha_tarea)={year} and acabada={finish} ORDER BY year(fecha_tarea), prioridad, fecha_tarea"

  );

  public static $get = array ( // DB.Record (record.js)
                               // El SQL devuelve los campos de un solo registro y se filtra por {id}

    'alumnos'=> "SELECT id_alumno as id, alumno, apellidos, nif, telefonos, correos, direccion, cp, poblacion, notas FROM alumnos WHERE id_alumno = {id}",

    'citas'=> "SELECT id_cita as id, id_cita, fecha, hora, duracion, tema, titulo, usuario FROM citas WHERE id_cita = {id}",

    'cursos_clases'=> "SELECT id_clase as id, cc.id_curso, cc.num_clase, cc.total_clases, c.curso, date_format(cc.fecha,'%v') as num_semana, elt(date_format(cc.fecha,'%w'),'lunes','martes','miércoles','jueves','viernes','sábado','domingo') as dia_semana, date_format(cc.fecha,'%Y-%m-%d') as fecha, date_format(cc.hora_inicio,'%H:%i') as hora_inicio,round(cc.duracion,2) as duracion, time_format(sec_to_time(time_to_sec(cc.hora_inicio)+(cc.duracion*3600)), '%H:%i') as hora_fin, cc.id_trabajador, id_materia, sesion FROM cursos_clases cc LEFT JOIN cursos c USING (id_curso) WHERE id_clase = {id}",

    'clientes'=> "SELECT id_cliente as id, cliente, contacto, nif, correos, telefonos, web, direccion, cp, poblacion, notas, id_forma_pago, banco, cuenta_corriente FROM clientes c WHERE id_cliente = {id}",

    'cursos'=> "SELECT id_curso as id, id_curso, curso, id_cliente, id_contacto, id_trabajador, num_apuntes, date_format(fecha_inicio,'%Y-%m-%d') as fecha_inicio, date_format(fecha_fin,'%Y-%m-%d') as fecha_fin, round(total_horas,2) as total_horas, dilluns, dimarts, dimecres, dijous, divendres, dissabte, diumenge, date_format(hora_inicio,'%H:%i') as hora_inicio, date_format(hora_fin,'%H:%i') as hora_fin, round(precio_hora,2) as precio_hora, round(precio_hora_cliente,2) as precio_hora_cliente, round(retencion,2) as retencion, round(iva,2) as iva, notas FROM cursos WHERE id_curso = {id}",

    'facturas'=> "SELECT coalesce(id_factura, id_curso) as id, id_factura, revisado, date_format(fecha_factura, '%Y-%m-%d') as fecha_factura, id_cliente, id_curso, id_forma_pago, id_banco, round(horas,2) as horas, round(precio_hora,2) as precio_hora, round(subtotal,2) as subtotal, round(retencion,2) as retencion, round(iva,2) as iva, para, encabezado, detalle, pie FROM facturas WHERE coalesce(id_factura, id_curso) = {id}",

    'mundo_banderas'=> "SELECT * FROM mundo_banderas WHERE id = {id}",

    'trabajadores'=> "SELECT id_trabajador as id, id_trabajador, trabajador, apellidos, telefono, direccion, cp, id_poblacion, nif, correo, notas FROM trabajadores t WHERE id_trabajador = {id}",

    'ultimo_precio_cliente'=> "SELECT precio_hora_cliente, precio_hora, retencion, iva FROM cursos WHERE id_cliente={id} ORDER BY right(id_curso,2) desc, id_curso desc",

    'de-curso-a-factura'=> "SELECT curso as detalle, round(retencion,2) as retencion, round(iva,2) as iva, round(total_horas,2) as horas, round(precio_hora,2) as precio_hora, round(total_horas*precio_hora,2) as subtotal, notas as encabezado FROM cursos WHERE id_curso={id}"

  );

  public static $pdf = array ( // pdf.php - Para obtener registros destinados a crear un PDF

    'aula'=> "SELECT c.id_curso, concat(c.id_curso,'—',c.curso) as curso, max(fila) as filas, max(columna) as columnas FROM alumnos_cursos ac inner join cursos c using(id_curso) WHERE c.id_curso = {id}",
    'aula-alumnos'=> "SELECT alumno, apellidos, fila, columna FROM alumnos_cursos inner join alumnos using (id_alumno) WHERE id_curso = {id} ORDER BY fila, columna",

    'curso'=> "SELECT c.id_curso, concat(c.id_curso,'—',c.curso) as curso, e.cliente, concat_ws(' ', e.direccion, ',', e.cp, e.poblacion) as domicilio, concat_ws(' ',round(total_horas,2),'horas') as duracion, concat_ws(' ','De',date_format(fecha_inicio,'%e-%m-%Y'),'a',date_format(fecha_fin,'%e-%m-%Y')) as fechas, concat_ws('-',if(dilluns,'Lun',''),if(dimarts,'Mar',''),if(dimecres,'Mié',''),if(dijous,'Jue',''),if(divendres,'Vie',''),if(dissabte,'Sáb',''),if(diumenge,'Dom','')) as semana, concat_ws(' ','De',time_format(hora_inicio,'%H:%i'),'a',time_format(hora_fin,'%H:%i')/*,'—',(hora_fin-hora_inicio)/10000,'horas'*/) as horario, /*(SELECT group_concat(concat_ws('-',date_format(fecha,'%e'),elt(month(fecha),'ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic')) separator ', ') as dias FROM cursos_clases cc WHERE c.id_curso=cc.id_curso ORDER BY fecha) as dias,*/ c.notas, concat_ws(' ',t.trabajador,t.apellidos) as trabajador FROM cursos c left join clientes e using(id_cliente) left join trabajadores t using (id_trabajador) WHERE c.id_curso = {id}",

    'curso-calendario'=> "SELECT *, group_concat(if(weekday(fecha) = 0, concat_ws('-',cast(day(fecha) as char), elt(month(fecha),'ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'), if(num>1,concat('(',cast(num as char),')'),'')), '') separator '') as lun, group_concat(if(weekday(fecha) = 1, concat_ws('-',cast(day(fecha) as char), elt(month(fecha),'ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'), if(num>1,concat('(',cast(num as char),')'),'')), '') separator '') as mar, group_concat(if(weekday(fecha) = 2, concat_ws('-',cast(day(fecha) as char), elt(month(fecha),'ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'), if(num>1,concat('(',cast(num as char),')'),'')), '') separator '') as mie, group_concat(if(weekday(fecha) = 3, concat_ws('-',cast(day(fecha) as char), elt(month(fecha),'ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'), if(num>1,concat('(',cast(num as char),')'),'')), '') separator '') as jue, group_concat(if(weekday(fecha) = 4, concat_ws('-',cast(day(fecha) as char), elt(month(fecha),'ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'), if(num>1,concat('(',cast(num as char),')'),'')), '') separator '') as vie, group_concat(if(weekday(fecha) = 5, concat_ws('-',cast(day(fecha) as char), elt(month(fecha),'ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'), if(num>1,concat('(',cast(num as char),')'),'')), '') separator '') as sab, group_concat(if(weekday(fecha) = 6, concat_ws('-',cast(day(fecha) as char), elt(month(fecha),'ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'), if(num>1,concat('(',cast(num as char),')'),'')), '') separator '') as dom FROM (SELECT cc.fecha, count(*) as num, cc.id_trabajador, concat_ws(' ',t.trabajador, t.apellidos) as trabajador, week(cc.fecha,1) as sem FROM  cursos_clases cc left join trabajadores t using (id_trabajador) WHERE cc.id_curso = {id} GROUP BY cc.id_trabajador, cc.fecha) a GROUP BY id_trabajador, week(fecha,1) ORDER BY id_trabajador, fecha", /*"SELECT cc.id_trabajador, concat_ws(' ',t.trabajador, t.apellidos) as trabajador, week(cc.fecha,1) as sem, group_concat(if(weekday(cc.fecha) = 0, concat_ws('-',day(cc.fecha),elt(month(fecha),'ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic')), '') separator '') as lun, group_concat(if(weekday(cc.fecha) = 1, concat_ws('-',day(cc.fecha),elt(month(fecha),'ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic')), '') separator '') as mar, group_concat(if(weekday(cc.fecha) = 2, concat_ws('-',day(cc.fecha),elt(month(fecha),'ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic')), '') separator '') as mie, group_concat(if(weekday(cc.fecha) = 3, concat_ws('-',day(cc.fecha),elt(month(fecha),'ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic')), '') separator '') as jue, group_concat(if(weekday(cc.fecha) = 4, concat_ws('-',day(cc.fecha),elt(month(fecha),'ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic')), '') separator '') as vie, group_concat(if(weekday(cc.fecha) = 5, concat_ws('-',day(cc.fecha),elt(month(fecha),'ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic')), '') separator '') as sab, group_concat(if(weekday(cc.fecha) = 6, concat_ws('-',day(cc.fecha),elt(month(fecha),'ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic')), '') separator '') as dom FROM cursos_clases cc left join trabajadores t using (id_trabajador) WHERE cc.id_curso = {id} GROUP BY cc.id_trabajador, week(cc.fecha,1) ORDER BY cc.id_trabajador, cc.fecha",*/

    'hoja-horas'=> "SELECT concat(coalesce(cc.num_clase,'   '),' / ',coalesce(cc.total_clases,'')) as num_clase, cc.id_curso, curso, concat(elt(date_format(cc.fecha,'%w'),'lun','mar','mié','jue','vie','sáb','dom'), ', ', date_format(cc.fecha,'%d-%m-%Y')) as fecha, date_format(cc.hora_inicio,'%H:%i') as hora_inicio,  time_format(sec_to_time(time_to_sec(cc.hora_inicio)+(cc.duracion*3600)), '%H:%i') as hora_fin, round(cc.duracion,2) as duracion, cc.id_materia, e.cliente, concat_ws(' ',t.trabajador,t.apellidos) as trabajador, cc.sesion FROM cursos_clases cc left join cursos c using (id_curso) left join clientes e using (id_cliente) left join trabajadores t on cc.id_trabajador = t.id_trabajador WHERE id_clase={id}",

    'factura'=> "SELECT f.id_factura, date_format(f.fecha_factura,'%d-%m-%Y') as fecha_factura, fp.forma_pago, b.banco, b.cuenta_corriente, c.cliente, c.nif, concat_ws(' ',c.direccion,',',c.cp,c.poblacion) as direccion, round(sum(fc.precio_hora*fc.horas),2) as subtotal, round(f.retencion*100,2) as retencion, round(f.iva*100,2) as iva, round(sum(fc.precio_hora*fc.horas)*f.iva,2) as total_iva, round(sum(fc.precio_hora*fc.horas)*-f.retencion,2) as total_retencion, round(sum(fc.precio_hora*fc.horas)*(1-f.retencion+f.iva),2) as total, f.para, f.encabezado, f.pie FROM facturas f inner join facturas_cursos fc using(id_factura) left join formas_pago fp using(id_forma_pago) left join bancos b using (id_banco) left join clientes c using (id_cliente) WHERE f.id_factura={id} GROUP BY f.id_factura",  /*"SELECT f.id_factura, date_format(f.fecha_factura,'%d-%m-%Y') as fecha_factura, fp.forma_pago, b.banco, b.cuenta_corriente, f.id_curso, c.cliente, c.nif, concat_ws(' ',c.direccion,',',c.cp,c.poblacion) as direccion, round(f.horas,2) as horas, round(f.precio_hora,2) as precio_hora, round(f.subtotal,2) as subtotal, round(f.retencion*100,2) as retencion, round(f.iva*100,2) as iva, round(f.subtotal*f.iva,2) as total_iva, round(f.subtotal*f.retencion,2) as total_retencion, round(f.subtotal*(1-f.retencion+f.iva),2) as total, f.para, f.encabezado, f.detalle, f.pie FROM facturas f left join formas_pago fp using(id_forma_pago) left join bancos b using (id_banco) left join clientes c using (id_cliente) WHERE id_factura={id}"*/

    'factura-cursos'=> "SELECT id_curso, detalle, round(horas,2) as horas, round(precio_hora,2) as precio_hora, round(subtotal,2) as subtotal FROM facturas_cursos fc WHERE id_factura={id}"

  );



  // INSERT-UPDATE-DELETE =======================

  /*public static $ids = array ( // Identicadores de cada tabla --> Ver $fields
    'bancos'=> 'id_banco',
    'citas'=> 'id_cita',
    'clases'=> 'id_clase',
    'clientes'=> 'id_cliente',
    'cursos'=> 'id_curso',
    'facturas'=> 'id_factura',
    'facturas_cobros'=> 'id_cobro',
    'facturas_cursos'=> 'id_factura_curso',
    'festivos'=> 'id',
    'formas_pago'=> 'id_forma_pago',
    'materias'=> 'id_curso_materia',
    'poblaciones'=> 'id_poblacion',
    'tareas'=> 'id_tarea',
    'trabajadores'=> 'id_trabajador'
  );*/

  private static $fields = array (  // Campos a insertar o actualizar. Las claves son nombres de tabla.
    'alumnos'=> 'id_alumno alumno apellidos nif telefonos correos direccion cp poblacion notas',
    'alumnos_cursos'=> 'id_alumno_curso id_alumno id_curso fila columna',
    'bancos'=> 'id_banco banco cuenta_corriente notas',
    'citas'=> 'id_cita fecha hora duracion tema titulo usuario',
    'clientes'=> 'id_cliente cliente contacto nif correos telefonos web direccion cp poblacion id_forma_pago banco cuenta_corriente notas',
    'clientes_contactos'=> 'id_contacto id_cliente contacto telefono correo cargo',
    'cursos'=> 'id_curso curso id_cliente id_contacto id_trabajador num_apuntes fecha_inicio fecha_fin total_horas dilluns dimarts dimecres dijous divendres dissabte diumenge hora_inicio hora_fin precio_hora_cliente precio_hora retencion iva notas',
    'cursos_clases'=> 'id_clase id_curso num_clase total_clases fecha hora_inicio duracion id_trabajador id_materia sesion',
    'cursos_materias'=> 'id_curso_materia id_curso id_materia horas fecha_inicio',
    'facturas'=> 'id_factura revisado fecha_factura id_cliente id_curso id_forma_pago id_banco horas precio_hora subtotal retencion iva para encabezado detalle pie',
    'facturas_cobros'=> 'id_cobro id_factura vencimiento importe cobrado',
    'facturas_cursos'=> 'id_factura_curso id_factura id_curso detalle horas precio_hora subtotal',
    'festivos'=> 'id fecha descripcion',
    'formas_pago'=> 'id_forma_pago forma_pago num_vencimientos dia_pago notas',
    'logins'=> 'id date ip user time_begin time_end num_logins num_errors changes',
    'mundo_banderas'=>'id pais inicio fin oficial country tipo capital moneda continente idiomas gobierno poblacion extension code0 code2 bandera gentilicio notas',
    'pagos'=>'id_pago id_trabajador fecha horas id_curso pago id_banco notas',
    'poblaciones'=> 'id_poblacion poblacion provincia',
    'tareas'=> 'id_tarea fecha_tarea tarea prioridad acabada id_usuario',
    'trabajadores'=> 'id_trabajador nif trabajador apellidos telefono correo direccion cp id_poblacion notas'
  );

  private static $fields_insert = array ( // Campos que siempre se han de insertar
    'clientes'=> 'fecha_alta fecha_creacion',
    'cursos'=> 'fecha_creacion',
    'facturas'=> 'fecha_creacion',
    'trabajadores'=> 'fecha_alta fecha_creacion',
    'alumnos'=> 'fecha_alta'
  );

  private static $last_insert_id = array ( // Forma de averiguar el último registro insertado cuando el campo 'id' no es el campo AUTO_INCREMENT (El campo 'num_' sí lo es)
    'cursos'=> "SELECT id_curso FROM cursos WHERE num_curso = last_insert_id()", //"SELECT id_curso FROM cursos ORDER BY fecha_creacion desc LIMIT 1",
    'facturas'=> "SELECT id_factura FROM facturas WHERE num_factura = last_insert_id()", //"SELECT id_factura FROM facturas ORDER BY fecha_creacion desc LIMIT 1",
    'trabajadores'=> "SELECT id_trabajador FROM trabajadores WHERE num_trabajador = last_insert_id()" //"SELECT id_trabajador FROM trabajadores ORDER BY fecha_creacion desc LIMIT 1"
  );

  /*public static $plural = array(
    'clase'=>'clases',
    'cliente'=>'clientes',
    'curso'=>'cursos',
    'factura'=>'facturas',
    'trabajador'=>'trabajadores',
  );*/

  /*public static function getSelect($table, $ids) {
    // En este módulo no se especifica el valor de los filtros así que esta función no es pertinente
    // No funcionaría con valores string para id (ver db.php)
    $fields = SQL::$fields[$table];
    if ($fields == null) return null;
    $list = explode(' ',$fields);
    $idfield = $list[0];

    $columns = implode(', ',$list);
    $ids = is_array($ids)? implode(',',$ids): $ids;
    $sql = "SELECT $columns FROM $table WHERE $idfield IN ($ids)";
    // A TENER EN CUENTA: El orden de los registros obtenidos seguramente no coincidirá con el orden de los valores id

    return $sql;
  }*/

  public static function getIdField($table) {
    $fields = SQL::$fields[$table];
    if ($fields == null) return null;
    $list = explode(' ',$fields);
    return $list[0];
  }

  public static function getLastInsertId($table) {
    $sql = SQL::$last_insert_id[$table];
    if ($sql == null) $sql = "SELECT last_insert_id()";
    return $sql;
  }

  public static function getInsert($table, $assoc=null) {
    $fields = SQL::$fields[$table];
    if ($fields == null) return null;
    $list = explode(' ',$fields);

    if (is_array($assoc)) $list = array_intersect($list, array_keys($assoc));

    $fields_insert = SQL::$fields_insert[$table];
    if ($fields_insert != null) $list = array_merge($list, explode(' ',$fields_insert));

    if (count($list) == 0) return null;

    $columns = implode(', ',$list);
    $values = '{' . implode('}, {',$list) . '}';
    $sql = "INSERT INTO $table ($columns) VALUES ($values)";

    $sql = str_replace('{fecha_alta}', SQL::current_date(), $sql);
    $sql = str_replace('{fecha_creacion}', SQL::current_datetime(), $sql);

    return $sql;
  }

  public static function getUpdate($table, $assoc=null) {
    $fields = SQL::$fields[$table];
    if ($fields == null) return null;
    $list = explode(' ',$fields);
    $idfield = $list[0];

    if (is_array($assoc)) $list = array_intersect($list, array_keys($assoc));

    if (count($list) == 0) return null;

    /*$idfield = SQL::$ids[$table];
    if ($idfield == null) return null;*/

    $list = array_map("SQL::update_pair", $list);
    $pairs = implode(', ',$list);

    $sql = "UPDATE $table SET $pairs WHERE $idfield = {id}";

    return $sql;
  }

  public static function getDelete($table) {
    /*$id = SQL::$ids[$table];
    if ($id == null) return null;*/

    $idfield = SQL::getIdField($table);
    if ($idfield == null) return null;

    $sql = "DELETE FROM $table WHERE $idfield = {id}";

    return $sql;
  }

  // pagination -----------------------------------

  public static function getPage($sql, $num_page, $page_size) {
    $start = ($num_page - 1) * $page_size;
    return "$sql LIMIT $start, $page_size";
  }

  public static function getTotalPages($table, $page_size) {
    return "SELECT ceil(count(*)/$page_size) as total_pages FROM $table";
  }

  // Utilities ----------------------------------

  private static function update_pair($field) {
    return $field . ' = {' . $field . '}';
  }

  private static function interslashes($value) {
    return "'$value'";
  }

  private static function current_datetime() {
    date_default_timezone_set('Europe/Madrid'); // GMT
    return SQL::interslashes(date('Y-m-d H:i:s'));
  }

  private static function current_date() {
    date_default_timezone_set('Europe/Madrid'); // GMT
    return SQL::interslashes(date('Y-m-d'));
  }


} // SQL

/* ============================================== */

/*---
// TEST:
  $assoc = array('id_curso'=>'ABC-01-09', 'curso'=>'En un lugar', 'dilluns'=>true,'noexiste'=>'loquesea');

  $sql = SQL::getInsert('cursos',$assoc); echo "<b>insert cursos</b>=$sql<br>"; // INSERT INTO cursos (id_curso, curso, dilluns, fecha_creacion) VALUES ({id_curso}, {curso}, {dilluns}, '2009-08-24 17:35:16')
  $sql = SQL::getUpdate('cursos',$assoc); echo "<b>update cursos</b>=$sql<br>"; // UPDATE cursos SET id_curso = {id_curso}, curso = {curso}, dilluns = {dilluns} WHERE id_curso = {id}
  $sql = SQL::getDelete('cursos'); echo "<b>delete cursos</b>=$sql<br>"; // DELETE cursos WHERE id_curso = {id}

---*/

?>
