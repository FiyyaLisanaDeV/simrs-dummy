import { apiFetch } from '../lib/api';
import { useState } from 'react';

export default function RanapCPPT() {
  const [rmSearch, setRmSearch] = useState('');
  const [cppt, setCppt] = useState<any>(null);
  const [soapForm, setSoapForm] = useState({
    no_rawat: '', keluhan: '', pemeriksaan: '', penilaian: '', rtl: '',
    instruksi: '', evaluasi: '', kesadaran: 'Compos Mentis',
    tensi: '', nadi: '', suhu_tubuh: '', respirasi: '', spo2: '', 
    gcs: '', tinggi: '', berat: '', nip: 'D0000002'
  });

  const fetchCppt = async () => {
    if (!rmSearch) return;
    try {
      const res = await apiFetch(`http://localhost:3000/api/rme/cppt/${rmSearch}`);
      const data = await res.json();
      setCppt(data);
    } catch (err) { console.error(err); }
  };

  const submitSoap = async () => {
    try {
      const res = await apiFetch('http://localhost:3000/ranap/cppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(soapForm)
      });
      if (res.ok) {
        alert('Observasi Ranap berhasil disimpan!');
        fetchCppt(); // Refresh
      } else {
        const err = await res.json();
        alert(`Gagal: ${err.message || 'Error'}`);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <h1 className="text-3xl font-extrabold mb-6 text-sky-800">CPPT Rawat Inap (Observasi Harian)</h1>
      
      <div className="flex gap-4 mb-8">
        <input
          type="text" value={rmSearch}
          onChange={(e) => setRmSearch(e.target.value)}
          placeholder="Masukkan No Rekam Medis pasien..."
          className="px-4 py-3 border rounded-xl w-1/3 shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
        />
        <button onClick={fetchCppt}
          className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl font-medium shadow-md transition-colors"
        >
          Lihat Riwayat Inap
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Kolom Kiri: Riwayat */}
        <div className="col-span-2">
          {cppt && cppt.ranap?.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-700 mb-2">Riwayat CPPT Rawat Inap</h2>
              {cppt.ranap.map((s: any, i: number) => (
                <div key={i} className="bg-white p-5 rounded-2xl shadow border-l-4 border-sky-500">
                  <div className="text-xs text-gray-400 mb-2">
                    {String(s.tgl_perawatan).split('T')[0]} | Jam: {String(s.jam_rawat).split('T')[1]?.substring(0,8)} | {s.reg_periksa?.no_rawat} | Oleh: {s.pegawai?.nama}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div><span className="font-bold text-red-600">[S]</span> {s.keluhan || '-'}</div>
                    <div><span className="font-bold text-blue-600">[O]</span> {s.pemeriksaan || '-'}</div>
                    <div><span className="font-bold text-green-600">[A]</span> {s.penilaian || '-'}</div>
                    <div><span className="font-bold text-purple-600">[P]</span> {s.rtl || '-'}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded text-xs text-slate-600 grid grid-cols-4 gap-2">
                    <div><b>Tensi:</b> {s.tensi}</div>
                    <div><b>Nadi:</b> {s.nadi}</div>
                    <div><b>Suhu:</b> {s.suhu_tubuh}</div>
                    <div><b>Resp:</b> {s.respirasi}</div>
                    <div><b>SpO2:</b> {s.spo2}</div>
                    <div><b>GCS:</b> {s.gcs}</div>
                    <div><b>Instruksi:</b> {s.instruksi}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Belum ada riwayat CPPT Ranap untuk pasien ini.</p>
          )}
        </div>

        {/* Kolom Kanan: Form */}
        <div className="bg-white p-6 rounded-2xl shadow-lg h-fit sticky top-8">
          <h2 className="text-xl font-bold text-sky-900 mb-4">Input Observasi Baru</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">No Rawat</label>
              <input type="text" value={soapForm.no_rawat}
                onChange={(e) => setSoapForm({...soapForm, no_rawat: e.target.value})}
                placeholder="YYYY/MM/DD/NNNNNN" className="w-full p-2 border rounded-lg text-sm mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 font-medium">[S] Keluhan</label>
                <textarea value={soapForm.keluhan} onChange={(e) => setSoapForm({...soapForm, keluhan: e.target.value})} className="w-full p-2 border rounded-lg text-sm" rows={2}/>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">[O] Pemeriksaan</label>
                <textarea value={soapForm.pemeriksaan} onChange={(e) => setSoapForm({...soapForm, pemeriksaan: e.target.value})} className="w-full p-2 border rounded-lg text-sm" rows={2}/>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">[A] Penilaian</label>
                <textarea value={soapForm.penilaian} onChange={(e) => setSoapForm({...soapForm, penilaian: e.target.value})} className="w-full p-2 border rounded-lg text-sm" rows={2}/>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">[P] Rencana</label>
                <textarea value={soapForm.rtl} onChange={(e) => setSoapForm({...soapForm, rtl: e.target.value})} className="w-full p-2 border rounded-lg text-sm" rows={2}/>
              </div>
            </div>
            
            <h3 className="text-xs font-bold text-gray-500 mt-4 border-b pb-1">Tanda-Tanda Vital</h3>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" placeholder="Tensi" value={soapForm.tensi} onChange={(e)=>setSoapForm({...soapForm, tensi: e.target.value})} className="p-2 border rounded text-xs"/>
              <input type="text" placeholder="Nadi" value={soapForm.nadi} onChange={(e)=>setSoapForm({...soapForm, nadi: e.target.value})} className="p-2 border rounded text-xs"/>
              <input type="text" placeholder="Suhu" value={soapForm.suhu_tubuh} onChange={(e)=>setSoapForm({...soapForm, suhu_tubuh: e.target.value})} className="p-2 border rounded text-xs"/>
              <input type="text" placeholder="Resp" value={soapForm.respirasi} onChange={(e)=>setSoapForm({...soapForm, respirasi: e.target.value})} className="p-2 border rounded text-xs"/>
              <input type="text" placeholder="SpO2" value={soapForm.spo2} onChange={(e)=>setSoapForm({...soapForm, spo2: e.target.value})} className="p-2 border rounded text-xs"/>
              <input type="text" placeholder="GCS" value={soapForm.gcs} onChange={(e)=>setSoapForm({...soapForm, gcs: e.target.value})} className="p-2 border rounded text-xs"/>
            </div>
            
            <div>
              <label className="text-xs text-gray-500 font-medium">Instruksi Medis</label>
              <textarea value={soapForm.instruksi} onChange={(e) => setSoapForm({...soapForm, instruksi: e.target.value})} className="w-full p-2 border rounded-lg text-sm mt-1" rows={2}/>
            </div>
            
            <button onClick={submitSoap}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all mt-4"
            >
              Simpan CPPT Ranap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
