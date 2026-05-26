import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Registration from './pages/Registration';
import QueueDisplay from './pages/QueueDisplay';
import BedManagement from './pages/BedManagement';
import MedicalRecord from './pages/MedicalRecord';
import Farmasi from './pages/Farmasi';
import Apotek from './pages/Apotek';
import Laboratorium from './pages/Laboratorium';
import Kasir from './pages/Kasir';
import RanapCPPT from './pages/RanapCPPT';
import Operasi from './pages/Operasi';
import DataMonitoring from './pages/DataMonitoring';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes wrapped in MainLayout */}
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/monitoring" element={<MainLayout><DataMonitoring /></MainLayout>} />
        <Route path="/registration" element={<MainLayout><Registration /></MainLayout>} />
        <Route path="/queues" element={<MainLayout><QueueDisplay /></MainLayout>} />
        <Route path="/beds" element={<MainLayout><BedManagement /></MainLayout>} />
        <Route path="/rme" element={<MainLayout><MedicalRecord /></MainLayout>} />
        <Route path="/farmasi" element={<MainLayout><Farmasi /></MainLayout>} />
        <Route path="/apotek" element={<MainLayout><Apotek /></MainLayout>} />
        <Route path="/lab" element={<MainLayout><Laboratorium /></MainLayout>} />
        <Route path="/kasir" element={<MainLayout><Kasir /></MainLayout>} />
        <Route path="/ranap-cppt" element={<MainLayout><RanapCPPT /></MainLayout>} />
        <Route path="/operasi" element={<MainLayout><Operasi /></MainLayout>} />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
