# 🔗 HookLinks

A full-stack responsive web app to store, organize, and explore useful links — with likes, bookmarks, categories, admin panel, and dark mode.

---

## 🧱 Tech Stack

| Layer      | Tech                              |
|------------|-----------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS    |
| Backend    | Node.js + Express                 |
| Database   | MongoDB Atlas (Mongoose)          |
| Auth       | JWT (JSON Web Tokens) + bcryptjs  |
| Email      | Nodemailer (password reset)       |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm v9+
- A MongoDB Atlas cluster (already configured)

---

### 1. Clone / Download

```bash
# Extract the ZIP or clone, then enter the folder
cd hooklinks
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Edit `.env` and update the email settings:

```env
# Already set — your MongoDB URI:
MONGODB_URI=mongodb+srv://albiondrax6_db_user:aPBAtRTwcMFRu1AL@hooklink.inlci8s.mongodb.net/hooklinks

# JWT (change this to a long random string in production):
JWT_SECRET=hooklinks_super_secret_jwt_key_2024_xK9mP3qR

# Email — use Gmail with App Password:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=HookLinks <your_gmail@gmail.com>

# URL for password reset emails:
FRONTEND_URL=http://localhost:3000

# ⬇ Set this email to auto-grant admin on first signup:
ADMIN_EMAIL=admin@yourdomain.com
```

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail".

Start the backend:

```bash
node server.js
# ✅ Connected to MongoDB
# 🚀 HookLinks API running on port 5000
```

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
# App running at http://localhost:3000
```

---

## 🔑 Admin Access

Set `ADMIN_EMAIL` in `.env` to your email address.  
When you sign up with that email, your account is automatically granted admin privileges.

Once logged in as admin:
- Click your avatar (top right) → **Admin Panel**
- Create categories first, then add links

---

## 📱 Features

### 🔐 Authentication
- Sign up (unique username + email + password)
- Login with username + password
- Show/hide password toggle (👁)
- Forgot password → email reset link → set new password

### 🏠 Home Page
- Responsive card grid (2 cols mobile → 5 cols desktop)
- Category filter tabs
- Real-time search by title, description, category
- Skeleton loading states

### 🃏 Link Cards
- Image with lazy loading
- ❤️ Like toggle (updates count live)
- ↗ Visit (opens in new tab)
- ℹ️ Info modal (blur backdrop, full description)
- ◈ Bookmark toggle

### ❤️ Liked / ◈ Saved
- Dedicated pages showing your liked/bookmarked links
- Removing like/bookmark removes from list instantly

### 🛠️ Admin Panel
- Stats dashboard (links / categories / users)
- Add / Edit / Delete links
- Add / Edit / Delete categories (with icon picker + color picker)
- Live image URL preview when adding links

### 🌙 Dark Mode
- Toggle in navbar (☀ / ◑)
- Saved to localStorage

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password/:token` | Reset password |

### Links (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/links` | Get all links (supports `?category=&search=&page=`) |
| GET | `/api/links/liked` | Get current user's liked links |
| GET | `/api/links/bookmarks` | Get current user's bookmarks |
| POST | `/api/links/:id/like` | Toggle like |
| POST | `/api/links/:id/bookmark` | Toggle bookmark |

### Categories (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |

### Admin (admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/links` | All links |
| POST | `/api/admin/links` | Add link |
| PUT | `/api/admin/links/:id` | Edit link |
| DELETE | `/api/admin/links/:id` | Delete link |
| POST | `/api/admin/categories` | Add category |
| PUT | `/api/admin/categories/:id` | Edit category |
| DELETE | `/api/admin/categories/:id` | Delete category |

---

## 🗂️ Project Structure

```
hooklinks/
├── backend/
│   ├── models/
│   │   ├── User.js          # name, email, password, isAdmin, likedLinks, bookmarks
│   │   ├── Link.js          # title, url, imageUrl, description, category, likes
│   │   └── Category.js      # name, slug, icon, color
│   ├── routes/
│   │   ├── auth.js          # signup, login, me, profile, forgot/reset password
│   │   ├── links.js         # CRUD, like, bookmark
│   │   ├── categories.js    # list
│   │   └── admin.js         # admin-only CRUD
│   ├── middleware/
│   │   └── auth.js          # protect + adminOnly
│   ├── utils/
│   │   └── email.js         # nodemailer + HTML email template
│   ├── .env
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/index.js      # axios client + all API functions
    │   ├── contexts/
    │   │   ├── AuthContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── components/
    │   │   ├── Layout.jsx    # Navbar + footer + outlet
    │   │   └── LinkCard.jsx  # Card with like/visit/info/bookmark
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── ForgotPasswordPage.jsx
    │   │   ├── ResetPasswordPage.jsx
    │   │   ├── HomePage.jsx
    │   │   ├── LikedPage.jsx
    │   │   ├── BookmarksPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   └── AdminPage.jsx
    │   ├── App.jsx           # Routes + guards
    │   ├── main.jsx
    │   └── index.css         # Tailwind + design system
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚢 Production Deployment

### Backend (Railway / Render / VPS)
```bash
cd backend
npm start
```
Set all `.env` variables in your platform's environment settings.  
Update `FRONTEND_URL` to your actual frontend URL.

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# Upload /dist folder, or connect Git repo
```
Set `VITE_API_URL` if your backend is on a different domain, and update `vite.config.js` proxy accordingly.

---

## 🔒 Security Notes

- Passwords hashed with **bcryptjs** (12 rounds)
- JWT tokens expire in **7 days**
- Password reset tokens expire in **1 hour**
- All admin routes protected server-side
- Input validated on both frontend and backend
- Duplicate likes prevented at both API and DB level

---

Built with ♥ — HookLinks
