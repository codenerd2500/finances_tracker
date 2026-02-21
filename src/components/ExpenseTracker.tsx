import { useState, useEffect } from 'react';
import * as api from '../api';
import type { Expense } from '../types';

const PERSON_COLORS = ['avatar-pink', 'avatar-blue', 'avatar-teal', 'avatar-cyan', 'avatar-primary', 'avatar-purple', 'avatar-orange'];
const CATEGORIES = ['Groceries', 'Healthcare', 'Transport', 'Food', 'Utilities', 'Entertainment', 'Education', 'Shopping', 'Mobile', 'Miscellaneous'];

function DotsMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="dots-menu-wrap">
            <button className="dots-btn" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
                <span className="material-symbols-outlined">more_vert</span>
            </button>
            {open && (
                <>
                    <div className="backdrop" onClick={() => setOpen(false)} />
                    <div className="dots-dropdown">
                        <button onClick={() => { setOpen(false); onEdit(); }}>
                            <span className="material-symbols-outlined">edit</span> Edit
                        </button>
                        <button className="danger" onClick={() => { setOpen(false); onDelete(); }}>
                            <span className="material-symbols-outlined">delete</span> Remove
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

const ICON_MAP: Record<string, { icon: string; cls: string }> = {
    Groceries: { icon: 'shopping_bag', cls: 'neutral' },
    Healthcare: { icon: 'medical_services', cls: 'red' },
    Transport: { icon: 'directions_car', cls: 'blue' },
    Food: { icon: 'restaurant', cls: 'orange' },
    Entertainment: { icon: 'movie', cls: 'purple' },
    Utilities: { icon: 'bolt', cls: 'blue' },
    Mobile: { icon: 'smartphone', cls: 'blue' },
    Education: { icon: 'school', cls: 'purple' },
    Shopping: { icon: 'shopping_cart', cls: 'orange' },
};

export default function Expenses() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [view, setView] = useState<'list' | 'add'>('list');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [form, setForm] = useState({ amount: '', category: '', person_name: '', description: '', month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()) });

    useEffect(() => { loadExpenses(); }, [month, year]);

    const loadExpenses = () => { api.getExpenses(month, year).then(setExpenses).catch(() => { }); };

    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);

    const byPerson: Record<string, number> = {};
    expenses.forEach(e => { byPerson[e.person_name] = (byPerson[e.person_name] || 0) + Number(e.amount); });
    const personList = Object.entries(byPerson).sort((a, b) => b[1] - a[1]);

    const openAdd = () => {
        setForm({ amount: '', category: '', person_name: '', description: '', month: String(month), year: String(year) });
        setEditingExpense(null);
        setView('add');
    };

    const openEdit = (e: Expense) => {
        setForm({ amount: String(e.amount), category: e.category, person_name: e.person_name, description: e.description || '', month: String(e.month), year: String(e.year) });
        setEditingExpense(e);
        setView('add');
    };

    const handleSave = async () => {
        if (!form.amount || !form.person_name || !form.category) return;
        const data = { ...form, amount: Number(form.amount), month: Number(form.month), year: Number(form.year) };
        try {
            if (editingExpense) { await api.updateExpense(editingExpense.id, data); }
            else { await api.createExpense(data); }
            setView('list');
            setEditingExpense(null);
            loadExpenses();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id: number) => {
        try { await api.deleteExpense(id); loadExpenses(); } catch (err) { console.error(err); }
    };

    const getIcon = (category: string) => ICON_MAP[category] || { icon: 'receipt_long', cls: 'neutral' };

    // ===== ADD / EDIT VIEW =====
    if (view === 'add') {
        return (
            <>
                <div className="expense-add-header">
                    <button className="back-btn" onClick={() => { setView('list'); setEditingExpense(null); }}>
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h2>{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
                </div>
                <div className="page-content">
                    <div className="amount-input-large">
                        <label>Amount Spent</label>
                        <div className="amount-field">
                            <span className="currency">₹</span>
                            <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} autoFocus />
                        </div>
                    </div>

                    <div className="expense-form">
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                <option value="">Select Category</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Assigned To</label>
                            <input className="form-input" placeholder="Person name (e.g. Mom, Dad)" value={form.person_name} onChange={e => setForm({ ...form, person_name: e.target.value })} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Month</label>
                                <select className="form-select" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })}>
                                    {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Year</label>
                                <input className="form-input" type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Notes (Optional)</label>
                            <textarea className="form-textarea" placeholder="What was this for?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                    </div>

                    <div className="save-btn-fixed">
                        <button className="btn-primary-full" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                            {editingExpense ? 'Update Expense' : 'Save Expense'}
                        </button>
                    </div>
                </div>
            </>
        );
    }

    // ===== LIST VIEW =====
    return (
        <>
            <header className="page-header">
                <h1>Expenses</h1>
                <button className="header-btn" onClick={openAdd}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
                </button>
            </header>

            <div className="page-content">
                <div className="filter-row">
                    <select value={month} onChange={e => setMonth(Number(e.target.value))}>
                        {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'short' })}</option>)}
                    </select>
                    <select value={year} onChange={e => setYear(Number(e.target.value))}>
                        {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                <div className="summary-card">
                    <div className="summary-label">Total Expenses</div>
                    <div className="summary-value expense">₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>

                {personList.length > 0 && (
                    <>
                        <h3 className="section-title">By Person</h3>
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
                    <h3>All Expenses</h3>
                    <button onClick={openAdd}>+ Add</button>
                </div>

                {expenses.length === 0 ? (
                    <div className="empty-state">
                        <span className="material-symbols-outlined icon">receipt_long</span>
                        <h3>No expenses this month</h3>
                        <p>Tap + to add an expense</p>
                    </div>
                ) : (
                    <div className="entry-list">
                        {expenses.map(e => {
                            const { icon, cls } = getIcon(e.category);
                            return (
                                <div className="entry-item" key={e.id}>
                                    <div className={`entry-icon ${cls}`}>
                                        <span className="material-symbols-outlined">{icon}</span>
                                    </div>
                                    <div className="entry-info">
                                        <p className="entry-title">{e.category}</p>
                                        <p className="entry-subtitle">Paid by {e.person_name}{e.description ? ` · ${e.description}` : ''}</p>
                                    </div>
                                    <div className="entry-right">
                                        <p className="entry-amount negative">-₹{Number(e.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                        <DotsMenu onEdit={() => openEdit(e)} onDelete={() => handleDelete(e.id)} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <button className="add-button-full" onClick={openAdd}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                    New Expense
                </button>
            </div>
        </>
    );
}
