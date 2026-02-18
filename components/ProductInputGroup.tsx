
import React, { useState } from 'react';
import { VillageProduct } from '../types';
import { GoogleGenAI } from '@google/genai';

interface ProductInputGroupProps {
  index: number;
  product: VillageProduct;
  onChange: (index: number, field: keyof VillageProduct, value: any) => void;
}

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

  return (
    <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 px-3 py-1 bg-slate-200 rounded-bl-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        Produk {index + 1}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
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

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Profil Produk (Upload PDF)</label>
          <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-red-400 transition-colors bg-white group">
            <input 
              type="file" 
              accept="application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => onChange(index, 'profileFile', e.target.files?.[0] || null)}
              required={index === 0}
            />
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="p-3 bg-red-50 rounded-full text-red-600 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="text-xs">
                <span className="text-red-600 font-bold">Pilih file PDF</span> atau drag and drop
              </div>
              <p className="text-[10px] text-slate-400 uppercase">Maksimum 5MB</p>
            </div>
            {product.profileFile && (
              <div className="mt-4 p-2 bg-green-50 border border-green-100 rounded flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-green-700 truncate max-w-[150px]">{product.profileFile.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
