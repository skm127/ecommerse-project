export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getAuthHeaders = () => {
  const userStr = localStorage.getItem('shophub_user');
  if (!userStr) return {};
  try {
    const user = JSON.parse(userStr);
    return user.token ? { Authorization: `Bearer ${user.token}` } : {};
  } catch {
    return {};
  }
};
