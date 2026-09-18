import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, X, Printer } from 'lucide-react';

function ReceiptModal({ bill, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#111113] border border-white/10 rounded-sm w-full max-w-lg p-8 max-h-[90vh] overflow-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-light text-white">Receipt</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div id="modal-receipt">
          <div className="text-center border-b border-white/10 pb-6 mb-6">
            <h1 className="text-xl font-medium text-white tracking-widest uppercase">SKM CART</h1>
            <p className="text-white/40 text-xs mt-1">Tax Invoice</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Customer</p>
              <p className="text-white">{bill.customerName}</p>
              <p className="text-white/60">{bill.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Bill Details</p>
              <p className="text-white text-xs">#{bill.id}</p>
              <p className="text-white/60 text-xs">{new Date(bill.date).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-xs uppercase tracking-widest text-white/40 font-normal">Item</th>
                <th className="text-right py-2 text-xs uppercase tracking-widest text-white/40 font-normal">Qty</th>
                <th className="text-right py-2 text-xs uppercase tracking-widest text-white/40 font-normal">Rate</th>
                <th className="text-right py-2 text-xs uppercase tracking-widest text-white/40 font-normal">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map(item => (
                <tr key={item.productId} className="border-b border-white/5">
                  <td className="py-3 text-white/90">{item.name}</td>
                  <td className="py-3 text-right text-white/60">{item.quantity}</td>
                  <td className="py-3 text-right text-white/60">₹{item.unitPrice.toFixed(2)}</td>
                  <td className="py-3 text-right text-white/90">₹{(item.unitPrice * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-2 text-sm border-t border-white/10 pt-4">
            <div className="flex justify-between text-white/60">
              <span>Subtotal</span>
              <span>₹{bill.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>GST (18%)</span>
              <span>₹{bill.gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg text-white font-medium border-t border-white/10 pt-3 mt-2">
              <span>Total</span>
              <span>₹{bill.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center mt-6 text-white/30 text-xs">
            Thank you for shopping with SKM CART!
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="w-full flex items-center justify-center gap-2 mt-6 border border-white/10 text-white/60 py-3 text-sm uppercase tracking-widest hover:border-white/30 hover:text-white transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </motion.div>
    </div>
  );
}

export default function BillsHistoryPage() {
  const { bills } = useAdmin();
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);

  const filtered = bills.filter(b =>
    b.customerName.toLowerCase().includes(search.toLowerCase()) ||
    b.phone.includes(search) ||
    b.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight">Bills History</h1>
          <p className="text-white/40 text-sm mt-1">{bills.length} bills generated</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by customer name, phone, or bill ID..."
          className="w-full bg-secondary border border-white/5 py-3 pl-10 pr-4 text-sm text-white rounded-sm focus:outline-none focus:border-white/20 placeholder-white/20 transition-colors"
        />
      </div>

      <div className="bg-secondary border border-white/5 rounded-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-4 px-6 text-xs uppercase tracking-widest text-white/40 font-normal">Bill ID</th>
              <th className="text-left py-4 px-4 text-xs uppercase tracking-widest text-white/40 font-normal">Customer</th>
              <th className="text-left py-4 px-4 text-xs uppercase tracking-widest text-white/40 font-normal">Date</th>
              <th className="text-right py-4 px-4 text-xs uppercase tracking-widest text-white/40 font-normal">Items</th>
              <th className="text-right py-4 px-4 text-xs uppercase tracking-widest text-white/40 font-normal">Total</th>
              <th className="text-right py-4 px-6 text-xs uppercase tracking-widest text-white/40 font-normal">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-16 text-white/30">
                  {bills.length === 0 ? 'No bills yet. Create your first bill!' : 'No bills match your search.'}
                </td>
              </tr>
            )}
            {filtered.map(bill => (
              <motion.tr
                key={bill.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-4 px-6 text-white/60 font-mono text-xs">{bill.id}</td>
                <td className="py-4 px-4">
                  <p className="text-white/90">{bill.customerName}</p>
                  <p className="text-white/30 text-xs">{bill.phone}</p>
                </td>
                <td className="py-4 px-4 text-white/50 text-xs">
                  {new Date(bill.date).toLocaleDateString('en-IN')}<br />
                  <span className="text-white/30">{new Date(bill.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </td>
                <td className="py-4 px-4 text-right text-white/60">{bill.items.length}</td>
                <td className="py-4 px-4 text-right text-white font-medium">₹{bill.total.toFixed(2)}</td>
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => setSelectedBill(bill)}
                    className="p-1.5 text-white/30 hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedBill && (
          <ReceiptModal bill={selectedBill} onClose={() => setSelectedBill(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
