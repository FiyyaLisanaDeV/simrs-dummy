import { apiFetch } from '../lib/api';
import { useState } from 'react';
import { Lock, Unlock, ChevronLeft, ChevronRight, Search, Info, CheckCircle2, Building, User, CreditCard, FileText } from 'lucide-react';

export default function Registration() {
  const [keyword, setKeyword] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  
  // Escape Hatch State
  const [showEscapeHatch, setShowEscapeHatch] = useState(false);
  const [bypassNoSep, setBypassNoSep] = useState('');

  // Dummy values for Poli, Dokter, Asuransi for now
  const kd_poli = 'U0001';
  const kd_dokter = 'D0000004';

  const handleSearch = async (pageNum: number = 1) => {
    try {
      const res = await apiFetch(`http://localhost:3000/api/patients/search?q=${keyword}&page=${pageNum}&limit=10`);
      const data = await res.json();
      setPatients(data.data);
      setMeta(data.meta);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async () => {
    if (!selectedPatient) return;
    try {
      const payload = {
        no_rkm_medis: selectedPatient.no_rkm_medis,
        kd_dokter,
        kd_poli,
        kd_pj: selectedPatient.kd_pj,
        bypassNoSep: showEscapeHatch ? bypassNoSep : undefined
      };
      const res = await apiFetch('http://localhost:3000/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Pendaftaran berhasil! SEP diproses otonom' + (showEscapeHatch ? ' via Escape Hatch.' : '.'));
        setSelectedPatient(null);
        setKeyword('');
        setPatients([]);
        setMeta(null);
        setShowEscapeHatch(false);
        setBypassNoSep('');
      } else {
        const errorData = await res.json();
        alert(`Gagal: ${errorData.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mendaftar');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(1)}
            placeholder="Cari NIK / Nama Pasien..." 
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] transition-shadow"
          />
        </div>
        <button 
          onClick={() => handleSearch(1)}
          className="bg-[#004d40] hover:bg-[#00332a] text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors whitespace-nowrap"
        >
          Cari Data Pasien
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Results */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Hasil Pencarian</h2>
            {meta ? (
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">{meta.total} Hasil</span>
            ) : null}
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto mb-4 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
            {patients.map(p => {
              const isSelected = selectedPatient?.no_rkm_medis === p.no_rkm_medis;
              return (
                <div 
                  key={p.no_rkm_medis} 
                  onClick={() => setSelectedPatient(p)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${isSelected ? 'border-[#004d40] bg-[#004d40]/5 shadow-sm' : 'border-slate-200 hover:border-[#004d40]/30 hover:bg-slate-50'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#004d40] text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-slate-800 text-sm truncate">{p.nm_pasien}</div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-[#004d40] shrink-0" />}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                      <span>RM: {p.no_rkm_medis}</span>
                      <span>•</span>
                      <span>NIK: {p.no_ktp}</span>
                    </div>
                    <div className="text-xs mt-2 text-[#004d40] font-medium flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" /> Penjamin: {p.penjab?.png_jawab || p.kd_pj}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {patients.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 mt-20">
                <Search className="w-12 h-12 text-slate-200" />
                <p className="text-sm">Silakan lakukan pencarian pasien</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
              <button 
                onClick={() => handleSearch(meta.page - 1)}
                disabled={meta.page <= 1}
                className="px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-semibold text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </button>
              <div className="text-xs text-slate-500 font-medium">
                Halaman {meta.page} dari {meta.totalPages}
              </div>
              <button 
                onClick={() => handleSearch(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-semibold text-slate-600 transition-colors"
              >
                Selanjutnya <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Action Form */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Aksi Pendaftaran</h2>
            <button 
              onClick={() => setShowEscapeHatch(!showEscapeHatch)} 
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              title="Bridging Escape Hatch (Bypass SEP)"
            >
              {showEscapeHatch ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </button>
          </div>

          {selectedPatient ? (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-800 mb-1">Pasien Terpilih</p>
                  <p className="text-sm font-bold text-blue-900">{selectedPatient.nm_pasien}</p>
                  <p className="text-xs text-blue-700 mt-0.5">No. RM: {selectedPatient.no_rkm_medis} • NIK: {selectedPatient.no_ktp}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Poli Tujuan</label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <select className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] bg-white appearance-none">
                    <option value={kd_poli}>Poli Penyakit Dalam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Dokter Penanggung Jawab</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <select className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] bg-white appearance-none">
                    <option value={kd_dokter}>dr. DWI SETYAWAN, Sp.PD</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Penjamin / Asuransi</label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <select className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] bg-white appearance-none">
                    <option value={selectedPatient.kd_pj}>{selectedPatient.penjab?.png_jawab || 'BPJS Kesehatan'}</option>
                  </select>
                </div>
              </div>

              {showEscapeHatch && (
                <div className="p-4 bg-rose-50 rounded-lg border border-rose-200 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-bold text-rose-700 mb-1">Nomor SEP (Manual Input)</label>
                  <p className="text-[10px] text-rose-600 mb-3">Gunakan jika V-Claim offline / bridging error.</p>
                  <div className="relative">
                    <FileText className="absolute left-3 top-2.5 w-4 h-4 text-rose-400" />
                    <input 
                      type="text" 
                      value={bypassNoSep}
                      onChange={(e) => setBypassNoSep(e.target.value)}
                      placeholder="Masukkan 19 digit Nomor SEP..."
                      maxLength={19}
                      className="w-full pl-9 pr-4 py-2 border border-rose-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                    />
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-[10px] text-rose-500">{bypassNoSep.length} / 19</span>
                  </div>
                </div>
              )}
              
              <div className="pt-2">
                <button 
                  onClick={handleRegister}
                  className="w-full bg-[#004d40] hover:bg-[#00332a] text-white font-semibold py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" /> Simpan Pendaftaran
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 space-y-3 h-[300px]">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                <User className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm text-center px-4">Pilih pasien dari hasil pencarian untuk memulai proses pendaftaran</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
