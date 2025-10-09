# Sistema de Login con Panel de Administración

Este proyecto implementa un sistema completo de autenticación y autorización de usuarios con panel de administración, basado en la especificación OpenAPI 2.0 proporcionada.

## 🚀 Características Principales

### ✅ Sistema de Autenticación JWT
- Login con email y contraseña
- Tokens de acceso y refresh automáticos
- Renovación automática de tokens
- Almacenamiento seguro en localStorage

### ✅ Registro de Usuarios Completo
- Formulario con todos los campos requeridos según API
- Validación de datos en tiempo real
- Subida de fotografía de identificación
- Sistema de roles (voluntarios, personal, servicio social, etc.)

### ✅ Panel de Administración
- **Gestión de Usuarios Pendientes:**
  - Lista paginada de usuarios pendientes
  - Filtrado por rol
  - Autorización y rechazo de usuarios
  - Visualización de fotografías de identificación
  
- **Estadísticas del Sistema:**
  - Total de usuarios registrados
  - Usuarios autorizados vs pendientes
  - Distribución de usuarios por rol
  - Tarjetas visuales con indicadores

### ✅ Dashboard de Usuario
- Información completa del perfil
- Estado de autorización
- Interfaz adaptada según el rol del usuario

### ✅ Estados de Usuario
- **Usuario Pendiente:** Pantalla especial para usuarios no autorizados
- **Usuario Autorizado:** Acceso completo al dashboard
- **Administrador:** Acceso al panel de administración

### ✅ Diseño Moderno
- **Tema Claro:** Fondo blanco con colores vibrantes
- **Colores:** Morado (#8b5cf6), Azul Cian (#06b6d4), Verde (#10b981)
- **Franjas Angulares:** Patrones sutiles en 45°, -45° y 135°
- **Tipografía:** Inter como fuente principal
- **Gradientes:** Botones con gradientes angulares
- **Responsive:** Adaptado para móviles y tablets

## 🛠️ Tecnologías Utilizadas

- **React 19+** - Framework de UI
- **React Router DOM** - Enrutamiento
- **Axios** - Cliente HTTP
- **Context API** - Gestión de estado
- **CSS Variables** - Sistema de diseño
- **Vite** - Build tool

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── Login.jsx              # Componente de login
│   ├── Register.jsx           # Formulario de registro
│   ├── Dashboard.jsx          # Dashboard de usuario
│   ├── AdminPanel.jsx         # Panel de administración
│   ├── PendingUser.jsx        # Pantalla de usuario pendiente
│   ├── AppRoutes.jsx          # Configuración de rutas
│   └── components.css         # Estilos de componentes
├── contexts/
│   └── AuthContext.jsx        # Context de autenticación
├── services/
│   └── api.js                 # Servicios de API
├── App.jsx                    # Componente principal
├── App.css                    # Estilos globales de app
├── index.css                  # Sistema de diseño y variables CSS
└── main.jsx                   # Punto de entrada
```

## 🔐 Funcionalidades de Seguridad

### Autenticación
- Tokens JWT con renovación automática
- Interceptores de Axios para manejo de tokens
- Redirección automática en caso de tokens expirados
- Limpieza de tokens al cerrar sesión

### Autorización
- Rutas protegidas por roles
- Verificación de estado de autorización
- Diferentes dashboards según el rol del usuario

## 🎨 Sistema de Diseño

### Colores Principales
- **Morado:** `#8b5cf6` (primario)
- **Azul Cian:** `#06b6d4` (secundario)
- **Verde:** `#10b981` (éxito)
- **Blanco:** `#ffffff` (fondo)

### Gradientes
- **Morado:** `linear-gradient(45deg, #8b5cf6, #a78bfa)`
- **Cian:** `linear-gradient(45deg, #06b6d4, #22d3ee)`
- **Verde:** `linear-gradient(45deg, #10b981, #34d399)`

### Franjas Angulares
- Patrones sutiles en el fondo
- Ángulos: 45°, -45°, 135°
- Opacidad baja (5%) para no interferir con el contenido

## 📱 Responsive Design

- **Mobile First:** Diseñado primero para móviles
- **Breakpoints:** 768px para tablet/desktop
- **Grid Adaptativo:** Las tarjetas se reorganizan automáticamente
- **Tablas Responsivas:** Scroll horizontal en móviles

## 🔧 Configuración de la API

El sistema está configurado para consumir la API en `http://localhost:8000`. 

### Endpoints Implementados:
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario
- `POST /auth/refresh` - Renovar token
- `GET /profile` - Perfil del usuario
- `GET /admin/users/pending` - Usuarios pendientes
- `POST /admin/users/:id/authorize` - Autorizar usuario
- `POST /admin/users/:id/reject` - Rechazar usuario
- `GET /admin/users/:id/identification` - Ver identificación
- `GET /admin/stats` - Estadísticas

## 🚀 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## 📋 Requisitos del Sistema

- Node.js 16+
- NPM o Yarn
- Servidor API ejecutándose en puerto 8000

## 🔄 Flujo de Usuario

1. **Registro:** Usuario completa formulario con identificación
2. **Estado Pendiente:** Usuario queda en espera de autorización
3. **Autorización Admin:** Administrador revisa y autoriza/rechaza
4. **Acceso Completo:** Usuario autorizado accede al dashboard

## 🎯 Roles Disponibles

- **admin** - Acceso completo y gestión de usuarios
- **voluntarios** - Voluntarios de la organización
- **personal** - Personal de la organización
- **servicio_social** - Personas en servicio social
- **visitas** - Visitantes autorizados
- **familiares** - Familiares de beneficiarios
- **donantes** - Donantes de la organización
- **proveedores** - Proveedores de servicios

---

## ✨ Características Visuales Destacadas

- 🎨 **Tema claro moderno** con patrones angulares
- 🌈 **Gradientes suaves** en botones y elementos interactivos
- 📱 **Diseño responsive** optimizado para todos los dispositivos
- 🔄 **Animaciones sutiles** para mejorar la experiencia de usuario
- 📊 **Tarjetas de estadísticas** con indicadores visuales
- 🖼️ **Visualización de imágenes** en modales para identificaciones

El sistema está listo para producción y cumple con todos los requisitos especificados en la documentación OpenAPI.