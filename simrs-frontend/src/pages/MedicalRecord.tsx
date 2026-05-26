import { apiFetch } from '../lib/api';
import { useState } from 'react';
import { Search, ClipboardList, Stethoscope, Pill, FlaskConical, FileText, Plus, X, Check, Clock, User, Building, HeartPulse } from 'lucide-react';

export default function MedicalRecord() {
  const [rmSearch, setRmSearch] = useState('');
  const [cppt, setCppt] = useState<any>(null);
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [icdResults, setIcdResults] = useState<any[]>([]);
  const [icdKeyword, setIcdKeyword] = useState('');
  const [activeTab, setActiveTab] = useState<'cppt' | 'diagnosa' | 'resep' | 'lab'>('cppt');

  // Lab State
  const [labMaster, setLabMaster] = useState<any[]>([]);

  const fetchLabMaster = async () => {
    try {
      const res = await apiFetch('http://localhost:3000/lab/master?kategori=PK');
      setLabMaster(await res.json());
    } catch (err) { console.error(err); }
  };

  const requestLab = async (kd_jenis_prw: string) => {
    if (!soapForm.no_rawat) return alert('Isi No Rawat di form SOAP!');
    try {
      const res = await apiFetch('http://localhost:3000/lab/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          no_rawat: soapForm.no_rawat,
          nip: 'D0000002', 
          kd_jenis_prw,
          dokter_perujuk: 'D0000002'
        })
      });
      if (res.ok) {
        alert('Permintaan Lab berhasil dikirim!');
      }
    } catch (err) { alert(err); }
  };

  // E-Resep State
  const [obatKeyword, setObatKeyword] = useState('');
  const [obatResults, setObatResults] = useState<any[]>([]);
  const [cartResep, setCartResep] = useState<any[]>([]);

  const searchObat = async () => {
    if (obatKeyword.length < 2) return;
    try {
      const res = await apiFetch(`http://localhost:3000/farmasi/obat?keyword=${obatKeyword}`);
      setObatResults(await res.json());
    } catch (err) { console.error(err); }
  };

  const addToResep = (obat: any) => {
    const aturan = prompt('Masukkan aturan pakai (misal: 3x1 Sesudah Makan):', '3x1 Sesudah Makan');
    const jmlStr = prompt('Masukkan jumlah obat:', '10');
    if (!aturan || !jmlStr) return;
    const jml = Number(jmlStr);
    
    setCartResep([...cartResep, { kode_brng: obat.kode_brng, nama: obat.nama_brng, jml, aturan }]);
  };

  const submitResep = async () => {
    if (!soapForm.no_rawat || cartResep.length === 0) {
      alert('Isi No Rawat di SOAP dan tambahkan obat ke keranjang!');
      return;
    }
    try {
      const res = await apiFetch('http://localhost:3000/farmasi/resep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          no_rawat: soapForm.no_rawat,
          kd_dokter: 'D0000002', // Default Dokter
          items: cartResep
        })
      });
      if (res.ok) {
        alert('E-Resep berhasil dikirim ke Apotek!');
        setCartResep([]);
      } else {
        const err = await res.json();
        alert(`Gagal: ${err.message || 'Error'}`);
      }
    } catch (err) { console.error(err); }
  };

  // SOAP Form state
  const [soapForm, setSoapForm] = useState({
    no_rawat: '', keluhan: '', pemeriksaan: '', penilaian: '', rtl: '',
    instruksi: '', evaluasi: '', kesadaran: 'Compos Mentis',
    tensi: '', nadi: '', suhu_tubuh: '', respirasi: '', nip: 'D0000002'
  });

  const fetchCppt = async () => {
    if (!rmSearch) return;
    try {
      const [cpptRes, diagRes] = await Promise.all([
        apiFetch(`http://localhost:3000/api/rme/cppt/${rmSearch}`),
        apiFetch(`http://localhost:3000/api/rme/diagnoses/${rmSearch}`)
      ]);
      setCppt(await cpptRes.json());
      setDiagnoses(await diagRes.json());
    } catch (err) { console.error(err); }
  };

  const searchIcd = async () => {
    if (icdKeyword.length < 2) return;
    try {
      const res = await apiFetch(`http://localhost:3000/api/rme/icd10?q=${icdKeyword}`);
      setIcdResults(await res.json());
    } catch (err) { console.error(err); }
  };

  const submitSoap = async () => {
    try {
      const res = await apiFetch('http://localhost:3000/api/rme/soap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(soapForm)
      });
      if (res.ok) {
        alert('SOAP berhasil disimpan ke database SIMRS Dummy!');
        fetchCppt(); // Refresh
      } else {
        const err = await res.json();
        alert(`Gagal: ${err.message || 'Error'}`);
      }
    } catch (err) { console.error(err); }
  };

  const addDiagnosis = async (kd_penyakit: string) => {
    if (!soapForm.no_rawat) {
      alert('Isi No Rawat terlebih dahulu di form SOAP!');
      return;
    }
    try {
      const res = await apiFetch('http://localhost:3000/api/rme/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          no_rawat: soapForm.no_rawat,
          kd_penyakit,
          status: 'Ralan',
          prioritas: 1,
          status_penyakit: 'Baru'
        })
      });
      if (res.ok) {
        alert('Diagnosa ICD-10 berhasil ditambahkan!');
        fetchCppt();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header Area */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text" 
            value={rmSearch}
            onChange={(e) => setRmSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCppt()}
            placeholder="Masukkan No Rekam Medis (RM) pasien..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] transition-shadow"
          />
        </div>
        <button 
          onClick={fetchCppt}
          className="w-full sm:w-auto bg-[#004d40] hover:bg-[#00332a] text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Clock className="w-4 h-4" /> Buka Riwayat
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-slate-100 p-1 rounded-lg w-fit border border-slate-200">
        <button 
          onClick={() => setActiveTab('cppt')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'cppt' ? 'bg-white text-[#004d40] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <ClipboardList className="w-4 h-4" /> CPPT (SOAP)
        </button>
        <button 
          onClick={() => setActiveTab('diagnosa')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'diagnosa' ? 'bg-white text-[#004d40] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Stethoscope className="w-4 h-4" /> Diagnosa ICD-10
        </button>
        <button 
          onClick={() => setActiveTab('resep')}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'resep' ? 'bg-white text-[#004d40] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Pill className="w-4 h-4" /> E-Resep Farmasi
        </button>
        <button 
          onClick={() => { setActiveTab('lab'); fetchLabMaster(); }}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'lab' ? 'bg-white text-[#004d40] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <FlaskConical className="w-4 h-4" /> Laboratorium
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Riwayat / Konten Tab */}
        <div className="lg:col-span-8">
          
          {activeTab === 'cppt' && cppt && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                  <ClipboardList className="w-5 h-5 text-[#004d40]" /> Riwayat Pemeriksaan (Rawat Jalan)
                </h2>
                <div className="space-y-4">
                  {cppt.ralan?.map((s: any, i: number) => (
                    <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold bg-[#004d40] text-white px-2 py-1 rounded">
                            {String(s.tgl_perawatan).split('T')[0]}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5" /> {s.reg_periksa?.poliklinik?.nm_poli}
                          </span>
                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> {s.pegawai?.nama}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-slate-400">{s.reg_periksa?.no_rawat}</span>
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
                      {(s.tensi || s.nadi || s.suhu_tubuh) && (
                        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-xs text-slate-500 flex gap-4 overflow-x-auto whitespace-nowrap">
                          <span className="flex items-center gap-1"><HeartPulse className="w-3.5 h-3.5 text-rose-500"/> TD: {s.tensi || '-'}</span>
                          <span>Nadi: {s.nadi || '-'}</span>
                          <span>Suhu: {s.suhu_tubuh || '-'}</span>
                          <span>Resp: {s.respirasi || '-'}</span>
                          <span>Kesadaran: {s.kesadaran}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {cppt.ralan?.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-slate-200" />
                      <p className="text-sm">Belum ada riwayat rawat jalan.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diagnosa' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 mb-4 pb-4 border-b border-slate-100 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-[#004d40]" /> Riwayat Diagnosa
                </h2>
                <div className="space-y-3">
                  {diagnoses.map((d: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-4 border border-slate-200 rounded-lg bg-slate-50">
                      <div>
                        <span className="font-mono font-bold text-[#004d40] bg-[#004d40]/10 px-2 py-0.5 rounded text-sm mr-2">{d.kd_penyakit}</span>
                        <span className="font-semibold text-slate-800">{d.penyakit?.nm_penyakit}</span>
                      </div>
                      <div className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                        {d.status} • {d.status_penyakit}
                      </div>
                    </div>
                  ))}
                  {diagnoses.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Belum ada riwayat diagnosa ICD-10.</p>}
                </div>
              </div>

              {/* Pencarian ICD-10 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Cari & Tambah ICD-10</h3>
                <div className="flex gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={icdKeyword} 
                      onChange={(e) => setIcdKeyword(e.target.value)}
                      placeholder="Cari kode / nama penyakit..."
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40]"
                    />
                  </div>
                  <button onClick={searchIcd} className="bg-[#004d40] hover:bg-[#00332a] text-white px-5 rounded-lg text-sm font-semibold transition-colors">Cari</button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-2">
                  {icdResults.map((icd: any) => (
                    <div key={icd.kd_penyakit} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 hover:border-[#004d40]/30 hover:bg-slate-50 transition-colors">
                      <div>
                        <span className="font-mono font-bold text-sm text-[#004d40] mr-2">{icd.kd_penyakit}</span>
                        <span className="text-sm text-slate-700">{icd.nm_penyakit}</span>
                      </div>
                      <button 
                        onClick={() => addDiagnosis(icd.kd_penyakit)}
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resep' && (
            <div className="space-y-6">
              {/* Keranjang Resep */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-[#004d40]" /> Keranjang E-Resep
                  </h2>
                  <span className="text-xs font-bold bg-[#004d40]/10 text-[#004d40] px-2.5 py-1 rounded-md">{cartResep.length} Item</span>
                </div>
                
                {cartResep.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Pill className="w-12 h-12 mx-auto mb-2 text-slate-200" />
                    <p className="text-sm">Keranjang kosong. Cari dan tambah obat di bawah.</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {cartResep.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{item.nama}</p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-500" /> Aturan: {item.aturan}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm text-sm font-bold text-[#004d40]">{item.jml} x</span>
                          <button onClick={() => setCartResep(cartResep.filter((_, i) => i !== idx))} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-md transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {cartResep.length > 0 && (
                  <button onClick={submitResep} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition-all">
                    Kirim E-Resep ke Apotek
                  </button>
                )}
              </div>

              {/* Pencarian Obat */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Cari Master Obat</h3>
                <div className="flex gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={obatKeyword} 
                      onChange={(e) => setObatKeyword(e.target.value)}
                      placeholder="Ketik nama obat (misal: paracetamol)..."
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40]"
                    />
                  </div>
                  <button onClick={searchObat} className="bg-[#004d40] hover:bg-[#00332a] text-white px-5 rounded-lg text-sm font-semibold transition-colors">Cari</button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-2">
                  {obatResults.map((obat: any) => (
                    <div key={obat.kode_brng} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 hover:border-[#004d40]/30 hover:bg-slate-50 transition-colors">
                      <div>
                        <span className="font-bold text-sm text-slate-800">{obat.nama_brng}</span>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">Rp {obat.ralan.toLocaleString('id-ID')} / {obat.satuan}</p>
                      </div>
                      <button 
                        onClick={() => addToResep(obat)}
                        className="bg-[#004d40]/10 text-[#004d40] hover:bg-[#004d40] hover:text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Resepkan
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lab' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 pb-4 border-b border-slate-100 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-[#004d40]" /> Permintaan Lab PK
              </h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-2">
                {labMaster.map((lab: any) => (
                  <div key={lab.kd_jenis_prw} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 hover:border-[#004d40]/30 hover:bg-slate-50 transition-colors">
                    <div>
                      <span className="font-bold text-sm text-slate-800">{lab.nm_perawatan}</span>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">Tarif: Rp {lab.total_byr.toLocaleString('id-ID')}</p>
                    </div>
                    <button 
                      onClick={() => requestLab(lab.kd_jenis_prw)}
                      className="bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Order
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Form SOAP */}
        <div className="lg:col-span-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit sticky top-6">
            <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#004d40]" /> Input SOAP Baru
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

              <div>
                <label className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block mb-1">[S] Subjektif</label>
                <textarea value={soapForm.keluhan}
                  onChange={(e) => setSoapForm({...soapForm, keluhan: e.target.value})}
                  placeholder="Keluhan pasien..."
                  className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] resize-none" rows={2}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">[O] Objektif</label>
                <textarea value={soapForm.pemeriksaan}
                  onChange={(e) => setSoapForm({...soapForm, pemeriksaan: e.target.value})}
                  placeholder="Hasil pemeriksaan klinis..."
                  className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] resize-none" rows={2}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">[A] Asesmen</label>
                <textarea value={soapForm.penilaian}
                  onChange={(e) => setSoapForm({...soapForm, penilaian: e.target.value})}
                  placeholder="Diagnosis medis..."
                  className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] resize-none" rows={2}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block mb-1">[P] Plan (RTL)</label>
                <textarea value={soapForm.rtl}
                  onChange={(e) => setSoapForm({...soapForm, rtl: e.target.value})}
                  placeholder="Rencana tindak lanjut..."
                  className="w-full p-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] resize-none" rows={2}
                />
              </div>

              <div className="pt-2 pb-2 border-t border-b border-slate-100 mt-3 mb-3">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Tanda Vital (Opsional)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input type="text" value={soapForm.tensi} onChange={(e) => setSoapForm({...soapForm, tensi: e.target.value})}
                      placeholder="TD (120/80)" className="w-full p-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#004d40]" />
                  </div>
                  <div>
                    <input type="text" value={soapForm.nadi} onChange={(e) => setSoapForm({...soapForm, nadi: e.target.value})}
                      placeholder="Nadi (80)" className="w-full p-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#004d40]" />
                  </div>
                  <div>
                    <input type="text" value={soapForm.suhu_tubuh} onChange={(e) => setSoapForm({...soapForm, suhu_tubuh: e.target.value})}
                      placeholder="Suhu (36.5)" className="w-full p-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#004d40]" />
                  </div>
                  <div>
                    <input type="text" value={soapForm.respirasi} onChange={(e) => setSoapForm({...soapForm, respirasi: e.target.value})}
                      placeholder="Resp (20)" className="w-full p-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:border-[#004d40]" />
                  </div>
                </div>
              </div>

              <button onClick={submitSoap}
                className="w-full bg-[#004d40] hover:bg-[#00332a] text-white font-bold py-2.5 rounded-lg shadow-sm transition-all"
              >
                Simpan SOAP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
