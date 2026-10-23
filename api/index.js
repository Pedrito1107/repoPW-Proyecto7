// api/index.js
import express from 'express';
import 'dotenv/config';

import bootstrap from '../configs/bootstrap.js';

// Imprimir variables específicas de la app
/*
console.log('=== APP ENV VARS ===', {
  NODE_ENV: process.env.NODE_ENV,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_SSL: process.env.DB_SSL,
  CORS_ORIGIN: process.env.CORS_ORIGIN
});
*/

const app = express();

// Configurar para Vercel
app.set('trust proxy', 1);

// Inicializa toda la app
bootstrap(app);

// Exportar para Vercel
export default app;