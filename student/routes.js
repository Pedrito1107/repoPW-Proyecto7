// student/routes.js
// Rutas del ESTUDIANTE: todas pasan por soloStudent
// (sin sesión -> login; con otro rol -> 403).
// Cada ruta de la app React del estudiante se registra una por una; todas
// responden con la misma vista (controller.home) y React Router dibuja la
// página que corresponde. Una ruta que no esté en la lista da el 404 del servidor.
import { Router } from 'express';
import * as controller from './controllers.js';
import { soloStudent } from '../configs/middlewares.js';

const router = Router();

// Inicio del estudiante (React lo lleva a Mi cuenta)
router.get('/student', soloStudent, controller.home);

// HU-1 · Mi cuenta (1.6)
router.get('/student/cuenta', soloStudent, controller.home);

// Entrega 2: aquí se registran las APIs del estudiante, también protegidas,
// por ejemplo PUT /api/v1/cuenta (HU-1).

export default router;
