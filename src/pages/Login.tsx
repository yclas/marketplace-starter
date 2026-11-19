import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { login, signup } from '../lib/yclas'
import { useAuth } from '../lib/auth'
import { ErrorBox } from '../components/States'

export default function Login({ mode = 'login' }: { mode?: 'login' | 'signup' }) {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [needsCode, setNeedsCode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const user = mode === 'signup' ? await signup(name, email, password) : await login(email, password, code || undefined)
      signIn(user)
      navigate(next.startsWith('/') ? next : '/')
    } catch (err) {
      const m = (err as Error).message
      // accounts with two-step sign-in are asked for their app's code
      if (/code/i.test(m) && mode === 'login') setNeedsCode(true)
      setError(m)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold">{mode === 'signup' ? 'Create your account' : 'Sign in'}</h1>
      <form onSubmit={submit} className="card space-y-4 p-6">
        {error && <ErrorBox message={error} />}
        {mode === 'signup' && (
          <div><label className="label">Name</label><input className="input" required value={name} onChange={(e) => setName(e.target.value)} /></div>
        )}
        <div><label className="label">Email</label><input className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label">Password</label><input className="input" type="password" required minLength={6} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {needsCode && (
          <div><label className="label">Code from your authenticator app</label><input className="input" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} /></div>
        )}
        <button className="btn-primary w-full" disabled={busy}>{mode === 'signup' ? 'Sign up' : 'Sign in'}</button>
        <p className="text-center text-sm text-slate-600">
          {mode === 'signup' ? <>Already have an account? <Link className="text-brand" to={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link></>
            : <>New here? <Link className="text-brand" to={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link></>}
        </p>
      </form>
    </div>
  )
}
