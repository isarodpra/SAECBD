import sqlite3
import xml.etree.ElementTree as ET

from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel

app = FastAPI(title="API de mi negocio")

BD = "negocio.db"


def conectar():
    conexion = sqlite3.connect(BD)
    conexion.row_factory = sqlite3.Row
    return conexion


def preparar_bd():
    conexion = conectar()
    # CAMBIO 1: la tabla y sus columnas (¡CORREGIDO!)
    conexion.execute("""
        CREATE TABLE IF NOT EXISTS paciente (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            telefono TEXT NOT NULL,
            edad INTEGER NOT NULL
        )
    """)
    total = conexion.execute("SELECT COUNT(*) FROM paciente").fetchone()[0]
    if total == 0:
        # CAMBIO 2: los datos de ejemplo
        conexion.executemany(
            "INSERT INTO paciente (nombre, telefono, edad) VALUES (?, ?, ?)",
            [
                ("Ana López", "5512345678", 34),
                ("Luis Pérez", "5587654321", 51),
                ("María Ruiz", "5511122233", 27),
            ],
        )
    conexion.commit()
    conexion.close()


preparar_bd()


# CAMBIO 3: los datos que se piden al crear o actualizar
class DatosPaciente(BaseModel):
    nombre: str
    telefono: str
    edad: int


@app.get("/")
def inicio():
    return {"mensaje": "La API de mi negocio funciona"}


# R de CRUD (leer todos)
@app.get("/pacientes")
def listar_pacientes():
    conexion = conectar()
    # CAMBIO 4: las columnas del SELECT
    filas = conexion.execute(
            "SELECT id, nombre, telefono, edad FROM paciente"
    ).fetchall()
    conexion.close()
    return [dict(fila) for fila in filas]


# R de CRUD (leer uno)
@app.get("/pacientes/{paciente_id}")
def obtener_paciente(paciente_id: int):
    conexion = conectar()
    # CAMBIO 4: las columnas del SELECT
    fila = conexion.execute(
        "SELECT id, nombre, telefono, edad FROM paciente WHERE id = ?",
        (paciente_id,),
    ).fetchone()
    conexion.close()
    if fila is None:
        raise HTTPException(status_code=404, detail="No encontrado")
    return dict(fila)


# C de CRUD (crear)
@app.post("/pacientes", status_code=201)
def crear_paciente(datos: Datospaciente):
    conexion = conectar()
    # CAMBIO 5: columnas y valores del INSERT
    cursor = conexion.execute(
        "INSERT INTO paciente (nombre, telefono, edad) VALUES (?, ?, ?)",
        (datos.nombre, datos.telefono, datos.edad),
    )
    conexion.commit()
    nuevo_id = cursor.lastrowid
    conexion.close()
    return {"id": nuevo_id, **datos.model_dump()}


# U de CRUD (actualizar)
@app.put("/pacientes/{paciente_id}")
def actualizar_paciente(paciente_id: int, datos: Datospaciente):
    conexion = conectar()
    # CAMBIO 6: columnas y valores del UPDATE
    cursor = conexion.execute(
        "UPDATE paciente SET nombre = ?, telefono = ?, edad = ? WHERE id = ?",
        (datos.nombre, datos.telefono, datos.edad, paciente_id),
    )
    conexion.commit()
    cambiadas = cursor.rowcount
    conexion.close()
    if cambiadas == 0:
        raise HTTPException(status_code=404, detail="No encontrado")
    return {"id": paciente_id, **datos.model_dump()}


# D de CRUD (eliminar)
@app.delete("/pacientes/{paciente_id}")
def eliminar_paciente(paciente_id: int):
    conexion = conectar()
    cursor = conexion.execute("DELETE FROM paciente WHERE id = ?", (paciente_id,))
    conexion.commit()
    borradas = cursor.rowcount
    conexion.close()
    if borradas == 0:
        raise HTTPException(status_code=404, detail="No encontrado")
    return {"mensaje": f"Registro {paciente_id} eliminado"}


# Reto: la misma lista, pero en XML
@app.get("/pacientes-xml")
def listar_pacientes_xml():
    conexion = conectar()
    filas = conexion.execute("SELECT * FROM paciente").fetchall()
    conexion.close()
    raiz = ET.Element("pacientes")
    for fila in filas:
        registro = ET.SubElement(raiz, "paciente")
        for columna in fila.keys():
            ET.SubElement(registro, columna).text = str(fila[columna])
    xml_texto = ET.tostring(raiz, encoding="unicode")
    return Response(content=xml_texto, media_type="application/xml")