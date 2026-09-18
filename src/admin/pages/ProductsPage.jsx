import React, { useState, useMemo } from 'react';
import { useAdmin } from '../context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, ChevronUp, ChevronDown, Pencil, Trash2, X, Minus, History } from 'lucide-react';

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || '',
    price: product?.price || '',
    stock: product?.stock || '',
    thumbnail: product?.thumbnail || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#111113] border border-white/10 rounded-sm w-full max-w-lg p-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-light text-white">{product ? 'Edit Product' : 'New Product'}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs uppercase tracking-widest text-white/40 block mb-2">Product Name</label>
            <input
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-transparent border-b border-white/10 py-2 text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs uppercase tracking-widest text-white/40 block mb-2">Category</label>
              <input
                required
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full bg-transparent border-b border-white/10 py-2 text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-white/40 block mb-2">Price (₹)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full bg-transparent border-b border-white/10 py-2 text-white focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-white/40 block mb-2">Stock Quantity</label>
            <input
              required
              type="number"
              min="0"
              value={form.stock}
              onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
              className="w-full bg-transparent border-b border-white/10 py-2 text-white focus:outline-none focus:border-white transition-colors"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-white/40 block mb-2">Image URL (optional)</label>
            <input
              value={form.thumbnail}
              onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))}
              className="w-full bg-transparent border-b border-white/10 py-2 text-white focus:outline-none focus:border-white transition-colors text-sm placeholder-white/20"
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-white/10 text-white/60 text-sm uppercase tracking-widest hover:border-white/30 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3 bg-white text-primary text-sm font-medium uppercase tracking-widest hover:bg-white/90 transition-colors">
              {product ? 'Update' : 'Add Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function StockAuditModal({ product, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#111113] border border-white/10 rounded-sm w-full max-w-md p-8 max-h-[80vh] overflow-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-light text-white">Stock Audit — {product.name}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        {(product.stockAudit || []).length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">No audit entries yet.</p>
        ) : (
          <div className="space-y-3">
            {(product.stockAudit || []).map((entry, i) => (
              <div key={i} className="flex justify-between items-start py-3 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm text-white/80">{entry.action}</p>
                  <p className="text-xs text-white/30 mt-1">{new Date(entry.timestamp).toLocaleString('en-IN')}</p>
                </div>
                <span className={`text-sm font-medium ${entry.delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {entry.delta > 0 ? '+' : ''}{entry.delta}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, adjustStock } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [modalProduct, setModalProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [auditProduct, setAuditProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (filterCategory !== 'All') list = list.filter(p => p.category === filterCategory);
    if (search) list = list.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );
    return [...list].sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [products, search, filterCategory, sortBy, sortDir]);

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />;
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-light text-white tracking-tight">Products</h1>
          <p className="text-white/40 text-sm mt-1">{products.length} products in inventory</p>
        </div>
        <button
          onClick={() => { setModalProduct(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-white text-primary px-5 py-3 text-sm font-medium uppercase tracking-widest hover:bg-white/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-secondary border border-white/5 py-3 pl-10 pr-4 text-sm text-white rounded-sm focus:outline-none focus:border-white/20 placeholder-white/20 transition-colors"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-secondary border border-white/5 py-3 px-4 text-sm text-white rounded-sm focus:outline-none focus:border-white/20 transition-colors capitalize"
        >
          {categories.map(c => <option key={c} value={c} className="bg-[#09090b] capitalize">{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-secondary border border-white/5 rounded-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-4 px-6 text-xs uppercase tracking-widest text-white/40 font-normal">Product</th>
              <th className="text-left py-4 px-4 text-xs uppercase tracking-widest text-white/40 font-normal cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('category')}>
                Category <SortIcon field="category" />
              </th>
              <th className="text-right py-4 px-4 text-xs uppercase tracking-widest text-white/40 font-normal cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('price')}>
                Price <SortIcon field="price" />
              </th>
              <th className="text-right py-4 px-4 text-xs uppercase tracking-widest text-white/40 font-normal cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('stock')}>
                Stock <SortIcon field="stock" />
              </th>
              <th className="text-right py-4 px-6 text-xs uppercase tracking-widest text-white/40 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-16 text-white/30">No products found.</td></tr>
            )}
            {filtered.map((product) => (
              <tr key={product.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {product.thumbnail && (
                      <div className="w-10 h-10 bg-primary rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                        <img src={product.thumbnail} alt={product.name} className="w-full h-full object-contain p-1" />
                      </div>
                    )}
                    <span className="text-white/90 line-clamp-1">{product.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-white/50 capitalize text-xs">{product.category}</span>
                </td>
                <td className="py-4 px-4 text-right text-white/90">₹{Number(product.price).toFixed(2)}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => adjustStock(product.id, -1, 'Manual Decrement')} className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white border border-white/10 hover:border-white/30 rounded-sm transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className={`text-sm font-medium w-8 text-center ${
                      product.stock === 0 ? 'text-red-400' : product.stock < 5 ? 'text-yellow-400' : 'text-white'
                    }`}>{product.stock}</span>
                    <button onClick={() => adjustStock(product.id, 1, 'Manual Increment')} className="w-6 h-6 flex items-center justify-center text-white/40 hover:text-white border border-white/10 hover:border-white/30 rounded-sm transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setAuditProduct(product)} className="p-1.5 text-white/30 hover:text-white transition-colors" title="Stock Audit">
                      <History className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setModalProduct(product); setShowModal(true); }} className="p-1.5 text-white/30 hover:text-white transition-colors" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm(product.id)} className="p-1.5 text-white/30 hover:text-red-400 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#111113] border border-white/10 rounded-sm p-8 max-w-sm w-full text-center">
              <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-light mb-2">Delete Product?</h3>
              <p className="text-white/40 text-sm mb-8">This cannot be undone.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border border-white/10 text-white/60 text-sm uppercase tracking-widest hover:border-white/30 transition-colors">Cancel</button>
                <button onClick={() => { deleteProduct(deleteConfirm); setDeleteConfirm(null); }} className="flex-1 py-3 bg-red-500 text-white text-sm font-medium uppercase tracking-widest hover:bg-red-600 transition-colors">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <ProductModal
            product={modalProduct}
            onClose={() => setShowModal(false)}
            onSave={(data) => modalProduct ? updateProduct(modalProduct.id, data) : addProduct(data)}
          />
        )}
        {auditProduct && (
          <StockAuditModal product={auditProduct} onClose={() => setAuditProduct(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
