import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProducts } from '../../lib/productsDB';

const AdminContext = createContext();
export const useAdmin = () => useContext(AdminContext);

const loadBills = () => {
  try {
    const data = localStorage.getItem('admin_bills');
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const saveBills = (bills) => {
  try { localStorage.setItem('admin_bills', JSON.stringify(bills)); }
  catch (e) { console.error('Storage error:', e); }
};

export const AdminProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [bills, setBills] = useState(() => loadBills());
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const load = async () => {
      setSeeding(true);
      const all = await getProducts({ limit: 100 });
      setProducts(all);
      setSeeding(false);
    };
    load();
  }, []);

  // Persist bills
  useEffect(() => {
    saveBills(bills);
  }, [bills]);

  // --- Product CRUD ---
  const addProduct = (productData) => {
    const newProduct = {
      id: generateId(),
      name: productData.name,
      title: productData.name,
      category: productData.category,
      price: Number(productData.price),
      stock: Number(productData.stock),
      thumbnail: productData.thumbnail || '',
      images: productData.thumbnail ? [productData.thumbnail] : [],
      description: productData.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stockAudit: [{ action: 'Initial Stock', delta: Number(productData.stock), timestamp: new Date().toISOString() }],
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id, updates) => {
    setProducts(prev => prev.map(p =>
      p.id === id
        ? {
            ...p,
            ...updates,
            name: updates.name || p.name,
            title: updates.name || p.title,
            price: Number(updates.price || p.price),
            stock: updates.stock !== undefined ? Number(updates.stock) : p.stock,
            updatedAt: new Date().toISOString(),
          }
        : p
    ));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const adjustStock = (id, delta, reason = 'Manual Adjustment') => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newStock = Math.max(0, p.stock + delta);
      return {
        ...p,
        stock: newStock,
        updatedAt: new Date().toISOString(),
        stockAudit: [
          { action: reason, delta, newStock, timestamp: new Date().toISOString() },
          ...(p.stockAudit || []),
        ].slice(0, 20),
      };
    }));
  };

  // --- Billing ---
  const createBill = (billData) => {
    const newBill = {
      id: `BILL-${generateId().toUpperCase()}`,
      ...billData,
      date: new Date().toISOString(),
      gst: billData.subtotal * 0.18,
      total: billData.subtotal * 1.18,
    };
    setBills(prev => [newBill, ...prev]);

    // Reduce stock for each item in the bill
    billData.items.forEach(item => {
      adjustStock(item.productId, -item.quantity, `Sold — Bill #${newBill.id}`);
    });

    return newBill;
  };

  // --- Derived Stats ---
  const stats = {
    totalProducts: products.length,
    totalInventoryValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
    lowStockProducts: products.filter(p => p.stock < 5).length,
    totalBills: bills.length,
    todayBills: bills.filter(b => new Date(b.date).toDateString() === new Date().toDateString()).length,
    todayRevenue: bills
      .filter(b => new Date(b.date).toDateString() === new Date().toDateString())
      .reduce((sum, b) => sum + b.total, 0),
    totalRevenue: bills.reduce((sum, b) => sum + b.total, 0),
  };

  return (
    <AdminContext.Provider value={{
      products,
      bills,
      stats,
      seeding,
      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,
      createBill,
    }}>
      {children}
    </AdminContext.Provider>
  );
};
