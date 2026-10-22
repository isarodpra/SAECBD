import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config(); // Carga DATABASE_URL desde .env si no usas secretos

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Configuración de Swagger (documentación interactiva)
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'API de mi equipo', version: '1.0.0' },
  },
  apis: ['./src/main.ts'], // Ruta a los comentarios JSDoc
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Endpoint de salud
app.get('/salud', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ estado: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'Base de datos no disponible' });
  }
});

// Endpoint de listado (ejemplo con tabla "pelicula")
/**
 * @openapi
 * /peliculas:
 *   get:
 *     summary: Lista películas
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de películas
 */
app.get('/peliculas', async (req, res) => {
  const limite = parseInt(req.query.limite as string) || 20;
  try {
    const { rows } = await pool.query(
      'SELECT id, titulo, duracion_min FROM pelicula ORDER BY id LIMIT $1',
      [limite] // 👈 Consulta parametrizada con $1
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error en la consulta' });
  }
});

app.listen(8000, () => {
  console.log('Servidor en http://localhost:8000');
});