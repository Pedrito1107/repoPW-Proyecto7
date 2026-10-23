// website/controllers.js
// Público general: lo que cualquiera puede ver sin iniciar sesión
// (landing, login y registro) y el manejo de la sesión.
import {
  validateStudentRegistration,
  validateManagerRegistration,
  hasErrors
} from '../src/shared/validators.js';
import { usuarioParaVista } from '../configs/helpers.js';
import * as repo from './repositories.js';
import * as services from './services.js';

// GET /public/* · sirve la app React pública; las subrutas las resuelve
// React Router. También recibe la sesión (window.USER) para que la cabecera
// sepa si el visitante ya inició sesión.
export function home(req, res) {
  return res.render('public/home', {
    title: 'Almacén de Equipos',
    usuarioJson: usuarioParaVista(req.session)
  });
}

// POST /login · inicio de sesión (HU-1)
// La página de login lo llama con fetch y recibe JSON:
//   200 { redirect, aviso }  · 401 credenciales incorrectas (con intentosRestantes)
//   429 demasiados intentos
// Si llega como formulario normal (sin JavaScript), responde con redirecciones.
// Si venía de una página protegida (?next=...) vuelve ahí; si no, va a /student o /manager.
export async function ingresar(req, res) {
  const { username, password, next } = req.body;
  const quiereJson = req.is('application/json');

  const resultado = services.iniciarSesion(username, password);

  if (!resultado.ok) {
    if (quiereJson) {
      return res.status(resultado.status).json({
        success: false,
        message: resultado.message,
        data: { intentosRestantes: resultado.intentosRestantes ?? 0, minutos: resultado.minutos || 0 }
      });
    }
    const volver = next ? '&next=' + encodeURIComponent(next) : '';
    return res.redirect('/public/login?error=1' + volver);
  }

  const usuarioEncontrado = resultado.cuenta;
  const role = usuarioEncontrado.role;

  req.session.username = usuarioEncontrado.username;
  req.session.role = role;
  req.session.blocked = usuarioEncontrado.blocked;
  req.session.user = usuarioEncontrado.user;   // sin contraseña

  // Solo se acepta un "next" interno y de la sección del propio rol
  const destino =
    typeof next === 'string' && next.startsWith('/' + role) && !next.startsWith('//')
      ? next
      : '/' + role;

  if (quiereJson) {
    return req.session.save(() => res.json({
      success: true,
      message: 'Sesión iniciada.',
      data: { redirect: destino, aviso: resultado.aviso }
    }));
  }
  return req.session.save(() => res.redirect(destino));
}

// POST /api/v1/usuarios · registro de estudiante o encargado (HU-1)
// Repite las validaciones del formulario (no se confía en el cliente) y
// agrega la cuenta a la lista. 201 creada · 400 datos inválidos · 409 correo repetido
export function registrar(req, res) {
  const datos = req.body || {};

  if (datos.rol !== 'estudiante' && datos.rol !== 'encargado') {
    return res.status(400).json({ success: false, message: 'Rol no válido.', data: null, errors: {} });
  }

  const errors = datos.rol === 'estudiante'
    ? validateStudentRegistration(datos)
    : validateManagerRegistration(datos);

  if (hasErrors(errors)) {
    return res.status(400).json({ success: false, message: 'Datos inválidos.', data: null, errors });
  }

  const correo = datos.correo.trim().toLowerCase();

  if (repo.existeCorreo(correo)) {
    return res.status(409).json({
      success: false,
      message: 'Ya existe una cuenta con el correo ' + correo + '.',
      data: null,
      errors: {}
    });
  }

  const base = {
    id: datos.id,
    rol: datos.rol,
    nombres: datos.nombres.trim(),
    apellidos: datos.apellidos.trim(),
    correo
  };

  const user = datos.rol === 'estudiante'
    ? { ...base, carrera: datos.carrera, ciclo: Number(datos.ciclo), codigo: '', celular: '',
        estado: 'habilitado', deuda: 0, prestamoDeuda: null, prestamos: 0, retrasos: 0 }
    : { ...base, almacen: datos.almacen, anexo: String(datos.anexo).trim(),
        // El alta queda pendiente hasta que el jefe de laboratorio la apruebe
        estado: 'pendiente' };

  repo.agregar({
    username: correo,
    password: datos.password,
    role: datos.rol === 'estudiante' ? 'student' : 'manager',
    blocked: false,
    user
  });

  return res.status(201).json({ success: true, message: 'Cuenta creada.', data: user });
}

// GET /logout-project · cierra la sesión y vuelve a la landing
export function logoutProject(req, res) {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err)
      return res.redirect('/public')
    }

    res.clearCookie('connect.sid')

    return res.redirect('/public')
  })
}
