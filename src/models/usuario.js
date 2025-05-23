// src/models/usuario.js
const db = require('../db/database');
const bcrypt = require('bcrypt');

class Usuario {
  // Crear un nuevo usuario
  static crear(username, password) {
    return new Promise((resolve, reject) => {
      console.log('Verificando si el usuario ya existe:', username);
      // Verificar si el usuario ya existe
      db.get('SELECT id FROM usuarios WHERE username = ?', [username], (err, row) => {
        if (err) {
          console.error('Error al verificar usuario existente:', err);
          return reject(err);
        }
        if (row) {
          console.log('El usuario ya existe');
          return reject(new Error('El nombre de usuario ya existe'));
        }

        console.log('Encriptando contraseña...');
        // Encriptar la contraseña
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            console.error('Error al encriptar contraseña:', err);
            return reject(err);
          }

          console.log('Insertando usuario en la base de datos...');
          // Insertar el usuario en la base de datos
          db.run(
            'INSERT INTO usuarios (username, password) VALUES (?, ?)',
            [username, hash],
            function(err) {
              if (err) {
                console.error('Error al insertar usuario:', err);
                return reject(err);
              }
              console.log('Usuario insertado correctamente, ID:', this.lastID);
              resolve({ id: this.lastID, username });
            }
          );
        });
      });
    });
  }

  // Verificar credenciales de usuario
  static verificar(username, password) {
    return new Promise((resolve, reject) => {
      console.log('Buscando usuario en la base de datos:', username);
      db.get('SELECT * FROM usuarios WHERE username = ?', [username], (err, usuario) => {
        if (err) {
          console.error('Error al buscar usuario:', err);
          return reject(err);
        }
        if (!usuario) {
          console.log('Usuario no encontrado');
          return reject(new Error('Usuario o contraseña incorrectos'));
        }

        console.log('Usuario encontrado, verificando contraseña...');
        // Comparar la contraseña
        bcrypt.compare(password, usuario.password, (err, coincide) => {
          if (err) {
            console.error('Error al comparar contraseñas:', err);
            return reject(err);
          }
          if (!coincide) {
            console.log('Contraseña incorrecta');
            return reject(new Error('Usuario o contraseña incorrectos'));
          }
          console.log('Contraseña correcta, autenticación exitosa');
          resolve({ id: usuario.id, username: usuario.username });
        });
      });
    });
  }

  // Buscar usuario por ID
  static buscarPorId(id) {
    return new Promise((resolve, reject) => {
      console.log('Buscando usuario por ID:', id);
      db.get('SELECT id, username, fecha_creacion FROM usuarios WHERE id = ?', [id], (err, usuario) => {
        if (err) {
          console.error('Error al buscar usuario por ID:', err);
          return reject(err);
        }
        if (!usuario) {
          console.log('Usuario no encontrado');
          return reject(new Error('Usuario no encontrado'));
        }
        console.log('Usuario encontrado');
        resolve(usuario);
      });
    });
  }

  // Listar todos los usuarios
  static listarTodos() {
    return new Promise((resolve, reject) => {
      console.log('Obteniendo lista de todos los usuarios');
      db.all('SELECT id, username, fecha_creacion FROM usuarios ORDER BY id', (err, usuarios) => {
        if (err) {
          console.error('Error al listar usuarios:', err);
          return reject(err);
        }
        console.log(`Se encontraron ${usuarios.length} usuarios`);
        resolve(usuarios);
      });
    });
  }

  // Actualizar un usuario
  static actualizar(id, userData) {
    return new Promise((resolve, reject) => {
      console.log(`Actualizando usuario ID ${id}`);
      
      // Verificar si el usuario existe
      this.buscarPorId(id)
        .then(usuario => {
          const { username, password } = userData;
          
          // Si no hay contraseña, solo actualizar nombre de usuario
          if (!password) {
            console.log('Actualizando solo nombre de usuario');
            db.run(
              'UPDATE usuarios SET username = ? WHERE id = ?',
              [username, id],
              function(err) {
                if (err) {
                  console.error('Error al actualizar usuario:', err);
                  return reject(err);
                }
                if (this.changes === 0) {
                  return reject(new Error('Usuario no encontrado'));
                }
                resolve({ id, username });
              }
            );
          } else {
            // Si hay contraseña, encriptarla y actualizar todo
            console.log('Actualizando nombre de usuario y contraseña');
            bcrypt.hash(password, 10, (err, hash) => {
              if (err) {
                console.error('Error al encriptar contraseña:', err);
                return reject(err);
              }
              
              db.run(
                'UPDATE usuarios SET username = ?, password = ? WHERE id = ?',
                [username, hash, id],
                function(err) {
                  if (err) {
                    console.error('Error al actualizar usuario:', err);
                    return reject(err);
                  }
                  if (this.changes === 0) {
                    return reject(new Error('Usuario no encontrado'));
                  }
                  resolve({ id, username });
                }
              );
            });
          }
        })
        .catch(err => {
          console.error('Error al buscar usuario para actualizar:', err);
          reject(err);
        });
    });
  }

  // Eliminar un usuario
  static eliminar(id) {
    return new Promise((resolve, reject) => {
      console.log(`Eliminando usuario ID ${id}`);
      
      // No permitir eliminar el usuario administrador (ID 1)
      if (id === 1) {
        console.error('No se puede eliminar el usuario administrador');
        return reject(new Error('No se puede eliminar el usuario administrador'));
      }
      
      db.run('DELETE FROM usuarios WHERE id = ?', [id], function(err) {
        if (err) {
          console.error('Error al eliminar usuario:', err);
          return reject(err);
        }
        if (this.changes === 0) {
          console.error('Usuario no encontrado para eliminar');
          return reject(new Error('Usuario no encontrado'));
        }
        console.log('Usuario eliminado correctamente');
        resolve({ eliminado: true });
      });
    });
  }
}

module.exports = Usuario;