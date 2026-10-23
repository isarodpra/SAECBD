import express from 'express';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json()); // Middleware para parsear JSON (útil más adelante)

// Montar las rutas en la raíz
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});