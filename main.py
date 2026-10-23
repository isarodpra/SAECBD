import os
import psycopg
from psycopg.rows import dict_row
from fastapi import FastAPI, HTTPException

app = FastAPI(title="API de mi equipo")
DATABASE_URL = os.environ["DATABASE_URL"]


@app.get("/salud")
def salud():
    with psycopg.connect(DATABASE_URL) as conn:
        conn.execute("SELECT 1")
    return {"estado": "ok"}


@app.get("/peliculas")
def listar_peliculas(limite: int = 20):
    with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
        filas = conn.execute(
            "SELECT id, titulo, duracion_min FROM pelicula ORDER BY id LIMIT %s",
            (limite,),
        ).fetchall()
    return filas
