
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  LayoutDashboard, 
  Database, 
  TrendingUp, 
  MapPin, 
  Package,
  ArrowLeft,
  Lock,
  LogOut,
  Trash2,
  AlertCircle,
  Download,
  FileSpreadsheet,
  Copy,
  Check
} from 'lucide-react';
import { FormState, LembagaEkonomiType, UserProfile } from '../types';
import { User, auth, signInWithPopup, googleProvider, db, doc, deleteDoc } from '../firebase';

interface DashboardProps {
  data: (FormState & { id: string; timestamp: number; docId: string; uid: string })[];
  onBack: () => void;
  user: User | null;
  userProfile: UserProfile | null;
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6'];

export const Dashboard: React.FC<DashboardProps> = ({ data, onBack, user, userProfile }) => {
  const [loginLoading, setLoginLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [showSpreadsheetLink, setShowSpreadsheetLink] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const exportUrl = `${window.location.origin}/api/export/csv`;
  const importFormula = `=IMPORTDATA("${exportUrl}")`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(importFormula);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        // Ignore
      } else {
        setLoginError("Gagal login. Silakan coba lagi.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Logout Error: ", error);
    }
  };

  const handleDownloadCSV = () => {
    if (data.length === 0) return;

    // Define headers
    const headers = [
      'ID', 'Waktu', 'Nama Responden', 'NIK', 'No HP', 'Jabatan',
      'Provinsi', 'Kabupaten', 'Kecamatan', 'Desa',
      'Nama Lembaga', 'Bentuk Lembaga', 'Status Badan Hukum',
      'No Telp Direktur', 'No Telp Sekretaris', 'Jumlah Karyawan',
      'NPWP', 'NIB', 'Tahun Berdiri', 'Alamat',
      'Penyertaan Modal', 'Bagi Hasil PADes', 'Media Sosial',
      'Produk Unggulan', 'Kebutuhan Dukungan',
      'Ada Produk Ekspor', 'Produk Unggulan Ekspor'
    ];

    // Map data to rows
    const rows = data.map(item => {
      const productsStr = item.products
        .filter(p => p.name)
        .map((p, i) => {
          return `[PRODUK ${i+1}] Nama: ${p.name}, Kategori: ${p.category}, Deskripsi: ${p.deskripsi}, Mitra: ${p.mitraUsaha}, Kapasitas: ${p.kapasitasBulanan}/bln & ${p.kapasitasTahunan}/thn, Penjualan 2025: ${p.totalPenjualan2025}, Pangsa Pasar: ${(p.pangsaPasar || []).join('/')}, Legalitas: ${(p.legalitas || []).join('/')}, Foto: ${p.fotoUrl || 'Tidak ada'}`;
        })
        .join(' | ');
      
      const needsStr = (item.kebutuhanDukungan || []).join(' | ');

      const exportProductsStr = (item.exportProducts || [])
        .map((p, i) => {
          return `[EKSPOR ${i+1}] Nama: ${p.nama}, Status: ${p.statusEkspor}, Deskripsi: ${p.deskripsi}, Peran BUMDes: ${p.peranBumdes}, Volume: ${p.volumeEkspor}, Tujuan: ${p.negaraTujuan}, Offtaker: ${p.namaOfftaker || '-'}, Peran Offtaker: ${p.peranOfftaker || '-'}`;
        })
        .join(' | ');

      return [
        item.id,
        new Date(item.timestamp).toLocaleString('id-ID'),
        item.namaResponden,
        `'${item.nikResponden}`, // Force string in Excel
        item.noHpResponden,
        item.jabatanResponden,
        item.provinsi,
        item.kabupaten,
        item.kecamatan,
        item.desa,
        item.namaLembaga,
        item.lembagaEkonomi,
        item.statusBadanHukum,
        item.noTelpDirektur,
        item.noTelpSekretaris,
        item.jumlahKaryawan,
        item.npwpLembaga,
        item.nibLembaga,
        item.tahunBerdiri,
        item.alamatLembaga.replace(/\n/g, ' '),
        item.penyertaanModal.replace(/\n/g, ' '),
        item.bagiHasilPADes.replace(/\n/g, ' '),
        item.mediaSosial,
        productsStr,
        needsStr,
        item.hasExportProduct || 'Tidak',
        exportProductsStr
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        const cellStr = String(cell || '');
        // Escape quotes and wrap in quotes if contains comma or newline
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `backlog_pendaftaran_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data pendaftaran ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    setDeletingId(docId);
    try {
      await deleteDoc(doc(db, 'submissions', docId));
    } catch (error) {
      console.error("Delete Error: ", error);
      alert("Gagal menghapus data. Pastikan Anda memiliki izin yang cukup.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Akses Terbatas</h2>
          <p className="text-slate-500 mb-8">Silakan login sebagai petugas untuk melihat statistik dan backlog pendaftaran.</p>
          
          {loginError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
              {loginError}
            </div>
          )}

          <button 
            onClick={handleLogin}
            disabled={loginLoading}
            className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 disabled:opacity-50"
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
          
          <button 
            onClick={onBack}
            className="mt-4 text-slate-500 hover:text-slate-700 font-medium flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft size={18} />
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // Statistics calculations
  const totalSubmissions = data.length;
  const totalProducts = data.reduce((acc, curr) => acc + curr.products.filter(p => p.name).length, 0);
  
  const isAdmin = userProfile?.role === 'admin' || user?.email === 'faridtaufiqibusiness@gmail.com';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button 
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors mb-2"
              >
                <ArrowLeft size={18} />
                Kembali ke Beranda
              </button>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <LayoutDashboard className="text-red-600" />
                Status Pendaftaran Desa
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-5 h-5 rounded-full" />
                <p className="text-slate-500 text-sm">
                  Akun Desa: <span className="font-bold text-slate-700">{user.displayName}</span>
                </p>
                <button onClick={handleLogout} className="text-xs text-red-600 hover:underline flex items-center gap-1 ml-2">
                  <LogOut size={12} />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Simple Status View for Desa */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Pendaftaran Anda Telah Diterima</h3>
              <p className="text-slate-500 mb-6">
                Terima kasih telah melakukan pendaftaran. Data Anda sedang dalam proses verifikasi oleh petugas pusat.
                Anda memiliki <span className="font-bold text-slate-900">{data.length}</span> pendaftaran aktif.
              </p>
              
              {data.length > 0 && (
                <div className="text-left border-t border-slate-100 pt-6">
                  <h4 className="font-bold text-slate-800 mb-4">Riwayat Pendaftaran:</h4>
                  <div className="space-y-3">
                    {data.map((item) => (
                      <div key={item.docId} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.namaLembaga}</p>
                          <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString('id-ID')}</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">
                          Terverifikasi
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Informasi Akses</h4>
              <p className="text-sm text-blue-700">
                Statistik global dan backlog pendaftaran seluruh desa hanya dapat diakses oleh Petugas Pusat (Admin). 
                Hubungi admin jika Anda memerlukan bantuan lebih lanjut.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Product Category distribution
  const categoryCounts: Record<string, number> = {};
  data.forEach(item => {
    item.products.forEach(product => {
      if (product.category) {
        categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
      }
    });
  });
  const categoryData = Object.entries(categoryCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Province distribution (all)
  const provinceCounts: Record<string, number> = {};
  data.forEach(item => {
    provinceCounts[item.provinsi] = (provinceCounts[item.provinsi] || 0) + 1;
  });
  const provinceData = Object.entries(provinceCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors mb-2"
            >
              <ArrowLeft size={18} />
              Kembali ke Beranda
            </button>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <LayoutDashboard className="text-red-600" />
              {userProfile?.role === 'admin' ? 'Statistik & Backlog Desa' : 'Dashboard Pendaftaran Desa'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-5 h-5 rounded-full" />
              <p className="text-slate-500 text-sm">
                Petugas Pusat: <span className="font-bold text-slate-700">{user.displayName}</span>
              </p>
              <button onClick={handleLogout} className="text-xs text-red-600 hover:underline flex items-center gap-1 ml-2">
                <LogOut size={12} />
                Logout
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <a 
              href="https://drive.google.com/drive/folders/1Cjs5oihrlRnvl2e1isFYTHvsFwUQmq7h?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:border-red-200 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.71 3.5L1.15 15l3.43 6 6.55-11.5h-3.42zM9.73 15L6.3 21h13.12l3.43-6H9.73zM18.73 15L12.15 3.5h-6.85L12 14h6.73z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Google Drive</p>
                <p className="text-sm font-bold text-slate-900">Buka Folder Data</p>
              </div>
            </a>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                <Database size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Data</p>
                <p className="text-2xl font-bold text-slate-900">{totalSubmissions}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Package size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Produk</p>
                <p className="text-2xl font-bold text-slate-900">{totalProducts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Category Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Package size={20} className="text-red-600" />
              Rekap Kategori Produk
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Province Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-red-600" />
              Rekap Provinsi Terdaftar
            </h3>
            <div className={`w-full overflow-y-auto pr-2`} style={{ height: '350px' }}>
              <div style={{ height: Math.max(350, provinceData.length * 40) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={provinceData} layout="vertical" margin={{ left: 20, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={150} 
                      axisLine={false}
                      tickLine={false}
                      style={{ fontSize: '11px', fontWeight: 500 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20}>
                      {provinceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Backlog Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-red-600" />
              Backlog Pendaftaran Terbaru
            </h3>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowSpreadsheetLink(!showSpreadsheetLink)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all shadow-sm"
              >
                <FileSpreadsheet size={14} />
                Buka di Spreadsheet
              </button>
              <button 
                onClick={handleDownloadCSV}
                disabled={data.length === 0}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
              >
                <Download size={14} />
                Unduh CSV
              </button>
              <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                Menampilkan {data.length} entri
              </span>
            </div>
          </div>

          {/* Spreadsheet Link Info */}
          {showSpreadsheetLink && (
            <div className="p-6 bg-blue-50 border-b border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="max-w-3xl">
                <h4 className="text-blue-900 font-bold mb-2 flex items-center gap-2">
                  <FileSpreadsheet size={18} />
                  Integrasi Google Sheets (Live Sync)
                </h4>
                <p className="text-sm text-blue-700 mb-4">
                  Gunakan rumus di bawah ini di Google Sheets untuk mengimpor data secara otomatis. 
                  Data akan diperbarui secara berkala oleh Google Sheets.
                </p>
                <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-blue-200 shadow-inner">
                  <code className="flex-1 text-xs font-mono text-blue-600 break-all">
                    {importFormula}
                  </code>
                  <button 
                    onClick={handleCopyLink}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors shrink-0"
                    title="Salin Rumus"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <div className="mt-4 flex gap-4 text-[10px] text-blue-500 font-medium">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Otomatis Update
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Format CSV Standar
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Akses Langsung
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">ID / Waktu</th>
                  <th className="px-6 py-4 font-semibold">Wilayah</th>
                  <th className="px-6 py-4 font-semibold">Lembaga</th>
                  <th className="px-6 py-4 font-semibold">Produk</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item) => (
                  <tr key={item.docId} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{item.id}</p>
                      <p className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleString('id-ID')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">{item.desa}, {item.kecamatan}</p>
                      <p className="text-xs text-slate-400">{item.kabupaten}, {item.provinsi}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {item.lembagaEkonomi}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.products.filter(p => p.name).map((p, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                            {p.name}
                          </span>
                        ))}
                        {item.hasExportProduct === 'Iya' && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 font-bold flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                            EKSPOR
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Terverifikasi
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(item.docId)}
                        disabled={deletingId === item.docId}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                        title="Hapus Pendaftaran"
                      >
                        {deletingId === item.docId ? (
                          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                      Belum ada data pendaftaran yang masuk.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
