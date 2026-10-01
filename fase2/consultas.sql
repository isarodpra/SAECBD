--Parte 0

SELECT table_name AS tabla,
  (xpath('/row/c/text()',
    query_to_xml(format('SELECT count(*) AS c FROM %I.%I',
      table_schema, table_name), false, true, '')))[1]::text::int AS filas
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY 1;

--Parte 2


/* C1       isarodpra
¿Qué préstamos se han hecho, con el nombre del usuario, el título del libro y la ubicación
física del ejemplar? El bibliotecario necesita esta información para localizar físicamente un libro prestado.
*/
SELECT u.nombre AS usuario, l.titulo AS libro, e.ubicacion_fisica, p.fecha_prestamo
FROM prestamos p
JOIN usuarios u   ON u.id_usuario = p.id_usuario
JOIN ejemplares e ON e.id_ejemplar = p.id_ejemplar
JOIN libros l     ON l.isbn = e.isbn
LIMIT 10;


/*C5    isarodpra
¿Qué usuarios tienen al menos un préstamo con monto mayor a 90? El administrador quiere identificar clientes
con historial de préstamos caros para ofrecerles un plan especial.
*/
SELECT u.id_usuario, u.nombre, u.correo
FROM usuarios u
WHERE EXISTS (
  SELECT 1 FROM prestamos p
  WHERE p.id_usuario = u.id_usuario AND p.monto > 90
);

/*
Parte 3
Consulta 1 C7
*/
EXPLAIN ANALYZE
SELECT date_trunc('month', fecha_prestamo) AS mes,
       count(*) AS num_prestamos,
       sum(monto) AS monto_total
FROM prestamos
GROUP BY 1
ORDER BY 1;

--Consulta 2 C4

EXPLAIN ANALYZE
SELECT id_prestamo, fecha_prestamo, monto
FROM prestamos
WHERE monto > (SELECT avg(monto) FROM prestamos)
ORDER BY monto DESC
LIMIT 30;