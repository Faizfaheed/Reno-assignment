import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';
import { getPool, ensureTable } from '../../../lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

const READ_ONLY = process.env.DB_READ_ONLY === 'true';

export default async function handler(req, res) {
  await ensureTable();

  if (READ_ONLY && req.method === 'POST') {
    return res.status(403).json({ ok: false, error: 'Read-only mode: Cannot add schools' });
  }

  if (req.method === 'POST') {
    try {
      const form = new IncomingForm({ multiples: false, keepExtensions: true });
      form.parse(req, async (err, fields, files) => {
        if (err) return res.status(400).json({ ok: false, error: 'Invalid form data' });

        const required = ['name', 'address', 'city', 'state', 'contact', 'email_id'];
        for (const r of required) {
          if (!fields[r] || String(fields[r]).trim() === '') {
            return res.status(422).json({ ok: false, error: `Missing field: ${r}` });
          }
        }

        const email = String(fields.email_id);
        if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(422).json({ ok: false, error: 'Invalid email' });

        const contact = String(fields.contact);
        if (!/^\d{7,15}$/.test(contact)) return res.status(422).json({ ok: false, error: 'Invalid contact number' });

        let imageRelPath = null;
        let file = files.image;
        if (Array.isArray(file)) file = file[0];

        if (file && file.size > 0) {
          const imagesDir = path.join(process.cwd(), 'public', 'schoolImages');
          if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

          const fileName = `${Date.now()}_${file.originalFilename || 'image'}`.replace(/\s+/g, '_');
          const destPath = path.join(imagesDir, fileName);

          // Copy across drives
          await fs.promises.copyFile(file.filepath, destPath);
          await fs.promises.unlink(file.filepath);

          imageRelPath = `/schoolImages/${fileName}`;
        } else {
          return res.status(422).json({ ok: false, error: 'Image is required' });
        }

        const pool = getPool();
        const sql = `INSERT INTO schools (name, address, city, state, contact, image, email_id)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await pool.execute(sql, [
          fields.name,
          fields.address,
          fields.city,
          fields.state,
          contact,
          imageRelPath,
          email,
        ]);

        return res.status(201).json({ ok: true, message: 'School created successfully' });
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ ok: false, error: 'Server error' });
    }
  } else if (req.method === 'GET') {
    try {
      const pool = getPool();
      const [rows] = await pool.query('SELECT id, name, address, city, image FROM schools ORDER BY id DESC');
      return res.status(200).json({ ok: true, data: rows });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ ok: false, error: 'Database error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end('Method Not Allowed');
  }
}
