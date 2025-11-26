# 🚀 Guía de Despliegue en Railway

Esta guía te llevará paso a paso para desplegar tu proyecto OnTime en Railway de forma gratuita.

## 📋 Requisitos Previos

- [ ] Cuenta de GitHub
- [ ] Repositorio del proyecto en GitHub
- [ ] Cuenta de Railway (gratis)

---

## 🎯 Paso 1: Preparar el Repositorio

### 1.1 Asegúrate de que todos los cambios estén commiteados

```bash
git add .
git commit -m "Add Railway deployment configuration"
git push origin deploy
```

### 1.2 Archivos de configuración creados

Los siguientes archivos ya han sido creados para ti:

- ✅ [`railway.toml`](file:///c:/Users/rmore/Desktop/PI/Proyecto/OnTime_entrega/railway.toml) - Configuración principal de Railway
- ✅ [`nixpacks.toml`](file:///c:/Users/rmore/Desktop/PI/Proyecto/OnTime_entrega/nixpacks.toml) - Configuración de build
- ✅ [`backend/deploy.sh`](file:///c:/Users/rmore/Desktop/PI/Proyecto/OnTime_entrega/backend/deploy.sh) - Script de despliegue
- ✅ Vite configurado para producción
- ✅ `.env.example` actualizado con configuración de producción

---

## 🚂 Paso 2: Crear Cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Haz clic en **"Login"** o **"Start a New Project"**
3. Inicia sesión con tu cuenta de GitHub
4. Autoriza a Railway para acceder a tus repositorios

---

## 📦 Paso 3: Crear un Nuevo Proyecto

### 3.1 Iniciar proyecto desde GitHub

1. En el dashboard de Railway, haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Busca y selecciona tu repositorio **OnTime_entrega**
4. Selecciona la rama **deploy**

### 3.2 Railway detectará automáticamente

Railway detectará que tienes:
- 🐘 PHP (Laravel)
- 📦 Node.js (React)
- 🗄️ SQLite

---

## ⚙️ Paso 4: Configurar Variables de Entorno

### 4.1 Variables Obligatorias

En Railway, ve a tu proyecto → **Variables** y agrega las siguientes:

```bash
# Aplicación
APP_NAME="OnTime"
APP_ENV=production
APP_DEBUG=false
APP_KEY=                    # Railway lo generará automáticamente

# Base de datos
DB_CONNECTION=sqlite

# Sesión y caché
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

# Logs
LOG_CHANNEL=stack
LOG_LEVEL=error
```

### 4.2 Generar APP_KEY

Railway puede generar la `APP_KEY` automáticamente, o puedes generarla localmente:

```bash
cd backend
php artisan key:generate --show
```

Copia el resultado (ejemplo: `base64:abcd1234...`) y agrégalo como variable `APP_KEY` en Railway.

### 4.3 URL de la Aplicación

Después del primer despliegue, Railway te asignará una URL. Actualiza la variable:

```bash
APP_URL=https://tu-proyecto.up.railway.app
```

---

## 💾 Paso 5: Configurar Almacenamiento Persistente (IMPORTANTE)

> [!WARNING]
> **Sin un volumen persistente, perderás todos tus datos cada vez que se redepliegue la aplicación.**

### 5.1 Crear un Volumen

1. En tu proyecto de Railway, ve a la pestaña **"Settings"**
2. Scroll hasta **"Volumes"**
3. Haz clic en **"New Volume"**
4. Configura:
   - **Mount Path:** `/app/backend/database`
   - **Size:** 1GB (suficiente para SQLite)
5. Haz clic en **"Add"**

### 5.2 Verificar el volumen

El volumen asegura que tu archivo `database.sqlite` persista entre despliegues.

---

## 🌐 Paso 6: Desplegar

### 6.1 Primer Despliegue

1. Railway comenzará a construir automáticamente
2. El proceso tomará 3-5 minutos:
   - 📥 Instalando dependencias de PHP (Composer)
   - 📥 Instalando dependencias de Node (npm)
   - 🏗️ Construyendo el frontend React
   - 📋 Ejecutando migraciones
   - ⚡ Optimizando Laravel para producción

### 6.2 Monitorear el Despliegue

1. Ve a la pestaña **"Deployments"**
2. Haz clic en el despliegue activo para ver los logs
3. Busca mensajes como:
   ```
   ✅ Despliegue completado exitosamente!
   ```

### 6.3 Obtener tu URL

1. Ve a la pestaña **"Settings"**
2. En **"Domains"**, encontrarás tu URL:
   ```
   https://tu-proyecto-production.up.railway.app
   ```
3. ¡Haz clic para abrir tu aplicación!

---

## ✅ Paso 7: Verificar el Despliegue

### 7.1 Checklist de Verificación

- [ ] El sitio carga correctamente
- [ ] El frontend React se muestra
- [ ] Las rutas de API funcionan (`/api/...`)
- [ ] La base de datos responde (login, registro, etc.)
- [ ] No hay errores 500 en los logs

### 7.2 Ver Logs en Tiempo Real

```bash
# En Railway, ve a tu proyecto → "Observability" → "Logs"
```

---

## 🔄 Paso 8: Despliegues Futuros

Railway redespliegará automáticamente cuando hagas push a la rama `deploy`:

```bash
# Hacer cambios en tu código
git add .
git commit -m "Feature: nueva funcionalidad"
git push origin deploy

# Railway detectará el push y redespliegará automáticamente ✨
```

---

## 🆓 Límites del Plan Gratuito

Railway ofrece **$5 USD de crédito gratis por mes**, que incluye:

- ⚡ 500 horas de ejecución (~20 días)
- 💾 1GB de almacenamiento persistente
- 🌐 100GB de ancho de banda

> [!TIP]
> Para proyectos pequeños y demos, esto es más que suficiente. Si tu app duerme cuando no se usa (plan Hobby), puedes extender el tiempo.

---

## 🔧 Solución de Problemas

### Error: "502 Bad Gateway"

**Causa:** La aplicación no inició correctamente.

**Solución:**
1. Verifica los logs en Railway
2. Asegúrate de que `APP_KEY` esté configurado
3. Verifica que el volumen esté montado correctamente

### Error: "Database not found"

**Causa:** El volumen no está configurado o montado incorrectamente.

**Solución:**
1. Ve a Settings → Volumes
2. Verifica que el mount path sea `/app/backend/database`
3. Redeployea el proyecto

### Error: "Route not found" en el frontend

**Causa:** El frontend no se copió correctamente al directorio public de Laravel.

**Solución:**
1. Verifica que `nixpacks.toml` esté en la raíz del proyecto
2. Revisa los logs de build para ver si `npm run build` se ejecutó
3. Redeployea

### La aplicación es muy lenta

**Causa:** Railway puede estar en modo "sleep" o los recursos son limitados.

**Solución:**
1. Railway puede dormir apps inactivas. El primer request puede tardar ~10-30 segundos
2. Considera optimizar las consultas de base de datos
3. Habilita caché en Laravel (ya configurado en `deploy.sh`)

---

## 📚 Recursos Adicionales

- [Documentación de Railway](https://docs.railway.app/)
- [Documentación de Laravel](https://laravel.com/docs)
- [Guía de Despliegue de Laravel](https://laravel.com/docs/deployment)

---

## 🎉 ¡Listo!

Tu aplicación OnTime ahora está desplegada en Railway y accesible desde cualquier parte del mundo.

**URL de tu aplicación:** `https://[tu-proyecto].up.railway.app`

---

## 🚀 Alternativas a Railway

Si prefieres explorar otras opciones gratuitas:

### Opción 2: Render

- **Pros:** Más generoso con el plan gratuito (750 horas)
- **Contras:** Apps duermen después de 15 min de inactividad
- **Tutorial:** Similar a Railway
- **URL:** [render.com](https://render.com)

### Opción 3: Despliegue Separado

- **Frontend:** Vercel/Netlify (gratis, ilimitado)
- **Backend:** Railway/Render
- **Pros:** Mejor rendimiento del frontend
- **Contras:** Necesitas configurar CORS

---

¿Preguntas? ¡No dudes en consultarlas!
