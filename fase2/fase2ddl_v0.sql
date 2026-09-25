-- Esqueleto del esquema logico --

CREATE TABLE libros (
  isbn              VARCHAR(20)  PRIMARY KEY,
  titulo            VARCHAR(200) NOT NULL,
  autor             VARCHAR(150) NOT NULL,
  editorial         VARCHAR(100),
  anio_publicacion  INTEGER
);

CREATE TABLE usuarios (
  id_usuario    INTEGER      PRIMARY KEY,
  nombre        VARCHAR(150) NOT NULL,
  telefono      VARCHAR(20),
  tipo_usuario  VARCHAR(20),
  contrasena    VARCHAR(50)  NOT NULL,
  correo        VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE ejemplares (
  id_ejemplar       INTEGER      PRIMARY KEY,
  ubicacion_fisica  VARCHAR(100),
  estado            VARCHAR(20),
  isbn              VARCHAR(20)  NOT NULL REFERENCES libros(isbn)
  -- , UNIQUE (isbn)  -- descomentar si LIBROS–EJEMPLARES es 1:1
);

CREATE TABLE prestamos (
  id_prestamo       INTEGER      PRIMARY KEY,
  fecha_prestamo    DATE         NOT NULL,
  fecha_reserva     DATE,
  fecha_devolucion  DATE,
  monto             NUMERIC(10,2),
  estatus           VARCHAR(20),
  id_usuario        INTEGER      NOT NULL REFERENCES usuarios(id_usuario),
  id_ejemplar       INTEGER      NOT NULL REFERENCES ejemplares(id_ejemplar)
);

--Failed to run sql query: ERROR:  23503: insert or update on table "prestamos" violates foreign key constraint "prestamos_id_usuario_fkey"
--DETAIL:  Key (id_usuario)=(999) is not present in table "usuarios".


-- Aqui se añade un comentario para la practica de hoy

