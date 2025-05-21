const jwt = require('jsonwebtoken');

// Clave secreta para verificar los tokens JWT
const JWT_SECRET = 'clave_secreta_agenda_contactos';

// Middleware para verificar el token de autenticación
const verificarToken = (req, res, next) => {
  console.log('Inicio de verificarToken middleware');
  // Obtener el token del encabezado
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader);
  
  const token = authHeader?.split(' ')[1];
  console.log('Token extraído:', token ? 'Presente' : 'No presente');
  
  if (!token) {
    console.log('No se proporcionó token');
    return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
  }
  
  try {
    // Verificar el token
    console.log('Hora actual:', new Date().toISOString());
    console.log('Intentando verificar token...');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verificado correctamente:', decoded);
    
    // Guardar la información del usuario en el objeto de solicitud
    req.usuario = decoded;
    
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    
    // Si es error de expiración, dar más información
    if (error.name === 'TokenExpiredError') {
      console.log('Token expirado en:', error.expiredAt);
      console.log('Hora actual:', new Date().toISOString());
    }
    
    return res.status(401).json({ 
      error: 'Token inválido o expirado', 
      details: error.message,
      name: error.name
    });
  }
};

module.exports = verificarToken;