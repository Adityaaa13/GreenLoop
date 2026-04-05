# 🌿 GreenLoop

**AI-Powered Garbage Dump Detection & Cleanup Management System**

GreenLoop is a full-stack web application that empowers citizens to report illegal garbage dumps, uses AI (Google Gemini) to validate reports and verify cleanups, and helps municipal teams manage the cleanup workflow efficiently.

---

## 🚀 Tech Stack

### Backend (Node.js)

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens) + bcryptjs
- **File Storage:** Cloudinary (image uploads)
- **Dev Tools:** Nodemon

### AI Microservice (Python)

- **Framework:** FastAPI + Uvicorn
- **AI Model:** Google Gemini 2.5 Flash (via LangChain)
- **Validation:** Confidence-based routing (auto-accept / pending review / reject)
- **Storage:** SQLite + local blob storage

---

## 📁 Project Structure

```
GreenLoop/
├── backend/
│   ├── config/
│   │   ├── db.js                        # MongoDB connection
│   │   └── cloudinary.js                # Cloudinary config
│   ├── controllers/
│   │   ├── authController.js            # Login & citizen registration
│   │   ├── adminController.js           # Admin user management
│   │   ├── reportController.js          # Garbage dump report CRUD
│   │   ├── taskController.js            # Cleanup task management
│   │   └── dashboardController.js       # Analytics & stats
│   ├── middleware/
│   │   ├── auth.js                      # JWT authentication middleware
│   │   └── roleAuth.js                  # Role-based access control
│   ├── models/
│   │   ├── User.js                      # User model
│   │   ├── Report.js                    # Garbage dump report model
│   │   └── Task.js                      # Cleanup task model
│   ├── routes/
│   │   ├── authRoutes.js                # /api/auth
│   │   ├── adminRoutes.js               # /api/admin
│   │   ├── reportRoutes.js              # /api/reports
│   │   ├── taskRoutes.js                # /api/tasks
│   │   ├── uploadRoutes.js              # /api/upload
│   │   └── dashboardRoutes.js           # /api/dashboard
│   ├── services/
│   │   ├── aiService.js                 # Calls Python AI microservice
│   │   ├── uploadService.js             # Cloudinary upload config
│   │   └── garbage_image_tester/        # Python AI microservice
│   │       ├── models/                  # DB models (submission, audit, review)
│   │       ├── services/                # AI validation, decision engine, storage
│   │       ├── storage/                 # Blob storage for accepted images
│   │       ├── main.py                  # FastAPI entry point (runs on :8000)
│   │       ├── requirements.txt
│   │       └── .env.example
│   ├── seed-admin.js                    # Seed script for admin user
│   ├── server.js                        # App entry point
│   └── .env.example
├── frontend/
└── README.md
```

---

## 👥 User Roles

| Role          | Description                                       |
| ------------- | ------------------------------------------------- |
| **Citizen**   | Reports garbage dumps with images & GPS location  |
| **Team Lead** | Reviews reports, assigns cleanup tasks to workers |
| **Worker**    | Performs cleanups, submits proof images           |
| **Admin**     | Manages all users, monitors system-wide stats     |

---

## ✨ Core Features

- **Interactive Metric Dashboards:** Clickable real-time metric cards across Citizen, Team Lead, and Worker dashboards that instantly filter task/report lists.
- **Smart Rework Workflows:** Team Leads can flag cleanups that don't meet standards. Workers get alerted and can re-upload fresh cleanup evidence without creating duplicate tasks.
- **Enhanced Security:** Stateless JWT invalidation tracking user password changes to immediately log off compromised sessions.
- **Unified Views:** Unified, clean UI filtering for citizen reports avoiding split tables.

---

## 🔌 API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint    | Description          |
| ------ | ----------- | -------------------- |
| POST   | `/register` | Citizen registration |
| POST   | `/login`    | Login (all roles)    |

### Reports (`/api/reports`)

| Method | Endpoint | Description                        |
| ------ | -------- | ---------------------------------- |
| POST   | `/`      | Submit a new dump report (citizen) |
| GET    | `/`      | Get reports (filtered by role)     |

### Tasks (`/api/tasks`)

| Method | Endpoint       | Description                              |
| ------ | -------------- | ---------------------------------------- |
| POST   | `/`            | Create/assign a cleanup task (team lead) |
| GET    | `/`            | Get tasks (filtered by role)             |
| PATCH  | `/:id/status`  | Update task status                       |
| PATCH  | `/:id/cleanup` | Submit cleanup proof with image          |

### Admin (`/api/admin`)

| Method | Endpoint              | Description                |
| ------ | --------------------- | -------------------------- |
| POST   | `/create-user`        | Create team lead or worker |
| DELETE | `/delete-user/:id`    | Delete a user              |
| PATCH  | `/reset-password/:id` | Reset user password        |
| GET    | `/reports`            | View all reports           |
| GET    | `/tasks`              | View all tasks             |

### Dashboard (`/api/dashboard`)

| Method | Endpoint     | Description                                  |
| ------ | ------------ | -------------------------------------------- |
| GET    | `/admin`     | Admin analytics (dump trends, cleanup stats) |
| GET    | `/team-lead` | Team lead stats (worker performance)         |
| GET    | `/worker`    | Worker stats (completion rate)               |
| GET    | `/citizen`   | Citizen stats (submission history)           |

### Upload (`/api/upload`)

| Method | Endpoint | Description                |
| ------ | -------- | -------------------------- |
| POST   | `/`      | Upload image to Cloudinary |

### AI Microservice (`http://localhost:8000`)

| Method | Endpoint                | Description                           |
| ------ | ----------------------- | ------------------------------------- |
| POST   | `/api/validate/dump`    | Validate a garbage dump image by URL  |
| POST   | `/api/validate/cleanup` | Validate a cleanup proof image by URL |
| GET    | `/health`               | Health check                          |

---

## 🤖 AI Features

AI validation is handled by a dedicated Python microservice (`garbage_image_tester`) running alongside the Node backend.

- **Dump Validation:** When a citizen submits a report image, the Node backend calls the Python service which uses Gemini AI to verify if it's a real outdoor garbage dump. Returns `isValid`, `reasoning`, `confidence`.
- **Cleanup Verification:** When a worker submits a cleanup proof image, the Python service checks if the area looks clean. Returns `isClean`, `reasoning`, `confidence`.
- **Confidence-based routing:** High confidence (≥0.75) → auto-accept, medium (0.50–0.75) → pending review, low (<0.50) → reject.

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v18+)
- Python 3.8+
- MongoDB Atlas account
- Cloudinary account
- Google AI API key

### 1. Clone the repository

```bash
git clone https://github.com/Adityaaa13/GreenLoop.git
cd GreenLoop
```

### 2. Set up the Node.js backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `backend/.env`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PYTHON_AI_SERVICE_URL=http://localhost:8000
```

### 3. Set up the Python AI microservice

```bash
cd backend/services/garbage_image_tester
pip install -r requirements.txt
cp .env.example .env
```

Fill in `garbage_image_tester/.env`:

```
GOOGLE_API_KEY=your_google_ai_key
DATABASE_URL=sqlite:///./garbage_validation.db
BLOB_STORAGE_PATH=./storage/blobs
```

### 4. Seed the admin user

```bash
cd backend
node seed-admin.js
```

### 5. Run all services

**Terminal 1 — Python AI microservice:**

```bash
cd backend/services/garbage_image_tester
python main.py
# runs on http://localhost:8000
```

**Terminal 2 — Node.js backend:**

```bash
cd backend
npm run dev
# runs on http://localhost:5000
```

**Terminal 3 — Frontend:**

```bash
cd frontend
npm install
npm run dev
# runs on http://localhost:5173
```

---

## 🔐 Default Admin Credentials

- **Email:** admin@greenloop.com
- **Password:** _(set in seed-admin.js)_

---

## 🧑‍🤝‍🧑 Team Workflow

1. Always pull the latest changes before starting work:
   ```bash
   git pull origin main
   ```
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit and push your branch:
   ```bash
   git add .
   git commit -m "feat: describe your change"
   git push origin feature/your-feature-name
   ```
4. Create a **Pull Request** on GitHub to merge into `main`.

---

## 📝 License

ISC
