import { useEffect } from 'react';
import { useStore } from './store';
import LoginPage from './pages/LoginPage';
import ClientDashboard from './pages/ClientDashboard';
import BarmanScanner from './pages/BarmanScanner';
import AdminPanel from './pages/AdminPanel';
import DatabaseTest from './pages/DatabaseTest';
import ResetPasswordPage from './pages/ResetPasswordPage';

export default function App() {
  const { currentUser, isLoading, initialize } = useStore();

  useEffect(() => {
    initialize();
  }, []);

  // Verifică dacă suntem pe ruta de test
  if (window.location.pathname === '/test-db') {
    return <DatabaseTest />;
  }

  // Verifică dacă suntem pe ruta de resetare parolă (suportă hash token, query param token, sau cale dedicată)
  const isResetPath = 
    window.location.pathname === '/reset-password' || 
    window.location.hash.includes('access_token') ||
    window.location.hash.includes('type=recovery') ||
    new URLSearchParams(window.location.search).get('page') === 'reset-password' ||
    new URLSearchParams(window.location.search).has('token');

  if (isResetPath) {
    return <ResetPasswordPage />;
  }

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
