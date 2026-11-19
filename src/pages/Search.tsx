import { useSearchParams } from 'react-router-dom'
import { getCategories, getLocations, searchListings } from '../lib/yclas'
import { useAsync } from '../lib/useAsync'
import ListingCard from '../components/ListingCard'
import { Empty, ErrorBox, Loading } from '../components/States'

const PER_PAGE = 24

export default function Search() {
  const [params, setParams] = useSearchParams()
  const get = (k: string) => params.get(k) || ''
  const page = Math.max(1, Number(get('page')) || 1)

  const cats = useAsync(getCategories, [])
  const locs = useAsync(getLocations, [])
  const results = useAsync(
    () => searchListings({
      q: get('q'), id_category: get('id_category'), id_location: get('id_location'),
      min_price: get('min_price'), max_price: get('max_price'), sort: get('sort') || '-published',
      page, items_per_page: PER_PAGE,
    }),
    [params.toString()],
  )

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v); else next.delete(k)
    if (k !== 'page') next.delete('page')
    setParams(next)
  }
  const pages = results.data ? Math.ceil(results.data.total / PER_PAGE) : 0

  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <aside className="space-y-4">
        <div>
          <label className="label">Search</label>
          <input className="input" defaultValue={get('q')} onKeyDown={(e) => e.key === 'Enter' && set('q', (e.target as HTMLInputElement).value)} placeholder="Keywords" />
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input" value={get('id_category')} onChange={(e) => set('id_category', e.target.value)}>
            <option value="">All categories</option>
            {(cats.data || []).filter((c) => String(c.id_category_parent) !== '0').map((c) => (
              <option key={c.id_category} value={c.id_category}>{Number(c.parent_deep) > 0 ? '— ' : ''}{c.translate_name || c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Location</label>
          <select className="input" value={get('id_location')} onChange={(e) => set('id_location', e.target.value)}>
            <option value="">Everywhere</option>
            {(locs.data || []).filter((l) => String(l.id_location_parent) !== '0').map((l) => (
              <option key={l.id_location} value={l.id_location}>{l.translate_name || l.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label">Min price</label>
            <input className="input" type="number" min="0" defaultValue={get('min_price')} onBlur={(e) => set('min_price', e.target.value)} />
          </div>
          <div>
            <label className="label">Max price</label>
            <input className="input" type="number" min="0" defaultValue={get('max_price')} onBlur={(e) => set('max_price', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Sort</label>
          <select className="input" value={get('sort') || '-published'} onChange={(e) => set('sort', e.target.value)}>
            <option value="-published">Newest</option>
            <option value="price">Price: low to high</option>
            <option value="-price">Price: high to low</option>
          </select>
        </div>
      </aside>

      <section>
        {results.loading ? <Loading /> : results.error ? <ErrorBox message={results.error} /> : results.data!.listings.length === 0 ? (
          <Empty>No listings match. Try fewer filters.</Empty>
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-500">{results.data!.total} listings</p>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {results.data!.listings.map((l) => <ListingCard key={l.id_ad} listing={l} />)}
            </div>
            {pages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3 text-sm">
                <button className="btn-ghost" disabled={page <= 1} onClick={() => set('page', String(page - 1))}>Previous</button>
                <span>Page {page} of {pages}</span>
                <button className="btn-ghost" disabled={page >= pages} onClick={() => set('page', String(page + 1))}>Next</button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
