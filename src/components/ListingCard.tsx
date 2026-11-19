import { Link } from 'react-router-dom'
import type { Listing } from '../lib/yclas'

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link to={`/listing/${listing.id_ad}`} className="card group overflow-hidden transition hover:shadow-md">
      <div className="aspect-[4/3] bg-slate-100">
        {listing.thumb ? (
          <img src={listing.thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">No photo</div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-slate-900 group-hover:text-brand">{listing.title}</h3>
        {listing.price && <p className="mt-1 text-base font-bold">{listing.price}</p>}
      </div>
    </Link>
  )
}
