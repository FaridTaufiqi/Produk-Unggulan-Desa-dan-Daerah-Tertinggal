
import React, { useState } from 'react';
import { FormState, LembagaEkonomiType, VillageProduct } from '../types';
import { ProductInputGroup } from './ProductInputGroup';
import { db, collection, addDoc, User, signInWithPopup, googleProvider, auth } from '../firebase';

interface RegistrationFormProps {
  onSuccess: (id: string) => void;
  user: User | null;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: null, // Simplified for this component
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

const provinces = [
  { id: "11", name: "Aceh (NAD)" },
  { id: "12", name: "Sumatera Utara" },
  { id: "13", name: "Sumatera Barat" },
  { id: "14", name: "Riau" },
  { id: "15", name: "Jambi" },
  { id: "16", name: "Sumatera Selatan" },
  { id: "17", name: "Bengkulu" },
  { id: "18", name: "Lampung" },
  { id: "19", name: "Kepulauan Bangka Belitung" },
  { id: "21", name: "Kepulauan Riau" },
  { id: "31", name: "DKI Jakarta" },
  { id: "32", name: "Jawa Barat" },
  { id: "33", name: "Jawa Tengah" },
  { id: "34", name: "DI Yogyakarta" },
  { id: "35", name: "Jawa Timur" },
  { id: "36", name: "Banten" },
  { id: "51", name: "Bali" },
  { id: "52", name: "Nusa Tenggara Barat (NTB)" },
  { id: "53", name: "Nusa Tenggara Timur (NTT)" },
  { id: "61", name: "Kalimantan Barat" },
  { id: "62", name: "Kalimantan Tengah" },
  { id: "63", name: "Kalimantan Selatan" },
  { id: "64", name: "Kalimantan Timur" },
  { id: "65", name: "Kalimantan Utara" },
  { id: "71", name: "Sulawesi Utara" },
  { id: "72", name: "Sulawesi Tengah" },
  { id: "73", name: "Sulawesi Selatan" },
  { id: "74", name: "Sulawesi Tenggara" },
  { id: "75", name: "Gorontalo" },
  { id: "76", name: "Sulawesi Barat" },
  { id: "81", name: "Maluku" },
  { id: "82", name: "Maluku Utara" },
  { id: "91", name: "Papua" },
  { id: "92", name: "Papua Barat" },
  { id: "93", name: "Papua Selatan" },
  { id: "94", name: "Papua Tengah" },
  { id: "95", name: "Papua Pegunungan" },
  { id: "96", name: "Papua Barat Daya" }
];

const initialProduct: VillageProduct = { name: '', profileFile: null };

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess, user }) => {
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

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error: ", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'provinsi') {
      const selectedProv = provinces.find(p => p.name === value);
      setForm(prev => ({
        ...prev,
        provinsi: value,
        kodeProvinsi: selectedProv ? selectedProv.id : ''
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleProductChange = (index: number, field: keyof VillageProduct, value: any) => {
    const newProducts = [...form.products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setForm(prev => ({ ...prev, products: newProducts }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const id = `REG-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      
      // Prepare data for Firestore (remove File objects)
      const submissionData = {
        ...form,
        id,
        uid: user.uid,
        timestamp: Date.now(),
        products: form.products.map(p => ({
          name: p.name,
          description: p.description || ''
        }))
      };

      await addDoc(collection(db, 'submissions'), submissionData);
      
      setLoading(false);
      onSuccess(id);
    } catch (error) {
      setLoading(false);
      handleFirestoreError(error, OperationType.CREATE, 'submissions');
    }
  };

  if (!user) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Login Diperlukan</h3>
        <p className="text-slate-500 mb-6">Silakan login dengan akun Google Anda untuk mengisi formulir pendaftaran desa.</p>
        <button 
          onClick={handleLogin}
          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
        >
          Login dengan Google
        </button>
      </div>
    );
  }

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
                type="text" name="kodeProvinsi" placeholder="Kode" readOnly
                className="w-24 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-medium outline-none cursor-default"
                value={form.kodeProvinsi}
              />
              <select 
                name="provinsi" 
                required
                className="flex-grow px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={form.provinsi} 
                onChange={handleChange}
              >
                <option value="">Pilih Provinsi</option>
                {provinces.map((prov) => (
                  <option key={prov.id} value={prov.name}>{prov.name}</option>
                ))}
              </select>
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
