/**
 * Shared Products Database
 * Single source of truth for both the storefront and admin panel.
 * Seeds from DummyJSON on first load, then all reads/writes go to localStorage.
 */

const PRODUCTS_KEY = 'admin_products';
const SEEDED_KEY = 'admin_seeded';

import { API_URL, getAuthHeaders } from './api';

export const getProducts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  try {
    const res = await fetch(`${API_URL}/products?${query}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return data.products || [];
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/products/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Error fetching product:', err);
    return null;
  }
};

export const getCategories = async () => {
  try {
    const res = await fetch(`${API_URL}/products/categories`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
};
