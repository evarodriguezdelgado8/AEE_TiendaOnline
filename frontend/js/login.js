// cliente/js/login.js
// ============================================================
//                     Página de Inicio de Sesión
//        Maneja el formulario de login y la obtención del token
//        desde el servidor para almacenar la sesión del usuario.
// ============================================================

// Importamos función de autenticación para guardar sesión
import { guardarSesion } from './auth.js';

// URL base del servidor (puede ajustarse para despliegue)
const API = 'http://localhost:3000';

// Elementos del DOM
const btnLogin = document.getElementById('btnLogin');
const btnDemo = document.getElementById('btnDemo');

// ============================================================
//                    Rellenar credenciales demo
// ============================================================
btnDemo.addEventListener('click', () => {
  document.getElementById('usuario').value = 'eva';
  document.getElementById('password').value = '1234';
});

// ============================================================
//                Evento principal: botón de Login
// ============================================================
btnLogin.addEventListener('click', async () => {
  const usuario = document.getElementById('usuario').value.trim();
  const password = document.getElementById('password').value.trim();

  // Validación rápida del formulario
  if (!usuario || !password) {
    return alert('Completa usuario y contraseña');
  }

  try {
    // ------------------------------------------------------------
    //         Enviar credenciales al backend para validar
    // ------------------------------------------------------------
    const res = await fetch(API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });

    const data = await res.json();

    // Si la API responde con error, avisamos al usuario
    if (!res.ok) {
      return alert(data.error || 'Error en login');
    }

    // ------------------------------------------------------------
    //     Si todo va bien → guardar la sesión en localStorage
    // ------------------------------------------------------------
    guardarSesion(usuario, data.token, data.tienda);

    // Redirigir al dashboard
    window.location.href = 'dashboard.html';

  } catch (err) {
    // Error al conectar con el servidor
    console.error(err);
    alert('Error conectando al servidor');
  }
});

/*
  Comentario SOLID:
  - S (Single Responsibility):
    Este archivo solo gestiona la interfaz y envío del formulario de login.
    Toda la lógica de gestión de sesión (token, tienda, usuario)
    queda abstraída en auth.js.
*/
