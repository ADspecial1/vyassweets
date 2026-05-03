import api from './client';
import type { User } from '../types';

export const register = (data: { name: string; email: string; phone: string; password: string }) =>
  api.post<{ user: User }>('/auth/register', data).then((r) => r.data);

export const login = (data: { email: string; password: string }) =>
  api.post<{ user: User }>('/auth/login', data).then((r) => r.data);

export const logout = () =>
  api.post('/auth/logout').then((r) => r.data);

export const getMe = () =>
  api.get<{ user: User }>('/auth/me').then((r) => r.data);

export const updateMe = (data: { name?: string; phone?: string }) =>
  api.patch<{ user: User }>('/user/me', data).then((r) => r.data);

export const addAddress = (address: Omit<import('../types').Address, '_id'>) =>
  api.post<{ user: User }>('/user/addresses', address).then((r) => r.data);

export const updateAddress = (id: string, data: Partial<import('../types').Address>) =>
  api.patch<{ user: User }>(`/user/addresses/${id}`, data).then((r) => r.data);

export const deleteAddress = (id: string) =>
  api.delete<{ user: User }>(`/user/addresses/${id}`).then((r) => r.data);
