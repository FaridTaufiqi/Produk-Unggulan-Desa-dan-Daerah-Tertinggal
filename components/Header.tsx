
import React from 'react';
import { User, auth, signInWithPopup, googleProvider } from '../firebase';
import { UserProfile } from '../types';

interface HeaderProps {
  onDashboardClick: () => void;
  onHomeClick: () => void;
  user: User | null;
  userProfile: UserProfile | null;
}

export const Header: React.FC<HeaderProps> = ({ onDashboardClick, onHomeClick, user, userProfile }) => {
  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Logout Error: ", error);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onHomeClick}
        >
          <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-110">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/a/ae/Kemendes_Logo_%282015%29.png" 
              alt="Logo Kemendes" 
              className="w-full h-auto object-contain"
            />
          </div>
          <div className="border-l border-slate-200 pl-3 h-10 flex flex-col justify-center">
            <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">Bangun Desa <span className="text-red-600">Bangun Indonesia</span></span>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.1em] font-bold leading-none mt-1">Desa Terdepan Untuk Indonesia</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <button onClick={onHomeClick} className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">Beranda</button>
          <a href="#form-section" onClick={(e) => {
            if (window.location.pathname !== '/') {
              onHomeClick();
            }
          }} className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">Isi Formulir</a>
          
          {user ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={onDashboardClick}
                className="bg-red-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                {(userProfile?.role === 'admin' || user?.email === 'faridtaufiqibusiness@gmail.com') ? 'Statistik & Backlog' : 'Dashboard Desa'}
              </button>
              <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-none">{user.displayName}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">
                    {(userProfile?.role === 'admin' || user?.email === 'faridtaufiqibusiness@gmail.com') ? 'admin' : 'desa'}
                  </p>
                </div>
                <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-slate-200" />
                <button onClick={handleLogout} className="text-xs font-bold text-slate-500 hover:text-red-600">Logout</button>
              </div>
            </div>
          ) : (
            <button 
              onClick={onDashboardClick}
              className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
            >
              Login Dashboard
            </button>
          )}
        </nav>

        <button className="md:hidden p-2 text-slate-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </header>
  );
};
