import { createContext, useContext, useState, type ReactNode } from 'react'
import type { SignedInUser } from './yclas'

// The signed-in user, kept in the browser. The token goes in the `user-token` header (see yclas.ts).
type Auth = {
  user: SignedInUser | null
  token: string | null
  signIn: (user: SignedInUser) => void
  signOut: () => void
}

const KEY = 'yclas_user'
const AuthContext = createContext<Auth | null>(null)

function load(): SignedInUser | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SignedInUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SignedInUser | null>(load)

  const signIn = (u: SignedInUser) => {
    setUser(u)
    try {
      localStorage.setItem(KEY, JSON.stringify(u))
    } catch {
      /* private mode: signed in for this tab only */
    }
  }
  const signOut = () => {
    setUser(null)
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }

  return <AuthContext.Provider value={{ user, token: user?.user_token ?? null, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const a = useContext(AuthContext)
  if (!a) throw new Error('useAuth outside AuthProvider')
  return a
}
