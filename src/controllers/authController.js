const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

// Clave secreta para firmar los tokens JWT
const JWT_SECRET = 'clave_secreta_agenda_contactos';

const authController = {
  // Registrar un nuevo usuario
  async registrar(req, res) {
    try {
      console.log('Iniciando registro de usuario, datos recibidos:', req.body);
      const { username, password } = req.body;
      
      // Validar datos de entrada
      if (!username || !password) {
        console.log('Datos incompletos:', { username: !!username, password: !!password });
        return res.status(400).json({ error: 'Se requiere nombre de usuario y contraseña' });
      }
      
      // Validar requisitos de contraseña
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        console.log('Contraseña no cumple requisitos');
        return res.status(400).json({
          error: 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos'
        });
      }
      
      console.log('Intentando crear usuario:', username);
      
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

module.exports = authController;