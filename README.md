HRMS Lite - Human Resource Management System
A full-stack HRMS application designed to manage employee records, attendance, and leave requests efficiently.

🚀 Live Links
Web Application: [Paste your Netlify URL here]

API Documentation: [Paste your Railway Backend URL here]/docs

🛠 Tech Stack
Frontend: React.js, Vite, TailwindCSS

Backend: Python (FastAPI), SQLAlchemy, Uvicorn

Database: MySQL hosted on Railway

Deployment: Netlify (Frontend) & Railway (Backend)

⚙️ Key Features
Employee Management: View and add employee profiles.

Cloud Integration: Real-time data syncing between React frontend and FastAPI backend.

API Architecture: Fully documented RESTful API using Swagger UI.

🏃‍♂️ Local Setup Instructions
Backend Setup
cd backend

python -m venv venv

source venv/bin/activate (or venv\Scripts\activate on Windows)

pip install -r requirements.txt

uvicorn main:app --reload --port 8080

Frontend Setup
cd frontend

npm install

npm run dev

📝 Assumptions & Limitations
The application assumes a single-tenant architecture for this version.

Data persistence is handled via a managed MySQL instance on Railway.
