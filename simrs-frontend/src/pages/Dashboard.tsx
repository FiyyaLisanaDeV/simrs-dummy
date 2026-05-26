
const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800">SIMRS Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
            AD
          </div>
        </div>
      </header>
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-sm font-medium mb-2">Total Pasien Hari Ini</h3>
            <p className="text-3xl font-bold text-slate-800">0</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-sm font-medium mb-2">Pendapatan</h3>
            <p className="text-3xl font-bold text-slate-800">Rp 0</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-sm font-medium mb-2">Poli Aktif</h3>
            <p className="text-3xl font-bold text-slate-800">0</p>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Akses Modul Cepat</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <a href="/registration" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-4 rounded-xl text-center font-semibold transition">
              📝 Pendaftaran
            </a>
            <a href="/rme" className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-xl text-center font-semibold transition">
              🩺 CPPT & RME
            </a>
            <a href="/farmasi" className="bg-amber-50 hover:bg-amber-100 text-amber-700 p-4 rounded-xl text-center font-semibold transition">
              💊 E-Resep (Dokter)
            </a>
            <a href="/apotek" className="bg-teal-50 hover:bg-teal-100 text-teal-700 p-4 rounded-xl text-center font-semibold transition">
              ⚕️ Apotek (Validasi)
            </a>
            <a href="/lab" className="bg-violet-50 hover:bg-violet-100 text-violet-700 p-4 rounded-xl text-center font-semibold transition">
              🔬 Laboratorium
            </a>
            <a href="/beds" className="bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-700 p-4 rounded-xl text-center font-semibold transition">
              🛏️ Manajemen Bangsal
            </a>
            <a href="/ranap-cppt" className="bg-sky-50 hover:bg-sky-100 text-sky-700 p-4 rounded-xl text-center font-semibold transition">
              🏥 CPPT Ranap
            </a>
            <a href="/operasi" className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-4 rounded-xl text-center font-semibold transition">
              ✂️ Kamar Operasi (OK)
            </a>
            <a href="/kasir" className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-4 rounded-xl text-center font-semibold transition col-span-2 sm:col-span-1">
              💳 Kasir & Billing
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
