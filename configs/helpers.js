// configs/helpers.js

// Usuario de la sesión listo para escribirse en la vista como window.USER.
// Nunca incluye la contraseña, y escapa "<" para que el JSON no pueda
// cerrar la etiqueta <script> donde se inserta.
export function usuarioParaVista(session) {
  const usuario = session?.user && session.user.rol ? session.user : null;
  let publico = null;
  if (usuario) {
    const { password, ...resto } = usuario;
    publico = resto;
  }
  return JSON.stringify(publico).replace(/</g, '\\u003c');
}
