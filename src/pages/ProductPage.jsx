import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { motion } from 'framer-motion';
import { Minus, Plus, ArrowLeft, Loader2 } from 'lucide-react';
import { getProductById, getProducts } from '../lib/productsDB';

function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const { addToCart } = useCart();
  const showToast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Description');

  useEffect(() => {
    setLoading(true);
    setError(false);
    setQuantity(1);
    setActiveTab('Description');

    // Read from shared localStorage DB
    const found = getProductById(id);
    if (found) {
      setProduct(found);
      const related = getProducts()
        .filter(p => p.category === found.category && String(p.id) !== String(id))
        .slice(0, 4);
      setRelatedProducts(related);
      setLoading(false);
    } else {
      setError(true);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-32 text-center min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin mb-4" />
        <p className="text-white/40 text-sm uppercase tracking-widest">Loading details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-6 py-32 text-center min-h-[70vh] flex flex-col items-center justify-center">
        <p className="text-white/40 mb-6 text-lg">Product not found.</p>
        <Link to="/" className="text-sm uppercase tracking-widest text-white border-b border-white pb-1">Return Home</Link>
      </div>
    );
  }

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    showToast(`${quantity} × ${product.name || product.title} added to cart!`);
  };

  return (
    <div className="bg-primary min-h-screen pb-24">
      <div className="container mx-auto px-6 pt-12 md:pt-20">
        <nav className="mb-12">
          <Link to="/" className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to collection
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="lg:col-span-7 flex flex-col gap-4">
            <div className="aspect-[4/5] bg-secondary flex items-center justify-center rounded-sm overflow-hidden border border-white/5">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="w-full h-full">
                {product.thumbnail ? (
                  <img src={product.thumbnail} alt={product.name || product.title} className="w-full h-full object-contain p-8 drop-shadow-2xl" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">🛍️</div>
                )}
              </motion.div>
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {product.images.slice(0, 4).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-secondary rounded-sm overflow-hidden border border-white/5 flex items-center justify-center p-2">
                    <img src={img} alt={`view ${idx + 1}`} className="w-full h-full object-contain opacity-70 hover:opacity-100 transition-opacity cursor-pointer drop-shadow-xl" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="lg:col-span-5 flex flex-col pt-8">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 block capitalize">{product.category?.replace(/-/g, ' ')}</span>
            <h1 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-tight leading-tight">{product.name || product.title}</h1>

            <div className="flex items-center gap-4 mb-10">
              <div className="text-2xl text-white/90 font-light">₹{Number(product.price).toFixed(2)}</div>
              {product.discountPercentage > 0 && (
                <div className="text-xs uppercase tracking-widest bg-white/10 text-white px-2 py-1 rounded-sm border border-white/10">{product.discountPercentage}% OFF</div>
              )}
              {product.stock === 0 && (
                <div className="text-xs uppercase tracking-widest text-red-400 bg-red-400/10 px-2 py-1 rounded-sm border border-red-400/20">Out of Stock</div>
              )}
            </div>

            <p className="text-white/60 leading-relaxed mb-12 font-light">{product.description}</p>

            <div className="mt-auto space-y-6 border-t border-white/5 pt-8">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-white/50">Quantity</span>
                <div className="flex items-center gap-4">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-white/50 hover:text-white p-2"><Minus className="w-4 h-4" /></button>
                  <span className="text-sm w-4 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(q + 1, product.stock || 10))} className="text-white/50 hover:text-white p-2"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              <button
                onClick={handleAdd}
                disabled={product.stock === 0}
                className="w-full flex items-center justify-between bg-white text-primary px-6 py-4 rounded-sm hover:bg-white/90 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-sm font-medium uppercase tracking-widest">Add to Cart</span>
                <span className="text-sm font-medium border-l border-primary/10 pl-6">₹{(Number(product.price) * quantity).toFixed(2)}</span>
              </button>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-xs text-white/40"><div className="w-1 h-1 bg-white/40 rounded-full"></div>Complimentary shipping & returns</div>
              <div className="flex items-center gap-3 text-xs text-white/40"><div className="w-1 h-1 bg-white/40 rounded-full"></div>{product.shippingInformation || 'Estimated delivery in 2-4 business days'}</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-6 mt-32 border-t border-white/5 pt-16">
        <div className="flex gap-12 mb-12 border-b border-white/5 pb-4">
          {['Description', 'Details', 'Shipping'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`text-xs uppercase tracking-widest pb-4 relative transition-colors ${activeTab === tab ? 'text-white' : 'text-white/40 hover:text-white/70'}`}>
              {tab}
              {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[1px] bg-white" />}
            </button>
          ))}
        </div>
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-2xl text-white/60 font-light leading-relaxed">
          {activeTab === 'Description' && <p>{product.description}</p>}
          {activeTab === 'Details' && (
            <ul className="space-y-4">
              {product.brand && <li className="grid grid-cols-3 border-b border-white/5 pb-2"><span className="text-white/40 text-sm">Brand</span><span className="col-span-2 text-sm">{product.brand}</span></li>}
              {product.rating && <li className="grid grid-cols-3 border-b border-white/5 pb-2"><span className="text-white/40 text-sm">Rating</span><span className="col-span-2 text-sm">{product.rating} / 5</span></li>}
              <li className="grid grid-cols-3 border-b border-white/5 pb-2"><span className="text-white/40 text-sm">Stock</span><span className="col-span-2 text-sm">{product.stock} units available</span></li>
              {product.sku && <li className="grid grid-cols-3 border-b border-white/5 pb-2"><span className="text-white/40 text-sm">SKU</span><span className="col-span-2 text-sm">{product.sku}</span></li>}
              {product.weight && <li className="grid grid-cols-3 border-b border-white/5 pb-2"><span className="text-white/40 text-sm">Weight</span><span className="col-span-2 text-sm">{product.weight}g</span></li>}
            </ul>
          )}
          {activeTab === 'Shipping' && <p>{product.returnPolicy || 'Returns accepted within 30 days.'} {product.shippingInformation || 'Standard shipping 2-4 business days.'}</p>}
        </motion.div>
      </div>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-6 mt-32">
          <h2 className="text-xl font-light text-white mb-12">Also from this collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }} className="group flex flex-col">
                <Link to={`/product/${p.id}`} className="block relative overflow-hidden bg-secondary aspect-square flex items-center justify-center mb-4 rounded-sm border border-white/5 group-hover:border-white/10 transition-colors">
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }} className="w-full h-full">
                    {p.thumbnail ? <img src={p.thumbnail} alt={p.name || p.title} className="w-full h-full object-contain p-4 opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-2xl" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>}
                  </motion.div>
                </Link>
                <Link to={`/product/${p.id}`} className="text-sm text-white/70 group-hover:text-white transition-colors mb-1 line-clamp-1">{p.name || p.title}</Link>
                <span className="text-xs text-white/40">₹{Number(p.price).toFixed(2)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductPage;
