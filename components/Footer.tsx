
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded p-1 flex items-center justify-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/a/ae/Kemendes_Logo_%282015%29.png" 
                  alt="Logo Kemendes" 
                  className="w-full h-auto object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white leading-none">Bangun<span className="text-red-600">Desa</span></span>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-1">Bangun Indonesia</span>
              </div>
            </div>
            <p className="max-w-md text-slate-400">
              Platform Pendataan Digital Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi Republik Indonesia. Berkolaborasi untuk memajukan ekonomi kerakyatan melalui Prudes.
            </p>
            <div className="flex gap-4">
              {['facebook', 'twitter', 'instagram', 'youtube'].map(icon => (
                <a key={icon} href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 transition-colors">
                  <span className="sr-only">{icon}</span>
                  <div className="w-5 h-5 border border-white/20 rounded-sm"></div>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Tautan Penting</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-red-500 transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Bantuan Teknis</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Data Transparansi</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Hubungi Kami</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>Jl. Abdul Muis No. 7, Jakarta Pusat, DKI Jakarta 10110</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@kemendesa.go.id</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© 2024 BangunDesa - Kemendesa PDTT. Seluruh Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  );
};
