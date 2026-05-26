import { apiFetch } from '../lib/api';
import { useState } from 'react';
import { Search, ClipboardList, Bed, FileText, HeartPulse, Activity, User, Clock, Check } from 'lucide-react';

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
    <div className="space-y-6">
      
      {/* Search Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text" 
            value={rmSearch}
            onChange={(e) => setRmSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCppt()}
            placeholder="Masukkan No Rekam Medis (RM) pasien rawat inap..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] transition-shadow"
          />
        </div>
        <button 
          onClick={fetchCppt}
          className="w-full sm:w-auto bg-[#004d40] hover:bg-[#00332a] text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Bed className="w-4 h-4" /> Buka CPPT Inap
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Riwayat */}
        <div className="lg:col-span-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
              <ClipboardList className="w-5 h-5 text-[#004d40]" /> CPPT (Catatan Perkembangan Pasien Terintegrasi)
            </h2>
            
            {cppt && cppt.ranap?.length > 0 ? (
              <div className="space-y-4">
                {cppt.ranap.map((s: any, i: number) => (
                  <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 flex flex-wrap justify-between items-center border-b border-slate-200 gap-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-bold bg-[#004d40] text-white px-2.5 py-1 rounded-md flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> 
                          {String(s.tgl_perawatan).split('T')[0]} • {String(s.jam_rawat).split('T')[1]?.substring(0,8)}
                        </span>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> {s.pegawai?.nama}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-200">{s.reg_periksa?.no_rawat}</span>
                    </div>
                    
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-rose-50/50 p-3 rounded border border-rose-100">
                        <span className="font-bold text-rose-700 block mb-1">Subjektif (S)</span> 
                        <span className="text-slate-700">{s.keluhan || '-'}</span>
                      </div>
                      <div className="bg-blue-50/50 p-3 rounded border border-blue-100">
                        <span className="font-bold text-blue-700 block mb-1">Objektif (O)</span> 
                        <span className="text-slate-700">{s.pemeriksaan || '-'}</span>
                      </div>
                      <div className="bg-emerald-50/50 p-3 rounded border border-emerald-100">
                        <span className="font-bold text-emerald-700 block mb-1">Asesmen (A)</span> 
                        <span className="text-slate-700">{s.penilaian || '-'}</span>
                      </div>
                      <div className="bg-purple-50/50 p-3 rounded border border-purple-100">
                        <span className="font-bold text-purple-700 block mb-1">Plan (P)</span> 
                        <span className="text-slate-700">{s.rtl || '-'}</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 px-4 py-3 border-t border-slate-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-3">
                        <div className="bg-white p-2 rounded border border-slate-200 text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Tensi</p>
                          <p className="text-sm font-semibold text-slate-800">{s.tensi || '-'}</p>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200 text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Nadi</p>
                          <p className="text-sm font-semibold text-slate-800">{s.nadi || '-'}</p>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200 text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Suhu</p>
                          <p className="text-sm font-semibold text-slate-800">{s.suhu_tubuh || '-'}</p>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200 text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Resp</p>
                          <p className="text-sm font-semibold text-slate-800">{s.respirasi || '-'}</p>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200 text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">SpO2</p>
                          <p className="text-sm font-semibold text-slate-800">{s.spo2 || '-'}</p>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200 text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">GCS</p>
                          <p className="text-sm font-semibold text-slate-800">{s.gcs || '-'}</p>
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 p-3 rounded border border-amber-100 flex gap-2 items-start">
                        <Activity className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Instruksi Medis / Keperawatan</p>
                          <p className="text-sm text-amber-900 mt-1">{s.instruksi || 'Tidak ada instruksi khusus.'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                <p className="text-sm">Belum ada riwayat CPPT Ranap untuk pasien ini.</p>
                <p className="text-xs mt-1 text-slate-400">Gunakan pencarian di atas untuk memuat data.</p>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Form */}
        <div className="lg:col-span-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit sticky top-6">
            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#004d40]" /> Input Observasi Baru
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">No Rawat Referensi</label>
                <div className="relative">
                  <FileText className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
                  <input type="text" value={soapForm.no_rawat}
                    onChange={(e) => setSoapForm({...soapForm, no_rawat: e.target.value})}
                    placeholder="YYYY/MM/DD/NNNNNN"
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block mb-1">[S] Subjektif</label>
                  <textarea value={soapForm.keluhan} onChange={(e) => setSoapForm({...soapForm, keluhan: e.target.value})} 
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] resize-none" rows={2}/>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">[O] Objektif</label>
                  <textarea value={soapForm.pemeriksaan} onChange={(e) => setSoapForm({...soapForm, pemeriksaan: e.target.value})} 
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] resize-none" rows={2}/>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">[A] Asesmen</label>
                  <textarea value={soapForm.penilaian} onChange={(e) => setSoapForm({...soapForm, penilaian: e.target.value})} 
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] resize-none" rows={2}/>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block mb-1">[P] Plan (RTL)</label>
                  <textarea value={soapForm.rtl} onChange={(e) => setSoapForm({...soapForm, rtl: e.target.value})} 
                    className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] resize-none" rows={2}/>
                </div>
              </div>
              
              <div className="pt-3 pb-3 border-t border-b border-slate-100 mt-4 mb-3">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5" /> Tanda-Tanda Vital
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="Tensi (120/80)" value={soapForm.tensi} onChange={(e)=>setSoapForm({...soapForm, tensi: e.target.value})} className="p-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#004d40]"/>
                  <input type="text" placeholder="Nadi (80)" value={soapForm.nadi} onChange={(e)=>setSoapForm({...soapForm, nadi: e.target.value})} className="p-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#004d40]"/>
                  <input type="text" placeholder="Suhu (36.5)" value={soapForm.suhu_tubuh} onChange={(e)=>setSoapForm({...soapForm, suhu_tubuh: e.target.value})} className="p-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#004d40]"/>
                  <input type="text" placeholder="Resp (20)" value={soapForm.respirasi} onChange={(e)=>setSoapForm({...soapForm, respirasi: e.target.value})} className="p-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#004d40]"/>
                  <input type="text" placeholder="SpO2 (98%)" value={soapForm.spo2} onChange={(e)=>setSoapForm({...soapForm, spo2: e.target.value})} className="p-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#004d40]"/>
                  <input type="text" placeholder="GCS (E4M6V5)" value={soapForm.gcs} onChange={(e)=>setSoapForm({...soapForm, gcs: e.target.value})} className="p-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#004d40]"/>
                </div>
              </div>
              
              <div>
                <label className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block mb-1">Instruksi Medis</label>
                <textarea value={soapForm.instruksi} onChange={(e) => setSoapForm({...soapForm, instruksi: e.target.value})} 
                  placeholder="Instruksi tambahan untuk perawat/ruangan..."
                  className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] resize-none" rows={2}/>
              </div>
              
              <button onClick={submitSoap}
                className="w-full bg-[#004d40] hover:bg-[#00332a] text-white font-bold py-2.5 rounded-lg shadow-sm transition-all mt-4 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" /> Simpan CPPT Ranap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
