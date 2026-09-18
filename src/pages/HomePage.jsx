import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { getProducts, seedFromAPI } from '../lib/productsDB';

function ProductCard({ product, index }) {
  const { addToCart } = useCart();
  const showToast = useToast();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart(product);
    showToast(`${product.name || product.title} added to cart!`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group flex flex-col cursor-pointer"
    >
      <Link
        to={`/product/${product.id}`}
        className="block relative overflow-hidden rounded-lg mb-4 aspect-square bg-secondary flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors"
      >
        <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }} className="w-full h-full flex items-center justify-center">
          {product.thumbnail ? (
            <img src={product.thumbnail} alt={product.name || product.title} className="w-full h-full object-contain p-4 opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-2xl" />
          ) : (
            <span className="text-5xl">🛍️</span>
          )}
        </motion.div>
        <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest text-white/50 bg-primary/40 backdrop-blur-md px-2 py-1 rounded-sm border border-white/5 capitalize">
          {product.category}
        </span>
        {product.stock === 0 && (
          <span className="absolute top-4 right-4 text-[10px] uppercase tracking-widest text-red-400 bg-primary/60 backdrop-blur-md px-2 py-1 rounded-sm border border-red-400/20">
            Out of Stock
          </span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
      </Link>

      <div className="flex flex-col flex-1 px-1">
        <div className="flex justify-between items-start mb-1">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-base text-white/90 group-hover:text-white transition-colors line-clamp-1">
              {product.name || product.title}
            </h3>
          </Link>
          <span className="text-sm text-white/70 ml-2 shrink-0">₹{Number(product.price).toFixed(2)}</span>
        </div>
        <p className="text-sm text-white/40 line-clamp-1 mb-4">{product.description}</p>

        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="mt-auto flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-white/50 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ShoppingBag className="w-4 h-4" />
          {product.stock === 0 ? 'Out of Stock' : added ? 'Added ✓' : 'Add to cart'}
        </button>
      </div>
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
      // Seed from DummyJSON into localStorage if not done yet, then read from localStorage
      const data = await seedFromAPI();
      const allProducts = data.length > 0 ? data : getProducts();
      setProducts(allProducts);
      const cats = ['All', ...new Set(allProducts.map(p => p.category))];
      setCategories(cats);
      setLoading(false);
    };
    load();

    // Listen for storage changes (when admin makes changes in the same browser)
    const onStorage = () => {
      const updated = getProducts();
      setProducts(updated);
      setCategories(['All', ...new Set(updated.map(p => p.category))]);
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('admin_products_updated', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('admin_products_updated', onStorage);
    };
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
      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-white/5">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6">
              Spring / Summer 2026
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.1 }} className="text-5xl md:text-7xl font-light text-white mb-8 tracking-tight leading-[1.1]">
              Curated essentials <br className="hidden md:block" />
              <span className="text-white/40">for modern living.</span>
            </motion.h2>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }} className="flex items-center gap-8">
              <a href="#products" className="flex items-center gap-3 text-sm uppercase tracking-widest text-white border-b border-white pb-1 hover:text-white/70 hover:border-white/70 transition-all">
                Explore Collection <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="container mx-auto px-6 py-24">
        {/* Category tabs */}
        <div className="flex flex-nowrap overflow-x-auto items-center gap-8 mb-16 border-b border-white/5 pb-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-sm tracking-wide pb-4 relative transition-colors whitespace-nowrap capitalize ${category === cat ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              {cat.replace(/-/g, ' ')}
              {category === cat && (
                <motion.div layoutId="activeCategory" className="absolute bottom-0 left-0 right-0 h-[1px] bg-white" initial={false} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-32 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-white/40 animate-spin mb-4" />
            <p className="text-white/40 text-sm uppercase tracking-widest">Loading Collection...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-white/40 text-lg mb-4">No products found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
            <Link to="/" className="text-sm uppercase tracking-widest text-white border-b border-white pb-1">Clear filters</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="border-t border-white/5 py-24">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          {[
            { title: 'Complimentary Shipping', desc: 'On all orders above ₹1000.' },
            { title: 'Secure Checkout', desc: 'Encrypted payment processing.' },
            { title: 'Free Returns', desc: '30-day no questions asked.' },
            { title: 'Client Care', desc: '24/7 dedicated support.' },
          ].map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1 }} className="flex flex-col">
              <h3 className="text-sm uppercase tracking-widest text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
