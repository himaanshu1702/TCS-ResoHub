import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api'; 
import { ShieldCheck, Zap, Loader } from 'lucide-react';

// --- WAVY X COMPONENT ---
const WavyX = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M5 5C9 5 15 19 19 19" 
      stroke="url(#gradLogin1)" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
    />
    <path 
      d="M5 19C9 19 15 5 19 5" 
      stroke="url(#gradLogin2)" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
    />
    <defs>
      <linearGradient id="gradLogin1" x1="5" y1="5" x2="19" y2="19" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E83D98" />
        <stop offset="1" stopColor="#5F259F" />
      </linearGradient>
      <linearGradient id="gradLogin2" x1="5" y1="19" x2="19" y2="5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#5F259F" />
        <stop offset="1" stopColor="#E83D98" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      login(response.data.user, response.data.token);
      navigate('/portal');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication Failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-reso-pale">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-reso-peach/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-reso-royal/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* THE 'group' CONTAINER */}
      <div className="group flex flex-col items-center w-full max-w-md z-10">
        
        {/* 1. BRANDING HEADER */}
        <div className="text-center space-y-2 mb-8 animate-fade-in cursor-default">
          <div className="flex items-center justify-center gap-4 md:gap-6">
            <h1 className="text-4xl md:text-5xl font-bold text-tcs-brand tracking-tighter drop-shadow-sm">TCS</h1>
            
            {/* THE WAVY X 
               - Rotates 180 degrees (half turn) when hovered 
               - Duration is 1s for a snappy effect
            */}
            <div className="transform transition-transform duration-1000 ease-in-out group-hover:rotate-180">
              <WavyX />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-reso-deep tracking-tight drop-shadow-sm">ResoHub</h1>
          </div>
          <p className="text-lg md:text-xl text-reso-mauve font-medium tracking-wide mt-4">
            Smart Access to Structured Learning
          </p>
        </div>

        {/* 2. GLASS LOGIN CARD */}
        <div className="glass-panel w-full p-8 rounded-3xl animate-fade-in shadow-2xl border border-white/60 bg-white/40 backdrop-blur-xl transition-all duration-500 hover:shadow-reso-royal/10">
          <div className="flex justify-center mb-6">
            <div className="bg-white/60 p-4 rounded-full shadow-inner">
              <ShieldCheck size={48} className="text-reso-royal" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-reso-deep mb-2">Associate Login</h2>
          <p className="text-center text-reso-mauve mb-6 text-sm">
            Please authenticate with your Corporate ID
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100/80 border border-red-200 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-reso-deep ml-1 uppercase tracking-wider">Corporate Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-white/60 border border-white/50 rounded-xl px-4 text-reso-deep focus:outline-none focus:ring-2 focus:ring-reso-royal/50 transition-all placeholder:text-gray-400"
                placeholder="e.g. rahul.v@tcs.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-reso-deep ml-1 uppercase tracking-wider">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-white/60 border border-white/50 rounded-xl px-4 text-reso-deep focus:outline-none focus:ring-2 focus:ring-reso-royal/50 transition-all placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-reso-royal text-white font-semibold rounded-xl hover:bg-reso-dark transition-all shadow-lg hover:shadow-reso-royal/30 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : <Zap size={20} />}
              {loading ? 'Authenticating...' : 'Secure Access'}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/30 pt-4 space-y-2">
            <p className="text-xs text-reso-mauve/80 uppercase tracking-widest">
              Powered by TCS AI Engine
            </p>
            {/* INCREASED FONT SIZE HERE (text-xs instead of text-[10px]) */}
            <p className="text-xs text-reso-mauve/80">
              © 2026 Tata Consultancy Services Limited. All Rights Reserved.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}