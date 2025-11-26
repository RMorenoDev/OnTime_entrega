# 🚀 Guía de Despliegue - Render + Vercel

Despliega tu proyecto OnTime **100% GRATIS** usando Render para el backend y Vercel para el frontend.

---

## 📊 Arquitectura del Despliegue

```
┌─────────────┐         HTTPS          ┌──────────────┐
│   Usuario   │ ──────────────────────► │   Vercel     │
└─────────────┘                         │  (Frontend)  │
                                        │   React      │
                                        └──────┬───────┘
                                               │
                                        HTTPS API Calls
                                               │
                                        ┌──────▼───────┐
                                        │    Render    │
                                        │  (Backend)   │
                                        │   Laravel    │
                                        └──────┬───────┘
                                               │
                                        ┌──────▼───────┐
                                        │  PostgreSQL  │
                                        │   Database   │
                                        └──────────────┘
```

**Frontend (Vercel):**
- ✅ React + Vite
- ✅ Never sleeps
- ✅ Global CDN (ultra rápido)
- ✅ HTTPS automático

**Backend (Render):**
- ✅ Laravel + PostgreSQL
- ✅ HTTPS automático
- ⚠️ Duerme después de 15 min (se despierta en ~30s)

---

## 📋 Requisitos Previos

- [ ] Cuenta de GitHub
- [ ] Repositorio OnTime en GitHub
- [ ] Cuenta de Render (gratuita, sin tarjeta de crédito)
- [ ] Cuenta de Vercel (gratuita, sin tarjeta de crédito)

---

## 🗄️ PASO 1: Desplegar Backend en Render

### 1.1 Crear Cuenta en Render

1. Ve a [render.com](https://render.com)
2. Haz clic en **"Get Started"**
3. Inicia sesión con GitHub
4. Autoriza a Render para acceder a tus repositorios

### 1.2 Crear Web Service

1. En el dashboard, haz clic en **"New +"** → **"Blueprint"**
2. Conecta tu repositorio **OnTime_entrega**
3. Selecciona la rama **deploy**
4. Render detectará automáticamente el archivo `render.yaml`
5. Haz clic en **"Apply"**

> [!IMPORTANT]
> Render creará automáticamente:
> - 🌐 **Web Service** (Laravel backend)
> - 🗄️ **PostgreSQL Database** (1GB gratis)
> - 🔗 Variables de entorno conectadas automáticamente

### 1.3 Esperar el Despliegue

El proceso toma 5-7 minutos:

```
📥 Clonando repositorio...
📦 Instalando dependencias de Composer...
🗄️ Creando base de datos PostgreSQL...
📋 Ejecutando migraciones...
⚡ Optimizando Laravel...
✅ Despliegue completado!
```

### 1.4 Obtener la URL del Backend

1. Una vez completado, ve a tu **Web Service**
2. Copia la URL (ejemplo: `https://ontime-backend.onrender.com`)
3. **¡Guarda esta URL!** La necesitarás para el frontend

### 1.5 Verificar el Backend

Abre en el navegador:
```
https://TU-BACKEND.onrender.com/api/...
```

Deberías ver las respuestas de tu API.

---

## 🎨 PASO 2: Desplegar Frontend en Vercel

### 2.1 Crear Cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"**
3. Inicia sesión con GitHub

### 2.2 Importar Proyecto

1. En el dashboard, haz clic en **"Add New..."** → **"Project"**
2. Busca y selecciona **OnTime_entrega**
3. Haz clic en **"Import"**

### 2.3 Configurar el Proyecto

**Build Settings:**
- **Framework Preset:** Vite
- **Root Directory:** `frontend` (¡MUY IMPORTANTE!)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### 2.4 Configurar Variables de Entorno

En la sección **"Environment Variables"**, agrega:

| Nombre | Valor |
|--------|-------|
| `VITE_API_URL` | `https://TU-BACKEND.onrender.com` |

> [!WARNING]
> **¡Reemplaza `TU-BACKEND` con la URL real de Render del Paso 1.4!**

Ejemplo:
```
VITE_API_URL=https://ontime-backend.onrender.com
```

### 2.5 Desplegar

1. Haz clic en **"Deploy"**
2. Espera 2-3 minutos
3. ¡Listo! 🎉

### 2.6 Obtener URL del Frontend

Vercel te dará una URL como:
```
https://ontime-entrega.vercel.app
```

---

## 🔗 PASO 3: Conectar Frontend con Backend

### 3.1 Actualizar Backend URL en Render

1. Ve a tu Web Service en Render
2. Ve a **"Environment"**
3. Busca la variable `APP_URL`
4. Actualízala con tu URL de Render:
   ```
   APP_URL=https://TU-BACKEND.onrender.com
   ```
5. Guarda cambios (se redespliegará automáticamente)

### 3.2 Verificación de CORS

El CORS ya está configurado en `backend/config/cors.php` para aceptar todas las solicitudes. Si tienes problemas:

1. Ve a `backend/config/cors.php`
2. Verifica que `'allowed_origins' => ['*']` esté presente
3. O cambia a tu dominio específico de Vercel:
   ```php
   'allowed_origins' => ['https://ontime-entrega.vercel.app'],
   ```

---

## ✅ PASO 4: Verificación

### 4.1 Checklist

- [ ] Backend responde en `https://TU-BACKEND.onrender.com/api/...`
- [ ] Frontend carga en `https://ontime-entrega.vercel.app`
- [ ] El frontend puede hacer llamadas al backend
- [ ] Login/registro funciona correctamente
- [ ] Los datos se guardan en PostgreSQL

### 4.2 Pruebas

1. **Abre el frontend** en Vercel
2. **Prueba el registro** de un nuevo usuario
3. **Prueba el login**
4. **Verifica que las funciones principales funcionen**

> [!TIP]
> Si es la primera solicitud después de 15 minutos, el backend tardará ~30 segundos en despertar. ¡Es normal!

---

## 🔄 PASO 5: Despliegues Futuros

### Automáticos con Git Push

Ambas plataformas redespliegarán automáticamente cuando hagas push a la rama `deploy`:

```bash
git add .
git commit -m "Nueva funcionalidad"
git push origin deploy

# ✨ Render y Vercel detectan el push y redesplegan automáticamente
```

### Monitorear Despliegues

**Render:**
- Ve a tu Web Service → **"Logs"**
- Verás el progreso en tiempo real

**Vercel:**
- Ve a tu proyecto → **"Deployments"**
- Cada commit crea un nuevo deployment

---

## 🆓 Límites del Plan Gratuito

### Render (Backend)

| Recurso | Límite Gratuito |
|---------|-----------------|
| Web Services | 750 horas/mes |
| PostgreSQL | 1GB de almacenamiento |
| RAM | 512MB |
| Sleeping | Después de 15 min de inactividad |

### Vercel (Frontend)

| Recurso | Límite Gratuito |
|---------|-----------------|
| Bandwidth | 100GB/mes |
| Deployments | Ilimitados |
| Sleeping | **Nunca duerme** ⚡ |
| Dominios | https://tu-proyecto.vercel.app |

> [!NOTE]
> Para proyectos estudiantiles y demos, estos límites son **más que suficientes**.

---

## 🔧 Solución de Problemas

### Backend no responde (502/503 Error)

**Causa:** El backend está durmiendo.

**Solución:** Espera 30 segundos. La primera solicitud lo despertará.

### Error: "CORS policy blocked"

**Causa:** CORS no está configurado correctamente.

**Solución:**
1. Verifica `backend/config/cors.php`
2. Asegúrate de que `'allowed_origins' => ['*']`
3. Redeployea el backend en Render

### Frontend muestra "Network Error"

**Causa:** La URL del backend no está configurada correctamente.

**Solución:**
1. Ve a Vercel → tu proyecto → **"Settings"** → **"Environment Variables"**
2. Verifica que `VITE_API_URL` tenga la URL correcta de Render
3. Redeployea el  frontend

### Base de datos vacía después de redeployar

**Causa:** Las migraciones no se ejecutaron.

**Solución:**
1. Ve a Render → tu Web Service → **"Shell"**
2. Ejecuta manualmente:
   ```bash
   cd backend
   php artisan migrate
   ```

### Build falla en Vercel

**Causa:** Root directory incorrecta.

**Solución:**
1. Ve a Vercel → Settings → General
2. Establece **Root Directory** en `frontend`
3. Redeployea

---

## 🎯 Recomendaciones de Uso

### Para Demos y Presentaciones

1. **Antes de la demo:** Haz una solicitud al backend 5 minutos antes para que esté despierto
2. **Durante la demo:** El frontend siempre será rápido (Vercel)
3. **Después:** Deja que el backend duerma para ahorrar horas gratuitas

### Para Desarrollo Continuo

- Usa tu entorno local para desarrollo
- Deploy a `deploy` branch solo cuando tengas cambios listos
- Usa el frontend de Vercel para probar en dispositivos móviles

### Para Producción Real

Si tu proyecto crece, considera:
- **Render:** Upgrade a plan pagado (7$/mes) para que no duerma
- **Vercel:** El plan gratuito es suficiente para la mayoría de proyectos
- **Base de datos:** Considera un servicio dedicado si necesitas más de 1GB

---

## 📚 Recursos Adicionales

- [Documentación de Render](https://render.com/docs)
- [Documentación de Vercel](https://vercel.com/docs)
- [Laravel Deployment](https://laravel.com/docs/deployment)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

---

## 🎉 ¡Felicidades!

Tu aplicación OnTime ahora está desplegada en:

- **Frontend:** `https://ontime-entrega.vercel.app`
- **Backend:** `https://ontime-backend.onrender.com`

**100% Gratis y accesible desde cualquier parte del mundo!** 🌍

---

## 📝 Resumen de Archivos Creados

| Archivo | Propósito |
|---------|-----------|
| [`render.yaml`](file:///c:/Users/rmore/Desktop/PI/Proyecto/OnTime_entrega/render.yaml) | Configuración de servicios de Render |
| [`backend/build.sh`](file:///c:/Users/rmore/Desktop/PI/Proyecto/OnTime_entrega/backend/build.sh) | Script de build para Render |
| [`vercel.json`](file:///c:/Users/rmore/Desktop/PI/Proyecto/OnTime_entrega/vercel.json) | Configuración de Vercel |
| [`frontend/.env.production`](file:///c:/Users/rmore/Desktop/PI/Proyecto/OnTime_entrega/frontend/.env.production) | Variables de producción |
| [`frontend/.env.development`](file:///c:/Users/rmore/Desktop/PI/Proyecto/OnTime_entrega/frontend/.env.development) | Variables de desarrollo |

¿Preguntas? ¡No dudes en consultarlas!
