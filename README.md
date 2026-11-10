<<<<<<< HEAD
# Students Habit Tracking Management System (MERN)

A beginner-friendly MERN project for students to register, log in, create habits, mark daily completion, and view progress.

## Requirements
- Node.js 18+
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- VS Code

## 1. Backend setup
Open a terminal:

```bash
cd server
npm install
```

Create a `.env` file by copying `.env.example`, then set your MongoDB URI and JWT secret.

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

## 2. Frontend setup
Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

## 3. Create your first account
Use the Register option in the app. Each account sees and manages only its own habits.

## 4. Features
- Student registration and login (passwords are hashed)
- Add, view, update, and delete habits
- Habit categories and daily/weekly frequency
- Mark a habit complete for a selected date
- Dashboard totals and completion percentage
- Current streak calculation
- Search habits

## 5. API endpoints
All habit and habit-log endpoints require this header:

`Authorization: Bearer YOUR_JWT_TOKEN`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register student |
| POST | `/api/auth/login` | Login |
| GET | `/api/habits` | Fetch current student's habits |
| POST | `/api/habits` | Create a habit |
| PUT | `/api/habits/:id` | Update a habit |
| DELETE | `/api/habits/:id` | Delete a habit |
| GET | `/api/habit-logs?date=YYYY-MM-DD` | Fetch completion logs |
| POST | `/api/habit-logs/toggle` | Mark/unmark habit for a date |
| GET | `/api/habit-logs/progress` | Fetch dashboard statistics |

### Example create-habit body
```json
{
  "habitName": "Reading",
  "category": "Education",
  "description": "Read for 30 minutes",
  "frequency": "Daily"
}
```

### Example completion body
```json
{
  "habitId": "YOUR_HABIT_ID",
  "date": "2026-11-04",
  "status": true
}
```

## Notes
- The project uses CommonJS in the backend to avoid ES-module `require` errors.
- `.env` is intentionally not included. Never upload real passwords, secrets, or database credentials to GitHub.
- If MongoDB is not running locally, install MongoDB Community Server or use MongoDB Atlas and put its connection string in `server/.env`.
=======
# vite ⚡

> Next Generation Frontend Tooling

- 💡 Instant Server Start
- ⚡️ Lightning Fast HMR
- 🛠️ Rich Features
- 📦 Optimized Build
- 🔩 Universal Plugin Interface
- 🔑 Fully Typed APIs

Vite (French word for "fast", pronounced `/vit/`) is a new breed of frontend build tool that significantly improves the frontend development experience. It consists of two major parts:

- A dev server that serves your source files over [native ES modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), with [rich built-in features](https://vite.dev/guide/features.html) and astonishingly fast [Hot Module Replacement (HMR)](https://vite.dev/guide/features.html#hot-module-replacement).

- A [build command](https://vite.dev/guide/build.html) that bundles your code with [Rollup](https://rollupjs.org), pre-configured to output highly optimized static assets for production.

In addition, Vite is highly extensible via its [Plugin API](https://vite.dev/guide/api-plugin.html) and [JavaScript API](https://vite.dev/guide/api-javascript.html) with full typing support.

[Read the Docs to Learn More](https://vite.dev).
>>>>>>> 669b5c1d4a80597e347ace5839de204bd49bf3ee
