// server.js
import express from 'express';
import 'dotenv/config';
import bootstrap from './configs/bootstrap.js';

const app = express();

// Inicializa toda la app
bootstrap(app);

// Levanta el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});