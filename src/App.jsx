import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AppointmentsPage from './modules/appointments/pages/AppointmentsPage';
import DashboardPage from './modules/appointments/pages/DashboardPage';
import ClientsPage from './modules/appointments/pages/ClientsPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/citas" element={<AppointmentsPage />} />
          <Route path="/clientes" element={<ClientsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;