import { Router, Request, Response } from 'express';
import { pool } from './db';

const router = Router();

// Endpoint de salud: verifica que el servidor habla con la base
router.get('/salud', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({ estado: 'ok' });
  } catch (error) {
    console.error('Error en /salud:', error);
    res.status(500).json({ error: 'No se pudo conectar a la base de datos' });
  }
});

// Endpoint de listado con límite opcional
router.get('/peliculas', async (req: Request, res: Response) => {
  const limite = Number(req.query.limite) || 20;

  try {
    const resultado = await pool.query(
      'SELECT id, titulo, duracion_min FROM pelicula ORDER BY id LIMIT $1',
      [limite]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error en /peliculas:', error);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});

export default router;