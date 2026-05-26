import { apiFetch } from '../lib/api';
import { useState } from 'react';
import { CreditCard, Search, Receipt, CheckCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

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
          no_rawat: tagihan.no_rawat, // Send original or formatted, but backend expects '2026/02/25/xxx'
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
    <div className="min-h-screen bg-neutral-950 text-white p-8 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-emerald-500/20 rounded-xl">
            <CreditCard className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Billing & Kasir Terpadu
            </h1>
            <p className="text-sm text-gray-400">Penyatuan tagihan Registrasi, Medis, dan Farmasi</p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={noRawat}
            onChange={(e) => setNoRawat(e.target.value)}
            placeholder="Cari Nomor Rawat (Contoh: 2026/02/25/000005)"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-32 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all backdrop-blur-xl"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            {loading ? 'Mencari...' : 'Cari'}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Main Content */}
        {tagihan && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            
            {/* Left Column: Patient Info & Invoice Items */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Patient Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">{tagihan.pasien}</h2>
                    <p className="text-sm text-gray-400 font-mono">{tagihan.no_rawat}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    tagihan.status_bayar === 'Sudah Bayar' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {tagihan.status_bayar}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-black/20 rounded-lg">
                    <p className="text-gray-500 mb-1">Poliklinik</p>
                    <p className="text-white font-medium">{tagihan.poliklinik}</p>
                  </div>
                  <div className="p-3 bg-black/20 rounded-lg">
                    <p className="text-gray-500 mb-1">Dokter DPJP</p>
                    <p className="text-white font-medium">{tagihan.dokter}</p>
                  </div>
                </div>
              </div>

              {/* Itemized Bill */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-emerald-400" />
                    Rincian Tagihan
                  </h3>
                </div>

                <div className="p-0">
                  {/* Administrasi */}
                  <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-white">Biaya Registrasi / Administrasi</h4>
                      <p className="text-xs text-gray-500">Karcis pendaftaran loket</p>
                    </div>
                    <span className="font-mono text-emerald-300">{formatRupiah(tagihan.rincian.registrasi)}</span>
                  </div>

                  {/* Tindakan Dokter (Collapsible) */}
                  <div className="border-b border-white/5">
                    <button 
                      onClick={() => setExpandedSection(expandedSection === 'tindakan' ? null : 'tindakan')}
                      className="w-full p-4 flex justify-between items-center hover:bg-white/5 transition-colors"
                    >
                      <div className="text-left">
                        <h4 className="font-medium text-white">Tindakan Medis & Dokter</h4>
                        <p className="text-xs text-gray-500">{tagihan.rincianTindakan.length} item tindakan</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-emerald-300">{formatRupiah(tagihan.rincian.tindakan)}</span>
                        {expandedSection === 'tindakan' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>
                    {expandedSection === 'tindakan' && (
                      <div className="bg-black/30 p-4 space-y-2">
                        {tagihan.rincianTindakan.map((t: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-400">- {t.nama}</span>
                            <span className="font-mono text-gray-300">{formatRupiah(t.biaya)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Obat & Farmasi (Collapsible) */}
                  <div className="">
                    <button 
                      onClick={() => setExpandedSection(expandedSection === 'obat' ? null : 'obat')}
                      className="w-full p-4 flex justify-between items-center hover:bg-white/5 transition-colors"
                    >
                      <div className="text-left">
                        <h4 className="font-medium text-white flex items-center gap-2">
                          Obat & Farmasi
                        </h4>
                        <p className="text-xs text-gray-500">{tagihan.rincianObat.length} item obat</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-emerald-300">{formatRupiah(tagihan.rincian.obat)}</span>
                        {expandedSection === 'obat' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>
                    {expandedSection === 'obat' && (
                      <div className="bg-black/30 p-4 space-y-3">
                        {tagihan.rincianObat.map((o: any, i: number) => (
                          <div key={i} className="flex justify-between items-start text-sm">
                            <div>
                              <p className="text-gray-300">- {o.nama}</p>
                              <p className="text-xs text-gray-500">{o.jml} x {formatRupiah(o.harga)}</p>
                            </div>
                            <span className="font-mono text-gray-300">{formatRupiah(o.total)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Checkout Panel */}
            <div className="space-y-6">
              <div className="bg-gradient-to-b from-emerald-900/40 to-black/40 border border-emerald-500/20 rounded-3xl p-6 backdrop-blur-xl sticky top-8 shadow-2xl shadow-emerald-900/20">
                <h3 className="text-gray-400 text-sm font-medium mb-2">Grand Total Tagihan</h3>
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-50 mb-8 font-mono">
                  {formatRupiah(tagihan.grandTotal)}
                </div>

                {tagihan.status_bayar === 'Belum Bayar' ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Nominal Diterima (Rp)</label>
                      <input
                        type="number"
                        value={nominalBayar}
                        onChange={(e) => setNominalBayar(e.target.value)}
                        placeholder="Contoh: 500000"
                        className="w-full bg-black/50 border border-emerald-500/30 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                    
                    {Number(nominalBayar) > 0 && (
                      <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg">
                        <span className="text-sm text-gray-400">Kembalian</span>
                        <span className="font-mono font-medium text-amber-400">
                          {formatRupiah(Number(nominalBayar) - tagihan.grandTotal)}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={handleBayar}
                      disabled={isProcessing || Number(nominalBayar) < tagihan.grandTotal}
                      className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                      {isProcessing ? 'Memproses...' : 'Proses Pembayaran'}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-3">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-400">LUNAS</h4>
                      <p className="text-xs text-gray-400 mt-1">Transaksi ini telah ditutup.</p>
                    </div>
                    {success && (
                      <div className="mt-4 p-3 bg-black/40 rounded-xl w-full">
                        <p className="text-xs text-gray-500 mb-1">No. Nota</p>
                        <p className="font-mono text-white text-sm">{success.no_nota}</p>
                      </div>
                    )}
                    
                    {/* E-Klaim Casemix Button */}
                    <div className="mt-6 w-full pt-6 border-t border-emerald-500/20">
                      <h4 className="text-sm font-bold text-emerald-300 mb-3">Integrasi BPJS / E-Klaim</h4>
                      
                      {klaimSuccess ? (
                         <div className="p-3 bg-emerald-900/30 rounded-xl border border-emerald-500/30">
                            <p className="text-xs text-emerald-300">✅ {klaimSuccess}</p>
                         </div>
                      ) : (
                         <div className="space-y-3">
                            {klaimError && (
                              <div className="p-2 bg-red-900/30 rounded border border-red-500/30 text-xs text-red-400">
                                {klaimError}
                              </div>
                            )}
                            <button
                              onClick={() => setShowEscapeHatch(!showEscapeHatch)}
                              className="text-xs text-gray-400 hover:text-white underline mb-1"
                            >
                              Gunakan Escape Hatch (Manual SEP)?
                            </button>
                            
                            {showEscapeHatch && (
                              <input
                                type="text"
                                value={bypassNoSep}
                                onChange={(e) => setBypassNoSep(e.target.value)}
                                placeholder="Masukkan No SEP Manual..."
                                className="w-full text-xs p-2 bg-black/50 border border-emerald-500/30 rounded focus:outline-none"
                              />
                            )}

                            <button
                              onClick={handleKlaim}
                              disabled={isKlaimProcessing}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50"
                            >
                              {isKlaimProcessing ? 'Memproses...' : 'Kirim E-Klaim INACBG'}
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
    </div>
  );
}
