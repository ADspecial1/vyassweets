import api from './client';
import type { Banner, Category, PaginatedProducts, Product } from '../types';

export const getBanners = () =>
  api.get<Banner[]>('/banners').then((r) => r.data);

export const getCategories = () =>
  api.get<Category[]>('/categories').then((r) => r.data);

export const getCategoryBySlug = (slug: string) =>
  api.get<Category>(`/categories/${slug}`).then((r) => r.data);

export const getProducts = (params?: {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}) => api.get<PaginatedProducts>('/products', { params }).then((r) => r.data);

export const getProductBySlug = (slug: string) =>
  api.get<Product>(`/products/${slug}`).then((r) => r.data);

export const validateCoupon = (code: string, subtotal: number) =>
  api.post<{ valid: boolean; discount: number; message: string }>('/coupons/validate', { code, subtotal }).then((r) => r.data);
