// manager/controllers.js
// Sirve la app React del ENCARGADO: mi cuenta (HU-1). Las rutas internas las
// resuelve React Router. El usuario de la sesión llega como window.USER
// (sin contraseña).
import { usuarioParaVista } from '../configs/helpers.js';

export function home(req, res) {
  return res.render('manager/home', {
    title: 'Panel del encargado',
    usuarioJson: usuarioParaVista(req.session)
  });
}
