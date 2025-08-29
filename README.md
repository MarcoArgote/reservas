# 📅 Agenda tu Cita - Sistema de Reservas Inteligente

Una aplicación web moderna para agendar citas con notificaciones push en tiempo real, construida con Next.js 15 y Turbopack.

## 🚀 Características Principales

- ✅ **Sistema de autenticación** completo (registro/login)
- 📱 **Responsive Design** - funciona en PC y móviles
- 🔔 **Notificaciones Push** en tiempo real
- 🗓️ **Gestión de citas** con recordatorios automáticos
- 🤖 **Asistente de IA** para describir el motivo de la cita
- 💾 **Sincronización de datos** entre dispositivos
- ⚡ **Service Worker** para notificaciones en segundo plano

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 15 con Turbopack
- **UI**: Tailwind CSS + Shadcn/UI
- **Base de datos**: JSON local (simulando backend)
- **Notificaciones**: Web Notifications API + Service Workers
- **IA**: Google Genkit para asistencia inteligente
- **Autenticación**: Sistema personalizado con JWT simulation

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- Node.js 18+ 
- npm o yarn
- Un navegador moderno que soporte Web Notifications

## ⚙️ Configuración e Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/MarcoArgote/reservas.git
cd reservas
```

### 2. Instalar dependencias
```bash
npm install
# o
yarn install
```

### 3. Configurar Firebase (Opcional)
Si quieres usar Firebase para notificaciones avanzadas:

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Inicializar Firebase
firebase login
firebase init
```

**Credenciales de Firebase necesarias:**
- Project ID: `tu-proyecto-firebase`
- Web App API Key: `tu-api-key`
- Messaging Sender ID: `tu-sender-id`

Crea un archivo `.env.local` con:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-firebase
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
```

### 4. Iniciar el servidor de desarrollo
```bash
npm run dev
```

La aplicación estará disponible en:
- **Local**: http://localhost:9002
- **Red local**: http://[tu-ip]:9002

## 📱 Acceso desde Dispositivos Móviles

Para usar la app desde tu celular en la misma red WiFi:

1. Obtén tu IP local:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. Abre en tu móvil: `http://[tu-ip]:9002`

## 🔔 Configuración de Notificaciones

### Paso 1: Permitir Notificaciones
1. Al abrir la app, aparecerá una tarjeta azul
2. Haz clic en "Activar notificaciones"
3. Acepta los permisos en el popup del navegador

### Paso 2: Probar Notificaciones
1. Una vez activadas, verás una tarjeta verde
2. Haz clic en "Probar notificación" para verificar
3. Deberías recibir una notificación de prueba

### Paso 3: Notificaciones Automáticas
- **Al registrar una cita**: Notificación inmediata "Cita reservada con éxito"
- **15 minutos antes**: Recordatorio automático "Tu cita es en 15 minutos"

## 🧪 Cómo Probar las Notificaciones

### Prueba Básica
1. Abre la app en tu navegador
2. Registra una cuenta nueva o inicia sesión
3. Acepta los permisos de notificación
4. Crea una nueva cita
5. ✅ **Resultado esperado**: Notificación inmediata de confirmación

### Prueba de Recordatorio
1. Crea una cita para 16-20 minutos en el futuro
2. Cierra la app (o déjala en segundo plano)
3. Espera 15 minutos
4. ✅ **Resultado esperado**: Notificación recordatorio automática

### Prueba Multi-Dispositivo
1. Registra una cuenta desde tu PC
2. Abre la app en tu celular
3. Inicia sesión con las mismas credenciales
4. Crea una cita desde el celular
5. ✅ **Resultado esperado**: Las citas se sincronizan entre dispositivos

## 📂 Estructura del Proyecto

```
src/
├── app/                    # Páginas de Next.js 15
│   ├── api/               # API Routes
│   │   ├── auth/          # Endpoints de autenticación
│   │   └── appointments/  # Endpoints de citas
│   ├── login/            # Página de login
│   ├── register/         # Página de registro
│   └── page.tsx          # Página principal
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de UI (Shadcn)
│   ├── appointment-form.tsx
│   ├── appointment-history.tsx
│   └── notification-permission.tsx
├── hooks/                # Hooks personalizados
│   ├── use-appointments.ts
│   ├── use-notifications.ts
│   └── use-toast.ts
├── lib/                  # Utilidades y servicios
│   ├── data.ts           # Manejo de datos JSON
│   ├── notifications.ts  # Servicio de notificaciones
│   └── types.ts          # Tipos TypeScript
└── context/              # Context providers
    └── auth-context.tsx  # Contexto de autenticación

data/                     # Base de datos local JSON
├── users.json           # Usuarios registrados
└── appointments.json    # Citas almacenadas

public/
└── sw.js               # Service Worker para notificaciones
```

## 🔐 Usuarios de Prueba

Puedes usar estas credenciales para pruebas rápidas:

```
Email: test@example.com
Password: 123456
```

O registra una cuenta nueva directamente en la app.

## 🐛 Solución de Problemas

### Las notificaciones no funcionan
1. **Verifica permisos**: Asegúrate de haber aceptado las notificaciones
2. **Navegador compatible**: Usa Chrome, Firefox, Safari o Edge
3. **HTTPS local**: Algunos navegadores requieren HTTPS para notificaciones
4. **Revisar consola**: Abre las herramientas de desarrollador para ver errores

### No puedo acceder desde el celular
1. **Misma red WiFi**: PC y móvil deben estar en la misma red
2. **Firewall**: Desactiva temporalmente el firewall de Windows
3. **IP correcta**: Verifica que uses la IP correcta con `ipconfig`

### Las citas no se sincronizan
1. **Conexión a internet**: Verifica que ambos dispositivos tengan conexión
2. **Reiniciar servidor**: Para el servidor y reinícialo con `npm run dev`
3. **Cache del navegador**: Limpia la caché o abre en ventana privada

## 🚀 Deployment

### Desarrollo Local
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

### Con Firebase Hosting
```bash
npm run build
firebase deploy
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

##  Autor

**Marco Argote**
- GitHub: [@MarcoArgote](https://github.com/MarcoArgote)

---

¡Dale una estrella al proyecto si te fue útil!
