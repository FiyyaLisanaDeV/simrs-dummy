import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Activity, Users, CreditCard, Building2, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Stats {
  totalPasien: number;
  pendapatan: number;
  poliAktif: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ totalPasien: 0, pendapatan: 0, poliAktif: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden font-sans">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: '3s' }}></div>

      {/* Navigation Header */}
      <header className="relative bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">SIMRS Premium</h1>
            <p className="text-xs text-slate-400">Sistem Informasi Manajemen Rumah Sakit</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-slate-200">Petugas Medis</p>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-slate-700/50 hover:border-rose-500/20 transition-all duration-300 flex items-center justify-center cursor-pointer"
            title="Keluar dari Sistem"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full z-10">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Patients */}
          <div className="relative group bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl hover:border-indigo-500/30 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">Total Pasien Terdaftar</span>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            {loading ? (
              <div className="h-9 w-24 bg-slate-800 animate-pulse rounded-md"></div>
            ) : (
              <p className="text-3xl font-extrabold text-white tracking-tight">{stats.totalPasien}</p>
            )}
            <p className="text-xs text-slate-400 mt-2">Tersebar di seluruh instalasi & kamar</p>
          </div>

          {/* Card 2: Revenue */}
          <div className="relative group bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl hover:border-emerald-500/30 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">Pendapatan Terjurnal</span>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            {loading ? (
              <div className="h-9 w-40 bg-slate-800 animate-pulse rounded-md"></div>
            ) : (
              <p className="text-3xl font-extrabold text-white tracking-tight">
                Rp {stats.pendapatan.toLocaleString('id-ID', { minimumFractionDigits: 0 })}
              </p>
            )}
            <p className="text-xs text-emerald-400 mt-2">✓ Pembukuan Balance (Debit = Kredit)</p>
          </div>

          {/* Card 3: Active Clinics */}
          <div className="relative group bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-2xl hover:border-purple-500/30 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm font-medium">Poliklinik Aktif</span>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            {loading ? (
              <div className="h-9 w-16 bg-slate-800 animate-pulse rounded-md"></div>
            ) : (
              <p className="text-3xl font-extrabold text-white tracking-tight">{stats.poliAktif}</p>
            )}
            <p className="text-xs text-slate-400 mt-2">Instalasi aktif melayani pasien</p>
          </div>
        </div>

        {/* Quick Access Module Hub */}
        <div className="mt-8 bg-slate-900/20 backdrop-blur-lg rounded-3xl border border-slate-800/50 p-6 shadow-2xl">
          <h2 className="text-lg font-extrabold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Akses Cepat Modul Pelayanan & Administrasi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <a href="/monitoring" className="group flex items-center justify-between bg-gradient-to-r from-indigo-900/40 to-violet-900/40 hover:from-indigo-900/60 hover:to-violet-900/60 border border-indigo-500/20 hover:border-indigo-500/45 p-5 rounded-2xl transition-all duration-300 sm:col-span-2">
              <div className="flex items-center gap-4">
                <span className="text-2xl">📊</span>
                <div className="text-left">
                  <h4 className="font-bold text-indigo-200 group-hover:text-white transition">Data Monitoring Center</h4>
                  <p className="text-xs text-indigo-300">Monitor & Browse Semua Data Terinput</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-indigo-400 group-hover:text-indigo-200 group-hover:translate-x-1 transition-all" />
            </a>

            <a href="/registration" className="group flex items-center justify-between bg-slate-900/50 hover:bg-indigo-950/20 border border-slate-800 hover:border-indigo-500/30 p-5 rounded-2xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <span className="text-2xl">📝</span>
                <div className="text-left">
                  <h4 className="font-bold text-slate-200 group-hover:text-white transition">Pendaftaran</h4>
                  <p className="text-xs text-slate-400">Front Office & SEP</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </a>

            <a href="/rme" className="group flex items-center justify-between bg-slate-900/50 hover:bg-blue-950/20 border border-slate-800 hover:border-blue-500/30 p-5 rounded-2xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <span className="text-2xl">🩺</span>
                <div className="text-left">
                  <h4 className="font-bold text-slate-200 group-hover:text-white transition">CPPT & RME</h4>
                  <p className="text-xs text-slate-400">SOAP Rawat Jalan</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </a>

            <a href="/farmasi" className="group flex items-center justify-between bg-slate-900/50 hover:bg-amber-950/20 border border-slate-800 hover:border-amber-500/30 p-5 rounded-2xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <span className="text-2xl">💊</span>
                <div className="text-left">
                  <h4 className="font-bold text-slate-200 group-hover:text-white transition">E-Resep</h4>
                  <p className="text-xs text-slate-400">Pemberian Obat Dokter</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </a>

            <a href="/apotek" className="group flex items-center justify-between bg-slate-900/50 hover:bg-teal-950/20 border border-slate-800 hover:border-teal-500/30 p-5 rounded-2xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <span className="text-2xl">⚕️</span>
                <div className="text-left">
                  <h4 className="font-bold text-slate-200 group-hover:text-white transition">Apotek</h4>
                  <p className="text-xs text-slate-400">Validasi & Stok Farmasi</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
            </a>

            <a href="/lab" className="group flex items-center justify-between bg-slate-900/50 hover:bg-violet-950/20 border border-slate-800 hover:border-violet-500/30 p-5 rounded-2xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <span className="text-2xl">🔬</span>
                <div className="text-left">
                  <h4 className="font-bold text-slate-200 group-hover:text-white transition">Laboratorium</h4>
                  <p className="text-xs text-slate-400">Permintaan & Hasil Tes</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
            </a>

            <a href="/beds" className="group flex items-center justify-between bg-slate-900/50 hover:bg-fuchsia-950/20 border border-slate-800 hover:border-fuchsia-500/30 p-5 rounded-2xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <span className="text-2xl">🛏️</span>
                <div className="text-left">
                  <h4 className="font-bold text-slate-200 group-hover:text-white transition">Ketersediaan Bed</h4>
                  <p className="text-xs text-slate-400">Admisi & Kamar Inap</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-fuchsia-400 group-hover:translate-x-1 transition-all" />
            </a>

            <a href="/ranap-cppt" className="group flex items-center justify-between bg-slate-900/50 hover:bg-sky-950/20 border border-slate-800 hover:border-sky-500/30 p-5 rounded-2xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <span className="text-2xl">🏥</span>
                <div className="text-left">
                  <h4 className="font-bold text-slate-200 group-hover:text-white transition">CPPT Ranap</h4>
                  <p className="text-xs text-slate-400">Rekam Medis Rawat Inap</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
            </a>

            <a href="/operasi" className="group flex items-center justify-between bg-slate-900/50 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-500/30 p-5 rounded-2xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <span className="text-2xl">✂️</span>
                <div className="text-left">
                  <h4 className="font-bold text-slate-200 group-hover:text-white transition">Kamar Operasi</h4>
                  <p className="text-xs text-slate-400">Jadwal & Biaya OK</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
            </a>

            <a href="/kasir" className="group flex items-center justify-between bg-slate-900/50 hover:bg-emerald-950/20 border border-slate-800 hover:border-emerald-500/30 p-5 rounded-2xl transition-all duration-300 sm:col-span-2">
              <div className="flex items-center gap-4">
                <span className="text-2xl">💳</span>
                <div className="text-left">
                  <h4 className="font-bold text-slate-200 group-hover:text-white transition">Kasir & Billing</h4>
                  <p className="text-xs text-slate-400">Pembayaran & Jurnal Jasa</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
