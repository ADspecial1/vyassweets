import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth';
import Header from './components/Header';
import Footer from './components/Footer';
import { RequireAuth, RequireAdmin } from './components/RequireAuth';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import NotFoundPage from './pages/NotFoundPage';

import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import ProductFormPage from './pages/admin/ProductFormPage';

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Customer routes */}
        <Route path="/" element={<RootLayout><HomePage /></RootLayout>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/category/:slug" element={<RootLayout><CategoryPage /></RootLayout>} />
        <Route path="/product/:slug" element={<RootLayout><ProductPage /></RootLayout>} />
        <Route path="/cart" element={<RootLayout><CartPage /></RootLayout>} />
        <Route path="/checkout" element={<RootLayout><RequireAuth><CheckoutPage /></RequireAuth></RootLayout>} />
        <Route path="/checkout/success/:orderId" element={<RootLayout><RequireAuth><CheckoutSuccessPage /></RequireAuth></RootLayout>} />
        <Route path="/profile" element={<RootLayout><RequireAuth><ProfilePage /></RequireAuth></RootLayout>} />
        <Route path="/orders" element={<RootLayout><RequireAuth><OrdersPage /></RequireAuth></RootLayout>} />
        <Route path="/orders/:id" element={<RootLayout><RequireAuth><OrderDetailPage /></RequireAuth></RootLayout>} />

        {/* Admin login — separate page, no layout */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin routes — protected */}
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id/edit" element={<ProductFormPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="banners" element={<div className="p-8 text-stone-400">Banners coming soon</div>} />
          <Route path="coupons" element={<div className="p-8 text-stone-400">Coupons coming soon</div>} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>

        {/* Redirect /admin/* when not logged in → admin login */}
        <Route path="*" element={<RootLayout><NotFoundPage /></RootLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
