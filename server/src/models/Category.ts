import mongoose, { Schema, type Document } from 'mongoose';
import slugify from 'slugify';

export interface ICategory extends Document {
  name: string;
  slug: string;
  image?: string;
  description?: string;
  parentId?: mongoose.Types.ObjectId;
  displayOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: String,
    description: String,
    parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    displayOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

categorySchema.index({ displayOrder: 1 });
categorySchema.index({ parentId: 1 });

categorySchema.pre('validate', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model<ICategory>('Category', categorySchema);
