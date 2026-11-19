import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { buyUrl, contactSeller, getListing, type CustomField } from '../lib/yclas'
import { useAsync } from '../lib/useAsync'
import { useAuth } from '../lib/auth'
import { ErrorBox, Loading } from '../components/States'

// the description can hold simple HTML from the Yclas editor: keep its line breaks, drop the tags
function plainText(html: string) {
  const withBreaks = (html || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
  const doc = new DOMParser().parseFromString(withBreaks, 'text/html')
  return (doc.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim()
}

function fieldValue(f: CustomField) {
  if (f.value === null || f.value === undefined || f.value === '') return null
  if (f.type === 'checkbox') return Number(f.value) ? 'Yes' : null
  return String(f.value)
}

export default function Listing() {
  const { id = '' } = useParams()
  const { token } = useAuth()
  const ad = useAsync(() => getListing(id), [id])
  const [photo, setPhoto] = useState(0)
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (ad.loading) return <Loading />
  if (ad.error || !ad.data) return <ErrorBox message={ad.error || 'Listing not found'} />
  const a = ad.data
  const fields = Object.entries(a.customfields || {}).map(([k, f]) => [k, f.translated_label || f.label, fieldValue(f)] as const).filter(([, , v]) => v)

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setBusy(true)
    try {
      await contactSeller(token, a.id_ad, msg)
      setSent('Message sent. The seller will reply in your Messages.')
      setMsg('')
    } catch (err) {
      setSent((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="card overflow-hidden">
          <div className="aspect-[4/3] bg-slate-100">
            {a.images?.length ? <img src={a.images[photo]?.image} alt={a.title} className="h-full w-full object-contain" /> : <div className="flex h-full items-center justify-center text-slate-400">No photos</div>}
          </div>
          {a.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-2">
              {a.images.map((im, i) => (
                <button key={i} onClick={() => setPhoto(i)} className={`h-16 w-20 shrink-0 overflow-hidden rounded border-2 ${i === photo ? 'border-brand' : 'border-transparent'}`}>
                  <img src={im.thumb} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <h1 className="mt-6 text-2xl font-bold">{a.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          <Link to={`/search?id_category=${a.id_category}`} className="hover:text-brand">{a.category?.translate_name || a.category?.name}</Link>
          {a.location?.name ? ` · ${a.location.name}` : ''}
        </p>
        {fields.length > 0 && (
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            {fields.map(([k, label, v]) => (
              <div key={k}><dt className="text-slate-500">{label}</dt><dd className="font-medium">{v}</dd></div>
            ))}
          </dl>
        )}
        {/* shown as text: sellers write the description, so never insert it as HTML */}
        <p className="mt-6 whitespace-pre-line text-slate-800">{plainText(a.description)}</p>
      </div>

      <aside className="space-y-4">
        <div className="card p-5">
          {a.price && <p className="text-3xl font-bold">{a.price}</p>}
          <a href={buyUrl(a)} className="btn-primary mt-4 w-full">Buy or book on the site</a>
          <p className="mt-2 text-xs text-slate-500">You pay securely on our marketplace and come straight back here.</p>
        </div>
        <div className="card p-5">
          <p className="font-semibold">{a.user?.name}</p>
          {a.user?.created && <p className="text-xs text-slate-500">Member since {a.user.created.slice(0, 4)}</p>}
          {token ? (
            <form onSubmit={send} className="mt-4 space-y-2">
              <textarea className="input" rows={4} required placeholder="Hi, is this still available?" value={msg} onChange={(e) => setMsg(e.target.value)} />
              <button className="btn-primary w-full" disabled={busy}>Contact the seller</button>
              {sent && <p className="text-sm text-slate-600">{sent}</p>}
            </form>
          ) : (
            <Link to={`/login?next=/listing/${a.id_ad}`} className="btn-ghost mt-4 w-full">Sign in to contact the seller</Link>
          )}
        </div>
      </aside>
    </div>
  )
}
