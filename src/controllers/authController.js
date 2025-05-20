const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

// Clave secreta para firmar los tokens JWT
const JWT_SECRET = 'clave_secreta_agenda_contactos';

const authController = {
  // Registrar un nuevo usuario
  async registrar(req, res) {
    try {
      const { username, password } = req.body;
      
      // Validar datos de entrada
      if (!username || !password) {
        return res.status(400).json({ error: 'Se requiere nombre de usuario y contraseña' });
      }
      
      // Validar requisitos de contraseña
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error: 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos'
        });
      }
      
      // Crear usuario
      const usuario = await Usuario.crear(username, password);
      
      // Generar token JWT
      const token = jwt.sign(
        { id: usuario.id, username: usuario.username },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      res.status(201).json({ usuario, token });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Iniciar sesión
  async login(req, res) {
    try {
      const { username, password } = req.body;
      
      // Validar datos de entrada
      if (!username || !password) {
        return res.status(400).json({ error: 'Se requiere nombre de usuario y contraseña' });
      }
      
      // Verificar credenciales
      const usuario = await Usuario.verificar(username, password);
      
      // Generar token JWT
      const token = jwt.sign(
        { id: usuario.id, username: usuario.username },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      res.json({ usuario, token });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
  },
  
  // Obtener información del usuario actual
  async perfil(req, res) {
    try {
      const usuario = await Usuario.buscarPorId(req.usuario.id);
      res.json({ usuario });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = authController;