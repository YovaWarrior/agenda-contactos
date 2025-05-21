const nodemailer = require('nodemailer');

// Configuración para envío de correos con Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'carlosmartinezcrl7@gmail.com',
    pass: 'ootg bcai ybuz chqf' // Reemplaza con tu contraseña de aplicación
  }
});

// Función para enviar un correo de notificación con información del FESTEC
const enviarNotificacionContacto = async (email, nombre, usuarioNombre) => {
  if (!email) return { enviado: false, mensaje: 'No se proporcionó email' }; 
  
  try {
    // Plantilla HTML mejorada con información de FreeBSD, Haiku OS, FESTEC y la Universidad
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Has sido añadido a una Agenda de Contactos</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #f0f0f0;
          }
          .header h1 {
            color: #026aa7;
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 20px 0;
          }
          .message {
            background-color: #e8f4fc;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section h2 {
            color: #026aa7;
            font-size: 20px;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 10px;
          }
          .os-container {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
          }
          .os-card {
            flex: 1;
            min-width: 240px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            overflow: hidden;
          }
          .os-header {
            padding: 10px;
            text-align: center;
            font-weight: bold;
          }
          .freebsd {
            background-color: #AB2B28;
            color: white;
          }
          .haiku {
            background-color: #3E64A0;
            color: white;
          }
          .os-content {
            padding: 15px;
          }
          .os-content ul {
            padding-left: 20px;
            margin: 10px 0;
          }
          .feature-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
          }
          .feature {
            background-color: #f0f0f0;
            border-radius: 20px;
            padding: 5px 12px;
            font-size: 14px;
          }
          .festec-info {
            background-color: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
          }
          .university-section {
            background-color: #e6f7ee;
            padding: 20px;
            border-radius: 5px;
            margin-top: 25px;
            border-left: 4px solid #c30010;
          }
          .university-title {
            color: #c30010;
            margin: 0 0 15px 0;
            font-size: 24px;
            line-height: 1.3;
            text-align: center;
          }
          .cta-button {
            display: inline-block;
            background-color: #c30010;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
            font-weight: bold;
            text-align: center;
          }
          .testimonial {
            font-style: italic;
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-top: 15px;
            position: relative;
          }
          .testimonial:before {
            content: '"';
            font-size: 60px;
            color: #e0e0e0;
            position: absolute;
            left: 5px;
            top: -10px;
          }
          .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            color: #777;
            font-size: 14px;
          }
          .social-links {
            margin-top: 15px;
          }
          .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #c30010;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Agenda de Contactos - FESTEC 2025</h1>
          </div>
          
          <div class="content">
            <div class="message">
              <p>Hola <strong>${nombre}</strong>,</p>
              <p>Has sido añadido a la agenda de contactos de <strong>${usuarioNombre}</strong> en la aplicación Agenda de Contactos presentada en el FESTEC 2025.</p>
            </div>
            
            <div class="section">
              <h2>Sobre el Proyecto</h2>
              <p>Este proyecto fue desarrollado como parte de la asignatura de Sistemas Operativos II para el FESTEC 2025. Consiste en una aplicación web de Agenda de Contactos que funciona tanto en FreeBSD como en Haiku OS.</p>
              
              <div class="feature-list">
                <div class="feature">Gestión de Contactos</div>
                <div class="feature">Categorías</div>
                <div class="feature">Búsqueda</div>
                <div class="feature">Imágenes</div>
                <div class="feature">Notificaciones</div>
                <div class="feature">Tema Oscuro</div>
              </div>
            </div>
            
            <div class="section">
              <h2>Sistemas Operativos Utilizados</h2>
              <div class="os-container">
                <div class="os-card">
                  <div class="os-header freebsd">FreeBSD</div>
                  <div class="os-content">
                    <p>FreeBSD es un sistema operativo Unix-like avanzado conocido por su robustez, estabilidad y rendimiento.</p>
                    <ul>
                      <li>Seguridad avanzada y jails para aislamiento</li>
                      <li>Alto rendimiento para servidores y sistemas de red</li>
                      <li>Sistema de archivos ZFS con verificación de integridad</li>
                    </ul>
                  </div>
                </div>
                
                <div class="os-card">
                  <div class="os-header haiku">Haiku OS</div>
                  <div class="os-content">
                    <p>Haiku es un sistema operativo de código abierto inspirado en BeOS, enfocado en la simplicidad y eficiencia.</p>
                    <ul>
                      <li>Tiempos de arranque rápidos y sistema responsivo</li>
                      <li>Interfaz de usuario limpia y eficiente</li>
                      <li>Requisitos de hardware modestos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="festec-info">
              <h3>FESTEC 2025</h3>
              <p>Agradecemos a todos los asistentes al Festival Tecnológico (FESTEC) 2025. Esperamos que hayan disfrutado de todas las exposiciones y proyectos presentados.</p>
              <p>Fecha: 20 de Mayo, 2025 | Ubicación: Campus Central</p>
            </div>
            
            <div class="university-section">
              <h3 class="university-title">Universidad Mariano Gálvez de Puerto Barrios</h3>
              
              <p><strong>¿Quiénes somos?</strong> Somos estudiantes apasionados de Ingeniería en Sistemas, formados en una de las instituciones educativas más prestigiosas de Guatemala: la Universidad Mariano Gálvez de Puerto Barrios.</p>
              
              <p>Este proyecto es el resultado de nuestra dedicación y los conocimientos adquiridos durante nuestra formación académica. Como futuros ingenieros, aplicamos tecnologías de vanguardia para resolver problemas reales.</p>
              
              <div class="testimonial">
                "La Ingeniería en Sistemas no es solo una carrera, es una pasión que nos permite crear soluciones innovadoras y transformar el mundo digital. Cada línea de código es una oportunidad para marcar la diferencia."
              </div>
              
              <p>Si te apasiona la tecnología y deseas vivir la experiencia de convertirte en Ingeniero o Ingeniera en Sistemas, la Universidad Mariano Gálvez de Puerto Barrios te ofrece una formación integral de excelencia.</p>
              
              <a href="https://www.umg.edu.gt/" class="cta-button">Descubre tu futuro en la UMG</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Este correo fue enviado automáticamente por la Agenda de Contactos.</p>
            <p>&copy; 2025 FESTEC - Sistemas Operativos II | Desarrollado por Carlos Martínez</p>
            <div class="social-links">
              <a href="https://www.umg.edu.gt/">Sitio Web UMG</a> |
              <a href="https://www.facebook.com/umg.edu.gt">Facebook</a> |
              <a href="https://www.instagram.com/umg.edu.gt/">Instagram</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Enviar el correo
    const info = await transporter.sendMail({
      from: '"Agenda de Contactos - FESTEC 2025" <carlosmartinezcrl7@gmail.com>',
      to: email,
      subject: '¡Has sido añadido a una agenda de contactos! - FESTEC 2025',
      text: `Hola ${nombre},\n\nHas sido añadido a la agenda de contactos de ${usuarioNombre} en la aplicación Agenda de Contactos presentada en el FESTEC 2025.\n\n` +
            `Este proyecto fue desarrollado para el FESTEC 2025, demostrando una aplicación que funciona tanto en FreeBSD como en Haiku OS.\n\n` +
            `FreeBSD es un sistema operativo Unix-like avanzado conocido por su robustez, estabilidad y rendimiento.\n\n` +
            `Haiku es un sistema operativo de código abierto inspirado en BeOS, enfocado en la simplicidad y eficiencia.\n\n` +
            `Agradecemos a todos los asistentes al Festival Tecnológico (FESTEC) 2025.\n\n` +
            `Somos estudiantes de Ingeniería en Sistemas de la Universidad Mariano Gálvez de Puerto Barrios, apasionados por esta carrera profesional. Si deseas inscribirte y vivir la experiencia de ser Ingeniero/a en Sistemas, visita: https://www.umg.edu.gt/\n\n` +
            `Saludos,\nEl equipo de Agenda de Contactos`,
      html: htmlContent
    });
    
    console.log('Correo enviado:', info.messageId);
    return { enviado: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return { enviado: false, error: error.message };
  }
};

module.exports = {
  enviarNotificacionContacto
};