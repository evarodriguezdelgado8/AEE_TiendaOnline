// cliente/js/login.js
import { guardarSesion } from './auth.js';

const API = 'http://localhost:3000'; // ajusta si haces deploy
const btnLogin = document.getElementById('btnLogin');
const btnDemo = document.getElementById('btnDemo');

btnDemo.addEventListener('click', () => {
  document.getElementById('usuario').value = 'eva';
  document.getElementById('password').value = '1234';
});

btnLogin.addEventListener('click', async () => {
  const usuario = document.getElementById('usuario').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!usuario || !password) return alert('Completa usuario y contraseña');

  try {
    const res = await fetch(API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password })
    });
    const data = await res.json();
    if (!res.ok) {
      return alert(data.error || 'Error en login');
    }
    // Guardar token y tienda en localStorage
    guardarSesion(usuario, data.token, data.tienda);
    // Redireccionar al dashboard
    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error(err);
    alert('Error conectando al servidor');
  }
});

/* Comentario SOLID (S - Single Responsibility):
   Este módulo solo se encarga de la interacción del formulario de login.
   La lógica de almacenamiento de sesión está en auth.js (separación de responsabilidades).
*/
