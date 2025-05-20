const db = require('../db/database');
const bcrypt = require('bcrypt');

class Usuario {
  // Crear un nuevo usuario
  static crear(username, password) {
    return new Promise((resolve, reject) => {
      // Verificar si el usuario ya existe
      db.get('SELECT id FROM usuarios WHERE username = ?', [username], (err, row) => {
        if (err) {
          return reject(err);
        }
        if (row) {
          return reject(new Error('El nombre de usuario ya existe'));
        }

        // Encriptar la contraseña
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            return reject(err);
          }

          // Insertar el usuario en la base de datos
          db.run(
            'INSERT INTO usuarios (username, password) VALUES (?, ?)',
            [username, hash],
            function(err) {
              if (err) {
                return reject(err);
              }
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
      db.get('SELECT * FROM usuarios WHERE username = ?', [username], (err, usuario) => {
        if (err) {
          return reject(err);
        }
        if (!usuario) {
          return reject(new Error('Usuario o contraseña incorrectos'));
        }

        // Comparar la contraseña
        bcrypt.compare(password, usuario.password, (err, coincide) => {
          if (err) {
            return reject(err);
          }
          if (!coincide) {
            return reject(new Error('Usuario o contraseña incorrectos'));
          }
          resolve({ id: usuario.id, username: usuario.username });
        });
      });
    });
  }

  // Buscar usuario por ID
  static buscarPorId(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, username, fecha_creacion FROM usuarios WHERE id = ?', [id], (err, usuario) => {
        if (err) {
          return reject(err);
        }
        if (!usuario) {
          return reject(new Error('Usuario no encontrado'));
        }
        resolve(usuario);
      });
    });
  }
}

module.exports = Usuario;