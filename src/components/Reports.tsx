import { useState, useEffect } from 'react';
import * as api from '../api';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

const COLORS = ['#10b77f', '#06b6d4', '#3b82f6', '#ec4899', '#f97316', '#8b5cf6', '#14b8a6'];

export default function Reports() {
    const [tab, setTab] = useState<'monthly' | 'yearly'>('monthly');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [report, setReport] = useState<any>(null);

    useEffect(() => {
        if (tab === 'monthly') {
            api.getMonthlyReport(month, year).then(setReport).catch(() => setReport(null));
        } else {
            api.getYearlyReport(year).then(setReport).catch(() => setReport(null));
        }
    }, [tab, month, year]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <>
            <header className="page-header">
                <h1>Reports</h1>
            </header>

            <div className="page-content">
                {/* Tabs */}
                <div className="tab-bar">
                    <button className={`tab-btn ${tab === 'monthly' ? 'active' : ''}`} onClick={() => setTab('monthly')}>Monthly</button>
                    <button className={`tab-btn ${tab === 'yearly' ? 'active' : ''}`} onClick={() => setTab('yearly')}>Yearly</button>
                </div>

                {/* Filters */}
                <div className="filter-row">
                    {tab === 'monthly' && (
                        <select value={month} onChange={e => setMonth(Number(e.target.value))}>
                            {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>)}
                        </select>
                    )}
                    <select value={year} onChange={e => setYear(Number(e.target.value))}>
                        {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                {!report ? (
                    <div className="empty-state">
                        <div className="icon"><span className="material-symbols-outlined" style={{ fontSize: 48 }}>analytics</span></div>
                        <h3>No report data</h3>
                        <p>Add income and expenses to see reports</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Stats */}
                        <div className="report-cards">
                            <div className="report-stat">
                                <p className="label">Total Income</p>
                                <p className="value" style={{ color: 'var(--primary)' }}>₹{Number(report.total_income || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="report-stat">
                                <p className="label">Total Expenses</p>
                                <p className="value" style={{ color: 'var(--red)' }}>₹{Number(report.total_expenses || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="report-stat">
                                <p className="label">Net Profit</p>
                                <p className="value" style={{ color: Number(report.net_profit || 0) >= 0 ? 'var(--primary)' : 'var(--red)' }}>
                                    ₹{Number(report.net_profit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        {/* Yearly Chart */}
                        {tab === 'yearly' && report.monthly_breakdown && (
                            <div className="chart-wrap">
                                <p className="chart-title">Monthly Trend</p>
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={report.monthly_breakdown.map((m: any) => ({ ...m, name: monthNames[m.month - 1] }))}>
                                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ background: '#162d25', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8, fontSize: 12 }} />
                                        <Area type="monotone" dataKey="income" stroke="#10b77f" fill="rgba(16,183,127,0.15)" strokeWidth={2} />
                                        <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="rgba(239,68,68,0.1)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Income by Source Pie */}
                        {report.income_by_source && report.income_by_source.length > 0 && (
                            <div className="chart-wrap">
                                <p className="chart-title">Income by Source</p>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={report.income_by_source} dataKey="total" nameKey="source" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                                            {report.income_by_source.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#162d25', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8, fontSize: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                                    {report.income_by_source.map((s: any, i: number) => (
                                        <div key={s.source} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                                            <span style={{ color: 'var(--text-secondary)' }}>{s.source}: ₹{Number(s.total).toLocaleString('en-IN')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Expenses by Person Pie */}
                        {report.expenses_by_person && report.expenses_by_person.length > 0 && (
                            <div className="chart-wrap">
                                <p className="chart-title">Expenses by Person</p>
                                <ResponsiveContainer width="100%" height={180}>
                                    <PieChart>
                                        <Pie data={report.expenses_by_person} dataKey="total" nameKey="person_name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                                            {report.expenses_by_person.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#162d25', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 8, fontSize: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                                    {report.expenses_by_person.map((p: any, i: number) => (
                                        <div key={p.person_name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                                            <span style={{ color: 'var(--text-secondary)' }}>{p.person_name}: ₹{Number(p.total).toLocaleString('en-IN')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
