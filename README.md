# Announcements & Suspension Alerts Dashboard

Full-stack web application for tracking class suspensions and weather advisories.

## Stack
- **Backend:** Node.js + Express
- **Database:** SQLite via `better-sqlite3`
- **Templating:** EJS
- **Frontend:** Vanilla HTML/CSS/JS

## Setup
1. Install Node.js (v18+ recommended).
2. From this folder, run:
   ```bash
   npm install
   npm run seed
   npm start
   ```
3. Open http://localhost:3000

## Features
- Server-rendered dashboard with EJS
- REST API:
  - `GET    /api/suspensions?province=...&q=...`
  - `POST   /api/suspensions`
  - `DELETE /api/suspensions/:id`
  - `GET    /api/status`
  - `GET    /api/tips`
  - `GET    /api/announcement`
- Live search + province filter (calls API on each keystroke)
- Admin form to add suspensions; inline ✕ button to delete

## Project layout
```
.
├── server.js            # Express app + REST API
├── db.js                # SQLite connection + schema
├── seed.js              # Seeds DB with Sept 3, 2026 data
├── package.json
├── views/
│   └── dashboard.ejs    # Server-rendered page
├── public/
│   ├── styles.css
│   └── script.js        # Fetches API, drives search/filter/admin
└── data/                # SQLite DB created here on first run
```