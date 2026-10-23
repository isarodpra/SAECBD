import express from 'express';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

// Especificación OpenAPI 3.0 para la documentación interactiva en /docs
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'API de mi equipo - Sistema de Biblioteca',
    version: '1.0.0',
    description: 'API con arquitectura de 3 capas: Cliente (Swagger /docs), Servidor (Node/Express) y Base de datos (Supabase PostgreSQL) con SQL explícito y parametrizado.',
  },
  paths: {
    '/salud': {
      get: {
        summary: 'Verificar salud y conexión con la base de datos',
        description: 'Ejecuta SELECT 1 contra Supabase para verificar que el servidor se comunica correctamente con la base.',
        responses: {
          200: {
            description: 'Conexión exitosa',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    estado: { type: 'string', example: 'ok' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Error de conexión con la base de datos',
          },
        },
      },
    },
    '/usuarios': {
      get: {
        summary: 'Listar usuarios con límite',
        description: 'Devuelve un listado de usuarios de la tabla usuarios ordenados por id_usuario con límite parametrizado.',
        parameters: [
          {
            name: 'limite',
            in: 'query',
            description: 'Número máximo de registros a devolver (por defecto 20)',
            required: false,
            schema: { type: 'integer', default: 20 },
          },
        ],
        responses: {
          200: {
            description: 'Listado de usuarios obtenido correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id_usuario: { type: 'integer', example: 1 },
                      nombre: { type: 'string', example: 'Usuario 1' },
                      correo: { type: 'string', example: 'user1@example.com' },
                      telefono: { type: 'string', nullable: true },
                      tipo_usuario: { type: 'string', nullable: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/usuarios/{id_usuario}': {
      get: {
        summary: 'Obtener un usuario por ID',
        description: 'Devuelve un único usuario por su llave primaria id_usuario. Responde 404 si no existe y 422 si el id no es un número entero.',
        parameters: [
          {
            name: 'id_usuario',
            in: 'path',
            description: 'ID del usuario (entero)',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Usuario encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id_usuario: { type: 'integer', example: 1 },
                    nombre: { type: 'string', example: 'Usuario 1' },
                    correo: { type: 'string', example: 'user1@example.com' },
                    telefono: { type: 'string', nullable: true },
                    tipo_usuario: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
          404: {
            description: 'Usuario no encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    detail: { type: 'string', example: 'Usuario no encontrado' },
                  },
                },
              },
            },
          },
          422: {
            description: 'Error de validación de tipo en el parámetro',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    detail: { type: 'string', example: 'El valor proporcionado no es un número entero válido' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/libros': {
      get: {
        summary: 'Listar libros con límite',
        description: 'Devuelve un listado de libros de la tabla libros ordenados por isbn con límite parametrizado.',
        parameters: [
          {
            name: 'limite',
            in: 'query',
            description: 'Número máximo de registros a devolver (por defecto 20)',
            required: false,
            schema: { type: 'integer', default: 20 },
          },
        ],
        responses: {
          200: {
            description: 'Listado de libros obtenido correctamente',
          },
        },
      },
    },
    '/libros/{isbn}': {
      get: {
        summary: 'Obtener un libro por ISBN',
        description: 'Devuelve un libro específico según su ISBN. Responde 404 si no existe.',
        parameters: [
          {
            name: 'isbn',
            in: 'path',
            description: 'Código ISBN del libro',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Libro encontrado',
          },
          404: {
            description: 'Libro no encontrado',
          },
        },
      },
    },
  },
};

// Montar la documentación interactiva en /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Redireccionar raíz a /docs para mayor comodidad
app.get('/', (_req, res) => {
  res.redirect('/docs');
});

// Montar endpoints de la API
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Documentación interactiva disponible en http://localhost:${PORT}/docs`);
});

export default app;