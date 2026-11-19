# Instructions for AI coding tools

This app is the front end of a marketplace whose back end is a **Yclas** site (`VITE_YCLAS_URL`). Read this before
changing anything.

## Never

- Don't create a database, back end, Supabase project or server functions for listings, users, messages, orders or
  payments. They all live on the Yclas site, so read and write them through its REST API.
- Don't take card details or build a checkout. Send buyers to the listing's `url` on the Yclas site with
  `?return_to=<this app's page>` (`buyUrl()` in `src/lib/yclas.ts`).
- Don't put any key that starts with `yck_` in browser code.
- Don't render listing descriptions or any other user-written text as HTML.

## The API

- All calls go through `src/lib/yclas.ts`. Add new ones there.
- Base URL: `${VITE_YCLAS_URL}/api/v1/`.
- Reference: `${VITE_YCLAS_URL}/api/openapi.json` and `${VITE_YCLAS_URL}/api/llms.txt`.
- A list is wrapped under a key, e.g. `{"ads":[...]}`, with the total in the `X-Total-Count` header.
- An empty list answers HTTP 404 `{"code":404,"error":"No records found"}`. Treat it as "no results"; `call()`
  already does.
- Errors are `{"code": <int>, "error": "<message>"}`. Show the message.

### Who may call what

| Call | Auth |
|---|---|
| `GET listings`, `listings/<id>`, `categories`, `locations`, `customfields/...` | None (public) |
| `POST auth/login`, `auth/create` | Header `apikey: VITE_YCLAS_SITE_KEY` (public by design) |
| `ads`, `favorites`, `messages`, `profile` | Header `user-token: <user.user_token from login>` |

### Common calls

- **Search:** `GET listings?q=&id_category=&id_location=&sort=-published&page=1&items_per_page=24`. Price range:
  `price>`/`price<` as parameter names, which mean ≥ / ≤. At most 100 per page without a key.
- **Listing:** `GET listings/<id>` returns `{ad:{..., images:[{image,thumb}], category, location, user, customfields, url}}`.
  `price` is already formatted with the currency.
- **Categories:** `GET categories`. The top level is `id_category_parent == 1`; the root (parent 0) is not a real
  category.
- **Post:** `POST ads {id_category,title,description,price,id_location,cf_*}`, then `POST ads/image/<id>`
  (multipart, field `image`) for each photo. If the answer has `checkout_url`, send the user there.
- **Message a seller:** `POST messages {id_ad, message}`. Reply with `POST messages {id_message_parent, message}`.
  Inbox: `GET messages`.
- **Rate limits:** watch `X-RateLimit-Remaining`; on HTTP 429, wait for `Retry-After`.

## Browser access

The browser can call the Yclas site only from addresses its owner listed under **Integrations > Your own front
end**. If every call fails with a CORS error, that list is missing this app's address. While developing, set
`VITE_YCLAS_PROXY=1` to use the dev server's proxy instead.
