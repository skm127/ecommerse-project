import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="container mx-auto px-5 py-24 text-center">
      <div className="relative inline-block mb-8 animate-float">
        <div className="text-[160px] leading-none font-extrabold text-gradient">
          404
        </div>
        <div className="absolute -top-4 -right-8 text-6xl">😕</div>
        <div className="absolute -bottom-2 -left-10 text-4xl">🛍️</div>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
        Oops! Page Not Found
      </h2>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
        Let's get you back to shopping!
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-accent-light hover:shadow-xl hover:shadow-accent/30 transition-all duration-300 hover:-translate-y-0.5"
        >
          ← Back to Home
        </Link>
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 bg-surface text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-700 border border-gray-700 transition-colors"
        >
          View Cart
        </Link>
      </div>

      {/* Popular categories */}
      <div className="mt-16">
        <p className="text-sm text-gray-500 mb-4 uppercase tracking-widest">
          Popular Categories
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {['Electronics', 'Fashion', 'Home', 'Sports'].map((cat) => (
            <Link
              key={cat}
              to="/"
              className="px-6 py-2.5 bg-surface border border-gray-700 rounded-full text-sm font-medium text-gray-300 hover:border-accent hover:text-accent transition-colors shadow-sm"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
