
import React from 'react';

export const Header: React.FC = () => {
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
          <button className="bg-red-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-all shadow-md hover:shadow-lg active:scale-95">
            Login Petugas
          </button>
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
