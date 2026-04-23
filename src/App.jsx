import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/Layout';
import AppointmentsPage from './modules/appointments/pages/AppointmentsPage';
import DashboardPage    from './modules/appointments/pages/DashboardPage';
import ClientsPage      from './modules/appointments/pages/ClientsPage';
import SettingsPage     from './modules/settings/pages/SettingsPage';

function App() {
  return (
    <SettingsProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/"              element={<DashboardPage />} />
            <Route path="/citas"         element={<AppointmentsPage />} />
            <Route path="/clientes"      element={<ClientsPage />} />
            <Route path="/configuracion" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </Router>
    </SettingsProvider>
  );
}

export default App;