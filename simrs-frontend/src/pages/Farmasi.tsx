import { apiFetch } from '../lib/api';
import { useState, useEffect } from 'react';
import { Search, PackageOpen, Stethoscope, FileText, CheckCircle2, User, Pill, Box, FlaskConical, Plus, X, ListPlus } from 'lucide-react';

export default function Farmasi() {
  const [activeTab, setActiveTab] = useState<'jadi' | 'racikan'>('jadi');
  const [keyword, setKeyword] = useState('');
  const [obatList, setObatList] = useState<any[]>([]);
  const [metodeList, setMetodeList] = useState<any[]>([]);
  
  const [keranjangJadi, setKeranjangJadi] = useState<any[]>([]);
  const [keranjangRacikan, setKeranjangRacikan] = useState<any[]>([]);
  
  const [noRawat, setNoRawat] = useState('2026/04/20/000001');
  const [kdDokter, setKdDokter] = useState('D0000002');
  const [stokModal, setStokModal] = useState<any>(null);

  const [racikName, setRacikName] = useState('');
  const [racikMetode, setRacikMetode] = useState('');
  const [racikJml, setRacikJml] = useState(10);
  const [racikAturan, setRacikAturan] = useState('3 x 1 Hari');
  const [racikKeterangan, setRacikKeterangan] = useState('Sesudah Makan');
  const [racikDetails, setRacikDetails] = useState<any[]>([]);

  useEffect(() => {
    apiFetch('http://localhost:3000/farmasi/metode-racik')
      .then(r => r.json())
      .then(data => {
        setMetodeList(data);
        if (data.length > 0) setRacikMetode(data[0].kd_racik);
      });
  }, []);

  const searchObat = async () => {
    if (!keyword) return;
    try {
      const res = await apiFetch(`http://localhost:3000/farmasi/obat?keyword=${keyword}`);
      const data = await res.json();
      setObatList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const cekStok = async (kode_brng: string) => {
    try {
      const res = await apiFetch(`http://localhost:3000/farmasi/stok?kode_brng=${kode_brng}`);
      const data = await res.json();
      setStokModal({ kode_brng, stok: data });
    } catch (err) {
      console.error(err);
    }
  };

  const tambahObatJadi = (obat: any) => {
    if (keranjangJadi.find((o) => o.kode_brng === obat.kode_brng)) return;
    setKeranjangJadi([...keranjangJadi, { ...obat, jml: 1, aturan: '3 x 1 Hari' }]);
  };

  const updateKeranjangJadi = (kode_brng: string, field: string, value: any) => {
    setKeranjangJadi(keranjangJadi.map((o) => o.kode_brng === kode_brng ? { ...o, [field]: value } : o));
  };

  const tambahKeBahanRacik = (obat: any) => {
    if (racikDetails.find(d => d.kode_brng === obat.kode_brng)) return;
    setRacikDetails([...racikDetails, { ...obat, p1: 1, p2: 1 }]);
  };

  const hapusBahanRacik = (kode_brng: string) => {
    setRacikDetails(racikDetails.filter(d => d.kode_brng !== kode_brng));
  };
  
  const updateBahanRacik = (kode_brng: string, field: string, value: any) => {
    setRacikDetails(racikDetails.map(d => d.kode_brng === kode_brng ? { ...d, [field]: value } : d));
  };

  const simpanRacikanKeKeranjang = () => {
    if (!racikName || racikDetails.length === 0) return alert('Nama racikan dan bahan obat tidak boleh kosong!');
    
    setKeranjangRacikan([...keranjangRacikan, {
       nama_racik: racikName,
       kd_racik: racikMetode,
       jml_dr: racikJml,
       aturan_pakai: racikAturan,
       keterangan: racikKeterangan,
       details: racikDetails
    }]);

    setRacikName('');
    setRacikDetails([]);
  };

  const submitResep = async () => {
    if (keranjangJadi.length === 0 && keranjangRacikan.length === 0) return alert('Keranjang kosong!');
    try {
      const payload = {
        no_rawat: noRawat,
        kd_dokter: kdDokter,
        items: keranjangJadi.map(k => ({ kode_brng: k.kode_brng, jml: Number(k.jml), aturan: k.aturan })),
        racikan: keranjangRacikan.map(r => ({
          nama_racik: r.nama_racik,
          kd_racik: r.kd_racik,
          jml_dr: Number(r.jml_dr),
          aturan_pakai: r.aturan_pakai,
          keterangan: r.keterangan,
          details: r.details.map((d: any) => ({ kode_brng: d.kode_brng, p1: Number(d.p1), p2: Number(d.p2) }))
        }))
      };
      const res = await apiFetch(`http://localhost:3000/farmasi/resep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('E-Resep berhasil dikirim ke Farmasi!');
        setKeranjangJadi([]);
        setKeranjangRacikan([]);
      } else {
        alert('Gagal mengirim resep');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-[#004d40]" /> Input E-Resep Obat Terintegrasi
        </h1>
        <p className="text-sm text-slate-500 mt-1">Pencarian master barang, pengecekan stok gudang, dan peresepan obat jadi/racikan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kolom Kiri: Pencarian Obat & Racikan */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit">
            
            {/* Tab Navigation */}
            <div className="flex bg-slate-100 p-1 rounded-lg w-fit border border-slate-200 mb-5">
              <button 
                onClick={() => setActiveTab('jadi')}
                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'jadi' ? 'bg-white text-[#004d40] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Pill className="w-4 h-4" /> Obat Jadi
              </button>
              <button 
                onClick={() => setActiveTab('racikan')}
                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'racikan' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <FlaskConical className="w-4 h-4" /> Obat Racikan
              </button>
            </div>

            {/* Pencarian */}
            <div className="flex gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Ketik nama obat atau alkes..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchObat()}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40]"
                />
              </div>
              <button 
                onClick={searchObat}
                className="bg-[#004d40] hover:bg-[#00332a] text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
              >
                Cari
              </button>
            </div>

            {/* Hasil Pencarian */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-2">
              {obatList.map((obat) => (
                <div key={obat.kode_brng} className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex justify-between items-center hover:border-[#004d40]/30 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{obat.nama_brng}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">Kode: {obat.kode_brng} | Rp {obat.ralan.toLocaleString('id-ID')} / {obat.satuan}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => cekStok(obat.kode_brng)}
                      className="bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white text-xs font-bold py-1.5 px-3 rounded-md transition-colors flex items-center gap-1"
                    >
                      <Box className="w-3.5 h-3.5" /> Stok
                    </button>
                    {activeTab === 'jadi' ? (
                      <button 
                        onClick={() => tambahObatJadi(obat)}
                        className="bg-[#004d40]/10 text-[#004d40] hover:bg-[#004d40] hover:text-white text-xs font-bold py-1.5 px-3 rounded-md transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Resepkan
                      </button>
                    ) : (
                      <button 
                        onClick={() => tambahKeBahanRacik(obat)}
                        className="bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white text-xs font-bold py-1.5 px-3 rounded-md transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Bahan Racik
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {obatList.length === 0 && keyword && (
                <p className="text-sm text-slate-400 text-center py-4">Tidak ada obat ditemukan.</p>
              )}
            </div>

            {/* Form Obat Racikan */}
            {activeTab === 'racikan' && (
              <div className="mt-6 border-t border-slate-200 pt-5">
                <h3 className="font-bold text-amber-600 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                  <FlaskConical className="w-4 h-4" /> Form Komposisi Racikan
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Nama Racikan</label>
                    <input type="text" value={racikName} onChange={e => setRacikName(e.target.value)} placeholder="Contoh: Puyer Demam Anak" className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#004d40]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Metode Racik</label>
                    <select value={racikMetode} onChange={e => setRacikMetode(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#004d40]">
                      {metodeList.map(m => <option key={m.kd_racik} value={m.kd_racik}>{m.nm_racik}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Jml Bungkus/Kapsul</label>
                    <input type="number" value={racikJml} onChange={e => setRacikJml(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#004d40]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Aturan Pakai</label>
                    <input type="text" value={racikAturan} onChange={e => setRacikAturan(e.target.value)} placeholder="3 x 1 Hari" className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#004d40]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Keterangan Tambahan</label>
                    <input type="text" value={racikKeterangan} onChange={e => setRacikKeterangan(e.target.value)} placeholder="Sesudah makan, dihabiskan" className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#004d40]" />
                  </div>
                </div>
                
                <h4 className="text-[11px] font-bold text-slate-500 mb-2 uppercase border-b border-slate-100 pb-1">Bahan Baku Terpilih:</h4>
                <div className="space-y-2 mb-5 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-1">
                   {racikDetails.map(d => (
                     <div key={d.kode_brng} className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-sm text-slate-800">{d.nama_brng}</p>
                          <div className="flex gap-2 items-center mt-1.5">
                             <span className="text-xs font-semibold text-slate-600">Kandungan (p1/p2): </span>
                             <input type="number" value={d.p1} onChange={e => updateBahanRacik(d.kode_brng, 'p1', e.target.value)} className="w-12 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-xs" />
                             <span className="text-xs font-bold text-slate-400">/</span>
                             <input type="number" value={d.p2} onChange={e => updateBahanRacik(d.kode_brng, 'p2', e.target.value)} className="w-12 bg-white border border-slate-300 rounded px-1.5 py-1 text-center text-xs" />
                             <span className="text-xs font-bold text-amber-700 ml-2 bg-amber-100 px-2 py-0.5 rounded">= {((d.p1/d.p2)*racikJml).toFixed(1)} tablet fisik</span>
                          </div>
                        </div>
                        <button onClick={() => hapusBahanRacik(d.kode_brng)} className="text-rose-400 hover:bg-rose-100 hover:text-rose-600 p-1.5 rounded-md transition-colors"><X className="w-4 h-4"/></button>
                     </div>
                   ))}
                   {racikDetails.length === 0 && <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded border border-slate-100">Belum ada bahan baku. Cari di atas lalu klik "Bahan Racik".</p>}
                </div>
                
                <button 
                  onClick={simpanRacikanKeKeranjang} 
                  disabled={!racikName || racikDetails.length === 0}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ListPlus className="w-5 h-5" /> Simpan Racikan ke Keranjang
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Keranjang Resep */}
        <div className="lg:col-span-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit sticky top-6">
             <h2 className="text-lg font-bold mb-4 text-[#004d40] flex items-center gap-2 pb-3 border-b border-slate-100">
                <PackageOpen className="w-5 h-5" /> Keranjang E-Resep
             </h2>
             
             <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">No Rawat</label>
                  <div className="relative">
                    <FileText className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
                    <input type="text" value={noRawat} onChange={e=>setNoRawat(e.target.value)} className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Kode Dokter</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
                    <input type="text" value={kdDokter} onChange={e=>setKdDokter(e.target.value)} className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40]" />
                  </div>
                </div>
             </div>

             <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-1 mb-6">
                
                {/* Item Obat Jadi */}
                {keranjangJadi.map((item) => (
                  <div key={item.kode_brng} className="bg-slate-50 border border-slate-200 p-3 rounded-xl border-l-4 border-l-[#004d40]">
                     <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-sm text-slate-800">{item.nama_brng}</h4>
                        <button onClick={() => setKeranjangJadi(keranjangJadi.filter(k=>k.kode_brng !== item.kode_brng))} className="text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-1 rounded-md transition-colors"><X className="w-4 h-4"/></button>
                     </div>
                     <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Jumlah</label>
                          <input type="number" value={item.jml} onChange={(e)=>updateKeranjangJadi(item.kode_brng, 'jml', e.target.value)} className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#004d40]" />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Aturan Pakai</label>
                          <input type="text" value={item.aturan} onChange={(e)=>updateKeranjangJadi(item.kode_brng, 'aturan', e.target.value)} className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-sm text-slate-800 focus:outline-none focus:border-[#004d40]" />
                        </div>
                     </div>
                  </div>
                ))}
                
                {/* Item Racikan */}
                {keranjangRacikan.map((racik, idx) => (
                  <div key={idx} className="bg-amber-50 border border-amber-200 p-3 rounded-xl border-l-4 border-l-amber-500">
                     <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-sm text-amber-800 flex items-center gap-1"><FlaskConical className="w-3.5 h-3.5"/> {racik.nama_racik}</h4>
                        <button onClick={() => setKeranjangRacikan(keranjangRacikan.filter((_, i) => i !== idx))} className="text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-1 rounded-md transition-colors"><X className="w-4 h-4"/></button>
                     </div>
                     <p className="text-xs font-bold text-slate-600 mb-2">{racik.jml_dr} Bungkus • Aturan: {racik.aturan_pakai}</p>
                     <div className="bg-white/60 p-2 rounded-md border border-amber-100 text-xs space-y-1">
                        {racik.details.map((d: any, dIdx: number) => (
                          <div key={dIdx} className="flex justify-between text-slate-600 border-b border-amber-100/50 pb-1 last:border-0 last:pb-0">
                            <span className="font-medium">- {d.nama_brng}</span>
                            <span className="font-mono">{d.p1}/{d.p2} (Fisik: {((d.p1/d.p2)*racik.jml_dr).toFixed(1)})</span>
                          </div>
                        ))}
                     </div>
                  </div>
                ))}

                {(keranjangJadi.length === 0 && keranjangRacikan.length === 0) && (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <PackageOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Keranjang Kosong</p>
                  </div>
                )}
             </div>

             <div className="pt-2">
               <button 
                  onClick={submitResep}
                  className="w-full bg-[#004d40] hover:bg-[#00332a] text-white font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center gap-2"
                  disabled={keranjangJadi.length === 0 && keranjangRacikan.length === 0}
               >
                 <CheckCircle2 className="w-5 h-5" /> Simpan & Kirim E-Resep ke Apotek
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Modal Stok */}
      {stokModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
           <div className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              <button onClick={() => setStokModal(null)} className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 hover:text-slate-700 p-1.5 rounded-full transition-colors"><X className="w-5 h-5"/></button>
              
              <h3 className="text-lg font-bold mb-4 text-[#004d40] flex items-center gap-2 border-b border-slate-100 pb-3">
                <Box className="w-5 h-5" /> Informasi Stok Gudang
              </h3>
              
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Kode Barang</p>
                <p className="font-mono text-sm text-slate-800 font-bold">{stokModal.kode_brng}</p>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                 {stokModal.stok.map((s: any, idx: number) => (
                   <div key={idx} className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-lg hover:border-[#004d40]/30 transition-colors">
                     <span className="font-bold text-sm text-slate-700">{s.kd_bangsal}</span>
                     <span className={`font-bold text-lg ${s.stok > 0 ? 'text-[#004d40]' : 'text-rose-500'}`}>{s.stok}</span>
                   </div>
                 ))}
                 {stokModal.stok.length === 0 && (
                   <div className="text-center py-6 bg-rose-50 border border-rose-100 rounded-lg">
                     <p className="text-sm font-bold text-rose-600">⚠️ Stok kosong di semua gudang depo!</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
