
import React, { useState } from 'react';
import { VillageProduct } from '../types';
import { GoogleGenAI } from '@google/genai';

interface ProductInputGroupProps {
  index: number;
  product: VillageProduct;
  onChange: (index: number, field: keyof VillageProduct, value: any) => void;
}

const CATEGORIES = [
  'Pertanian & Perkebunan',
  'Peternakan & Perikanan',
  'Olahan Pangan / Kuliner',
  'Kerajinan / Kriya',
  'Fashion & Tekstil',
  'Jasa & Pariwisata',
  'Teknologi / Digital',
  'Lainnya'
];

const LEGALITAS_OPTIONS = [
  'NIB (Nomor Induk Berusaha)',
  'PIRT',
  'Halal',
  'BPOM',
  'HAKI / Merek',
  'Izin Lingkungan',
  'Lainnya'
];

export const ProductInputGroup: React.FC<ProductInputGroupProps> = ({ index, product, onChange }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [slogan, setSlogan] = useState('');

  const generateSlogan = async () => {
    if (!product.name) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate short and catchy Indonesian marketing slogan for a village product named: ${product.name}. Return only the slogan text.`,
        config: { temperature: 0.8 }
      });
      setSlogan(response.text || '');
    } catch (err) {
      console.error("AI Slogan Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLegalitasChange = (option: string) => {
    const current = product.legalitas || [];
    const next = current.includes(option)
      ? current.filter(o => o !== option)
      : [...current, option];
    onChange(index, 'legalitas', next);
  };

  return (
    <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 px-3 py-1 bg-slate-200 rounded-bl-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        Produk {index + 1}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nama Produk Unggulan {index + 1}</label>
            <input 
              type="text"
              placeholder="Contoh: Kripik Tempe Sagu"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={product.name}
              onChange={(e) => onChange(index, 'name', e.target.value)}
              required={index === 0}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Kategori Produk</label>
            <select
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={product.category}
              onChange={(e) => onChange(index, 'category', e.target.value)}
              required={index === 0}
            >
              <option value="">Pilih Kategori</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Omzet Bulanan (Rp)</label>
              <input 
                type="text"
                placeholder="Contoh: 5.000.000"
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                value={product.omzetBulanan}
                onChange={(e) => onChange(index, 'omzetBulanan', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Kapasitas Produksi</label>
              <input 
                type="text"
                placeholder="Contoh: 100 kg/bulan"
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                value={product.kapasitasProduksi}
                onChange={(e) => onChange(index, 'kapasitasProduksi', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Legalitas yang Dimiliki</label>
            <div className="grid grid-cols-1 gap-2">
              {LEGALITAS_OPTIONS.map(option => (
                <label key={option} className="flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    checked={product.legalitas?.includes(option)}
                    onChange={() => handleLegalitasChange(option)}
                  />
                  <span className="text-xs text-slate-600 font-medium">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
              Slogan Promosi (AI Suggested)
              {product.name && (
                <button 
                  type="button"
                  onClick={generateSlogan}
                  disabled={isGenerating}
                  className="text-[10px] text-red-600 hover:text-red-700 font-bold uppercase tracking-tight flex items-center gap-1"
                >
                  {isGenerating ? 'Mencari...' : 'Ganti Slogan ✨'}
                </button>
              )}
            </label>
            <div className={`p-3 rounded-lg text-sm border italic ${slogan ? 'bg-red-50 border-red-100 text-red-800' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
              {slogan || 'Isi nama produk lalu klik Ganti Slogan untuk ide promosi...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
