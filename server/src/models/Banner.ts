import mongoose, { Schema, type Document } from 'mongoose';

export interface IBanner extends Document {
  image: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  displayOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    image: { type: String, required: true },
    title: String,
    subtitle: String,
    ctaText: String,
    ctaLink: String,
    displayOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

bannerSchema.index({ displayOrder: 1 });

export default mongoose.model<IBanner>('Banner', bannerSchema);
