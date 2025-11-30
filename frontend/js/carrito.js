// cliente/js/carrito.js
import { asegurarAutenticacion, obtenerTiendaLocal, obtenerUsuario, logout } from './auth.js';
import { showToast } from './utils.js';

document.getElementById('btnLogout').addEventListener('click', logout);
if (!asegurarAutenticacion()) throw new Error('No autenticado');
const API = 'http://localhost:3000';

const cont = document.getElementById('carritoCont');
const key = 'tienda_carrito';

function render() {
  const cart = JSON.parse(localStorage.getItem(key) || '[]');
  
  // Limpiar contenedor
  cont.innerHTML = '';
  
  if (cart.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent = '🛒 El carrito está vacío';
    cont.appendChild(emptyMsg);
    return;
  }
  
  // Crear tabla
  const table = document.createElement('table');
  table.className = 'table';
  
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  const headers = ['Producto', 'Cantidad', 'Precio', 'Total', ''];
  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  const tbody = document.createElement('tbody');
  let total = 0;
  
  cart.forEach((item, idx) => {
    const subtotal = item.cantidad * item.precio;
    total += subtotal;
    
    const tr = document.createElement('tr');
    
    // Columna producto con imagen
    const tdProducto = document.createElement('td');
    const img = document.createElement('img');
    img.src = item.imagen;
    img.alt = item.nombre;
    tdProducto.appendChild(img);
    
    const nombreSpan = document.createElement('span');
    nombreSpan.textContent = item.nombre;
    tdProducto.appendChild(nombreSpan);
    
    // Columna cantidad
    const tdCantidad = document.createElement('td');
    tdCantidad.textContent = item.cantidad;
    
    // Columna precio unitario
    const tdPrecio = document.createElement('td');
    tdPrecio.textContent = `${item.precio.toFixed(2)} €`;
    
    // Columna total
    const tdTotal = document.createElement('td');
    tdTotal.textContent = `${subtotal.toFixed(2)} €`;
    
    // Columna botón eliminar
    const tdAccion = document.createElement('td');
    const btnRemove = document.createElement('button');
    btnRemove.className = 'btn btn--ghost btn-remove';
    btnRemove.textContent = 'Eliminar';
    btnRemove.addEventListener('click', () => {
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.splice(idx, 1);
      localStorage.setItem(key, JSON.stringify(arr));
      showToast('Producto eliminado del carrito', 'info');
      render();
    });
    tdAccion.appendChild(btnRemove);
    
    tr.appendChild(tdProducto);
    tr.appendChild(tdCantidad);
    tr.appendChild(tdPrecio);
    tr.appendChild(tdTotal);
    tr.appendChild(tdAccion);
    
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  cont.appendChild(table);
  
  // Mostrar total
  const totalP = document.createElement('p');
  totalP.textContent = `Total: ${total.toFixed(2)} €`;
  cont.appendChild(totalP);
}

document.getElementById('btnVaciar').addEventListener('click', () => {
  const cart = JSON.parse(localStorage.getItem(key) || '[]');
  if (cart.length === 0) {
    showToast('El carrito ya está vacío', 'info');
    return;
  }
  
  if (!confirm('¿Vaciar el carrito?')) return;
  
  localStorage.removeItem(key);
  showToast('Carrito vaciado', 'success');
  render();
});

document.getElementById('btnComprar').addEventListener('click', async () => {
  const cart = JSON.parse(localStorage.getItem(key) || '[]');
  if (cart.length === 0) {
    showToast('El carrito está vacío', 'error');
    return;
  }
  
  try {
    const token = localStorage.getItem('tienda_token');
    const res = await fetch(API + '/carrito', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-token': token
      },
      body: JSON.stringify({ carrito: cart })
    });
    const data = await res.json();
    
    if (!res.ok) {
      console.error(data);
      let msg = 'Error validando carrito: ';
      if (data.errores) {
        msg += data.errores.map(e => 
          `${e.nombre || e.id}: ${e.error}`
        ).join(', ');
      } else {
        msg += data.error || 'Error desconocido';
      }
      showToast(msg, 'error', 5000);
      return;
    }
    
    // Compra exitosa
    localStorage.removeItem(key);
    showToast('¡Compra realizada con éxito! Gracias por tu compra 🎉', 'success', 4000);
    render();
  } catch (err) {
    console.error(err);
    showToast('Error al conectar con el servidor', 'error');
  }
});

// Render inicial
render();

/* Comentario SOLID:
   - I (Interface Segregation): carrito.js solo implementa la lógica del carrito.
   - S (Single Responsibility): Solo se encarga de mostrar y gestionar el carrito de compras.
   - D (Dependency Inversion): Usa showToast de utils.js para las notificaciones.
*/