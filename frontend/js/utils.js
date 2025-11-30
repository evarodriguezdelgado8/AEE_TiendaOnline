// cliente/js/utils.js
// Funciones de utilidad para notificaciones y más

/**
 * Muestra una notificación toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'info'
 * @param {number} duration - Duración en ms (default: 3000)
 */
export function showToast(message, type = 'success', duration = 3000) {
  // Crear contenedor si no existe
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Crear toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Icono según tipo
  const icons = {
    success: '✨',
    error: '❌',
    info: 'ℹ️'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || '✨'}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Cerrar">×</button>
  `;
  
  // Añadir al contenedor
  container.appendChild(toast);
  
  // Botón cerrar
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });
  
  // Auto-eliminar después de duration
  setTimeout(() => {
    removeToast(toast);
  }, duration);
}

/**
 * Elimina una notificación toast con animación
 * @param {HTMLElement} toast - Elemento toast a eliminar
 */
function removeToast(toast) {
  toast.classList.add('removing');
  setTimeout(() => {
    toast.remove();
    
    // Eliminar contenedor si está vacío
    const container = document.querySelector('.toast-container');
    if (container && container.children.length === 0) {
      container.remove();
    }
  }, 300);
}

/**
 * Formatea un precio con 2 decimales y símbolo de euro
 * @param {number} precio - Precio a formatear
 * @returns {string} - Precio formateado
 */
export function formatearPrecio(precio) {
  return `${Number(precio).toFixed(2)} €`;
}

/**
 * Obtiene el contador de items en el carrito
 * @returns {number} - Número total de items
 */
export function contarItemsCarrito() {
  const carrito = JSON.parse(localStorage.getItem('tienda_carrito') || '[]');
  return carrito.reduce((total, item) => total + item.cantidad, 0);
}

/* Comentario SOLID:
   - S (Single Responsibility): Este módulo solo contiene funciones de utilidad reutilizables
   - O (Open/Closed): Se pueden añadir más funciones sin modificar las existentes
   - D (Dependency Inversion): Las funciones no dependen de implementaciones concretas
*/