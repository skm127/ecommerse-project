import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Receipt, History, LogOut, ShoppingCart, Menu, X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminProvider } from './context/AdminContext';

const ADMIN_PIN = 'admin123';

function PinGuard({ children }) {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('admin_auth') === 'true'
  );
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('admin_auth', 'true');
      setAuthenticated(true);
    } else {
      setError('Incorrect PIN. Try admin123');
      setPin('');
    }
  };

  if (authenticated) return children;

  return (
    <div className="bg-primary min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
          <Lock className="w-7 h-7 text-white/60" />
        </div>
        <h1 className="text-2xl font-light text-white mb-2 tracking-tight">Admin Access</h1>
        <p className="text-white/40 text-sm mb-10">Enter your PIN to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN"
            className="w-full bg-transparent border-b border-white/20 py-3 text-center text-white text-xl tracking-[0.5em] focus:outline-none focus:border-white transition-colors placeholder-white/20 placeholder:tracking-normal placeholder:text-sm"
            autoFocus
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            className="w-full bg-white text-primary py-3 text-sm font-medium uppercase tracking-widest hover:bg-white/90 transition-colors mt-4"
          >
            Enter
          </button>
        </form>
      </motion.div>
    </div>
  );
}

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/billing', label: 'New Bill', icon: Receipt },
  { to: '/admin/bills', label: 'Bills History', icon: History },
];

function AdminSidebar({ onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0f] border-r border-white/5 w-64">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-medium tracking-widest uppercase text-sm">SKM CART</h2>
            <p className="text-white/30 text-xs mt-0.5">Admin Panel</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white/40 hover:text-white lg:hidden">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-sm text-sm transition-colors ${
                  isActive
                    ? 'bg-white text-primary font-medium'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-1">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          View Store
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <PinGuard>
      <AdminProvider>
        <div className="flex h-screen bg-primary overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden lg:flex flex-col">
            <AdminSidebar />
          </div>

          {/* Mobile Sidebar Drawer */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
                <motion.div
                  initial={{ x: -256 }}
                  animate={{ x: 0 }}
                  exit={{ x: -256 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
                >
                  <AdminSidebar onClose={() => setSidebarOpen(false)} />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-auto">
            {/* Mobile header */}
            <div className="lg:hidden flex items-center gap-4 px-4 py-3 border-b border-white/5 bg-primary sticky top-0 z-30">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="text-white font-medium tracking-widest uppercase text-sm">Admin Panel</span>
            </div>

            <div className="flex-1 p-6 lg:p-8">
              <Outlet />
            </div>
          </div>
        </div>
      </AdminProvider>
    </PinGuard>
  );
}
