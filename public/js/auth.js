document.addEventListener('DOMContentLoaded', function() {
  // Referencias a elementos del DOM
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginFormContainer = document.getElementById('loginForm');
  const registerFormContainer = document.getElementById('registerForm');
  const registerLink = document.getElementById('register-link');
  const loginLink = document.getElementById('login-link');
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');

  // Verificar si ya hay una sesión activa
  const token = localStorage.getItem('token');
  if (token) {
    window.location.href = '/contactos.html';
    return;
  }

  // Función para alternar visibilidad de contraseña
  function togglePassword(inputId) {
  const passwordInput = document.getElementById(inputId);
  const eyeIcon = document.getElementById(inputId + '-eye');
  
  if (passwordInput && eyeIcon) {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      eyeIcon.classList.remove('fa-eye');
      eyeIcon.classList.add('fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      eyeIcon.classList.remove('fa-eye-slash');
      eyeIcon.classList.add('fa-eye');
    }
  }
}

  // Hacer la función global para que pueda ser llamada desde HTML
  window.togglePassword = togglePassword;

  // Mostrar formulario de registro
  if (registerLink) {
    registerLink.addEventListener('click', function(e) {
      e.preventDefault();
      loginFormContainer.style.display = 'none';
      registerFormContainer.style.display = 'block';
    });
  }

  // Mostrar formulario de login
  if (loginLink) {
    loginLink.addEventListener('click', function(e) {
      e.preventDefault();
      registerFormContainer.style.display = 'none';
      loginFormContainer.style.display = 'block';
    });
  }

  // Validar contraseña - FUNCIÓN MEJORADA
  function validarPassword(password) {
    console.log('Validando contraseña:', password);
    console.log('Longitud:', password.length);
    
    // Al menos 8 caracteres
    if (password.length < 8) {
      console.log('Falla: menos de 8 caracteres');
      return { valida: false, error: 'La contraseña debe tener al menos 8 caracteres' };
    }
    
    // Al menos una letra mayúscula
    if (!/[A-Z]/.test(password)) {
      console.log('Falla: no tiene mayúscula');
      return { valida: false, error: 'La contraseña debe contener al menos una letra mayúscula' };
    }
    
    // Al menos una letra minúscula
    if (!/[a-z]/.test(password)) {
      console.log('Falla: no tiene minúscula');
      return { valida: false, error: 'La contraseña debe contener al menos una letra minúscula' };
    }
    
    // Al menos un número
    if (!/[0-9]/.test(password)) {
      console.log('Falla: no tiene número');
      return { valida: false, error: 'La contraseña debe contener al menos un número' };
    }
    
    // Al menos un símbolo - EXPRESIÓN REGULAR MEJORADA
    const symbolRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;
    if (!symbolRegex.test(password)) {
      console.log('Falla: no tiene símbolo válido');
      console.log('Símbolos encontrados:', password.match(/[^a-zA-Z0-9]/g));
      return { 
        valida: false, 
        error: 'La contraseña debe contener al menos un símbolo (!@#$%^&*()_+-=[]{};\':"|,.<>/?~`)' 
      };
    }
    
    console.log('Contraseña válida');
    return { valida: true, error: null };
  }

  // Función para mostrar información detallada de la contraseña
  function analizarPassword(password) {
    const analisis = {
      longitud: password.length >= 8,
      mayuscula: /[A-Z]/.test(password),
      minuscula: /[a-z]/.test(password),
      numero: /[0-9]/.test(password),
      simbolo: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)
    };
    
    console.log('Análisis detallado de contraseña:', analisis);
    console.log('Caracteres encontrados:', {
      mayusculas: password.match(/[A-Z]/g),
      minusculas: password.match(/[a-z]/g),
      numeros: password.match(/[0-9]/g),
      simbolos: password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/g),
      otros: password.match(/[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/g)
    });
    
    return analisis;
  }

  // Crear el indicador de fortaleza de contraseña elegante (SIN SOBREPOSICIÓN)
  function createPasswordStrengthIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'password-strength-indicator';
    indicator.style.cssText = `
      margin-top: 8px;
      padding: 10px;
      border-radius: 4px;
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      font-size: 11px;
      line-height: 1.3;
      position: relative;
      z-index: 1;
    `;
    
    indicator.innerHTML = `
      <div style="margin-bottom: 6px; font-weight: 600; color: var(--text-primary); font-size: 12px;">
        Fortaleza de la contraseña:
      </div>
      <div id="password-requirements" style="display: flex; flex-wrap: wrap; gap: 8px;">
        <div id="req-length" class="requirement">
          <span class="req-icon">⭕</span> 8+ caracteres
        </div>
        <div id="req-uppercase" class="requirement">
          <span class="req-icon">⭕</span> Mayúscula
        </div>
        <div id="req-lowercase" class="requirement">
          <span class="req-icon">⭕</span> Minúscula
        </div>
        <div id="req-number" class="requirement">
          <span class="req-icon">⭕</span> Número
        </div>
        <div id="req-symbol" class="requirement">
          <span class="req-icon">⭕</span> Símbolo
        </div>
      </div>
    `;
    
    // Agregar estilos para los requisitos (sin sobreposición)
    const style = document.createElement('style');
    style.textContent = `
      .requirement {
        display: flex;
        align-items: center;
        padding: 1px 0;
        color: var(--text-secondary);
        transition: color 0.2s ease;
        font-size: 11px;
        white-space: nowrap;
      }
      .requirement.valid {
        color: var(--success-color);
      }
      .requirement.invalid {
        color: var(--text-secondary);
      }
      .req-icon {
        margin-right: 4px;
        font-size: 10px;
      }
    `;
    document.head.appendChild(style);
    
    return indicator;
  }

  // Actualizar el indicador de fortaleza
  function updatePasswordStrengthIndicator(analysis) {
    const requirements = {
      'req-length': analysis.longitud,
      'req-uppercase': analysis.mayuscula,
      'req-lowercase': analysis.minuscula,
      'req-number': analysis.numero,
      'req-symbol': analysis.simbolo
    };
    
    Object.entries(requirements).forEach(([id, isValid]) => {
      const element = document.getElementById(id);
      if (element) {
        const icon = element.querySelector('.req-icon');
        if (isValid) {
          element.className = 'requirement valid';
          icon.textContent = '✅';
        } else {
          element.className = 'requirement invalid';
          icon.textContent = '⭕';
        }
      }
    });
  }

  // Validación en tiempo real para el campo de contraseña del registro
  const newPasswordInput = document.getElementById('new-password');
  if (newPasswordInput) {
    newPasswordInput.addEventListener('input', function() {
      const password = this.value;
      
      if (password.length > 0) {
        // Crear indicador si no existe
        let indicator = document.getElementById('password-strength-indicator');
        if (!indicator) {
          indicator = createPasswordStrengthIndicator();
          // Insertar DESPUÉS del form-group para evitar sobreposición
          this.parentNode.parentNode.insertAdjacentElement('afterend', indicator);
        }
        
        // Actualizar análisis
        const analisis = analizarPassword(password);
        updatePasswordStrengthIndicator(analisis);
        
        // Mostrar indicador
        indicator.style.display = 'block';
      }
    });
    
    // Mantener indicador visible al perder foco si hay contraseña
    newPasswordInput.addEventListener('blur', function() {
      const indicator = document.getElementById('password-strength-indicator');
      if (indicator && this.value.length === 0) {
        indicator.style.display = 'none';
      }
    });
  }

  // Manejar el envío del formulario de login
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      // Reiniciar mensaje de error
      loginError.textContent = '';
      
      try {
        console.log('Intentando iniciar sesión con:', username);
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Usuario o contraseña incorrectos');
        }
        
        const data = await response.json();
        console.log('Inicio de sesión exitoso');
        
        // Guardar token en localStorage
        localStorage.setItem('token', data.token);
        
        // Redirigir a la página de contactos
        window.location.href = '/contactos.html';
      } catch (error) {
        console.error('Error:', error);
        loginError.textContent = error.message;
      }
    });
  }

  // Manejar el envío del formulario de registro
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const username = document.getElementById('new-username').value;
      const password = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      // Reiniciar mensaje de error
      registerError.textContent = '';
      
      console.log('=== INICIO VALIDACIÓN REGISTRO ===');
      console.log('Usuario:', username);
      console.log('Contraseña a validar:', password);
      
      // Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        registerError.textContent = 'Las contraseñas no coinciden';
        return;
      }
      
      // Validar requisitos de la contraseña - CON LOGGING DETALLADO
      const validacionPassword = validarPassword(password);
      if (!validacionPassword.valida) {
        console.log('Validación de contraseña falló:', validacionPassword.error);
        registerError.textContent = validacionPassword.error;
        
        // Mostrar análisis detallado en consola para debugging
        analizarPassword(password);
        return;
      }
      
      console.log('Contraseña válida, procediendo con registro');
      
      try {
        console.log('Intentando registrar usuario:', username);
        const response = await fetch('/api/auth/registro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.log('Error en respuesta del servidor:', data);
          throw new Error(data.error || 'Error al registrar usuario');
        }
        
        console.log('Registro exitoso');
        
        // Guardar token en localStorage
        localStorage.setItem('token', data.token);
        
        // Redirigir a la página de contactos
        window.location.href = '/contactos.html';
      } catch (error) {
        console.error('Error al registrar:', error);
        registerError.textContent = error.message;
      }
    });
  }
});