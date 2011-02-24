INSERT INTO citas (fecha, hora, duracion, tema, titulo, usuario) VALUES ('2011-02-22', '10:00', '4', 'Reunión', 'Importante', 'QUIM'); -- 2011-02-22 21:15:55 — 84.78.184.185 — acme
INSERT INTO pagos (id_trabajador, fecha, horas, id_curso, pago, id_banco, notas) VALUES ('QUIM', '2011-02-22', '10', 'C-01-11', '200', '1', 'Mercadotecnia'); -- 2011-02-22 21:16:56 — 84.78.184.185 — acme
UPDATE pagos SET notas = 'Asistencia técnica' WHERE id_pago = '1'; -- 2011-02-22 21:17:14 — 84.78.184.185 — acme
UPDATE facturas_cobros SET importe = '700' WHERE id_cobro = '2064742485'; -- 2011-02-22 21:18:50 — 84.78.184.185 — acme
INSERT INTO facturas_cobros (id_factura, vencimiento, importe, cobrado) VALUES ('D00001-11', '2011-03-30', '1000', '0'); -- 2011-02-22 21:19:09 — 84.78.184.185 — acme
UPDATE trabajadores SET correo = 'fco@proinf.net', notas = 'Programador' WHERE id_trabajador = 'FCO'; -- 2011-02-22 21:20:22 — 84.78.184.185 — acme
UPDATE trabajadores SET notas = 'quimet22@hotmail.com' WHERE id_trabajador = 'QUIM'; -- 2011-02-22 21:20:36 — 84.78.184.185 — acme
UPDATE trabajadores SET direccion = 'Paseo Montjuic, 32, 3º 1ª' WHERE id_trabajador = 'FCO'; -- 2011-02-22 21:20:45 — 84.78.184.185 — acme
UPDATE trabajadores SET notas = 'Casa padres: 93-717-87-87' WHERE id_trabajador = 'NANDO'; -- 2011-02-22 21:21:03 — 84.78.184.185 — acme
