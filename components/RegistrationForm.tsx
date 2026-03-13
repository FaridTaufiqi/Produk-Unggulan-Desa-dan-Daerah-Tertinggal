
import React, { useState } from 'react';
import { Navigation, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { FormState, LembagaEkonomiType, VillageProduct, StatusBadanHukum } from '../types';
import { ProductInputGroup } from './ProductInputGroup';
import { ExportProductInputGroup } from './ExportProductInputGroup';
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

const SUPPORT_NEEDS = [
  'Pelatihan & Peningkatan SDM',
  'Bantuan Permodalan / Kredit',
  'Sertifikasi Produk (Halal, PIRT, dll)',
  'Pemasaran Digital & E-commerce',
  'Penyediaan Alat Produksi / Mesin',
  'Akses Bahan Baku',
  'Lainnya'
];

const initialProduct: VillageProduct = { 
  name: '', 
  category: '', 
  legalitas: [], 
  kapasitasBulanan: '',
  kapasitasTahunan: '',
  deskripsi: '',
  mitraUsaha: '',
  totalPenjualan2025: '',
  pangsaPasar: [],
  fotoUrl: ''
};

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess, user }) => {
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    namaResponden: '',
    nikResponden: '',
    noHpResponden: '',
    jabatanResponden: '',
    kodeProvinsi: '',
    provinsi: '',
    kodeKabupaten: '',
    kabupaten: '',
    kodeKecamatan: '',
    kecamatan: '',
    kodeDesa: '',
    desa: '',
    namaLembaga: '',
    lembagaEkonomi: LembagaEkonomiType.BUM_DESA,
    statusBadanHukum: StatusBadanHukum.BELUM_MENDAFTAR,
    noTelpDirektur: '',
    noTelpSekretaris: '',
    jumlahKaryawan: '',
    npwpLembaga: '',
    nibLembaga: '',
    penyertaanModal: '',
    bagiHasilPADes: '',
    mediaSosial: '',
    tahunBerdiri: '',
    alamatLembaga: '',
    products: [
      { ...initialProduct }
    ],
    kebutuhanDukungan: [],
    hasExportProduct: 'Tidak',
    exportProducts: []
  });

  const handleLogin = async () => {
    if (loginLoading) return;
    setLoginLoading(true);
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login Error: ", error);
      if (error.code === 'auth/popup-blocked') {
        setLoginError("Popup diblokir oleh browser. Silakan izinkan popup untuk login.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Ignore, user just clicked again or closed it
      } else {
        setLoginError("Gagal login. Silakan coba lagi.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleTagLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung fitur lokasi.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation Error:", error);
        let msg = "Gagal mengambil lokasi.";
        if (error.code === 1) msg = "Izin lokasi ditolak. Silakan aktifkan GPS/Izin lokasi di browser.";
        alert(msg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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

  const handleSupportNeedChange = (need: string) => {
    const current = form.kebutuhanDukungan || [];
    const next = current.includes(need)
      ? current.filter(n => n !== need)
      : [...current, need];
    setForm(prev => ({ ...prev, kebutuhanDukungan: next }));
  };

  const handleProductChange = (index: number, field: keyof VillageProduct, value: any) => {
    const newProducts = [...form.products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setForm(prev => ({ ...prev, products: newProducts }));
  };

  const addProduct = () => {
    if (form.products.length >= 10) {
      alert("Maksimal 10 produk unggulan");
      return;
    }
    setForm(prev => ({
      ...prev,
      products: [...prev.products, { ...initialProduct }]
    }));
  };

  const removeProduct = (index: number) => {
    if (form.products.length <= 1) return;
    setForm(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const handleExportProductChange = (index: number, field: keyof any, value: any) => {
    const newExportProducts = [...form.exportProducts];
    newExportProducts[index] = { ...newExportProducts[index], [field]: value };
    setForm(prev => ({ ...prev, exportProducts: newExportProducts }));
  };

  const addExportProduct = () => {
    setForm(prev => ({
      ...prev,
      exportProducts: [
        ...prev.exportProducts,
        {
          nama: '',
          statusEkspor: 'Belum',
          deskripsi: '',
          peranBumdes: '',
          volumeEkspor: '',
          negaraTujuan: '',
          namaOfftaker: '',
          peranOfftaker: ''
        }
      ]
    }));
  };

  const removeExportProduct = (index: number) => {
    setForm(prev => ({
      ...prev,
      exportProducts: prev.exportProducts.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const id = `REG-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      
      // Prepare data for Firestore
      const submissionData = {
        ...form,
        id,
        uid: user.uid,
        timestamp: Date.now(),
      };

      await addDoc(collection(db, 'submissions'), submissionData);
      
      // Add each product to the public catalog
      const catalogPromises = form.products.filter(p => p.name).map(product => {
        return addDoc(collection(db, 'catalog'), {
          ...product,
          uid: user.uid,
          submissionId: id,
          timestamp: Date.now(),
          provinsi: form.provinsi,
          kabupaten: form.kabupaten,
          kecamatan: form.kecamatan,
          desa: form.desa,
          namaLembaga: form.namaLembaga
        });
      });
      await Promise.all(catalogPromises);

      // Sync to Google Sheets (Background)
      fetch('/api/sync/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      }).catch(err => console.error('Sheet Sync Error:', err));

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
        
        {loginError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl max-w-md mx-auto">
            {loginError}
          </div>
        )}

        <button 
          onClick={handleLogin}
          disabled={loginLoading}
          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
        >
          {loginLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menghubungkan...
            </>
          ) : (
            <>Login dengan Google</>
          )}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* Section 1: Identitas Responden */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
          <div className="w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold">1</div>
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Identitas Responden</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nama Lengkap (Sesuai KTP)</label>
            <input 
              type="text"
              name="namaResponden"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.namaResponden}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">NIK (Nomor Induk Kependudukan)</label>
            <input 
              type="text"
              name="nikResponden"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.nikResponden}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nomor HP / WhatsApp</label>
            <input 
              type="text"
              name="noHpResponden"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.noHpResponden}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Jabatan di Desa / Lembaga</label>
            <input 
              type="text"
              name="jabatanResponden"
              placeholder="Contoh: Kepala Desa, Ketua BUMDes"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.jabatanResponden}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      {/* Section 2: Lokasi Desa */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
          <div className="w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold">2</div>
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Lokasi Desa</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Provinsi</label>
            <select 
              name="provinsi"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.provinsi}
              onChange={handleChange}
              required
            >
              <option value="">Pilih Provinsi</option>
              {provinces.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Kabupaten / Kota</label>
            <input 
              type="text"
              name="kabupaten"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.kabupaten}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Kecamatan</label>
            <input 
              type="text"
              name="kecamatan"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.kecamatan}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nama Desa</label>
            <input 
              type="text"
              name="desa"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.desa}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      {/* Section 3: Identitas Lembaga Ekonomi */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
          <div className="w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold">3</div>
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Identitas Lembaga Ekonomi</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nama Lembaga (BUMDes/Koperasi/Lainnya)</label>
            <input 
              type="text"
              name="namaLembaga"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.namaLembaga}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Bentuk Lembaga</label>
            <select 
              name="lembagaEkonomi"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.lembagaEkonomi}
              onChange={handleChange}
              required
            >
              {Object.values(LembagaEkonomiType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Status Badan Hukum</label>
            <select 
              name="statusBadanHukum"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.statusBadanHukum}
              onChange={handleChange}
              required
            >
              {Object.values(StatusBadanHukum).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">No. Telp Direktur BUM Desa/Bersama</label>
            <input 
              type="text"
              name="noTelpDirektur"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.noTelpDirektur}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">No. Telp Sekretaris/Bendahara</label>
            <input 
              type="text"
              name="noTelpSekretaris"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.noTelpSekretaris}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Jumlah Karyawan / Kelompok Binaan</label>
            <input 
              type="number"
              name="jumlahKaryawan"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.jumlahKaryawan}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">NPWP BUM Desa/Bersama</label>
            <input 
              type="text"
              name="npwpLembaga"
              placeholder="Bukan NPWP Pribadi atau Direktur"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.npwpLembaga}
              onChange={handleChange}
              required
            />
            <p className="text-[10px] text-slate-500 italic">*Bukan NPWP Pribadi atau NPWP Direktur</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">NIB (Nomor Induk Berusaha)</label>
            <input 
              type="text"
              name="nibLembaga"
              placeholder="Kosongkan jika belum memiliki"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.nibLembaga}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Media Sosial</label>
            <input 
              type="text"
              name="mediaSosial"
              placeholder="Contoh: @bumdes_maju (Instagram/FB)"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.mediaSosial}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Tahun Berdiri</label>
            <input 
              type="text"
              name="tahunBerdiri"
              placeholder="Contoh: 2018"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.tahunBerdiri}
              onChange={handleChange}
              required
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-slate-700">Total Penyertaan Modal Dana Desa</label>
            <textarea 
              name="penyertaanModal"
              rows={2}
              placeholder="Contoh: 2021 : Rp 50.000.000; 2022 : Rp 75.000.000; dst."
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.penyertaanModal}
              onChange={handleChange}
              required
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-slate-700">Total Bagi Hasil Keuntungan untuk PADes</label>
            <textarea 
              name="bagiHasilPADes"
              rows={2}
              placeholder="Contoh: 2021 : Rp 10.000.000; 2022 : Rp 30.000.000; dst."
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.bagiHasilPADes}
              onChange={handleChange}
              required
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-slate-700">Tagging Lokasi Lembaga Ekonomi (GPS)</label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <button
                type="button"
                onClick={handleTagLocation}
                disabled={isLocating}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm ${
                  form.latitude 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isLocating ? (
                  <Loader2 size={18} className="animate-spin text-red-600" />
                ) : (
                  <Navigation size={18} className={form.latitude ? 'text-emerald-600' : 'text-red-600'} />
                )}
                {form.latitude ? 'Lokasi Berhasil Ditandai' : 'Tag Lokasi Lembaga'}
              </button>
              
              {form.latitude && (
                <div className="flex gap-4 text-[11px] font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  <span>Lat: {form.latitude.toFixed(6)}</span>
                  <span>Long: {form.longitude?.toFixed(6)}</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-500 italic">
              *Klik tombol di atas saat Anda berada di lokasi kantor lembaga atau pusat produksi untuk akurasi data spasial.
            </p>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-slate-700">Alamat Lengkap Lembaga</label>
            <textarea 
              name="alamatLembaga"
              rows={3}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={form.alamatLembaga}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      {/* Section 4: Produk Unggulan */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
          <div className="w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold">4</div>
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Identifikasi Produk Unggulan</h3>
        </div>
        <p className="text-sm text-slate-500 italic">Daftarkan produk unggulan desa Anda yang paling potensial.</p>
        <div className="space-y-8">
          {form.products.map((product, index) => (
            <div key={index} className="relative">
              <ProductInputGroup 
                index={index}
                product={product}
                onChange={handleProductChange}
              />
              {form.products.length > 1 && (
                <button 
                  type="button"
                  onClick={() => removeProduct(index)}
                  className="absolute top-2 right-24 text-red-600 text-xs font-bold hover:underline bg-white px-2 py-1 rounded shadow-sm border border-slate-100"
                >
                  Hapus
                </button>
              )}
            </div>
          ))}
          
          <button 
            type="button"
            onClick={addProduct}
            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 hover:border-red-200 hover:text-red-600 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Tambah Produk Unggulan Lainnya
          </button>
        </div>
      </div>

      {/* Section 5: Kebutuhan Dukungan */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
          <div className="w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold">5</div>
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Kebutuhan Dukungan Pemerintah</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUPPORT_NEEDS.map(need => (
            <label key={need} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
              <input 
                type="checkbox"
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                checked={form.kebutuhanDukungan.includes(need)}
                onChange={() => handleSupportNeedChange(need)}
              />
              <span className="text-sm text-slate-700 font-medium">{need}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Section 6: Ekspor */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
          <div className="w-8 h-8 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold">6</div>
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Potensi Ekspor Desa</h3>
        </div>
        
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-700 block">Apakah ada produk unggulan desa yang sudah di ekspor atau berpotensi untuk di ekspor?</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="hasExportProduct" 
                value="Iya" 
                checked={form.hasExportProduct === 'Iya'}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value === 'Iya' && form.exportProducts.length === 0) {
                    addExportProduct();
                  }
                }}
                className="w-4 h-4 text-red-600"
              />
              <span className="text-sm font-medium text-slate-700">Iya</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="hasExportProduct" 
                value="Tidak" 
                checked={form.hasExportProduct === 'Tidak'}
                onChange={handleChange}
                className="w-4 h-4 text-red-600"
              />
              <span className="text-sm font-medium text-slate-700">Tidak</span>
            </label>
          </div>
        </div>

        {form.hasExportProduct === 'Iya' && (
          <div className="space-y-8 mt-6">
            {form.exportProducts.map((exportProduct, index) => (
              <ExportProductInputGroup 
                key={index}
                index={index}
                product={exportProduct}
                onChange={handleExportProductChange}
                onRemove={removeExportProduct}
                showRemove={form.exportProducts.length > 1}
              />
            ))}
            
            <button 
              type="button"
              onClick={addExportProduct}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 hover:border-red-200 hover:text-red-600 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Tambah Produk Ekspor Lainnya
            </button>
          </div>
        )}
      </div>

      <div className="pt-8 border-t border-slate-100">
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses Data...
            </>
          ) : (
            <>Kirim Formulir Identifikasi</>
          )}
        </button>
        <p className="text-center text-xs text-slate-400 mt-4 uppercase tracking-widest font-bold">
          Data akan diverifikasi oleh tim kementerian terkait
        </p>
      </div>
    </form>
  );
};
