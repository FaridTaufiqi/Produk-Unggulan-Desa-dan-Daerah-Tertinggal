
import React, { useState, useCallback } from 'react';
import { FormState, LembagaEkonomiType, VillageProduct } from '../types';
import { ProductInputGroup } from './ProductInputGroup';
import { GoogleGenAI } from '@google/genai';

interface RegistrationFormProps {
  onSuccess: (id: string) => void;
}

const initialProduct: VillageProduct = { name: '', profileFile: null };

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    kodeProvinsi: '',
    provinsi: '',
    kodeKabupaten: '',
    kabupaten: '',
    kodeKecamatan: '',
    kecamatan: '',
    kodeDesa: '',
    desa: '',
    lembagaEkonomi: LembagaEkonomiType.BUM_DESA,
    alamatLembaga: '',
    products: [
      { ...initialProduct },
      { ...initialProduct },
      { ...initialProduct }
    ]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (index: number, field: keyof VillageProduct, value: any) => {
    const newProducts = [...form.products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setForm(prev => ({ ...prev, products: newProducts }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      onSuccess(`REG-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`);
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Geo-Location Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">1</span>
          <h3 className="text-lg font-bold text-slate-800">Informasi Wilayah</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Provinsi</label>
            <div className="flex gap-2">
              <input 
                type="text" name="kodeProvinsi" placeholder="Kode" required
                className="w-24 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={form.kodeProvinsi} onChange={handleChange}
              />
              <input 
                type="text" name="provinsi" placeholder="Nama Provinsi" required
                className="flex-grow px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={form.provinsi} onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Kabupaten/Kota</label>
            <div className="flex gap-2">
              <input 
                type="text" name="kodeKabupaten" placeholder="Kode" required
                className="w-24 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={form.kodeKabupaten} onChange={handleChange}
              />
              <input 
                type="text" name="kabupaten" placeholder="Nama Kabupaten" required
                className="flex-grow px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={form.kabupaten} onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Kecamatan</label>
            <div className="flex gap-2">
              <input 
                type="text" name="kodeKecamatan" placeholder="Kode" required
                className="w-24 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={form.kodeKecamatan} onChange={handleChange}
              />
              <input 
                type="text" name="kecamatan" placeholder="Nama Kecamatan" required
                className="flex-grow px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={form.kecamatan} onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Desa/Kelurahan</label>
            <div className="flex gap-2">
              <input 
                type="text" name="kodeDesa" placeholder="Kode" required
                className="w-24 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={form.kodeDesa} onChange={handleChange}
              />
              <input 
                type="text" name="desa" placeholder="Nama Desa" required
                className="flex-grow px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={form.desa} onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Institution Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">2</span>
          <h3 className="text-lg font-bold text-slate-800">Lembaga Ekonomi Desa</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Jenis Lembaga</label>
            <select 
              name="lembagaEkonomi"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.lembagaEkonomi}
              onChange={handleChange}
            >
              {Object.values(LembagaEkonomiType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {form.lembagaEkonomi === LembagaEkonomiType.LAINNYA && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Sebutkan Lainnya</label>
              <input 
                type="text" name="lembagaEkonomiLainnya" placeholder="..." required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                value={form.lembagaEkonomiLainnya} onChange={handleChange}
              />
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Alamat Lengkap Lembaga</label>
            <textarea 
              name="alamatLembaga"
              rows={3}
              placeholder="Jl. Raya Desa No. ..."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
              value={form.alamatLembaga}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">3</span>
          <h3 className="text-lg font-bold text-slate-800">Produk Unggulan Desa</h3>
        </div>

        <div className="space-y-8">
          {form.products.map((product, idx) => (
            <ProductInputGroup 
              key={idx}
              index={idx}
              product={product}
              onChange={handleProductChange}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-6 flex items-center justify-between border-t border-slate-100">
        <p className="text-sm text-slate-500 italic max-w-xs">
          Pastikan semua data yang diisi telah benar dan dokumen PDF yang diunggah valid.
        </p>
        <button 
          type="submit"
          disabled={loading}
          className={`flex items-center gap-2 bg-red-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700 hover:shadow-red-200 active:scale-95'}`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </>
          ) : (
            <>
              Simpan Data
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
