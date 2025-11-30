// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos del frontend
const frontendPath = path.join(__dirname, 'frontend');
app.use(express.static(frontendPath));

// Rutas a JSON en /backend/data
const usuariosPath = path.join(__dirname, "backend", "data", "usuarios.json");
const tiendaPath = path.join(__dirname, "backend", "data", "tienda.json");

// Función para leer JSON
function leerJSON(ruta) {
  return JSON.parse(fs.readFileSync(ruta, 'utf8'));
}

let usuarios = leerJSON(usuariosPath);
let tienda = leerJSON(tiendaPath);

// Token simple (siempre igual para esta práctica)
const TOKEN_PRIVADO = 'token_privado_tienda_navidad_2025';

// Map en memoria para productos vistos por usuario
const productosVistosPorUsuario = {};

// Middleware para validar token
function validarToken(req, res, next) {
  const token =
    req.headers['x-token'] ||
    (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

  if (!token || token !== TOKEN_PRIVADO) {
    return res.status(401).json({ error: 'Token inválido o no enviado' });
  }
  next();
}

// POST /login
app.post('/login', (req, res) => {
  const { usuario, password } = req.body || {};
  if (!usuario || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  const encontrado = usuarios.find(u => u.usuario === usuario && u.password === password);
  if (!encontrado) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  res.json({
    token: TOKEN_PRIVADO,
    tienda
  });
});

// POST /carrito -> valida precios
app.post('/carrito', validarToken, (req, res) => {
  const { carrito } = req.body || {};
  if (!Array.isArray(carrito)) {
    return res.status(400).json({ error: 'Carrito inválido' });
  }

  const productos = tienda.productos || [];
  const errores = [];

  carrito.forEach(item => {
    const prod = productos.find(p => p.id === item.id);
    if (!prod) {
      errores.push({ id: item.id, error: 'Producto no existe' });
      return;
    }
    if (Number(prod.precio) !== Number(item.precio)) {
      errores.push({
        id: item.id,
        nombre: prod.nombre,
        precioServidor: prod.precio,
        precioCliente: item.precio,
        error: 'Precio manipulado'
      });
    }
  });

  if (errores.length > 0) {
    return res.status(400).json({ ok: false, errores });
  }

  return res.json({ ok: true, mensaje: 'Pedido validado y aceptado' });
});

// POST /productos_vistos -> añadir producto a usuario
app.post('/productos_vistos', validarToken, (req, res) => {
  const { usuario, productoId } = req.body || {};
  if (!usuario || !productoId) {
    return res.status(400).json({ error: 'Falta usuario o productoId' });
  }
  if (!productosVistosPorUsuario[usuario]) productosVistosPorUsuario[usuario] = [];

  const arr = productosVistosPorUsuario[usuario];
  const idx = arr.indexOf(productoId);
  if (idx !== -1) arr.splice(idx, 1);
  arr.unshift(productoId);
  productosVistosPorUsuario[usuario] = arr.slice(0, 10);

  res.json({ ok: true, vistos: productosVistosPorUsuario[usuario] });
});

// GET /productos_vistos?usuario=...
app.get('/productos_vistos', validarToken, (req, res) => {
  const usuario = req.query.usuario;
  if (!usuario) {
    return res.status(400).json({ error: 'Falta usuario' });
  }
  const vistos = productosVistosPorUsuario[usuario] || [];
  const productos = tienda.productos.filter(p => vistos.includes(p.id));
  res.json({ ok: true, vistos: productos });
});

// Redirección raíz al login
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor API ejecutándose en http://localhost:${PORT}`);
});
