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

// Inicio del encargado (React lo lleva al inventario)
router.get('/manager', soloManager, controller.home);

// HU-1 · Mi cuenta (1.6)
router.get('/manager/cuenta', soloManager, controller.home);

// HU-2 · Inventario (2.1 – 2.5)
router.get('/manager/inventario', soloManager, controller.home);
router.get('/manager/inventario/nuevo', soloManager, controller.home);
router.get('/manager/inventario/:id', soloManager, controller.home);
router.get('/manager/inventario/:id/editar', soloManager, controller.home);

// HU-4 · Aprobación y entrega (4.1 – 4.6)
router.get('/manager/solicitudes', soloManager, controller.home);
router.get('/manager/solicitudes/:codigo/entrega', soloManager, controller.home);
router.get('/manager/prestamos', soloManager, controller.home);
router.get('/manager/prestamos/:codigo/constancia', soloManager, controller.home);
router.get('/manager/vencidos', soloManager, controller.home);

// Entrega 2: aquí se registran las APIs del encargado, también protegidas,
// por ejemplo POST /api/v1/solicitudes/:codigo/entrega (HU-4).

export default router;
