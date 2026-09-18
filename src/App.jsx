import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import ProductPage from './pages/ProductPage';
import LoginPage from './pages/LoginPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin
import AdminLayout from './admin/AdminLayout';
import DashboardPage from './admin/pages/DashboardPage';
import ProductsPage from './admin/pages/ProductsPage';
import BillingPage from './admin/pages/BillingPage';
import BillsHistoryPage from './admin/pages/BillsHistoryPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <ScrollToTop />
            <Routes>
              {/* Customer Storefront */}
              <Route path="/" element={
                <div className="min-h-screen bg-primary text-gray-100 flex flex-col">
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      <Route index element={<HomePage />} />
                      <Route path="cart" element={<CartPage />} />
                      <Route path="product/:id" element={<ProductPage />} />
                      <Route path="login" element={<LoginPage />} />
                      <Route path="checkout" element={<CheckoutPage />} />
                      <Route path="tracking" element={<OrderTrackingPage />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              } />

              {/* Admin Panel */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="bills" element={<BillsHistoryPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
