import React from 'react';
import { Menu, Bell, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  
  // Format the path to a readable title
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1] || 'Dashboard';
    const titles: Record<string, string> = {
      'dashboard': 'Dashboard',
      'monitoring': 'Data Monitoring Center',
      'registration': 'Pendaftaran Pasien',
      'queues': 'Antrean Poliklinik',
      'beds': 'Bed Management',
      'rme': 'Rekam Medis Elektronik (RME)',
      'ranap-cppt': 'CPPT Rawat Inap',
      'farmasi': 'Farmasi & E-Resep',
      'apotek': 'Apotek',
      'lab': 'Laboratorium',
      'operasi': 'Kamar Operasi',
      'kasir': 'Kasir & Billing',
    };
    return titles[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-10">
      <div className="flex items-center gap-4">
        <button className="text-slate-500 hover:text-slate-700 md:hidden">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Prototype Badge */}
        <div className="hidden md:flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1.5 rounded-md text-xs font-bold">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          PROTOTIPE - BUKAN PRODUKSI
        </div>

        {/* Date */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-slate-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {currentDate}
        </div>

        {/* Notification */}
        <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
            5
          </span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-[#004d40] text-white flex items-center justify-center text-sm font-bold">
            AD
          </div>
          <div className="hidden md:block text-sm">
            <p className="font-semibold text-slate-800 leading-tight">Admin SIMRS</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;
