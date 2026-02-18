
import React from 'react';

interface SubmissionSuccessProps {
  id: string;
  onReset: () => void;
}

export const SubmissionSuccess: React.FC<SubmissionSuccessProps> = ({ id, onReset }) => {
  return (
    <div className="py-20 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Berhasil Terkirim!</h2>
        <p className="text-slate-500 mb-8">
          Terima kasih telah berpartisipasi dalam program pendataan Produk Unggulan Desa. Data Anda sedang dalam proses verifikasi.
        </p>
        
        <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">ID Pendaftaran Anda</p>
          <p className="text-2xl font-mono font-bold text-red-600">{id}</p>
        </div>
        
        <div className="space-y-4">
          <button 
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            onClick={() => window.print()}
          >
            Cetak Tanda Terima
          </button>
          <button 
            className="w-full bg-white text-slate-600 border border-slate-200 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all"
            onClick={onReset}
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
};
