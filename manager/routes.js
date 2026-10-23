// manager/routes.js
// Rutas del ENCARGADO DE ALMACÉN: todas pasan por soloManager
// (sin sesión -> login; con otro rol -> 403).
// Cada ruta de la app React del encargado se registra una por una; todas
// responden con la misma vista (controller.home) y React Router dibuja la
// página que corresponde. Una ruta que no esté en la lista da el 404 del servidor.
import { Router } from 'express';
import * as controller from './controllers.js';
import { soloManager } from '../configs/middlewares.js';

const router = Router();

// Inicio del encargado (React lo lleva a Mi cuenta)
router.get('/manager', soloManager, controller.home);

// HU-1 · Mi cuenta (1.6)
router.get('/manager/cuenta', soloManager, controller.home);

// Entrega 2: aquí se registran las APIs del encargado, también protegidas,
// por ejemplo PUT /api/v1/cuenta (HU-1).

export default router;
