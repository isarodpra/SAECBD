-- Primero las tablas que no dependen de otras
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

--Ajustes que se hicieron para concluir con la actividad, el sql de abajo se descargo directo de superbase
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.libros (
  isbn character varying NOT NULL,
  titulo character varying NOT NULL,
  autor character varying NOT NULL,
  editorial character varying,
  anio_publicacion integer,
  CONSTRAINT libros_pkey PRIMARY KEY (isbn)
);
CREATE TABLE public.usuarios (
  id_usuario integer NOT NULL,
  nombre character varying NOT NULL,
  telefono character varying,
  tipo_usuario character varying,
  contrasena character varying NOT NULL,
  correo character varying NOT NULL UNIQUE,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario)
);
CREATE TABLE public.ejemplares (
  id_ejemplar integer NOT NULL,
  ubicacion_fisica character varying,
  estado character varying,
  isbn character varying NOT NULL,
  CONSTRAINT ejemplares_pkey PRIMARY KEY (id_ejemplar),
  CONSTRAINT ejemplares_isbn_fkey FOREIGN KEY (isbn) REFERENCES public.libros(isbn)
);
CREATE TABLE public.prestamos (
  id_prestamo integer NOT NULL,
  fecha_prestamo date NOT NULL,
  fecha_reserva date,
  fecha_devolucion date,
  monto numeric CHECK (monto >= 0::numeric),
  estatus character varying,
  id_usuario integer NOT NULL,
  id_ejemplar integer NOT NULL,
  CONSTRAINT prestamos_pkey PRIMARY KEY (id_prestamo),
  CONSTRAINT prestamos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario),
  CONSTRAINT prestamos_id_ejemplar_fkey FOREIGN KEY (id_ejemplar) REFERENCES public.ejemplares(id_ejemplar)
);