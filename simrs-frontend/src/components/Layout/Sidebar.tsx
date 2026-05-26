import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  ListOrdered, 
  Bed, 
  FileText, 
  ClipboardList, 
  Pill, 
  Store, 
  TestTube, 
  Scissors, 
  CreditCard,
  LogOut
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/registration', label: 'Pendaftaran', icon: Users },
    { path: '/queues', label: 'Antrean', icon: ListOrdered },
    { path: '/beds', label: 'Bed Management', icon: Bed },
    { path: '/rme', label: 'RME', icon: FileText },
    { path: '/ranap-cppt', label: 'CPPT Rawat Inap', icon: ClipboardList },
    { path: '/farmasi', label: 'Farmasi', icon: Pill },
    { path: '/apotek', label: 'Apotek', icon: Store },
    { path: '/lab', label: 'Laboratorium', icon: TestTube },
    { path: '/operasi', label: 'Operasi', icon: Scissors },
    { path: '/kasir', label: 'Kasir & Billing', icon: CreditCard },
  ];

  return (
    <aside className="w-64 bg-[#004d40] text-white flex flex-col h-full flex-shrink-0 transition-all duration-300">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="bg-white text-[#004d40] p-1.5 rounded-lg flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div>
          <h2 className="font-bold text-lg leading-tight">SIMRS Dummy</h2>
          <p className="text-[10px] text-emerald-100/70">Sistem Informasi Manajemen Rumah Sakit</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-white/20">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-600/30 text-white border-l-4 border-emerald-400'
                  : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-emerald-100/70 hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
