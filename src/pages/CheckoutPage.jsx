import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, CreditCard, Wallet, Banknote } from 'lucide-react';

function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart, appliedCoupon, discountAmount } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const subtotal = getCartTotal();
  const discountedSubtotal = subtotal - discountAmount;
  const gst = discountedSubtotal * 0.18;
  const shipping = discountedSubtotal > 1000 || discountedSubtotal === 0 ? 0 : 50;
  const total = discountedSubtotal + gst + shipping;

  // If someone navigates to checkout with an empty cart
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call for placing order
    setTimeout(() => {
      const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();
      clearCart();
      setLoading(false);
      navigate(`/tracking?orderId=${orderId}`);
    }, 1500);
  };

  return (
    <div className="bg-primary min-h-screen py-24">
      <div className="container mx-auto px-6">
        <nav className="mb-12">
          <Link to="/cart" className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
        </nav>

        <h1 className="text-3xl font-light text-white mb-12 tracking-tight">Checkout</h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-7 space-y-12">
            
            {/* Delivery Details */}
            <section>
              <h2 className="text-xl font-light text-white mb-6">Delivery Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="First Name" className="bg-transparent border-b border-white/10 px-0 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors" />
                <input type="text" placeholder="Last Name" className="bg-transparent border-b border-white/10 px-0 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors" />
                <input type="email" placeholder="Email Address" className="md:col-span-2 bg-transparent border-b border-white/10 px-0 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors" />
                <input type="text" placeholder="Street Address" className="md:col-span-2 bg-transparent border-b border-white/10 px-0 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors" />
                <input type="text" placeholder="City" className="bg-transparent border-b border-white/10 px-0 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors" />
                <input type="text" placeholder="Postal / Zip Code" className="bg-transparent border-b border-white/10 px-0 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors" />
                <input type="tel" placeholder="Phone Number" className="md:col-span-2 bg-transparent border-b border-white/10 px-0 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors" />
              </div>
            </section>

            {/* Payment Options */}
            <section>
              <h2 className="text-xl font-light text-white mb-6">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'card', name: 'Credit Card', icon: CreditCard },
                  { id: 'upi', name: 'UPI', icon: Wallet },
                  { id: 'cod', name: 'Cash on Delivery', icon: Banknote }
                ].map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex flex-col items-center justify-center p-6 border rounded-sm transition-all duration-300 ${
                        paymentMethod === method.id 
                          ? 'border-white bg-white/5 text-white' 
                          : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/70'
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-3" />
                      <span className="text-sm">{method.name}</span>
                      {paymentMethod === method.id && (
                        <motion.div layoutId="paymentCheck" className="mt-2 absolute top-2 right-2 text-white">
                          <Check className="w-4 h-4" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-secondary p-8 rounded-sm border border-white/5 sticky top-32">
              <h2 className="text-lg font-light text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-primary border border-white/5 rounded-sm flex items-center justify-center p-1 shrink-0">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-contain" />
                      ) : (
                        <span>🛍️</span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-sm text-white/90 line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-white/40">Qty: {item.quantity}</p>
                    </div>
                    <div className="flex items-center justify-end">
                      <span className="text-sm text-white/90">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-white/5 pt-6 space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span className="text-white/90">₹{subtotal.toFixed(2)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({appliedCoupon.code})</span>
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
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center bg-white text-primary py-4 font-medium text-sm uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CheckoutPage;
