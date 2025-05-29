const db = require('../db/database');

class Contacto {
  // Listar todos los contactos del usuario
  static listar(usuarioId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, cat.nombre as categoria_nombre, img.ruta_imagen
        FROM contactos c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        LEFT JOIN imagenes_contacto img ON c.id = img.contacto_id
        WHERE c.usuario_id = ?
        ORDER BY c.nombre
      `;
      
      db.all(query, [usuarioId], (err, contactos) => {
        if (err) {
          return reject(err);
        }
        resolve(contactos);
      });
    });
  }

  // Buscar contacto por ID (con verificación de usuario)
  static buscarPorId(id, usuarioId = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT c.*, cat.nombre as categoria_nombre, img.ruta_imagen
        FROM contactos c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        LEFT JOIN imagenes_contacto img ON c.id = img.contacto_id
        WHERE c.id = ?
      `;
      
      let params = [id];
      
      if (usuarioId) {
        query += ' AND c.usuario_id = ?';
        params.push(usuarioId);
      }
      
      db.get(query, params, (err, contacto) => {
        if (err) {
          return reject(err);
        }
        if (!contacto) {
          return reject(new Error('Contacto no encontrado'));
        }
        resolve(contacto);
      });
    });
  }

  // Buscar contacto por teléfono y usuario (para prevenir duplicados)
  static buscarPorTelefonoYUsuario(telefono, usuarioId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, cat.nombre as categoria_nombre, img.ruta_imagen
        FROM contactos c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        LEFT JOIN imagenes_contacto img ON c.id = img.contacto_id
        WHERE c.telefono = ? AND c.usuario_id = ?
      `;
      
      db.get(query, [telefono, usuarioId], (err, contacto) => {
        if (err) {
          return reject(err);
        }
        if (!contacto) {
          return reject(new Error('Contacto no encontrado'));
        }
        resolve(contacto);
      });
    });
  }

  // Buscar contacto por teléfono y usuario excluyendo uno específico (para actualizaciones)
  static buscarPorTelefonoYUsuarioExcluyendo(telefono, usuarioId, contactoIdExcluir) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, cat.nombre as categoria_nombre, img.ruta_imagen
        FROM contactos c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        LEFT JOIN imagenes_contacto img ON c.id = img.contacto_id
        WHERE c.telefono = ? AND c.usuario_id = ? AND c.id != ?
      `;
      
      db.get(query, [telefono, usuarioId, contactoIdExcluir], (err, contacto) => {
        if (err) {
          return reject(err);
        }
        if (!contacto) {
          return reject(new Error('Contacto no encontrado'));
        }
        resolve(contacto);
      });
    });
  }

  // Buscar contacto por email y usuario (para prevenir duplicados)
  static buscarPorEmailYUsuario(email, usuarioId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, cat.nombre as categoria_nombre, img.ruta_imagen
        FROM contactos c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        LEFT JOIN imagenes_contacto img ON c.id = img.contacto_id
        WHERE c.email = ? AND c.usuario_id = ? AND c.email != ''
      `;
      
      db.get(query, [email, usuarioId], (err, contacto) => {
        if (err) {
          return reject(err);
        }
        if (!contacto) {
          return reject(new Error('Contacto no encontrado'));
        }
        resolve(contacto);
      });
    });
  }

  // Buscar contacto por email y usuario excluyendo uno específico (para actualizaciones)
  static buscarPorEmailYUsuarioExcluyendo(email, usuarioId, contactoIdExcluir) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, cat.nombre as categoria_nombre, img.ruta_imagen
        FROM contactos c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        LEFT JOIN imagenes_contacto img ON c.id = img.contacto_id
        WHERE c.email = ? AND c.usuario_id = ? AND c.id != ? AND c.email != ''
      `;
      
      db.get(query, [email, usuarioId, contactoIdExcluir], (err, contacto) => {
        if (err) {
          return reject(err);
        }
        if (!contacto) {
          return reject(new Error('Contacto no encontrado'));
        }
        resolve(contacto);
      });
    });
  }

  // Buscar contactos por categoría
  static buscarPorCategoria(categoriaId, usuarioId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, cat.nombre as categoria_nombre, img.ruta_imagen
        FROM contactos c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        LEFT JOIN imagenes_contacto img ON c.id = img.contacto_id
        WHERE c.categoria_id = ? AND c.usuario_id = ?
        ORDER BY c.nombre
      `;
      
      db.all(query, [categoriaId, usuarioId], (err, contactos) => {
        if (err) {
          return reject(err);
        }
        resolve(contactos);
      });
    });
  }

  // Buscar contactos por nombre o teléfono
  static buscar(termino, usuarioId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, cat.nombre as categoria_nombre, img.ruta_imagen
        FROM contactos c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        LEFT JOIN imagenes_contacto img ON c.id = img.contacto_id
        WHERE (c.nombre LIKE ? OR c.telefono LIKE ?) AND c.usuario_id = ?
        ORDER BY c.nombre
      `;
      
      const parametro = `%${termino}%`;
      db.all(query, [parametro, parametro, usuarioId], (err, contactos) => {
        if (err) {
          return reject(err);
        }
        resolve(contactos);
      });
    });
  }

  // Crear un nuevo contacto
  static crear(contactoData) {
    return new Promise((resolve, reject) => {
      const { nombre, apellido, telefono, email, direccion, categoria_id, usuario_id, ruta_imagen } = contactoData;
      
      console.log('Iniciando creación de contacto en base de datos:', { nombre, telefono, email });
      
      db.run(
        'INSERT INTO contactos (nombre, apellido, telefono, email, direccion, categoria_id, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nombre, apellido, telefono, email, direccion, categoria_id, usuario_id],
        function(err) {
          if (err) {
            console.error('Error al insertar contacto:', err);
            return reject(err);
          }
          
          const contactoId = this.lastID;
          console.log('Contacto insertado con ID:', contactoId);
          
          // Si se proporcionó una imagen, guardarla
          if (ruta_imagen) {
            console.log('Guardando imagen del contacto:', ruta_imagen);
            db.run(
              'INSERT INTO imagenes_contacto (contacto_id, ruta_imagen) VALUES (?, ?)',
              [contactoId, ruta_imagen],
              (err) => {
                if (err) {
                  console.error('Error al guardar imagen:', err);
                  return reject(err);
                }
                console.log('Imagen guardada exitosamente');
                
                // Obtener el contacto completo
                Contacto.buscarPorId(contactoId)
                  .then(contacto => {
                    console.log('Contacto creado completamente:', contacto);
                    resolve(contacto);
                  })
                  .catch(err => reject(err));
              }
            );
          } else {
            // Obtener el contacto sin imagen
            Contacto.buscarPorId(contactoId)
              .then(contacto => {
                console.log('Contacto creado completamente (sin imagen):', contacto);
                resolve(contacto);
              })
              .catch(err => reject(err));
          }
        }
      );
    });
  }

  // Actualizar contacto
  static actualizar(id, contactoData, usuarioId) {
    return new Promise((resolve, reject) => {
      const { nombre, apellido, telefono, email, direccion, categoria_id, ruta_imagen } = contactoData;
      
      console.log('Iniciando actualización de contacto en base de datos:', { id, nombre, telefono, email });
      
      db.run(
        'UPDATE contactos SET nombre = ?, apellido = ?, telefono = ?, email = ?, direccion = ?, categoria_id = ? WHERE id = ? AND usuario_id = ?',
        [nombre, apellido, telefono, email, direccion, categoria_id, id, usuarioId],
        function(err) {
          if (err) {
            console.error('Error al actualizar contacto:', err);
            return reject(err);
          }
          
          if (this.changes === 0) {
            console.log('No se encontró contacto para actualizar o sin permisos');
            return reject(new Error('Contacto no encontrado o sin permisos'));
          }
          
          console.log('Contacto actualizado, changes:', this.changes);
          
          // Si se proporcionó una imagen, actualizarla o crearla
          if (ruta_imagen) {
            console.log('Actualizando imagen del contacto:', ruta_imagen);
            db.get('SELECT id FROM imagenes_contacto WHERE contacto_id = ?', [id], (err, row) => {
              if (err) {
                console.error('Error al buscar imagen existente:', err);
                return reject(err);
              }
              
              if (row) {
                // Actualizar imagen existente
                console.log('Actualizando imagen existente');
                db.run(
                  'UPDATE imagenes_contacto SET ruta_imagen = ? WHERE contacto_id = ?',
                  [ruta_imagen, id],
                  (err) => {
                    if (err) {
                      console.error('Error al actualizar imagen:', err);
                      return reject(err);
                    }
                    console.log('Imagen actualizada exitosamente');
                    
                    Contacto.buscarPorId(id)
                      .then(contacto => {
                        console.log('Contacto actualizado completamente:', contacto);
                        resolve(contacto);
                      })
                      .catch(err => reject(err));
                  }
                );
              } else {
                // Crear nueva imagen
                console.log('Creando nueva imagen');
                db.run(
                  'INSERT INTO imagenes_contacto (contacto_id, ruta_imagen) VALUES (?, ?)',
                  [id, ruta_imagen],
                  (err) => {
                    if (err) {
                      console.error('Error al crear imagen:', err);
                      return reject(err);
                    }
                    console.log('Nueva imagen creada exitosamente');
                    
                    Contacto.buscarPorId(id)
                      .then(contacto => {
                        console.log('Contacto actualizado completamente:', contacto);
                        resolve(contacto);
                      })
                      .catch(err => reject(err));
                  }
                );
              }
            });
          } else {
            // Sin imagen, obtener contacto actualizado
            Contacto.buscarPorId(id)
              .then(contacto => {
                console.log('Contacto actualizado completamente (sin imagen):', contacto);
                resolve(contacto);
              })
              .catch(err => reject(err));
          }
        }
      );
    });
  }

  // Eliminar contacto
  static eliminar(id, usuarioId) {
    return new Promise((resolve, reject) => {
      console.log('Iniciando eliminación de contacto:', { id, usuarioId });
      
      // Primero eliminamos las imágenes asociadas
      db.run('DELETE FROM imagenes_contacto WHERE contacto_id = ?', [id], (err) => {
        if (err) {
          console.error('Error al eliminar imagen del contacto:', err);
          return reject(err);
        }
        
        console.log('Imagen del contacto eliminada (si existía)');
        
        // Luego eliminamos el contacto
        db.run('DELETE FROM contactos WHERE id = ? AND usuario_id = ?', [id, usuarioId], function(err) {
          if (err) {
            console.error('Error al eliminar contacto:', err);
            return reject(err);
          }
          
          if (this.changes === 0) {
            console.log('No se encontró contacto para eliminar o sin permisos');
            return reject(new Error('Contacto no encontrado o sin permisos'));
          }
          
          console.log('Contacto eliminado exitosamente, changes:', this.changes);
          resolve({ eliminado: true });
        });
      });
    });
  }
}

module.exports = Contacto;