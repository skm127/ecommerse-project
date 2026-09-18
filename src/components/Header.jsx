import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Menu, X, User as UserIcon, LogOut, Package } from 'lucide-react';

function Header() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    showToast('You have been logged out.');
    navigate('/');
    setUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#09090b]/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <h1 className="text-xl font-medium tracking-widest uppercase">
            <span className="text-white">SKM</span>
            <span className="text-white/60"> CART</span>
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm tracking-wide transition-colors duration-300 ${
                isActive ? 'text-accent font-medium' : 'text-white/50 hover:text-white'
              }`
            }
          >
            Home
          </NavLink>

          <form onSubmit={handleSearch} className="relative group flex items-center">
            <Search className="w-4 h-4 text-white/40 absolute left-3 group-focus-within:text-white transition-colors" />
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 lg:w-64 pl-10 pr-4 py-2 rounded-full text-sm bg-secondary border border-white/5 text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-surface transition-all duration-300"
            />
          </form>

          <div className="flex items-center gap-5">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="text-sm">{user.name.split(' ')[0]}</span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-4 w-48 bg-secondary rounded-lg shadow-2xl py-2 border border-white/5"
                    >
                      <div className="px-4 py-2 mb-2">
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-white/50 truncate">{user.email}</p>
                      </div>
                      <hr className="border-white/5" />
                      <Link
                        to="/cart"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 w-full transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="text-sm tracking-wide text-white/50 hover:text-white transition-colors"
              >
                Sign In
              </NavLink>
            )}

            <NavLink
              to="/cart"
              className="relative text-white/50 hover:text-white transition-colors flex items-center group"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </NavLink>
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          <Link to="/cart" className="relative text-white/60 hover:text-white transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white/60 hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-primary border-b border-white/5"
          >
            <form onSubmit={handleSearch} className="px-6 py-4">
              <input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-secondary border border-white/5 text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                autoFocus
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-primary border-b border-white/5"
          >
            <div className="px-6 py-6 space-y-4 flex flex-col">
              <NavLink to="/" className="text-lg tracking-wide text-white/70 hover:text-white">
                Home
              </NavLink>
              {user ? (
                <>
                  <div className="py-4 border-y border-white/5">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-white/50">{user.email}</p>
                  </div>
                  <Link to="/cart" className="text-lg tracking-wide text-white/70 hover:text-white">
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-lg tracking-wide text-white/70 hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <NavLink to="/login" className="text-lg tracking-wide text-white/70 hover:text-white">
                  Sign In
                </NavLink>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
