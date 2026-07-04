import React, { useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, Calculator as CalcIcon, History as HistoryIcon } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { useAppStore } from './store/appStore';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Calculator from './pages/Calculator';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(state => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function CookieConsent() {
  const { cookiesAccepted, acceptCookies } = useAppStore();
  if (cookiesAccepted) return null;
  
  return (
    <div className="fixed bottom-20 left-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl z-50 flex flex-col sm:flex-row justify-between items-center gap-4 dark:bg-gray-100 dark:text-black">
      <p className="text-sm">
        Usamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa política.
      </p>
      <button onClick={acceptCookies} className="bg-primary text-primary-foreground px-4 py-2 rounded font-bold whitespace-nowrap">
        Aceitar
      </button>
    </div>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore();
  return (
    <button 
      onClick={toggleTheme} 
      className="w-14 h-8 flex items-center bg-gray-300 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300 shadow-inner"
      aria-label="Alternar tema escuro"
    >
      <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center text-xs ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}>
        {theme === 'dark' ? '🌙' : '☀️'}
      </div>
    </button>
  );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? 'text-primary' : 'text-muted-foreground';

  return (
    <div className="min-h-screen flex flex-col pb-16 bg-background text-foreground transition-colors duration-200">
      {/* Header with Theme Toggle */}
      <header className="p-4 flex justify-end max-w-md mx-auto w-full">
        <ThemeToggle />
      </header>
      
      <main className="flex-1 p-4 pt-0 max-w-md mx-auto w-full">
        {children}
      </main>
      
      <CookieConsent />
      
      <div className="fixed bottom-4 left-0 w-full px-4 z-50">
        <nav className="max-w-md mx-auto glass rounded-2xl flex justify-around p-3 pb-4 relative overflow-hidden">
          {/* subtle glow inside nav */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          
          <Link to="/" className={`flex flex-col items-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${isActive('/')}`}>
            <LayoutDashboard size={22} className="mb-1" />
            <span className="text-[10px] font-medium tracking-wide">Dashboard</span>
          </Link>
          <Link to="/products" className={`flex flex-col items-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${isActive('/products')}`}>
            <Package size={22} className="mb-1" />
            <span className="text-[10px] font-medium tracking-wide">Produtos</span>
          </Link>
          <Link to="/calculator" className={`flex flex-col items-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${isActive('/calculator')}`}>
            <CalcIcon size={22} className="mb-1" />
            <span className="text-[10px] font-medium tracking-wide">Calculadora</span>
          </Link>
          <Link to="/history" className={`flex flex-col items-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${isActive('/history')}`}>
            <HistoryIcon size={22} className="mb-1" />
            <span className="text-[10px] font-medium tracking-wide">Histórico</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}

function App() {
  const { theme } = useAppStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={
        <ProtectedRoute>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </MainLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
