#!/bin/bash

# Script de build para Render
# Instala dependencias y prepara la aplicación para producción

echo "🔨 Instalando dependencias de Composer..."
cd backend
composer install --no-dev --optimize-autoloader --no-interaction

echo "📦 Ejecutando migraciones de base de datos..."
php artisan migrate --force --no-interaction

echo "⚡ Optimizando aplicación para producción..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Build completado exitosamente!"
