#!/bin/bash

# Script de despliegue para Railway
# Este script prepara la aplicación Laravel para producción

echo "🚀 Iniciando despliegue..."

# Crear directorio para SQLite si no existe
mkdir -p database
touch database/database.sqlite

# Ejecutar migraciones
echo "📦 Ejecutando migraciones de base de datos..."
php artisan migrate --force --no-interaction

# Optimizar la aplicación para producción
echo "⚡ Optimizando aplicación..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Establecer permisos correctos
echo "🔐 Configurando permisos..."
chmod -R 775 storage bootstrap/cache
chmod 664 database/database.sqlite

echo "✅ Despliegue completado exitosamente!"
