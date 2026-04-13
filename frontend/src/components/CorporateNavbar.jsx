import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Bell } from 'lucide-react';

// --- CUSTOM WAVY X COMPONENT ---
const WavyX = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-2">
    {/* Curve 1: Top-Left to Bottom-Right */}
    <path 
      d="M5 5C9 5 15 19 19 19" 
      stroke="url(#grad1)" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
    />
    {/* Curve 2: Bottom-Left to Top-Right */}
    <path 
      d="M5 19C9 19 15 5 19 5" 
      stroke="url(#grad2)" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
    />
    
    {/* Gradient Definitions */}
    <defs>
      <linearGradient id="grad1" x1="5" y1="5" x2="19" y2="19" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E83D98" /> {/* TCS Pink */}
        <stop offset="1" stopColor="#5F259F" /> {/* Royal Purple */}
      </linearGradient>
      <linearGradient id="grad2" x1="5" y1="19" x2="19" y2="5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#5F259F" />
        <stop offset="1" stopColor="#E83D98" />
      </linearGradient>
    </defs>
  </svg>
);

export default function CorporateNavbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/90">
      
      {/* 1. Logo Section with Wavy X */}
      <div 
        className="flex items-center cursor-pointer group select-none" 
        onClick={() => navigate('/portal')}
      >
        <span className="text-2xl font-bold text-reso-royal font-display tracking-tight group-hover:text-reso-deep transition-colors">
          TCS
        </span>
        
        {/* The Beautiful Wavy X Icon */}
        <div className="transform group-hover:scale-110 group-hover:rotate-180 transition-all duration-700 ease-in-out">
          <WavyX />
        </div>

        <span className="text-2xl font-bold text-reso-deep font-display tracking-tight group-hover:text-reso-royal transition-colors">
          ResoHub
        </span>
      </div>

      {/* 2. Right Side: User Profile */}
      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition group">
          <Bell size={20} className="text-reso-mauve group-hover:text-reso-royal transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="text-right hidden md:block leading-tight">
            <p className="text-sm font-bold text-reso-deep">{user?.name || 'User'}</p>
            <p className="text-[10px] uppercase font-bold tracking-wider text-reso-mauve">
              {user?.role} • {user?.emp_id}
            </p>
          </div>
          
          <div className="h-10 w-10 bg-gradient-to-br from-reso-royal to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white ring-2 ring-purple-50">
            <User size={18} />
          </div>
          
          <button 
            onClick={handleLogout}
            className="ml-2 p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}