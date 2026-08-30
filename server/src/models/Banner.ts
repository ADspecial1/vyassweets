import mongoose, { Schema, type Document } from 'mongoose';

export interface IBanner extends Document {
  image: string;
  mediaType: 'image' | 'video';
  videoUrl?: string;
  posterUrl?: string;
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
    // Required for image banners; video banners rely on videoUrl (+ optional posterUrl).
    image: {
      type: String,
      required: function (this: IBanner) {
        return this.mediaType !== 'video';
      },
    },
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    videoUrl: String,
    posterUrl: String,
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
