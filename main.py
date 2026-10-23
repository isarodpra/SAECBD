import os
import psycopg
from psycopg.rows import dict_row
from fastapi import FastAPI, HTTPException

app = FastAPI(title="API de mi equipo - Sistema de Biblioteca")
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL and os.path.exists(".env"):
    with open(".env") as f:
        for line in f:
            line = line.strip()
            if line.startswith("DATABASE_URL="):
                DATABASE_URL = line.split("=", 1)[1].strip("\"'")

if not DATABASE_URL:
    raise RuntimeError("❌ ERROR: DATABASE_URL no está definida en el entorno ni en .env")


@app.get("/salud")
def salud():
    """Verifica la conectividad con Supabase ejecutando SELECT 1"""
    with psycopg.connect(DATABASE_URL) as conn:
        conn.execute("SELECT 1")
    return {"estado": "ok"}


@app.get("/usuarios")
def listar_usuarios(limite: int = 20):
    """Lista usuarios con límite parametrizado (%s)"""
    with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
        filas = conn.execute(
            "SELECT id_usuario, nombre, correo, telefono, tipo_usuario FROM usuarios ORDER BY id_usuario LIMIT %s",
            (limite,),
        ).fetchall()
    return filas


@app.get("/usuarios/{id_usuario}")
def obtener_usuario(id_usuario: int):
    """
    Obtiene un usuario por su llave primaria id_usuario.
    - Si id_usuario no es entero, FastAPI devuelve 422 antes de llegar a la BD.
    - Si no existe en la base de datos, devuelve 404.
    """
    with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
        fila = conn.execute(
            "SELECT id_usuario, nombre, correo, telefono, tipo_usuario FROM usuarios WHERE id_usuario = %s",
            (id_usuario,),
        ).fetchone()
    if fila is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return fila


@app.get("/libros")
def listar_libros(limite: int = 20):
    """Lista libros con límite parametrizado (%s)"""
    with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
        filas = conn.execute(
            "SELECT isbn, titulo, autor, editorial, anio_publicacion FROM libros ORDER BY isbn LIMIT %s",
            (limite,),
        ).fetchall()
    return filas


@app.get("/libros/{isbn}")
def obtener_libro(isbn: str):
    """Obtiene un libro por su ISBN con parámetro (%s)"""
    with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
        fila = conn.execute(
            "SELECT isbn, titulo, autor, editorial, anio_publicacion FROM libros WHERE isbn = %s",
            (isbn,),
        ).fetchone()
    if fila is None:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return fila
