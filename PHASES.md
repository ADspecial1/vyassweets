# Phase Prompts for Claude Code

Paste **one phase at a time** into a Claude Code session. Each phase is self-contained and references `CLAUDE.md` + `SPEC.md` already in the repo, so don't paste those again.

Every phase ends with explicit acceptance criteria. Do not let Claude Code skip them.

---

## Phase 1 — Backend skeleton + auth

```
Read CLAUDE.md and SPEC.md sections 1, 2 (Auth + User), 5, 6.

Build the server skeleton:

1. Init `server/` with TypeScript, ESM, npm. Deps: express, mongoose, zod, bcrypt, jsonwebtoken, cookie-parser, cors, helmet, express-rate-limit, express-mongo-sanitize, slugify, dotenv, pino, pino-pretty. Dev: typescript, tsx, @types/*, eslint, prettier.
2. `src/config/env.ts` — Zod-validated env loader. Crash on missing vars.
3. `src/server.ts` — express app: helmet, cors (CLIENT_ORIGIN whitelist, credentials), cookieParser, json, mongoSanitize, routes, error middleware, pino HTTP logger. Connect Mongo on boot.
4. `src/lib/asyncHandler.ts`, `src/lib/AppError.ts`, `src/middleware/error.ts`.
5. `src/middleware/validate.ts` — `validate(schema)` validates body/query/params via Zod.
6. `src/middleware/auth.ts` — read JWT from `token` cookie, attach `req.user`. `requireAuth` and `requireAdmin` variants.
7. `src/lib/jwt.ts` — sign/verify helpers. `src/lib/cookies.ts` — set/clear `token` cookie (httpOnly, secure in prod, sameSite=lax, 7d).
8. `src/models/User.ts` — per SPEC. `passwordHash` selected only on demand.
9. `src/routes/auth.ts` — register, login, logout, me. Rate-limit register+login at 5/min by IP.
10. Health route `GET /api/health` → `{ok:true}`.

Add `npm scripts`: dev (tsx watch), build (tsc), start, lint, typecheck.

Acceptance:
- `npm run typecheck` clean
- `curl POST /api/auth/register` then `/api/auth/login` then `/api/auth/me` works with cookie
- Bad password → 401, missing field → 400 with Zod details
- Document curl commands in `docs/phase1.md`
```

---

## Phase 2 — Catalog models + admin CRUD + S3 upload

```
Read SPEC sections 1 (Category, Product, Banner), 2 (Admin endpoints), 5 (AWS env).

1. Models: Category, Product, Banner per SPEC. Slug auto-generation pre-save hook. Indexes per SPEC §6.
2. `src/services/s3.ts` — AWS SDK v3 (@aws-sdk/client-s3, @aws-sdk/s3-request-presigner). Function `getPresignedUploadUrl({contentType, ext})` returns `{uploadUrl, fileUrl}`. Key format: `uploads/${year}/${month}/${uuid}.${ext}`. ContentType allowlist: image/jpeg, image/png, image/webp. URL expires in 60s.
3. Routes `src/routes/admin/categories.ts`, `admin/products.ts`, `admin/banners.ts`. Full CRUD. All behind `requireAdmin`.
4. Route `POST /api/admin/upload-url` returns presigned URL.
5. Zod schemas per resource. Strict — reject unknown fields.
6. Seed script `src/scripts/seedAdmin.ts` — creates one admin user from env `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

Acceptance:
- Admin can: create category, get presigned URL, PUT image to S3, create product referencing the URL and category, list/edit/delete all three resources
- Non-admin user gets 403 on admin routes
- Slug auto-generated and unique
- Document curl in `docs/phase2.md`
```

---

## Phase 3 — Public catalog API

```
Read SPEC §2 "Public catalog".

1. `src/routes/catalog.ts`: GET /categories, /categories/:slug, /products, /products/:slug, /banners.
2. `/products` query: category (slug), search (text index), sort (price-asc, price-desc, newest), page, limit (max 50). Return `{items, total, page, pages}`.
3. Only `active: true` items returned to public.
4. Add Mongo text index on Product `{name: 'text', tags: 'text'}` — already in SPEC §6, ensure created.
5. ETag/Cache-Control: 5 min on GETs.

Acceptance:
- `GET /api/products?category=mithai&sort=price-asc&page=1&limit=12` returns paginated
- Search by partial name works
- Inactive products hidden from public, visible to admin endpoints
```

---

## Phase 4 — React shell + auth UI

```
Read CLAUDE.md stack table. Read SPEC §3 "Customer pages" (only login, register, profile for now).

1. Init `client/` with Vite React-TS. Add tailwind, react-router-dom, zustand, axios, react-hook-form, zod, @hookform/resolvers, clsx, lucide-react.
2. Tailwind config with brand color tokens (placeholders): primary `#C0392B` (warm red), accent `#F39C12` (saffron), neutral grays. Document in `client/src/lib/theme.ts`.
3. `src/api/client.ts` — axios instance baseURL from VITE_API_BASE, withCredentials true, response interceptor: on 401 redirect to /login.
4. `src/api/endpoints/` — typed fns per resource (auth, catalog, cart, orders, admin). Use Zod or interface types matching SPEC.
5. `src/store/auth.ts` — zustand: user, login, logout, hydrate via /auth/me on app mount.
6. Layout: `<RootLayout>` (header with logo, nav, cart icon, login/profile dropdown; footer). `<AdminLayout>` placeholder for Phase 6.
7. Pages: Home (skeleton w/ "Coming soon"), Login, Register, Profile, 404.
8. Route guards: `<RequireAuth>` redirect to /login. `<RequireAdmin>` 403 page.

Acceptance:
- Register → auto-logged-in → redirected to /
- Refresh keeps session via /auth/me
- Logout clears state and cookie
- Lighthouse mobile score ≥ 90 on Login page (sanity check)
```

---

## Phase 5 — Customer storefront

```
Read SPEC §3 customer pages (Home, Category, Product, Cart). §4 pricing math.

1. Home: fetch banners + categories + featured products. Hero banner carousel (swiper or hand-rolled with framer-motion-light or pure CSS). Category tiles. Featured row.
2. Category page `/category/:slug`: products grid responsive (2 col mobile, 4 col desktop). Sort dropdown, in-stock toggle, price-range slider. URL state synced via search params.
3. Product detail `/product/:slug`: image gallery (thumbnails + main), name, MRP strikethrough + price + discount badge, weight/unit, qty stepper, Add to Cart button, description, related products (same category).
4. Cart `/cart`: zustand `cartStore` with `items: [{productId, qty}]` persisted to localStorage. Render hydrated with product details fetched on mount. Qty edit, remove, coupon input (calls /coupons/validate, optimistic display), totals breakdown, "Proceed to Checkout" button → /checkout (requires auth).
5. Money formatter `formatINR(paise)` → `"₹1,234.50"`. Use everywhere.
6. Loading skeletons, empty states, error boundaries.

Acceptance:
- User flow: home → category → product → add to cart → cart → see correct totals
- Cart survives refresh
- Coupon validation shows discount preview
- Mobile-friendly (test 375px width)
```

---

## Phase 6 — Admin dashboard UI

```
Read SPEC §3 admin pages, §2 admin endpoints.

1. `<AdminLayout>` — sidebar nav (Dashboard, Categories, Products, Banners, Coupons, Orders, Users), top bar with admin name + logout. Route guard `<RequireAdmin>`.
2. Dashboard skeleton — KPI cards (placeholder data until Phase 9), recent orders table fetched from /admin/orders.
3. Categories page: table (name, image, order, active toggle, actions). Create/Edit modal with image upload using S3 presigned URL flow:
   - On file select: request /admin/upload-url, PUT file to returned uploadUrl with progress, save fileUrl to form.
   - Reusable `<ImageUpload>` component.
4. Products page: table with category filter + search. Create/Edit form: category dropdown, name, SKU, description, price (rupees input → convert to paise), MRP, weight, unit, stock, multi-image upload (up to 5), discount (type + value + active), tags chip input, featured toggle, active toggle.
5. Banners page: card grid. Create/Edit modal — image upload, title, subtitle, CTA, link, displayOrder, active.
6. Coupons page: table CRUD per SPEC.
7. Reusable: `<DataTable>`, `<Modal>`, `<FormField>`, `<ImageUpload>`, `<ConfirmDialog>`.

Acceptance:
- Admin can fully manage categories, products, banners, coupons end-to-end
- Image uploads land in S3 and product cards on customer site show them
- All forms validate client-side via Zod + react-hook-form
```

---

## Phase 7 — Orders + Razorpay checkout

```
Read SPEC §1 Order, §2 Checkout, §4 pricing, §7 order number. CLAUDE.md Security Rules — strict.

1. `src/services/pricing.ts` (server) — pure fn `calculateOrder({items, coupon, address})` does the math per SPEC §4 reading product prices from DB. Returns full breakdown.
2. `src/services/razorpay.ts` — wraps razorpay SDK. `createOrder(amountPaise, receipt)`, `verifyPaymentSignature({orderId, paymentId, signature})`, `verifyWebhookSignature(body, signature)`.
3. `src/services/orderNumber.ts` — atomic counter per SPEC §7.
4. `POST /api/orders/create`:
   - Auth required
   - Body: `{items:[{productId,qty}], couponCode?, addressId}`
   - Validate stock for each item
   - Run pricing service
   - Create Order doc status=pending, payment.status=created
   - Call Razorpay createOrder with order.total
   - Save razorpayOrderId on doc
   - Return `{order, razorpayOrderId, key: RAZORPAY_KEY_ID, amount: total}`
5. `POST /api/orders/verify`:
   - Body: `{orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature}`
   - Verify signature via service. Reject with 400 if invalid.
   - Match orderId belongs to req.user
   - On success: set order.status='paid', payment.status='paid', payment.paidAt, decrement product stock, increment coupon.usedCount.
   - Return updated order.
6. `POST /api/webhooks/razorpay`:
   - Use raw body parser for this route only.
   - Verify x-razorpay-signature with RAZORPAY_WEBHOOK_SECRET.
   - Handle `payment.captured` and `payment.failed` — idempotent (use razorpayPaymentId as dedupe key, no-op if already processed).
7. Customer routes: `GET /api/orders` (own), `GET /api/orders/:id` (own only).
8. Frontend `/checkout` page:
   - Address selector (from profile)
   - Order summary (calls /orders/create on "Pay Now", NOT on page load — order created at intent)
   - Open Razorpay Checkout SDK with returned key + razorpayOrderId + amount
   - On success handler: POST /orders/verify, then navigate to /checkout/success/:orderId
   - On failure: show error, keep cart
9. `/checkout/success/:orderId` and `/orders/:id` pages with status timeline.

Acceptance:
- Test mode Razorpay end-to-end works (use 4111 1111 1111 1111 test card)
- Tampered signature → 400, order stays pending
- Backend recomputes total — manually changing client cart prices via devtools does NOT change charged amount
- Webhook hit twice for same payment → second is no-op
- Stock decrements on payment, not on order creation
- Document test cards + webhook test (razorpay CLI or ngrok) in docs/phase7.md
```

---

## Phase 8 — Coupons + discount integration

```
Read SPEC §1 Coupon, §4 pricing.

1. `POST /api/coupons/validate` (public, optionally auth): `{code, subtotal}` → check active, validity dates, minOrderAmount, usageLimit. Return `{valid, discount (paise), message}`.
2. Pricing service uses same validation when applying at order create.
3. Frontend: cart page coupon input wires to validate endpoint, shows discount line, persists code in cartStore.
4. Admin coupons page already built in Phase 6 — verify usedCount displays.

Acceptance:
- Expired coupon rejected
- Coupon under minOrderAmount rejected with clear message
- Coupon over usageLimit rejected
- usedCount increments only on successful payment, not on validate calls
```

---

## Phase 9 — Admin orders + analytics

```
Read SPEC §2 admin orders + dashboard.

1. `GET /api/admin/orders` — pagination, filter by status + date range + search (orderNumber, user email).
2. `PATCH /api/admin/orders/:id/status` — allowed transitions:
   - paid → packed → shipped → delivered
   - paid → cancelled (with refund flag, no actual refund call yet, log only)
3. `GET /api/admin/dashboard`:
   - Today/week/month: orders count, revenue (paid only)
   - Top 5 products by quantity sold (last 30d) — Mongo aggregate
   - Low-stock products (stock < 10)
   - Sales chart data: daily revenue last 30d
4. Admin orders page UI: table with filters, row click opens drawer with full order + items + payment details + status update controls.
5. Dashboard page UI: KPI cards, simple line chart (recharts), top products list, low stock table.
6. Admin users page: list, search, view detail (no edit beyond toggling active).

Acceptance:
- Admin can move orders through statuses
- Dashboard numbers match raw DB queries (sanity check)
- Aggregate queries indexed and < 200ms on dev data
```

---

## Phase 10 — Production deploy

```
Read CLAUDE.md "Stack" — host section.

1. Production env file template `server/.env.production.example`.
2. `client/` build outputs to `dist/`. Set VITE_API_BASE to `/api` (same origin).
3. `ecosystem.config.cjs` for PM2 — 1 instance API, env vars from /etc/sweets-app/.env.
4. Nginx config `deploy/nginx.conf`:
   - server_name + SSL via certbot
   - `/` → serve client/dist with try_files fallback to index.html
   - `/api` → proxy_pass http://127.0.0.1:5000, X-Forwarded-* headers, proxy_pass for streaming OK
   - Webhook path: keep raw body — already handled in Express, just proxy
   - gzip on, cache static assets 30d, cache index.html 0
5. `deploy/deploy.sh` — pulls main, runs `npm ci` and `npm run build` in both, `pm2 reload api`, no downtime.
6. `.github/workflows/deploy.yml`:
   - On push to main
   - SSH via appleboy/ssh-action
   - Run deploy.sh
   - Secrets: SSH_HOST, SSH_USER, SSH_KEY
7. README.md root — quick start (dev) + deploy steps.
8. MongoDB Atlas: ensure prod cluster, IP whitelist (EC2 elastic IP), separate DB user, strong password.
9. S3 bucket: production bucket, CORS config for client origin, public-read on `uploads/*`, IAM user with PutObject + GetObject only.
10. Razorpay: switch to live keys in prod env. Configure webhook URL `https://yourdomain.com/api/webhooks/razorpay` with secret.

Acceptance:
- Push to main → deploy succeeds → site live on HTTPS
- Razorpay live test (₹1) end-to-end
- pm2 logs clean
- nginx access log shows requests routed correctly
- SSL grade A on ssllabs
```

---

## Bonus phases (not required)

- **Phase 11** — Order emails (SES or Resend), invoice PDF.
- **Phase 12** — SMS OTP login (MSG91 / Twilio).
- **Phase 13** — Shiprocket / Delhivery API for shipping label + tracking.
- **Phase 14** — Reviews + ratings.
- **Phase 15** — PWA install + push notifications.

---

## How to run a phase

1. Open new Claude Code session in repo root.
2. Verify CLAUDE.md auto-loaded (it should print as context).
3. Paste the phase block above.
4. Let it work. Review diffs.
5. Run acceptance checks yourself before merging.
6. Commit. Next session = next phase.

Don't run two phases in one session — context bloats and Claude Code starts forgetting earlier files.
