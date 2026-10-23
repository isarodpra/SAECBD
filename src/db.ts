import { Pool } from 'pg';

// La cadena viene de la variable de entorno, NUNCA escrita en el código
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('La variable de entorno DATABASE_URL no está definida');
}

export const pool = new Pool({
  connectionString,
  // Supabase (y otros servicios gestionados) requieren SSL
  ssl: { rejectUnauthorized: false },
});