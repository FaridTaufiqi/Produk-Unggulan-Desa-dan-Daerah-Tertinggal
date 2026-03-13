
import React from 'react';
import { User, auth, signInWithPopup, googleProvider } from '../firebase';
import { UserProfile } from '../types';

interface HeaderProps {
  onDashboardClick: () => void;
  user: User | null;
  userProfile: UserProfile | null;
}

export const Header: React.FC<HeaderProps> = ({ onDashboardClick, user, userProfile }) => {
  const [loginLoading, setLoginLoading] = React.useState(false);

  const handleLogin = async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login Error: ", error);
      if (error.code === 'auth/popup-blocked') {
        alert("Popup diblokir oleh browser. Silakan izinkan popup untuk login.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/a/ae/Kemendes_Logo_%282015%29.png" 
              alt="Logo Kemendes" 
              className="w-full h-auto object-contain"
            />
          </div>
          <div className="border-l border-slate-200 pl-3 h-10 flex flex-col justify-center">
            <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">Bangun<span className="text-red-600">Desa</span></span>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold leading-none mt-1">Bangun Indonesia</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">Beranda</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">Panduan</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">Kontak</a>
          
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
              onClick={handleLogin}
              disabled={loginLoading}
              className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {loginLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ...
                </>
              ) : (
                <>Login Petugas</>
              )}
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
