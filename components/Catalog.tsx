
import React, { useState, useEffect } from 'react';
import { db, collection, onSnapshot, query, orderBy, handleFirestoreError, OperationType } from '../firebase';
import { CatalogProduct } from '../types';
import { Search, MapPin, Tag, ArrowRight, Filter, X, Building2, Info, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Catalog: React.FC = () => {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'catalog'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as CatalogProduct[];
      setProducts(data);
      setLoading(false);
      setError(null);
    }, (err) => {
      setLoading(false);
      setError("Gagal memuat katalog. Pastikan koneksi internet stabil.");
      try {
        handleFirestoreError(err, OperationType.LIST, 'catalog');
      } catch (e) {
        // Error already logged by handleFirestoreError
      }
    });
    return () => unsubscribe();
  }, []);

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.desa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kabupaten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.provinsi.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Search & Filter Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Cari produk, desa, atau daerah..."
                className="w-full pl-12 pr-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-red-500 rounded-2xl outline-none transition-all text-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
              <button 
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${!selectedCategory ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                Semua Produk
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Katalog Produk Unggulan</h2>
            <p className="text-slate-500 mt-1">Menampilkan {filteredProducts.length} produk dari seluruh Indonesia</p>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
            <Info size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 animate-pulse">
                <div className="aspect-square bg-slate-100 rounded-2xl mb-4"></div>
                <div className="h-6 bg-slate-100 rounded-full w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 cursor-pointer flex flex-col"
              >
                <div className="aspect-square overflow-hidden relative bg-slate-100">
                  {product.fotoUrl ? (
                    <img 
                      src={product.fotoUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ShoppingBag size={48} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                      {product.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-red-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <MapPin size={14} className="text-red-500" />
                      <span className="line-clamp-1">{product.desa}, {product.kabupaten}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <Building2 size={14} className="text-blue-500" />
                      <span className="line-clamp-1">{product.namaLembaga}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail Produk</span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center transition-all">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Produk tidak ditemukan</h3>
            <p className="text-slate-500 mt-2">Coba gunakan kata kunci lain atau hapus filter kategori.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory(null); }}
              className="mt-6 text-red-600 font-bold hover:underline"
            >
              Reset Pencarian
            </button>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-900 shadow-lg hover:bg-white transition-all"
              >
                <X size={20} />
              </button>

              <div className="w-full md:w-1/2 bg-slate-100 relative">
                {selectedProduct.fotoUrl ? (
                  <img 
                    src={selectedProduct.fotoUrl} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ShoppingBag size={80} />
                  </div>
                )}
              </div>

              <div className="w-full md:w-1/2 p-8 sm:p-12 overflow-y-auto">
                <div className="mb-8">
                  <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider rounded-full mb-4 inline-block">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">{selectedProduct.name}</h2>
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={16} className="text-red-500" />
                    <span className="text-sm font-medium">{selectedProduct.desa}, {selectedProduct.kabupaten}, {selectedProduct.provinsi}</span>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Info size={14} />
                      Deskripsi Produk
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                      {selectedProduct.deskripsi || 'Tidak ada deskripsi tersedia untuk produk ini.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Kapasitas Produksi</h4>
                      <p className="text-slate-900 font-bold">{selectedProduct.kapasitasBulanan || '-'}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-tight">Per Bulan</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Lembaga Pengelola</h4>
                      <p className="text-slate-900 font-bold">{selectedProduct.namaLembaga}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-tight">BUM Desa / Koperasi</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Legalitas & Sertifikasi</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.legalitas && selectedProduct.legalitas.length > 0 ? (
                        selectedProduct.legalitas.map(leg => (
                          <span key={leg} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100">
                            {leg}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs italic">Belum ada data legalitas</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100">
                  <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2">
                    Hubungi Pengelola
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
