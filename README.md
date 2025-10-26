🕒 OnTime – Employee Worktime Management System
================================================

OnTime is a full-stack web application built with Laravel (PHP) and React (Vite).
It provides an efficient and secure system for tracking employee work sessions, breaks, and leave requests.
Designed with scalability and usability in mind, it simplifies daily HR tasks for small and medium-sized companies.

------------------------------------------------
🚀 Features
------------------------------------------------
- 🔐 Role-based authentication (Admin, Supervisor, Employee)
- 🕘 Clock-in/out and break tracking
- 🗓️ Leave and permission management
- 📊 Reports and statistics dashboard
- ⚙️ RESTful API (Laravel + Sanctum)
- 💻 Responsive UI built with React + TailwindCSS
- 🐳 Dockerized environment using Laravel Sail

------------------------------------------------
🧠 Tech Stack
------------------------------------------------
Frontend:
- ⚛️ React (Vite)
- 🎨 TailwindCSS
- 🔗 Axios
- 🧭 React Router DOM

Backend:
- 🐘 Laravel 11 (PHP 8+)
- 🔐 Laravel Sanctum
- 🗄️ MySQL / MariaDB
- 🐳 Docker + Laravel Sail

Tools:
- 🧰 Git & GitHub
- 🧪 Postman (API testing)
- 🐳 Docker Desktop
- 💡 VS Code + GitHub Copilot

------------------------------------------------
📂 Project Structure
------------------------------------------------
OnTime/
│
├── backend/                # Laravel API REST (PHP)
│   ├── app/
│   ├── routes/
│   ├── database/
│   ├── .env
│   └── docker-compose.yml
│
├── frontend/               # React + Vite (JavaScript)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── docs/                   # Project documentation and diagrams
│   ├── Documentacion_Proyecto_PI_RamonMoreno_v2.docx
│   ├── Diagramas/
│   └── Capturas/
│
└── README.md

------------------------------------------------
⚙️ Installation & Setup
------------------------------------------------
Prerequisites:
- 🐳 Docker Desktop
- 🧱 Composer
- 🧩 Node.js (v18+)
- 🌿 Git

🐘 Backend setup:
    cd backend
    composer install
    cp .env.example .env
    ./vendor/bin/sail up -d
    ./vendor/bin/sail artisan migrate --seed

⚛️ Frontend setup:
    cd ../frontend
    npm install
    npm run dev

🌐 Access the app:
- Frontend: http://localhost:5173
- Backend API: http://localhost/api

------------------------------------------------
🎯 Project Objectives
------------------------------------------------
- 🧩 Develop a modern and functional web solution for employee attendance tracking.
- 🧠 Apply good coding practices in both frontend and backend layers.
- 📚 Deliver a fully documented project including diagrams, analysis, and implementation.

------------------------------------------------
👨‍💻 Author
------------------------------------------------
Ramón Moreno Zabala  
🎓 Higher Degree in Web Application Development (DAW) – IES Julio Verne  
📅 Academic Year: 2025–2026

------------------------------------------------
📜 License
------------------------------------------------
This project was developed for educational purposes as part of the IES Julio Verne DAW program.
All rights reserved © 2025 Ramón Moreno Zabala.
