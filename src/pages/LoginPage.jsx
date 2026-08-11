import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { motion } from 'framer-motion';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('emilys'); // Pre-fill with a valid dummy user
  const [password, setPassword] = useState('emilyspass');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const showToast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (isLogin) {
      const result = await login(username, password);
      setLoading(false);
      
      if (result.success) {
        showToast('Successfully logged in!');
        navigate('/');
      } else {
        setErrorMsg(result.error || 'Invalid credentials.');
      }
    } else {
      // DummyJSON doesn't actually register users, so we mock registration success
      setTimeout(() => {
        showToast('Registration simulation complete! Please login.');
        setIsLogin(true);
        setLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="bg-primary min-h-screen flex items-center justify-center p-6 pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <Link to="/" className="inline-block mb-8 text-xl font-medium tracking-widest uppercase text-white hover:text-white/70 transition-colors">
            SKM<span className="text-white/40"> CART</span>
          </Link>
          <h2 className="text-3xl font-light text-white mb-2 tracking-tight">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-sm text-white/40">
            {isLogin
              ? 'Hint: use emilys / emilyspass to test login.'
              : 'Registration is simulated for this demo.'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-sm mb-6 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-transparent border-b border-white/10 px-0 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border-b border-white/10 px-0 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          {isLogin && (
            <div className="flex justify-between items-center text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-white/50 hover:text-white transition-colors">
                <input type="checkbox" className="accent-white rounded-sm bg-transparent border-white/20" />
                <span>Remember me</span>
              </label>
              <button type="button" className="text-white/50 hover:text-white transition-colors">
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-primary py-4 mt-8 font-medium text-sm uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>

        <div className="mt-12 text-center text-sm text-white/40 border-t border-white/5 pt-8">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-white hover:text-white/70 transition-colors border-b border-white pb-0.5"
          >
            {isLogin ? 'Create one' : 'Sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;
