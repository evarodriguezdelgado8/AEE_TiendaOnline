🎄 Tienda Navidad - SPA Offline-FirstProyecto para el módulo Desarrollo Web en Entorno Cliente (DWEC) - RA4.Una aplicación web que simula una arquitectura Offline-First utilizando LocalStorage para la persistencia de datos y Node.js para la seguridad del backend.📋 Tabla de ContenidosDescripción del ProyectoArquitectura y SeguridadPrincipios SOLID AplicadosInstalación y UsoEstructura del Proyecto🚀 Descripción del ProyectoEsta aplicación es una Tienda Online Navideña que implementa una lógica avanzada de gestión de estado en el cliente. A diferencia de las webs tradicionales que consultan al servidor en cada clic, esta app descarga el catálogo completo al iniciar sesión, permitiendo una navegación instantánea y fluida.Funcionalidades Clave:Autenticación: Sistema de Login con Token.Offline-First: Carga de productos y categorías en localStorage.Carrito de Compras: Gestión local del carrito con persistencia.Historial: Registro de "Productos Vistos Recientemente" (LIFO).Diseño: Interfaz moderna con efectos de vidrio (Glassmorphism) y animación de nieve.🛡️ Arquitectura y SeguridadEste es el punto fuerte del proyecto. Se ha implementado una seguridad robusta para evitar la manipulación de datos en el cliente.1. Modelo "Offline-First"Al hacer login, el servidor devuelve un objeto JSON con toda la tienda (tienda.json) y un Token de sesión.// Respuesta del Login
{
  "token": "token_privado_...",
  "tienda": { "categorias": [...], "productos": [...] }
}
2. Seguridad Anti-Fraude (Backend Validation)Dado que los datos están en localStorage, un usuario avanzado podría intentar modificar el precio de un producto en su navegador.Medida de seguridad:El cliente envía el carrito con los IDs y los precios.El servidor ignora los precios del cliente y busca el precio real en su backend/data/tienda.json.Si el precio enviado no coincide con el real, el servidor rechaza la compra y alerta de manipulación.🧩 Principios SOLID AplicadosEl código ha sido refactorizado siguiendo las mejores prácticas de ingeniería de software:PrincipioArchivoImplementaciónS - Single Responsibilityauth.jsEste módulo tiene una única responsabilidad: gestionar la lectura/escritura en LocalStorage. No renderiza HTML ni hace cálculos.O - Open/Closedserver.jsLa lógica de validación del carrito está abierta a recibir nuevos productos en el JSON sin necesidad de modificar el código del servidor.L - Liskov SubstitutionGeneralUso consistente de promesas y estructuras de datos que permiten intercambiar implementaciones sin romper la app.I - Interface Segregationutils.jsMódulos pequeños y específicos. carrito.js no necesita saber cómo funciona el login, solo consume lo que necesita.D - Dependency Inversiondashboard.jsLos módulos de alto nivel no dependen de detalles de bajo nivel (como alert()). Dependen de abstracciones como showToast() importado de utils.js.🛠️ Instalación y UsoPrerrequisitosTener instalado Node.js.PasosClonar el repositorio:git clone [https://github.com/tu-usuario/tienda-navidad.git](https://github.com/tu-usuario/tienda-navidad.git)
cd tienda-navidad
Instalar dependencias:npm install
(Dependencias: express, cors, body-parser)Iniciar el servidor:node server.js
Abrir en el navegador:Visita http://localhost:3000🔑 Credenciales de PruebaPara acceder a la aplicación, utiliza el siguiente usuario demo configurado en usuarios.json:Usuario: evaContraseña: 1234📂 Estructura del Proyectotienda-navidad/
├── backend/
│   └── data/
│       ├── tienda.json       # Base de datos de productos (Fuente de la verdad)
│       └── usuarios.json     # Usuarios registrados
├── frontend/
│   ├── css/
│   │   └── estilos.css       # Estilos con Glassmorphism y animaciones
│   ├── js/
│   │   ├── auth.js           # Gestión de sesión y LocalStorage
│   │   ├── carrito.js        # Lógica del carrito y validación
│   │   ├── dashboard.js      # Página principal
│   │   ├── producto.js       # Detalle de producto
│   │   └── utils.js          # Helpers (Toast, formateo)
│   └── *.html                # Vistas de la aplicación
├── server.js                 # Servidor Node.js (Express)
├── package.json
└── README.md
<div align="center"><p>Desarrollado con 🎄 y mucho código por <b>[Tu Nombre]</b></p><p><i>DWEC - Curso 2024/2025</i></p></div>
