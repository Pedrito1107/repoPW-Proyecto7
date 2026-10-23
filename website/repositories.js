// website/repositories.js
// Acceso a datos de las cuentas (HU-1).
//
// Entrega 1: las cuentas se leen de src/data/seed.json (los mismos usuarios
// que usa el front), así hay una sola lista y no se desincronizan. Todas las
// cuentas de prueba tienen la contraseña «123». Las que se crean con
// «Crear cuenta» se agregan en memoria (se pierden al reiniciar el servidor).
// En la Entrega 2 estas funciones consultarán la base de datos y el
// controlador y el servicio no cambian.

import { readFileSync } from 'fs';

const seed = JSON.parse(
  readFileSync(new URL('../src/data/seed.json', import.meta.url), 'utf8')
);

// Cada cuenta tiene:
//  - username / password / role / blocked: lo que usa el login
//  - user: los datos del perfil que reciben las vistas en window.USER (sin contraseña)
function aCuenta(u) {
  const { password, ...user } = u;
  return {
    username: u.correo.trim().toLowerCase(),
    password,
    role: u.rol === 'encargado' ? 'manager' : 'student',
    blocked: u.estado === 'bloqueado',
    user
  };
}

const usuarios = seed.usuarios.map(aCuenta);

export function buscarPorCredenciales(username, password) {
  const correo = String(username || '').trim().toLowerCase();
  return usuarios.find((u) => u.username == correo && u.password == password) || null;
}

export function existeCorreo(correo) {
  return usuarios.some((u) => u.username == correo);
}

export function agregar(cuenta) {
  usuarios.push(cuenta);
  return cuenta;
}
