import { useStore } from './store';
import LoginPage from './pages/LoginPage';
import ClientDashboard from './pages/ClientDashboard';
import BarmanScanner from './pages/BarmanScanner';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const { currentUser } = useStore();

  if (!currentUser) {
    return <LoginPage />;
  }

  switch (currentUser.role) {
    case 'client':
      return <ClientDashboard />;
    case 'barman':
      return <BarmanScanner />;
    case 'manager':
      return <AdminPanel />;
    default:
      return <LoginPage />;
  }
}
