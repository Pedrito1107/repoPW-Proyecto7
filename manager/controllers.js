// manager/controllers.js
// Sirve la app React del ENCARGADO: inventario (HU-2), aprobación y entrega
// (HU-4), devoluciones (HU-5), lista de espera (HU-6) y métricas y usuarios
// (HU-7). Las rutas internas las resuelve React Router. El usuario de la
// sesión llega como window.USER (sin contraseña).
import { usuarioParaVista } from '../configs/helpers.js';

export function home(req, res) {
  return res.render('manager/home', {
    title: 'Panel del encargado',
    usuarioJson: usuarioParaVista(req.session)
  });
}
