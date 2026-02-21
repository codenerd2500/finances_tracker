import { useState, useEffect } from 'react';
import * as api from '../api';
import type { User, Income, Expense } from '../types';

const PERSON_COLORS = ['avatar-pink', 'avatar-blue', 'avatar-teal', 'avatar-cyan', 'avatar-primary', 'avatar-purple', 'avatar-orange'];
const ICON_MAP: Record<string, { icon: string; cls: string }> = {
    Groceries: { icon: 'shopping_bag', cls: 'neutral' },
    Healthcare: { icon: 'medical_services', cls: 'red' },
    Transport: { icon: 'directions_car', cls: 'blue' },
    Food: { icon: 'restaurant', cls: 'orange' },
    Entertainment: { icon: 'movie', cls: 'purple' },
    Utilities: { icon: 'bolt', cls: 'blue' },
    Mobile: { icon: 'smartphone', cls: 'blue' },
};

export default function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
    const [income, setIncome] = useState<Income[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [showMenu, setShowMenu] = useState(false);

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    useEffect(() => {
        api.getIncome(month, year).then(setIncome).catch(() => { });
        api.getExpenses(month, year).then(setExpenses).catch(() => { });
    }, []);

    const totalIncome = income.reduce((s, i) => s + Number(i.amount), 0);
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const spendingRatio = totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0;

    // Group expenses by person
    const byPerson: Record<string, number> = {};
    expenses.forEach(e => { byPerson[e.person_name] = (byPerson[e.person_name] || 0) + Number(e.amount); });
    const personList = Object.entries(byPerson).sort((a, b) => b[1] - a[1]);

    // Combined recent activity
    type Activity = { type: 'income' | 'expense'; title: string; subtitle: string; amount: number; date: string; category?: string };
    const activities: Activity[] = [
        ...income.map(i => ({ type: 'income' as const, title: i.source, subtitle: i.customer_name || 'Direct', amount: Number(i.amount), date: i.created_at || '' })),
        ...expenses.map(e => ({ type: 'expense' as const, title: e.category, subtitle: `Paid by ${e.person_name}`, amount: Number(e.amount), date: e.created_at || '', category: e.category })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

    const getIcon = (a: Activity) => {
        if (a.type === 'income') return { icon: 'payments', cls: 'green' };
        const match = Object.keys(ICON_MAP).find(k => a.title?.toLowerCase().includes(k.toLowerCase()));
        return match ? ICON_MAP[match] : { icon: 'receipt_long', cls: 'neutral' };
    };

    return (
        <>
            <header className="page-header">
                <h1>Dashboard</h1>
                <button className="header-btn" onClick={() => setShowMenu(!showMenu)}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person</span>
                </button>
            </header>

            {showMenu && <div className="backdrop" onClick={() => setShowMenu(false)} />}
            {showMenu && (
                <div className="user-menu">
                    <p className="user-menu-name">{user.name}</p>
                    <p className="user-menu-email">{user.email}</p>
                    <button className="user-menu-logout" onClick={onLogout}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
                        Log out
                    </button>
                </div>
            )}

            <div className="page-content">
                <div className="summary-card">
                    <div className="summary-grid">
                        <div>
                            <p className="summary-label">Total Income</p>
                            <p className="summary-value income">₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p className="summary-label">Total Expenses</p>
                            <p className="summary-value expense">₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                    <div className="spending-bar-label">
                        <span>Spending Ratio</span>
                        <span>{spendingRatio}% of Income</span>
                    </div>
                    <div className="spending-bar">
                        <div className="spending-bar-fill" style={{ width: `${Math.min(spendingRatio, 100)}%` }} />
                    </div>
                </div>

                {personList.length > 0 && (
                    <>
                        <h3 className="section-title">Tracked by Person</h3>
                        <div className="person-chips">
                            {personList.map(([name, amount], i) => (
                                <div className="person-chip" key={name}>
                                    <div className={`avatar ${PERSON_COLORS[i % PERSON_COLORS.length]}`}>{name.charAt(0).toUpperCase()}</div>
                                    <span className="name">{name}</span>
                                    <span className="amount">₹{amount.toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <div className="section-header">
                    <h3>Recent Activity</h3>
                </div>

                {activities.length === 0 ? (
                    <div className="empty-state">
                        <span className="material-symbols-outlined icon">receipt_long</span>
                        <h3>No activity yet</h3>
                        <p>Add income or expenses to see recent activity</p>
                    </div>
                ) : (
                    <div className="entry-list">
                        {activities.map((a, i) => {
                            const { icon, cls } = getIcon(a);
                            return (
                                <div className="entry-item" key={i}>
                                    <div className={`entry-icon ${cls}`}>
                                        <span className="material-symbols-outlined">{icon}</span>
                                    </div>
                                    <div className="entry-info">
                                        <p className="entry-title">{a.title}</p>
                                        <p className="entry-subtitle">{a.subtitle}</p>
                                    </div>
                                    <div>
                                        <p className={`entry-amount ${a.type === 'income' ? 'positive' : 'negative'}`}>
                                            {a.type === 'income' ? '+' : '-'}₹{a.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className="entry-time">
                                            {a.date ? new Date(a.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
