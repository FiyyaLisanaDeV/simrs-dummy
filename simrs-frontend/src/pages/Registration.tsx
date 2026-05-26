import { apiFetch } from '../lib/api';
import { useState } from 'react';
import { FiLock, FiUnlock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

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
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Pendaftaran Pasien (Modul 1)</h1>
      
      <div className="flex gap-4 mb-8">
        <input 
          type="text" 
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(1)}
          placeholder="Cari NIK / Nama Pasien..." 
          className="px-4 py-2 border rounded-lg w-1/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={() => handleSearch(1)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-md transition-colors"
        >
          Cari Data SIMRS Dummy
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Search Results */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col">
          <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
            Hasil Pencarian
            {meta && <span className="text-sm font-normal text-gray-500">Total: {meta.total} pasien</span>}
          </h2>
          
          <div className="space-y-3 flex-1 overflow-y-auto mb-4">
            {patients.map(p => (
              <div 
                key={p.no_rkm_medis} 
                onClick={() => setSelectedPatient(p)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedPatient?.no_rkm_medis === p.no_rkm_medis ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
              >
                <div className="font-bold text-lg">{p.nm_pasien}</div>
                <div className="text-sm text-gray-500">RM: {p.no_rkm_medis} | NIK: {p.no_ktp}</div>
                <div className="text-xs mt-1 bg-green-100 text-green-800 inline-block px-2 py-1 rounded">
                  Asuransi: {p.penjab?.png_jawab || p.kd_pj}
                </div>
              </div>
            ))}
            {patients.length === 0 && <div className="text-gray-400">Tidak ada data ditemukan.</div>}
          </div>

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
              <button 
                onClick={() => handleSearch(meta.page - 1)}
                disabled={meta.page <= 1}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium"
              >
                <FiChevronLeft /> Prev
              </button>
              <div className="text-sm text-gray-500 font-medium">
                Hal {meta.page} dari {meta.totalPages}
              </div>
              <button 
                onClick={() => handleSearch(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium"
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </div>

        {/* Action Form */}
        {selectedPatient && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-fit">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-900">Aksi Pendaftaran</h2>
              <button 
                onClick={() => setShowEscapeHatch(!showEscapeHatch)} 
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="Bypass Darurat (Hanya Admin)"
              >
                {showEscapeHatch ? <FiUnlock size={20} /> : <FiLock size={20} />}
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-500">Pasien Terpilih</label>
              <div className="font-bold">{selectedPatient.nm_pasien}</div>
            </div>
            <div className="mb-6">
              <label className="block text-sm text-gray-500">Poli Tujuan (Dummy)</label>
              <select className="w-full mt-1 p-2 border rounded">
                <option value={kd_poli}>Poli Penyakit Dalam</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm text-gray-500">Dokter (Dummy)</label>
              <select className="w-full mt-1 p-2 border rounded">
                <option value={kd_dokter}>dr. Dummy</option>
              </select>
            </div>

            {showEscapeHatch && (
              <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                <label className="block text-sm font-bold text-red-700 mb-1">🚨 Escape Hatch: Manual SEP</label>
                <p className="text-xs text-red-600 mb-2">Gunakan jika V-Claim down dan anda menggunakan antrean offline.</p>
                <input 
                  type="text" 
                  value={bypassNoSep}
                  onChange={(e) => setBypassNoSep(e.target.value)}
                  placeholder="Masukkan 19 digit No SEP..."
                  className="w-full p-2 border border-red-300 rounded focus:outline-none focus:border-red-500"
                />
              </div>
            )}
            
            <button 
              onClick={handleRegister}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
            >
              Simpan ke Reg Periksa & Bridging Otonom
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
