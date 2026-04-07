
import React from 'react';
import { ShieldCheck, Home, ArrowRight, AlertCircle, RefreshCw, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginChoiceProps {
  onLogin: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

export const LoginChoice: React.FC<LoginChoiceProps> = ({ onLogin, onBack, loading, error }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-2xl shadow-xl shadow-red-200 mb-6"
          >
            <LogIn size={32} />
          </motion.div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Pintu Masuk Sistem</h2>
          <p className="text-slate-500">Silakan pilih jenis akses Anda untuk melanjutkan ke dashboard.</p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-center gap-3 overflow-hidden"
            >
              <AlertCircle size={20} className="shrink-0" />
              <p className="font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin Choice */}
          <motion.button
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogin}
            disabled={loading}
            className="group relative bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-red-600 hover:shadow-2xl hover:shadow-red-100 transition-all duration-300 text-left overflow-hidden disabled:opacity-50"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck size={120} />
            </div>
            
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
              <ShieldCheck size={28} />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">Admin Kementerian</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Akses khusus petugas pusat untuk monitoring data nasional, statistik, dan manajemen backlog.
            </p>
            
            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
              {loading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </motion.button>

          {/* Desa Choice */}
          <motion.button
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLogin}
            disabled={loading}
            className="group relative bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300 text-left overflow-hidden disabled:opacity-50"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Home size={120} />
            </div>

            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <Home size={28} />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">Petugas Desa</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Akses untuk melihat riwayat pendaftaran lembaga ekonomi desa dan memperbarui data lokal.
            </p>
            
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              {loading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </motion.button>
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-medium transition-colors"
          >
            Batal dan Kembali ke Beranda
          </button>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 pt-8 border-t border-slate-200 flex flex-col items-center"
          >
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Metode Autentikasi Aman</p>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
              <img src="https://images.unsplash.com/photo-1596434300655-e48d3ff3dd5e?q=80&w=2000&auto=format&fit=crop" alt="Google" className="w-4 h-4 object-cover rounded-full" />
              <span className="text-xs font-medium text-slate-600">Single Sign-On via Google Workspace</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
