import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';
import { getPool, ensureTable } from '../../../lib/db';

export const config = { api: { bodyParser: false } };

const READ_ONLY = process.env.DB_READ_ONLY === 'true';

export default async function handler(req, res) {
  if (!READ_ONLY) await ensureTable();

  // Block POST in read-only mode
  if (READ_ONLY && req.method === 'POST') {
    return res
      .status(403)
      .json({ ok: false, error: 'Read-only mode: Cannot add schools' });
  }

  // POST - local only
  if (req.method === 'POST') {
    const form = new IncomingForm({ multiples: false, keepExtensions: true });
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(400).json({ ok: false, error: 'Invalid form data' });

      // Validate required fields
      const required = ['name', 'address', 'city', 'state', 'contact', 'email_id'];
      for (const r of required) {
        if (!fields[r] || String(fields[r]).trim() === '') {
          return res.status(422).json({ ok: false, error: `Missing field: ${r}` });
        }
      }

      // Validate email
      const email = String(fields.email_id);
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(422).json({ ok: false, error: 'Invalid email' });
      }

      // Validate contact
      const contact = String(fields.contact);
      if (!/^\d{7,15}$/.test(contact)) {
        return res.status(422).json({ ok: false, error: 'Invalid contact number' });
      }

      // Handle image upload
      let imageRelPath = null;
      let file = files.image;
      if (Array.isArray(file)) file = file[0];

      if (file && file.size > 0) {
        const imagesDir = path.join(process.cwd(), 'public', 'schoolImages');
        if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

        const fileName = `${Date.now()}_${file.originalFilename || 'image'}`.replace(/\s+/g, '_');
        const destPath = path.join(imagesDir, fileName);

        await fs.promises.copyFile(file.filepath, destPath);
        await fs.promises.unlink(file.filepath);

        imageRelPath = `/schoolImages/${fileName}`;
      } else {
        return res.status(422).json({ ok: false, error: 'Image is required' });
      }

      // Insert into DB
      const pool = getPool();
      await pool.execute(
        `INSERT INTO schools (name, address, city, state, contact, image, email_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [fields.name, fields.address, fields.city, fields.state, contact, imageRelPath, email]
      );

      return res.status(201).json({ ok: true, message: 'School created successfully' });
    });
  }

  // GET
  else if (req.method === 'GET') {
    if (READ_ONLY) {
      // Static demo schools for Vercel
      const data = [
        { id: 1, name: 'Demo School 1', city: 'Demo City', image: '/schoolImages/demo1.jpg' },
        { id: 2, name: 'Demo School 2', city: 'Demo City', image: '/schoolImages/demo2.jpg' },
        { id: 3, name: 'Demo School 3', city: 'Demo City', image: '/schoolImages/demo3.jpg' },
      ];
      return res.status(200).json({ ok: true, data });
    }

    try {
      const pool = getPool();
      const [rows] = await pool.query(
        'SELECT id, name, address, city, image FROM schools ORDER BY id DESC'
      );
      return res.status(200).json({ ok: true, data: rows });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ ok: false, error: 'Database error' });
    }
  }

  // Method not allowed
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end('Method Not Allowed');
  }
}
