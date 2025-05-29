const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

// Clave secreta para firmar los tokens JWT
const JWT_SECRET = 'clave_secreta_agenda_contactos';

const authController = {
  // Registrar un nuevo usuario
  async registrar(req, res) {
    try {
      console.log('=== INICIO REGISTRO BACKEND ===');
      console.log('Iniciando registro de usuario, datos recibidos:', req.body);
      const { username, password } = req.body;
      
      // Validar datos de entrada
      if (!username || !password) {
        console.log('Datos incompletos:', { username: !!username, password: !!password });
        return res.status(400).json({ error: 'Se requiere nombre de usuario y contraseña' });
      }
      
      console.log('Validando contraseña en backend:', password);
      
      // Validar requisitos de contraseña - VERSIÓN MEJORADA
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        console.log('Contraseña no cumple requisitos:', passwordValidation.errors);
        return res.status(400).json({
          error: 'La contraseña no cumple con los requisitos de seguridad',
          details: passwordValidation.errors,
          requirements: [
            'Mínimo 8 caracteres',
            'Al menos una letra mayúscula (A-Z)',
            'Al menos una letra minúscula (a-z)',
            'Al menos un número (0-9)',
            'Al menos un símbolo (!@#$%^&*()_+-=[]{};\':"|,.<>/?~`)'
          ]
        });
      }
      
      console.log('Contraseña válida, procediendo a crear usuario:', username);
      
      // Crear usuario
      const usuario = await Usuario.crear(username, password);
      console.log('Usuario creado exitosamente:', usuario);
      
      // Generar token JWT
      const token = jwt.sign(
        { id: usuario.id, username: usuario.username },
        JWT_SECRET,
        { expiresIn: '21d' }
      );
      
      console.log('Token generado exitosamente');
      res.status(201).json({ usuario, token });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Iniciar sesión
  async login(req, res) {
    try {
      console.log('Intentando iniciar sesión, datos recibidos:', { username: req.body.username, passwordProvided: !!req.body.password });
      const { username, password } = req.body;
      
      // Validar datos de entrada
      if (!username || !password) {
        console.log('Datos incompletos');
        return res.status(400).json({ error: 'Se requiere nombre de usuario y contraseña' });
      }
      
      // Verificar credenciales
      console.log('Verificando credenciales para:', username);
      const usuario = await Usuario.verificar(username, password);
      console.log('Credenciales verificadas correctamente');
      
      // Generar token JWT
      const token = jwt.sign(
        { id: usuario.id, username: usuario.username },
        JWT_SECRET,
        { expiresIn: '21d' }
      );
      
      console.log('Token generado exitosamente');
      res.json({ usuario, token });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
  },
  
  // Obtener información del usuario actual
  async perfil(req, res) {
    try {
      // El id del usuario viene del token JWT
      const id = req.usuario.id;
      console.log('Obteniendo perfil para usuario ID:', id);
      
      const usuario = await Usuario.buscarPorId(id);
      console.log('Perfil de usuario obtenido correctamente');
      
      res.json({ usuario });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

// Función para validar contraseña - VERSIÓN MEJORADA
function validatePassword(password) {
  console.log('Validando contraseña en backend:', password);
  console.log('Longitud de contraseña:', password.length);
  
  const errors = [];
  const analysis = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)
  };
  
  console.log('Análisis de contraseña:', analysis);
  
  // Validar cada requisito
  if (!analysis.length) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (!analysis.uppercase) {
    errors.push('La contraseña debe contener al menos una letra mayúscula (A-Z)');
  }
  
  if (!analysis.lowercase) {
    errors.push('La contraseña debe contener al menos una letra minúscula (a-z)');
  }
  
  if (!analysis.number) {
    errors.push('La contraseña debe contener al menos un número (0-9)');
  }
  
  if (!analysis.symbol) {
    errors.push('La contraseña debe contener al menos un símbolo (!@#$%^&*()_+-=[]{};\':"|,.<>/?~`)');
    
    // Debug adicional para símbolos
    const foundSymbols = password.match(/[^a-zA-Z0-9]/g);
    console.log('Símbolos encontrados en contraseña:', foundSymbols);
    
    // Verificar específicamente algunos símbolos comunes
    const commonSymbols = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '-', '=', '[', ']', '{', '}', ';', "'", ':', '"', '\\', '|', ',', '.', '<', '>', '/', '?', '~', '`'];
    const foundCommonSymbols = commonSymbols.filter(symbol => password.includes(symbol));
    console.log('Símbolos comunes encontrados:', foundCommonSymbols);
  }
  
  const isValid = errors.length === 0;
  console.log('Validación resultado:', { isValid, errorsCount: errors.length });
  
  return {
    isValid,
    errors,
    analysis
  };
}

module.exports = authController;