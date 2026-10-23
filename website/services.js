// website/services.js
// PÚBLICO GENERAL · lógica de negocio del inicio de sesión (HU-1).
// El controlador solo recibe la petición y responde; aquí se decide si la
// cuenta puede entrar, cuántos intentos le quedan y si hay que avisar algo.
import * as repo from './repositories.js';
import { MAX_INTENTOS_LOGIN } from '../src/shared/constants.js';

// Minutos que se bloquea el inicio de sesión al agotar los intentos
export const MINUTOS_BLOQUEO = 15;

// Intentos fallidos por correo, en memoria del servidor (Entrega 1).
// correo -> { fallidos, bloqueadoHasta }
const intentos = new Map();

function normalizar(correo) {
  return String(correo || '').trim().toLowerCase();
}

function dinero(monto) {
  return 'S/ ' + Number(monto || 0).toFixed(2);
}

// Aviso que se muestra al entrar con una cuenta bloqueada: puede ver su
// historial, pero no solicitar ni reservar equipos.
function avisoDe(user) {
  if (user?.estado !== 'bloqueado') return null;
  return {
    tipo: 'bloqueada',
    deuda: Number(user.deuda) > 0 ? dinero(user.deuda) : null,
    prestamo: user.prestamoDeuda || null
  };
}

// Resultado:
//  { ok: true, cuenta, aviso }                         -> entra
//  { ok: false, status: 401, intentosRestantes, … }   -> credenciales incorrectas
//  { ok: false, status: 429, minutos, … }             -> demasiados intentos
//  { ok: false, status: 403, message }                -> encargado pendiente de aprobación
export function iniciarSesion(username, password) {
  const correo = normalizar(username);
  const registro = intentos.get(correo) || { fallidos: 0, bloqueadoHasta: 0 };

  if (registro.bloqueadoHasta > Date.now()) {
    const minutos = Math.ceil((registro.bloqueadoHasta - Date.now()) / 60000);
    return {
      ok: false,
      status: 429,
      minutos,
      message: 'Superaste los ' + MAX_INTENTOS_LOGIN + ' intentos. Espera ' + minutos +
        ' min o recupera tu contraseña.'
    };
  }

  const cuenta = repo.buscarPorCredenciales(correo, password);

  if (!cuenta) {
    registro.fallidos += 1;
    const intentosRestantes = Math.max(0, MAX_INTENTOS_LOGIN - registro.fallidos);
    if (intentosRestantes === 0) {
      registro.fallidos = 0;
      registro.bloqueadoHasta = Date.now() + MINUTOS_BLOQUEO * 60000;
    }
    intentos.set(correo, registro);
    return {
      ok: false,
      status: intentosRestantes === 0 ? 429 : 401,
      intentosRestantes,
      minutos: intentosRestantes === 0 ? MINUTOS_BLOQUEO : 0,
      message: intentosRestantes === 0
        ? 'Superaste los ' + MAX_INTENTOS_LOGIN + ' intentos. Espera ' + MINUTOS_BLOQUEO + ' min o recupera tu contraseña.'
        : 'Correo o contraseña incorrectos.'
    };
  }

  intentos.delete(correo);

  // El encargado registrado queda pendiente hasta que lo aprueben (HU-1)
  if (cuenta.user?.rol === 'encargado' && cuenta.user?.estado === 'pendiente') {
    return {
      ok: false,
      status: 403,
      message: 'Tu cuenta de encargado está pendiente de aprobación. Te avisaremos cuando esté habilitada.'
    };
  }

  return { ok: true, cuenta, aviso: avisoDe(cuenta.user) };
}
