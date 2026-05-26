import { apiFetch } from '../lib/api';
import { useEffect, useState } from 'react';
import { Scissors, FileText, CheckCircle2, User, Users, ClipboardList, Info, CircleDollarSign } from 'lucide-react';

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
    <div className="space-y-6">
      
      {/* Header Area */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Scissors className="w-6 h-6 text-[#004d40]" /> Kamar Operasi (OK)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Pencatatan Tindakan Pembedahan & Billing Otomatis</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Form Input */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#004d40]" /> Form Pencatatan Bedah
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">No Rawat Pasien</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input type="text" value={form.no_rawat} onChange={e => setForm({...form, no_rawat: e.target.value})} 
                    placeholder="YYYY/MM/DD/NNNNNN"
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40]"/>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Pilih Paket Operasi</label>
                  <select value={form.kode_paket} onChange={e => setForm({...form, kode_paket: e.target.value})} 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40]">
                    <option value="">-- Pilih Paket Operasi --</option>
                    {paket.map(p => (
                      <option key={p.kode_paket} value={p.kode_paket}>
                        {p.kode_paket} - {p.nm_perawatan}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">Jenis Anestesi</label>
                  <input type="text" value={form.jenis_anasthesi} onChange={e => setForm({...form, jenis_anasthesi: e.target.value})} 
                    placeholder="Misal: UMUM, SPINAL, LOKAL"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40]"/>
                </div>
              </div>
              
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mt-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Users className="w-4 h-4" /> Tim Operasi (Petugas Medis)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Dokter Operator (Bedah)</label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
                      <input type="text" value={form.operator1} onChange={e => setForm({...form, operator1: e.target.value})} 
                        className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40]"/>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Asisten Operator</label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
                      <input type="text" value={form.asisten_operator1} onChange={e => setForm({...form, asisten_operator1: e.target.value})} 
                        className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40]"/>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Dokter Anestesi</label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
                      <input type="text" value={form.dokter_anestesi} onChange={e => setForm({...form, dokter_anestesi: e.target.value})} 
                        className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40]"/>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Omloop / Perawat Sirkuler</label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
                      <input type="text" value={form.omloop} onChange={e => setForm({...form, omloop: e.target.value})} 
                        className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40]"/>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button onClick={submitOperasi} 
                  className="w-full bg-[#004d40] hover:bg-[#00332a] text-white font-bold py-3 rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Simpan Tindakan & Generate Tagihan
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Kolom Kanan: Info Paket */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit sticky top-6">
            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" /> Rincian Paket Terpilih
            </h2>
            
            {form.kode_paket ? (
              (() => {
                const p = paket.find(x => x.kode_paket === form.kode_paket);
                if (!p) return null;
                const total = p.operator1 + p.sewa_ok + p.alat + p.dokter_anestesi;
                return (
                  <div className="text-sm space-y-3">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                      <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Nama Paket</p>
                      <p className="font-bold text-blue-900">{p.nm_perawatan}</p>
                    </div>
                    
                    <div className="space-y-2 px-1">
                      <div className="flex justify-between items-center border-b border-slate-100 py-2">
                        <span className="text-slate-600">Jasa Operator 1</span> 
                        <span className="font-mono font-medium text-slate-800">Rp {p.operator1.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 py-2">
                        <span className="text-slate-600">Jasa Dr. Anestesi</span> 
                        <span className="font-mono font-medium text-slate-800">Rp {p.dokter_anestesi.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 py-2">
                        <span className="text-slate-600">Sewa Kamar OK</span> 
                        <span className="font-mono font-medium text-slate-800">Rp {p.sewa_ok.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 py-2">
                        <span className="text-slate-600">Jasa Alat</span> 
                        <span className="font-mono font-medium text-slate-800">Rp {p.alat.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-200">
                      <div className="bg-[#004d40]/5 rounded-lg p-4 border border-[#004d40]/20">
                        <span className="font-bold text-[#004d40] text-xs uppercase tracking-wider block mb-1">Estimasi Total Penagihan</span> 
                        <div className="flex items-center gap-2 text-xl font-bold font-mono text-[#004d40]">
                          <CircleDollarSign className="w-5 h-5" />
                          Rp {total.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 py-10 space-y-3">
                <ClipboardList className="w-12 h-12 text-slate-200" />
                <p className="text-sm text-center px-4">Pilih paket operasi di kolom sebelah kiri untuk melihat rincian tarif billing.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
