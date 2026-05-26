import { apiFetch } from '../lib/api';
import { useEffect, useState } from 'react';
import { Bed, UserPlus, Building2, Search, CheckCircle2, BedSingle } from 'lucide-react';

export default function BedManagement() {
  const [beds, setBeds] = useState<any[]>([]);
  const [noRawat, setNoRawat] = useState('');

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    try {
      const res = await apiFetch('http://localhost:3000/ranap/kamar');
      const data = await res.json();
      setBeds(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdmit = async (kd_kamar: string) => {
    if (!noRawat) {
      alert("Masukkan No Rawat pasien terlebih dahulu!");
      return;
    }
    
    try {
      const res = await apiFetch('http://localhost:3000/ranap/admisi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ no_rawat: noRawat, kd_kamar, diagnosa_awal: '-' })
      });
      if (res.ok) {
        alert("Pasien sukses didaftarkan ke Rawat Inap!");
        setNoRawat('');
        fetchBeds(); // Refresh bed list
      } else {
        alert("Gagal mendaftarkan pasien. Pastikan No Rawat terdaftar di reg_periksa hari ini.");
      }
    } catch (err) {
      console.error(err);
      alert("Error system.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Bed className="w-6 h-6 text-[#004d40]" /> Manajemen Kamar & Admisi Rawat Inap
        </h1>
        <p className="text-sm text-slate-500 mt-1">Sistem informasi ketersediaan tempat tidur dan pendaftaran rawat inap.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kolom Kiri: Form Admisi */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-6">
            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#004d40]" /> Input Data Admisi
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">No Rawat Referensi (IGD/Poli)</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={noRawat}
                    onChange={(e) => setNoRawat(e.target.value)}
                    placeholder="YYYY/MM/DD/NNNNNN" 
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40]"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
                  * Untuk demonstrasi: Isi No Rawat valid dari registrasi hari ini (contoh: 2026/04/20/000001), lalu klik "Tempatkan Pasien" pada bed yang kosong di sebelah kanan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Daftar Kasur Kosong */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#004d40]" /> Bed / Kamar Tersedia (KOSONG)
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {beds.map(bed => (
                <div key={bed.kd_kamar} className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                  
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-bold text-lg text-slate-800">{bed.kd_kamar}</span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Kosong
                    </span>
                  </div>
                  
                  <div className="space-y-1 mb-5 flex-1">
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> <span className="font-semibold text-slate-700">{bed.bangsal?.nm_bangsal}</span>
                    </p>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <BedSingle className="w-3.5 h-3.5 text-slate-400" /> Kelas: <span className="font-semibold text-slate-700">{bed.kelas}</span>
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handleAdmit(bed.kd_kamar)}
                    className="w-full bg-[#004d40]/10 hover:bg-[#004d40] text-[#004d40] hover:text-white font-bold py-2 rounded-lg text-sm transition-colors border border-[#004d40]/20 flex items-center justify-center gap-1.5 mt-auto"
                  >
                    <UserPlus className="w-4 h-4" /> Tempatkan Pasien
                  </button>
                </div>
              ))}
            </div>

            {beds.length === 0 && (
              <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                <Bed className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-500">Tidak ada kamar rawat inap yang kosong saat ini.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
