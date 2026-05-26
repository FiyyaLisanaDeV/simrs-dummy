import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Users, Bed, CreditCard, Activity, ChevronRight } from 'lucide-react';

interface Stats {
  totalPasien: number;
  pendapatan: number;
  poliAktif: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ totalPasien: 0, pendapatan: 0, poliAktif: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiFetch('http://localhost:3000/api/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Gagal mengambil data statistik:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Pasien Hari Ini */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Pasien Hari Ini</p>
              {loading ? (
                <div className="h-8 w-20 bg-slate-100 animate-pulse rounded"></div>
              ) : (
                <div className="text-3xl font-bold text-slate-800">{stats.totalPasien}</div>
              )}
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                12% dari kemarin
              </p>
            </div>
          </div>
        </div>

        {/* Antrean Aktif */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Antrean Aktif</p>
              {loading ? (
                <div className="h-8 w-20 bg-slate-100 animate-pulse rounded"></div>
              ) : (
                <div className="text-3xl font-bold text-blue-600">{stats.poliAktif * 5}</div>
              )}
              <p className="text-xs text-slate-500 mt-1">Pasien sedang menunggu</p>
            </div>
          </div>
        </div>

        {/* Bed Tersedia */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
              <Bed className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Bed Tersedia</p>
              <div className="text-3xl font-bold text-purple-700">64 <span className="text-xl text-slate-400 font-medium">/ 100</span></div>
              <p className="text-xs text-purple-600 font-medium mt-1">64% dari total bed</p>
            </div>
          </div>
        </div>

        {/* Pendapatan Hari Ini */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
              <span className="text-lg font-bold">Rp</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Pendapatan Hari Ini</p>
              {loading ? (
                <div className="h-8 w-32 bg-slate-100 animate-pulse rounded"></div>
              ) : (
                <div className="text-xl lg:text-2xl font-bold text-emerald-600">
                  Rp {stats.pendapatan.toLocaleString('id-ID', { minimumFractionDigits: 0 })}
                </div>
              )}
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                15% dari kemarin
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Middle Section: Antrean Poli & Ketersediaan Bed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Antrean Poli Hari Ini */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Antrean Poli Hari Ini</h3>
            <a href="/queues" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">Lihat Semua</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs">
                <tr>
                  <th className="px-5 py-3 font-medium">No. Antrean</th>
                  <th className="px-5 py-3 font-medium">Inisial</th>
                  <th className="px-5 py-3 font-medium">Poli / Layanan</th>
                  <th className="px-5 py-3 font-medium">Waktu Daftar</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Dummy Rows */}
                {[
                  { id: 'DM-0001', inisial: 'AR', color: 'bg-emerald-100 text-emerald-700', poli: 'Poli Umum', waktu: '09:15', status: 'Menunggu', statusBg: 'bg-orange-50 text-orange-600' },
                  { id: 'DM-0002', inisial: 'BS', color: 'bg-blue-100 text-blue-700', poli: 'Poli Anak', waktu: '09:20', status: 'Menunggu', statusBg: 'bg-orange-50 text-orange-600' },
                  { id: 'DM-0003', inisial: 'CW', color: 'bg-purple-100 text-purple-700', poli: 'Poli Penyakit Dalam', waktu: '09:25', status: 'Diproses', statusBg: 'bg-blue-50 text-blue-600' },
                  { id: 'DM-0004', inisial: 'DY', color: 'bg-emerald-100 text-emerald-700', poli: 'Poli Gigi', waktu: '09:30', status: 'Menunggu', statusBg: 'bg-orange-50 text-orange-600' },
                  { id: 'DM-0005', inisial: 'EV', color: 'bg-rose-100 text-rose-700', poli: 'Poli Kandungan', waktu: '09:35', status: 'Menunggu', statusBg: 'bg-orange-50 text-orange-600' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-medium text-slate-800">{row.id}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${row.color}`}>{row.inisial}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{row.poli}</td>
                    <td className="px-5 py-3 text-slate-600">{row.waktu}</td>
                    <td className="px-5 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${row.statusBg}`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 text-center text-sm text-slate-500 border-t border-slate-100 mt-auto">
            <Users className="w-4 h-4 inline-block mr-2" />
            Total <span className="font-bold text-slate-700">{stats.poliAktif * 5}</span> pasien dalam antrean
          </div>
        </div>

        {/* Ketersediaan Bed */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Ketersediaan Bed</h3>
            <a href="/beds" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">Lihat Semua</a>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative min-h-[200px]">
             {/* Simple Custom Donut Chart CSS Implementation */}
             <div className="w-48 h-48 rounded-full border-[16px] border-slate-200 relative flex items-center justify-center">
                {/* 64% Emerald representation */}
                <div className="absolute inset-0 rounded-full border-[16px] border-emerald-600" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 70%)' }}></div>
                <div className="text-center bg-white rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-sm z-10 absolute">
                  <span className="text-3xl font-extrabold text-slate-800">64%</span>
                  <span className="text-xs text-slate-500 font-medium">Tersedia</span>
                </div>
             </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-600 rounded-full"></div><span className="text-slate-600">Tersedia</span></div>
              <span className="font-bold text-slate-800">64 Bed</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-300 rounded-full"></div><span className="text-slate-600">Terisi</span></div>
              <span className="font-bold text-slate-800">36 Bed</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm">
              <span className="font-bold text-slate-800">Total Bed</span>
              <span className="font-bold text-slate-800">100 Bed</span>
            </div>
          </div>
          <div className="mt-4 bg-emerald-50 text-emerald-700 p-3 rounded-lg text-xs flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Data per {new Date().toLocaleDateString('id-ID')}
          </div>
        </div>

      </div>

      {/* Akses Modul Cepat */}
      <div>
        <h3 className="font-bold text-slate-800 mb-4">Akses Modul Cepat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <a href="/registration" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col gap-3">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center group-hover:bg-emerald-700 transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Pendaftaran</h4>
              <p className="text-xs text-slate-500 mt-1">Registrasi pasien baru dan kunjungan</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 mt-auto self-end group-hover:text-emerald-600 transition-colors" />
          </a>

          <a href="/rme" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all group flex flex-col gap-3">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">RME</h4>
              <p className="text-xs text-slate-500 mt-1">Catatan pelayanan dan rekam medis</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 mt-auto self-end group-hover:text-blue-600 transition-colors" />
          </a>

          <a href="/farmasi" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-teal-500 hover:shadow-md transition-all group flex flex-col gap-3">
            <div className="w-12 h-12 bg-teal-600 text-white rounded-xl flex items-center justify-center group-hover:bg-teal-700 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Farmasi</h4>
              <p className="text-xs text-slate-500 mt-1">E-Resep, racikan, dan stok obat</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 mt-auto self-end group-hover:text-teal-600 transition-colors" />
          </a>

          <a href="/lab" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-purple-500 hover:shadow-md transition-all group flex flex-col gap-3">
            <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center group-hover:bg-purple-700 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Laboratorium</h4>
              <p className="text-xs text-slate-500 mt-1">Permintaan, antrean, dan hasil lab</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 mt-auto self-end group-hover:text-purple-600 transition-colors" />
          </a>

          <a href="/kasir" className="bg-white border border-slate-200 rounded-xl p-4 hover:border-orange-500 hover:shadow-md transition-all group flex flex-col gap-3">
            <div className="w-12 h-12 bg-orange-500 text-white rounded-xl flex items-center justify-center group-hover:bg-orange-600 transition-colors">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Kasir & Billing</h4>
              <p className="text-xs text-slate-500 mt-1">Tagihan, pembayaran, dan jurnal</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 mt-auto self-end group-hover:text-orange-500 transition-colors" />
          </a>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;
