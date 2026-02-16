
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PublicHome from './pages/PublicHome';
import Dashboard from './pages/Dashboard';
import IncidentReportPage from './pages/IncidentReportPage';
import CriminalComplaintPage from './pages/CriminalComplaintPage';
import AdminPanel from './pages/AdminPanel';
import Header from './components/Header';
import { User, Permission, Role } from './types';
import { DEFAULT_ADMIN } from './constants';

interface AuthContextType {
  user: User | null;
  login: (badgeNumber: string, password?: string) => boolean;
  logout: () => void;
  hasPermission: (perm: Permission) => boolean;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden flex flex-col relative">
      {user && !isDashboard && <Header />}
      <main className="flex-1">
        {children}
      </main>
      
      {!isDashboard && (
        <footer className="bg-slate-900/50 p-2 text-[10px] text-slate-500 flex justify-between px-6 border-t border-slate-800 z-50">
          <div>© 2024 Bundesrepublik Deutschland | Internes Netzwerk</div>
          <div>Dienst: {user ? `${user.rank} ${user.lastName}` : 'Nicht angemeldet'}</div>
        </footer>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('bpol_active_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Database Seeding Logic
  useEffect(() => {
    // 1. Initialize Users
    const storedUsers = localStorage.getItem('bpol_users');
    if (!storedUsers) {
      localStorage.setItem('bpol_users', JSON.stringify([DEFAULT_ADMIN]));
    }

    // 2. Initialize Laws
    const storedLaws = localStorage.getItem('bpol_laws');
    if (!storedLaws) {
      const defaultLaws = [
        { id: '1', paragraph: '§ 242 StGB', title: 'Diebstahl' },
        { id: '2', paragraph: '§ 223 StGB', title: 'Körperverletzung' },
        { id: '3', paragraph: '§ 113 StGB', title: 'Widerstand gegen Vollstreckungsbeamte' },
        { id: '4', paragraph: '§ 303 StGB', title: 'Sachbeschädigung' },
        { id: '5', paragraph: '§ 263 StGB', title: 'Betrug' },
      ];
      localStorage.setItem('bpol_laws', JSON.stringify(defaultLaws));
    }

    // 3. Initialize Role Defaults
    const storedRoles = localStorage.getItem('bpol_role_defaults');
    if (!storedRoles) {
      const defaults = {
        [Role.GE]: [Permission.VIEW_REPORTS, Permission.CREATE_REPORTS],
        [Role.K]: [Permission.VIEW_REPORTS, Permission.CREATE_REPORTS, Permission.EDIT_REPORTS, Permission.VIEW_WARRANTS],
        [Role.DGL]: [Permission.VIEW_REPORTS, Permission.CREATE_REPORTS, Permission.EDIT_REPORTS, Permission.VIEW_WARRANTS, Permission.MANAGE_WARRANTS],
        [Role.DSL]: [Permission.VIEW_REPORTS, Permission.CREATE_REPORTS, Permission.EDIT_REPORTS, Permission.DELETE_REPORTS, Permission.VIEW_WARRANTS, Permission.MANAGE_WARRANTS],
        [Role.HD]: [Permission.VIEW_REPORTS, Permission.CREATE_REPORTS, Permission.EDIT_REPORTS, Permission.DELETE_REPORTS, Permission.VIEW_WARRANTS, Permission.MANAGE_WARRANTS, Permission.MANAGE_USERS, Permission.MANAGE_LAWS],
        [Role.LS]: Object.values(Permission),
      };
      localStorage.setItem('bpol_role_defaults', JSON.stringify(defaults));
    }
  }, []);

  useEffect(() => {
    if (user) sessionStorage.setItem('bpol_active_user', JSON.stringify(user));
    else sessionStorage.removeItem('bpol_active_user');
  }, [user]);

  const login = (badgeNumber: string, password?: string) => {
    const storedUsers: User[] = JSON.parse(localStorage.getItem('bpol_users') || '[]');
    const found = storedUsers.find(u => u.badgeNumber === badgeNumber);
    
    if (found) {
       // Thomas Mueller check
       if (badgeNumber === 'Adler 51/01') {
         // Erlaubt initialen Login ohne Passwort-System, falls gewünscht oder festes Passwort
         setUser(found);
         return true;
       }
       setUser(found);
       return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setSidebarOpen(false);
  };

  const hasPermission = (perm: Permission) => {
    if (!user) return false;
    if (user.isAdmin) return true;
    return user.permissions.includes(perm);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, isSidebarOpen, setSidebarOpen }}>
      <Router>
        <AppLayout>
            <Routes>
              <Route path="/" element={<PublicHome />} />
              <Route 
                path="/dashboard" 
                element={user ? <Dashboard /> : <Navigate to="/" />} 
              />
              <Route 
                path="/incident-report" 
                element={user ? <IncidentReportPage /> : <Navigate to="/" />} 
              />
              <Route 
                path="/criminal-complaint" 
                element={user ? <CriminalComplaintPage /> : <Navigate to="/" />} 
              />
              <Route 
                path="/admin" 
                element={user?.isAdmin ? <AdminPanel /> : <Navigate to="/" />} 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </AppLayout>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
