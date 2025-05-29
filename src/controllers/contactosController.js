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
      
      console.log(`Usuario ${usuarioId} intenta crear contacto:`, { nombre, telefono, email });
      
      // Validar datos requeridos
      if (!nombre || !telefono) {
        console.log('Datos incompletos:', { nombre: !!nombre, telefono: !!telefono });
        return res.status(400).json({ error: 'El nombre y teléfono son campos requeridos' });
      }
      
      // Verificar si ya existe un contacto con el mismo teléfono para este usuario
      try {
        const contactoExistente = await Contacto.buscarPorTelefonoYUsuario(telefono, usuarioId);
        if (contactoExistente) {
          console.log('Contacto duplicado detectado:', contactoExistente);
          return res.status(409).json({ 
            error: `Ya existe un contacto con el teléfono ${telefono}`,
            contactoExistente: {
              id: contactoExistente.id,
              nombre: contactoExistente.nombre,
              apellido: contactoExistente.apellido,
              telefono: contactoExistente.telefono
            }
          });
        }
      } catch (searchError) {
        // Si no se encuentra el contacto, es lo que esperamos, continuamos
        console.log('No se encontró contacto duplicado, continuando...');
      }
      
      // Verificar también por email si se proporcionó
      if (email) {
        try {
          const contactoExistentePorEmail = await Contacto.buscarPorEmailYUsuario(email, usuarioId);
          if (contactoExistentePorEmail) {
            console.log('Contacto con email duplicado detectado:', contactoExistentePorEmail);
            return res.status(409).json({ 
              error: `Ya existe un contacto con el email ${email}`,
              contactoExistente: {
                id: contactoExistentePorEmail.id,
                nombre: contactoExistentePorEmail.nombre,
                apellido: contactoExistentePorEmail.apellido,
                email: contactoExistentePorEmail.email
              }
            });
          }
        } catch (searchError) {
          // Si no se encuentra el contacto, es lo que esperamos, continuamos
          console.log('No se encontró contacto duplicado por email, continuando...');
        }
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
        console.log('Imagen procesada:', req.file.filename);
      }
      
      console.log('Creando contacto con datos:', contactoData);
      const contacto = await Contacto.crear(contactoData);
      console.log('Contacto creado exitosamente:', contacto.id);
      
      // Enviar correo de notificación si se proporcionó un email y es válido
      let infoCorreo = null;
      if (email && email.includes('@')) {
        try {
          console.log('Enviando notificación por correo a:', email);
          infoCorreo = await mailer.enviarNotificacionContacto(
            email, 
            `${nombre} ${apellido || ''}`, 
            nombreUsuario
          );
          console.log('Resultado envío correo:', infoCorreo);
        } catch (err) {
          console.error('Error al enviar notificación:', err);
          // No fallar la creación del contacto si falla el correo
        }
      }
      
      res.status(201).json({ 
        mensaje: 'Contacto creado exitosamente',
        contacto,
        notificacion: infoCorreo ? 
          { enviada: true, previewUrl: infoCorreo.previewUrl } : 
          { enviada: false } 
      });
    } catch (error) {
      console.error('Error al crear contacto:', error);
      
      // Si el error es de base de datos por restricción unique, manejarlo específicamente
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        if (error.message.includes('telefono')) {
          return res.status(409).json({ 
            error: 'Ya existe un contacto con este número de teléfono' 
          });
        }
        if (error.message.includes('email')) {
          return res.status(409).json({ 
            error: 'Ya existe un contacto con este email' 
          });
        }
      }
      
      res.status(500).json({ error: error.message });
    }
  },
  
  // Actualizar un contacto
  async actualizar(req, res) {
    try {
      const { nombre, apellido, telefono, email, direccion, categoria_id } = req.body;
      const usuarioId = req.usuario.id;
      const contactoId = req.params.id;
      
      console.log(`Usuario ${usuarioId} intenta actualizar contacto ${contactoId}:`, { nombre, telefono, email });
      
      // Validar datos requeridos
      if (!nombre || !telefono) {
        return res.status(400).json({ error: 'El nombre y teléfono son campos requeridos' });
      }
      
      // Verificar si ya existe otro contacto con el mismo teléfono para este usuario (excluyendo el actual)
      try {
        const contactoExistente = await Contacto.buscarPorTelefonoYUsuarioExcluyendo(telefono, usuarioId, contactoId);
        if (contactoExistente) {
          console.log('Contacto duplicado detectado en actualización:', contactoExistente);
          return res.status(409).json({ 
            error: `Ya existe otro contacto con el teléfono ${telefono}`,
            contactoExistente: {
              id: contactoExistente.id,
              nombre: contactoExistente.nombre,
              apellido: contactoExistente.apellido,
              telefono: contactoExistente.telefono
            }
          });
        }
      } catch (searchError) {
        // Si no se encuentra el contacto, es lo que esperamos, continuamos
        console.log('No se encontró contacto duplicado en actualización, continuando...');
      }
      
      // Verificar también por email si se proporcionó (excluyendo el actual)
      if (email) {
        try {
          const contactoExistentePorEmail = await Contacto.buscarPorEmailYUsuarioExcluyendo(email, usuarioId, contactoId);
          if (contactoExistentePorEmail) {
            console.log('Contacto con email duplicado detectado en actualización:', contactoExistentePorEmail);
            return res.status(409).json({ 
              error: `Ya existe otro contacto con el email ${email}`,
              contactoExistente: {
                id: contactoExistentePorEmail.id,
                nombre: contactoExistentePorEmail.nombre,
                apellido: contactoExistentePorEmail.apellido,
                email: contactoExistentePorEmail.email
              }
            });
          }
        } catch (searchError) {
          // Si no se encuentra el contacto, es lo que esperamos, continuamos
          console.log('No se encontró contacto duplicado por email en actualización, continuando...');
        }
      }
      
      // Obtener contacto actual para verificar si ya tiene imagen
      try {
        const contactoActual = await Contacto.buscarPorId(contactoId, usuarioId);
        
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
          console.log('Nueva imagen procesada:', req.file.filename);
          
          // Si ya tenía una imagen, eliminarla
          if (contactoActual.ruta_imagen) {
            const rutaImagen = path.join(__dirname, '../../public/img', contactoActual.ruta_imagen);
            if (fs.existsSync(rutaImagen)) {
              fs.unlinkSync(rutaImagen);
              console.log('Imagen anterior eliminada:', contactoActual.ruta_imagen);
            }
          }
        }
        
        console.log('Actualizando contacto con datos:', contactoData);
        const contacto = await Contacto.actualizar(contactoId, contactoData, usuarioId);
        console.log('Contacto actualizado exitosamente:', contacto.id);
        
        res.json({ 
          mensaje: 'Contacto actualizado exitosamente',
          contacto 
        });
      } catch (error) {
        if (error.message === 'Contacto no encontrado') {
          return res.status(404).json({ error: 'Contacto no encontrado o sin permisos' });
        }
        throw error;
      }
    } catch (error) {
      console.error('Error al actualizar contacto:', error);
      
      // Si el error es de base de datos por restricción unique, manejarlo específicamente
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        if (error.message.includes('telefono')) {
          return res.status(409).json({ 
            error: 'Ya existe otro contacto con este número de teléfono' 
          });
        }
        if (error.message.includes('email')) {
          return res.status(409).json({ 
            error: 'Ya existe otro contacto con este email' 
          });
        }
      }
      
      res.status(500).json({ error: error.message });
    }
  },
  
  // Eliminar un contacto
  async eliminar(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const contactoId = req.params.id;
      
      console.log(`Usuario ${usuarioId} intenta eliminar contacto ${contactoId}`);
      
      // Obtener contacto para eliminar su imagen si existe
      try {
        const contacto = await Contacto.buscarPorId(contactoId, usuarioId);
        
        if (contacto.ruta_imagen) {
          const rutaImagen = path.join(__dirname, '../../public/img', contacto.ruta_imagen);
          if (fs.existsSync(rutaImagen)) {
            fs.unlinkSync(rutaImagen);
            console.log('Imagen eliminada:', contacto.ruta_imagen);
          }
        }
        
        await Contacto.eliminar(contactoId, usuarioId);
        console.log('Contacto eliminado exitosamente:', contactoId);
        
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