import { Schema, model, Types } from 'mongoose';

const addressSchema = new Schema(
  {
    label: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: Boolean,
  },
  { _id: false },
);

const orderItemSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    qty: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    couponCode: String,
    couponDiscount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    total: { type: Number, required: true },
    address: addressSchema,
    status: {
      type: String,
      enum: ['pending', 'paid', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    payment: {
      provider: { type: String, default: 'razorpay' },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
      paidAt: Date,
    },
  },
  { timestamps: true },
);

orderSchema.index({ status: 1, createdAt: -1 });

export default model('Order', orderSchema);
