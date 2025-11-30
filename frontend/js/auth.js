// cliente/js/auth.js
// ================================
// Gestión de autenticación usando LocalStorage
// ================================

// Claves que se usarán en LocalStorage para guardar datos de sesión
const STORAGE_TOKEN_KEY = 'tienda_token';        // Token de autenticación
const STORAGE_TIENDA_KEY = 'tienda_datos';       // Copia local de los datos de la tienda
const STORAGE_USUARIO_KEY = 'tienda_usuario';    // Nombre del usuario logueado

/**
 * Guarda la sesión del usuario en localStorage.
 * - usuario: nombre del usuario logueado
 * - token: token JWT recibido del backend
 * - tienda: datos de productos que se guardan en cache local
 */
export function guardarSesion(usuario, token, tienda) {
  localStorage.setItem(STORAGE_TOKEN_KEY, token);            // Guardamos token
  localStorage.setItem(STORAGE_USUARIO_KEY, usuario);        // Guardamos usuario
  localStorage.setItem(STORAGE_TIENDA_KEY, JSON.stringify(tienda)); // Guardamos la tienda en formato JSON
}

/**
 * Obtiene el token guardado en localStorage.
 * Retorna null si no existe.
 */
export function obtenerToken() {
  return localStorage.getItem(STORAGE_TOKEN_KEY);
}

/**
 * Devuelve el nombre del usuario guardado en localStorage.
 */
export function obtenerUsuario() {
  return localStorage.getItem(STORAGE_USUARIO_KEY);
}

/**
 * Recupera la copia local de los datos de la tienda.
 * Si no existe, retorna null.
 */
export function obtenerTiendaLocal() {
  const t = localStorage.getItem(STORAGE_TIENDA_KEY);
  return t ? JSON.parse(t) : null;   // Convertimos JSON a objeto si existe
}

/**
 * Cierra la sesión del usuario.
 * Elimina toda la información almacenada en localStorage:
 * - token
 * - usuario
 * - datos de tienda
 * - carrito
 * - productos vistos
 * Finalmente redirige al login
 */
export function logout() {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_USUARIO_KEY);
  localStorage.removeItem(STORAGE_TIENDA_KEY);
  localStorage.removeItem('tienda_carrito');
  localStorage.removeItem('tienda_productos_vistos');

  // Redirigir al login después del logout
  window.location.href = 'login.html';
}

/**
 * Verifica si el usuario está autenticado.
 * Si no hay token -> redirige al login.
 * Usado en las páginas que requieren sesión (dashboard, producto, etc.)
 */
export function asegurarAutenticacion() {
  const token = obtenerToken();

  if (!token) {
    window.location.href = 'login.html';  // Sin token no hay acceso
    return false;
  }

  return true; // Usuario autenticado
}
