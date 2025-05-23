// src/controllers/usuariosController.js
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');

const usuariosController = {
  // Listar todos los usuarios
  async listar(req, res) {
    try {
      // Solo un usuario admin puede ver la lista de usuarios
      const usuarioActual = req.usuario;
      
      // Verificar si el usuario actual es admin (usuario con ID 1)
      if (usuarioActual.id !== 1) {
        return res.status(403).json({ error: 'No tienes permiso para ver la lista de usuarios' });
      }
      
      const usuarios = await Usuario.listarTodos();
      res.json({ usuarios });
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Obtener un usuario por ID
  async obtener(req, res) {
    try {
      // Solo el propio usuario o un admin puede ver los detalles
      const usuarioActual = req.usuario;
      const idSolicitado = parseInt(req.params.id);
      
      if (usuarioActual.id !== idSolicitado && usuarioActual.id !== 1) {
        return res.status(403).json({ error: 'No tienes permiso para ver este usuario' });
      }
      
      const usuario = await Usuario.buscarPorId(idSolicitado);
      res.json({ usuario });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(404).json({ error: error.message });
    }
  },
  
  // Crear un nuevo usuario
  async crear(req, res) {
    try {
      // Solo un admin puede crear usuarios
      const usuarioActual = req.usuario;
      
      if (usuarioActual.id !== 1) {
        return res.status(403).json({ error: 'No tienes permiso para crear usuarios' });
      }
      
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
      res.status(201).json({ usuario });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Actualizar un usuario
  async actualizar(req, res) {
    try {
      // Solo el propio usuario o un admin puede actualizar
      const usuarioActual = req.usuario;
      const idSolicitado = parseInt(req.params.id);
      
      if (usuarioActual.id !== idSolicitado && usuarioActual.id !== 1) {
        return res.status(403).json({ error: 'No tienes permiso para actualizar este usuario' });
      }
      
      const { username, password } = req.body;
      
      // Validar datos de entrada
      if (!username) {
        return res.status(400).json({ error: 'Se requiere nombre de usuario' });
      }
      
      // Si se proporcionó contraseña, validarla
      if (password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
          return res.status(400).json({
            error: 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos'
          });
        }
      }
      
      // Actualizar usuario
      const usuario = await Usuario.actualizar(idSolicitado, { username, password });
      res.json({ usuario });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Eliminar un usuario
  async eliminar(req, res) {
    try {
      // Solo un admin puede eliminar usuarios, y no puede eliminarse a sí mismo
      const usuarioActual = req.usuario;
      const idSolicitado = parseInt(req.params.id);
      
      if (usuarioActual.id !== 1) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar usuarios' });
      }
      
      if (idSolicitado === 1) {
        return res.status(400).json({ error: 'No se puede eliminar el usuario administrador' });
      }
      
      await Usuario.eliminar(idSolicitado);
      res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = usuariosController;