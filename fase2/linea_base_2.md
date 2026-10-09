EXPLAIN (ANALYZE, BUFFERS)
SELECT p.id_prestamo, p.fecha_prestamo, p.fecha_devolucion, l.titulo
FROM prestamos p
JOIN ejemplares e ON e.id_ejemplar = p.id_ejemplar
JOIN libros l ON l.isbn = e.isbn
WHERE p.id_usuario = 42;
--------------------------------------------------------------------------------------------------------------------------
| QUERY PLAN                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Nested Loop  (cost=2.15..59.38 rows=28 width=22) (actual time=5.161..8.812 rows=30 loops=1)                                                      |
|   Buffers: shared hit=206 read=2                                                                                                                 |
|   ->  Nested Loop  (cost=1.88..50.76 rows=28 width=19) (actual time=3.902..6.116 rows=30 loops=1)                                                |
|         Buffers: shared hit=116 read=2                                                                                                           |
|         ->  Bitmap Heap Scan on prestamos p  (cost=1.60..29.37 rows=28 width=16) (actual time=3.871..4.627 rows=30 loops=1)                      |
|               Recheck Cond: (id_usuario = 42)                                                                                                    |
|               Heap Blocks: exact=26                                                                                                              |
|               Buffers: shared hit=26 read=2                                                                                                      |
|               ->  Bitmap Index Scan on prestamos_usuario_fecha_idx  (cost=0.00..1.59 rows=28 width=0) (actual time=3.805..3.805 rows=30 loops=1) |
|                     Index Cond: (id_usuario = 42)                                                                                                |
|                     Buffers: shared read=2                                                                                                       |
|         ->  Index Scan using ejemplares_pkey on ejemplares e  (cost=0.28..0.76 rows=1 width=11) (actual time=0.048..0.048 rows=1 loops=30)       |
|               Index Cond: (id_ejemplar = p.id_ejemplar)                                                                                          |
|               Buffers: shared hit=90                                                                                                             |
|   ->  Index Scan using libros_pkey on libros l  (cost=0.28..0.31 rows=1 width=17) (actual time=0.089..0.089 rows=1 loops=30)                     |
|         Index Cond: ((isbn)::text = (e.isbn)::text)                                                                                              |
|         Buffers: shared hit=90                                                                                                                   |
| Planning:                                                                                                                                        |
|   Buffers: shared hit=416 read=11                                                                                                                |
| Planning Time: 30.476 ms                                                                                                                         |
| Execution Time: 9.014 ms                                                                                                                         |
----------------------------------------------------------------------------


SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY 1,2;


| tablename  | indexname                    | indexdef                                                                                                   |
| ---------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| ejemplares | ejemplares_isbn_idx          | CREATE INDEX ejemplares_isbn_idx ON public.ejemplares USING btree (isbn)                                   |
| ejemplares | ejemplares_pkey              | CREATE UNIQUE INDEX ejemplares_pkey ON public.ejemplares USING btree (id_ejemplar)                         |
| libros     | libros_pkey                  | CREATE UNIQUE INDEX libros_pkey ON public.libros USING btree (isbn)                                        |
| prestamos  | prestamos_fecha_prestamo_idx | CREATE INDEX prestamos_fecha_prestamo_idx ON public.prestamos USING btree (fecha_prestamo)                 |
| prestamos  | prestamos_id_ejemplar_idx    | CREATE INDEX prestamos_id_ejemplar_idx ON public.prestamos USING btree (id_ejemplar)                       |
| prestamos  | prestamos_id_usuario_idx     | CREATE INDEX prestamos_id_usuario_idx ON public.prestamos USING btree (id_usuario)                         |
| prestamos  | prestamos_pkey               | CREATE UNIQUE INDEX prestamos_pkey ON public.prestamos USING btree (id_prestamo)                           |
| prestamos  | prestamos_usuario_fecha_idx  | CREATE INDEX prestamos_usuario_fecha_idx ON public.prestamos USING btree (id_usuario, fecha_prestamo DESC) |
| usuarios   | usuarios_correo_key          | CREATE UNIQUE INDEX usuarios_correo_key ON public.usuarios USING btree (correo)                            |
| usuarios   | usuarios_pkey                | CREATE UNIQUE INDEX usuarios_pkey ON public.usuarios USING btree (id_usuario)                              |


SELECT count(*) FROM prestamos
WHERE date_trunc('month', fecha_prestamo) = DATE '2026-03-01';

| count |
| ----- |
| 1237  |

SELECT date_trunc('month', fecha_prestamo) AS mes, count(*) AS total
FROM prestamos
GROUP BY 1
ORDER BY 1;


| mes                    | total |
| ---------------------- | ----- |
| 2025-10-01 00:00:00+00 | 1231  |
| 2025-11-01 00:00:00+00 | 1276  |
| 2025-12-01 00:00:00+00 | 1280  |
| 2026-01-01 00:00:00+00 | 1269  |
| 2026-02-01 00:00:00+00 | 1157  |
| 2026-03-01 00:00:00+00 | 1237  |
| 2026-04-01 00:00:00+00 | 1248  |
| 2026-05-01 00:00:00+00 | 1254  |
| 2026-06-01 00:00:00+00 | 1216  |
| 2026-07-01 00:00:00+00 | 1322  |
| 2026-08-01 00:00:00+00 | 1305  |
| 2026-09-01 00:00:00+00 | 1204  |
| 2026-10-01 00:00:00+00 | 1     |


SELECT relname AS tabla,
       indexrelname AS indice,
       idx_scan AS veces_usado,
       pg_size_pretty(pg_relation_size(indexrelid)) AS tamano_indice,
       pg_size_pretty(pg_relation_size(relid)) AS tamano_tabla
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY 1, 2;

| tabla      | indice                       | veces_usado | tamano_indice | tamano_tabla |
| ---------- | ---------------------------- | ----------- | ------------- | ------------ |
| ejemplares | ejemplares_isbn_idx          | 2           | 40 kB         | 56 kB        |
| ejemplares | ejemplares_pkey              | 30147       | 40 kB         | 56 kB        |
| libros     | libros_pkey                  | 3145        | 48 kB         | 64 kB        |
| prestamos  | prestamos_fecha_prestamo_idx | 2           | 128 kB        | 1000 kB      |
| prestamos  | prestamos_id_ejemplar_idx    | 2           | 144 kB        | 1000 kB      |
| prestamos  | prestamos_id_usuario_idx     | 0           | 128 kB        | 1000 kB      |
| prestamos  | prestamos_pkey               | 1           | 344 kB        | 1000 kB      |
| prestamos  | prestamos_usuario_fecha_idx  | 1           | 344 kB        | 1000 kB      |
| usuarios   | usuarios_correo_key          | 0           | 56 kB         | 40 kB        |
| usuarios   | usuarios_pkey                | 30084       | 32 kB         | 40 kB        |


Índice 1
-- C1 isarodpra
                                                                                                                      |
CREATE INDEX IF NOT EXISTS prestamos_id_usuario_idx ON public.prestamos (id_usuario); 

DROP INDEX IF EXISTS prestamos_id_usuario_idx;

ANALYZE prestamos;

EXPLAIN (ANALYZE, BUFFERS)
SELECT p.id_prestamo, p.fecha_prestamo, p.fecha_devolucion, l.titulo
FROM prestamos p
JOIN ejemplares e ON e.id_ejemplar = p.id_ejemplar
JOIN libros l ON l.isbn = e.isbn
WHERE p.id_usuario = 42;



Índice 2

-- C3 ZackDream
DROP INDEX IF EXISTS prestamos_id_ejemplar_idx;
ANALYZE prestamos;

SELECT id_ejemplar FROM prestamos LIMIT 5;

EXPLAIN (ANALYZE, BUFFERS)
SELECT id_prestamo, fecha_prestamo, fecha_devolucion, estatus
FROM prestamos
WHERE id_ejemplar = 123; -- Reemplaza 123 por un id real

CREATE INDEX IF NOT EXISTS prestamos_id_ejemplar_idx
ON public.prestamos (id_ejemplar);


ANALYZE prestamos;

EXPLAIN (ANALYZE, BUFFERS)
SELECT id_prestamo, fecha_prestamo, fecha_devolucion, estatus
FROM prestamos
WHERE id_ejemplar = 123;


Índice 3

Índice 4

Parte 3
-- isarodpra

CREATE INDEX IF NOT EXISTS prestamos_fecha_prestamo_idx
ON public.prestamos (fecha_prestamo);
ANALYZE prestamos;

EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*) AS total
FROM prestamos
WHERE date_trunc('month', fecha_prestamo) = DATE '2026-03-01';

EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*) AS total
FROM prestamos
WHERE fecha_prestamo >= DATE '2026-03-01'
  AND fecha_prestamo <  DATE '2026-04-01';

Parte 4

SELECT relname AS tabla,
       indexrelname AS indice,
       idx_scan AS veces_usado,
       pg_size_pretty(pg_relation_size(indexrelid)) AS tamano_indice,
       pg_size_pretty(pg_relation_size(relid)) AS tamano_tabla
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY 1, 2;

| tabla      | indice                       | veces_usado | tamano_indice | tamano_tabla |
| ---------- | ---------------------------- | ----------- | ------------- | ------------ |
| ejemplares | ejemplares_isbn_idx          | 1           | 40 kB         | 56 kB        |
| ejemplares | ejemplares_pkey              | 30243       | 40 kB         | 56 kB        |
| libros     | libros_pkey                  | 3241        | 48 kB         | 64 kB        |
| prestamos  | prestamos_fecha_prestamo_idx | 6           | 128 kB        | 1000 kB      |
| prestamos  | prestamos_id_ejemplar_idx    | 1           | 144 kB        | 1000 kB      |
| prestamos  | prestamos_id_usuario_idx     | 1           | 128 kB        | 1000 kB      |
| prestamos  | prestamos_pkey               | 1           | 344 kB        | 1000 kB      |
| prestamos  | prestamos_usuario_fecha_idx  | 4           | 344 kB        | 1000 kB      |
| usuarios   | usuarios_correo_key          | 0           | 56 kB         | 40 kB        |
| usuarios   | usuarios_pkey                | 30084       | 32 kB         | 40 kB        |

