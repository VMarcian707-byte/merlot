import { useEffect } from 'react';
import { useStore } from './store';
import LoginPage from './pages/LoginPage';
import ClientDashboard from './pages/ClientDashboard';
import BarmanScanner from './pages/BarmanScanner';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const { currentUser, isLoading, initialize } = useStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-[#0a0608]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
          <p className="font-accent text-[#D4AF37]/60 text-sm tracking-[0.3em] uppercase italic">
            Se încarcă...
          </p>
        </div>
      </div>
    );
  }

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
