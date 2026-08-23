import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

await mongoose.connect(process.env['MONGO_URI']!);
const result = await mongoose.connection.collection('coupons').updateOne(
  { code: 'TEST99' },
  { $set: { value: 99.85 } }
);
console.log(result.modifiedCount ? 'Updated TEST99 → 99.54%' : 'Coupon not found');
await mongoose.disconnect();
