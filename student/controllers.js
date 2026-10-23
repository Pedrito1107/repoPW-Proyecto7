// student/controllers.js
// Sirve la app React del ESTUDIANTE: mi cuenta (HU-1) y catálogo y solicitud
// (HU-3). Las rutas internas las resuelve React Router. El usuario de la sesión llega como window.USER.
import { usuarioParaVista } from '../configs/helpers.js';

export function home(req, res) {
  return res.render('student/home', {
    title: 'Almacén de Equipos',
    usuarioJson: usuarioParaVista(req.session)
  });
}
