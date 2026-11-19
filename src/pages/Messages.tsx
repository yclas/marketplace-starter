import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { reply, thread, threads, type Message } from '../lib/yclas'
import { useAsync } from '../lib/useAsync'
import { useAuth } from '../lib/auth'
import { Empty, ErrorBox, Loading } from '../components/States'

// a conversation is identified by its first message: id_message_parent (or the message itself when it is the first)
const threadId = (m: Message) => (Number(m.id_message_parent) > 0 ? m.id_message_parent : m.id_message)

export function Inbox() {
  const { token, user } = useAuth()
  const list = useAsync(() => (token ? threads(token) : Promise.resolve([])), [token])
  if (!token) return <Navigate to="/login?next=/messages" replace />

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">Messages</h1>
      {list.loading ? <Loading /> : list.error ? <ErrorBox message={list.error} /> : list.data!.length === 0 ? <Empty>No conversations yet.</Empty> : (
        <ul className="card divide-y divide-slate-100">
          {list.data!.map((m) => {
            const other = m.user_from?.name === user?.name ? m.user_to : m.user_from
            return (
              <li key={m.id_message}>
                <Link to={`/messages/${threadId(m)}`} className="block px-4 py-3 hover:bg-slate-50">
                  <p className="text-sm font-semibold">{other?.name}{m.ad?.title ? ` · ${m.ad.title}` : ''}</p>
                  <p className="line-clamp-1 text-sm text-slate-600">{m.message}</p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export function Conversation() {
  const { id = '' } = useParams()
  const { token } = useAuth()
  const [n, setN] = useState(0)
  const msgs = useAsync(() => (token ? thread(token, id) : Promise.resolve([])), [token, id, n])
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  if (!token) return <Navigate to={`/login?next=/messages/${id}`} replace />

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await reply(token, id, text)
      setText('')
      setN((x) => x + 1)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/messages" className="text-sm text-brand">← Messages</Link>
      {msgs.loading ? <Loading /> : msgs.error ? <ErrorBox message={msgs.error} /> : (
        <div className="mt-4 space-y-3">
          {msgs.data!.map((m) => (
            <div key={m.id_message} className="card p-3">
              <p className="text-xs text-slate-500">{m.user_from?.name} · {m.created}</p>
              <p className="mt-1 whitespace-pre-line text-sm">{m.message}</p>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={send} className="mt-4 space-y-2">
        {error && <ErrorBox message={error} />}
        <textarea className="input" rows={3} required value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a reply" />
        <button className="btn-primary">Send</button>
      </form>
    </div>
  )
}
