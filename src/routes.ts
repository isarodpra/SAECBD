import { Router, Request, Response } from 'express';
import { pool } from './db';

const router = Router();

/**
 * Endpoint de salud: verifica que el servidor se comunica con Supabase
 */
router.get('/salud', async (_req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({ estado: 'ok' });
  } catch (error) {
    console.error('Error en /salud:', error);
    res.status(500).json({ error: 'No se pudo conectar a la base de datos' });
  }
});

/**
 * Endpoint de listado de usuarios con límite parametrizado ($1)
 */
router.get('/usuarios', async (req: Request, res: Response) => {
  const limite = parseInt(req.query.limite as string, 10) || 20;

  try {
    // Consulta explícita y parametrizada con $1 (seguridad contra inyección SQL)
    const resultado = await pool.query(
      'SELECT id_usuario, nombre, correo, telefono, tipo_usuario FROM usuarios ORDER BY id_usuario LIMIT $1',
      [limite]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error en /usuarios:', error);
    res.status(500).json({ error: 'Error al consultar usuarios en la base de datos' });
  }
});

/**
 * Endpoint para obtener un usuario por su llave primaria (id_usuario)
 * - Si id_usuario no es entero: responde 422 (Validación de tipos en el servidor)
 * - Si no existe: responde 404
 */
router.get('/usuarios/:id_usuario', async (req: Request, res: Response) => {
  const id_usuario = req.params.id_usuario as string;

  // Validación de tipo: si no es un número entero válido, la petición se detiene en el servidor
  if (!/^\d+$/.test(id_usuario)) {
    return res.status(422).json({
      detail: [
        {
          loc: ['path', 'id_usuario'],
          msg: 'El valor proporcionado no es un número entero válido',
          type: 'type_error.integer'
        }
      ]
    });
  }

  const idNum = parseInt(id_usuario, 10);

  try {
    // Consulta explícita y parametrizada con $1
    const resultado = await pool.query(
      'SELECT id_usuario, nombre, correo, telefono, tipo_usuario FROM usuarios WHERE id_usuario = $1',
      [idNum]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ detail: 'Usuario no encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error en /usuarios/:id_usuario:', error);
    res.status(500).json({ error: 'Error al consultar el usuario en la base de datos' });
  }
});

/**
 * Endpoint de listado de libros con límite parametrizado ($1)
 */
router.get('/libros', async (req: Request, res: Response) => {
  const limite = parseInt(req.query.limite as string, 10) || 20;

  try {
    const resultado = await pool.query(
      'SELECT isbn, titulo, autor, editorial, anio_publicacion FROM libros ORDER BY isbn LIMIT $1',
      [limite]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error en /libros:', error);
    res.status(500).json({ error: 'Error al consultar libros en la base de datos' });
  }
});

/**
 * Endpoint para obtener un libro por su ISBN
 */
router.get('/libros/:isbn', async (req: Request, res: Response) => {
  const isbn = req.params.isbn as string;

  try {
    const resultado = await pool.query(
      'SELECT isbn, titulo, autor, editorial, anio_publicacion FROM libros WHERE isbn = $1',
      [isbn]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ detail: 'Libro no encontrado' });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error en /libros/:isbn:', error);
    res.status(500).json({ error: 'Error al consultar el libro en la base de datos' });
  }
});

export default router;