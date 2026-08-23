import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const couponSchema = new mongoose.Schema({
  code: String,
  type: String,
  value: Number,
  minOrderAmount: Number,
  maxDiscount: Number,
  usageLimit: Number,
  usedCount: Number,
  validFrom: Date,
  validTill: Date,
  active: Boolean,
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);

await mongoose.connect(process.env.MONGO_URI!);

await Coupon.deleteOne({ code: 'TEST99' });

await Coupon.create({
  code: 'TEST99',
  type: 'percent',
  value: 99,
  minOrderAmount: 0,
  usageLimit: 100,
  usedCount: 0,
  validFrom: new Date('2026-01-01'),
  validTill: new Date('2026-12-31'),
  active: true,
});

console.log('Coupon TEST99 created — 99% off, valid till Dec 2026');
await mongoose.disconnect();
