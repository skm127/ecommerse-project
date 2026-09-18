import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();
export const useAdmin = () => useContext(AdminContext);

// --- Helper to generate a UUID without the `uuid` package ---
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

const loadFromStorage = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error:', e);
  }
};

export const AdminProvider = ({ children }) => {
  const [products, setProducts] = useState(() => loadFromStorage('admin_products', []));
  const [bills, setBills] = useState(() => loadFromStorage('admin_bills', []));
  const [seeded, setSeeded] = useState(() => !!localStorage.getItem('admin_seeded'));

  // Seed products from DummyJSON on first load
  useEffect(() => {
    if (!seeded) {
      fetch('https://dummyjson.com/products?limit=30')
        .then(res => res.json())
        .then(data => {
          const seededProducts = data.products.map(p => ({
            id: generateId(),
            name: p.title,
            category: p.category,
            price: p.price,
            stock: p.stock || Math.floor(Math.random() * 100) + 10,
            thumbnail: p.thumbnail,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            stockAudit: [],
          }));
          setProducts(seededProducts);
          saveToStorage('admin_products', seededProducts);
          localStorage.setItem('admin_seeded', 'true');
          setSeeded(true);
        })
        .catch(() => {});
    }
  }, [seeded]);

  // Persist products whenever they change
  useEffect(() => {
    saveToStorage('admin_products', products);
  }, [products]);

  // Persist bills whenever they change
  useEffect(() => {
    saveToStorage('admin_bills', bills);
  }, [bills]);

  // --- Product CRUD ---
  const addProduct = (productData) => {
    const newProduct = {
      id: generateId(),
      ...productData,
      price: Number(productData.price),
      stock: Number(productData.stock),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stockAudit: [{ action: 'Initial Stock', delta: Number(productData.stock), timestamp: new Date().toISOString() }],
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id, updates) => {
    setProducts(prev => prev.map(p =>
      p.id === id
        ? { ...p, ...updates, price: Number(updates.price || p.price), updatedAt: new Date().toISOString() }
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
        ].slice(0, 20), // Keep last 20 audit entries
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
      adjustStock(item.productId, -item.quantity, `Sold (Bill #${newBill.id})`);
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
