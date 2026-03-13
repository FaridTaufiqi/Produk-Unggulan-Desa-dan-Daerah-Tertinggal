
import React, { useState } from 'react';
import { ExportProduct } from '../types';
import { Camera, Loader2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { storage, ref, uploadBytes, getDownloadURL } from '../firebase';

interface ExportProductInputGroupProps {
  index: number;
  product: ExportProduct;
  onChange: (index: number, field: keyof ExportProduct, value: any) => void;
  onRemove: (index: number) => void;
  showRemove: boolean;
}

export const ExportProductInputGroup: React.FC<ExportProductInputGroupProps> = ({ 
  index, product, onChange, onRemove, showRemove 
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("Ukuran file maksimal 50 MB");
      return;
    }

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `export_products/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      onChange(index, 'fotoUrl', url);
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Gagal mengunggah foto. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6 relative">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-slate-800">Produk Unggulan Ekspor #{index + 1}</h4>
        {showRemove && (
          <button 
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-600 text-xs font-bold hover:underline"
          >
            Hapus Produk
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Nama Produk Unggulan Ekspor</label>
          <input 
            type="text"
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            value={product.nama}
            onChange={(e) => onChange(index, 'nama', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Apakah Produk Unggulan Desa Sudah Pernah di Ekspor?</label>
          <select 
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            value={product.statusEkspor}
            onChange={(e) => onChange(index, 'statusEkspor', e.target.value as any)}
            required
          >
            <option value="Sudah">Sudah</option>
            <option value="Belum">Belum</option>
          </select>
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-slate-700">Deskripsi Produk Unggulan Ekspor</label>
          <textarea 
            rows={3}
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            value={product.deskripsi}
            onChange={(e) => onChange(index, 'deskripsi', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Foto Produk (Maksimal 50 MB)</label>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className={`w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${product.fotoUrl ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                {product.fotoUrl ? (
                  <img src={product.fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="text-slate-300" size={24} />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="animate-spin text-red-600" size={20} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-all shadow-sm">
                <Camera size={14} className="text-red-600" />
                {product.fotoUrl ? 'Ganti Foto' : 'Unggah Foto'}
                <input 
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
              {product.fotoUrl && (
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase">
                  <CheckCircle size={10} />
                  Berhasil Diunggah
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Negara Tujuan Ekspor atau Potensi Tujuan Ekspor</label>
          <input 
            type="text"
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            value={product.negaraTujuan}
            onChange={(e) => onChange(index, 'negaraTujuan', e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-slate-700">Jelaskan Peran BUM Desa/BUM Desa bersama terkait Kegiatan Ekspor di Desa</label>
          <textarea 
            rows={2}
            placeholder="Contoh : BUMDes sebagai offtaker, BUMDes sebagai konsolidator"
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            value={product.peranBumdes}
            onChange={(e) => onChange(index, 'peranBumdes', e.target.value)}
            required
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-semibold text-slate-700">Volume atau Kuantitas Produk Unggulan yang Sudah di Ekspor</label>
          <textarea 
            rows={2}
            placeholder="Contoh: Bulan Maret 2024 : 2 ton telur ayam, Bulan April 2024 : 3 ton telur ayam, apabila belum pernah diekspor bisa diberi jawa strip (-)"
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            value={product.volumeEkspor}
            onChange={(e) => onChange(index, 'volumeEkspor', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Nama Offtaker Ekspor (Jika ada)</label>
          <input 
            type="text"
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            value={product.namaOfftaker}
            onChange={(e) => onChange(index, 'namaOfftaker', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Jelaskan Peran Offtaker pada Kegiatan Ekspor</label>
          <textarea 
            rows={2}
            placeholder="Contoh: PT Taufiqi-Perusahaan Forwarder yang membantu melakukan ekspor, dsb"
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            value={product.peranOfftaker}
            onChange={(e) => onChange(index, 'peranOfftaker', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
