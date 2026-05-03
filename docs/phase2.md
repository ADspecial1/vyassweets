# Phase 2 — Smoke Test Commands

Requires admin cookie. Login first:
```bash
curl -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sweetsapp.com","password":"Admin@12345"}'
```

## Seed admin user (run once)
```bash
npm run seed:admin
```

## Categories

```bash
# Create
curl -b cookies.txt -X POST http://localhost:5000/api/admin/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Mithai","displayOrder":1}'

# List
curl -b cookies.txt http://localhost:5000/api/admin/categories

# Update
curl -b cookies.txt -X PATCH http://localhost:5000/api/admin/categories/<id> \
  -H "Content-Type: application/json" \
  -d '{"active":false}'

# Delete
curl -b cookies.txt -X DELETE http://localhost:5000/api/admin/categories/<id>
```

## Paste image URL (stub flow)
```bash
curl -b cookies.txt -X POST http://localhost:5000/api/admin/images/url-only \
  -H "Content-Type: application/json" \
  -d '{"url":"https://i.imgur.com/example.jpg"}'
# Returns: {"fileUrl":"https://i.imgur.com/example.jpg"}
```

## Products
```bash
# Create (use categoryId from above, fileUrl from url-only endpoint)
curl -b cookies.txt -X POST http://localhost:5000/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Kaju Barfi",
    "categoryId":"<category_id>",
    "description":"Premium cashew sweet",
    "images":["https://i.imgur.com/example.jpg"],
    "price":50000,
    "mrp":60000,
    "weight":500,
    "unit":"g",
    "sku":"KBF-500"
  }'

# List
curl -b cookies.txt http://localhost:5000/api/admin/products

# List with filter
curl -b cookies.txt "http://localhost:5000/api/admin/products?category=<categoryId>&page=1&limit=10"
```

## Banners
```bash
curl -b cookies.txt -X POST http://localhost:5000/api/admin/banners \
  -H "Content-Type: application/json" \
  -d '{"image":"https://i.imgur.com/banner.jpg","title":"Diwali Sale","displayOrder":1}'
```

## Error cases
```bash
# Non-admin gets 403
curl -b user_cookies.txt http://localhost:5000/api/admin/categories

# Duplicate category name → 409
# Missing required field → 400 with details
```
