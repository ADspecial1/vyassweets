# Phase 1 — Smoke Test Commands

Base URL: `http://localhost:5000`

## Health check
```bash
curl http://localhost:5000/api/health
# Expected: {"ok":true}
```

## Register
```bash
curl -c cookies.txt -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"9876543210","password":"password123"}'
# Expected 201: {"user":{"id":"...","name":"Test User","email":"test@example.com",...}}
```

## Login
```bash
curl -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
# Expected 200: {"user":{...}}
```

## Get current user (uses cookie)
```bash
curl -b cookies.txt http://localhost:5000/api/auth/me
# Expected 200: {"user":{...}}
```

## Logout
```bash
curl -b cookies.txt -c cookies.txt -X POST http://localhost:5000/api/auth/logout
# Expected: {"ok":true}
```

## Error cases
```bash
# Bad password → 401
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpassword"}'

# Missing field → 400
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"No Email","phone":"9876543210","password":"password123"}'

# No auth → 401
curl http://localhost:5000/api/auth/me
```
