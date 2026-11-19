import { Link, Navigate } from 'react-router-dom'
import { myListings } from '../lib/yclas'
import { useAsync } from '../lib/useAsync'
import { useAuth } from '../lib/auth'
import ListingCard from '../components/ListingCard'
import { Empty, ErrorBox, Loading } from '../components/States'

// Yclas listing statuses: 1 published, 0 waiting (moderation or payment), others unavailable
const statusLabel = (s?: number | string) => (String(s) === '1' ? 'Live' : String(s) === '0' ? 'Waiting for approval or payment' : 'Not live')

export default function MyListings() {
  const { token } = useAuth()
  const ads = useAsync(() => (token ? myListings(token) : Promise.resolve([])), [token])
  if (!token) return <Navigate to="/login?next=/my-listings" replace />

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My listings</h1>
        <Link to="/post" className="btn-primary">Post a listing</Link>
      </div>
      {ads.loading ? <Loading /> : ads.error ? <ErrorBox message={ads.error} /> : ads.data!.length === 0 ? <Empty>You haven't posted anything yet.</Empty> : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {ads.data!.map((l) => (
            <div key={l.id_ad}>
              <ListingCard listing={l} />
              <p className="mt-1 text-xs text-slate-500">{statusLabel(l.status)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
