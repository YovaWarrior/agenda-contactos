PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
      );
INSERT INTO usuarios VALUES(1,'admin','$2b$10$hRd6DZgT.LYeB/tReu8gWuFpkvDKm6SIfPq6FBqiIrGpNlSeg2eQG','2025-05-20 22:16:49');
INSERT INTO usuarios VALUES(2,'gabriel','$2b$10$E6gZ73hj/Qm63PbV1Si90.YzzESZoZRitfJOBLhhyq1mJsFLrrAUi','2025-05-20 22:29:15');
INSERT INTO usuarios VALUES(3,'Carlos1','$2b$10$wMcTYKRFlqxTCqAP3nQ5DepVwsT53ucjliJDBA9c4uCJlHKZGfeKO','2025-05-20 22:44:40');
INSERT INTO usuarios VALUES(4,'Andy','$2b$10$w/3IJyNmx.ZOlJCc5hLr5OzouYqfdKsruTM7pJyaUCRQphk1NXgCS','2025-05-21 01:31:04');
INSERT INTO usuarios VALUES(5,'Gabriel','$2b$10$odJw17SFETZxKYV4PywOcemKbTNWoNLymRIaId5L8Pd4b0W.mecZm','2025-05-21 02:11:09');
INSERT INTO usuarios VALUES(6,'Carlos','$2b$10$w0z12oewKNLvppDHhRcY7e3nA9rB22hNF1hDa3fknfZ/UszEjRro6','2025-05-24 14:51:09');
INSERT INTO usuarios VALUES(7,'CarlosG','$2b$10$EjyYYGoFdn80pynpDyiGpuhosJ2hksfTdOuBYtcZwPxvwEI5vkFlO','2025-05-25 21:21:43');
INSERT INTO usuarios VALUES(8,'Andor','$2b$10$kVfzmwkEyfz/wtCEq35y8Oz1dGzjLz7ADn4YjZ8Zka6j/VRwfcg5y','2025-05-29 05:29:49');
INSERT INTO usuarios VALUES(9,'Carlos1234','$2b$10$5J.bq28NDQdxTX/a.wDnR.oxD.JnOYztHD4ynOPqBBRHv4VLcmAsG','2025-05-29 05:58:49');
INSERT INTO usuarios VALUES(10,'Rocia1','$2b$10$egwO./R/CFhzYBeNt2P/PuXACzO6dqhxLyZLbfo7X0uWSwXqZGB12','2025-05-29 07:27:31');
INSERT INTO usuarios VALUES(11,'Juan24','$2b$10$jeHomp4ZrLvMGxIjqhYyl.ONIAoJt3AB6a07zYqsUsB1XIzDqoOn.','2025-05-29 09:01:39');
INSERT INTO usuarios VALUES(12,'Jose1','$2b$10$Oud6tq3A7os4b1RtzKu.nePZjqW.DK2jYVniMA7eVeOzJrAHbobV6','2025-05-29 09:11:32');
CREATE TABLE categorias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          usuario_id INTEGER,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
          UNIQUE(nombre, usuario_id)
        );
INSERT INTO categorias VALUES(1,'Trabajo',1);
INSERT INTO categorias VALUES(2,'Familia',1);
INSERT INTO categorias VALUES(3,'Amigos',1);
INSERT INTO categorias VALUES(4,'Otros',1);
INSERT INTO categorias VALUES(5,'futbol',1);
INSERT INTO categorias VALUES(6,'Futbol',3);
INSERT INTO categorias VALUES(7,'Familia',3);
INSERT INTO categorias VALUES(8,'Familia',5);
INSERT INTO categorias VALUES(10,'RApido',3);
INSERT INTO categorias VALUES(11,'Carlitos',9);
INSERT INTO categorias VALUES(12,'Familia',10);
INSERT INTO categorias VALUES(13,'Trabajo',10);
INSERT INTO categorias VALUES(14,'Otros',10);
INSERT INTO categorias VALUES(15,'Familia',11);
INSERT INTO categorias VALUES(16,'Universidad',11);
INSERT INTO categorias VALUES(17,'Trabajo',11);
INSERT INTO categorias VALUES(20,'FUtbol',12);
INSERT INTO categorias VALUES(22,'chaco',12);
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
INSERT INTO contactos VALUES(1,'Carlos','Martinez','54612892','carlosmartinezcrl7@gmail.com','Puerto Barrios, Izabal, Guatemala',3,1,'2025-05-20 22:27:17');
INSERT INTO contactos VALUES(2,'Vabajaja','Kskskksja','7277272772','carlosmartinezcrl7@gmail.com','Puerto ',NULL,1,'2025-05-20 22:46:34');
INSERT INTO contactos VALUES(3,'Erick','Ortiz','42718392','erickortiz13@gmail.com','Izabal, Guatemala',1,1,'2025-05-20 22:48:21');
INSERT INTO contactos VALUES(4,'Andy','Aquíno','51627281','bummerescobar@gmail.com','Izabal, Guatemala',4,1,'2025-05-20 23:05:37');
INSERT INTO contactos VALUES(5,'Erick','Ortiz','61171617','guerraerick54@gmail.com','Izabal, Guatemala',NULL,1,'2025-05-20 23:06:42');
INSERT INTO contactos VALUES(6,'Carlitos','MArtinez','54612892','carlosmartinezcrl7@gmail.com','Puerto Barrios, Izabal, Guatemala',3,1,'2025-05-20 23:09:11');
INSERT INTO contactos VALUES(7,'CAslos','MAerrt','54612892','carlosmartinezcrl7@gmail.com','puerto barrios',3,1,'2025-05-20 23:15:58');
INSERT INTO contactos VALUES(8,'Erick','Ortiz','7282929','guerraerick54@gmail.com','Izabal, Guatemala',3,1,'2025-05-20 23:18:28');
INSERT INTO contactos VALUES(9,'Ioni','Rodas','58160315','ionirodas20@gmail.com','Izabal, Guatemala',3,1,'2025-05-20 23:21:26');
INSERT INTO contactos VALUES(10,'Andy','Aquino','37167001','bummerescobar@gmail.com','Entre Rios, Izabal, Guatemala',6,3,'2025-05-21 02:09:59');
INSERT INTO contactos VALUES(12,'Carlos','Martinez','54612892','carlosmartinezcrl7@gmail.com','Puerto Barrios, Izabal, Guatemala',8,5,'2025-05-21 02:12:03');
INSERT INTO contactos VALUES(13,'Erick','Ortiz','32833541','guerraerick54@gmail.com','Residenciales 2 puertos, Puerto Barrios',6,3,'2025-05-21 02:31:21');
INSERT INTO contactos VALUES(15,'Eirkc','','62819201','guerraerick54@gmail.com','',NULL,4,'2025-05-21 02:44:03');
INSERT INTO contactos VALUES(16,'CArlos','Martinez','52617291','carlosmartinezcrl7@gmail.com','Puerto',NULL,4,'2025-05-21 02:45:06');
INSERT INTO contactos VALUES(17,'Ericksad','asad','505050','guerraerick54@gmail.com','Puerto',NULL,4,'2025-05-21 02:52:17');
INSERT INTO contactos VALUES(19,'Carlos ','Carlos Martínez','5461292992','carlosmartinezcrl7@gmail.com','Izabal, Guatemala',7,3,'2025-05-21 03:00:10');
INSERT INTO contactos VALUES(20,'Cr7','DOs SAntos','32833541','carlosmartinezcrl7@gmail.com','Entre Rios, Izabal, Guatemala',NULL,4,'2025-05-21 05:35:07');
INSERT INTO contactos VALUES(21,'Messi','Leo','52617282','carlosmartinezcrl7@gmail.com','Izabal, Guatemala',6,3,'2025-05-21 05:39:58');
INSERT INTO contactos VALUES(22,'Yova','Warrior','722727272','carlosmartinezcrl7@gmail.com','Izabal, Guatemala',NULL,3,'2025-05-21 05:43:32');
INSERT INTO contactos VALUES(23,'ANdy','MAs','123123121','carlosmartinezcrl7@gmail.com','Residenciales 2 puertos, Puerto Barrios',10,3,'2025-05-23 03:36:08');
INSERT INTO contactos VALUES(24,'carlos','martinez','32123432','ealvarez@gmail.com','Residenciales 2 puertos, Puerto Barrios',NULL,6,'2025-05-24 14:52:27');
INSERT INTO contactos VALUES(25,'Carlitos','Martinez','36462417','stc.cmartinez@comar.com.gt','Santo tomas ',NULL,7,'2025-05-25 21:22:58');
INSERT INTO contactos VALUES(26,'Giovanni','Martinez','54612892','arer@gmai.com','Residenciales 2 puertos, Puerto Barrios',NULL,6,'2025-05-25 22:16:02');
INSERT INTO contactos VALUES(28,'Carlos','Martinez','54612892','carlosmartinezcrl7@gmail.com','Puerto Barrios, Izabal, Guatemala',NULL,9,'2025-05-29 05:59:46');
INSERT INTO contactos VALUES(29,'Carlos','Martinez','64738272','giovannimartinezcrl2002@gmail.com','Residenciales 2 puertos, Puerto Barrios',NULL,9,'2025-05-29 06:00:47');
INSERT INTO contactos VALUES(30,'Rocio','Martinez','32232123','','Puerto Barrios, Izabal, Guatemala',11,9,'2025-05-29 06:49:42');
INSERT INTO contactos VALUES(32,'Andy','Aquino','65748494','guerraerick54@gmail.com','Puerto',14,10,'2025-05-29 07:30:46');
INSERT INTO contactos VALUES(33,'Rocio','Martinez','64738393','rocio12@gmail.com','Residenciales 2 puertos, Puerto Barrios',13,10,'2025-05-29 07:31:37');
INSERT INTO contactos VALUES(34,'Carlos','Martinez','54612892','ejemplo@gmail.com','Residenciales 2 puertos, Puerto Barrios',15,11,'2025-05-29 09:05:05');
INSERT INTO contactos VALUES(35,'Rocio','Martinez','54612893','carlosmartinezcrl7@gmail.com','puerto barrios',17,11,'2025-05-29 09:07:46');
INSERT INTO contactos VALUES(36,'carlos','Aquino','342212323','guerraerick54@gmail.com','Entre Rios, Izabal, Guatemala',20,12,'2025-05-29 09:12:17');
INSERT INTO contactos VALUES(37,'Angel','Ortiz','54637282','ejemplo@gmail.com','Puerto Barrios, Izabal, Guatemala',21,12,'2025-05-29 09:13:01');
CREATE TABLE imagenes_contacto (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              contacto_id INTEGER UNIQUE,
              ruta_imagen TEXT NOT NULL,
              FOREIGN KEY (contacto_id) REFERENCES contactos(id) ON DELETE CASCADE
            );
INSERT INTO imagenes_contacto VALUES(1,1,'contacto-1747780037180-726654542.png');
INSERT INTO imagenes_contacto VALUES(2,2,'contacto-1747781193564-231386615.jpeg');
INSERT INTO imagenes_contacto VALUES(3,3,'contacto-1747781300787-644950366.jpeg');
INSERT INTO imagenes_contacto VALUES(4,6,'contacto-1747782551641-151271471.jpeg');
INSERT INTO imagenes_contacto VALUES(5,8,'contacto-1747783108135-956899404.jpeg');
INSERT INTO imagenes_contacto VALUES(6,9,'contacto-1747783286280-303068335.jpeg');
INSERT INTO imagenes_contacto VALUES(7,10,'contacto-1747793399623-119592706.png');
INSERT INTO imagenes_contacto VALUES(9,13,'contacto-1747794681501-324315200.jpeg');
INSERT INTO imagenes_contacto VALUES(11,23,'contacto-1747971368921-409029055.png');
INSERT INTO imagenes_contacto VALUES(12,25,'contacto-1748208178235-405163633.jpg');
INSERT INTO imagenes_contacto VALUES(14,34,'contacto-1748509505085-715634786.jpg');
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('usuarios',12);
INSERT INTO sqlite_sequence VALUES('categorias',23);
INSERT INTO sqlite_sequence VALUES('contactos',37);
INSERT INTO sqlite_sequence VALUES('imagenes_contacto',14);
COMMIT;
