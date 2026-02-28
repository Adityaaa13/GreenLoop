# 🌿 GreenLoop

**AI-Powered Garbage Dump Detection & Cleanup Management System**

GreenLoop is a full-stack web application that empowers citizens to report illegal garbage dumps, uses AI (Google Gemini) to validate reports and verify cleanups, and helps municipal teams manage the cleanup workflow efficiently.

---

## 🚀 Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens) + bcryptjs
- **AI:** Google Gemini 2.0 Flash (via LangChain)
- **File Storage:** Cloudinary (image uploads)
- **Dev Tools:** Nodemon

---

## 📁 Project Structure

```
GreenLoop/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Login & citizen registration
│   │   ├── adminController.js     # Admin user management
│   │   ├── reportController.js    # Garbage dump report CRUD
│   │   ├── taskController.js      # Cleanup task management
│   │   └── dashboardController.js # Analytics & stats
│   ├── middleware/
│   │   ├── auth.js                # JWT authentication middleware
│   │   └── roleAuth.js            # Role-based access control
│   ├── models/
│   │   ├── User.js                # User model (citizen, worker, team_lead, admin)
│   │   ├── Report.js              # Garbage dump report model
│   │   └── Task.js                # Cleanup task model
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth
│   │   ├── adminRoutes.js         # /api/admin
│   │   ├── reportRoutes.js        # /api/reports
│   │   ├── taskRoutes.js          # /api/tasks
│   │   ├── uploadRoutes.js        # /api/upload
│   │   └── dashboardRoutes.js     # /api/dashboard
│   ├── services/
│   │   ├── aiService.js           # Gemini AI validation logic
│   │   └── uploadService.js       # Cloudinary upload config
│   ├── seed-admin.js              # Seed script for admin user
│   ├── server.js                  # App entry point
│   └── .env.example               # Environment variable template
├── frontend/                      # (Coming soon)
└── README.md
```

---

## 👥 User Roles

| Role | Description |
|------|-------------|
| **Citizen** | Reports garbage dumps with images & GPS location |
| **Team Lead** | Reviews reports, assigns cleanup tasks to workers |
| **Worker** | Performs cleanups, submits proof images |
| **Admin** | Manages all users, monitors system-wide stats |

---

## 🔌 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Citizen registration |
| POST | `/login` | Login (all roles) |

### Reports (`/api/reports`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Submit a new dump report (citizen) |
| GET | `/` | Get reports (filtered by role) |

### Tasks (`/api/tasks`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create/assign a cleanup task (team lead) |
| GET | `/` | Get tasks (filtered by role) |
| PATCH | `/:id/status` | Update task status |
| PATCH | `/:id/cleanup` | Submit cleanup proof with image |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-user` | Create team lead or worker |
| DELETE | `/delete-user/:id` | Delete a user |
| PATCH | `/reset-password/:id` | Reset user password |
| GET | `/reports` | View all reports |
| GET | `/tasks` | View all tasks |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin` | Admin analytics (dump trends, cleanup stats) |
| GET | `/team-lead` | Team lead stats (worker performance) |
| GET | `/worker` | Worker stats (completion rate) |
| GET | `/citizen` | Citizen stats (submission history) |

### Upload (`/api/upload`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Upload image to Cloudinary |

---

## 🤖 AI Features

- **Dump Validation:** When a citizen submits a report image, Gemini AI analyzes it to verify if it's an actual garbage dump (returns `isValid`, `reasoning`, `confidence`).
- **Cleanup Verification:** When a worker submits a cleanup proof image, Gemini AI checks if the area looks clean (returns `isClean`, `reasoning`, `confidence`).

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Cloudinary account
- Google AI API key

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Adityaaa13/GreenLoop.git
   cd GreenLoop
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your actual values in the `.env` file:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_random_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   GOOGLE_API_KEY=your_google_ai_key
   ```

4. **Seed the admin user**
   ```bash
   node seed-admin.js
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

---

## 🔐 Default Admin Credentials
- **Email:** admin@greenloop.com
- **Password:** *(set in seed-admin.js)*

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
