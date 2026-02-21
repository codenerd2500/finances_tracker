import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import IncomeCustomers from './components/IncomeCustomers';
import Expenses from './components/ExpenseTracker';
import Reports from './components/Reports';
import type { User } from './types';

function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname;

    const tabs = [
        { id: '/', icon: 'home', label: 'Home' },
        { id: '/income', icon: 'account_balance_wallet', label: 'Income' },
        { id: '/expenses', icon: 'receipt_long', label: 'Expenses' },
        { id: '/reports', icon: 'bar_chart', label: 'Reports' },
    ];

    return (
        <nav className="bottom-nav">
            <div className="bottom-nav-inner">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`nav-item ${path === tab.id ? 'active' : ''}`}
                        onClick={() => navigate(tab.id)}
                    >
                        <span className="material-symbols-outlined">{tab.icon}</span>
                        <span className="label">{tab.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
}

function AppShell({ user, onLogout }: { user: User; onLogout: () => void }) {
    return (
        <div className="app-shell">
            <Routes>
                <Route path="/" element={<Dashboard user={user} onLogout={onLogout} />} />
                <Route path="/income" element={<IncomeCustomers />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <BottomNav />
        </div>
    );
}

function App() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (saved && token) {
            setUser(JSON.parse(saved));
        }
    }, []);

    const handleLogin = (u: User) => {
        setUser(u);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    if (!user) {
        return (
            <BrowserRouter>
                <Login onLogin={handleLogin} />
            </BrowserRouter>
        );
    }

    return (
        <BrowserRouter>
            <AppShell user={user} onLogout={handleLogout} />
        </BrowserRouter>
    );
}

export default App;
