import { apiFetch } from '../lib/api';
import { useState, useEffect } from 'react';
import { FlaskConical, RefreshCw, ClipboardList, CheckCircle2, User, Clock, FileText, Activity } from 'lucide-react';

export default function Laboratorium() {
  const [antrean, setAntrean] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedPasien, setSelectedPasien] = useState<any>(null);
  const [templateLab, setTemplateLab] = useState<any[]>([]);
  const [hasil, setHasil] = useState<any>({});

  const fetchAntrean = async () => {
    setLoading(true);
    setError('');
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
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-[#004d40]" /> Laboratorium Patologi Klinik
          </h1>
          <p className="text-sm text-slate-500 mt-1">Daftar Antrean Permintaan & Input Hasil Pemeriksaan</p>
        </div>
        <button 
          onClick={fetchAntrean}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 border border-slate-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#004d40]' : ''}`} /> Refresh Antrean
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-200 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Antrean */}
        <div className="lg:col-span-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#004d40]" /> Menunggu Hasil
            </h2>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-2">
              {antrean.map((item, idx) => {
                const isSelected = selectedPasien?.no_rawat === item.no_rawat && selectedPasien?.kd_jenis_prw === item.kd_jenis_prw;
                return (
                  <div 
                    key={idx} 
                    onClick={() => openHasilForm(item)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-[#004d40] bg-[#004d40]/5 shadow-sm' : 'border-slate-200 hover:border-[#004d40]/30 hover:bg-slate-50'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[#004d40]" /> {item.reg_periksa?.pasien?.nm_pasien || 'Anonim'}
                      </h3>
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {String(item.jam).substring(11,16)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#004d40] mb-1 bg-white inline-block px-2 py-0.5 rounded border border-slate-100 shadow-sm">
                      {item.jns_perawatan_lab?.nm_perawatan}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-2 pt-2 border-t border-slate-100">
                      RM: {item.reg_periksa?.no_rkm_medis} | Rawat: {item.no_rawat}
                    </p>
                  </div>
                );
              })}
              
              {antrean.length === 0 && !loading && (
                <div className="text-center py-12 text-slate-400">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                  <p className="text-sm">Tidak ada permintaan lab saat ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Form Input Hasil */}
        <div className="lg:col-span-7">
          {selectedPasien ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit sticky top-6">
              <h2 className="text-lg font-bold text-[#004d40] mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Input Hasil Pemeriksaan
              </h2>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mb-6">
                <p className="text-sm font-bold text-slate-800">{selectedPasien.reg_periksa?.pasien?.nm_pasien}</p>
                <p className="text-xs text-slate-500 mt-1">{selectedPasien.jns_perawatan_lab?.nm_perawatan} • RM: {selectedPasien.reg_periksa?.no_rkm_medis}</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-12 gap-4 px-3 pb-2 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-6">Parameter Pemeriksaan</div>
                  <div className="col-span-6">Hasil & Satuan</div>
                </div>
                {templateLab.map((t) => (
                  <div key={t.id_template} className="grid grid-cols-12 gap-4 items-center bg-white p-3 rounded-lg border border-slate-200 hover:border-[#004d40]/30 transition-colors">
                    <div className="col-span-6">
                      <p className="text-sm font-bold text-slate-800">{t.Pemeriksaan}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Nilai Rujukan: {t.nilai_rujukan_ld} {t.satuan}</p>
                    </div>
                    <div className="col-span-6 flex gap-2 items-center">
                      <input 
                        type="text"
                        placeholder="Nilai..."
                        value={hasil[t.id_template] || ''}
                        onChange={(e) => handleInputChange(t.id_template, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] font-semibold text-slate-800"
                      />
                      <span className="text-xs font-mono text-slate-500 whitespace-nowrap">{t.satuan}</span>
                    </div>
                  </div>
                ))}
                {templateLab.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-sm">Memuat template parameter...</div>
                )}
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setSelectedPasien(null)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={submitHasil}
                  className="flex-1 py-2.5 bg-[#004d40] hover:bg-[#00332a] text-white rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" /> Simpan Hasil & Verifikasi
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center h-full min-h-[400px] text-slate-400">
              <FlaskConical className="w-16 h-16 mb-4 text-slate-200" />
              <p className="text-sm font-medium">Pilih pasien di daftar antrean untuk mulai menginput hasil.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
