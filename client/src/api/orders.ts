import api from './client';
import type { Order } from '../types';

export const createOrder = (data: { items: { productId: string; qty: number }[]; couponCode?: string; addressId: string }) =>
  api.post<{ order: Order; razorpayOrderId: string; key: string; amount: number }>('/orders/create', data).then((r) => r.data);

export const verifyOrder = (data: { orderId: string; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
  api.post<{ order: Order }>('/orders/verify', data).then((r) => r.data);

export const getMyOrders = () =>
  api.get<Order[]>('/orders').then((r) => r.data);

export const getOrderById = (id: string) =>
  api.get<Order>(`/orders/${id}`).then((r) => r.data);
