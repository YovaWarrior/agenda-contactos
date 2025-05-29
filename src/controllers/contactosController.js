const Contacto = require('../models/contacto');
const Usuario = require('../models/usuario');
const path = require('path');
const fs = require('fs');
const mailer = require('../utils/mailer');

// Función para validar email con expresión regular 
function validarEmailEstructura(email) {
  if (!email || email.trim() === '') {
    return { valido: true, error: null }; 
  }
  
  // Expresión regular para emails
  const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return { valido: false, error: 'El formato del email no es válido' };
  }
  
  // Validaciones adicionales
  if (email.length > 254) {
    return { valido: false, error: 'El email es demasiado largo (máximo 254 caracteres)' };
  }
  
  const [localPart, domain] = email.split('@');
  
  if (localPart.length > 64) {
    return { valido: false, error: 'La parte local del email es demasiado larga (máximo 64 caracteres)' };
  }
  
  // Verificar que no empiece o termine con punto
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { valido: false, error: 'El email no puede empezar o terminar con punto' };
  }
  
  // Verificar que no tenga puntos consecutivos
  if (localPart.includes('..')) {
    return { valido: false, error: 'El email no puede tener puntos consecutivos' };
  }
  
  // Verificar dominios obvios inválidos
  const dominiosInvalidos = [
    'test.com', 'example.com', 'test.test', 'fake.com', 'invalid.com',
    'nomail.com', 'temp.com', 'dummy.com', 'sample.com', 'demo.com'
  ];
  
  if (dominiosInvalidos.includes(domain.toLowerCase())) {
    return { valido: false, error: 'Por favor ingresa un email real y válido' };
  }
  
  return { valido: true, error: null };
}

// Función para validar dominios comunes y conocidos
function validarDominioConocido(email) {
  if (!email || email.trim() === '') {
    return { valido: true, error: null };
  }
  
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) {
    return { valido: false, error: 'Formato de email inválido' };
  }
  
  // Lista de dominios conocidos y populares
  const dominiosConocidos = [
    // Principales proveedores
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com',
    'icloud.com', 'me.com', 'mac.com', 'aol.com', 'protonmail.com',
    
    // Educativos y empresariales
    'edu', 'edu.gt', 'usac.edu.gt', 'url.edu.gt', 'unis.edu.gt',
    'umg.edu.gt', 'ufm.edu.gt', 'upana.edu.gt',
    
    // Empresariales guatemaltecos
    'bancoindustrial.com', 'bam.com.gt', 'banrural.com.gt',
    'tigo.com.gt', 'claro.com.gt', 'movistar.com.gt',
    
    // Dominios de trabajo comunes
    'company.com', 'corp.com', 'work.com', 'office.com',
    
    // Otros populares
    'zoho.com', 'yandex.com', 'mail.com', 'gmx.com'
  ];
  
  // Verificar si el dominio o TLD es conocido
  const esConocido = dominiosConocidos.some(dominio => 
    domain === dominio || domain.endsWith('.' + dominio)
  );
  
  // Verificar TLDs comunes
  const tldComunes = [
    'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
    'gt', 'es', 'mx', 'co', 'uk', 'ca', 'de', 'fr', 'it',
    'com.gt', 'org.gt', 'net.gt', 'edu.gt', 'gob.gt'
  ];
  
  const tieneTldComun = tldComunes.some(tld => domain.endsWith('.' + tld));
  
  if (!esConocido && !tieneTldComun) {
    return { 
      valido: false, 
      error: 'Por favor ingresa un email con un dominio válido y reconocido (ej: gmail.com, yahoo.com, etc.)' 
    };
  }
  
  return { valido: true, error: null };
}

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
      
      // Validar email si se proporciona 
      if (email && email.trim() !== '') {
        console.log('Validando email:', email);
        
        // Validar estructura del email
        const validacionEstructura = validarEmailEstructura(email.trim());
        if (!validacionEstructura.valido) {
          console.log('Email con estructura inválida:', validacionEstructura.error);
          return res.status(400).json({ error: validacionEstructura.error });
        }
        
        // Validar dominio conocido
        const validacionDominio = validarDominioConocido(email.trim());
        if (!validacionDominio.valido) {
          console.log('Email con dominio inválido:', validacionDominio.error);
          return res.status(400).json({ error: validacionDominio.error });
        }
        
        console.log('Email validado correctamente');
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
      if (email && email.trim() !== '') {
        try {
          const contactoExistentePorEmail = await Contacto.buscarPorEmailYUsuario(email.trim(), usuarioId);
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
        email: email ? email.trim() : '',
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
      
      // Enviar correo de notificación si se proporcionó un email válido
      let infoCorreo = null;
      if (contactoData.email && contactoData.email.includes('@')) {
        try {
          console.log('Enviando notificación por correo a:', contactoData.email);
          infoCorreo = await mailer.enviarNotificacionContacto(
            contactoData.email, 
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
      
      // Validar email si se proporciona 
      if (email && email.trim() !== '') {
        console.log('Validando email en actualización:', email);
        
        // Validar estructura del email
        const validacionEstructura = validarEmailEstructura(email.trim());
        if (!validacionEstructura.valido) {
          console.log('Email con estructura inválida en actualización:', validacionEstructura.error);
          return res.status(400).json({ error: validacionEstructura.error });
        }
        
        // Validar dominio conocido
        const validacionDominio = validarDominioConocido(email.trim());
        if (!validacionDominio.valido) {
          console.log('Email con dominio inválido en actualización:', validacionDominio.error);
          return res.status(400).json({ error: validacionDominio.error });
        }
        
        console.log('Email validado correctamente en actualización');
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
      if (email && email.trim() !== '') {
        try {
          const contactoExistentePorEmail = await Contacto.buscarPorEmailYUsuarioExcluyendo(email.trim(), usuarioId, contactoId);
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
          email: email ? email.trim() : '',
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