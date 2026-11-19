import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCategories, isTopLevel, searchListings } from '../lib/yclas'
import { useAsync } from '../lib/useAsync'
import ListingCard from '../components/ListingCard'
import { ErrorBox, Loading } from '../components/States'
import { siteName } from '../components/Layout'

export default function Home() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const cats = useAsync(getCategories, [])
  const latest = useAsync(() => searchListings({ items_per_page: 8 }), [])

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-brand px-6 py-12 text-center text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">Welcome to {siteName}</h1>
        <p className="mt-2 text-white/80">Find what you need, or sell what you don't.</p>
        <form className="mx-auto mt-6 flex max-w-xl gap-2" onSubmit={(e) => { e.preventDefault(); navigate('/search?q=' + encodeURIComponent(q)) }}>
          <input className="input flex-1 text-slate-900" placeholder="What are you looking for?" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn bg-white text-brand hover:bg-slate-100">Search</button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Categories</h2>
        {cats.loading ? <Loading /> : cats.error ? <ErrorBox message={cats.error} /> : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {(cats.data || []).filter(isTopLevel).map((c) => (
              <Link key={c.id_category} to={`/search?id_category=${c.id_category}`} className="card flex flex-col items-center gap-2 p-4 text-center text-sm hover:border-brand">
                {c.icon ? <img src={c.icon} alt="" className="h-10 w-10 object-contain" /> : <span className="h-10 w-10 rounded-full bg-brand-light" />}
                <span>{c.translate_name || c.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Latest listings</h2>
          <Link to="/search" className="text-sm text-brand">See all →</Link>
        </div>
        {latest.loading ? <Loading /> : latest.error ? <ErrorBox message={latest.error} /> : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {latest.data!.listings.map((l) => <ListingCard key={l.id_ad} listing={l} />)}
          </div>
        )}
      </section>
    </div>
  )
}
