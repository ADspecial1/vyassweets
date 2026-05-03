import mongoose, { Schema, type Document } from 'mongoose';
import slugify from 'slugify';

interface Discount {
  type: 'flat' | 'percent';
  value: number;
  active: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  categoryId: mongoose.Types.ObjectId;
  description: string;
  shortDescription?: string;
  images: string[];
  price: number;
  mrp: number;
  weight: number;
  unit: 'g' | 'kg' | 'pcs';
  stock: number;
  sku: string;
  discount?: Discount;
  tags: string[];
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const discountSchema = new Schema<Discount>(
  {
    type: { type: String, enum: ['flat', 'percent'], required: true },
    value: { type: Number, required: true },
    active: { type: Boolean, required: true },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, default: '' },
    shortDescription: String,
    images: [String],
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    weight: { type: Number, required: true },
    unit: { type: String, enum: ['g', 'kg', 'pcs'], required: true },
    stock: { type: Number, default: 0 },
    sku: { type: String, required: true, unique: true },
    discount: discountSchema,
    tags: [String],
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productSchema.index({ categoryId: 1, active: 1 });
productSchema.index({ name: 'text', tags: 'text' });

productSchema.pre('validate', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model<IProduct>('Product', productSchema);
