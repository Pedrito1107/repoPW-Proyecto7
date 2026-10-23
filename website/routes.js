// website/routes.js
// Rutas del PÚBLICO GENERAL: ninguna exige sesión.
// Cada ruta de la app React pública se registra aquí una por una; todas
// responden con la misma vista (controller.home) y React Router dibuja la
// página que corresponde. Una ruta que no esté en la lista da el 404 del servidor.
import { Router } from 'express';
import * as api from './apis.js';
import * as controller from './controllers.js';
import { redirigirSiLogueado } from '../configs/middlewares.js';

const router = Router();

// La raíz lleva a la landing
router.get('/', (req, res) => res.redirect('/public'));

// Landing (1.1)
router.get('/public', controller.home);

// HU-1 · Cuenta y acceso. Con sesión iniciada no tiene sentido volver a
// entrar o registrarse: redirigirSiLogueado lleva al usuario a su panel.
router.get('/public/login', redirigirSiLogueado, controller.home);
router.get('/public/register', redirigirSiLogueado, controller.home);
router.get('/public/register-manager', redirigirSiLogueado, controller.home);
router.get('/public/recover-password', redirigirSiLogueado, controller.home);
router.get('/public/reglas', controller.home);
router.get('/public/ayuda', controller.home);

// HU-2 · Ficha pública del equipo (2.6)
router.get('/public/equipos/:id', controller.home);

// Sesión y cuentas (HU-1)
router.post('/login', controller.ingresar);
router.get('/logout-project', controller.logoutProject);
router.post('/api/v1/usuarios', controller.registrar);
router.get('/api/v1/sessions', api.sessionInfo);

export default router;
