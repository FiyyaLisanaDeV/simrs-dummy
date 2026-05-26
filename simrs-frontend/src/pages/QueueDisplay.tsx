import { apiFetch } from '../lib/api';
import { useEffect, useState } from 'react';

export default function QueueDisplay() {
  const [queues, setQueues] = useState<any[]>([]);

  useEffect(() => {
    fetchQueues();
    const interval = setInterval(fetchQueues, 5000); // Poll every 5s
    return () => clearInterval(interval);
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

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-slate-800">
        Live Antrean Poliklinik
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {queues.map((q, index) => (
          <div 
            key={q.no_rawat} 
            className={`p-6 rounded-2xl shadow-xl border-t-4 transition-all transform hover:-translate-y-1 ${index === 0 ? 'bg-blue-600 text-white border-blue-400 scale-105' : 'bg-white text-slate-800 border-blue-600'}`}
          >
            <div className={`text-sm font-semibold mb-2 ${index === 0 ? 'text-blue-100' : 'text-blue-600'}`}>
              ANTREAN {q.no_reg}
            </div>
            <div className="text-2xl font-bold mb-1 truncate">{q.pasien?.nm_pasien}</div>
            <div className={`text-sm ${index === 0 ? 'text-blue-200' : 'text-gray-500'}`}>
              RM: {q.no_rawat}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="font-medium">{q.poliklinik?.nm_poli}</div>
              <div className={`text-xs mt-1 inline-block px-3 py-1 rounded-full ${index === 0 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                Status: {q.stts}
              </div>
            </div>
          </div>
        ))}
        {queues.length === 0 && (
          <div className="col-span-full text-center text-gray-400 mt-10">
            <div className="text-6xl mb-4">☕</div>
            <p className="text-xl">Belum ada antrean poli hari ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
