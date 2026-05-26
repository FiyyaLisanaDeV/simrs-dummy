import { apiFetch } from '../lib/api';
import { useState, useEffect } from 'react';

export default function Laboratorium() {
  const [antrean, setAntrean] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedPasien, setSelectedPasien] = useState<any>(null);
  const [templateLab, setTemplateLab] = useState<any[]>([]);
  const [hasil, setHasil] = useState<any>({});

  const fetchAntrean = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('http://localhost:3000/lab/antrean');
      if (res.ok) {
        setAntrean(await res.json());
      }
    } catch (err) {
      setError('Gagal memuat antrean lab.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAntrean();
  }, []);

  const openHasilForm = async (pasien: any) => {
    setSelectedPasien(pasien);
    setHasil({});
    
    // Fetch template
    try {
      const res = await apiFetch(`http://localhost:3000/lab/template?kd_jenis_prw=${pasien.kd_jenis_prw}`);
      if (res.ok) {
        setTemplateLab(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (id_template: number, value: string) => {
    setHasil({ ...hasil, [id_template]: value });
  };

  const submitHasil = async () => {
    if (!selectedPasien) return;

    const payload = {
      no_rawat: selectedPasien.no_rawat,
      kd_jenis_prw: selectedPasien.kd_jenis_prw,
      tgl_periksa: selectedPasien.tgl_periksa,
      jam: selectedPasien.jam,
      hasil: templateLab.map(t => ({
        id_template: t.id_template,
        nilai: hasil[t.id_template] || '',
        nilai_rujukan: t.nilai_rujukan_ld, // Simplified
        keterangan: ''
      }))
    };

    try {
      const res = await apiFetch('http://localhost:3000/lab/hasil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Hasil Lab berhasil disimpan!');
        setSelectedPasien(null);
        fetchAntrean();
      } else {
        alert('Gagal menyimpan hasil lab');
      }
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Laboratorium
            </h1>
            <p className="text-gray-400 text-sm mt-1">Daftar Permintaan & Input Hasil Pemeriksaan</p>
          </div>
          <button 
            onClick={fetchAntrean}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition"
          >
            🔄 Refresh Antrean
          </button>
        </div>

        {loading && <p className="text-blue-400 animate-pulse">Memuat antrean...</p>}
        {error && <p className="text-red-400">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom Kiri: Antrean */}
          <div className="space-y-4">
            <h2 className="font-bold text-xl mb-4">Menunggu Hasil</h2>
            {antrean.map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:border-blue-500/50 transition cursor-pointer" onClick={() => openHasilForm(item)}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{item.reg_periksa?.pasien?.nm_pasien || 'Anonim'}</h3>
                  <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded font-mono">{String(item.jam).substring(11,16)}</span>
                </div>
                <p className="text-sm text-gray-300">Pemeriksaan: {item.jns_perawatan_lab?.nm_perawatan}</p>
                <p className="text-xs text-gray-500 mt-2 font-mono">No Rawat: {item.no_rawat}</p>
              </div>
            ))}
            {antrean.length === 0 && !loading && (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-gray-400">Tidak ada permintaan lab.</p>
              </div>
            )}
          </div>

          {/* Kolom Kanan: Form Input Hasil */}
          {selectedPasien ? (
            <div className="bg-white/5 border border-blue-500/30 rounded-2xl p-6 h-fit">
              <h2 className="font-bold text-xl mb-2 text-blue-400">Input Hasil Pemeriksaan</h2>
              <p className="text-sm text-gray-300 mb-6">Pasien: {selectedPasien.reg_periksa?.pasien?.nm_pasien} - {selectedPasien.jns_perawatan_lab?.nm_perawatan}</p>
              
              <div className="space-y-4 mb-6">
                {templateLab.map((t) => (
                  <div key={t.id_template} className="grid grid-cols-2 gap-4 items-center bg-black/30 p-3 rounded-lg border border-white/5">
                    <div>
                      <p className="text-sm font-semibold">{t.Pemeriksaan}</p>
                      <p className="text-xs text-gray-500">Nilai Rujukan: {t.nilai_rujukan_ld} {t.satuan}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="text"
                        placeholder="Hasil..."
                        value={hasil[t.id_template] || ''}
                        onChange={(e) => handleInputChange(t.id_template, e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-xs text-gray-400">{t.satuan}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setSelectedPasien(null)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition font-bold"
                >
                  Batal
                </button>
                <button 
                  onClick={submitHasil}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                >
                  Simpan & Teruskan
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[300px] border border-dashed border-white/10 rounded-2xl">
              <p className="text-gray-500">Pilih pasien di antrean untuk menginput hasil.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
