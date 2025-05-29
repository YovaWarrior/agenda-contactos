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
      
      // Validar requisitos de la nueva contraseña - USANDO FUNCIÓN MEJORADA
      console.log('Validando nueva contraseña:', passwordNueva);
      const passwordValidation = validatePassword(passwordNueva);
      if (!passwordValidation.isValid) {
        console.log('Nueva contraseña no cumple requisitos:', passwordValidation.errors);
        return res.status(400).json({
          error: 'La nueva contraseña no cumple con los requisitos de seguridad',
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

// Función para validar contraseña - MISMA QUE EN authController
function validatePassword(password) {
  console.log('Validando contraseña en usuariosController:', password);
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

module.exports = usuariosController;