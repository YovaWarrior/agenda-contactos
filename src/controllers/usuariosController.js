// src/controllers/usuariosController.js - Solo gestión personal
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');

const usuariosController = {
  // Obtener información del usuario actual (solo su propia información)
  async obtenerPerfil(req, res) {
    try {
      console.log('Obteniendo perfil del usuario ID:', req.usuario.id);
      
      const usuario = await Usuario.buscarPorId(req.usuario.id);
      console.log('Perfil obtenido:', usuario.username);
      
      res.json({ usuario });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
    }
  },
  
  // Actualizar solo la contraseña del usuario actual
  async cambiarContrasena(req, res) {
    try {
      console.log('Usuario cambiando contraseña. ID:', req.usuario.id);
      
      const { passwordActual, passwordNueva, confirmarPassword } = req.body;
      
      // Validar datos de entrada
      if (!passwordActual || !passwordNueva || !confirmarPassword) {
        return res.status(400).json({ 
          error: 'Se requiere contraseña actual, nueva contraseña y confirmación' 
        });
      }
      
      // Verificar que las contraseñas nuevas coincidan
      if (passwordNueva !== confirmarPassword) {
        return res.status(400).json({ 
          error: 'La nueva contraseña y su confirmación no coinciden' 
        });
      }
      
      // Validar requisitos de la nueva contraseña
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(passwordNueva)) {
        return res.status(400).json({
          error: 'La nueva contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos'
        });
      }
      
      // Verificar la contraseña actual
      try {
        await Usuario.verificarContrasena(req.usuario.id, passwordActual);
      } catch (error) {
        return res.status(400).json({ 
          error: 'La contraseña actual es incorrecta' 
        });
      }
      
      console.log('Cambiando contraseña...');
      
      // Cambiar la contraseña
      await Usuario.cambiarContrasena(req.usuario.id, passwordNueva);
      console.log('Contraseña cambiada exitosamente');
      
      res.json({ mensaje: 'Contraseña cambiada exitosamente' });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Actualizar información personal (solo nombre de usuario)
  async actualizarPerfil(req, res) {
    try {
      console.log('Usuario actualizando perfil. ID:', req.usuario.id);
      
      const { username } = req.body;
      
      // Validar datos de entrada
      if (!username) {
        return res.status(400).json({ 
          error: 'Se requiere nombre de usuario' 
        });
      }
      
      console.log('Actualizando perfil...');
      
      // Actualizar solo el nombre de usuario
      const usuario = await Usuario.actualizarPerfil(req.usuario.id, username);
      console.log('Perfil actualizado exitosamente');
      
      res.json({ usuario });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = usuariosController;