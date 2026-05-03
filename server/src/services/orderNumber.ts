import Counter from '../models/Counter.js';

export async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const dateKey = `${y}${m}${d}`;

  const result = await Counter.findOneAndUpdate(
    { _id: dateKey },
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  );

  return `ORD-${dateKey}-${String(result.seq).padStart(4, '0')}`;
}
