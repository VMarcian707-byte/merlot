import { useState, useEffect } from 'react';
import { useStore } from './store';
import LoginPage from './pages/LoginPage';
import ClientDashboard from './pages/ClientDashboard';
import BarmanScanner from './pages/BarmanScanner';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const { currentUser } = useStore();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedUser, setDisplayedUser] = useState(currentUser);

  useEffect(() => {
    if (currentUser !== displayedUser) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayedUser(currentUser);
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  const renderPage = () => {
    if (!displayedUser) return <LoginPage />;
    switch (displayedUser.role) {
      case 'client': return <ClientDashboard />;
      case 'barman': return <BarmanScanner />;
      case 'manager': return <AdminPanel />;
      default: return <LoginPage />;
    }
  };

  return (
    <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {renderPage()}
    </div>
  );
}
