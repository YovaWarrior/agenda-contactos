CREATE TABLE usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
      );
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE categorias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          usuario_id INTEGER,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
          UNIQUE(nombre, usuario_id)
        );
CREATE TABLE contactos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            apellido TEXT,
            telefono TEXT NOT NULL,
            email TEXT,
            direccion TEXT,
            categoria_id INTEGER,
            usuario_id INTEGER NOT NULL,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (categoria_id) REFERENCES categorias(id),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
          );
CREATE TABLE imagenes_contacto (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              contacto_id INTEGER UNIQUE,
              ruta_imagen TEXT NOT NULL,
              FOREIGN KEY (contacto_id) REFERENCES contactos(id) ON DELETE CASCADE
            );
