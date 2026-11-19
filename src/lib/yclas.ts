// The Yclas REST API, typed. Every call to your Yclas site goes through here.
// Full reference: <your site>/api/openapi.json and <your site>/api/llms.txt
//
// Rules this file follows (keep them if you change it):
// - Public data (published listings, categories, locations, custom fields) needs no key.
// - Sign-up and login send the site key (public by design) in the `apikey` header.
// - Signed-in calls send the user's token in the `user-token` header.
// - A list answers 404 "No records found" when it's empty: that's an empty list, not an error.
// - Never put a key that starts with yck_ in this file or anywhere in browser code.

const SITE = (import.meta.env.VITE_YCLAS_URL || '').replace(/\/$/, '')
const SITE_KEY = import.meta.env.VITE_YCLAS_SITE_KEY || ''
// with the dev proxy on, call /api on this app's own address (vite.config.ts forwards it)
const BASE = import.meta.env.DEV && import.meta.env.VITE_YCLAS_PROXY === '1' ? '' : SITE

export const siteUrl = SITE

export type CustomField = {
  type: string
  label: string
  translated_label?: string
  values?: string[] | null
  translated_values?: string[] | null
  required?: boolean
  value?: string | number | null
}

export type Listing = {
  id_ad: number | string
  title: string
  seotitle: string
  description: string
  price: string // already formatted with the currency, e.g. "$1,200"
  id_category: number | string
  id_location: number | string
  id_user: number | string
  published: string
  address?: string | null
  phone?: string | null
  thumb?: string | null
  url: string // the listing on the Yclas site: buyers pay there
  customfields?: Record<string, CustomField>
  status?: number | string
}

export type ListingDetail = Listing & {
  images: { image: string; thumb: string }[]
  category: Category
  location: Location
  user: User
}

export type Category = {
  id_category: number | string
  name: string
  translate_name?: string
  seoname: string
  id_category_parent: number | string
  parent_deep?: number | string
  icon?: string | null
  price?: string
}

export type Location = {
  id_location: number | string
  name: string
  translate_name?: string
  seoname: string
  id_location_parent: number | string
}

export type User = {
  id_user: number | string
  name: string
  seoname?: string
  description?: string | null
  image?: string | null
  rate?: number | null
  created?: string
}

export type SignedInUser = User & { email: string; user_token: string }

export type Message = {
  id_message: number | string
  id_message_parent: number | string
  id_ad?: number | string | null
  message: string
  created: string
  status?: number | string
  user_from?: { name?: string; image?: string | null }
  user_to?: { name?: string; image?: string | null }
  ad?: { title?: string; price?: string; image?: string | null } | null
}

export class YclasError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type Options = {
  method?: string
  query?: Record<string, string | number | undefined | null>
  body?: unknown
  form?: FormData
  token?: string | null
  siteKey?: boolean
}

async function call<T>(path: string, opts: Options = {}): Promise<{ data: T; total: number | null; empty: boolean }> {
  const url = new URL(BASE + '/api/v1/' + path, window.location.origin)
  for (const [k, v] of Object.entries(opts.query || {}))
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (opts.token) headers['user-token'] = opts.token
  if (opts.siteKey && SITE_KEY) headers['apikey'] = SITE_KEY
  let body: BodyInit | undefined
  if (opts.form) body = opts.form
  else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(opts.body)
  }

  const res = await fetch(url.toString(), { method: opts.method || 'GET', headers, body })
  const total = res.headers.get('X-Total-Count')
  let json: any = null
  try {
    json = await res.json()
  } catch {
    /* not JSON */
  }

  // an empty list is a 404 with this exact message
  if (res.status === 404 && json?.error === 'No records found')
    return { data: {} as T, total: 0, empty: true }
  if (!res.ok) {
    const msg = json?.error || (res.status === 429 ? 'Too many requests, try again in a moment.' : `Request failed (${res.status})`)
    throw new YclasError(msg, res.status)
  }
  return { data: json as T, total: total === null ? null : Number(total), empty: false }
}

export type ListingQuery = {
  q?: string
  id_category?: string | number
  id_location?: string | number
  min_price?: string | number
  max_price?: string | number
  sort?: string // -published (newest), price, -price
  page?: number
  items_per_page?: number
}

export async function searchListings(q: ListingQuery = {}) {
  const { min_price, max_price, ...rest } = q
  // range filters are written as the field name with > or < (>= / <=)
  const query: Options['query'] = { sort: '-published', items_per_page: 24, ...rest }
  if (min_price) query['price>'] = min_price
  if (max_price) query['price<'] = max_price
  const r = await call<{ ads: Listing[] }>('listings', { query })
  return { listings: r.empty ? [] : r.data.ads, total: r.total ?? 0 }
}

export async function getListing(id: string | number) {
  const r = await call<{ ad: ListingDetail }>('listings/' + id)
  if (r.empty) throw new YclasError('Listing not found', 404)
  return r.data.ad
}

export async function getCategories() {
  const r = await call<{ categories: Category[] }>('categories')
  return r.empty ? [] : r.data.categories
}

export async function getLocations() {
  const r = await call<{ locations: Location[] }>('locations')
  return r.empty ? [] : r.data.locations
}

export async function getCategoryFields(id_category: string | number) {
  const r = await call<{ fields: (CustomField & { name: string })[] | Record<string, CustomField> }>('customfields/category/' + id_category)
  if (r.empty || !r.data.fields) return []
  const f = r.data.fields
  return Array.isArray(f) ? f : Object.entries(f).map(([name, v]) => ({ ...v, name }))
}

// top level = parent is the root (id 1); the root itself has parent 0
export const isTopLevel = (c: { id_category_parent?: number | string; id_location_parent?: number | string }) =>
  String(c.id_category_parent ?? c.id_location_parent) === '1'

// ---------- accounts ----------
export async function login(email: string, password: string, code?: string) {
  const r = await call<{ user: SignedInUser }>('auth/login', { method: 'POST', body: { email, password, code }, siteKey: true })
  return r.data.user
}

export async function signup(name: string, email: string, password: string) {
  const r = await call<{ user: SignedInUser }>('auth/create', { method: 'POST', body: { name, email, password }, siteKey: true })
  return r.data.user
}

// ---------- the signed-in user's listings ----------
export async function myListings(token: string) {
  const r = await call<{ ads: Listing[] }>('ads', { token, query: { sort: '-published', items_per_page: 50 } })
  return r.empty ? [] : r.data.ads
}

export type NewListing = {
  id_category: string | number
  id_location?: string | number
  title: string
  description: string
  price?: string | number
  [cf: `cf_${string}`]: string | number | undefined
}

export async function postListing(token: string, listing: NewListing) {
  const r = await call<{ message: string; checkout_url?: string | null; ad?: Listing }>('ads', { method: 'POST', token, body: listing })
  return r.data
}

export async function uploadPhoto(token: string, id_ad: string | number, file: File) {
  const form = new FormData()
  form.append('image', file)
  await call('ads/image/' + id_ad, { method: 'POST', token, form })
}

// ---------- messages ----------
export async function threads(token: string) {
  const r = await call<{ messages: Message[] }>('messages', { token, query: { items_per_page: 50 } })
  return r.empty ? [] : r.data.messages
}

export async function thread(token: string, id: string | number) {
  const r = await call<{ messages: Message[] }>('messages/' + id, { token })
  return r.empty ? [] : r.data.messages
}

export async function contactSeller(token: string, id_ad: string | number, message: string) {
  const r = await call<{ message: Message }>('messages', { method: 'POST', token, body: { id_ad, message } })
  return r.data.message
}

export async function reply(token: string, id_message_parent: string | number, message: string) {
  const r = await call<{ message: Message }>('messages', { method: 'POST', token, body: { id_message_parent, message } })
  return r.data.message
}

// ---------- buying ----------
// Payments, seller payouts and commission stay on the Yclas site: send the buyer to the listing there.
// return_to brings them back here afterwards (it must be one of the addresses the owner listed).
export function buyUrl(listing: Pick<Listing, 'url'>, returnTo = window.location.href) {
  const u = new URL(listing.url)
  u.searchParams.set('return_to', returnTo)
  return u.toString()
}
