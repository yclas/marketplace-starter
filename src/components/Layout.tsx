import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'

export const siteName = import.meta.env.VITE_SITE_NAME || 'Marketplace'

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const nav = ({ isActive }: { isActive: boolean }) => (isActive ? 'text-brand font-semibold' : 'text-slate-600 hover:text-slate-900')

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="text-lg font-bold text-slate-900">{siteName}</Link>
          <nav className="ml-auto flex items-center gap-4 text-sm">
            <NavLink to="/search" className={nav}>Browse</NavLink>
            {user ? (
              <>
                <NavLink to="/messages" className={nav}>Messages</NavLink>
                <NavLink to="/my-listings" className={nav}>My listings</NavLink>
                <button className="text-slate-600 hover:text-slate-900" onClick={() => { signOut(); navigate('/') }}>Sign out</button>
              </>
            ) : (
              <NavLink to="/login" className={nav}>Sign in</NavLink>
            )}
            <Link to="/post" className="btn-primary">Post a listing</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {siteName}
      </footer>
    </div>
  )
}
