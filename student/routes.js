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

// Inicio del estudiante (React lo lleva al catálogo)
router.get('/student', soloStudent, controller.home);

// HU-1 · Mi cuenta (1.6)
router.get('/student/cuenta', soloStudent, controller.home);

// HU-3 · Catálogo y solicitud (3.1 – 3.4)
router.get('/student/catalogo', soloStudent, controller.home);
router.get('/student/equipos/:id', soloStudent, controller.home);
router.get('/student/solicitar/:id', soloStudent, controller.home);
router.get('/student/solicitudes', soloStudent, controller.home);

// Entrega 2: aquí se registran las APIs del estudiante, también protegidas,
// por ejemplo GET /api/v1/solicitudes (HU-3).

export default router;
