import { Pool } from 'pg';
import dotenv from 'dotenv';

// Carga las variables de entorno desde .env si existe localmente
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: La variable de entorno DATABASE_URL no está definida.');
  console.error('Asegúrate de configurar DATABASE_URL en tus secretos de Codespaces o en tu archivo .env local.');
}

// Pool de conexiones a PostgreSQL (Supabase Session Pooler)
export const pool = new Pool({
  connectionString,
  // Supabase en la nube requiere SSL para la conexión
  ssl: { rejectUnauthorized: false },
});