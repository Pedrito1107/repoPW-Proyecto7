// configs/middlewares.js
// Filtros que se ejecutan antes de cada ruta: 404, sesión para las vistas y
// protección por rol (soloStudent / soloManager).

/**
 * Middleware para manejar errores 404
 * Si es una petición API (empieza con /api) devuelve JSON
 * Si es una petición web normal devuelve la vista 404
 */
export function notFoundHandler(req, res) {
  // Verificar si es una petición a la API
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'Recurso no encontrado',
      data: null,
      error: 'Error 404'
    });
  }
  
  // Para peticiones no-API (y solo GET) renderizar vista 404
  if (req.method === 'GET') {
    return res.status(404).render('404', {
      title: 'Página no encontrada',
      message: 'La página que buscas no existe.'
    });
  }
  
  // Para otros métodos HTTP en rutas no-API
  return res.status(404).json({
    success: false,
    message: 'Recurso no encontrado',
    data: null,
    error: 'Error 404'
  });
}

export function viewSession(req, res, next) {
  res.locals.session = req.session;
  res.locals.user = req.session?.user || null;
  res.locals.isAuthenticated = !!req.session?.user?.id;

  next();
}

// ========================================
// PROYECTO · PRÉSTAMO DE EQUIPOS
// ========================================


// Sesión del proyecto completa: con usuario del seed (tiene "rol").
// Las sesiones creadas por el login anterior no lo tienen y se tratan
// como "sin sesión" (hay que volver a iniciar sesión).
function tieneSesion(req) {
  return Boolean(req.session?.username && req.session?.user?.rol)
}

// CON SESIÓN -> A SU PANEL (login, registro y recuperación)
export function redirigirSiLogueado(req, res, next) {
  const role = req.session?.role
  if (tieneSesion(req) && (role === 'student' || role === 'manager')) {
    return res.redirect('/' + role)
  }
  next()
}

// SOLO ESTUDIANTE
export function soloStudent(req, res, next) {
  const role = req.session?.role
  // No ha iniciado sesión -> al inicio de sesión (y luego vuelve aquí)
  if (!tieneSesion(req)) {
    return res.redirect('/public/login?next=' + encodeURIComponent(req.originalUrl))
  }
  // Sí inició sesión, pero no es estudiante
  if (role != 'student') {
    return res.status(403).render('403', {
      title: 'Acceso no autorizado',
      message: 'No tienes permiso para acceder al área de estudiantes.',
      statusCode: 403
    })

  }
  next()
}

// SOLO ENCARGADO
export function soloManager(req, res, next) {
  const role = req.session?.role
  // No ha iniciado sesión -> al inicio de sesión (y luego vuelve aquí)
  if (!tieneSesion(req)) {
    return res.redirect('/public/login?next=' + encodeURIComponent(req.originalUrl))
  }
  // Sí inició sesión, pero no es encargado
  if (role != 'manager') {
    return res.status(403).render('403', {
      title: 'Acceso no autorizado',
      message: 'No tienes permiso para acceder al área de encargados.',
      statusCode: 403
    })
  }
  next()
}