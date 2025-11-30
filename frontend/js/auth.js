// cliente/js/auth.js
// Funciones para manejar autenticación en LocalStorage

const STORAGE_TOKEN_KEY = 'tienda_token';
const STORAGE_TIENDA_KEY = 'tienda_datos';
const STORAGE_USUARIO_KEY = 'tienda_usuario';

export function guardarSesion(usuario, token, tienda) {
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  localStorage.setItem(STORAGE_USUARIO_KEY, usuario);
  localStorage.setItem(STORAGE_TIENDA_KEY, JSON.stringify(tienda));
}

export function obtenerToken() {
  return localStorage.getItem(STORAGE_TOKEN_KEY);
}

export function obtenerUsuario() {
  return localStorage.getItem(STORAGE_USUARIO_KEY);
}

export function obtenerTiendaLocal() {
  const t = localStorage.getItem(STORAGE_TIENDA_KEY);
  return t ? JSON.parse(t) : null;
}

export function logout() {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_USUARIO_KEY);
  localStorage.removeItem(STORAGE_TIENDA_KEY);
  localStorage.removeItem('tienda_carrito');
  localStorage.removeItem('tienda_productos_vistos');
  // redirigir al login
  window.location.href = 'login.html';
}

export function asegurarAutenticacion() {
  const token = obtenerToken();
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}
