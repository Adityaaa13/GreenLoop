# GreenLoop Dev Log

## Session 1 — Setup & Microservice Integration

### 1. Cloned the repo

Forked from `neeleshgadi/GreenLoop` and cloned into the workspace:

```bash
git clone https://github.com/neeleshgadi/GreenLoop.git GreenLoop
```

### 2. Copied local project into workspace

Copied `D:\project_7\garbage_image_tester` into `GreenLoop/garbage_image_tester`.

The `garbage_image_tester` is a Python/FastAPI service that validates garbage images using Gemini 2.0 Flash via LangChain. It has:

- Confidence-based routing (auto-accept / pending review / reject)
- Audit logging
- Manual review queue
- SQLite database
- React frontend

### 3. Integrated garbage_image_tester as an AI microservice

**Goal:** Replace GreenLoop's `backend/services/aiService.js` (which called Gemini directly) with HTTP calls to the Python service.

**Changes made:**

#### `GreenLoop/garbage_image_tester/main.py`

- Added `POST /api/validate/dump` endpoint
  - Accepts `{ "imageUrl": "..." }` JSON body
  - Fetches image from URL, runs AI validation
  - Returns `{ "isValid": bool, "reasoning": str, "confidence": float }`
- Added `POST /api/validate/cleanup` endpoint
  - Accepts `{ "imageUrl": "..." }` JSON body
  - Returns `{ "isClean": bool, "reasoning": str, "confidence": float }`

#### `GreenLoop/garbage_image_tester/services/ai_validation_service.py`

- Added `validate_cleanup_image()` method with a cleanup-specific system prompt
- Added `CLEANUP_SYSTEM_PROMPT` class attribute for cleanup verification logic

#### `GreenLoop/backend/services/aiService.js`

- Removed all Gemini SDK code (`@google/genai`, base64 fetching, model fallback logic)
- Replaced with HTTP calls to the Python microservice using Node's built-in `http`/`https` modules
- `validateDumpImage(imageUrl)` → calls `POST /api/validate/dump`
- `validateCleanupImage(imageUrl)` → calls `POST /api/validate/cleanup`
- Reads `PYTHON_AI_SERVICE_URL` from env (defaults to `http://localhost:8000`)

#### `GreenLoop/backend/.env.example`

- Removed `GOOGLE_API_KEY` (no longer needed in Node backend)
- Added `PYTHON_AI_SERVICE_URL=http://localhost:8000`

### 4. Environment files configured

#### `GreenLoop/backend/.env`

```
PORT=5000
MONGO_URI=<mongodb atlas uri>
JWT_SECRET=<secret>
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
PYTHON_AI_SERVICE_URL=http://localhost:8000
```

#### `GreenLoop/garbage_image_tester/.env`

```
GOOGLE_API_KEY=<gemini api key>
DATABASE_URL=sqlite:///./garbage_validation.db
BLOB_STORAGE_PATH=./storage/blobs
```

---

### How to run

**Terminal 1 — Python AI service:**

```bash
cd GreenLoop/garbage_image_tester
python main.py
# runs on http://localhost:8000
```

**Terminal 2 — Node.js backend:**

```bash
cd GreenLoop/backend
npm run dev
# runs on http://localhost:5000
```

---

_Future changes will be appended below this line._

---

## Session 2 — Running All Services

### Installed dependencies

```bash
npm install   # in GreenLoop/backend
npm install   # in GreenLoop/frontend
```

### Started all three services as background processes

| Service           | Command                                              | URL                   |
| ----------------- | ---------------------------------------------------- | --------------------- |
| Node.js backend   | `npm run dev` in `GreenLoop/backend`                 | http://localhost:5000 |
| React frontend    | `npm run dev` in `GreenLoop/frontend`                | http://localhost:5173 |
| Python AI service | `python main.py` in `GreenLoop/garbage_image_tester` | http://localhost:8000 |

### Issue: MongoDB Atlas DNS not resolving

Backend crashes on startup with:

```
MongoDB connection error: querySrv ESERVFAIL _mongodb._tcp.cluster0.jxav7pf.mongodb.net
```

Network/firewall is blocking MongoDB Atlas SRV DNS resolution.

Fix: Add your current IP to MongoDB Atlas → Network Access allowlist, or switch to a different network.

### Fix: MongoDB SRV DNS not resolving

System DNS couldn't resolve `mongodb+srv://` format. Switched to direct connection string in `backend/.env`:

```
MONGO_URI=mongodb://user:pass@ac-mvjt2n5-shard-00-00.jxav7pf.mongodb.net:27017,ac-mvjt2n5-shard-00-01...,ac-mvjt2n5-shard-00-02.../?ssl=true&authSource=admin&retryWrites=true&w=majority
```

Shard hostnames were discovered via `nslookup -type=SRV _mongodb._tcp.cluster0.jxav7pf.mongodb.net 8.8.8.8`.
Backend now connects successfully.

---

## Session 3 — Cleanup of garbage_image_tester

Removed all unnecessary files since the project now runs purely as a microservice:

- `frontend/` — standalone React UI, not needed
- `utils/` — all test files
- `app/` — empty package
- `.kiro/`, `.pytest_cache/`, `.vscode/`, `__pycache__/` — IDE/cache artifacts
- `storage/blobs/*`, `storage/temp_blobs/*`, `test_storage/` — old test images
- `garbage_validation.db`, `test_integration.db` — old test databases
- `test_api.py`, `list_models.py` — dev/test scripts
- `PRESENTATION.md`, `PROJECT_REPORT.md`, `README.md` — docs

Kept: `main.py`, `models/`, `services/`, `storage/` (empty dirs), `requirements.txt`, `.env`, `.env.example`, `.gitignore`

---

## Session 4 — Moved garbage_image_tester

Moved `GreenLoop/garbage_image_tester/` → `GreenLoop/backend/services/garbage_image_tester/`

Python service now runs from:

```bash
cd GreenLoop/backend/services/garbage_image_tester
python main.py
```

---

## Session 5 — Backend cleanup

Removed unused files and packages from `GreenLoop/backend`:

- Deleted `test-ai.js` — old Gemini test script
- Deleted `error_log.txt` — stale log artifact
- Uninstalled npm packages no longer used: `@google/genai`, `@langchain/core`, `@langchain/google-genai` (98 packages removed)

`uploadService.js` and `aiService.js` are kept — both are actively used.

---

## Session 6 — Updated README.md

Updated `GreenLoop/README.md` to reflect the new architecture:

- Added Python AI microservice to the tech stack section
- Updated project structure to show `garbage_image_tester` inside `backend/services/`
- Added AI microservice API endpoints table
- Updated setup instructions with Python service setup steps
- Updated "Run all services" section with all 3 terminals
- Removed old `GOOGLE_API_KEY` from Node backend env, replaced with `PYTHON_AI_SERVICE_URL`
