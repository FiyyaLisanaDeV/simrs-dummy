import { apiFetch } from '../lib/api';
import { useEffect, useState } from 'react';

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
    <div className="p-8 min-h-screen bg-slate-50">
      <h1 className="text-3xl font-extrabold mb-8 text-slate-800">Manajemen Kamar Rawat Inap</h1>
      
      <div className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-lg font-bold mb-4">Input Data Pasien (Simulasi Pendaftaran)</h2>
        <div className="flex gap-4">
          <input 
            type="text" 
            value={noRawat}
            onChange={(e) => setNoRawat(e.target.value)}
            placeholder="Masukkan No Rawat (Format YYYY/MM/DD/NNNNNN)..." 
            className="w-1/2 p-3 border rounded-xl"
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          * Di dunia nyata, Anda bisa memasukkan nomor rawat pasien yang sebelumnya didapat dari Poli / IGD, lalu pilih kamar kosong di bawah.
        </p>
      </div>

      <h2 className="text-xl font-bold mb-4">Kasur Tersedia (KOSONG)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {beds.map(bed => (
          <div key={bed.kd_kamar} className="bg-white p-5 rounded-2xl shadow-lg border border-green-200">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-lg">{bed.kd_kamar}</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">KOSONG</span>
            </div>
            <div className="text-sm text-gray-600 mb-1">Bangsal: {bed.bangsal?.nm_bangsal}</div>
            <div className="text-sm text-gray-600 mb-4">Kelas: {bed.kelas}</div>
            
            <button 
              onClick={() => handleAdmit(bed.kd_kamar)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              Tempatkan Pasien
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
