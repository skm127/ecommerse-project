import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { products } from '../data/products';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';

function ProductPage() {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));
  const { addToCart } = useCart();
  const showToast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Description');

  if (!product) {
    return (
      <div className="container mx-auto px-6 py-32 text-center min-h-[70vh] flex flex-col items-center justify-center">
        <p className="text-white/40 mb-6 text-lg">Product not found.</p>
        <Link to="/" className="text-sm uppercase tracking-widest text-white border-b border-white pb-1">
          Return Home
        </Link>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    showToast(`${quantity} × ${product.name} added to cart!`);
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, 10)));
  };

  return (
    <div className="bg-primary min-h-screen pb-24">
      {/* Editorial Layout */}
      <div className="container mx-auto px-6 pt-12 md:pt-20">
        <nav className="mb-12">
          <Link to="/" className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" />
            Back to collection
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Left: Gallery (Editorial huge image) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col gap-4"
          >
            <div className="aspect-[4/5] bg-secondary flex items-center justify-center text-[180px] md:text-[240px] rounded-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {product.emoji}
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="lg:col-span-5 flex flex-col pt-8"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 block">
              {product.category}
            </span>
            
            <h1 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-tight leading-tight">
              {product.name}
            </h1>
            
            <div className="text-2xl text-white/90 mb-10 font-light">
              ${product.price.toFixed(2)}
            </div>

            <p className="text-white/60 leading-relaxed mb-12 font-light">
              {product.description}
            </p>

            <div className="mt-auto space-y-6 border-t border-white/5 pt-8">
              {/* Quantity */}
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-white/50">Quantity</span>
                <div className="flex items-center gap-4">
                  <button onClick={() => handleQuantityChange(-1)} className="text-white/50 hover:text-white p-2">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm w-4 text-center">{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} className="text-white/50 hover:text-white p-2">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAdd}
                className="w-full flex items-center justify-between bg-white text-primary px-6 py-4 rounded-sm group hover:bg-white/90 transition-all duration-300"
              >
                <span className="text-sm font-medium uppercase tracking-widest">Add to Cart</span>
                <span className="text-sm font-medium border-l border-primary/10 pl-6">${(product.price * quantity).toFixed(2)}</span>
              </button>
            </div>
            
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-xs text-white/40">
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                Complimentary shipping & returns
              </div>
              <div className="flex items-center gap-3 text-xs text-white/40">
                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                Estimated delivery in 2-4 business days
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-6 mt-32 border-t border-white/5 pt-16">
        <div className="flex gap-12 mb-12 border-b border-white/5 pb-4">
          {['Description', 'Details', 'Shipping'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs uppercase tracking-widest pb-4 relative transition-colors ${
                activeTab === tab ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-white"
                />
              )}
            </button>
          ))}
        </div>
        
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl text-white/60 font-light leading-relaxed"
        >
          {activeTab === 'Description' && (
            <p>
              This {product.name.toLowerCase()} embodies our commitment to minimalist design and premium quality. 
              Meticulously curated for the modern lifestyle, it blends seamlessly into your everyday routine. 
              {product.description}
            </p>
          )}
          {activeTab === 'Details' && (
            <ul className="space-y-4">
              <li className="grid grid-cols-3 border-b border-white/5 pb-2">
                <span className="text-white/40 text-sm">Material</span>
                <span className="col-span-2 text-sm">Premium Quality</span>
              </li>
              <li className="grid grid-cols-3 border-b border-white/5 pb-2">
                <span className="text-white/40 text-sm">Origin</span>
                <span className="col-span-2 text-sm">Responsibly Sourced</span>
              </li>
              <li className="grid grid-cols-3 border-b border-white/5 pb-2">
                <span className="text-white/40 text-sm">SKU</span>
                <span className="col-span-2 text-sm">{product.id.toString().padStart(6, '0')}</span>
              </li>
            </ul>
          )}
          {activeTab === 'Shipping' && (
            <p>
              Enjoy complimentary standard shipping on all orders. Express options are available at checkout. 
              If you are not completely satisfied with your purchase, you may return it within 30 days for a full refund.
            </p>
          )}
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-6 mt-32">
          <h2 className="text-xl font-light text-white mb-12">Also from this collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group flex flex-col"
              >
                <Link to={`/product/${p.id}`} className="block relative overflow-hidden bg-secondary aspect-square flex items-center justify-center text-7xl mb-4 rounded-sm border border-white/5 group-hover:border-white/10 transition-colors">
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }}>
                    {p.emoji}
                  </motion.div>
                </Link>
                <Link to={`/product/${p.id}`} className="text-sm text-white/70 group-hover:text-white transition-colors mb-1">
                  {p.name}
                </Link>
                <span className="text-xs text-white/40">${p.price.toFixed(2)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductPage;
