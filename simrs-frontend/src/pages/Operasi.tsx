import { apiFetch } from '../lib/api';
import { useEffect, useState } from 'react';

export default function Operasi() {
  const [paket, setPaket] = useState<any[]>([]);
  const [form, setForm] = useState({
    no_rawat: '', kode_paket: '', jenis_anasthesi: '',
    operator1: 'D0000002', operator2: '', asisten_operator1: '',
    dokter_anestesi: '', asisten_anestesi: '', bidan: '', omloop: ''
  });

  useEffect(() => {
    fetchPaket();
  }, []);

  const fetchPaket = async () => {
    try {
      const res = await apiFetch('http://localhost:3000/operasi/paket');
      setPaket(await res.json());
    } catch (err) { console.error(err); }
  };

  const submitOperasi = async () => {
    if (!form.no_rawat || !form.kode_paket) return alert('No Rawat dan Paket Operasi wajib diisi!');
    
    try {
      const res = await apiFetch('http://localhost:3000/operasi/input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        alert('Data Operasi berhasil disimpan & Tagihan sudah masuk ke billing kasir!');
        setForm({...form, no_rawat: '', kode_paket: ''});
      } else {
        const err = await res.json();
        alert(`Gagal: ${err.message || 'Error'}`);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <h1 className="text-3xl font-extrabold mb-8 text-rose-800">Kamar Operasi (OK)</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Pencatatan Tindakan Pembedahan</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700">No Rawat Pasien</label>
              <input type="text" value={form.no_rawat} onChange={e => setForm({...form, no_rawat: e.target.value})} className="w-full p-2 border rounded mt-1"/>
            </div>
            
            <div>
              <label className="text-sm font-bold text-gray-700">Pilih Paket Operasi</label>
              <select value={form.kode_paket} onChange={e => setForm({...form, kode_paket: e.target.value})} className="w-full p-2 border rounded mt-1">
                <option value="">-- Pilih Paket Operasi --</option>
                {paket.map(p => (
                  <option key={p.kode_paket} value={p.kode_paket}>
                    {p.kode_paket} - {p.nm_perawatan} (Total: Rp {p.operator1 + p.sewa_ok + p.alat + p.dokter_anestesi})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">Jenis Anestesi</label>
              <input type="text" value={form.jenis_anasthesi} onChange={e => setForm({...form, jenis_anasthesi: e.target.value})} className="w-full p-2 border rounded mt-1" placeholder="Misal: UMUM, SPINAL"/>
            </div>
            
            <div className="grid grid-cols-2 gap-4 bg-rose-50 p-4 rounded-xl border border-rose-100 mt-4">
              <div>
                <label className="text-xs font-bold text-gray-600">Dokter Operator (Bedah)</label>
                <input type="text" value={form.operator1} onChange={e => setForm({...form, operator1: e.target.value})} className="w-full p-2 border rounded mt-1 text-sm"/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Asisten Operator</label>
                <input type="text" value={form.asisten_operator1} onChange={e => setForm({...form, asisten_operator1: e.target.value})} className="w-full p-2 border rounded mt-1 text-sm"/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Dokter Anestesi</label>
                <input type="text" value={form.dokter_anestesi} onChange={e => setForm({...form, dokter_anestesi: e.target.value})} className="w-full p-2 border rounded mt-1 text-sm"/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600">Omloop / Perawat Sirkuler</label>
                <input type="text" value={form.omloop} onChange={e => setForm({...form, omloop: e.target.value})} className="w-full p-2 border rounded mt-1 text-sm"/>
              </div>
            </div>

            <button onClick={submitOperasi} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition mt-4 shadow">
              Simpan Tindakan Operasi & Generate Tagihan
            </button>
          </div>
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-2xl shadow mb-6">
            <h2 className="text-xl font-bold mb-2">Informasi Paket Terpilih</h2>
            {form.kode_paket ? (
              (() => {
                const p = paket.find(x => x.kode_paket === form.kode_paket);
                if (!p) return null;
                return (
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between border-b py-1"><span>Nama Paket</span> <span className="font-bold">{p.nm_perawatan}</span></div>
                    <div className="flex justify-between border-b py-1"><span>Jasa Operator 1</span> <span className="font-mono">Rp {p.operator1}</span></div>
                    <div className="flex justify-between border-b py-1"><span>Jasa Dr. Anestesi</span> <span className="font-mono">Rp {p.dokter_anestesi}</span></div>
                    <div className="flex justify-between border-b py-1"><span>Sewa Kamar OK</span> <span className="font-mono">Rp {p.sewa_ok}</span></div>
                    <div className="flex justify-between border-b py-1"><span>Jasa Alat</span> <span className="font-mono">Rp {p.alat}</span></div>
                    <div className="flex justify-between pt-2">
                      <span className="font-bold text-rose-700">Estimasi Total Penagihan</span> 
                      <span className="font-bold font-mono text-rose-700">Rp {p.operator1 + p.sewa_ok + p.alat + p.dokter_anestesi} (++)</span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-gray-400 text-sm italic">Silakan pilih paket operasi di sebelah kiri untuk melihat rincian tarif.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
