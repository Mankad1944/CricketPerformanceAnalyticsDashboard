# 🏏 IPL Analytics & Management Platform

A full-stack, role-based cricket analytics platform designed for the Indian Premier League (IPL). Built with a **Django REST Framework** backend and a modern **React + Vite + Tailwind CSS** frontend, this system delivers ball-by-ball intelligence, team performance tracking, player profiling, and role-tailored dashboards.

---

## 🌟 Key Features

### 🔐 Role-Based Access Control (RBAC)
Dedicated experiences and permission levels for four distinct roles:
- **🛡️ Admin**: User & staff management (coaches, analysts, players), data seeding pipelines, activity auditing, cache management, and AI/smart chat processor.
- **📋 Coach**: Squad monitoring, auto-squad builder, fitness and workload tracking, training session scheduling (intensity & drills), and match breakdown.
- **📊 Analyst**: In-depth analytical tools including venue analytics, head-to-head batsman vs. bowler matchups, phase-of-play breakdown (Powerplay, Middle, Death), performance scatter plots, trend evaluations, and exportable reports.
- **🏏 Player**: Personalized statistics, season-by-season run accumulation, strike rate evolution, phase-wise performance, and opposition analysis.

---

### 📈 Analytics & Intelligence Engine
- **Ball-by-Ball Match Insights**: Parsed from Cricsheet match records covering all IPL seasons.
- **Head-to-Head Matchup Matrix**: Batter vs. bowler statistics (runs scored, strike rates, dismissals, dot balls).
- **Phase-of-Play Analysis**: Performance categorized into Powerplay (overs 1–6), Middle overs (7–15), and Death overs (16–20).
- **Leaderboards**: Top run-scorers and leading wicket-takers with customizable filters.
- **Export & Reporting**: Generate downloadable **PDF** and **Excel (.xlsx)** reports for match audits and player evaluations.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Charts & Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Exporting**: `jspdf`, `jspdf-autotable`, `xlsx`

### Backend
- **Framework**: [Django 4.2+](https://www.djangoproject.com/) & [Django REST Framework](https://www.django-rest-framework.org/)
- **Production Server**: `gunicorn` + `whitenoise`
- **Authentication**: JWT via `djangorestframework-simplejwt`
- **CORS Handling**: `django-cors-headers`
- **Database Driver**: `PyMySQL` (Pure-Python MySQL driver for cloud environments)
- **Data Source**: Cricsheet YAML dataset parser

---

## 📁 Repository Structure

```text
IPL-Analytics-main/
├── backend/
│   ├── api/
│   │   ├── management/commands/   # Match data ingestion scripts (YAML parsers)
│   │   ├── migrations/            # Django database migrations
│   │   ├── models.py              # Data models (Match, Innings, Delivery, Player, Team, etc.)
│   │   ├── serializers.py         # DRF serializers
│   │   ├── urls.py                # REST API endpoints routing
│   │   └── views/                 # Modular API views (auth, analytics, coach, analyst, etc.)
│   ├── backend/                   # Django settings, WSGI/ASGI, root URLs
│   ├── build.sh                   # Render automated build script
│   ├── manage.py                  # Django administrative script
│   ├── requirements.txt           # Python backend dependencies
│   └── .env.example               # Backend environment variables template
├── data2/                         # Cricsheet YAML ball-by-ball match datasets
├── frontend/
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── api/                   # Axios API service clients with dynamic base URL
│   │   ├── components/            # Reusable UI components & layouts
│   │   ├── context/               # Auth & application state context
│   │   ├── pages/                 # Role dashboards (Admin, Coach, Analyst, Player, Login)
│   │   ├── utils/                 # Utility helpers and export formatters
│   │   ├── App.jsx                # Application root with routing
│   │   └── main.jsx               # React entry point with URL interceptor
│   ├── package.json               # Node.js dependencies and scripts
│   ├── vercel.json                # Vercel SPA routing rewrites
│   ├── vite.config.js             # Vite configuration
│   └── .env.example               # Frontend environment variables template
├── render.yaml                    # Render Blueprint infrastructure definition
├── .gitignore                     # Git ignore rules for secrets and build artifacts
└── README.md                      # Project documentation
```

---

## 🚀 Step 1: Upload to GitHub

Follow these steps in your terminal to initialize and push this codebase to a new GitHub repository:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Stage all files
git add .

# 3. Create initial commit
git commit -m "Initial commit: IPL Analytics & Management Platform"

# 4. Set main branch
git branch -M main

# 5. Link your GitHub remote repository (replace with your repo URL)
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 6. Push to GitHub
git push -u origin main
```

---

## 🗄️ Step 2: Set Up Cloud MySQL Database

For cloud deployment, you need a hosted MySQL instance. Here are the top recommended cloud MySQL launchers:

### Option A: TiDB Cloud Serverless (Recommended — 100% Free Forever)
- **Features**: Fully compatible with MySQL 5.7/8.0, 5 GB storage free tier, no credit card required.
1. Sign up at [tidbcloud.com](https://tidbcloud.com/).
2. Create a free **Serverless** cluster.
3. Under **Overview > Connect**, select **Django** or **General MySQL**.
4. Copy the connection string in the format:
   ```text
   mysql://<user>:<password>@<host>:<port>/<database>
   ```

### Option B: Aiven for MySQL
1. Sign up at [aiven.io](https://aiven.io/).
2. Create a new service and choose **MySQL**.
3. Copy the **Service URI** (e.g., `mysql://avnadmin:pass@host:port/defaultdb?ssl-mode=REQUIRED`).

### Option C: Railway MySQL
1. Go to [railway.app](https://railway.app/).
2. Click **New Project** > **Provision MySQL**.
3. Under the database **Variables** tab, copy `MYSQL_URL`.

---

## ☁️ Step 3: Deploy Backend to Render

1. Log in to [render.com](https://render.com/).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Configure the service settings:
   - **Name**: `ipl-analytics-backend`
   - **Region**: Closest to your users (e.g., Singapore or Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn backend.wsgi:application`
5. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `DEBUG` | `False` |
   | `SECRET_KEY` | *(Click "Generate" or provide a random 50-char string)* |
   | `ALLOWED_HOSTS` | `.onrender.com,localhost,127.0.0.1` |
   | `CORS_ALLOW_ALL_ORIGINS` | `True` |
   | `DATABASE_URL` | *(Your MySQL connection string from Step 2)* |
6. Click **Deploy Web Service**.
7. Once deployed, copy your backend URL:
   `https://ipl-analytics-backend.onrender.com`

---

## 🌐 Step 4: Deploy Frontend to Vercel

1. Log in to [vercel.com](https://vercel.com/).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository.
4. Configure the build settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and choose `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://ipl-analytics-backend.onrender.com` *(Your Render URL without trailing slash)* |
6. Click **Deploy**.
7. Vercel will build and launch your live website with automatic SSL!

---

## 💻 Local Development Setup

### Backend (Local)
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend (Local)
```bash
cd frontend
npm install
npm run dev
```

---

## 📡 Key API Endpoints

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/token/` | `POST` | Obtain JWT access and refresh tokens |
| **Auth** | `/api/token/refresh/` | `POST` | Refresh access token |
| **Players** | `/api/players/` | `GET` | List all players |
| **Players** | `/api/player/<name>/profile/` | `GET` | Retrieve player career statistics & bio |
| **Matchups** | `/api/matchup/<batsman>/vs/<bowler>/`| `GET` | Head-to-head batter vs bowler analytics |
| **Leaderboard** | `/api/leaderboard/top-batsmen/` | `GET` | Fetch tournament top run scorers |
| **Leaderboard** | `/api/leaderboard/top-bowlers/` | `GET` | Fetch tournament top wicket takers |
| **Analyst** | `/api/analytics/analyst-overview/` | `GET` | High-level analytical overview |
| **Analyst** | `/api/analytics/player-comparison/`| `GET` | Compare two players side-by-side |
| **Analyst** | `/api/analytics/venue-stats/` | `GET` | Venue pitch, toss, and scoring stats |
| **Coach** | `/api/analytics/squad/` | `GET` | Retrieve assigned team squad roster |
| **Coach** | `/api/training/sessions/` | `GET/POST`| Schedule and retrieve team training sessions |
| **Admin** | `/api/users/` | `GET/POST`| Admin user management |
| **Admin** | `/api/admin/clear-cache/` | `POST` | Invalidate analytical cache |

---

## 📑 License
This project is for educational and analytics research purposes. Match data provided by [Cricsheet](https://cricsheet.org/).
