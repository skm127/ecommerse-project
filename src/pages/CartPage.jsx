import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ArrowRight, Tag, X } from 'lucide-react';

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, applyCoupon, removeCoupon, appliedCoupon, discountAmount } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = React.useState('');
  const [couponMessage, setCouponMessage] = React.useState(null);
  
  const subtotal = getCartTotal();
  const discountedSubtotal = subtotal - discountAmount;
  const gst = discountedSubtotal * 0.18; // 18% GST on discounted subtotal
  const shipping = discountedSubtotal > 1000 || discountedSubtotal === 0 ? 0 : 50;
  const total = discountedSubtotal + gst + shipping;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const result = applyCoupon(couponCode);
    setCouponMessage(result);
    if (result.success) setCouponCode('');
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-primary min-h-[80vh] flex items-center justify-center">
        <div className="text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-light text-white mb-4 tracking-tight">Your cart is empty.</h2>
            <p className="text-white/40 mb-8">Discover our curated collection and find something you love.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-white border-b border-white pb-1 hover:text-white/70 hover:border-white/70 transition-all"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary min-h-screen py-24">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl font-light text-white mb-12 tracking-tight">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="border-t border-white/5">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-6 py-8 border-b border-white/5"
                >
                  <Link to={`/product/${item.id}`} className="w-24 h-24 sm:w-32 sm:h-32 bg-secondary flex items-center justify-center text-4xl sm:text-5xl rounded-sm hover:opacity-80 transition-opacity border border-white/5 overflow-hidden">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title || item.name} className="w-full h-full object-contain p-2" />
                    ) : (
                      <span>🛍️</span>
                    )}
                  </Link>
                  
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-white/40 mb-1 block">
                          {item.category || 'Product'}
                        </span>
                        <Link to={`/product/${item.id}`} className="text-lg text-white/90 hover:text-white transition-colors">
                          {item.title || item.name}
                        </Link>
                      </div>
                      <span className="text-lg text-white/90 font-light">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-white/10 rounded-sm">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-2 text-white/50 hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm text-white/80">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-2 text-white/50 hover:text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-secondary p-8 rounded-sm border border-white/5 sticky top-32">
              <h2 className="text-lg font-light text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span className="text-white/90">₹{subtotal.toFixed(2)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-green-400">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Discount ({appliedCoupon.code})
                    </span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-white/60">
                  <span>GST (18%)</span>
                  <span className="text-white/90">₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Delivery</span>
                  <span className="text-white/90">{shipping === 0 ? 'Complimentary' : `₹${shipping.toFixed(2)}`}</span>
                </div>
              </div>
              
              <div className="border-t border-white/5 pt-6 mb-8 flex justify-between items-end">
                <span className="text-white/90 font-medium">Total</span>
                <span className="text-2xl text-white font-light">₹{total.toFixed(2)}</span>
              </div>
              
              {/* Coupon Section */}
              <div className="mb-6">
                {!appliedCoupon ? (
                  <div>
                    <div className="flex border border-white/10 rounded-sm overflow-hidden focus-within:border-white/30 transition-colors">
                      <input 
                        type="text" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Promo Code (e.g. SKM10)" 
                        className="bg-transparent px-4 py-3 text-sm text-white focus:outline-none flex-1 placeholder-white/30"
                      />
                      <button onClick={handleApplyCoupon} className="bg-white/10 px-4 text-xs uppercase tracking-widest text-white hover:bg-white/20 transition-colors">
                        Apply
                      </button>
                    </div>
                    {couponMessage && (
                      <p className={`text-xs mt-2 ${couponMessage.success ? 'text-green-400' : 'text-red-400'}`}>
                        {couponMessage.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between border border-green-400/30 bg-green-400/5 px-4 py-3 rounded-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-400" />
                      <div>
                        <span className="text-sm text-green-400 font-medium block">{appliedCoupon.code}</span>
                        <span className="text-xs text-green-400/70">{appliedCoupon.message}</span>
                      </div>
                    </div>
                    <button onClick={removeCoupon} className="text-white/40 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-white text-primary py-4 font-medium text-sm uppercase tracking-widest hover:bg-white/90 transition-colors"
              >
                Proceed to Checkout
              </button>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-xs text-white/40">
                  <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                  Secure encrypted checkout
                </div>
                {shipping > 0 && (
                  <div className="flex items-center gap-3 text-xs text-white/40">
                    <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                    Add ₹{(1000 - discountedSubtotal).toFixed(2)} more for complimentary shipping
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
