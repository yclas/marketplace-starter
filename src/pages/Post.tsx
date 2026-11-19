import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { getCategories, getCategoryFields, getLocations, postListing, uploadPhoto, type NewListing } from '../lib/yclas'
import { useAsync } from '../lib/useAsync'
import { useAuth } from '../lib/auth'
import { ErrorBox } from '../components/States'

export default function Post() {
  const { token } = useAuth()
  const cats = useAsync(getCategories, [])
  const locs = useAsync(getLocations, [])
  const [form, setForm] = useState<Record<string, string>>({})
  const [photos, setPhotos] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<{ message: string; checkout_url?: string | null; id?: string | number } | null>(null)
  const [busy, setBusy] = useState(false)
  const fields = useAsync(() => (form.id_category ? getCategoryFields(form.id_category) : Promise.resolve([])), [form.id_category])

  if (!token) return <Navigate to="/login?next=/post" replace />
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const r = await postListing(token, form as unknown as NewListing)
      const id = r.ad?.id_ad
      if (id) for (const p of photos) await uploadPhoto(token, id, p)
      setDone({ message: r.message, checkout_url: r.checkout_url, id })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (done)
    return (
      <div className="card mx-auto max-w-lg p-6 text-center">
        <h1 className="text-xl font-bold">Thanks!</h1>
        <p className="mt-2 text-slate-600">{done.message}</p>
        {done.checkout_url ? (
          <a href={done.checkout_url} className="btn-primary mt-4">Pay to publish</a>
        ) : (
          <Link to="/my-listings" className="btn-primary mt-4">See my listings</Link>
        )}
      </div>
    )

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Post a listing</h1>
      <form onSubmit={submit} className="card space-y-4 p-6">
        {error && <ErrorBox message={error} />}
        <div>
          <label className="label">Category</label>
          <select className="input" required value={form.id_category || ''} onChange={(e) => set('id_category', e.target.value)}>
            <option value="">Choose…</option>
            {(cats.data || []).filter((c) => String(c.id_category_parent) !== '0').map((c) => (
              <option key={c.id_category} value={c.id_category}>{Number(c.parent_deep) > 0 ? '— ' : ''}{c.translate_name || c.name}</option>
            ))}
          </select>
        </div>
        <div><label className="label">Title</label><input className="input" required minLength={2} maxLength={145} value={form.title || ''} onChange={(e) => set('title', e.target.value)} /></div>
        <div><label className="label">Description</label><textarea className="input" required minLength={5} rows={6} value={form.description || ''} onChange={(e) => set('description', e.target.value)} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Price</label><input className="input" type="number" min="0" step="any" value={form.price || ''} onChange={(e) => set('price', e.target.value)} /></div>
          <div>
            <label className="label">Location</label>
            <select className="input" value={form.id_location || ''} onChange={(e) => set('id_location', e.target.value)}>
              <option value="">Choose…</option>
              {(locs.data || []).filter((l) => String(l.id_location_parent) !== '0').map((l) => (
                <option key={l.id_location} value={l.id_location}>{l.translate_name || l.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* the category's own fields (custom fields), sent as cf_<name> */}
        {(fields.data || []).map((f) => {
          const key = f.name.startsWith('cf_') ? f.name : 'cf_' + f.name
          const label = f.translated_label || f.label
          const values = f.translated_values || f.values
          if (f.type === 'select' || f.type === 'radio')
            return (
              <div key={key}><label className="label">{label}</label>
                <select className="input" required={!!f.required} value={form[key] || ''} onChange={(e) => set(key, e.target.value)}>
                  <option value="">Choose…</option>
                  {(f.values || []).map((v, i) => <option key={v} value={v}>{values?.[i] || v}</option>)}
                </select>
              </div>
            )
          if (f.type === 'checkbox')
            return (
              <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form[key] === '1'} onChange={(e) => set(key, e.target.checked ? '1' : '0')} /> {label}</label>
            )
          if (['string', 'textarea', 'integer', 'decimal', 'money', 'date', 'email', 'url'].includes(f.type))
            return (
              <div key={key}><label className="label">{label}</label>
                <input className="input" required={!!f.required}
                  type={f.type === 'integer' || f.type === 'decimal' || f.type === 'money' ? 'number' : f.type === 'date' ? 'date' : f.type === 'email' ? 'email' : 'text'}
                  value={form[key] || ''} onChange={(e) => set(key, e.target.value)} />
              </div>
            )
          return null // other field types: add them here, or edit on the Yclas site
        })}

        <div>
          <label className="label">Photos</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setPhotos(Array.from(e.target.files || []))} />
          <p className="mt-1 text-xs text-slate-500">JPG or PNG, up to 5 MB each.</p>
        </div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Posting…' : 'Post listing'}</button>
      </form>
    </div>
  )
}
