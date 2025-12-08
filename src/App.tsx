import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './features/dashboard/Dashboard';
import { AppProvider } from './context/AppContext';
import { ClientList } from './features/clients/ClientList';
import { ClientForm } from './features/clients/ClientForm';
import { ClientDetails } from './features/clients/ClientDetails';
import { CoachList } from './features/coaches/CoachList';
import { CoachForm } from './features/coaches/CoachForm';
import { CoachDetails } from './features/coaches/CoachDetails';
import { AbsenceForm } from './features/coaches/AbsenceForm';
import { ServiceList } from './features/services/ServiceList';
import { ServiceForm } from './features/services/ServiceForm';

// Placeholder components for routes we haven't implemented yet
const Planning = () => <div><h1 className="mb-4">Planning</h1><p>Calendrier à venir...</p></div>;
const Billing = () => <div><h1 className="mb-4">Facturation</h1><p>Rapports financiers à venir...</p></div>;

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<ClientList />} />
            <Route path="clients/new" element={<ClientForm />} />
            <Route path="clients/:id" element={<ClientDetails />} />
            <Route path="clients/:id" element={<ClientDetails />} />
            <Route path="clients/:id/edit" element={<ClientForm />} />
            <Route path="coaches" element={<CoachList />} />
            <Route path="coaches/new" element={<CoachForm />} />
            <Route path="coaches/:id" element={<CoachDetails />} />
            <Route path="coaches/:id/edit" element={<CoachForm />} />
            <Route path="coaches/:id/absences/new" element={<AbsenceForm />} />
            <Route path="planning" element={<Planning />} />
            <Route path="services" element={<ServiceList />} />
            <Route path="services/new" element={<ServiceForm />} />
            <Route path="services/:id/edit" element={<ServiceForm />} />
            <Route path="billing" element={<Billing />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
