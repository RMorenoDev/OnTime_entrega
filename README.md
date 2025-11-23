# OnTime - Sistema de Gestión de Jornada y Permisos

Aplicación full-stack (Laravel + React/Vite) para fichaje de jornada, pausas y permisos. UI en español y migraciones/seeders incluidas para arrancar rápido.

## ✨ Funcionalidades
- 🔐 Autenticación con roles: Admin, Supervisor, Empleado (Sanctum).
- 🕒 Fichaje de entrada/salida y control de pausas.
- 📝 Solicitudes de permisos (vacaciones, médicas, personales) con aprobación/rechazo/cancelación.
- 📊 Panel de admin con métricas (usuarios, equipos, sesiones activas, permisos).
- 📄 Reportes de horas (personales/equipo) con vista imprimible.

## 🛠️ Stack
- 🎨 Frontend: React (Vite), React Router DOM, Axios, CSS base.
+- 🧰 Backend: Laravel 11 (PHP 8+), Sanctum, MySQL/MariaDB.
- 🐳 Entorno: Docker (Sail) opcional, Composer, Node.js.

## 📁 Estructura
```
backend/   # API Laravel (migraciones, seeders, controladores)
frontend/  # React + Vite (pages, components, contexts)
docs/      # Documentación y diagramas
README.md
```

## 🚀 Instalación
1) Backend
```bash
cd backend
composer install
cp .env.example .env        # Configura la DB si no usas Sail por defecto
./vendor/bin/sail up -d     # o php artisan serve si no usas Docker
./vendor/bin/sail artisan migrate --seed
```

2) Frontend
```bash
cd ../frontend
npm install
npm run dev                 # http://localhost:5173
```

3) 🌐 Rutas por defecto
- Frontend: http://localhost:5173
- API: http://localhost/api

## 🌱 Datos de ejemplo (seeders)
- Equipos: Comercial, Técnico, Logística (turno partido).
- Usuarios: 1 admin, 4 supervisores, 15 empleados (contraseña: `password`).
- Sesiones de trabajo, pausas y permisos generados para pruebas.

## 📝 Notas
- UI del frontend en español (login, registro, dashboard, admin, permisos, reportes, impresión).
- Seeders con acentos: usa UTF-8/colación adecuada en la base de datos.

## 👤 Autor
Ramón Moreno Zabala — DAW IES Julio Verne (curso 2025-2026). Proyecto académico; todos los derechos reservados.
