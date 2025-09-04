import { useForm } from 'react-hook-form';
import { useState } from 'react';
import Link from 'next/link';

const READ_ONLY = process.env.NEXT_PUBLIC_DB_READ_ONLY === 'true';

export default function AddSchool() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },import path from 'path';
import fs from 'fs';
import { IncomingForm } from 'formidable';
import { getPool, ensureTable } from '../../../lib/db';

export const config = { api: { bodyParser: false } };

const READ_ONLY = process.env.DB_READ_ONLY === 'true';

export default async function handler(req, res) {
  if (!READ_ONLY) await ensureTable();

  // Block POST in read-only mode
  if (READ_ONLY && req.method === 'POST') {
    return res.status(403).json({ ok: false, error: 'Read-only mode: Cannot add schools' });
  }

  // POST - local only
  if (req.method === 'POST') {
    const form = new IncomingForm({ multiples: false, keepExtensions: true });
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(400).json({ ok: false, error: 'Invalid form data' });

      const required = ['name', 'address', 'city', 'state', 'contact', 'email_id'];
      for (const r of required) {
        if (!fields[r] || String(fields[r]).trim() === '')
          return res.status(422).json({ ok: false, error: `Missing field: ${r}` });
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

        await fs.promises.copyFile(file.filepath, destPath);
        await fs.promises.unlink(file.filepath);

        imageRelPath = `/schoolImages/${fileName}`;
      } else return res.status(422).json({ ok: false, error: 'Image is required' });

      const pool = getPool();
      await pool.execute(
        `INSERT INTO schools (name, address, city, state, contact, image, email_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [fields.name, fields.address, fields.city, fields.state, contact, imageRelPath, email]
      );

      return res.status(201).json({ ok: true, message: 'School created successfully' });
    });
  }

  // GET
  else if (req.method === 'GET') {
    if (READ_ONLY) {
      // Static demo schools
      const data = [
        { id: 1, name: 'Demo School 1', city: 'Demo City', image: '/schoolImages/demo1.jpg' },
        { id: 2, name: 'Demo School 2', city: 'Demo City', image: '/schoolImages/demo2.jpg' },
        { id: 3, name: 'Demo School 3', city: 'Demo City', image: '/schoolImages/demo3.jpg' },
      ];
      return res.status(200).json({ ok: true, data });
    }

    try {
      const pool = getPool();
      const [rows] = await pool.query('SELECT id, name, address, city, image FROM schools ORDER BY id DESC');
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

    reset,
  } = useForm();
  const [serverMsg, setServerMsg] = useState(null);

  const onSubmit = async (data) => {
    if (READ_ONLY) {
      setServerMsg({ type: 'error', text: 'Demo Mode: Cannot add schools' });
      return;
    }

    setServerMsg(null);
    const formData = new FormData();

    Object.keys(data).forEach((k) => {
      if (k === 'image' && data.image && data.image[0]) {
        formData.append('image', data.image[0]); // must match backend "image"
      } else {
        formData.append(k, data[k]);
      }
    });

    try {
      const res = await fetch('/api/schools', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit');

      setServerMsg({ type: 'success', text: json.message });
      reset();
    } catch (e) {
      setServerMsg({ type: 'error', text: e.message });
    }
  };

  return (
    <main className="container">
      <div className="header">
        <h1>Add School</h1>
        <nav className="nav">
          <Link href="/">Home</Link>{' '}
          <Link href="/showSchools">Show Schools</Link>
        </nav>
      </div>

      <div className="formCard">
        {READ_ONLY && (
          <p className="error" style={{ marginBottom: 16 }}>
            Demo Mode: Upload disabled on Vercel
          </p>
        )}
        <form
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
        >
          <div className="row row-2">
            <div>
              <label className="label">School Name</label>
              <input
                className="input"
                placeholder="e.g. St. Xavier's High School"
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'At least 2 characters' },
                })}
                disabled={READ_ONLY}
              />
              {errors.name && <p className="error">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                placeholder="school@example.com"
                type="email"
                {...register('email_id', {
                  required: 'Email is required',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                })}
                disabled={READ_ONLY}
              />
              {errors.email_id && <p className="error">{errors.email_id.message}</p>}
            </div>
          </div>

          <div className="row">
            <div>
              <label className="label">Address</label>
              <input
                className="input"
                placeholder="123 MG Road"
                {...register('address', { required: 'Address is required' })}
                disabled={READ_ONLY}
              />
              {errors.address && <p className="error">{errors.address.message}</p>}
            </div>
          </div>

          <div className="row row-2">
            <div>
              <label className="label">City</label>
              <input
                className="input"
                placeholder="Bengaluru"
                {...register('city', { required: 'City is required' })}
                disabled={READ_ONLY}
              />
              {errors.city && <p className="error">{errors.city.message}</p>}
            </div>
            <div>
              <label className="label">State</label>
              <input
                className="input"
                placeholder="Karnataka"
                {...register('state', { required: 'State is required' })}
                disabled={READ_ONLY}
              />
              {errors.state && <p className="error">{errors.state.message}</p>}
            </div>
          </div>

          <div className="row row-2">
            <div>
              <label className="label">Contact Number</label>
              <input
                className="input"
                placeholder="10-15 digits"
                type="tel"
                {...register('contact', {
                  required: 'Contact is required',
                  pattern: { value: /^\d{7,15}$/, message: 'Use 7–15 digits' },
                })}
                disabled={READ_ONLY}
              />
              {errors.contact && <p className="error">{errors.contact.message}</p>}
            </div>
            <div>
              <label className="label">School Image</label>
              <input
                className="input"
                type="file"
                accept="image/*"
                {...register('image', { required: 'Image is required' })}
                disabled={READ_ONLY}
              />
              {errors.image && <p className="error">{errors.image.message}</p>}
              <span className="badge">Saved to /public/schoolImages</span>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <button
              className="button"
              disabled={isSubmitting || READ_ONLY}
              type="submit"
            >
              {READ_ONLY ? 'Demo Mode' : isSubmitting ? 'Saving...' : 'Save School'}
            </button>
            {serverMsg && (
              <p
                style={{ marginTop: 12 }}
                className={serverMsg.type === 'success' ? 'success' : 'error'}
              >
                {serverMsg.text}
              </p>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
