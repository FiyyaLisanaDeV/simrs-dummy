import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { Activity, Search, RefreshCw, Database, DollarSign, ShieldCheck, CheckCircle2, AlertCircle, ChevronRight, FileText, ShoppingBag, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MonitorStats {
  counts: {
    pasien: number;
    registrasi: number;
    soapRalan: number;
    soapRanap: number;
    lab: number;
    operasi: number;
    resep: number;
    nota: number;
    jurnal: number;
    mutasi: number;
  };
  audit: {
    totalDebit: number;
    totalKredit: number;
    isBalanced: boolean;
  };
}

const DataMonitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'browser'>('overview');
  const [stats, setStats] = useState<MonitorStats | null>(null);
  const [dataType, setDataType] = useState<'pasien' | 'registrasi' | 'soap' | 'resep' | 'jurnal' | 'mutasi'>('pasien');
  const [browseData, setBrowseData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const navigate = useNavigate();

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await apiFetch('http://localhost:3000/api/monitoring/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Gagal mengambil data monitoring stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchBrowseData = async () => {
    setLoadingData(true);
    setSelectedItem(null);
    try {
      const url = `http://localhost:3000/api/monitoring/data?type=${dataType}${searchQuery ? `&search=${searchQuery}` : ''}`;
      const res = await apiFetch(url);
      const data = await res.json();
      setBrowseData(data);
    } catch (err) {
      console.error('Gagal mengambil data browser:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'browser') {
      fetchBrowseData();
    }
  }, [activeTab, dataType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBrowseData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/50 flex items-center justify-center transition cursor-pointer"
          >
            ←
          </button>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" /> Pusat Monitoring Data SIMRS
            </h1>
            <p className="text-xs text-slate-400">Pemantauan & Eksplorasi Real-Time Seluruh Data Terinput</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchStats}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/50 transition cursor-pointer flex items-center gap-2 text-sm font-semibold"
          >
            <RefreshCw className="w-4 h-4" /> Segarkan
          </button>
        </div>
      </header>

      {/* Tabs bar */}
      <div className="bg-slate-900/20 border-b border-slate-800/50 px-6 py-3 flex gap-4 z-10">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200 bg-slate-900/50 border border-slate-800'}`}
        >
          📊 Ringkasan Basis Data & Audit
        </button>
        <button
          onClick={() => setActiveTab('browser')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${activeTab === 'browser' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200 bg-slate-900/50 border border-slate-800'}`}
        >
          🔍 Eksplorasi & Pencarian Data (Browser)
        </button>
      </div>

      {/* Content wrapper */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full z-10 overflow-y-auto">
        {activeTab === 'overview' ? (
          /* TAB 1: OVERVIEW & STATS */
          <div className="space-y-6">
            {loadingStats ? (
              <div className="text-center py-20">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
                <p className="text-slate-400 text-sm">Menghitung seluruh baris data di database lokal...</p>
              </div>
            ) : stats ? (
              <>
                {/* Audit Box */}
                <div className={`p-6 rounded-3xl border backdrop-blur-xl ${stats.audit.isBalanced ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stats.audit.isBalanced ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {stats.audit.isBalanced ? <ShieldCheck className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Status Integritas Keuangan & Jurnal Akuntansi</h3>
                        <p className="text-xs text-slate-400">Hasil audit silang (cross-auditing) dari mutasi kasir ke ledger jurnal umum</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Total Debit & Kredit Terjurnal</p>
                        <p className="text-lg font-extrabold text-white">Rp {stats.audit.totalDebit.toLocaleString('id-ID')}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-xs font-bold ${stats.audit.isBalanced ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {stats.audit.isBalanced ? '✓ LEDGER BALANCE' : '⚠️ OUT OF BALANCE'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table row counts grid */}
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Volume Data per Entitas Tabel</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Tabel: pasien', count: stats.counts.pasien, desc: 'Volume Pasien Terdaftar', icon: '👥' },
                    { label: 'Tabel: reg_periksa', count: stats.counts.registrasi, desc: 'Kunjungan Poliklinik', icon: '📝' },
                    { label: 'Tabel: pemeriksaan_ralan', count: stats.counts.soapRalan, desc: 'Rekam Medis Rawat Jalan', icon: '🩺' },
                    { label: 'Tabel: pemeriksaan_ranap', count: stats.counts.soapRanap, desc: 'Rekam Medis Rawat Inap', icon: '🏥' },
                    { label: 'Tabel: periksa_lab', count: stats.counts.lab, desc: 'Pemeriksaan Lab Penunjang', icon: '🔬' },
                    { label: 'Tabel: operasi', count: stats.counts.operasi, desc: 'Tindakan Bedah Operasi', icon: '✂' },
                    { label: 'Tabel: resep_obat', count: stats.counts.resep, desc: 'Resep Obat Terbit', icon: '💊' },
                    { label: 'Tabel: nota_jalan', count: stats.counts.nota, desc: 'Nota Pembayaran Kasir', icon: '💳' },
                    { label: 'Tabel: jurnal', count: stats.counts.jurnal, desc: 'Header Jurnal Umum', icon: '📓' },
                    { label: 'Tabel: riwayat_medis', count: stats.counts.mutasi, desc: 'Riwayat Barang Medis', icon: '📦' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 hover:border-indigo-500/20 transition-all duration-300">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-xs text-slate-500 font-mono">{item.label}</span>
                      </div>
                      <h4 className="text-3xl font-extrabold text-white tracking-tight">{item.count}</h4>
                      <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ) : (
          /* TAB 2: DATA BROWSER */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar selector */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-850 p-5 rounded-3xl space-y-4">
                <h3 className="font-extrabold text-white">Konfigurasi Eksplorasi</h3>
                
                {/* Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Pilih Entitas Tabel:</label>
                  <select 
                    value={dataType} 
                    onChange={(e: any) => {
                      setDataType(e.target.value);
                      setSearchQuery('');
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="pasien">👥 Tabel: pasien (Master Pasien)</option>
                    <option value="registrasi">📝 Tabel: reg_periksa (Kunjungan)</option>
                    <option value="soap">🩺 Rekam Medis (SOAP Ralan & Ranap)</option>
                    <option value="resep">💊 Tabel: resep_obat & resep_dokter</option>
                    <option value="jurnal">📓 Tabel: jurnal & detailjurnal (Finance)</option>
                    <option value="mutasi">📦 Tabel: riwayat_barang_medis (Mutasi)</option>
                  </select>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="space-y-2">
                  <label className="text-xs text-slate-400">Pencarian / Filter Kata Kunci:</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Masukkan kata kunci pencarian..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition cursor-pointer shadow-lg shadow-indigo-600/10"
                  >
                    Cari Sekarang
                  </button>
                </form>
              </div>

              {/* Selection details */}
              {selectedItem && (
                <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl space-y-4 animate-fadeIn">
                  <h3 className="font-extrabold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Eye className="w-4 h-4 text-indigo-400" /> Detail Entitas Data
                  </h3>
                  <div className="space-y-3 text-xs max-h-[350px] overflow-y-auto font-mono">
                    {Object.entries(selectedItem).map(([key, val]: any) => {
                      if (typeof val === 'object' && val !== null) {
                        return (
                          <div key={key} className="border-t border-slate-800 pt-2 mt-2">
                            <span className="text-indigo-400 font-bold">{key}:</span>
                            <pre className="text-[10px] text-slate-400 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(val, null, 2)}</pre>
                          </div>
                        );
                      }
                      return (
                        <div key={key} className="flex flex-col border-b border-slate-800 pb-1.5">
                          <span className="text-slate-400 font-bold">{key}</span>
                          <span className="text-slate-100 break-words">{String(val)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Table data view */}
            <div className="lg:col-span-2">
              <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-850 rounded-3xl shadow-2xl overflow-hidden min-h-[500px]">
                {loadingData ? (
                  <div className="flex flex-col items-center justify-center h-[500px]">
                    <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
                    <p className="text-slate-400 text-sm">Menarik data dari database...</p>
                  </div>
                ) : browseData ? (
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-white uppercase tracking-wider text-xs">
                        Hasil Eksplorasi (Maks 50 Baris)
                      </h3>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-[10px] text-slate-400 font-bold">
                        Ditemukan: {dataType === 'soap' ? (browseData.ralan.length + browseData.ranap.length) : browseData.length} records
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      {/* BROWSE: PASIEN */}
                      {dataType === 'pasien' && (
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-850 text-slate-400 font-bold">
                              <th className="py-3 px-2">No. RM</th>
                              <th className="py-3 px-2">Nama Pasien</th>
                              <th className="py-3 px-2">Umur</th>
                              <th className="py-3 px-2">Pekerjaan</th>
                              <th className="py-3 px-2">Alamat</th>
                              <th className="py-3 px-2 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {browseData.map((p: any) => (
                              <tr key={p.no_rkm_medis} className="border-b border-slate-850/50 hover:bg-slate-900/40 transition">
                                <td className="py-3 px-2 font-mono text-indigo-400">{p.no_rkm_medis}</td>
                                <td className="py-3 px-2 font-bold text-slate-200">{p.nm_pasien}</td>
                                <td className="py-3 px-2 text-slate-300">{p.umur}</td>
                                <td className="py-3 px-2 text-slate-400">{p.pekerjaan}</td>
                                <td className="py-3 px-2 text-slate-400 max-w-[150px] truncate">{p.alamat}</td>
                                <td className="py-3 px-2 text-right">
                                  <button onClick={() => setSelectedItem(p)} className="px-2 py-1 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] cursor-pointer">Lihat</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {/* BROWSE: REGISTRASI */}
                      {dataType === 'registrasi' && (
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-850 text-slate-400 font-bold">
                              <th className="py-3 px-2">No. Rawat</th>
                              <th className="py-3 px-2">Pasien</th>
                              <th className="py-3 px-2">Poli</th>
                              <th className="py-3 px-2">Status</th>
                              <th className="py-3 px-2">Bayar</th>
                              <th className="py-3 px-2 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {browseData.map((r: any) => (
                              <tr key={r.no_rawat} className="border-b border-slate-850/50 hover:bg-slate-900/40 transition">
                                <td className="py-3 px-2 font-mono text-slate-200">{r.no_rawat}</td>
                                <td className="py-3 px-2 text-slate-300">
                                  <p className="font-bold">{r.pasien?.nm_pasien}</p>
                                  <p className="text-[10px] text-slate-500 font-mono">{r.no_rkm_medis}</p>
                                </td>
                                <td className="py-3 px-2 text-slate-400">{r.poliklinik?.nm_poli}</td>
                                <td className="py-3 px-2">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${r.stts === 'Sudah' ? 'bg-emerald-500/10 text-emerald-400' : r.stts === 'Dirawat' ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800 text-slate-400'}`}>{r.stts}</span>
                                </td>
                                <td className="py-3 px-2">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${r.status_bayar === 'Sudah_Bayar' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{r.status_bayar}</span>
                                </td>
                                <td className="py-3 px-2 text-right">
                                  <button onClick={() => setSelectedItem(r)} className="px-2 py-1 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] cursor-pointer">Lihat</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {/* BROWSE: SOAP (Ralan & Ranap) */}
                      {dataType === 'soap' && (
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-extrabold text-indigo-400 text-sm mb-3"># Rekam Medis Rawat Jalan (SOAP Ralan)</h4>
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-slate-850 text-slate-400 font-bold">
                                  <th className="py-3 px-2">No. Rawat</th>
                                  <th className="py-3 px-2">Pasien</th>
                                  <th className="py-3 px-2">Keluhan</th>
                                  <th className="py-3 px-2">Diagnosis/Asesmen</th>
                                  <th className="py-3 px-2 text-right">Aksi</th>
                                </tr>
                              </thead>
                              <tbody>
                                {browseData.ralan.map((rl: any, idx: number) => (
                                  <tr key={idx} className="border-b border-slate-850/50 hover:bg-slate-900/40 transition">
                                    <td className="py-3 px-2 font-mono text-slate-300">{rl.no_rawat}</td>
                                    <td className="py-3 px-2 font-bold text-slate-200">{rl.reg_periksa?.pasien?.nm_pasien}</td>
                                    <td className="py-3 px-2 text-slate-400 max-w-[120px] truncate">{rl.keluhan}</td>
                                    <td className="py-3 px-2 text-slate-400 max-w-[120px] truncate">{rl.penilaian}</td>
                                    <td className="py-3 px-2 text-right">
                                      <button onClick={() => setSelectedItem(rl)} className="px-2 py-1 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] cursor-pointer">Lihat</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div>
                            <h4 className="font-extrabold text-sky-400 text-sm mb-3"># Rekam Medis Rawat Inap (SOAP Ranap)</h4>
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-slate-850 text-slate-400 font-bold">
                                  <th className="py-3 px-2">No. Rawat</th>
                                  <th className="py-3 px-2">Pasien</th>
                                  <th className="py-3 px-2">Keluhan Inap</th>
                                  <th className="py-3 px-2">Perkembangan</th>
                                  <th className="py-3 px-2 text-right">Aksi</th>
                                </tr>
                              </thead>
                              <tbody>
                                {browseData.ranap.map((rn: any, idx: number) => (
                                  <tr key={idx} className="border-b border-slate-850/50 hover:bg-slate-900/40 transition">
                                    <td className="py-3 px-2 font-mono text-slate-300">{rn.no_rawat}</td>
                                    <td className="py-3 px-2 font-bold text-slate-200">{rn.reg_periksa?.pasien?.nm_pasien}</td>
                                    <td className="py-3 px-2 text-slate-400 max-w-[120px] truncate">{rn.keluhan}</td>
                                    <td className="py-3 px-2 text-slate-400 max-w-[120px] truncate">{rn.pemeriksaan}</td>
                                    <td className="py-3 px-2 text-right">
                                      <button onClick={() => setSelectedItem(rn)} className="px-2 py-1 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] cursor-pointer">Lihat</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* BROWSE: RESEP */}
                      {dataType === 'resep' && (
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-850 text-slate-400 font-bold">
                              <th className="py-3 px-2">No. Resep</th>
                              <th className="py-3 px-2">Pasien</th>
                              <th className="py-3 px-2">Dokter Pembuat</th>
                              <th className="py-3 px-2">Tgl Resep</th>
                              <th className="py-3 px-2">Items</th>
                              <th className="py-3 px-2 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {browseData.map((rp: any) => (
                              <tr key={rp.no_resep} className="border-b border-slate-850/50 hover:bg-slate-900/40 transition">
                                <td className="py-3 px-2 font-mono text-amber-400">{rp.no_resep}</td>
                                <td className="py-3 px-2 text-slate-300">
                                  <p className="font-bold">{rp.reg_periksa?.pasien?.nm_pasien}</p>
                                  <p className="text-[10px] text-slate-500 font-mono">{rp.no_rawat}</p>
                                </td>
                                <td className="py-3 px-2 text-slate-400">{rp.dokter?.nm_dokter}</td>
                                <td className="py-3 px-2 text-slate-400">{rp.tgl_perawatan ? new Date(rp.tgl_perawatan).toLocaleDateString('id-ID') : '-'}</td>
                                <td className="py-3 px-2 font-mono text-[10px] text-amber-500">{rp.resep_dokter?.length || 0} item obat</td>
                                <td className="py-3 px-2 text-right">
                                  <button onClick={() => setSelectedItem(rp)} className="px-2 py-1 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] cursor-pointer">Lihat</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {/* BROWSE: JURNAL */}
                      {dataType === 'jurnal' && (
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-850 text-slate-400 font-bold">
                              <th className="py-3 px-2">No. Jurnal</th>
                              <th className="py-3 px-2">No. Bukti / Nota</th>
                              <th className="py-3 px-2">Keterangan Jurnal</th>
                              <th className="py-3 px-2">Tgl Jurnal</th>
                              <th className="py-3 px-2">Debet/Kredit</th>
                              <th className="py-3 px-2 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {browseData.map((j: any) => {
                              const debet = j.detailjurnal?.find((dj: any) => dj.debet > 0)?.debet || 0;
                              return (
                                <tr key={j.no_jurnal} className="border-b border-slate-850/50 hover:bg-slate-900/40 transition">
                                  <td className="py-3 px-2 font-mono text-emerald-400 font-bold">{j.no_jurnal}</td>
                                  <td className="py-3 px-2 font-mono text-slate-300">{j.no_bukti}</td>
                                  <td className="py-3 px-2 text-slate-400 max-w-[150px] truncate">{j.keterangan}</td>
                                  <td className="py-3 px-2 text-slate-400">{j.tgl_jurnal ? new Date(j.tgl_jurnal).toLocaleDateString('id-ID') : '-'}</td>
                                  <td className="py-3 px-2 font-bold text-slate-200">Rp {debet.toLocaleString('id-ID')}</td>
                                  <td className="py-3 px-2 text-right">
                                    <button onClick={() => setSelectedItem(j)} className="px-2 py-1 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] cursor-pointer">Lihat</button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}

                      {/* BROWSE: MUTASI */}
                      {dataType === 'mutasi' && (
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-850 text-slate-400 font-bold">
                              <th className="py-3 px-2">Kode Barang</th>
                              <th className="py-3 px-2">Nama Barang Medis</th>
                              <th className="py-3 px-2">Masuk</th>
                              <th className="py-3 px-2">Keluar</th>
                              <th className="py-3 px-2">Bangsal / Depo</th>
                              <th className="py-3 px-2">Keterangan Mutasi</th>
                              <th className="py-3 px-2 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {browseData.map((m: any, idx: number) => (
                              <tr key={idx} className="border-b border-slate-850/50 hover:bg-slate-900/40 transition">
                                <td className="py-3 px-2 font-mono text-slate-300">{m.kode_brng}</td>
                                <td className="py-3 px-2 font-bold text-slate-200">{m.databarang?.nama_brng || 'Barang Medis'}</td>
                                <td className="py-3 px-2 text-emerald-400 font-bold">{m.masuk}</td>
                                <td className="py-3 px-2 text-rose-400 font-bold">{m.keluar}</td>
                                <td className="py-3 px-2 text-slate-400">{m.bangsal?.nm_bangsal || '-'}</td>
                                <td className="py-3 px-2 text-slate-400 max-w-[120px] truncate">{m.keterangan}</td>
                                <td className="py-3 px-2 text-right">
                                  <button onClick={() => setSelectedItem(m)} className="px-2 py-1 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] cursor-pointer">Lihat</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[500px]">
                    <p className="text-slate-400 text-sm">Tidak ada data untuk ditampilkan. Harap cari/pilih entitas.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DataMonitoring;
