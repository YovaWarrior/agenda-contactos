const Contacto = require('../models/contacto');
const path = require('path');
const fs = require('fs');

const contactosController = {
  // Listar todos los contactos
  async listar(req, res) {
    try {
      const contactos = await Contacto.listar();
      res.json({ contactos });
    } catch (error) {
      console.error('Error al listar contactos:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Obtener un contacto por ID
  async obtener(req, res) {
    try {
      const contacto = await Contacto.buscarPorId(req.params.id);
      res.json({ contacto });
    } catch (error) {
      console.error('Error al obtener contacto:', error);
      res.status(404).json({ error: error.message });
    }
  },
  
  // Buscar contactos por término (nombre o teléfono)
  async buscar(req, res) {
    try {
      const { termino } = req.query;
      
      if (!termino) {
        return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
      }
      
      const contactos = await Contacto.buscar(termino);
      res.json({ contactos });
    } catch (error) {
      console.error('Error al buscar contactos:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Buscar contactos por categoría
  async buscarPorCategoria(req, res) {
    try {
      const contactos = await Contacto.buscarPorCategoria(req.params.categoriaId);
      res.json({ contactos });
    } catch (error) {
      console.error('Error al buscar contactos por categoría:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Crear un nuevo contacto
  async crear(req, res) {
    try {
      const { nombre, apellido, telefono, email, direccion, categoria_id } = req.body;
      
      // Validar datos requeridos
      if (!nombre || !telefono) {
        return res.status(400).json({ error: 'El nombre y teléfono son campos requeridos' });
      }
      
      // Crear objeto de contacto
      const contactoData = {
        nombre,
        apellido: apellido || '',
        telefono,
        email: email || '',
        direccion: direccion || '',
        categoria_id: categoria_id || null
      };
      
      // Si se envió una imagen
      if (req.file) {
        contactoData.ruta_imagen = req.file.filename;
      }
      
      const contacto = await Contacto.crear(contactoData);
      res.status(201).json({ contacto });
    } catch (error) {
      console.error('Error al crear contacto:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Actualizar un contacto
  async actualizar(req, res) {
    try {
      const { nombre, apellido, telefono, email, direccion, categoria_id } = req.body;
      
      // Validar datos requeridos
      if (!nombre || !telefono) {
        return res.status(400).json({ error: 'El nombre y teléfono son campos requeridos' });
      }
      
      // Obtener contacto actual para verificar si ya tiene imagen
      const contactoActual = await Contacto.buscarPorId(req.params.id);
      
      // Crear objeto de contacto
      const contactoData = {
        nombre,
        apellido: apellido || '',
        telefono,
        email: email || '',
        direccion: direccion || '',
        categoria_id: categoria_id || null
      };
      
      // Si se envió una nueva imagen
      if (req.file) {
        contactoData.ruta_imagen = req.file.filename;
        
        // Si ya tenía una imagen, eliminarla
        if (contactoActual.ruta_imagen) {
          const rutaImagen = path.join(__dirname, '../../public/img', contactoActual.ruta_imagen);
          if (fs.existsSync(rutaImagen)) {
            fs.unlinkSync(rutaImagen);
          }
        }
      }
      
      const contacto = await Contacto.actualizar(req.params.id, contactoData);
      res.json({ contacto });
    } catch (error) {
      console.error('Error al actualizar contacto:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Eliminar un contacto
  async eliminar(req, res) {
    try {
      // Obtener contacto para eliminar su imagen si existe
      const contacto = await Contacto.buscarPorId(req.params.id);
      
      if (contacto.ruta_imagen) {
        const rutaImagen = path.join(__dirname, '../../public/img', contacto.ruta_imagen);
        if (fs.existsSync(rutaImagen)) {
          fs.unlinkSync(rutaImagen);
        }
      }
      
      await Contacto.eliminar(req.params.id);
      res.json({ mensaje: 'Contacto eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = contactosController;