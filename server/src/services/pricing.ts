import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING, GST_RATE } from '../config/business.js';
import { AppError } from '../lib/AppError.js';

interface InputItem {
  productId: string;
  qty: number;
}

export interface PricingResult {
  items: {
    productId: string;
    name: string;
    image: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  subtotal: number;
  couponCode?: string;
  couponDiscount: number;
  shippingFee: number;
  gst: number;
  total: number;
}

export async function calculateOrder(input: {
  items: InputItem[];
  couponCode?: string;
}): Promise<PricingResult> {
  const ids = input.items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: ids }, active: true }).lean();
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const calcItems: PricingResult['items'] = [];
  let subtotal = 0;

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product) throw new AppError(400, `Product not found or inactive: ${item.productId}`);
    if (product.stock < item.qty) throw new AppError(400, `Insufficient stock for "${product.name}"`);

    const unitPrice = product.price;
    const lineTotal = unitPrice * item.qty;
    subtotal += lineTotal;

    calcItems.push({
      productId: item.productId,
      name: product.name,
      image: product.images?.[0] ?? '',
      qty: item.qty,
      unitPrice,
      lineTotal,
    });
  }

  let couponDiscount = 0;
  let appliedCouponCode: string | undefined;

  if (input.couponCode) {
    const coupon = await Coupon.findOne({ code: input.couponCode.toUpperCase(), active: true }).lean();
    if (coupon) {
      const now = new Date();
      const valid =
        now >= coupon.validFrom &&
        now <= coupon.validTill &&
        subtotal >= coupon.minOrderAmount &&
        (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit);

      if (valid) {
        if (coupon.type === 'flat') {
          couponDiscount = Math.min(coupon.value, subtotal);
        } else {
          const pct = Math.floor((subtotal * coupon.value) / 100);
          couponDiscount = coupon.maxDiscount ? Math.min(pct, coupon.maxDiscount) : pct;
        }
        appliedCouponCode = coupon.code;
      }
    }
  }

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const gst = Math.floor(((subtotal - couponDiscount) * GST_RATE) / 100);
  const total = subtotal - couponDiscount + shippingFee + gst;

  return {
    items: calcItems,
    subtotal,
    couponCode: appliedCouponCode,
    couponDiscount,
    shippingFee,
    gst,
    total,
  };
}
