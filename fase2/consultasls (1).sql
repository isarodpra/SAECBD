-- Práctica: Consultas SQL y Reportes
-- Alumno: Luis Javier Pérez Juárez
-- Materia: Sistemas de Bases de Datos

-- 1. Consulta para ver el gasto total de los usuarios
SELECT usuario_id, SUM(monto_gasto) AS gasto_total
FROM gastos_usuarios
GROUP BY usuario_id;

-- 2. Consulta para obtener los préstamos mensuales activos
SELECT * FROM prestamos
WHERE MONTH(fecha_prestamo) = MONTH(CURRENT_DATE())
  AND estado = 'activo';

-- 3. Consulta general de control de la línea base
SELECT * FROM bitacora_cambios;