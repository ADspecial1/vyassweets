
// serviceClient.ts — the only file the monolith needs to know about microservices.
// To point at Docker containers later: set SEARCH_SERVICE_URL and ORDER_SERVICE_URL in .env.
// Nothing else in the monolith changes.

const SEARCH_URL = process.env['SEARCH_SERVICE_URL'] ?? 'http://localhost:4001';
const ORDER_URL  = process.env['ORDER_SERVICE_URL']  ?? 'http://localhost:4002';

async function get<T>(url: string, headers?: Record<string, string>): Promise<T> {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`[serviceClient] GET ${url} → ${res.status}`);
  return res.json() as Promise<T>;
}

async function post<T>(url: string, body: unknown, headers?: Record<string, string>): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' })) as { message?: string };
    throw new Error(err.message ?? `[serviceClient] POST ${url} → ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function patch<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' })) as { message?: string };
    throw new Error(err.message ?? `[serviceClient] PATCH ${url} → ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// --- Search service ---
// Graceful degradation: if search-service is down, return empty results.
// Browsing (category/featured) is unaffected — it never calls these methods.

type SearchParams = { q: string; page?: number; limit?: number; category?: string };
type SearchResult = { items: unknown[]; total: number; page: number; pages: number; query: string };

const SEARCH_EMPTY: SearchResult = { items: [], total: 0, page: 1, pages: 0, query: '' };

export const searchService = {
  async search(params: SearchParams): Promise<SearchResult> {
    try {
      const qs = new URLSearchParams({ q: params.q });
      if (params.page)     qs.set('page',     String(params.page));
      if (params.limit)    qs.set('limit',    String(params.limit));
      if (params.category) qs.set('category', params.category);
      return await get<SearchResult>(`${SEARCH_URL}/search?${qs}`);
    } catch {
      console.error('[serviceClient] search-service unreachable — returning empty results');
      return { ...SEARCH_EMPTY, query: params.q };
    }
  },

  async suggestions(q: string): Promise<Array<{ name: string; slug: string }>> {
    try {
      return await get(`${SEARCH_URL}/suggestions?q=${encodeURIComponent(q)}`);
    } catch {
      console.error('[serviceClient] search-service unreachable — returning empty suggestions');
      return [];
    }
  },
};

// --- Order service ---
// Orders are NOT degraded gracefully — a failed order call should surface as an error.
// Pass userId from req.user.userId; order-service trusts it via x-user-id header.

export const orderService = {
  create(userId: string, body: unknown): Promise<unknown> {
    return post(`${ORDER_URL}/orders`, body, { 'x-user-id': userId });
  },

  getOrder(userId: string, orderId: string): Promise<unknown> {
    return get(`${ORDER_URL}/orders/${orderId}`, { 'x-user-id': userId });
  },

  updateStatus(orderId: string, status: string): Promise<unknown> {
    return patch(`${ORDER_URL}/orders/${orderId}/status`, { status });
  },
};
