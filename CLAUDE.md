# Project Context for Claude Code

> Claude Code auto-loads this file. **Do not duplicate this content in prompts.**
> Phase prompts in `PHASES.md` reference this. Detailed spec in `SPEC.md`.

## Project

E-commerce webapp for sweets, namkeen, and packaged food. Customer storefront + admin dashboard. India-based, INR, Razorpay payments. Hosted on AWS EC2.

## Stack — fixed, do not substitute

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite + TypeScript + TailwindCSS |
| Routing | React Router v6 |
| State | Zustand (auth, cart) |
| HTTP | Axios with interceptor for JWT + 401 handling |
| Backend | Node 20 + Express 4 + TypeScript |
| DB | MongoDB + Mongoose |
| Validation | Zod (shared types between client/server via `/shared` if simple) |
| Auth | JWT in httpOnly cookie. bcrypt rounds=12 |
| Files | Multer memory → AWS S3 (presigned PUT URL pattern) |
| Payment | Razorpay Orders API + signature verify + webhook |
| Process | PM2 |
| Web server | Nginx reverse proxy + Let's Encrypt |
| CI | GitHub Actions → SSH deploy |

**Do not use:** Firebase, Stripe, Next.js, Redux, MUI, styled-components, MongoDB Realm, Yarn (use npm), CRA.

## Repo layout

```
sweets-app/
├── client/           # Vite React TS
│   └── src/
│       ├── pages/        # customer pages
│       ├── admin/        # admin pages (route-gated)
│       ├── components/
│       ├── store/        # zustand
│       ├── api/          # axios + endpoint fns
│       ├── lib/          # utils, formatters
│       └── types/
├── server/
│   └── src/
│       ├── models/       # mongoose schemas
│       ├── routes/       # express routers, one file per resource
│       ├── controllers/
│       ├── middleware/   # auth.ts, admin.ts, validate.ts, error.ts
│       ├── services/     # razorpay.ts, s3.ts
│       ├── lib/          # jwt, hash, logger
│       ├── config/       # env loader (zod-validated)
│       └── server.ts
├── .github/workflows/
└── docs/
```

## Code conventions

- TypeScript strict mode on. No `any` unless commented why.
- ESM modules everywhere (`"type": "module"`).
- Mongoose: schemas in `models/`, named export `default`. Always `timestamps: true`.
- Express: one router per resource. Controller fns separate from route registration. All async wrapped in `asyncHandler` util — no try/catch noise.
- Errors: throw `AppError(status, message)`. Central error middleware formats response `{ error: { message, code } }`.
- Validation: Zod schema per route. `validate(schema)` middleware. Reject early.
- All money in **paise** (integer) inside DB and Razorpay calls. Convert to rupees only at display.
- Slugs auto-generated from name with `slugify`. Unique index on slug.
- Never store plaintext passwords, payment signatures, or full card data.

## Security rules — non-negotiable

1. **Server recomputes order total from DB.** Frontend cart prices are display-only. `/api/orders/create` accepts only `[{productId, qty}]` + couponCode + addressId.
2. Razorpay signature verified on `/api/orders/verify` AND on webhook. Both must pass before marking order paid.
3. Webhook secret separate from API key. Verify `x-razorpay-signature` header.
4. Admin routes behind `requireAdmin` middleware (checks `req.user.role === 'admin'`).
5. JWT in httpOnly + secure + sameSite=lax cookie. CSRF: rely on sameSite + Origin check on mutations.
6. Helmet, CORS whitelist, express-rate-limit on auth routes (5 req/min), Mongo sanitize.
7. S3 presigned URLs only issued to admin role, expire in 60s.
8. `.env` never committed. `.env.example` committed.

## Commands

```bash
# dev
npm run dev          # in client/ or server/
# build
npm run build
# lint/type
npm run lint && npm run typecheck
# test
npm run test
```

## Definition of done per phase

- All new code typechecks (`tsc --noEmit`).
- ESLint clean.
- Endpoints have Zod validation.
- README in phase folder updated if route added.
- No console.log in committed code (use logger).
- Manual smoke test passes (curl or Postman commands documented in PR description).

## Token-saving rules for Claude Code

- Don't restate this file in responses.
- Don't re-explore folder structure when starting a phase — it is above.
- Read `SPEC.md` only when implementing models, routes, or pages.
- One phase per session. Don't pre-build future phases.
- When a file already exists, edit don't recreate.
- Use `str_replace` for small edits not full rewrites.
- Don't ask permission for things in the stack table — they are fixed.
