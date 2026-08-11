import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle2, Check, ArrowRight } from 'lucide-react';

function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || 'SKM-DEFAULT';
  const [currentStep, setCurrentStep] = useState(1);

  // Simulate order progress over time for demo purposes
  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(2), 2000);
    const timer2 = setTimeout(() => setCurrentStep(3), 5000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const steps = [
    { id: 1, title: 'Order Confirmed', description: 'We have received your order.', icon: CheckCircle2 },
    { id: 2, title: 'Processing', description: 'Your items are being packed.', icon: Package },
    { id: 3, title: 'Shipped', description: 'Handed over to delivery partner.', icon: Truck },
    { id: 4, title: 'Delivered', description: 'Estimated in 2-4 business days.', icon: Check },
  ];

  return (
    <div className="bg-primary min-h-screen py-24">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-light text-white mb-4 tracking-tight"
          >
            Thank you for your order
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/60"
          >
            Your order <span className="text-white font-medium">#{orderId}</span> has been placed successfully.
            We'll send you an email confirmation shortly.
          </motion.p>
        </div>

        <div className="bg-secondary border border-white/5 p-8 md:p-12 rounded-sm mb-12">
          <h2 className="text-xl font-light text-white mb-10">Order Status</h2>
          
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10 hidden md:block" />
            
            <div className="space-y-12">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = currentStep >= step.id;
                const isCurrent = currentStep === step.id;
                
                return (
                  <div key={step.id} className="relative flex items-start gap-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-500 ${
                        isCompleted 
                          ? 'bg-white text-primary' 
                          : 'bg-primary border border-white/20 text-white/40'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {isCurrent && (
                        <motion.div 
                          layoutId="pulse"
                          className="absolute inset-0 border-2 border-white rounded-full animate-ping opacity-50"
                        />
                      )}
                    </motion.div>
                    
                    <div className="pt-2">
                      <h4 className={`text-lg font-medium transition-colors duration-500 ${
                        isCompleted ? 'text-white' : 'text-white/40'
                      }`}>
                        {step.title}
                      </h4>
                      <p className={`text-sm mt-1 transition-colors duration-500 ${
                        isCompleted ? 'text-white/70' : 'text-white/30'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-white border-b border-white pb-1 hover:text-white/70 hover:border-white/70 transition-all"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderTrackingPage;
