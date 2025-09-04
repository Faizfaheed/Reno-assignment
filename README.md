# Reno Platforms Assignment

## Live Demo
- GitHub: https://github.com/Faizfaheed/Reno-assignment
- Vercel: (https://reno-assignment-izqw-5qv060lki-faheeds-projects-1330102e.vercel.app/addSchool)

## Features
- Add School (local dev): image upload with formidable, saved to /public/schoolImages
- Show Schools: responsive grid, search by name/city/address
- API: Next.js routes with validation (GET/POST)
- DB: MySQL with mysql2 + connection pooling, ensureTable() on boot
- Tooling: Docker (MySQL, phpMyAdmin), dataset of 36 schools with real images

## Tech
Next.js, React, Formidable, MySQL (Docker/Cloud), Vercel

## Deployment Notes
- The hosted demo runs in **read-only mode** on Vercel (`READ_ONLY=true`).  
  Uploads are disabled because Vercel’s runtime file system is read-only.  
  To test uploads, run locally.

## Local Setup
```bash
cp .env.example .env.local  # or create .env.local with DB_*
docker-compose up -d
npm install
npm run dev
