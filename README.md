# 📚 ScholarX – Research Publication Management System

A production-ready MERN stack application for managing the full research publication workflow: submission → peer review → editorial decision → publication.

![Tech Stack](https://img.shields.io/badge/stack-MERN-blue) ![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

### For Researchers
- Submit papers with PDF upload, metadata, keywords, co-authors
- Track submission status in real-time
- View reviewer feedback
- Upload revised versions (full version history)

### For Reviewers
- See papers assigned to you
- Download/preview PDF in browser
- Submit structured reviews (comments, rating 1-10, decision)

### For Editors
- View all submissions with filters and search
- Assign reviewers (with **AI-powered recommendations** based on expertise matching)
- Approve, reject, or request revisions
- Publish accepted papers with journal name and auto-generated DOI
- Dashboard with submission statistics

### AI Features (mock implementations, swap for real APIs)
- 🔍 **Plagiarism score** — displayed on every submission
- ✨ **Auto summary** — AI-generated abstract summary
- 🎯 **Smart reviewer recommendations** — keyword-to-expertise matching

### Other
- 🌓 Full dark mode support
- 🔐 JWT authentication + role-based access control
- 📧 Email notifications via Nodemailer (optional)
- 🔎 Search papers by title, abstract, keywords
- 📄 PDF preview in browser
- 📱 Fully responsive UI

---

## 🏗️ Tech Stack

| Layer       | Technology                               |
|-------------|------------------------------------------|
| Frontend    | React 18, Vite, TailwindCSS, React Router, Axios, Lucide icons |
| Backend     | Node.js, Express.js                      |
| Database    | MongoDB + Mongoose                       |
| Auth        | JWT + bcrypt                             |
| File Upload | Multer (PDF only, max 20MB)              |
| Email       | Nodemailer (optional)                    |

---

## 📁 Project Structure

```
scholarx/
├── server/                  # Backend (Node.js + Express)
│   ├── config/db.js         # MongoDB connection
│   ├── models/              # User, Paper, Review schemas
│   ├── controllers/         # Business logic
│   ├── routes/              # API routes
│   ├── middleware/          # Auth + upload
│   ├── utils/               # AI, email, seed
│   ├── uploads/             # Uploaded PDFs (created at runtime)
│   ├── .env                 # Config (fill in)
│   └── server.js            # Entry point
│
├── client/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/      # Layout, Navbar, Sidebar, PaperCard, StatusBadge
│   │   ├── pages/           # Landing, Login, Register, Dashboard, SubmitPaper, MyPapers, PaperDetail, ReviewPanel, EditorPanel, SearchPapers, Profile
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── utils/api.js     # Axios instance with JWT injection
│   │   ├── App.jsx          # Routes
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   ├── vite.config.js       # Vite config (with /api proxy)
│   └── tailwind.config.js
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **MongoDB** running locally on `mongodb://localhost:27017` OR a MongoDB Atlas connection string

### 1. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend (new terminal)
cd client
npm install
```

### 2. Configure environment variables

The `server/.env` file is already created with sensible defaults:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/scholarx
JWT_SECRET=scholarx_super_secret_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

If you're using MongoDB Atlas, update `MONGO_URI`:
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/scholarx
```

**Optional** — for email notifications, add:
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=ScholarX <noreply@scholarx.com>
```
(Emails silently no-op if these aren't set, so you can skip this.)

### 3. Seed demo users (recommended)

```bash
cd server
npm run seed
```

This creates 5 demo accounts — **all with password `password123`**:

| Role       | Email                         |
|------------|-------------------------------|
| Researcher | `researcher@scholarx.com`     |
| Researcher | `researcher2@scholarx.com`    |
| Reviewer   | `reviewer@scholarx.com`       |
| Reviewer   | `reviewer2@scholarx.com`      |
| Editor     | `editor@scholarx.com`         |

### 4. Run the app

Open two terminals:

```bash
# Terminal 1 – Backend (http://localhost:5000)
cd server
npm run dev

# Terminal 2 – Frontend (http://localhost:5173)
cd client
npm run dev
```

Open http://localhost:5173 — the login page has "Demo Accounts" buttons to auto-fill credentials.

---

## 🔄 How to Test the Full Flow

1. **Login as researcher** (`researcher@scholarx.com`) → go to **Submit Paper** → upload any PDF
2. **Logout → login as editor** (`editor@scholarx.com`) → go to **Editor Panel** → click the **Assign Reviewer** icon on the new paper → pick a reviewer (AI recommendations appear at the top if keywords match expertise) → Assign
3. **Logout → login as reviewer** (`reviewer@scholarx.com`) → go to **Assigned Reviews** → click the paper → scroll down, fill in comments/rating/decision → Submit Review
4. **Logout → login as editor** → click the ✅ icon to Accept → then the 📖 icon to Publish → enter journal name → paper is published with DOI
5. **Logout → login as researcher** → check **My Papers** → paper shows as Published with DOI

---

## 🔌 API Endpoints

All endpoints prefixed with `/api`. Protected routes require `Authorization: Bearer <token>` header.

### Auth
| Method | Route              | Access         | Description               |
|--------|--------------------|----------------|---------------------------|
| POST   | `/auth/register`   | Public         | Register user             |
| POST   | `/auth/login`      | Public         | Login & get JWT           |
| GET    | `/auth/me`         | Any authed     | Current user              |

### Papers
| Method | Route                    | Access        | Description                    |
|--------|--------------------------|---------------|--------------------------------|
| POST   | `/papers/submit`         | Researcher    | Submit paper (multipart)       |
| GET    | `/papers/my-papers`      | Researcher    | My submissions                 |
| GET    | `/papers/all-papers`     | Editor        | All papers (?search=, ?status=)|
| GET    | `/papers/search?q=`      | Any authed    | Full-text search               |
| GET    | `/papers/:id`            | Author/Rev/Ed | Single paper                   |
| POST   | `/papers/:id/revise`     | Researcher    | Upload new version             |

### Reviews
| Method | Route                        | Access     | Description                |
|--------|------------------------------|------------|----------------------------|
| GET    | `/reviews/assigned`          | Reviewer   | My assigned papers         |
| POST   | `/reviews/submit`            | Reviewer   | Submit/update review       |
| GET    | `/reviews/paper/:paperId`    | Any authed | Get reviews for a paper    |

### Editor
| Method | Route                                  | Access | Description          |
|--------|----------------------------------------|--------|----------------------|
| POST   | `/editor/assign-reviewer`              | Editor | Assign reviewers     |
| GET    | `/editor/recommend-reviewers/:paperId` | Editor | AI recommendations   |
| POST   | `/editor/approve/:paperId`             | Editor | Accept paper         |
| POST   | `/editor/reject/:paperId`              | Editor | Reject paper         |
| POST   | `/editor/request-revision/:paperId`    | Editor | Request revision     |
| POST   | `/editor/publish/:paperId`             | Editor | Publish w/ DOI       |
| GET    | `/editor/stats`                        | Editor | Dashboard stats      |

### Users
| Method | Route                | Access     | Description           |
|--------|----------------------|------------|-----------------------|
| GET    | `/users/reviewers`   | Editor     | List all reviewers    |
| PUT    | `/users/profile`     | Any authed | Update profile        |

---

## 🧪 Sample API Requests

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"a@test.com","password":"password123","role":"researcher"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"researcher@scholarx.com","password":"password123"}'
```

### Submit Paper
```bash
curl -X POST http://localhost:5000/api/papers/submit \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=My Research" \
  -F "abstract=Abstract text..." \
  -F "keywords=AI,ML" \
  -F "file=@paper.pdf"
```

---

## 🚀 Deployment

### Backend → Render
1. Push `server/` to a GitHub repo
2. Create a new **Web Service** on [Render](https://render.com)
3. Set environment variables (MONGO_URI, JWT_SECRET, CLIENT_URL with your frontend URL)
4. Build command: `npm install`
5. Start command: `npm start`

### Frontend → Vercel
1. Push `client/` to a GitHub repo
2. Import project on [Vercel](https://vercel.com)
3. Framework preset: **Vite**
4. Add env var: `VITE_API_URL=https://your-backend.onrender.com/api`
5. Deploy

### MongoDB → Atlas
1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist IPs (or `0.0.0.0/0` for dev)
3. Copy connection string → put in Render's `MONGO_URI` env var

---

## 🐛 Troubleshooting

**"MongoDB Connection Error"** → ensure MongoDB is running locally (`mongod`) or Atlas URI is correct.

**"CORS error"** → check that `CLIENT_URL` in `server/.env` matches your frontend URL.

**"Port already in use"** → change `PORT` in `.env` or kill the process.

**PDF preview not loading** → make sure backend is running; Vite proxies `/uploads` to backend in dev.

---

## 📝 License

MIT — free to use for learning, portfolio, or production.

