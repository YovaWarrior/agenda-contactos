#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuración
const DB_FILE = 'agenda_contactos.sqlite';
const BACKUP_DIR = 'backups';
const DATE_STAMP = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

// Crear directorio de backups si no existe
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

console.log('🗃️  Iniciando backup de la base de datos...');

async function createSimpleBackup() {
  try {
    // 1. Verificar que existe el archivo de BD
    if (!fs.existsSync(DB_FILE)) {
      throw new Error(`❌ Base de datos no encontrada: ${DB_FILE}`);
    }

    console.log('✅ Base de datos encontrada:', DB_FILE);
    
    // 2. Backup simple (copia del archivo)
    console.log('📝 Creando backup completo...');
    const simpleBackup = path.join(BACKUP_DIR, `agenda_contactos_${DATE_STAMP}.sqlite`);
    fs.copyFileSync(DB_FILE, simpleBackup);
    console.log(`✅ Backup completo creado: ${simpleBackup}`);

    // 3. Backup en formato SQL (estructura + datos)
    console.log('📝 Creando dump SQL completo...');
    const sqlBackup = path.join(BACKUP_DIR, `agenda_contactos_dump_${DATE_STAMP}.sql`);
    
    await new Promise((resolve, reject) => {
      exec(`sqlite3 ${DB_FILE} ".dump" > ${sqlBackup}`, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error en dump SQL:', error.message);
          reject(error);
        } else {
          console.log(`✅ Dump SQL creado: ${sqlBackup}`);
          resolve();
        }
      });
    });

    // 4. Backup solo estructura
    console.log('📝 Creando esquema de base de datos...');
    const schemaBackup = path.join(BACKUP_DIR, `agenda_contactos_schema_${DATE_STAMP}.sql`);
    
    await new Promise((resolve, reject) => {
      exec(`sqlite3 ${DB_FILE} ".schema" > ${schemaBackup}`, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error en esquema:', error.message);
          reject(error);
        } else {
          console.log(`✅ Esquema creado: ${schemaBackup}`);
          resolve();
        }
      });
    });

    // 5. Lista de tablas
    console.log('📝 Obteniendo información de tablas...');
    const tablesBackup = path.join(BACKUP_DIR, `database_tables_${DATE_STAMP}.txt`);
    
    await new Promise((resolve, reject) => {
      exec(`sqlite3 ${DB_FILE} ".tables" > ${tablesBackup}`, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error al obtener tablas:', error.message);
          reject(error);
        } else {
          console.log(`✅ Lista de tablas creada: ${tablesBackup}`);
          resolve();
        }
      });
    });

    // 6. Crear archivo de información del backup
    console.log('📝 Generando información del backup...');
    const infoFile = path.join(BACKUP_DIR, `backup_info_${DATE_STAMP}.txt`);
    const stats = fs.statSync(DB_FILE);
    
    const info = `BACKUP AGENDA DE CONTACTOS - FESTEC 2025
==========================================

Fecha del backup: ${new Date().toLocaleString()}
Sistema operativo: FreeBSD
Tamaño BD original: ${(stats.size / 1024).toFixed(2)} KB
Normalización: 3FN (Tercera Forma Normal)

Archivos generados:
- agenda_contactos_${DATE_STAMP}.sqlite (Base de datos completa)
- agenda_contactos_dump_${DATE_STAMP}.sql (Estructura + todos los datos)
- agenda_contactos_schema_${DATE_STAMP}.sql (Solo estructura de tablas)
- database_tables_${DATE_STAMP}.txt (Lista de tablas disponibles)

Para verificar el contenido:
sqlite3 agenda_contactos_${DATE_STAMP}.sqlite
.tables
.schema
SELECT * FROM usuarios;
.quit

Para restaurar en otro sistema:
1. Copiar archivo .sqlite: cp agenda_contactos_${DATE_STAMP}.sqlite agenda_contactos.sqlite
2. O ejecutar dump SQL: sqlite3 nueva_bd.sqlite < agenda_contactos_dump_${DATE_STAMP}.sql

Compatibilidad probada:
✅ FreeBSD 13.x
✅ Haiku OS

Universidad Mariano Gálvez de Puerto Barrios
Sistemas Operativos II - FESTEC 2025
`;

    fs.writeFileSync(infoFile, info);
    console.log(`✅ Información del backup: ${infoFile}`);

    // 7. Resumen final
    console.log('\n🎉 ¡BACKUP COMPLETADO EXITOSAMENTE!');
    console.log('=' .repeat(50));
    console.log('📁 Archivos creados en carpeta backups/:');
    
    const backupFiles = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.includes(DATE_STAMP));
    
    backupFiles.forEach(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const fileStats = fs.statSync(filePath);
      console.log(`   ✓ ${file} (${(fileStats.size / 1024).toFixed(2)} KB)`);
    });

    console.log('\n📊 Resumen:');
    console.log(`   📄 BD original: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   📁 Total archivos: ${backupFiles.length}`);
    console.log(`   📅 Fecha: ${new Date().toLocaleString()}`);
    
    console.log('\n🔍 Para verificar el backup:');
    console.log(`   sqlite3 ${simpleBackup}`);
    console.log('   .tables');
    console.log('   SELECT COUNT(*) FROM usuarios;');
    console.log('   .quit');
    

  } catch (error) {
    console.error('\n❌ ERROR DURANTE EL BACKUP:', error.message);
    console.log('\n🔧 Soluciones posibles:');
    console.log('   1. Verificar que existe agenda_contactos.sqlite');
    console.log('   2. Verificar que sqlite3 está instalado: pkg install sqlite3');
    console.log('   3. Verificar permisos de escritura en el directorio');
    process.exit(1);
  }
}

// Ejecutar backup
createSimpleBackup();
