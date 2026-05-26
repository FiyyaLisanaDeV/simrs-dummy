import { apiFetch } from '../lib/api';
import { useEffect, useState } from 'react';
import { MonitorPlay, Users, Volume2, Clock, CalendarDays, Activity } from 'lucide-react';

export default function QueueDisplay() {
  const [queues, setQueues] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchQueues();
    const queueInterval = setInterval(fetchQueues, 5000); // Poll every 5s
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000); // Update clock every second
    
    return () => {
      clearInterval(queueInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const fetchQueues = async () => {
    try {
      const res = await apiFetch('http://localhost:3000/api/queues/today');
      const data = await res.json();
      setQueues(data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden">
      
      {/* Header TV Display */}
      <div className="bg-slate-950 border-b border-slate-800 p-6 flex justify-between items-center shadow-2xl z-10">
        <div className="flex items-center gap-4">
          <div className="bg-[#004d40] p-3 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(0,77,64,0.5)]">
            <MonitorPlay className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 tracking-tight">
              Sistem Antrean Poliklinik
            </h1>
            <p className="text-slate-400 font-medium tracking-wide flex items-center gap-2 mt-1">
              <Activity className="w-4 h-4 text-emerald-500" /> RSUD Harapan Baru 2026
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold font-mono text-emerald-400 flex items-center justify-end gap-2 drop-shadow-md">
            <Clock className="w-6 h-6" /> {formatTime(currentTime)}
          </div>
          <div className="text-slate-400 font-medium mt-1 text-sm flex items-center justify-end gap-1.5">
            <CalendarDays className="w-4 h-4" /> {formatDate(currentTime)}
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 p-8 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 h-full">
          {queues.map((q, index) => (
            <div 
              key={q.no_rawat} 
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-500 ${
                index === 0 
                  ? 'bg-gradient-to-br from-[#004d40] to-emerald-900 border border-emerald-400/50 shadow-[0_0_40px_rgba(16,185,129,0.2)] transform scale-105 z-10 ring-4 ring-emerald-500/20' 
                  : 'bg-slate-800 border border-slate-700 shadow-xl'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className={`text-xl font-bold px-4 py-1.5 rounded-full inline-block ${
                    index === 0 ? 'bg-emerald-400 text-[#004d40] shadow-md' : 'bg-slate-700 text-slate-300'
                  }`}>
                    NOMOR {q.no_reg}
                  </div>
                  {index === 0 && (
                    <div className="flex items-center gap-2 text-emerald-300 animate-pulse bg-black/20 px-3 py-1 rounded-full text-sm font-semibold">
                      <Volume2 className="w-4 h-4" /> Memanggil...
                    </div>
                  )}
                </div>
                
                <h2 className={`text-4xl font-black mb-2 truncate uppercase ${
                  index === 0 ? 'text-white drop-shadow-md' : 'text-slate-200'
                }`}>
                  {q.pasien?.nm_pasien}
                </h2>
                
                <div className={`text-lg font-mono ${
                  index === 0 ? 'text-emerald-200/80' : 'text-slate-500'
                }`}>
                  RM: {q.no_rawat}
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className={`text-2xl font-bold flex items-center gap-3 ${
                  index === 0 ? 'text-emerald-100' : 'text-slate-400'
                }`}>
                  <Users className={`w-6 h-6 ${index === 0 ? 'text-emerald-300' : 'text-slate-500'}`} />
                  {q.poliklinik?.nm_poli}
                </div>
                <div className="mt-4 flex gap-3">
                  <span className={`text-sm font-bold px-4 py-2 rounded-xl uppercase tracking-wider ${
                    index === 0 
                      ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}>
                    Status: {q.stts}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {queues.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center h-[60vh] text-slate-500 space-y-6">
              <div className="relative">
                <MonitorPlay className="w-32 h-32 text-slate-800" />
                <Activity className="w-12 h-12 text-slate-700 absolute bottom-0 right-0 animate-bounce" />
              </div>
              <h2 className="text-3xl font-bold text-slate-600">Belum Ada Antrean Poliklinik</h2>
              <p className="text-xl">Silakan menunggu panggilan dari petugas.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Ticker Bottom */}
      <div className="bg-[#004d40] text-emerald-100 py-3 px-6 text-xl font-medium tracking-wide whitespace-nowrap overflow-hidden flex items-center shadow-inner">
        <span className="font-bold text-white mr-4 bg-emerald-600 px-3 py-0.5 rounded shadow-sm">INFO</span>
        <div className="animate-marquee inline-block">
           Harap siapkan Kartu Identitas Berobat (KIB) dan berkas persyaratan BPJS Anda sebelum dipanggil ke loket. Tetap patuhi protokol kesehatan di lingkungan rumah sakit. Terima kasih.
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}} />
    </div>
  );
}
