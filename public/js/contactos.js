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
  const addUserBtn = document.getElementById('add-user-btn');
  const usersList = document.getElementById('users-list');
  const cancelUserBtn = document.getElementById('cancel-user-btn');
  const userModalCloseButtons = userFormModal.querySelectorAll('.close');
  const usersModalCloseButtons = usersModal.querySelectorAll('.close');
  const userId = document.getElementById('user-id');
  const userModalTitle = document.getElementById('user-modal-title');
  const userError = document.getElementById('user-error');

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
      usernameDisplay.textContent = ''; // Dejamos vacío en lugar de mostrar un valor por defecto
    }
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    usernameDisplay.textContent = ''; // Dejamos vacío en caso de error
    
    // Solo redirigimos al login si es un error de autenticación
    if (error.message.includes('401')) {
      alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  }
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
      return data.contactos; // Devolver los contactos para usarlos en otras funciones
    } catch (error) {
      console.error('Error:', error);
      contactsList.innerHTML = '<p>Error al cargar contactos</p>';
      return []; // Devolver array vacío en caso de error
    }
  }

  // Obtener el conteo de contactos por categoría
  async function getContactCountsByCategory() {
    try {
      // Cargamos todos los contactos
      const contactos = await loadContacts();
      
      // Creamos un objeto para contar los contactos por categoría
      const counts = {};
      
      // Contamos los contactos por categoría
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
      return {}; // Devolver objeto vacío en caso de error
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
      
      // Crear imagen del contacto
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
      
      // Añadir event listeners a los botones
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
      
      // Obtener el conteo de contactos por categoría
      const contactCountsByCategory = await getContactCountsByCategory();
      
      // Mostrar categorías con su conteo correcto
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
    
    // Estilo para el contenedor similar al de los contactos
    categoriesList.style.display = 'grid';
    categoriesList.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
    categoriesList.style.gap = '20px';
    categoriesList.style.marginTop = '20px';
    
    // Colores para las categorías según lo mostrado en la imagen
    const colorMap = {
      'Amigos': '#e91e63',  // Rosa/Rojo
      'Familia': '#4caf50',  // Verde
      'Otros': '#9c27b0',   // Púrpura
      'Trabajo': '#ff9800',  // Naranja
      'futbol': '#2196f3'    // Azul (para la nueva categoría que vi en la imagen)
    };
    
    categorias.forEach(categoria => {
      const categoryCard = document.createElement('div');
      categoryCard.className = 'category-card';
      categoryCard.style.border = '1px solid var(--border-color)'; 
      categoryCard.style.borderRadius = '4px';
      categoryCard.style.padding = '15px';
      categoryCard.style.backgroundColor = 'var(--bg-card)';
      categoryCard.style.boxShadow = '0 1px 3px var(--shadow-color)';
      
      // Obtener color para el punto basado en el nombre de categoría
      const color = colorMap[categoria.nombre] || '#607d8b'; // Gris como predeterminado
      
      // Obtener el conteo de contactos para esta categoría
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
      
      // Añadir event listeners a los botones
      const editBtn = categoryCard.querySelector('.edit-category-btn');
      const deleteBtn = categoryCard.querySelector('.delete-category-btn');
      
      editBtn.addEventListener('click', () => editCategory(categoria.id));
      deleteBtn.addEventListener('click', () => deleteCategory(categoria.id));
    });
  }

  // Poblar los desplegables de categorías
  function populateCategoryDropdowns(categorias) {
    // Limpiar opciones actuales
    categoriaFilter.innerHTML = '<option value="">Todas las categorías</option>';
    categoriaSelect.innerHTML = '<option value="">Sin categoría</option>';
    
    // Añadir categorías a los desplegables
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
    contactModal.style.display = 'block';
  }

  // Abrir modal para crear/editar categoría
  function openCategoryModal(isEdit = false) {
    categoryForm.reset();
    categoryId.value = '';
    categoryModalTitle.textContent = isEdit ? 'Editar Categoría' : 'Añadir Categoría';
    categoryModal.style.display = 'block';
  }

  // Cerrar modales
  function closeModals() {
    contactModal.style.display = 'none';
    categoryModal.style.display = 'none';
    usersModal.style.display = 'none';
    userFormModal.style.display = 'none';
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
    
    // Verificar que contacto existe y tiene datos
    if (!contacto) {
      console.error('No se recibieron datos del contacto o formato incorrecto:', data);
      throw new Error('No se recibieron datos del contacto');
    }
    
    console.log('Datos del contacto recibidos:', contacto);
    
    // Asegurarnos de abrir el modal antes de intentar actualizar los campos
    openContactModal(true);
    
    // Dar tiempo para que el DOM se actualice antes de asignar valores
    setTimeout(() => {
      try {
        // Verificar y asignar a cada campo
        contactId.value = contacto.id;
        
        // Obtener referencias a los elementos del DOM después de que el modal esté visible
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
        
        // Asignar valores solo si los elementos existen
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
        
        // Mostrar imagen actual si existe
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
    }, 100); // Pequeño retraso para asegurar que el modal está completamente cargado
    
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

        // Recargar contactos
        loadContacts();
        // Recargar categorías para actualizar conteos
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
      
      // Llenar formulario con datos de la categoría
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

        // Recargar categorías
        loadCategories();
        // Recargar contactos (por si alguno usaba esta categoría)
        loadContacts();
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar categoría');
      }
    }
  }

  // Cargar usuarios
  async function loadUsers() {
    try {
      const response = await fetch('/api/auth/usuarios', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }

      const data = await response.json();
      displayUsers(data.usuarios);
    } catch (error) {
      console.error('Error:', error);
      usersList.innerHTML = '<tr><td colspan="3">Error al cargar usuarios</td></tr>';
    }
  }

  // Mostrar usuarios en la interfaz
  function displayUsers(usuarios) {
    usersList.innerHTML = '';
    
    if (usuarios.length === 0) {
      usersList.innerHTML = '<tr><td colspan="3">No hay usuarios para mostrar</td></tr>';
      return;
    }
    
    usuarios.forEach(usuario => {
      const row = document.createElement('tr');
      const fechaCreacion = new Date(usuario.fecha_creacion).toLocaleDateString();
      
      row.innerHTML = `
        <td>${usuario.username}</td>
        <td>${fechaCreacion}</td>
        <td class="user-actions">
          <button class="edit-user-btn" data-id="${usuario.id}" title="Editar usuario">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-user-btn" data-id="${usuario.id}" title="Eliminar usuario">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      
      usersList.appendChild(row);
      
      // Añadir event listeners a los botones
      const editBtn = row.querySelector('.edit-user-btn');
      const deleteBtn = row.querySelector('.delete-user-btn');
      
      editBtn.addEventListener('click', () => editUser(usuario.id));
      deleteBtn.addEventListener('click', () => deleteUser(usuario.id));
    });
  }

  // Abrir modal para crear/editar usuario
  function openUserFormModal(isEdit = false) {
    userForm.reset();
    userId.value = '';
    userModalTitle.textContent = isEdit ? 'Editar Usuario' : 'Añadir Usuario';
    userError.textContent = '';
    userFormModal.style.display = 'block';
    
    // Si es edición, ocultar los campos de contraseña
    const passwordField = document.getElementById('user-password');
    const confirmPasswordField = document.getElementById('user-confirm-password');
    const passwordLabel = document.querySelector('label[for="user-password"]');
    const confirmPasswordLabel = document.querySelector('label[for="user-confirm-password"]');
    const passwordSmall = passwordField.nextElementSibling;
    
    if (isEdit) {
      passwordField.style.display = 'none';
      confirmPasswordField.style.display = 'none';
      passwordLabel.style.display = 'none';
      confirmPasswordLabel.style.display = 'none';
      passwordSmall.style.display = 'none';
      
      // No son requeridos para edición
      passwordField.required = false;
      confirmPasswordField.required = false;
    } else {
      passwordField.style.display = 'block';
      confirmPasswordField.style.display = 'block';
      passwordLabel.style.display = 'block';
      confirmPasswordLabel.style.display = 'block';
      passwordSmall.style.display = 'block';
      
      // Son requeridos para creación
      passwordField.required = true;
      confirmPasswordField.required = true;
    }
  }

  // Editar usuario
  async function editUser(id) {
    try {
      const response = await fetch(`/api/auth/usuarios/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener usuario');
      }

      const data = await response.json();
      const usuario = data.usuario;
      
      // Llenar formulario con datos del usuario
      userId.value = usuario.id;
      document.getElementById('user-username').value = usuario.username;
      
      openUserFormModal(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al obtener información del usuario');
    }
  }

  // Eliminar usuario
  async function deleteUser(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        const response = await fetch(`/api/auth/usuarios/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al eliminar usuario');
        }

        // Recargar usuarios
        loadUsers();
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar usuario');
      }
    }
  }

  // Función para generar PDF
  function generatePDF(contactos) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Agenda de Contactos', 105, 15, { align: 'center' });
    
    // Subtítulo
    doc.setFontSize(12);
    const fecha = new Date().toLocaleDateString();
    doc.text(`Reporte generado el ${fecha}`, 105, 25, { align: 'center' });
    
    // Tabla de contactos
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
    
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
      doc.text('FESTEC 2025 - Universidad Mariano Gálvez de Puerto Barrios', 105, 295, { align: 'center' });
    }
    
    // Guardar PDF
    doc.save('agenda_contactos.pdf');
  }

  // Función para generar Excel
  function generateExcel(contactos) {
    // Crear un libro de trabajo
    const wb = XLSX.utils.book_new();
    
    // Preparar datos
    const data = contactos.map(contacto => ({
      'Nombre': contacto.nombre,
      'Apellido': contacto.apellido || '',
      'Teléfono': contacto.telefono,
      'Email': contacto.email || '',
      'Dirección': contacto.direccion || '',
      'Categoría': contacto.categoria_nombre || ''
    }));
    
    // Crear hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Ajustar anchos de columna
    const wscols = [
      { wch: 15 }, // Nombre
      { wch: 15 }, // Apellido
      { wch: 15 }, // Teléfono
      { wch: 25 }, // Email
      { wch: 30 }, // Dirección
      { wch: 15 }  // Categoría
    ];
    
    ws['!cols'] = wscols;
    
    // Añadir hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Contactos');
    
    // Guardar archivo
    XLSX.writeFile(wb, 'agenda_contactos.xlsx');
  }

  // Validar contraseña
  function validarPassword(password) {
    // Al menos 8 caracteres
    if (password.length < 8) return false;
    
    // Al menos una letra mayúscula
    if (!/[A-Z]/.test(password)) return false;
    
    // Al menos una letra minúscula
    if (!/[a-z]/.test(password)) return false;
    
    // Al menos un número
    if (!/[0-9]/.test(password)) return false;
    
    // Al menos un símbolo
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
    
    return true;
  }

  // Event Listeners
  
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
  
  // Gestión de usuarios
  if (manageUsersBtn) {
    manageUsersBtn.addEventListener('click', function() {
      loadUsers();
      usersModal.style.display = 'block';
    });
  }
  
  // Añadir usuario
  if (addUserBtn) {
    addUserBtn.addEventListener('click', function() {
      openUserFormModal();
    });
  }
  
  // Exportar a PDF
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', async function() {
      try {
        // Obtener contactos
        const contactos = await loadContacts();
        
        // Crear PDF
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
        // Obtener contactos
        const contactos = await loadContacts();
        
        // Crear Excel
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
  
  // Guardar contacto
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('nombre', document.getElementById('nombre').value);
    formData.append('apellido', document.getElementById('apellido').value);
    formData.append('telefono', document.getElementById('telefono').value);
    formData.append('email', document.getElementById('email').value);
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
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Error al ${isEdit ? 'actualizar' : 'crear'} contacto`);
      }

      closeModals();
      loadContacts();
      // Recargar categorías para actualizar conteos
      loadCategories();
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al ${isEdit ? 'actualizar' : 'crear'} contacto`);
    }
  });
  
  // Guardar categoría
  categoryForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre-categoria').value;
    const id = categoryId.value;
    const isEdit = !!id;
    
    try {
      const url = isEdit ? `/api/categorias/${id}` : '/api/categorias';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre })
      });

      if (!response.ok) {
        throw new Error(`Error al ${isEdit ? 'actualizar' : 'crear'} categoría`);
      }

      closeModals();
      loadCategories();
      // Recargar contactos (por si alguno usaba esta categoría)
      loadContacts();
    } catch (error) {
      console.error('Error:', error);
      alert(`Error al ${isEdit ? 'actualizar' : 'crear'} categoría`);
    }
  });
  
  // Guardar usuario
  userForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('user-username').value;
    const password = document.getElementById('user-password').value;
    const confirmPassword = document.getElementById('user-confirm-password').value;
    const id = userId.value;
    const isEdit = !!id;
    
    // Reiniciar mensaje de error
    userError.textContent = '';
    
    // Validaciones para creación de usuario
    if (!isEdit) {
      // Validar que las contraseñas coincidan
      if (password !== confirmPassword) {
        userError.textContent = 'Las contraseñas no coinciden';
        return;
      }
      
      // Validar requisitos de la contraseña
      if (!validarPassword(password)) {
        userError.textContent = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo';
        return;
      }
    }
    
    try {
      const url = isEdit ? `/api/auth/usuarios/${id}` : '/api/auth/usuarios';
      const method = isEdit ? 'PUT' : 'POST';
      
      const data = {
        username
      };
      
      // Añadir contraseña solo si no es edición
      if (!isEdit) {
        data.password = password;
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || `Error al ${isEdit ? 'actualizar' : 'crear'} usuario`);
      }

      userFormModal.style.display = 'none';
      loadUsers();
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