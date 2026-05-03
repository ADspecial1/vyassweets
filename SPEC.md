# SPEC — Data Models, API, Pages

Reference doc. Read on demand, not every turn.

## 1. Mongoose Models

### Category
```ts
{
  name: string (req, unique),
  slug: string (req, unique, indexed),
  image: string (S3 URL),
  description?: string,
  displayOrder: number (default 0),
  active: boolean (default true),
  timestamps: true
}
```

### Product
```ts
{
  name: string (req),
  slug: string (req, unique, indexed),
  categoryId: ObjectId ref Category (req, indexed),
  description: string,
  shortDescription?: string,
  images: string[] (1..5 S3 URLs),
  price: number (paise, req),         // selling price
  mrp: number (paise, req),           // strikethrough price
  weight: number (req),               // numeric
  unit: 'g' | 'kg' | 'pcs' (req),
  stock: number (default 0),
  sku: string (req, unique),
  discount?: {
    type: 'flat' | 'percent',
    value: number,                    // paise if flat, % if percent
    active: boolean
  },
  tags: string[],
  featured: boolean (default false),
  active: boolean (default true),
  timestamps: true
}
```
Note: `price` is final price after product-level discount. Discount object kept for display ("X% off"). MRP for strikethrough. Coupon discount applied later at checkout, not here.

### Banner
```ts
{
  image: string (req, S3 URL),
  title?: string,
  subtitle?: string,
  ctaText?: string,
  ctaLink?: string,
  displayOrder: number,
  active: boolean,
  timestamps: true
}
```

### Coupon
```ts
{
  code: string (req, unique, uppercase, indexed),
  type: 'flat' | 'percent' (req),
  value: number (req),                // paise or %
  minOrderAmount: number (default 0), // paise
  maxDiscount?: number,               // paise, cap for percent type
  usageLimit?: number,
  usedCount: number (default 0),
  validFrom: Date,
  validTill: Date,
  active: boolean,
  timestamps: true
}
```

### User
```ts
{
  name: string (req),
  email: string (req, unique, lowercase),
  phone: string (req),                // 10 digit
  passwordHash: string (req, select: false),
  addresses: [{
    label: string,                    // "Home", "Office"
    line1: string, line2?: string,
    city: string, state: string,
    pincode: string,                  // 6 digit
    isDefault: boolean
  }],
  role: 'user' | 'admin' (default 'user'),
  timestamps: true
}
```

### Order
```ts
{
  userId: ObjectId ref User (req, indexed),
  orderNumber: string (req, unique),  // e.g. "ORD-20260425-0001"
  items: [{
    productId: ObjectId ref Product,
    name: string,                     // snapshot
    image: string,                    // snapshot
    qty: number,
    unitPrice: number,                // paise, snapshot
    lineTotal: number                 // paise
  }],
  subtotal: number,                   // paise
  couponCode?: string,
  couponDiscount: number (default 0),
  shippingFee: number (default 0),
  gst: number (default 0),
  total: number (req),                // paise, final amount charged
  address: { /* embedded copy of user address at order time */ },
  status: 'pending' | 'paid' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
  payment: {
    provider: 'razorpay',
    razorpayOrderId: string,
    razorpayPaymentId?: string,
    razorpaySignature?: string,
    status: 'created' | 'paid' | 'failed',
    paidAt?: Date
  },
  timestamps: true
}
```

## 2. API Contracts

Base path: `/api`. JSON in/out. Auth via httpOnly cookie `token`.

Error shape: `{ error: { message: string, code?: string, details?: any } }`.

### Auth
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | /auth/register | `{name,email,phone,password}` | `{user}` + sets cookie |
| POST | /auth/login | `{email,password}` | `{user}` + sets cookie |
| POST | /auth/logout | — | `{ok:true}` clears cookie |
| GET | /auth/me | — | `{user}` |

### Public catalog
| Method | Path | Query/Body | Returns |
|---|---|---|---|
| GET | /categories | — | `Category[]` (active only, sorted) |
| GET | /categories/:slug | — | `Category` |
| GET | /products | `?category=slug&search=&sort=&page=&limit=` | `{items: Product[], total, page}` |
| GET | /products/:slug | — | `Product` |
| GET | /banners | — | `Banner[]` (active, sorted) |
| POST | /coupons/validate | `{code, subtotal}` | `{valid, discount, message}` |

### User
| Method | Path | Body | Returns |
|---|---|---|---|
| GET | /user/me | — | `{user}` |
| PATCH | /user/me | `{name?,phone?}` | `{user}` |
| POST | /user/addresses | address obj | `{user}` |
| PATCH | /user/addresses/:id | partial | `{user}` |
| DELETE | /user/addresses/:id | — | `{user}` |
| GET | /orders | — | `Order[]` |
| GET | /orders/:id | — | `Order` |

### Checkout
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | /orders/create | `{items:[{productId,qty}], couponCode?, addressId}` | `{order, razorpayOrderId, key, amount}` |
| POST | /orders/verify | `{razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId}` | `{order}` |
| POST | /webhooks/razorpay | Razorpay event | `{ok}` |

### Admin (require role=admin)
| Method | Path | Notes |
|---|---|---|
| GET POST | /admin/categories[/:id] | CRUD |
| PATCH DELETE | /admin/categories/:id | |
| GET POST | /admin/products[/:id] | CRUD |
| PATCH DELETE | /admin/products/:id | |
| GET POST | /admin/banners[/:id] | CRUD |
| PATCH DELETE | /admin/banners/:id | |
| GET POST | /admin/coupons[/:id] | CRUD |
| PATCH DELETE | /admin/coupons/:id | |
| GET | /admin/orders | `?status=&from=&to=&page=` |
| PATCH | /admin/orders/:id/status | `{status}` |
| GET | /admin/users | list |
| GET | /admin/dashboard | sales stats, top products, low stock |
| POST | /admin/upload-url | `{contentType, ext}` → `{uploadUrl, fileUrl}` |

## 3. Frontend Pages

### Customer
| Route | Page |
|---|---|
| `/` | Home — banners carousel, categories grid, featured products row |
| `/category/:slug` | Category page — products grid, filters (price range, in-stock), sort |
| `/product/:slug` | Product detail — image gallery, qty selector, add-to-cart, related |
| `/cart` | Cart — line items editable, coupon input, totals, checkout button |
| `/checkout` | Checkout — pick address, order summary, Razorpay button |
| `/checkout/success/:orderId` | Success page after payment |
| `/orders` | Order history list |
| `/orders/:id` | Order detail + status timeline |
| `/profile` | Edit name/phone, addresses CRUD |
| `/login`, `/register` | Auth |
| `*` | 404 |

### Admin (`/admin/*`, route guarded)
| Route | Page |
|---|---|
| `/admin/login` | Admin login (same JWT, role-checked) |
| `/admin` | Dashboard — KPI cards, sales chart (last 30d), recent orders table, low-stock alerts |
| `/admin/categories` | Table + create/edit modal, drag-to-reorder, image upload |
| `/admin/products` | Table with category filter, create/edit form (multi-image upload, discount), bulk active toggle |
| `/admin/banners` | Card grid, create/edit modal, reorder, toggle active |
| `/admin/coupons` | Table CRUD, validity dates, usage stats |
| `/admin/orders` | Table, status filter, detail drawer, status update |
| `/admin/users` | Table, search by email/phone |

## 4. Pricing & discount math

```
For each item:
  productDiscount = product.discount.active
    ? (type==='flat' ? value : floor(price * value / 100))
    : 0
  unitPrice = price - productDiscount   // already baked into product.price in our model
  lineTotal = unitPrice * qty

subtotal = sum(lineTotal)

couponDiscount = if coupon valid:
  type==='flat' ? min(value, subtotal)
  : min(floor(subtotal * value / 100), maxDiscount ?? Infinity)

shippingFee = (subtotal >= FREE_SHIPPING_THRESHOLD) ? 0 : FLAT_SHIPPING
gst = floor((subtotal - couponDiscount) * GST_RATE / 100)   // if applicable
total = subtotal - couponDiscount + shippingFee + gst
```

Constants in `server/src/config/business.ts`:
```ts
export const FREE_SHIPPING_THRESHOLD = 50000  // ₹500 in paise
export const FLAT_SHIPPING = 5000             // ₹50
export const GST_RATE = 5                     // 5% on processed food, confirm with CA
```

All calc happens server-side in `services/pricing.ts`. Frontend calls a "preview" endpoint OR just does best-effort display and trusts server total at checkout.

## 5. Env vars

```
# server/.env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=<64 random hex>
JWT_EXPIRES_IN=7d
COOKIE_DOMAIN=localhost
CLIENT_ORIGIN=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=sweets-app-media

# client/.env
VITE_API_BASE=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_...   # public key only
```

Validate with Zod at boot. Crash if missing.

## 6. Index strategy

- `Product`: `{categoryId: 1, active: 1}`, `{slug: 1}` unique, text index on `name + tags` for search.
- `Category`: `{slug: 1}` unique, `{displayOrder: 1}`.
- `Order`: `{userId: 1, createdAt: -1}`, `{status: 1, createdAt: -1}`, `{orderNumber: 1}` unique.
- `Coupon`: `{code: 1}` unique.
- `User`: `{email: 1}` unique.

## 7. Order number generation

Format: `ORD-YYYYMMDD-NNNN` where NNNN is a daily counter. Use a `Counter` collection with atomic `findOneAndUpdate({ _id: dateKey }, { $inc: { seq: 1 } }, { upsert: true, new: true })`.
