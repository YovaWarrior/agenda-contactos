// src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const usuariosController = require('../controllers/usuariosController');
const verificarToken = require('../middleware/auth');

// Rutas públicas
router.post('/registro', authController.registrar);
router.post('/login', authController.login);

// Rutas protegidas para gestión personal
router.get('/perfil', verificarToken, authController.perfil);
router.get('/mi-perfil', verificarToken, usuariosController.obtenerPerfil);
router.put('/cambiar-contrasena', verificarToken, usuariosController.cambiarContrasena);
router.put('/actualizar-perfil', verificarToken, usuariosController.actualizarPerfil);

module.exports = router;