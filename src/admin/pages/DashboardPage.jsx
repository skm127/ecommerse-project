import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { motion } from 'framer-motion';
import { Package, Receipt, TrendingUp, AlertTriangle, IndianRupee, ShoppingBag } from 'lucide-react';

function StatCard({ title, value, sub, icon: Icon, color = 'text-white', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-secondary border border-white/5 rounded-sm p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs uppercase tracking-widest text-white/40">{title}</p>
        <Icon className={`w-4 h-4 ${color} opacity-60`} />
      </div>
      <p className={`text-3xl font-light ${color} mb-1`}>{value}</p>
      {sub && <p className="text-xs text-white/30">{sub}</p>}
    </motion.div>
  );
}

export default function DashboardPage() {
  const { stats, bills, products } = useAdmin();

  const recentBills = bills.slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-light text-white tracking-tight">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Overview of your store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          sub={`${stats.lowStockProducts} low on stock`}
          icon={Package}
          delay={0}
        />
        <StatCard
          title="Inventory Value"
          value={`₹${stats.totalInventoryValue.toFixed(0)}`}
          sub="Based on current stock & prices"
          icon={IndianRupee}
          delay={0.1}
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStockProducts}
          sub="Products with stock < 5"
          icon={AlertTriangle}
          color={stats.lowStockProducts > 0 ? 'text-yellow-400' : 'text-white'}
          delay={0.2}
        />
        <StatCard
          title="Today's Bills"
          value={stats.todayBills}
          sub={`${stats.totalBills} total all time`}
          icon={Receipt}
          delay={0.3}
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${stats.todayRevenue.toFixed(2)}`}
          sub="Including GST"
          icon={TrendingUp}
          color="text-green-400"
          delay={0.4}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toFixed(2)}`}
          sub="All time"
          icon={ShoppingBag}
          delay={0.5}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Bills */}
        <div className="bg-secondary border border-white/5 rounded-sm p-6">
          <h2 className="text-sm uppercase tracking-widest text-white mb-6">Recent Bills</h2>
          {recentBills.length === 0 ? (
            <p className="text-white/30 text-sm py-8 text-center">No bills yet. Create your first bill!</p>
          ) : (
            <div className="space-y-3">
              {recentBills.map(bill => (
                <div key={bill.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm text-white/90">{bill.customerName}</p>
                    <p className="text-xs text-white/30">{bill.id} · {new Date(bill.date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white font-medium">₹{bill.total.toFixed(2)}</p>
                    <p className="text-xs text-white/30">{bill.items.length} item{bill.items.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="bg-secondary border border-white/5 rounded-sm p-6">
          <h2 className="text-sm uppercase tracking-widest text-white mb-6">Low Stock Alerts</h2>
          {products.filter(p => p.stock < 10).length === 0 ? (
            <p className="text-white/30 text-sm py-8 text-center">All products are well stocked!</p>
          ) : (
            <div className="space-y-3">
              {products.filter(p => p.stock < 10).slice(0, 6).map(p => (
                <div key={p.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm text-white/90 line-clamp-1">{p.name}</p>
                    <p className="text-xs text-white/30 capitalize">{p.category}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-sm border ${
                    p.stock === 0
                      ? 'text-red-400 border-red-400/20 bg-red-400/5'
                      : p.stock < 5
                      ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5'
                      : 'text-orange-400 border-orange-400/20 bg-orange-400/5'
                  }`}>
                    {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
