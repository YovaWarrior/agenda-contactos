document.addEventListener('DOMContentLoaded', function() {
  // Verificar autenticación
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }

  // Referencias a elementos del DOM
  const usernameDisplay = document.getElementById('username-display');
  const logoutBtn = document.getElementById('logout-btn');
  const menuContactos = document.getElementById('menu-contactos');
  const menuCategorias = document.getElementById('menu-categorias');
  const menuMantenimiento = document.getElementById('menu-mantenimiento');
  const menuAyuda = document.getElementById('menu-ayuda');
  const contactosSection = document.getElementById('contactos-section');
  const categoriasSection = document.getElementById('categorias-section');
  const mantenimientoSection = document.getElementById('mantenimiento-section');
  const ayudaSection = document.getElementById('ayuda-section');
  const contactsList = document.getElementById('contacts-list');
  const categoriesList = document.getElementById('categories-list');
  const categoriaFilter = document.getElementById('categoria-filter');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const addContactBtn = document.getElementById('add-contact-btn');
  const addCategoryBtn = document.getElementById('add-category-btn');
  const contactModal = document.getElementById('contact-modal');
  const categoryModal = document.getElementById('category-modal');
  const contactForm = document.getElementById('contact-form');
  const categoryForm = document.getElementById('category-form');
  const modalCloseButtons = document.querySelectorAll('.close');
  const cancelBtn = document.getElementById('cancel-btn');
  const cancelCategoryBtn = document.getElementById('cancel-category-btn');
  const contactId = document.getElementById('contact-id');
  const categoryId = document.getElementById('category-id');
  const modalTitle = document.getElementById('modal-title');
  const categoryModalTitle = document.getElementById('category-modal-title');
  const imagenInput = document.getElementById('imagen');
  const imagenPreview = document.getElementById('imagen-preview');
  const categoriaSelect = document.getElementById('categoria');
  const manageUsersBtn = document.getElementById('manage-users-btn');
  const exportPdfBtn = document.getElementById('export-pdf-btn');
  const exportExcelBtn = document.getElementById('export-excel-btn');
  const usersModal = document.getElementById('users-modal');
  const userFormModal = document.getElementById('user-form-modal');
  const userForm = document.getElementById('user-form');
  const usersList = document.getElementById('users-list');
  const cancelUserBtn = document.getElementById('cancel-user-btn');
  const userModalCloseButtons = userFormModal.querySelectorAll('.close');
  const usersModalCloseButtons = usersModal.querySelectorAll('.close');
  const userId = document.getElementById('user-id');
  const userModalTitle = document.getElementById('user-modal-title');
  const userError = document.getElementById('user-error');
  const saveBtn = document.getElementById('save-btn');
  const saveCategoryBtn = document.getElementById('save-category-btn');
  const emailInput = document.getElementById('email');

  // Variables para controlar el estado de guardado
  let isSubmittingContact = false;
  let isSubmittingCategory = false;

// Función para validar email con expresión regular 
function validarEmailEstructura(email) {
  if (!email || email.trim() === '') {
    return { valido: true, error: null }; 
  }
  
  // Limpiar email
  email = email.trim().toLowerCase();
  
  // Expresión regular más estricta para emails
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
  
  if (dominiosInvalidos.includes(domain)) {
    return { valido: false, error: 'Por favor ingresa un email real y válido' };
  }
  
  return { valido: true, error: null };
}

// Función para validar dominios conocidos
function validarDominioConocido(email) {
  if (!email || email.trim() === '') {
    return { valido: true, error: null };
  }
  
  const domain = email.trim().toLowerCase().split('@')[1];
  
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

// Función para validar el email completo
function validarEmailCompleto(email) {
  if (!email || email.trim() === '') {
    return { valido: true, error: null }; 
  }
  
  // Validar estructura
  const validacionEstructura = validarEmailEstructura(email);
  if (!validacionEstructura.valido) {
    return validacionEstructura;
  }
  
  // Validar dominio conocido
  const validacionDominio = validarDominioConocido(email);
  if (!validacionDominio.valido) {
    return validacionDominio;
  }
  
  return { valido: true, error: null };
}

// Función para mostrar error de validación de email
function mostrarErrorEmail(mensaje) {
  // Remover error anterior si existe
  const errorAnterior = document.getElementById('email-error');
  if (errorAnterior) {
    errorAnterior.remove();
  }
  
  // Crear nuevo elemento de error
  const errorDiv = document.createElement('div');
  errorDiv.id = 'email-error';
  errorDiv.className = 'error-message';
  errorDiv.style.cssText = `
    color: var(--danger-color);
    font-size: 12px;
    margin-top: 5px;
    padding: 8px;
    background-color: rgba(235, 90, 70, 0.1);
    border: 1px solid var(--danger-color);
    border-radius: 4px;
    display: flex;
    align-items: center;
  `;
  errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>${mensaje}`;
  
  // Insertar después del campo de email
  if (emailInput && emailInput.parentNode) {
    emailInput.parentNode.insertAdjacentElement('afterend', errorDiv);
  }
}

// Función para limpiar error de email
function limpiarErrorEmail() {
  const errorDiv = document.getElementById('email-error');
  if (errorDiv) {
    errorDiv.remove();
  }
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

// Hacer la función global para que pueda ser llamada desde HTML dinámico
window.togglePassword = togglePassword;

// Función para deshabilitar/habilitar botón y mostrar estado de carga
function toggleButtonState(button, isLoading, originalText, loadingText) {
  if (isLoading) {
    button.disabled = true;
    button.style.opacity = '0.6';
    button.style.cursor = 'not-allowed';
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
  } else {
    button.disabled = false;
    button.style.opacity = '1';
    button.style.cursor = 'pointer';
    button.innerHTML = originalText;
  }
}

// Obtener información del usuario y mostrar nombre
async function getUserInfo() {
  try {
    console.log('Solicitando información del usuario...');
    const response = await fetch('/api/auth/perfil', { 
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener información del usuario: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Información del usuario recibida:', data);
    
    if (data && data.usuario && data.usuario.username) {
      console.log('Nombre de usuario encontrado:', data.usuario.username);
      usernameDisplay.textContent = data.usuario.username;
      console.log('Elemento actualizado:', usernameDisplay.textContent);
    } else {
      console.error('Datos de usuario incompletos:', data);
      usernameDisplay.textContent = '';
    }
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    usernameDisplay.textContent = '';
    
    // Solo redirigimos al login si es un error de autenticación
    if (error.message.includes('401')) {
      alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  }
}

  // Cargar información personal del usuario
  async function loadUserProfile() {
    try {
      console.log('Cargando perfil personal...');
      const response = await fetch('/api/auth/mi-perfil', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al cargar perfil:', response.status, errorData);
        throw new Error(errorData.error || 'Error al cargar perfil');
      }

      const data = await response.json();
      console.log('Perfil cargado:', data);
      displayUserProfile(data.usuario);
    } catch (error) {
      console.error('Error:', error);
      usersList.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--danger-color);">Error: ${error.message}</td></tr>`;
    }
  }

  // Mostrar perfil del usuario
  function displayUserProfile(usuario) {
    usersList.innerHTML = '';
    
    const row = document.createElement('tr');
    const fechaCreacion = new Date(usuario.fecha_creacion).toLocaleDateString();
    
    row.innerHTML = `
      <td>${usuario.username}</td>
      <td>${fechaCreacion}</td>
      <td class="user-actions">
        <button class="edit-profile-btn" title="Editar perfil">
          <i class="fas fa-user-edit"></i> Editar Perfil
        </button>
        <button class="change-password-btn" title="Cambiar contraseña">
          <i class="fas fa-key"></i> Cambiar Contraseña
        </button>
      </td>
    `;
    
    usersList.appendChild(row);
    
    // Añadir event listeners a los botones
    const editProfileBtn = row.querySelector('.edit-profile-btn');
    const changePasswordBtn = row.querySelector('.change-password-btn');
    
    editProfileBtn.addEventListener('click', () => openEditProfileModal(usuario));
    changePasswordBtn.addEventListener('click', () => openChangePasswordModal());
  }

  // Abrir modal para editar perfil
  function openEditProfileModal(usuario) {
    userForm.reset();
    userId.value = usuario.id;
    document.getElementById('user-username').value = usuario.username;
    userModalTitle.textContent = 'Editar Mi Perfil';
    userError.textContent = '';
    
    userFormModal.style.display = 'block';
  }

  // Abrir modal para cambiar contraseña
  function openChangePasswordModal() {
    // Crear modal específico para cambio de contraseña
    if (!document.getElementById('change-password-modal')) {
      createChangePasswordModal();
    }
    
    document.getElementById('change-password-form').reset();
    document.getElementById('change-password-error').textContent = '';
    document.getElementById('change-password-modal').style.display = 'block';
  }

  // Crear modal para cambio de contraseña
  function createChangePasswordModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'change-password-modal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Cambiar Contraseña</h2>
        <form id="change-password-form">
          <div class="form-group">
            <label for="current-password">Contraseña Actual*:</label>
            <div class="password-container">
              <input type="password" id="current-password" name="currentPassword" required>
              <button type="button" class="password-toggle" onclick="togglePassword('current-password')">
                <i class="fas fa-eye" id="current-password-eye"></i>
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="new-password">Nueva Contraseña*:</label>
            <div class="password-container">
              <input type="password" id="new-password" name="newPassword" required>
              <button type="button" class="password-toggle" onclick="togglePassword('new-password')">
                <i class="fas fa-eye" id="new-password-eye"></i>
              </button>
            </div>
            <small>La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y un símbolo.</small>
          </div>
          
          <div class="form-group">
            <label for="confirm-new-password">Confirmar Nueva Contraseña*:</label>
            <div class="password-container">
              <input type="password" id="confirm-new-password" name="confirmNewPassword" required>
              <button type="button" class="password-toggle" onclick="togglePassword('confirm-new-password')">
                <i class="fas fa-eye" id="confirm-new-password-eye"></i>
              </button>
            </div>
          </div>
          
          <div id="change-password-error" class="error-message"></div>
          
          <div class="modal-actions">
            <button type="button" class="btn-secondary" onclick="document.getElementById('change-password-modal').style.display = 'none'">Cancelar</button>
            <button type="submit" class="btn-primary">Cambiar Contraseña</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Añadir event listeners
    modal.querySelector('.close').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    modal.querySelector('#change-password-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmNewPassword = document.getElementById('confirm-new-password').value;
      const errorDiv = document.getElementById('change-password-error');
      
      // Reiniciar mensaje de error
      errorDiv.textContent = '';
      
      // Validar que las contraseñas coincidan
      if (newPassword !== confirmNewPassword) {
        errorDiv.textContent = 'Las nuevas contraseñas no coinciden';
        return;
      }
      
      // Validar requisitos de la contraseña
      if (!validarPassword(newPassword)) {
        errorDiv.textContent = 'La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo';
        return;
      }
      
      try {
        const response = await fetch('/api/auth/cambiar-contrasena', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            passwordActual: currentPassword,
            passwordNueva: newPassword,
            confirmarPassword: confirmNewPassword
          })
        });

        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.error || 'Error al cambiar contraseña');
        }

        alert('Contraseña cambiada exitosamente');
        modal.style.display = 'none';
      } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = error.message;
      }
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  // Cargar contactos
  async function loadContacts(categoriaId = null, searchTerm = null) {
    try {
      let url = '/api/contactos';
      
      if (categoriaId) {
        url = `/api/contactos/categoria/${categoriaId}`;
      } else if (searchTerm) {
        url = `/api/contactos/buscar?termino=${searchTerm}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar contactos');
      }

      const data = await response.json();
      displayContacts(data.contactos);
      return data.contactos;
    } catch (error) {
      console.error('Error:', error);
      contactsList.innerHTML = '<p>Error al cargar contactos</p>';
      return [];
    }
  }

  // Obtener el conteo de contactos por categoría
  async function getContactCountsByCategory() {
    try {
      const contactos = await loadContacts();
      const counts = {};
      
      contactos.forEach(contacto => {
        if (contacto.categoria_id && contacto.categoria_nombre) {
          if (!counts[contacto.categoria_id]) {
            counts[contacto.categoria_id] = {
              nombre: contacto.categoria_nombre,
              count: 0
            };
          }
          counts[contacto.categoria_id].count++;
        }
      });
      
      return counts;
    } catch (error) {
      console.error('Error al obtener conteo de contactos por categoría:', error);
      return {};
    }
  }

  // Mostrar contactos en la interfaz
  function displayContacts(contactos) {
    contactsList.innerHTML = '';
    
    if (contactos.length === 0) {
      contactsList.innerHTML = '<p>No hay contactos para mostrar</p>';
      return;
    }
    
    contactos.forEach(contacto => {
      const contactCard = document.createElement('div');
      contactCard.className = 'contact-card';
      
      const imageUrl = contacto.ruta_imagen ? `/img/${contacto.ruta_imagen}` : '/img/default-profile.png';
      
      contactCard.innerHTML = `
        <div class="contact-image">
          <img src="${imageUrl}" alt="${contacto.nombre}">
        </div>
        <div class="contact-details">
          <div class="contact-name">${contacto.nombre} ${contacto.apellido || ''}</div>
          <div class="contact-info">${contacto.telefono}</div>
          ${contacto.email ? `<div class="contact-info">${contacto.email}</div>` : ''}
          ${contacto.categoria_nombre ? `<div class="contact-category">${contacto.categoria_nombre}</div>` : ''}
        </div>
        <div class="card-actions">
          <button class="edit-btn" data-id="${contacto.id}">Editar</button>
          <button class="delete-btn" data-id="${contacto.id}">Eliminar</button>
        </div>
      `;
      
      contactsList.appendChild(contactCard);
      
      const editBtn = contactCard.querySelector('.edit-btn');
      const deleteBtn = contactCard.querySelector('.delete-btn');
      
      editBtn.addEventListener('click', () => editContact(contacto.id));
      deleteBtn.addEventListener('click', () => deleteContact(contacto.id));
    });
  }

  // Cargar categorías
  async function loadCategories() {
    try {
      const response = await fetch('/api/categorias', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar categorías');
      }

      const data = await response.json();
      const contactCountsByCategory = await getContactCountsByCategory();
      
      displayCategories(data.categorias, contactCountsByCategory);
      populateCategoryDropdowns(data.categorias);
    } catch (error) {
      console.error('Error:', error);
      categoriesList.innerHTML = '<p>Error al cargar categorías</p>';
    }
  }

  // Mostrar categorías en la interfaz
  function displayCategories(categorias, contactCountsByCategory = {}) {
    categoriesList.innerHTML = '';
    
    if (categorias.length === 0) {
      categoriesList.innerHTML = '<p style="text-align: center; padding: 20px;">No hay categorías para mostrar</p>';
      return;
    }
    
    categoriesList.style.display = 'grid';
    categoriesList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
    categoriesList.style.gap = '20px';
    categoriesList.style.marginTop = '20px';
    
    const colorMap = {
      'Amigos': '#e91e63',
      'Familia': '#4caf50',
      'Otros': '#9c27b0',
      'Trabajo': '#ff9800',
      'futbol': '#2196f3'
    };
    
    categorias.forEach(categoria => {
      const categoryCard = document.createElement('div');
      categoryCard.className = 'category-card';
      categoryCard.style.border = '1px solid var(--border-color)'; 
      categoryCard.style.borderRadius = '4px';
      categoryCard.style.padding = '15px';
      categoryCard.style.backgroundColor = 'var(--bg-card)';
      categoryCard.style.boxShadow = '0 1px 3px var(--shadow-color)';
      
      const color = colorMap[categoria.nombre] || '#607d8b';
      const categoryInfo = contactCountsByCategory[categoria.id] || { count: 0 };
      const contactCount = categoryInfo.count;
      
      categoryCard.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; border-radius: 50%; margin-right: 10px;"></span>
          <span style="font-weight: bold; color: var(--text-primary);">${categoria.nombre}</span>
        </div>
        
        <div style="margin-bottom: 15px; display: flex; align-items: center; color: var(--text-secondary);">
          <span style="display: inline-block; width: 20px;">👤</span>
          <span>${contactCount} contactos</span>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
          <button class="edit-category-btn" data-id="${categoria.id}" style="background: none; border: none; color: var(--primary-light); cursor: pointer; display: flex; align-items: center;">
            <span style="margin-right: 5px;">✏️</span>
            <span>Editar</span>
          </button>
          <button class="delete-category-btn" data-id="${categoria.id}" style="background: none; border: none; color: var(--danger-color); cursor: pointer; display: flex; align-items: center;">
            <span style="margin-right: 5px;">🗑️</span>
            <span>Eliminar</span>
          </button>
        </div>
      `;
      
      categoriesList.appendChild(categoryCard);
      
      const editBtn = categoryCard.querySelector('.edit-category-btn');
      const deleteBtn = categoryCard.querySelector('.delete-category-btn');
      
      editBtn.addEventListener('click', () => editCategory(categoria.id));
      deleteBtn.addEventListener('click', () => deleteCategory(categoria.id));
    });
  }

  // Poblar los desplegables de categorías
  function populateCategoryDropdowns(categorias) {
    categoriaFilter.innerHTML = '<option value="">Todas las categorías</option>';
    categoriaSelect.innerHTML = '<option value="">Sin categoría</option>';
    
    categorias.forEach(categoria => {
      const filterOption = document.createElement('option');
      filterOption.value = categoria.id;
      filterOption.textContent = categoria.nombre;
      categoriaFilter.appendChild(filterOption);
      
      const selectOption = document.createElement('option');
      selectOption.value = categoria.id;
      selectOption.textContent = categoria.nombre;
      categoriaSelect.appendChild(selectOption);
    });
  }

  // Abrir modal para crear/editar contacto
  function openContactModal(isEdit = false) {
    contactForm.reset();
    imagenPreview.innerHTML = '';
    contactId.value = '';
    modalTitle.textContent = isEdit ? 'Editar Contacto' : 'Añadir Contacto';
    
    // Limpiar errores de email
    limpiarErrorEmail();
    
    // Resetear estado del botón
    if (saveBtn) {
      toggleButtonState(saveBtn, false, 'Guardar', 'Guardando...');
    }
    
    contactModal.style.display = 'block';
  }

  // Abrir modal para crear/editar categoría
  function openCategoryModal(isEdit = false) {
    categoryForm.reset();
    categoryId.value = '';
    categoryModalTitle.textContent = isEdit ? 'Editar Categoría' : 'Añadir Categoría';
    
    // Resetear estado del botón
    if (saveCategoryBtn) {
      toggleButtonState(saveCategoryBtn, false, 'Guardar', 'Guardando...');
    }
    
    categoryModal.style.display = 'block';
  }

  // Cerrar modales
  function closeModals() {
    contactModal.style.display = 'none';
    categoryModal.style.display = 'none';
    usersModal.style.display = 'none';
    userFormModal.style.display = 'none';
    
    // Limpiar errores de email
    limpiarErrorEmail();
    
    // Resetear estados de botones al cerrar
    isSubmittingContact = false;
    isSubmittingCategory = false;
    
    if (saveBtn) {
      toggleButtonState(saveBtn, false, 'Guardar', 'Guardando...');
    }
    if (saveCategoryBtn) {
      toggleButtonState(saveCategoryBtn, false, 'Guardar', 'Guardando...');
    }
  }

  // Editar contacto
async function editContact(id) {
  try {
    console.log('Intentando editar contacto ID:', id);
    
    const response = await fetch(`/api/contactos/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener contacto: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Datos completos recibidos:', data);
    
    const contacto = data.contacto;
    
    if (!contacto) {
      console.error('No se recibieron datos del contacto o formato incorrecto:', data);
      throw new Error('No se recibieron datos del contacto');
    }
    
    console.log('Datos del contacto recibidos:', contacto);
    
    openContactModal(true);
    
    setTimeout(() => {
      try {
        contactId.value = contacto.id;
        
        const nombreElement = document.getElementById('nombre');
        const apellidoElement = document.getElementById('apellido');
        const telefonoElement = document.getElementById('telefono');
        const emailElement = document.getElementById('email');
        const direccionElement = document.getElementById('direccion');
        const categoriaElement = document.getElementById('categoria');
        
        console.log('Elementos DOM obtenidos:', {
          nombreElement, apellidoElement, telefonoElement, 
          emailElement, direccionElement, categoriaElement
        });
        
        if (nombreElement) {
          nombreElement.value = contacto.nombre || '';
          console.log('Asignado nombre:', nombreElement.value);
        } else {
          console.error('Elemento nombre no encontrado en el DOM');
        }
        
        if (apellidoElement) {
          apellidoElement.value = contacto.apellido || '';
          console.log('Asignado apellido:', apellidoElement.value);
        } else {
          console.error('Elemento apellido no encontrado en el DOM');
        }
        
        if (telefonoElement) {
          telefonoElement.value = contacto.telefono || '';
          console.log('Asignado teléfono:', telefonoElement.value);
        } else {
          console.error('Elemento teléfono no encontrado en el DOM');
        }
        
        if (emailElement) {
          emailElement.value = contacto.email || '';
          console.log('Asignado email:', emailElement.value);
        } else {
          console.error('Elemento email no encontrado en el DOM');
        }
        
        if (direccionElement) {
          direccionElement.value = contacto.direccion || '';
          console.log('Asignado dirección:', direccionElement.value);
        } else {
          console.error('Elemento dirección no encontrado en el DOM');
        }
        
        if (categoriaElement) {
          categoriaElement.value = contacto.categoria_id || '';
          console.log('Asignado categoría:', categoriaElement.value);
        } else {
          console.error('Elemento categoría no encontrado en el DOM');
        }
        
        if (contacto.ruta_imagen) {
          imagenPreview.innerHTML = `<img src="/img/${contacto.ruta_imagen}" alt="${contacto.nombre}">`;
          console.log('Imagen asignada');
        } else {
          imagenPreview.innerHTML = '';
          console.log('No hay imagen para mostrar');
        }
        
        console.log('Formulario actualizado completamente');
      } catch (err) {
        console.error('Error al asignar valores al formulario:', err);
      }
    }, 100);
    
  } catch (error) {
    console.error('Error detallado al obtener contacto:', error);
    alert('Error al obtener información del contacto: ' + error.message);
  }
}

  // Eliminar contacto
  async function deleteContact(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
      try {
        const response = await fetch(`/api/contactos/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al eliminar contacto');
        }

        loadContacts();
        loadCategories();
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar contacto');
      }
    }
  }

  // Editar categoría
  async function editCategory(id) {
    try {
      const response = await fetch(`/api/categorias/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener categoría');
      }

      const data = await response.json();
      const categoria = data.categoria;
      
      categoryId.value = categoria.id;
      document.getElementById('nombre-categoria').value = categoria.nombre;
      
      openCategoryModal(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al obtener información de la categoría');
    }
  }

  // Eliminar categoría
  async function deleteCategory(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      try {
        const response = await fetch(`/api/categorias/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al eliminar categoría');
        }

        loadCategories();
        loadContacts();
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar categoría');
      }
    }
  }

  // Función para generar PDF
  function generatePDF(contactos) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Agenda de Contactos', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    const fecha = new Date().toLocaleDateString();
    doc.text(`Reporte generado el ${fecha}`, 105, 25, { align: 'center' });
    
    doc.setFontSize(10);
    const headers = [['Nombre', 'Teléfono', 'Email', 'Categoría']];
    
    const data = contactos.map(contacto => [
      `${contacto.nombre} ${contacto.apellido || ''}`,
      contacto.telefono,
      contacto.email || '-',
      contacto.categoria_nombre || '-'
    ]);
    
    doc.autoTable({
      head: headers,
      body: data,
      startY: 35,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [2, 106, 167],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
      doc.text('FESTEC 2025 - Universidad Mariano Gálvez de Puerto Barrios', 105, 295, { align: 'center' });
    }
    
    doc.save('agenda_contactos.pdf');
  }

  // Función para generar Excel
  function generateExcel(contactos) {
    const wb = XLSX.utils.book_new();
    
    const data = contactos.map(contacto => ({
      'Nombre': contacto.nombre,
      'Apellido': contacto.apellido || '',
      'Teléfono': contacto.telefono,
      'Email': contacto.email || '',
      'Dirección': contacto.direccion || '',
      'Categoría': contacto.categoria_nombre || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    
    const wscols = [
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 30 },
      { wch: 15 }
    ];
    
    ws['!cols'] = wscols;
    
    XLSX.utils.book_append_sheet(wb, ws, 'Contactos');
    
    XLSX.writeFile(wb, 'agenda_contactos.xlsx');
  }

  // Validar contraseña
  function validarPassword(password) {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
    return true;
  }

  // Event Listeners
  
  // Validación en tiempo real del email
  if (emailInput) {
    emailInput.addEventListener('blur', function() {
      const email = this.value.trim();
      
      // Limpiar error anterior
      limpiarErrorEmail();
      
      if (email) {
        const validacion = validarEmailCompleto(email);
        if (!validacion.valido) {
          mostrarErrorEmail(validacion.error);
          this.style.borderColor = 'var(--danger-color)';
        } else {
          this.style.borderColor = 'var(--success-color)';
          // Crear indicador de éxito temporal
          const successDiv = document.createElement('div');
          successDiv.style.cssText = `
            color: var(--success-color);
            font-size: 12px;
            margin-top: 5px;
            display: flex;
            align-items: center;
          `;
          successDiv.innerHTML = '<i class="fas fa-check-circle" style="margin-right: 8px;"></i>Email válido';
          this.parentNode.insertAdjacentElement('afterend', successDiv);
          
          // Remover el indicador después de 3 segundos
          setTimeout(() => {
            if (successDiv.parentNode) {
              successDiv.remove();
            }
          }, 3000);
        }
      } else {
        this.style.borderColor = 'var(--border-color)';
      }
    });
    
    // Limpiar estilos al enfocar
    emailInput.addEventListener('focus', function() {
      limpiarErrorEmail();
      this.style.borderColor = 'var(--primary-light)';
    });
  }
  
  // Cambio entre secciones
  menuContactos.addEventListener('click', function(e) {
    e.preventDefault();
    
    contactosSection.style.display = 'block';
    categoriasSection.style.display = 'none';
    mantenimientoSection.style.display = 'none';
    ayudaSection.style.display = 'none';
    
    menuContactos.classList.add('active');
    menuCategorias.classList.remove('active');
    menuMantenimiento.classList.remove('active');
    menuAyuda.classList.remove('active');
    
    loadContacts();
  });
  
  menuCategorias.addEventListener('click', function(e) {
    e.preventDefault();
    
    contactosSection.style.display = 'none';
    categoriasSection.style.display = 'block';
    mantenimientoSection.style.display = 'none';
    ayudaSection.style.display = 'none';
    
    menuContactos.classList.remove('active');
    menuCategorias.classList.add('active');
    menuMantenimiento.classList.remove('active');
    menuAyuda.classList.remove('active');
    
    loadCategories();
  });
  
  menuMantenimiento.addEventListener('click', function(e) {
    e.preventDefault();
    
    contactosSection.style.display = 'none';
    categoriasSection.style.display = 'none';
    mantenimientoSection.style.display = 'block';
    ayudaSection.style.display = 'none';
    
    menuContactos.classList.remove('active');
    menuCategorias.classList.remove('active');
    menuMantenimiento.classList.add('active');
    menuAyuda.classList.remove('active');
  });
  
  menuAyuda.addEventListener('click', function(e) {
    e.preventDefault();
    
    contactosSection.style.display = 'none';
    categoriasSection.style.display = 'none';
    mantenimientoSection.style.display = 'none';
    ayudaSection.style.display = 'block';
    
    menuContactos.classList.remove('active');
    menuCategorias.classList.remove('active');
    menuMantenimiento.classList.remove('active');
    menuAyuda.classList.add('active');
  });
  
  // Filtrar por categoría
  categoriaFilter.addEventListener('change', function() {
    const categoriaId = this.value;
    loadContacts(categoriaId);
  });
  
  // Buscar contactos
  searchBtn.addEventListener('click', function() {
    const termino = searchInput.value.trim();
    if (termino) {
      loadContacts(null, termino);
    } else {
      loadContacts();
    }
  });
  
  // También buscar al presionar Enter
  searchInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });
  
  // Abrir modal para añadir contacto
  addContactBtn.addEventListener('click', function() {
    openContactModal();
  });
  
  // Abrir modal para añadir categoría
  addCategoryBtn.addEventListener('click', function() {
    openCategoryModal();
  });
  
  // Gestión de perfil personal
  if (manageUsersBtn) {
    manageUsersBtn.addEventListener('click', function() {
      console.log('Abriendo gestión de perfil personal...');
      loadUserProfile();
      usersModal.style.display = 'block';
      
      // Cambiar título del modal
      const modalTitle = usersModal.querySelector('h2');
      modalTitle.textContent = 'Mi Perfil';
    });
  }
  
  // Exportar a PDF
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', async function() {
      try {
        const contactos = await loadContacts();
        generatePDF(contactos);
      } catch (error) {
        console.error('Error al exportar a PDF:', error);
        alert('Error al exportar contactos a PDF');
      }
    });
  }
  
  // Exportar a Excel
  if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', async function() {
      try {
        const contactos = await loadContacts();
        generateExcel(contactos);
      } catch (error) {
        console.error('Error al exportar a Excel:', error);
        alert('Error al exportar contactos a Excel');
      }
    });
  }
  
  // Cerrar modales
  modalCloseButtons.forEach(button => {
    button.addEventListener('click', closeModals);
  });
  
  usersModalCloseButtons.forEach(button => {
    button.addEventListener('click', function() {
      usersModal.style.display = 'none';
    });
  });
  
  userModalCloseButtons.forEach(button => {
    button.addEventListener('click', function() {
      userFormModal.style.display = 'none';
    });
  });
  
  cancelBtn.addEventListener('click', closeModals);
  cancelCategoryBtn.addEventListener('click', closeModals);
  
  if (cancelUserBtn) {
    cancelUserBtn.addEventListener('click', function() {
      userFormModal.style.display = 'none';
    });
  }
  
  // Cerrar modales al hacer clic fuera
  window.addEventListener('click', function(e) {
    if (e.target === contactModal) {
      contactModal.style.display = 'none';
    }
    if (e.target === categoryModal) {
      categoryModal.style.display = 'none';
    }
    if (e.target === usersModal) {
      usersModal.style.display = 'none';
    }
    if (e.target === userFormModal) {
      userFormModal.style.display = 'none';
    }
  });
  
  // Vista previa de imagen
  imagenInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        imagenPreview.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Guardar contacto - CON PREVENCIÓN DE DUPLICADOS Y VALIDACIÓN DE EMAIL
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Prevenir múltiples envíos
    if (isSubmittingContact) {
      console.log('Ya se está procesando un contacto, ignorando envío adicional');
      return;
    }
    
    // Validar email antes de enviar
    const emailValue = document.getElementById('email').value.trim();
    if (emailValue) {
      const validacionEmail = validarEmailCompleto(emailValue);
      if (!validacionEmail.valido) {
        mostrarErrorEmail(validacionEmail.error);
        return;
      }
    }
    
    isSubmittingContact = true;
    
    // Deshabilitar botón y mostrar estado de carga
    if (saveBtn) {
      toggleButtonState(saveBtn, true, 'Guardar', 'Guardando...');
    }
    
    const formData = new FormData();
    formData.append('nombre', document.getElementById('nombre').value);
    formData.append('apellido', document.getElementById('apellido').value);
    formData.append('telefono', document.getElementById('telefono').value);
    formData.append('email', emailValue);
    formData.append('direccion', document.getElementById('direccion').value);
    formData.append('categoria_id', document.getElementById('categoria').value);
    
    if (imagenInput.files.length > 0) {
      formData.append('imagen', imagenInput.files[0]);
    }
    
    const id = contactId.value;
    const isEdit = !!id;
    
    try {
      const url = isEdit ? `/api/contactos/${id}` : '/api/contactos';
      const method = isEdit ? 'PUT' : 'POST';
      
      console.log(`${isEdit ? 'Actualizando' : 'Creando'} contacto...`);
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al ${isEdit ? 'actualizar' : 'crear'} contacto`);
      }

      const result = await response.json();
      console.log(`Contacto ${isEdit ? 'actualizado' : 'creado'} exitosamente:`, result);

      closeModals();
      await loadContacts();
      await loadCategories();
      
      // Mostrar mensaje de éxito
      const action = isEdit ? 'actualizado' : 'creado';
      alert(`Contacto ${action} exitosamente`);
      
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    } finally {
      // Restaurar estado del botón y permitir nuevos envíos
      isSubmittingContact = false;
      if (saveBtn) {
        toggleButtonState(saveBtn, false, 'Guardar', 'Guardando...');
      }
    }
  });
  
  // Guardar categoría - CON PREVENCIÓN DE DUPLICADOS
  categoryForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Prevenir múltiples envíos
    if (isSubmittingCategory) {
      console.log('Ya se está procesando una categoría, ignorando envío adicional');
      return;
    }
    
    isSubmittingCategory = true;
    
    // Deshabilitar botón y mostrar estado de carga
    if (saveCategoryBtn) {
      toggleButtonState(saveCategoryBtn, true, 'Guardar', 'Guardando...');
    }
    
    const nombre = document.getElementById('nombre-categoria').value;
    const id = categoryId.value;
    const isEdit = !!id;
    
    try {
      const url = isEdit ? `/api/categorias/${id}` : '/api/categorias';
      const method = isEdit ? 'PUT' : 'POST';
      
      console.log(`${isEdit ? 'Actualizando' : 'Creando'} categoría...`);
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error al ${isEdit ? 'actualizar' : 'crear'} categoría`);
      }

      const result = await response.json();
      console.log(`Categoría ${isEdit ? 'actualizada' : 'creada'} exitosamente:`, result);

      closeModals();
      await loadCategories();
      await loadContacts();
      
      // Mostrar mensaje de éxito
      const action = isEdit ? 'actualizada' : 'creada';
      alert(`Categoría ${action} exitosamente`);
      
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    } finally {
      // Restaurar estado del botón y permitir nuevos envíos
      isSubmittingCategory = false;
      if (saveCategoryBtn) {
        toggleButtonState(saveCategoryBtn, false, 'Guardar', 'Guardando...');
      }
    }
  });
  
  // Guardar perfil de usuario
  userForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('user-username').value;
    
    // Reiniciar mensaje de error
    userError.textContent = '';
    
    try {
      const response = await fetch('/api/auth/actualizar-perfil', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Error al actualizar perfil');
      }

      userFormModal.style.display = 'none';
      loadUserProfile();
      
      // Actualizar el nombre mostrado en el header
      usernameDisplay.textContent = username;
      
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      userError.textContent = error.message;
    }
  });
  
  // Cerrar sesión
  logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('token');
    window.location.href = '/';
  });
  
  // Inicializar la aplicación
  console.log('Inicializando aplicación...');
  getUserInfo();
  loadContacts();
  loadCategories();
});