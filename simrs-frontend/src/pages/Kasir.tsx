import { apiFetch } from '../lib/api';
import { useState } from 'react';
import { CreditCard, Search, Receipt, CheckCircle, ChevronDown, ChevronUp, AlertCircle, CircleDollarSign, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function Kasir() {
  const [noRawat, setNoRawat] = useState('');
  const [tagihan, setTagihan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [nominalBayar, setNominalBayar] = useState<number | string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState<any>(null);

  const [expandedSection, setExpandedSection] = useState<string | null>('tindakan');

  // E-Klaim State
  const [isKlaimProcessing, setIsKlaimProcessing] = useState(false);
  const [klaimSuccess, setKlaimSuccess] = useState<string>('');
  const [klaimError, setKlaimError] = useState<string>('');
  const [showEscapeHatch, setShowEscapeHatch] = useState(false);
  const [bypassNoSep, setBypassNoSep] = useState('');

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noRawat) return;

    setLoading(true);
    setError('');
    setTagihan(null);
    setSuccess(null);
    setKlaimSuccess('');
    setKlaimError('');

    try {
      const formattedNoRawat = noRawat.replace(/\//g, '-');
      const response = await apiFetch(`http://localhost:3000/kasir/tagihan/${formattedNoRawat}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Data tagihan tidak ditemukan.');
      }
      const data = await response.json();
      setTagihan(data);
    } catch (err: any) {
      setError(err.message || 'Data tagihan tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  const handleBayar = async () => {
    if (!nominalBayar || Number(nominalBayar) < tagihan.grandTotal) {
      setError('Nominal pembayaran kurang dari total tagihan.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const formattedNoRawat = tagihan.no_rawat.replace(/\//g, '-');
      const response = await apiFetch('http://localhost:3000/kasir/bayar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          no_rawat: formattedNoRawat,
          nominal_bayar: Number(nominalBayar),
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memproses pembayaran.');
      }
      const data = await response.json();
      setSuccess(data);
      // Update local state to reflect paid status
      setTagihan((prev: any) => ({ ...prev, status_bayar: 'Sudah Bayar' }));
    } catch (err: any) {
      setError(err.message || 'Gagal memproses pembayaran.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKlaim = async () => {
    setIsKlaimProcessing(true);
    setKlaimError('');
    setKlaimSuccess('');

    try {
      const response = await apiFetch('http://localhost:3000/api/casemix/klaim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          no_rawat: tagihan.no_rawat,
          bypassNoSep: showEscapeHatch ? bypassNoSep : undefined
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Gagal memproses klaim.');
      }
      
      setKlaimSuccess(data.message || 'Klaim berhasil dikirim!');
    } catch (err: any) {
      setKlaimError(err.message || 'Gagal memproses klaim INACBG.');
    } finally {
      setIsKlaimProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Search */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#004d40]" /> Billing & Kasir Terpadu
          </h1>
          <p className="text-sm text-slate-500 mt-1">Penyatuan tagihan Registrasi, Medis, Farmasi, dan Kasir</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={noRawat}
            onChange={(e) => setNoRawat(e.target.value)}
            placeholder="Cari Nomor Rawat..."
            className="w-full pl-10 pr-24 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] transition-shadow"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-1 top-1 bg-[#004d40] hover:bg-[#00332a] text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Cari...' : 'Cari'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-200 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Main Content */}
      {tagihan && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Patient Info & Invoice Items */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Patient Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-1">{tagihan.pasien}</h2>
                  <p className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded w-fit">{tagihan.no_rawat}</p>
                </div>
                <div className={`px-3 py-1 rounded-md text-xs font-bold border ${
                  tagihan.status_bayar === 'Sudah Bayar' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {tagihan.status_bayar}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Poliklinik / Kamar</p>
                  <p className="text-slate-800 font-semibold">{tagihan.poliklinik}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dokter DPJP</p>
                  <p className="text-slate-800 font-semibold">{tagihan.dokter}</p>
                </div>
              </div>
            </div>

            {/* Itemized Bill */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 bg-slate-50">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#004d40]" /> Rincian Tagihan
                </h3>
              </div>

              <div className="p-0">
                {/* Administrasi */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Biaya Registrasi / Administrasi</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Karcis pendaftaran loket</p>
                  </div>
                  <span className="font-mono font-bold text-slate-700">{formatRupiah(tagihan.rincian.registrasi)}</span>
                </div>

                {/* Tindakan Dokter (Collapsible) */}
                <div className="border-b border-slate-100">
                  <button 
                    onClick={() => setExpandedSection(expandedSection === 'tindakan' ? null : 'tindakan')}
                    className="w-full p-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
                  >
                    <div className="text-left">
                      <h4 className="font-semibold text-slate-800 text-sm">Tindakan Medis & Dokter</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{tagihan.rincianTindakan.length} item tindakan</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-slate-700">{formatRupiah(tagihan.rincian.tindakan)}</span>
                      {expandedSection === 'tindakan' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                  {expandedSection === 'tindakan' && (
                    <div className="bg-slate-50/50 p-4 border-t border-slate-100 space-y-2">
                      {tagihan.rincianTindakan.map((t: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-slate-600 font-medium">- {t.nama}</span>
                          <span className="font-mono text-slate-500">{formatRupiah(t.biaya)}</span>
                        </div>
                      ))}
                      {tagihan.rincianTindakan.length === 0 && <p className="text-xs text-slate-400 italic">Tidak ada rincian tindakan.</p>}
                    </div>
                  )}
                </div>

                {/* Obat & Farmasi (Collapsible) */}
                <div>
                  <button 
                    onClick={() => setExpandedSection(expandedSection === 'obat' ? null : 'obat')}
                    className="w-full p-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
                  >
                    <div className="text-left">
                      <h4 className="font-semibold text-slate-800 text-sm">Obat & Farmasi</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{tagihan.rincianObat.length} item obat</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-slate-700">{formatRupiah(tagihan.rincian.obat)}</span>
                      {expandedSection === 'obat' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                  {expandedSection === 'obat' && (
                    <div className="bg-slate-50/50 p-4 border-t border-slate-100 space-y-3">
                      {tagihan.rincianObat.map((o: any, i: number) => (
                        <div key={i} className="flex justify-between items-start text-sm border-b border-slate-100/50 pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="text-slate-600 font-medium">- {o.nama}</p>
                            <p className="text-xs text-slate-500 mt-1">{o.jml} x {formatRupiah(o.harga)}</p>
                          </div>
                          <span className="font-mono text-slate-500">{formatRupiah(o.total)}</span>
                        </div>
                      ))}
                      {tagihan.rincianObat.length === 0 && <p className="text-xs text-slate-400 italic">Tidak ada rincian obat.</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Panel */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm sticky top-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Grand Total Tagihan</h3>
              <div className="text-3xl font-black text-[#004d40] mb-8 font-mono border-b border-slate-100 pb-6 flex items-center gap-2">
                {formatRupiah(tagihan.grandTotal)}
              </div>

              {tagihan.status_bayar === 'Belum Bayar' ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Nominal Diterima (Rp)</label>
                    <input
                      type="number"
                      value={nominalBayar}
                      onChange={(e) => setNominalBayar(e.target.value)}
                      placeholder="Contoh: 500000"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-800 font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40]"
                    />
                  </div>
                  
                  {Number(nominalBayar) > 0 && (
                    <div className="flex justify-between items-center p-3 bg-[#004d40]/5 border border-[#004d40]/20 rounded-lg">
                      <span className="text-xs font-bold text-slate-600 uppercase">Kembalian</span>
                      <span className="font-mono font-bold text-[#004d40] text-lg">
                        {formatRupiah(Number(nominalBayar) - tagihan.grandTotal)}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleBayar}
                    disabled={isProcessing || Number(nominalBayar) < tagihan.grandTotal}
                    className="w-full py-3 bg-[#004d40] hover:bg-[#00332a] text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
                  >
                    <CircleDollarSign className="w-5 h-5" />
                    {isProcessing ? 'Memproses...' : 'Proses Pembayaran'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center p-6 bg-emerald-50 border border-emerald-100 rounded-xl text-center space-y-2">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
                    <h4 className="font-bold text-emerald-700 text-lg">TAGIHAN LUNAS</h4>
                    <p className="text-xs text-emerald-600">Transaksi ini telah ditutup.</p>
                    
                    {success && (
                      <div className="mt-4 p-2 bg-white rounded-lg border border-emerald-100 w-full text-center shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">No. Nota Kwitansi</p>
                        <p className="font-mono text-slate-800 font-bold text-sm">{success.no_nota}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* E-Klaim Casemix Button */}
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Integrasi BPJS / E-Klaim INACBG</h4>
                    
                    {klaimSuccess ? (
                       <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-700 text-sm font-medium">
                          <CheckCircle2 className="w-5 h-5" /> {klaimSuccess}
                       </div>
                    ) : (
                       <div className="space-y-3">
                          {klaimError && (
                            <div className="p-2 bg-rose-50 rounded border border-rose-200 text-xs text-rose-600 font-medium flex items-start gap-1.5">
                              <ShieldAlert className="w-4 h-4 shrink-0" /> {klaimError}
                            </div>
                          )}
                          
                          <button
                            onClick={() => setShowEscapeHatch(!showEscapeHatch)}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline flex items-center gap-1"
                          >
                            <AlertCircle className="w-3.5 h-3.5" /> Gunakan Escape Hatch (Bypass SEP)?
                          </button>
                          
                          {showEscapeHatch && (
                            <div className="bg-rose-50 p-3 rounded-lg border border-rose-200">
                              <label className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-1">SEP Manual</label>
                              <input
                                type="text"
                                value={bypassNoSep}
                                onChange={(e) => setBypassNoSep(e.target.value)}
                                placeholder="Masukkan 19 Digit SEP..."
                                className="w-full text-xs p-2 bg-white border border-rose-300 rounded-md focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                              />
                            </div>
                          )}

                          <button
                            onClick={handleKlaim}
                            disabled={isKlaimProcessing}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50"
                          >
                            {isKlaimProcessing ? 'Memproses...' : 'Kirim Bridging E-Klaim'}
                          </button>
                       </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
