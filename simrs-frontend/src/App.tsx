import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/queues" element={<QueueDisplay />} />
        <Route path="/beds" element={<BedManagement />} />
        <Route path="/rme" element={<MedicalRecord />} />
        <Route path="/farmasi" element={<Farmasi />} />
        <Route path="/apotek" element={<Apotek />} />
        <Route path="/lab" element={<Laboratorium />} />
        <Route path="/kasir" element={<Kasir />} />
        <Route path="/ranap-cppt" element={<RanapCPPT />} />
        <Route path="/operasi" element={<Operasi />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
