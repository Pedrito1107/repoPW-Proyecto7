import { Sequelize } from 'sequelize';
import pg from 'pg'; // <-- Forzar la inclusión del paquete en el build de Vercel
import dotenv from 'dotenv';

dotenv.config();

const isSSL = process.env.DB_SSL === 'true';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'postgres',
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectModule: pg, // <-- Asignar directamente el conector
    logging: process.env.NODE_ENV !== 'production' ? console.log : false,
    pool: {
      max: 2, // Se reduce para entornos Serverless para no agotar el pool de Supabase
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: isSSL ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  }
);

export default sequelize;