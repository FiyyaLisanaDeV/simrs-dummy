import { apiFetch } from '../lib/api';
import { useState, useEffect } from 'react';
import { Pill, RefreshCw, CheckCircle2, AlertTriangle, Key, X, Info, User, Clock, Stethoscope } from 'lucide-react';

export default function Apotek() {
  const [antrean, setAntrean] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Stok Minus Override State
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [minusData, setMinusData] = useState<any>(null);
  const [overridePin, setOverridePin] = useState('');
  const [selectedResep, setSelectedResep] = useState('');

  const fetchAntrean = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('http://localhost:3000/farmasi/antrean-resep');
      if (res.ok) {
        setAntrean(await res.json());
      }
    } catch (err) {
      setError('Gagal memuat antrean resep.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAntrean();
    // In a real app, you might want to poll this or use websockets
    const interval = setInterval(fetchAntrean, 10000); 
    return () => clearInterval(interval);
  }, []);

  const validasiResep = async (no_resep: string, pin?: string) => {
    try {
      const payload: any = { no_resep };
      if (pin) payload.pin_override = pin;

      const res = await apiFetch('http://localhost:3000/farmasi/validasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Validasi Berhasil! Tagihan telah diteruskan ke Kasir.');
        setShowOverrideModal(false);
        setOverridePin('');
        fetchAntrean();
      } else {
        const errData = await res.json();
        // Cek jika error adalah STOK_KURANG
        if (errData.code === 'STOK_KURANG') {
          setMinusData(errData);
          setSelectedResep(no_resep);
          setShowOverrideModal(true);
        } else {
          alert(`Gagal Validasi: ${errData.message || 'Unknown Error'}`);
        }
      }
    } catch (err: any) {
      alert(`Error sistem: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Pill className="w-6 h-6 text-[#004d40]" /> Pelayanan Farmasi & Apotek
          </h1>
          <p className="text-sm text-slate-500 mt-1">Antrean Validasi E-Resep & Penyerahan Obat (Front-Office)</p>
        </div>
        <button 
          onClick={fetchAntrean}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 border border-slate-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#004d40]' : ''}`} /> Refresh Antrean
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-200 text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {antrean.map((resep) => (
          <div key={resep.no_resep} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden group">
            <div className="h-1.5 w-full bg-[#004d40]"></div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#004d40]" /> {resep.reg_periksa?.pasien?.nm_pasien || 'Pasien Anonim'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-1">Rawat: {resep.no_rawat}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold font-mono bg-[#004d40]/10 text-[#004d40] px-2.5 py-1 rounded-md flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {String(resep.jam).substring(11, 16)}
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5" /> dr. {resep.dokter?.nm_dokter}
                </p>
                <div className="space-y-2 bg-slate-50 border border-slate-100 p-3 rounded-lg max-h-[150px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                  {resep.resep_dokter?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                      <div>
                        <span className="font-bold text-[#004d40] mr-2 bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100">{item.jml}x</span>
                        <span className="text-slate-700 font-medium">{item.databarang?.nama_brng}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded whitespace-nowrap">{item.aturan_pakai}</span>
                    </div>
                  ))}
                  {resep.resep_dokter?.length === 0 && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" /> Resep Racikan (Belum support)
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-5 mt-auto">
                <button 
                  onClick={() => validasiResep(resep.no_resep)}
                  className="w-full py-2.5 bg-[#004d40] hover:bg-[#00332a] text-white font-bold rounded-lg shadow-sm transition-colors flex justify-center items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" /> Validasi & Serahkan
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {antrean.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-slate-300">
            <Pill className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p className="text-sm text-slate-500 font-medium">Tidak ada antrean resep saat ini.</p>
          </div>
        )}
      </div>

      {/* Modal Otorisasi Stok Minus */}
      {showOverrideModal && minusData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500"></div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-rose-600 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" /> Stok Obat Tidak Cukup!
                </h2>
                <button onClick={() => {setShowOverrideModal(false); setOverridePin('');}} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-sm text-slate-600 mb-6">{minusData.message}</p>
              
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-6">
                <h4 className="font-bold text-rose-800 text-xs uppercase tracking-wider mb-3">Rincian Kekurangan Stok</h4>
                <div className="space-y-3">
                  {minusData.details.map((m: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm border-b border-rose-100/50 pb-2 last:border-0 last:pb-0">
                      <span className="font-medium text-slate-800">{m.nama}</span>
                      <div className="bg-white px-2 py-1 rounded shadow-sm border border-rose-100 text-xs">
                        <span className="text-rose-600 font-bold">{m.tersedia}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-slate-600 font-medium">{m.dibutuhkan}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5" /> PIN Otorisasi Supervisor
                </label>
                <input 
                  type="password" 
                  value={overridePin}
                  onChange={(e) => setOverridePin(e.target.value)}
                  placeholder="Masukkan 6 Digit PIN..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono tracking-widest text-center text-lg"
                />
                <p className="text-xs text-rose-500 mt-2 font-medium bg-rose-50 p-2 rounded border border-rose-100">
                  ⚠️ Aksi ini akan memaksa stok menjadi minus dan mencatat log sistem.
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setShowOverrideModal(false);
                    setOverridePin('');
                  }}
                  className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={() => validasiResep(selectedResep, overridePin)}
                  disabled={!overridePin}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" /> Paksa Validasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
