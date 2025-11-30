// cliente/js/utils.js
// ============================================================
//               Funciones de Utilidad y Notificaciones
//  Contiene helpers genéricos como toasts, formateo de precios
//  y herramientas para trabajar con el carrito.
// ============================================================

/**
 * ============================================================
 *                      showToast()
 *   Muestra una notificación estilo "toast" con icono, mensaje
 *   y cierre automático o manual.
 * ============================================================
 *
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'info'
 * @param {number} duration - Duración en ms (default: 3000)
 */
export function showToast(message, type = 'success', duration = 3000) {

  // Crear contenedor principal si aún no existe
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Crear toast individual
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

  // Insertar en el contenedor
  container.appendChild(toast);

  // Cerrar toast manualmente
  toast.querySelector('.toast-close').addEventListener('click', () => {
    removeToast(toast);
  });

  // Cierre automático tras `duration`
  setTimeout(() => removeToast(toast), duration);
}

// ============================================================
//                    Función interna removeToast()
//  Elimina un toast con una pequeña animación y retira el
//  contenedor si queda vacío.
// ============================================================

function removeToast(toast) {
  toast.classList.add('removing');

  setTimeout(() => {
    toast.remove();

    const container = document.querySelector('.toast-container');
    if (container && container.children.length === 0) {
      container.remove();
    }
  }, 300);
}

// ============================================================
//                   formatearPrecio(precio)
//  Devuelve un precio formateado con dos decimales y símbolo €.
// ============================================================

/**
 * @param {number} precio - Precio numérico
 * @returns {string} - Precio formateado en euros
 */
export function formatearPrecio(precio) {
  return `${Number(precio).toFixed(2)} €`;
}

// ============================================================
//                  contarItemsCarrito()
//  Suma las cantidades de todos los items del carrito
//  almacenado en localStorage.
// ============================================================

/**
 * @returns {number} - Total de items en el carrito
 */
export function contarItemsCarrito() {
  const carrito = JSON.parse(localStorage.getItem('tienda_carrito') || '[]');
  return carrito.reduce((total, item) => total + item.cantidad, 0);
}

/*
  Comentario SOLID:
  - S (Single Responsibility):
      Este módulo concentra funciones reutilizables y
      no tiene lógica de negocio específica.
  
  - O (Open/Closed):
      Se pueden añadir nuevas utilidades sin alterar las existentes.
  
  - D (Dependency Inversion):
      Funciones independientes que no dependen de detalles concretos
      de otros módulos.
*/
