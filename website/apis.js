// website/apis.js

export const sessionInfo = (req, res) => {
  // No hay sesión o no está autenticado
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'No active session',
      data: null,
      error: 'SESSION_NOT_FOUND'
    });
  }

  // Hay sesión
  return res.json({
    success: true,
    message: 'Active session',
    data: {
      user: req.session.user
    }
  });
}
