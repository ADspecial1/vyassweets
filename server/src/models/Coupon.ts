import { Schema, model } from 'mongoose';

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    type: { type: String, enum: ['flat', 'percent'], required: true },
    value: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: Number,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    validFrom: { type: Date, required: true },
    validTill: { type: Date, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default model('Coupon', couponSchema);
