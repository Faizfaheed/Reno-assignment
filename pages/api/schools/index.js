import { useForm } from 'react-hook-form';
import { useState } from 'react';
import Link from 'next/link';

const READ_ONLY = process.env.NEXT_PUBLIC_DB_READ_ONLY === 'true';

export default function AddSchool() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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
