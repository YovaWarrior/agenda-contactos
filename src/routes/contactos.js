const express = require('express');
const router = express.Router();
const contactosController = require('../controllers/contactosController');
const verificarToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configurar multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/img'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'contacto-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Error: Solo se permiten imágenes (jpg, jpeg, png, gif)'));
  }
});

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// Rutas CRUD
router.get('/', contactosController.listar);
router.get('/buscar', contactosController.buscar);
router.get('/categoria/:categoriaId', contactosController.buscarPorCategoria);
router.get('/:id', contactosController.obtener);
router.post('/', upload.single('imagen'), contactosController.crear);
router.put('/:id', upload.single('imagen'), contactosController.actualizar);
router.delete('/:id', contactosController.eliminar);

module.exports = router;