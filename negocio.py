import os
import xml.etree.ElementTree as ET
import psycopg
from psycopg.rows import dict_row
from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel
from dotenv import load_dotenv


load_dotenv()

app = FastAPI(title="API de mi negocio - Biblioteca")

def conectar():
    # Conexión a PostgreSQL usando la URL de Supabase
    return psycopg.connect(os.getenv("DATABASE_URL"), row_factory=dict_row)

class DatosLibro(BaseModel):
    isbn: str
    titulo: str
    autor: str
    editorial: str | None = None
    anio_publicacion: int | None = None

@app.get("/")
def inicio():
    return {"mensaje": "La API de la biblioteca funciona"}

# R de CRUD (leer todos)
@app.get("/libros")
def listar_libros():
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            # CAMBIO 4: columnas del SELECT
            cursor.execute("SELECT isbn, titulo, autor, editorial, anio_publicacion FROM libros")
            return cursor.fetchall()

# R de CRUD (leer uno)
@app.get("/libros/{isbn}")
def obtener_libro(isbn: str):
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            cursor.execute(
                "SELECT isbn, titulo, autor, editorial, anio_publicacion FROM libros WHERE isbn = %s",
                (isbn,)
            )
            fila = cursor.fetchone()
            if fila is None:
                raise HTTPException(status_code=404, detail="Libro no encontrado")
            return fila

# C de CRUD (crear)
@app.post("/libros", status_code=201)
def crear_libro(libro: DatosLibro):
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            try:
                # CAMBIO 5: columnas y valores del INSERT (usamos %s en Postgres)
                cursor.execute(
                    "INSERT INTO libros (isbn, titulo, autor, editorial, anio_publicacion) VALUES (%s, %s, %s, %s, %s)",
                    (libro.isbn, libro.titulo, libro.autor, libro.editorial, libro.anio_publicacion)
                )
                conexion.commit()
                return libro.model_dump()
            except psycopg.errors.UniqueViolation:
                conexion.rollback()
                raise HTTPException(status_code=400, detail="El ISBN ya existe en la base de datos")

# U de CRUD (actualizar)
@app.put("/libros/{isbn}")
def actualizar_libro(isbn: str, libro: DatosLibro):
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            # CAMBIO 6: UPDATE
            cursor.execute(
                "UPDATE libros SET titulo = %s, autor = %s, editorial = %s, anio_publicacion = %s WHERE isbn = %s",
                (libro.titulo, libro.autor, libro.editorial, libro.anio_publicacion, isbn)
            )
            conexion.commit()
            cambiadas = cursor.rowcount
            if cambiadas == 0:
                raise HTTPException(status_code=404, detail="Libro no encontrado")
            return {"isbn": isbn, **libro.model_dump()}

# D de CRUD (eliminar)
@app.delete("/libros/{isbn}")
def eliminar_libro(isbn: str):
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            cursor.execute("DELETE FROM libros WHERE isbn = %s", (isbn,))
            conexion.commit()
            borradas = cursor.rowcount
            if borradas == 0:
                raise HTTPException(status_code=404, detail="Libro no encontrado")
            return {"mensaje": f"Libro con ISBN {isbn} eliminado"}

# Reto: la misma lista, pero en XML
@app.get("/libros-xml")
def listar_libros_xml():
    with conectar() as conexion:
        with conexion.cursor() as cursor:
            cursor.execute("SELECT * FROM libros")
            filas = cursor.fetchall()
            
    raiz = ET.Element("libros")
    for fila in filas:
        registro = ET.SubElement(raiz, "libro")
        for columna, valor in fila.items():
            # Manejo de nulos: si es None, lo convierte a texto vacío
            texto = str(valor) if valor is not None else ""
            ET.SubElement(registro, columna).text = texto
            
    xml_texto = ET.tostring(raiz, encoding="unicode")
    return Response(content=xml_texto, media_type="application/xml")

#python -m uvicorn negocio:app --reload