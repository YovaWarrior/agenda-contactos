const Contacto = require('../models/contacto');
const Usuario = require('../models/usuario');
const path = require('path');
const fs = require('fs');
const mailer = require('../utils/mailer');

const contactosController = {
  // Listar todos los contactos del usuario autenticado
  async listar(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const contactos = await Contacto.listar(usuarioId);
      res.json({ contactos });
    } catch (error) {
      console.error('Error al listar contactos:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Obtener un contacto por ID
  async obtener(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const contacto = await Contacto.buscarPorId(req.params.id, usuarioId);
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
      const usuarioId = req.usuario.id;
      
      if (!termino) {
        return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
      }
      
      const contactos = await Contacto.buscar(termino, usuarioId);
      res.json({ contactos });
    } catch (error) {
      console.error('Error al buscar contactos:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Buscar contactos por categoría
  async buscarPorCategoria(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const contactos = await Contacto.buscarPorCategoria(req.params.categoriaId, usuarioId);
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
      const usuarioId = req.usuario.id;
      
      // Validar datos requeridos
      if (!nombre || !telefono) {
        return res.status(400).json({ error: 'El nombre y teléfono son campos requeridos' });
      }
      
      // Obtener información del usuario para el correo
      let nombreUsuario = 'usuario';
      try {
        const usuario = await Usuario.buscarPorId(usuarioId);
        nombreUsuario = usuario.username;
      } catch (err) {
        console.error('No se pudo obtener información del usuario:', err);
      }
      
      // Crear objeto de contacto
      const contactoData = {
        nombre,
        apellido: apellido || '',
        telefono,
        email: email || '',
        direccion: direccion || '',
        categoria_id: categoria_id || null,
        usuario_id: usuarioId
      };
      
      // Si se envió una imagen
      if (req.file) {
        contactoData.ruta_imagen = req.file.filename;
      }
      
      const contacto = await Contacto.crear(contactoData);
      
      // Enviar correo de notificación si se proporcionó un email
      let infoCorreo = null;
      if (email) {
        try {
          infoCorreo = await mailer.enviarNotificacionContacto(
            email, 
            `${nombre} ${apellido || ''}`, 
            nombreUsuario
          );
          console.log('Resultado envío correo:', infoCorreo);
        } catch (err) {
          console.error('Error al enviar notificación:', err);
        }
      }
      
      res.status(201).json({ 
        contacto,
        notificacion: infoCorreo ? 
          { enviada: true, previewUrl: infoCorreo.previewUrl } : 
          { enviada: false } 
      });
    } catch (error) {
      console.error('Error al crear contacto:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Actualizar un contacto
  async actualizar(req, res) {
    try {
      const { nombre, apellido, telefono, email, direccion, categoria_id } = req.body;
      const usuarioId = req.usuario.id;
      
      // Validar datos requeridos
      if (!nombre || !telefono) {
        return res.status(400).json({ error: 'El nombre y teléfono son campos requeridos' });
      }
      
      // Obtener contacto actual para verificar si ya tiene imagen
      try {
        const contactoActual = await Contacto.buscarPorId(req.params.id, usuarioId);
        
        // Crear objeto de contacto
        const contactoData = {
          nombre,
          apellido: apellido || '',
          telefono,
          email: email || '',
          direccion: direccion || '',
          categoria_id: categoria_id || null,
          usuario_id: usuarioId
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
        
        const contacto = await Contacto.actualizar(req.params.id, contactoData, usuarioId);
        res.json({ contacto });
      } catch (error) {
        if (error.message === 'Contacto no encontrado') {
          return res.status(404).json({ error: 'Contacto no encontrado o sin permisos' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al actualizar contacto:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Eliminar un contacto
  async eliminar(req, res) {
    try {
      const usuarioId = req.usuario.id;
      
      // Obtener contacto para eliminar su imagen si existe
      try {
        const contacto = await Contacto.buscarPorId(req.params.id, usuarioId);
        
        if (contacto.ruta_imagen) {
          const rutaImagen = path.join(__dirname, '../../public/img', contacto.ruta_imagen);
          if (fs.existsSync(rutaImagen)) {
            fs.unlinkSync(rutaImagen);
          }
        }
        
        await Contacto.eliminar(req.params.id, usuarioId);
        res.json({ mensaje: 'Contacto eliminado correctamente' });
      } catch (error) {
        if (error.message === 'Contacto no encontrado') {
          return res.status(404).json({ error: 'Contacto no encontrado o sin permisos' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = contactosController;