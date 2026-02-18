
import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="relative bg-white py-16 lg:py-24 overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-red-50 -skew-x-12 transform translate-x-1/2 -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-8">
            <div>
              <span className="inline-block px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
                Pendataan Digital 2024
              </span>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                Mari Bangun <br />
                <span className="text-red-600">Kedaulatan Ekonomi</span> <br />
                dari Desa.
              </h1>
              <p className="mt-6 text-lg text-slate-600 max-w-xl">
                Identifikasi dan kembangkan potensi terbaik desa Anda untuk pasar global. Platform resmi untuk pendataan Produk Unggulan Desa (Prudes) di seluruh wilayah Indonesia.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl hover:shadow-red-200 active:scale-95"
              >
                Mulai Isi Formulir
              </button>
              <button className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all">
                Lihat Statistik
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} className="w-10 h-10 rounded-full border-2 border-white" src={`https://picsum.photos/100/100?random=${i}`} alt="user" />
                ))}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                <span className="text-slate-900 font-bold">12,400+</span> Desa telah terdaftar
              </p>
            </div>
          </div>

          <div className="mt-12 lg:mt-0 relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://picsum.photos/800/600?nature,village" 
                alt="Indonesian Village Potential" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <div className="text-white">
                  <p className="text-sm font-medium opacity-80">Produk Unggulan Bulan Ini</p>
                  <p className="text-2xl font-bold">Kopi Robusta Pegunungan Dieng</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg z-20 hidden md:block border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Verifikasi Data</p>
                  <p className="text-sm font-bold">Otomatis & Real-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
