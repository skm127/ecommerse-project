import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Star } from 'lucide-react';
import { getProducts, seedFromAPI } from '../lib/productsDB';
import { TiltCard, Marquee, SpotlightHero, ProductSkeleton } from '../components/ui';

const MARQUEE_ITEMS = [
  'Free Shipping Over ₹1000', 'New Arrivals Daily', 'Exclusive Members Pricing',
  'Secure Checkout', 'Easy Returns', 'Premium Quality', '200+ Products',
  'Electronics', 'Fashion', 'Beauty', 'Sports', 'Furniture',
];

function ProductCard({ product, index }) {
  const { addToCart } = useCart();
  const showToast = useToast();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    showToast(`${product.name || product.title} added to cart!`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.04, ease: [0.21, 0.47, 0.32, 0.98] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <TiltCard className="flex flex-col cursor-pointer" intensity={6}>
        <Link to={`/product/${product.id}`} className="block">
          {/* Image Container */}
          <div className="relative overflow-hidden rounded-lg mb-4 aspect-square bg-secondary border border-white/5 group">
            {/* Category pill */}
            <span className="absolute top-3 left-3 z-10 text-[9px] uppercase tracking-widest text-white/60 bg-black/40 backdrop-blur-md px-2 py-1 rounded-sm border border-white/10 capitalize">
              {product.category?.replace(/-/g, ' ')}
            </span>

            {/* Out of stock badge */}
            {product.stock === 0 && (
              <span className="absolute top-3 right-3 z-10 text-[9px] uppercase tracking-widest text-red-400 bg-black/60 px-2 py-1 rounded-sm border border-red-400/20">
                Out of Stock
              </span>
            )}

            {/* Product Image */}
            <motion.div
              animate={{ scale: hovered ? 1.06 : 1 }}
              transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="w-full h-full flex items-center justify-center"
            >
              {product.thumbnail ? (
                <img
                  src={product.thumbnail}
                  alt={product.name || product.title}
                  className="w-full h-full object-contain p-4 drop-shadow-2xl"
                  loading="lazy"
                />
              ) : (
                <span className="text-5xl">🛍️</span>
              )}
            </motion.div>

            {/* Quick-add overlay */}
            <AnimatePresence>
              {hovered && product.stock > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-0 left-0 right-0 p-3"
                >
                  <button
                    onClick={handleAdd}
                    className="w-full bg-white/95 backdrop-blur-sm text-primary text-xs font-medium uppercase tracking-widest py-2.5 rounded-sm hover:bg-white transition-all"
                  >
                    {added ? '✓ Added to Cart' : 'Quick Add'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex flex-col flex-1 px-1 gap-1">
          <div className="flex items-start justify-between gap-2">
            <Link to={`/product/${product.id}`}>
              <h3 className="text-sm text-white/80 hover:text-white transition-colors line-clamp-1 leading-snug">
                {product.name || product.title}
              </h3>
            </Link>
            <span className="text-sm text-white/90 shrink-0 font-medium">
              ₹{Number(product.price).toFixed(0)}
            </span>
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-[11px] text-white/40">{Number(product.rating).toFixed(1)}</span>
            </div>
          )}

          {/* Add to cart button */}
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/40 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {product.stock === 0 ? 'Out of Stock' : added ? 'Added ✓' : 'Add to Cart'}
          </button>
        </div>
      </TiltCard>
    </motion.div>
  );
}

function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [category, setCategory] = useState('All');
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await seedFromAPI();
      const all = data.length > 0 ? data : getProducts();
      setProducts(all);
      setCategories(['All', ...new Set(all.map(p => p.category))]);
      setLoading(false);
    };
    load();
    const onUpdate = () => {
      const updated = getProducts();
      setProducts(updated);
      setCategories(['All', ...new Set(updated.map(p => p.category))]);
    };
    window.addEventListener('admin_products_updated', onUpdate);
    return () => window.removeEventListener('admin_products_updated', onUpdate);
  }, []);

  const filteredProducts = useMemo(() => {
    let list = category === 'All' ? products : products.filter(p => p.category === category);
    if (searchQuery) {
      list = list.filter(p =>
        (p.name || p.title || '').toLowerCase().includes(searchQuery) ||
        (p.description || '').toLowerCase().includes(searchQuery) ||
        (p.category || '').toLowerCase().includes(searchQuery)
      );
    }
    return list;
  }, [category, searchQuery, products]);

  return (
    <div className="bg-primary min-h-screen">
      {/* ── HERO ── */}
      <SpotlightHero className="relative pt-36 pb-20 overflow-hidden border-b border-white/5">
        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8"
            >
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[11px] uppercase tracking-widest text-white/50">New Collection Live</span>
            </motion.div>

            <div className="overflow-hidden mb-4">
              <motion.h1
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="text-5xl md:text-7xl lg:text-8xl font-light text-white tracking-tight leading-[1.05]"
              >
                Premium
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-10">
              <motion.h1
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="text-5xl md:text-7xl lg:text-8xl font-light text-white/30 tracking-tight leading-[1.05]"
              >
                essentials.
              </motion.h1>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
            >
              <a
                href="#products"
                className="group flex items-center gap-3 bg-white text-primary px-6 py-3.5 text-sm font-medium uppercase tracking-widest hover:bg-white/90 transition-all"
              >
                Shop Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <div className="flex items-center gap-3 text-white/40 text-sm">
                <div className="flex -space-x-2">
                  {['₹', '★', '✓'].map((s, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] text-white/60">{s}</div>
                  ))}
                </div>
                {products.length > 0 && <span>{products.length}+ products available</span>}
              </div>
            </motion.div>
          </div>
        </div>
      </SpotlightHero>

      {/* ── MARQUEE STRIP ── */}
      <div className="border-b border-white/5 py-4 bg-primary/80 backdrop-blur-sm">
        <Marquee items={MARQUEE_ITEMS} speed={35} />
      </div>

      {/* ── PRODUCTS ── */}
      <section id="products" className="container mx-auto px-6 py-20">
        {/* Category tabs */}
        <div className="flex flex-nowrap overflow-x-auto items-center gap-8 mb-14 border-b border-white/5 pb-4 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-sm tracking-wide pb-4 relative transition-colors whitespace-nowrap capitalize shrink-0 ${
                category === cat ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {cat.replace(/-/g, ' ')}
              {category === cat && (
                <motion.div
                  layoutId="activeCat"
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-white"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-white/30 text-lg mb-4">No products found.</p>
            <Link to="/" className="text-sm uppercase tracking-widest text-white border-b border-white pb-0.5">
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ── FEATURES BAR ── */}
      <section className="border-t border-white/5 py-20">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          {[
            { emoji: '🚚', title: 'Free Shipping', desc: 'On all orders above ₹1000.' },
            { emoji: '🔒', title: 'Secure Checkout', desc: 'Encrypted payment processing.' },
            { emoji: '↩️', title: 'Free Returns', desc: '30-day no questions asked.' },
            { emoji: '💬', title: 'Client Care', desc: '24/7 dedicated support.' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="flex flex-col gap-3 p-6 border border-white/5 rounded-sm hover:border-white/10 transition-colors"
            >
              <span className="text-2xl">{f.emoji}</span>
              <h3 className="text-sm uppercase tracking-widest text-white">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
