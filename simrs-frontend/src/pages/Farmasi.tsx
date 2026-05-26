import { apiFetch } from '../lib/api';
import { useState, useEffect } from 'react';

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
        alert('E-Resep berhasil dikirim!');
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-6 pt-24 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">
          Modul Farmasi & E-Resep
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="flex gap-4 border-b border-white/10 mb-6 pb-2">
              <button 
                onClick={() => setActiveTab('jadi')}
                className={`pb-2 font-bold transition ${activeTab === 'jadi' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-400 hover:text-white'}`}
              >
                Obat Jadi
              </button>
              <button 
                onClick={() => setActiveTab('racikan')}
                className={`pb-2 font-bold transition ${activeTab === 'racikan' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-gray-400 hover:text-white'}`}
              >
                Obat Racikan
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="Cari nama bahan/obat..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchObat()}
                className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              />
              <button 
                onClick={searchObat}
                className="bg-teal-500 hover:bg-teal-400 text-white font-semibold py-3 px-6 rounded-xl transition shadow-[0_0_15px_rgba(20,184,166,0.5)]"
              >
                Cari
              </button>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {obatList.map((obat) => (
                <div key={obat.kode_brng} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center hover:bg-white/10 transition">
                  <div>
                    <h3 className="font-bold text-lg">{obat.nama_brng}</h3>
                    <p className="text-sm text-gray-400">Kode: {obat.kode_brng} | Rp {obat.ralan}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => cekStok(obat.kode_brng)}
                      className="bg-purple-600/80 hover:bg-purple-500 text-white text-sm py-1.5 px-3 rounded-lg transition"
                    >
                      Cek Stok
                    </button>
                    {activeTab === 'jadi' ? (
                      <button 
                        onClick={() => tambahObatJadi(obat)}
                        className="bg-cyan-600/80 hover:bg-cyan-500 text-white text-sm py-1.5 px-3 rounded-lg transition"
                      >
                        Pilih
                      </button>
                    ) : (
                      <button 
                        onClick={() => tambahKeBahanRacik(obat)}
                        className="bg-amber-600/80 hover:bg-amber-500 text-white text-sm py-1.5 px-3 rounded-lg transition"
                      >
                        + Bahan Racik
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {activeTab === 'racikan' && (
              <div className="mt-6 border-t border-white/10 pt-6">
                <h3 className="font-bold text-amber-300 mb-4 text-xl">Buat Bungkus Racikan</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Nama Racikan</label>
                    <input type="text" value={racikName} onChange={e => setRacikName(e.target.value)} className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Metode Racik</label>
                    <select value={racikMetode} onChange={e => setRacikMetode(e.target.value)} className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                      {metodeList.map(m => <option key={m.kd_racik} value={m.kd_racik}>{m.nm_racik}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Jml Bungkus/Kapsul</label>
                    <input type="number" value={racikJml} onChange={e => setRacikJml(Number(e.target.value))} className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Aturan Pakai</label>
                    <input type="text" value={racikAturan} onChange={e => setRacikAturan(e.target.value)} className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">Keterangan Tambahan</label>
                    <input type="text" value={racikKeterangan} onChange={e => setRacikKeterangan(e.target.value)} className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                  </div>
                </div>
                
                <h4 className="text-sm font-bold text-gray-300 mb-2">Bahan Baku Terpilih:</h4>
                <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto custom-scrollbar">
                   {racikDetails.map(d => (
                     <div key={d.kode_brng} className="bg-black/40 border border-white/10 p-3 rounded-lg flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-sm">{d.nama_brng}</p>
                          <div className="flex gap-2 items-center mt-2">
                             <span className="text-xs text-gray-400">Takaran: </span>
                             <input type="number" value={d.p1} onChange={e => updateBahanRacik(d.kode_brng, 'p1', e.target.value)} className="w-12 bg-white/10 rounded px-1 py-1 text-center text-xs" />
                             <span className="text-xs">/</span>
                             <input type="number" value={d.p2} onChange={e => updateBahanRacik(d.kode_brng, 'p2', e.target.value)} className="w-12 bg-white/10 rounded px-1 py-1 text-center text-xs" />
                             <span className="text-xs text-gray-400 ml-2">= {((d.p1/d.p2)*racikJml).toFixed(1)} Fisik</span>
                          </div>
                        </div>
                        <button onClick={() => hapusBahanRacik(d.kode_brng)} className="text-red-400 hover:text-red-300 text-sm p-2">✕</button>
                     </div>
                   ))}
                   {racikDetails.length === 0 && <p className="text-xs text-gray-500 italic">Belum ada bahan baku. Cari dan klik "+ Bahan Racik".</p>}
                </div>
                
                <button 
                  onClick={simpanRacikanKeKeranjang} 
                  disabled={!racikName || racikDetails.length === 0}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-lg transition shadow-lg disabled:opacity-50"
                >
                  Simpan Racikan ke Keranjang
                </button>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
             <h2 className="text-2xl font-bold mb-4 text-cyan-300">Keranjang E-Resep</h2>
             
             <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">No Rawat</label>
                  <input type="text" value={noRawat} onChange={e=>setNoRawat(e.target.value)} className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Kode Dokter</label>
                  <input type="text" value={kdDokter} onChange={e=>setKdDokter(e.target.value)} className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
             </div>

             <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                {keranjangJadi.map((item) => (
                  <div key={item.kode_brng} className="bg-black/20 border border-teal-500/30 p-4 rounded-xl border-l-4 border-l-teal-500">
                     <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold">{item.nama_brng}</h4>
                        <button onClick={() => setKeranjangJadi(keranjangJadi.filter(k=>k.kode_brng !== item.kode_brng))} className="text-red-400 hover:text-red-300 text-sm">Hapus</button>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Jumlah</label>
                          <input type="number" value={item.jml} onChange={(e)=>updateKeranjangJadi(item.kode_brng, 'jml', e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Aturan Pakai</label>
                          <input type="text" value={item.aturan} onChange={(e)=>updateKeranjangJadi(item.kode_brng, 'aturan', e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
                        </div>
                     </div>
                  </div>
                ))}
                
                {keranjangRacikan.map((racik, idx) => (
                  <div key={idx} className="bg-black/20 border border-amber-500/30 p-4 rounded-xl border-l-4 border-l-amber-500">
                     <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-amber-400">{racik.nama_racik}</h4>
                        <button onClick={() => setKeranjangRacikan(keranjangRacikan.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-300 text-sm">Hapus</button>
                     </div>
                     <p className="text-xs text-gray-300 mb-2">{racik.jml_dr} Bungkus | Aturan: {racik.aturan_pakai}</p>
                     <div className="bg-white/5 p-2 rounded text-xs space-y-1">
                        {racik.details.map((d: any, dIdx: number) => (
                          <div key={dIdx} className="flex justify-between text-gray-400">
                            <span>- {d.nama_brng}</span>
                            <span>{d.p1}/{d.p2} (Fisik: {((d.p1/d.p2)*racik.jml_dr).toFixed(1)})</span>
                          </div>
                        ))}
                     </div>
                  </div>
                ))}

                {(keranjangJadi.length === 0 && keranjangRacikan.length === 0) && <p className="text-gray-400 italic">Keranjang kosong.</p>}
             </div>

             <button 
                onClick={submitResep}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 rounded-xl transition shadow-[0_0_20px_rgba(6,182,212,0.5)] disabled:opacity-50"
                disabled={keranjangJadi.length === 0 && keranjangRacikan.length === 0}
             >
               Kirim E-Resep
             </button>
          </div>
        </div>

        {stokModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
             <div className="bg-gray-900 border border-white/20 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
                <button onClick={() => setStokModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">&times;</button>
                <h3 className="text-xl font-bold mb-4 text-purple-300">Informasi Stok Gudang</h3>
                <p className="mb-4 text-sm text-gray-300">Kode Obat: {stokModal.kode_brng}</p>
                <div className="space-y-2">
                   {stokModal.stok.map((s: any, idx: number) => (
                     <div key={idx} className="flex justify-between bg-white/5 p-3 rounded-lg">
                       <span className="font-mono">{s.kd_bangsal}</span>
                       <span className="font-bold text-teal-400">{s.stok}</span>
                     </div>
                   ))}
                   {stokModal.stok.length === 0 && <p className="text-red-400 text-sm">Stok kosong di semua gudang.</p>}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
