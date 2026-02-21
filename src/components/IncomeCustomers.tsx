import { useState, useEffect } from 'react';
import * as api from '../api';
import type { Customer, Income } from '../types';

const AVATAR_COLORS = ['avatar-primary', 'avatar-pink', 'avatar-blue', 'avatar-teal', 'avatar-cyan', 'avatar-purple', 'avatar-orange'];

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

export default function IncomeCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [income, setIncome] = useState<Income[]>([]);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<'customers' | 'income'>('customers');

    // Modals
    const [showAddCustomer, setShowAddCustomer] = useState(false);
    const [showAddIncome, setShowAddIncome] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [editingIncome, setEditingIncome] = useState<Income | null>(null);

    const [custForm, setCustForm] = useState({ name: '', address: '' });
    const [incForm, setIncForm] = useState({ customer_id: '', source: '', amount: '', month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), description: '' });

    useEffect(() => { loadData(); }, []);

    const loadData = () => {
        api.getCustomers().then(setCustomers).catch(() => { });
        api.getIncome().then(setIncome).catch(() => { });
    };

    const totalIncome = income.reduce((s, i) => s + Number(i.amount), 0);
    const customerIncome: Record<number, number> = {};
    income.forEach(i => { if (i.customer_id) customerIncome[i.customer_id] = (customerIncome[i.customer_id] || 0) + Number(i.amount); });

    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.address || '').toLowerCase().includes(search.toLowerCase())
    );

    const getInitials = (name: string) => {
        const p = name.trim().split(/\s+/);
        return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
    };

    // Customer CRUD
    const openAddCustomer = () => { setCustForm({ name: '', address: '' }); setEditingCustomer(null); setShowAddCustomer(true); };
    const openEditCustomer = (c: Customer) => { setCustForm({ name: c.name, address: c.address || '' }); setEditingCustomer(c); setShowAddCustomer(true); };
    const saveCustomer = async () => {
        if (!custForm.name.trim()) return;
        try {
            if (editingCustomer) {
                await api.updateCustomer(editingCustomer.id, custForm);
            } else {
                await api.createCustomer(custForm);
            }
            setShowAddCustomer(false); setEditingCustomer(null); loadData();
        } catch (err) { console.error(err); }
    };
    const deleteCustomer = async (id: number) => { try { await api.deleteCustomer(id); loadData(); } catch (err) { console.error(err); } };

    // Income CRUD
    const openAddIncome = () => {
        setIncForm({ customer_id: '', source: '', amount: '', month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), description: '' });
        setEditingIncome(null); setShowAddIncome(true);
    };
    const openEditIncome = (inc: Income) => {
        setIncForm({ customer_id: inc.customer_id ? String(inc.customer_id) : '', source: inc.source, amount: String(inc.amount), month: String(inc.month), year: String(inc.year), description: inc.description || '' });
        setEditingIncome(inc); setShowAddIncome(true);
    };
    const saveIncome = async () => {
        if (!incForm.source.trim() || !incForm.amount) return;
        const data = { ...incForm, customer_id: incForm.customer_id ? Number(incForm.customer_id) : null, amount: Number(incForm.amount), month: Number(incForm.month), year: Number(incForm.year) };
        try {
            if (editingIncome) { await api.updateIncome(editingIncome.id, data); }
            else { await api.createIncome(data); }
            setShowAddIncome(false); setEditingIncome(null); loadData();
        } catch (err) { console.error(err); }
    };
    const deleteIncome = async (id: number) => { try { await api.deleteIncome(id); loadData(); } catch (err) { console.error(err); } };

    return (
        <>
            <header className="page-header">
                <h1>Income & Customers</h1>
                <button className="header-btn" onClick={openAddIncome}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
                </button>
            </header>

            <div className="page-content">
                {/* Hero */}
                <div className="income-hero">
                    <div>
                        <p className="hero-label">Total Income</p>
                        <p className="hero-value">₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="hero-badge">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>trending_up</span>
                        {income.length} entries
                    </div>
                </div>

                {/* Tabs */}
                <div className="tab-bar">
                    <button className={`tab-btn ${tab === 'customers' ? 'active' : ''}`} onClick={() => setTab('customers')}>Customers</button>
                    <button className={`tab-btn ${tab === 'income' ? 'active' : ''}`} onClick={() => setTab('income')}>Income</button>
                </div>

                {/* ===== CUSTOMERS TAB ===== */}
                {tab === 'customers' && (
                    <>
                        <div className="search-bar">
                            <span className="material-symbols-outlined icon">search</span>
                            <input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>

                        {filtered.length === 0 ? (
                            <div className="empty-state">
                                <span className="material-symbols-outlined icon">people</span>
                                <h3>No customers yet</h3>
                                <p>Tap below to add your first customer</p>
                            </div>
                        ) : (
                            <div className="customer-list">
                                {filtered.map((c, i) => (
                                    <div className="customer-card" key={c.id}>
                                        <div className={`customer-avatar ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>{getInitials(c.name)}</div>
                                        <div className="customer-info">
                                            <p className="customer-name">{c.name}</p>
                                            <p className="customer-address">{c.address || 'No address'}</p>
                                        </div>
                                        <div className="customer-right">
                                            <span className="customer-amount">₹{(customerIncome[c.id] || 0).toLocaleString('en-IN')}</span>
                                            <DotsMenu onEdit={() => openEditCustomer(c)} onDelete={() => deleteCustomer(c.id)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button className="add-button-full" onClick={openAddCustomer}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
                            Add New Customer
                        </button>
                    </>
                )}

                {/* ===== INCOME TAB ===== */}
                {tab === 'income' && (
                    <>
                        {income.length === 0 ? (
                            <div className="empty-state">
                                <span className="material-symbols-outlined icon">payments</span>
                                <h3>No income recorded</h3>
                                <p>Tap below to record income</p>
                            </div>
                        ) : (
                            <div className="entry-list">
                                {income.map((inc, i) => (
                                    <div className="entry-item" key={inc.id}>
                                        <div className="entry-icon green">
                                            <span className="material-symbols-outlined">payments</span>
                                        </div>
                                        <div className="entry-info">
                                            <p className="entry-title">{inc.source}</p>
                                            <p className="entry-subtitle">{inc.customer_name || 'Direct'} · {new Date(0, inc.month - 1).toLocaleString('default', { month: 'short' })} {inc.year}</p>
                                        </div>
                                        <div className="entry-right">
                                            <div>
                                                <p className="entry-amount positive">+₹{Number(inc.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                            </div>
                                            <DotsMenu onEdit={() => openEditIncome(inc)} onDelete={() => deleteIncome(inc.id)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button className="add-button-full" onClick={openAddIncome}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                            Add Income
                        </button>
                    </>
                )}
            </div>

            {/* ===== ADD/EDIT CUSTOMER MODAL ===== */}
            {showAddCustomer && (
                <div className="modal-overlay" onClick={() => { setShowAddCustomer(false); setEditingCustomer(null); }}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</span>
                            <button className="modal-close" onClick={() => { setShowAddCustomer(false); setEditingCustomer(null); }}>✕</button>
                        </div>
                        <div className="form-group" style={{ marginBottom: 14 }}>
                            <label className="form-label">Name</label>
                            <input className="form-input" placeholder="Customer name" value={custForm.name} onChange={e => setCustForm({ ...custForm, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Address</label>
                            <input className="form-input" placeholder="Address" value={custForm.address} onChange={e => setCustForm({ ...custForm, address: e.target.value })} />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => { setShowAddCustomer(false); setEditingCustomer(null); }}>Cancel</button>
                            <button className="btn-save" onClick={saveCustomer}>{editingCustomer ? 'Update' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== ADD/EDIT INCOME MODAL ===== */}
            {showAddIncome && (
                <div className="modal-overlay" onClick={() => { setShowAddIncome(false); setEditingIncome(null); }}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-title">{editingIncome ? 'Edit Income' : 'Add Income'}</span>
                            <button className="modal-close" onClick={() => { setShowAddIncome(false); setEditingIncome(null); }}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="form-group">
                                <label className="form-label">Source</label>
                                <input className="form-input" placeholder="E.g. Freelance, Salary" value={incForm.source} onChange={e => setIncForm({ ...incForm, source: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Amount (₹)</label>
                                <input className="form-input" type="number" placeholder="0.00" value={incForm.amount} onChange={e => setIncForm({ ...incForm, amount: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Customer</label>
                                <select className="form-select" value={incForm.customer_id} onChange={e => setIncForm({ ...incForm, customer_id: e.target.value })}>
                                    <option value="">No customer</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Month</label>
                                    <select className="form-select" value={incForm.month} onChange={e => setIncForm({ ...incForm, month: e.target.value })}>
                                        {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Year</label>
                                    <input className="form-input" type="number" value={incForm.year} onChange={e => setIncForm({ ...incForm, year: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" placeholder="Optional notes" value={incForm.description} onChange={e => setIncForm({ ...incForm, description: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => { setShowAddIncome(false); setEditingIncome(null); }}>Cancel</button>
                            <button className="btn-save" onClick={saveIncome}>{editingIncome ? 'Update' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
