# Reno Platforms Assignment

## Live Demo
- GitHub: [https://github.com/Faizfaheed/Reno-assignment](https://github.com/Faizfaheed/Reno-assignment)  
- Vercel: [https://Reno-assignment.vercel.app](https://Reno-assignment.vercel.app)

---

## Features
- **Add School (Local Development Only):** Image upload using Formidable, saved to `/public/schoolImages`.  
- **Show Schools:** Responsive grid view with search by name, city, or address.  
- **API:** Next.js API routes with full validation (GET / POST).  
- **Database:** MySQL with `mysql2` + connection pooling, `ensureTable()` on app startup.  
- **Tooling:** Docker (MySQL, phpMyAdmin) with a dataset of 36 schools including real images.

---

## Tech Stack
- **Frontend:** Next.js, React  
- **Backend:** Next.js API Routes, Formidable  
- **Database:** MySQL (Docker / Local)  
- **Deployment:** Vercel

---

## Deployment Notes
- The hosted demo on Vercel runs in **read-only mode**:
  - `READ_ONLY=true`  
  - Users **cannot add schools** or upload images.  
  - Existing schools (seeded locally) are visible and searchable.  
- **Full functionality** (Add School with image upload) works **locally only** due to Vercel’s read-only filesystem.

---

## Local Setup (Full Functionality)

1. **Environment Variables:**  
   Create a `.env.local` file in your project root:

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=reno_assignment
   DB_PORT=3306

   DB_READ_ONLY=false
   NEXT_PUBLIC_DB_READ_ONLY=false

Start Docker MySQL & phpMyAdmin:

docker-compose up -d


Install dependencies:

npm install


Run the app locally:

npm run dev


Access locally:

Add School: http://localhost:3000/addSchool

Show Schools: http://localhost:3000/showSchools