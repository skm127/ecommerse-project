/**
 * Shared Products Database
 * Single source of truth for both the storefront and admin panel.
 * Seeds from DummyJSON on first load, then all reads/writes go to localStorage.
 */

const PRODUCTS_KEY = 'admin_products';
const SEEDED_KEY = 'admin_seeded';

export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

export const getProducts = () => {
  try {
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getProductById = (id) => {
  const products = getProducts();
  // id from URL params is a string, admin ids are custom strings, DummyJSON ids are numbers
  return products.find(p => String(p.id) === String(id) || p.originalId === Number(id));
};

export const saveProducts = (products) => {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products:', e);
  }
};

export const isSeeded = () => !!localStorage.getItem(SEEDED_KEY);

export const seedFromAPI = async () => {
  if (isSeeded()) return getProducts();

  try {
    const [prodRes, catRes] = await Promise.all([
      fetch('https://dummyjson.com/products?limit=50'),
      fetch('https://dummyjson.com/products/categories'),
    ]);
    const prodData = await prodRes.json();

    const seededProducts = prodData.products.map(p => ({
      id: generateId(),
      originalId: p.id, // keep original DummyJSON id for single product fetch fallback
      name: p.title,
      title: p.title,
      category: p.category,
      price: p.price,
      stock: p.stock || Math.floor(Math.random() * 100) + 10,
      thumbnail: p.thumbnail,
      images: p.images || [p.thumbnail],
      description: p.description,
      brand: p.brand,
      rating: p.rating,
      sku: p.sku,
      weight: p.weight,
      discountPercentage: p.discountPercentage,
      shippingInformation: p.shippingInformation,
      returnPolicy: p.returnPolicy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stockAudit: [{ action: 'Initial Stock', delta: p.stock || 50, timestamp: new Date().toISOString() }],
    }));

    saveProducts(seededProducts);
    localStorage.setItem(SEEDED_KEY, 'true');
    return seededProducts;
  } catch (e) {
    console.error('Seeding failed:', e);
    return [];
  }
};
