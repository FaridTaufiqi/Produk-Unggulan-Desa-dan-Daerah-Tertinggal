
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
  Building2, 
  Package,
  ArrowLeft,
  Lock,
  LogOut
} from 'lucide-react';
import { FormState, LembagaEkonomiType, UserProfile } from '../types';
import { User, auth, signInWithPopup, googleProvider } from '../firebase';

interface DashboardProps {
  data: (FormState & { id: string; timestamp: number })[];
  onBack: () => void;
  user: User | null;
  userProfile: UserProfile | null;
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6'];

export const Dashboard: React.FC<DashboardProps> = ({ data, onBack, user, userProfile }) => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error: ", error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Logout Error: ", error);
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
          
          <button 
            onClick={handleLogin}
            className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
          >
            Login dengan Google
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
  
  // Institution distribution
  const institutionData = Object.values(LembagaEkonomiType).map(type => ({
    name: type,
    value: data.filter(item => item.lembagaEkonomi === type).length
  })).filter(item => item.value > 0);

  // Province distribution
  const provinceCounts: Record<string, number> = {};
  data.forEach(item => {
    provinceCounts[item.provinsi] = (provinceCounts[item.provinsi] || 0) + 1;
  });
  const provinceData = Object.entries(provinceCounts).map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

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
                Petugas {userProfile?.role === 'admin' ? 'Pusat' : 'Desa'}: <span className="font-bold text-slate-700">{user.displayName}</span>
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
          {/* Institution Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Building2 size={20} className="text-red-600" />
              Distribusi Lembaga Ekonomi
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={institutionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {institutionData.map((entry, index) => (
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
              Top 5 Provinsi Teraktif
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={provinceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120} 
                    axisLine={false}
                    tickLine={false}
                    style={{ fontSize: '12px', fontWeight: 500 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
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
            <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
              Menampilkan {data.length} entri
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">ID / Waktu</th>
                  <th className="px-6 py-4 font-semibold">Wilayah</th>
                  <th className="px-6 py-4 font-semibold">Lembaga</th>
                  <th className="px-6 py-4 font-semibold">Produk</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
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
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Terverifikasi
                      </span>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
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
