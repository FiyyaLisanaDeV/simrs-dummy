import { apiFetch } from '../lib/api';
import { useState, useEffect } from 'react';

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
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Farmasi & Apotek
            </h1>
            <p className="text-gray-400 text-sm mt-1">Layar Validasi Resep & Penyerahan Obat (Front-Office)</p>
          </div>
          <button 
            onClick={fetchAntrean}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition"
          >
            🔄 Refresh Antrean
          </button>
        </div>

        {loading && <p className="text-teal-400 animate-pulse">Memuat antrean resep...</p>}
        {error && <p className="text-red-400">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {antrean.map((resep) => (
            <div key={resep.no_resep} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:border-teal-500/50 transition relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{resep.reg_periksa?.pasien?.nm_pasien || 'Pasien Anonim'}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-1">{resep.no_rawat}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono bg-black/40 px-2 py-1 rounded text-teal-400">
                    {String(resep.jam).substring(11, 16)}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Dokter: {resep.dokter?.nm_dokter}</p>
                <div className="space-y-2 bg-black/30 p-3 rounded-xl max-h-[150px] overflow-y-auto">
                  {resep.resep_dokter?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <div>
                        <span className="text-teal-300 font-bold">{item.jml}x </span>
                        <span className="text-gray-200">{item.databarang?.nama_brng}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">{item.aturan_pakai}</span>
                    </div>
                  ))}
                  {resep.resep_dokter?.length === 0 && <p className="text-xs text-amber-500">Hanya resep racikan (Belum disupport UI MVP).</p>}
                </div>
              </div>

              <button 
                onClick={() => validasiResep(resep.no_resep)}
                className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.3)] transition"
              >
                Validasi & Serahkan
              </button>
            </div>
          ))}
          {antrean.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center bg-white/5 rounded-2xl border border-white/10 border-dashed">
              <p className="text-gray-400">🎉 Tidak ada antrean resep saat ini.</p>
            </div>
          )}
        </div>

        {/* Modal Otorisasi Stok Minus */}
        {showOverrideModal && minusData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-neutral-900 border border-red-500/50 p-8 rounded-3xl w-full max-w-lg shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500 rounded-t-3xl"></div>
              
              <h2 className="text-2xl font-bold text-red-400 mb-2 mt-2">Peringatan: Stok Tidak Cukup!</h2>
              <p className="text-sm text-gray-400 mb-6">{minusData.message}</p>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <h4 className="font-bold text-red-300 text-sm mb-3">Rincian Kekurangan Stok:</h4>
                <div className="space-y-2">
                  {minusData.details.map((m: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-200">{m.nama}</span>
                      <div className="text-right">
                        <span className="text-red-400 font-bold">{m.tersedia}</span>
                        <span className="text-gray-500 mx-1">/</span>
                        <span className="text-gray-300">{m.dibutuhkan}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Masukkan PIN Supervisor (Override)</label>
                <input 
                  type="password" 
                  value={overridePin}
                  onChange={(e) => setOverridePin(e.target.value)}
                  placeholder="PIN Otorisasi..."
                  className="w-full bg-black/50 border border-red-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-red-500/70 mt-2 italic">*Aksi ini akan memaksa stok menjadi minus dan mencatat log aktivitas.</p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setShowOverrideModal(false);
                    setOverridePin('');
                  }}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button 
                  onClick={() => validasiResep(selectedResep, overridePin)}
                  disabled={!overridePin}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition disabled:opacity-50"
                >
                  Paksa Validasi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
