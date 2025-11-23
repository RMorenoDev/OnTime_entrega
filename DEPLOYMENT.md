# 🚀 OnTime - Guía de Deployment

## Preparación para Producción

### ✅ PASO 1: Completado Localmente
- [x] Documentación en `docs/` (local, no versionada)
- [x] Tests funcionales completados
- [x] Código revisado

---

## 📋 Checklist de Deployment

### Backend (Laravel)

```bash
# 1. Variables de entorno de producción
cp .env.example .env.production

# Configurar en .env.production:
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.com

DB_HOST=tu-servidor-mysql
DB_DATABASE=ontime_production
DB_USERNAME=usuario_produccion
DB_PASSWORD=contraseña_segura

# 2. Instalar dependencias de producción
composer install --optimize-autoloader --no-dev

# 3. Generar clave de aplicación
php artisan key:generate

# 4. Ejecutar migraciones
php artisan migrate --force

# 5. Ejecutar seeders (SOLO primera vez)
php artisan db:seed

# 6. Cachear configuración
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 7. Optimizar autoload
composer dump-autoload --optimize
```

### Frontend (React + Vite)

```bash
# 1. Variables de entorno de producción
# Crear .env.production en frontend/

VITE_API_URL=https://api.tu-dominio.com/api

# 2. Instalar dependencias
npm install

# 3. Build de producción
npm run build

# Esto crea la carpeta frontend/dist con archivos optimizados
```

---

## 🌐 Opciones de Hosting

### Opción A: Hosting Tradicional (Compartido/VPS)

**Backend:**
- Subir carpeta `backend/` al servidor
- Apuntar dominio a `backend/public/`
- Configurar `.htaccess` para Laravel
- Asegurar permisos de `storage/` y `bootstrap/cache/`

**Frontend:**
- Subir contenido de `frontend/dist/` al servidor
- Puede estar en el mismo dominio o subdominio
- Configurar redirect para SPA (Single Page App)

**Configuración Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

### Opción B: Servicios Cloud

**Backend (Laravel):**
- **Laravel Forge** - Deployment automático
- **Heroku** - Con buildpack PHP
- **DigitalOcean App Platform**
- **AWS** - EC2 + RDS

**Frontend (React):**
- **Vercel** - Deploy automático desde Git
- **Netlify** - CI/CD integrado
- **GitHub Pages** - Gratis para repos públicos
- **Firebase Hosting**

### Opción C: Deployment Rápido con Render.com

**Backend:**
```yaml
# render.yaml (en la raíz del proyecto)
services:
  - type: web
    name: ontime-api
    env: php
    buildCommand: composer install && php artisan migrate --force
    startCommand: php artisan serve --host=0.0.0.0 --port=$PORT
    envVars:
      - key: APP_KEY
        generateValue: true
      - key: APP_ENV
        value: production
```

**Frontend:**
- Conectar repo a Vercel
- Auto-detecta Vite
- Deploy automático en cada push

---

## 🔒 Seguridad en Producción

### Backend
```env
# En .env de producción

# Nunca dejes APP_DEBUG=true en producción
APP_DEBUG=false

# Genera nueva APP_KEY
php artisan key:generate

# CORS - Especifica dominios permitidos
FRONTEND_URL=https://tuapp.com

# Base de datos con credenciales seguras
DB_PASSWORD=contraseña_muy_segura_aleatoria

# Rate limiting
THROTTLE_LIMIT=60
```

### Frontend
```javascript
// No expongas credenciales
// Usa variables de entorno

// .env.production
VITE_API_URL=https://api.tudominio.com/api
```

### MySQL
```sql
-- Crear usuario específico para la app
CREATE USER 'ontime_user'@'localhost' IDENTIFIED BY 'contraseña_segura';
GRANT ALL PRIVILEGES ON ontime_production.* TO 'ontime_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📊 Monitoreo y Logs

### Laravel Logs
```bash
# Ver logs en tiempo real
tail -f storage/logs/laravel.log

# Logs por severidad
# storage/logs/laravel-YYYY-MM-DD.log
```

### Errores comunes y soluciones

**Error: "No application encryption key"**
```bash
php artisan key:generate
```

**Error: Permisos en storage/**
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

**Error: CORS en API**
```bash
# Configurar en config/cors.php
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')]
```

---

## 🧪 Testing antes de Deploy

### Backend
```bash
# Tests unitarios
php artisan test

# Test de endpoints
php artisan route:list
```

### Frontend
```bash
# Build local para verificar
npm run build
npm run preview

# Verifica que la app funcione en localhost:4173
```

---

## 📦 Estructura Final de Deployment

```
Servidor Web
├── /var/www/ontime-backend/
│   ├── public/             # Document root de Apache/Nginx
│   ├── app/
│   ├── routes/
│   ├── .env               # Configuración de producción
│   └── ...
│
└── /var/www/ontime-frontend/
    ├── index.html
    ├── assets/
    │   ├── index-xxx.js   # JS optimizado
    │   └── index-xxx.css  # CSS optimizado
    └── ...
```

---

## 🔄 Workflow de Deployment

### Deployment Manual
```bash
# 1. En tu máquina local
git checkout delivery
git pull origin main  # Merge últimos cambios
npm run build         # Build frontend

# 2. Subir archivos al servidor (FTP/SFTP)
# O usar Git en el servidor:
ssh usuario@servidor
cd /var/www/ontime
git pull origin delivery

# 3. En el servidor
cd backend
composer install --no-dev
php artisan migrate --force
php artisan cache:clear
php artisan config:cache
```

### Deployment Automático (CI/CD)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [delivery]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
      
      - name: Install Dependencies
        run: composer install --no-dev
        working-directory: ./backend
      
      - name: Deploy to Server
        uses: easingthemes/ssh-deploy@v2
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SERVER_SSH_KEY }}
          REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
          REMOTE_USER: ${{ secrets.REMOTE_USER }}
```

---

## 📞 Soporte y Mantenimiento

### Actualizaciones
```bash
# Proceso de actualización
1. Hacer backup de la base de datos
2. git pull nuevos cambios
3. composer install
4. php artisan migrate
5. php artisan cache:clear
6. Verificar funcionalidad
```

### Backup de Base de Datos
```bash
# Backup
mysqldump -u usuario -p ontime_production > backup_$(date +%Y%m%d).sql

# Restaurar
mysql -u usuario -p ontime_production < backup_20251123.sql
```

---

## ✅ Checklist Final pre-Deploy

- [ ] `.env.production` configurado
- [ ] `APP_DEBUG=false`
- [ ] Base de datos creada y migrada
- [ ] Frontend buildeado (`npm run build`)
- [ ] CORS configurado correctamente
- [ ] Permisos de archivos correctos
- [ ] SSL/HTTPS configurado
- [ ] Backup de base de datos creado
- [ ] Tests pasando
- [ ] Variables de entorno del frontend configuradas
- [ ] Logs monitorizables

---

*Documentación de Deployment - OnTime*  
*Rama: `delivery` | Ambiente: Producción*
