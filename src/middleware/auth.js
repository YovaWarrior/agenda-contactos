const jwt = require('jsonwebtoken');

// Clave secreta para verificar los tokens JWT
const JWT_SECRET = 'clave_secreta_agenda_contactos';

// Middleware para verificar el token de autenticación
const verificarToken = (req, res, next) => {
  // Obtener el token del encabezado
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
  }
  
  try {
    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Guardar la información del usuario en el objeto de solicitud
    req.usuario = decoded;
    
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = verificarToken;