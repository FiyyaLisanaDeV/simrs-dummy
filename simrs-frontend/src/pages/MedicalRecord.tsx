import { apiFetch } from '../lib/api';
import { useState } from 'react';

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
    <div className="p-8 min-h-screen bg-slate-50">
      <h1 className="text-3xl font-extrabold mb-6 text-slate-800">Rekam Medis Elektronik (CPPT)</h1>

      {/* Pencarian Pasien */}
      <div className="flex gap-4 mb-8">
        <input
          type="text" value={rmSearch}
          onChange={(e) => setRmSearch(e.target.value)}
          placeholder="Masukkan No Rekam Medis pasien..."
          className="px-4 py-3 border rounded-xl w-1/3 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <button onClick={fetchCppt}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-md transition-colors"
        >
          Lihat Riwayat
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('cppt')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'cppt' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'}`}
        >
          📋 CPPT / SOAP
        </button>
        <button onClick={() => setActiveTab('diagnosa')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'diagnosa' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'}`}
        >
          🏥 Diagnosa ICD-10
        </button>
        <button onClick={() => setActiveTab('resep')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'resep' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'}`}
        >
          💊 E-Resep Farmasi
        </button>
        <button onClick={() => { setActiveTab('lab'); fetchLabMaster(); }}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'lab' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border'}`}
        >
          🔬 Laboratorium
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Kolom Kiri: Riwayat */}
        <div className="col-span-2">
          {activeTab === 'cppt' && cppt && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-700 mb-2">Riwayat SOAP Rawat Jalan</h2>
              {cppt.ralan?.map((s: any, i: number) => (
                <div key={i} className="bg-white p-5 rounded-2xl shadow border-l-4 border-indigo-500">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-medium">
                        {String(s.tgl_perawatan).split('T')[0]}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {s.reg_periksa?.poliklinik?.nm_poli} | Oleh: {s.pegawai?.nama}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{s.reg_periksa?.no_rawat}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="font-bold text-red-600">[S]</span> {s.keluhan || '-'}</div>
                    <div><span className="font-bold text-blue-600">[O]</span> {s.pemeriksaan || '-'}</div>
                    <div><span className="font-bold text-green-600">[A]</span> {s.penilaian || '-'}</div>
                    <div><span className="font-bold text-purple-600">[P]</span> {s.rtl || '-'}</div>
                  </div>
                  {(s.tensi || s.nadi || s.suhu_tubuh) && (
                    <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                      TD: {s.tensi || '-'} | Nadi: {s.nadi || '-'} | Suhu: {s.suhu_tubuh || '-'} | Resp: {s.respirasi || '-'} | Kes: {s.kesadaran}
                    </div>
                  )}
                </div>
              ))}
              {cppt.ralan?.length === 0 && <p className="text-gray-400">Tidak ada riwayat SOAP rawat jalan.</p>}

              {cppt.ranap?.length > 0 && (
                <>
                  <h2 className="text-xl font-bold text-slate-700 mt-6 mb-2">Riwayat SOAP Rawat Inap</h2>
                  {cppt.ranap.map((s: any, i: number) => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow border-l-4 border-amber-500">
                      <div className="text-xs text-gray-400 mb-2">
                        {String(s.tgl_perawatan).split('T')[0]} | {s.reg_periksa?.no_rawat} | Oleh: {s.pegawai?.nama}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="font-bold text-red-600">[S]</span> {s.keluhan || '-'}</div>
                        <div><span className="font-bold text-blue-600">[O]</span> {s.pemeriksaan || '-'}</div>
                        <div><span className="font-bold text-green-600">[A]</span> {s.penilaian || '-'}</div>
                        <div><span className="font-bold text-purple-600">[P]</span> {s.rtl || '-'}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'diagnosa' && (
            <div>
              <h2 className="text-xl font-bold text-slate-700 mb-4">Riwayat Diagnosa ICD-10</h2>
              <div className="space-y-3">
                {diagnoses.map((d: any, i: number) => (
                  <div key={i} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-indigo-700">{d.kd_penyakit}</span>
                      <span className="ml-3 text-gray-700">{d.penyakit?.nm_penyakit}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {d.status} | {d.status_penyakit} | Prioritas: {d.prioritas}
                    </div>
                  </div>
                ))}
                {diagnoses.length === 0 && <p className="text-gray-400">Belum ada diagnosa.</p>}
              </div>

              {/* Pencarian ICD-10 */}
              <div className="mt-8 bg-white p-6 rounded-2xl shadow">
                <h3 className="font-bold mb-3">Cari & Tambah Kode ICD-10</h3>
                <div className="flex gap-3 mb-4">
                  <input type="text" value={icdKeyword} onChange={(e) => setIcdKeyword(e.target.value)}
                    placeholder="Cari kode atau nama penyakit..."
                    className="flex-1 p-3 border rounded-xl"
                  />
                  <button onClick={searchIcd} className="bg-indigo-600 text-white px-6 rounded-xl font-medium">Cari</button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {icdResults.map((icd: any) => (
                    <div key={icd.kd_penyakit} className="flex justify-between items-center p-3 rounded-lg hover:bg-indigo-50 border">
                      <div>
                        <span className="font-mono font-bold text-sm">{icd.kd_penyakit}</span>
                        <span className="ml-2 text-sm text-gray-700">{icd.nm_penyakit}</span>
                      </div>
                      <button onClick={() => addDiagnosis(icd.kd_penyakit)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        + Tambah
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resep' && (
            <div>
              <h2 className="text-xl font-bold text-slate-700 mb-4">E-Resep Elektronik</h2>
              
              {/* Keranjang Resep */}
              <div className="bg-white p-6 rounded-2xl shadow mb-8 border border-indigo-100">
                <h3 className="font-bold mb-4 flex justify-between items-center text-indigo-900">
                  Keranjang Resep Saat Ini
                  <span className="text-sm bg-indigo-100 px-3 py-1 rounded-full text-indigo-800">{cartResep.length} Item</span>
                </h3>
                {cartResep.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">Keranjang kosong. Cari dan tambah obat di bawah.</p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {cartResep.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded border">
                        <div>
                          <p className="font-bold text-slate-800">{item.nama}</p>
                          <p className="text-xs text-slate-500">Aturan: {item.aturan}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono bg-white px-3 py-1 rounded border shadow-sm">{item.jml} x</span>
                          <button onClick={() => setCartResep(cartResep.filter((_, i) => i !== idx))} className="text-red-500 text-sm hover:underline">Hapus</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {cartResep.length > 0 && (
                  <button onClick={submitResep} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all">
                    Kirim E-Resep ke Apotek
                  </button>
                )}
              </div>

              {/* Pencarian Obat Master */}
              <div className="bg-white p-6 rounded-2xl shadow">
                <h3 className="font-bold mb-3">Cari & Tambah Obat</h3>
                <div className="flex gap-3 mb-4">
                  <input type="text" value={obatKeyword} onChange={(e) => setObatKeyword(e.target.value)}
                    placeholder="Ketik nama obat (misal: paracetamol)..."
                    className="flex-1 p-3 border rounded-xl"
                  />
                  <button onClick={searchObat} className="bg-indigo-600 text-white px-6 rounded-xl font-medium">Cari</button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {obatResults.map((obat: any) => (
                    <div key={obat.kode_brng} className="flex justify-between items-center p-3 rounded-lg hover:bg-indigo-50 border">
                      <div>
                        <span className="font-bold text-sm text-slate-800">{obat.nama_brng}</span>
                        <p className="text-xs text-gray-500">Harga: Rp {obat.ralan}</p>
                      </div>
                      <button onClick={() => addToResep(obat)}
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        + Resepkan
                      </button>
                    </div>
                  ))}
                  {obatResults.length === 0 && obatKeyword && <p className="text-gray-400 text-sm">Tidak ada obat yang cocok.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lab' && (
            <div>
              <h2 className="text-xl font-bold text-slate-700 mb-4">Permintaan Laboratorium</h2>
              <div className="bg-white p-6 rounded-2xl shadow">
                <h3 className="font-bold mb-3">Daftar Tindakan Lab Tersedia</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {labMaster.map((lab: any) => (
                    <div key={lab.kd_jenis_prw} className="flex justify-between items-center p-3 rounded-lg hover:bg-indigo-50 border">
                      <div>
                        <span className="font-bold text-sm text-slate-800">{lab.nm_perawatan}</span>
                        <p className="text-xs text-gray-500">Harga: Rp {lab.total_byr}</p>
                      </div>
                      <button onClick={() => requestLab(lab.kd_jenis_prw)}
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        + Request Lab
                      </button>
                    </div>
                  ))}
                  {labMaster.length === 0 && <p className="text-gray-400 text-sm">Tidak ada data tindakan lab.</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Form SOAP */}
        <div className="bg-white p-6 rounded-2xl shadow-lg h-fit sticky top-8">
          <h2 className="text-xl font-bold text-indigo-900 mb-4">Input SOAP Baru</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">No Rawat</label>
              <input type="text" value={soapForm.no_rawat}
                onChange={(e) => setSoapForm({...soapForm, no_rawat: e.target.value})}
                placeholder="YYYY/MM/DD/NNNNNN"
                className="w-full p-2 border rounded-lg text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">[S] Keluhan (Subjective)</label>
              <textarea value={soapForm.keluhan}
                onChange={(e) => setSoapForm({...soapForm, keluhan: e.target.value})}
                className="w-full p-2 border rounded-lg text-sm mt-1" rows={2}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">[O] Pemeriksaan (Objective)</label>
              <textarea value={soapForm.pemeriksaan}
                onChange={(e) => setSoapForm({...soapForm, pemeriksaan: e.target.value})}
                className="w-full p-2 border rounded-lg text-sm mt-1" rows={2}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">[A] Penilaian (Assessment)</label>
              <textarea value={soapForm.penilaian}
                onChange={(e) => setSoapForm({...soapForm, penilaian: e.target.value})}
                className="w-full p-2 border rounded-lg text-sm mt-1" rows={2}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">[P] Rencana (Plan)</label>
              <textarea value={soapForm.rtl}
                onChange={(e) => setSoapForm({...soapForm, rtl: e.target.value})}
                className="w-full p-2 border rounded-lg text-sm mt-1" rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">Tensi</label>
                <input type="text" value={soapForm.tensi}
                  onChange={(e) => setSoapForm({...soapForm, tensi: e.target.value})}
                  placeholder="120/80" className="w-full p-2 border rounded-lg text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Nadi</label>
                <input type="text" value={soapForm.nadi}
                  onChange={(e) => setSoapForm({...soapForm, nadi: e.target.value})}
                  placeholder="80" className="w-full p-2 border rounded-lg text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Suhu</label>
                <input type="text" value={soapForm.suhu_tubuh}
                  onChange={(e) => setSoapForm({...soapForm, suhu_tubuh: e.target.value})}
                  placeholder="36.5" className="w-full p-2 border rounded-lg text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Respirasi</label>
                <input type="text" value={soapForm.respirasi}
                  onChange={(e) => setSoapForm({...soapForm, respirasi: e.target.value})}
                  placeholder="20" className="w-full p-2 border rounded-lg text-sm mt-1"
                />
              </div>
            </div>
            <button onClick={submitSoap}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all mt-2"
            >
              Simpan SOAP ke SIMRS Dummy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
