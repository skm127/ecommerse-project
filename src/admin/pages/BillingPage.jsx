import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { motion } from 'framer-motion';
import { Search, Plus, Minus, Trash2, Printer, Check } from 'lucide-react';

export default function BillingPage() {
  const { products, createBill } = useAdmin();
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [billItems, setBillItems] = useState([]);
  const [search, setSearch] = useState('');
  const [generatedBill, setGeneratedBill] = useState(null);

  const filteredProducts = useMemo(() => {
    if (!search) return products.filter(p => p.stock > 0);
    return products.filter(p =>
      p.stock > 0 &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
       p.category.toLowerCase().includes(search.toLowerCase()))
    );
  }, [products, search]);

  const addItem = (product) => {
    setBillItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Can't exceed stock
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: 1,
        maxStock: product.stock,
      }];
    });
  };

  const removeItem = (productId) => {
    setBillItems(prev => prev.filter(i => i.productId !== productId));
  };

  const updateQty = (productId, delta) => {
    setBillItems(prev =>
      prev.map(i => i.productId === productId
        ? { ...i, quantity: Math.max(1, Math.min(i.quantity + delta, i.maxStock)) }
        : i
      )
    );
  };

  const subtotal = billItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const handleGenerateBill = (e) => {
    e.preventDefault();
    if (billItems.length === 0) return;
    const bill = createBill({
      customerName: customer.name || 'Walk-in Customer',
      phone: customer.phone || 'N/A',
      items: billItems,
      subtotal,
    });
    setGeneratedBill(bill);
  };

  const handleNewBill = () => {
    setGeneratedBill(null);
    setBillItems([]);
    setCustomer({ name: '', phone: '' });
    setSearch('');
  };

  if (generatedBill) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-400/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-light text-white mb-2">Bill Generated!</h2>
          <p className="text-white/40 text-sm">Bill #{generatedBill.id}</p>
        </div>

        {/* Printable Receipt */}
        <div id="print-receipt" className="bg-secondary border border-white/5 rounded-sm p-8 mb-6 print:bg-white print:text-black">
          <div className="text-center border-b border-white/10 pb-6 mb-6">
            <h1 className="text-xl font-medium text-white tracking-widest uppercase print:text-black">SKM CART</h1>
            <p className="text-white/40 text-xs mt-1 print:text-gray-500">Tax Invoice</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1 print:text-gray-400">Customer</p>
              <p className="text-white print:text-black">{generatedBill.customerName}</p>
              <p className="text-white/60 print:text-gray-600">{generatedBill.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1 print:text-gray-400">Bill Details</p>
              <p className="text-white text-xs print:text-black">#{generatedBill.id}</p>
              <p className="text-white/60 text-xs print:text-gray-600">{new Date(generatedBill.date).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-white/10 print:border-gray-200">
                <th className="text-left py-2 text-xs uppercase tracking-widest text-white/40 font-normal print:text-gray-400">Item</th>
                <th className="text-right py-2 text-xs uppercase tracking-widest text-white/40 font-normal print:text-gray-400">Qty</th>
                <th className="text-right py-2 text-xs uppercase tracking-widest text-white/40 font-normal print:text-gray-400">Price</th>
                <th className="text-right py-2 text-xs uppercase tracking-widest text-white/40 font-normal print:text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {generatedBill.items.map(item => (
                <tr key={item.productId} className="border-b border-white/5 print:border-gray-100">
                  <td className="py-3 text-white/90 print:text-black">{item.name}</td>
                  <td className="py-3 text-right text-white/60 print:text-gray-600">{item.quantity}</td>
                  <td className="py-3 text-right text-white/60 print:text-gray-600">₹{item.unitPrice.toFixed(2)}</td>
                  <td className="py-3 text-right text-white/90 print:text-black">₹{(item.unitPrice * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-2 text-sm border-t border-white/10 pt-4 print:border-gray-200">
            <div className="flex justify-between text-white/60 print:text-gray-600">
              <span>Subtotal</span>
              <span>₹{generatedBill.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/60 print:text-gray-600">
              <span>GST (18%)</span>
              <span>₹{generatedBill.gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg text-white font-medium border-t border-white/10 pt-3 mt-2 print:border-gray-200 print:text-black">
              <span>Total</span>
              <span>₹{generatedBill.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center mt-8 text-white/30 text-xs print:text-gray-400">
            Thank you for shopping with SKM CART!
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 border border-white/10 text-white/60 py-3 text-sm uppercase tracking-widest hover:border-white/30 hover:text-white transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            onClick={handleNewBill}
            className="flex-1 bg-white text-primary py-3 text-sm font-medium uppercase tracking-widest hover:bg-white/90 transition-colors"
          >
            New Bill
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-light text-white tracking-tight">New Bill</h1>
        <p className="text-white/40 text-sm mt-1">Select products and generate a bill for your customer</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Product Selector */}
        <div className="lg:col-span-7">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products to add..."
              className="w-full bg-secondary border border-white/5 py-3 pl-10 pr-4 text-sm text-white rounded-sm focus:outline-none focus:border-white/20 placeholder-white/20 transition-colors"
            />
          </div>

          <div className="bg-secondary border border-white/5 rounded-sm max-h-96 overflow-y-auto">
            {filteredProducts.length === 0 && (
              <p className="text-white/30 text-sm text-center py-12">No in-stock products found.</p>
            )}
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addItem(product)}
                className="w-full flex items-center gap-4 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors text-left group"
              >
                {product.thumbnail && (
                  <div className="w-10 h-10 bg-primary rounded-sm overflow-hidden shrink-0">
                    <img src={product.thumbnail} alt={product.name} className="w-full h-full object-contain p-1" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/90 group-hover:text-white line-clamp-1">{product.name}</p>
                  <p className="text-xs text-white/30 capitalize">{product.category} · {product.stock} in stock</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-white/90">₹{Number(product.price).toFixed(2)}</p>
                  <p className="text-xs text-white/30 group-hover:text-white/50">+ Add</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bill Preview */}
        <div className="lg:col-span-5">
          <form onSubmit={handleGenerateBill} className="bg-secondary border border-white/5 rounded-sm p-6">
            <h2 className="text-sm uppercase tracking-widest text-white mb-6">Customer Details</h2>
            <div className="space-y-4 mb-6">
              <input
                value={customer.name}
                onChange={e => setCustomer(c => ({ ...c, name: e.target.value }))}
                placeholder="Customer Name"
                className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors placeholder-white/20"
              />
              <input
                value={customer.phone}
                onChange={e => setCustomer(c => ({ ...c, phone: e.target.value }))}
                placeholder="Phone Number"
                className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors placeholder-white/20"
              />
            </div>

            <h2 className="text-sm uppercase tracking-widest text-white mb-4">Bill Items</h2>
            {billItems.length === 0 ? (
              <p className="text-white/30 text-xs text-center py-8 border border-dashed border-white/10 rounded-sm">
                Click products on the left to add them here
              </p>
            ) : (
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
                {billItems.map(item => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/80 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-white/40">₹{item.unitPrice.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button type="button" onClick={() => updateQty(item.productId, -1)} className="w-6 h-6 flex items-center justify-center border border-white/10 hover:border-white/30 text-white/50 hover:text-white rounded-sm transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm text-white w-6 text-center">{item.quantity}</span>
                      <button type="button" onClick={() => updateQty(item.productId, 1)} className="w-6 h-6 flex items-center justify-center border border-white/10 hover:border-white/30 text-white/50 hover:text-white rounded-sm transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-xs text-white/80 w-16 text-right shrink-0">
                      ₹{(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                    <button type="button" onClick={() => removeItem(item.productId)} className="text-white/20 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {billItems.length > 0 && (
              <div className="border-t border-white/5 pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-xs text-white/50">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-white/50">
                  <span>GST (18%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-white font-medium pt-1">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={billItems.length === 0}
              className="w-full bg-white text-primary py-3 text-sm font-medium uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Generate Bill
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
