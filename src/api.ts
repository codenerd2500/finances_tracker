const API_BASE = (import.meta.env.VITE_API_BASE as string) || '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: { ...headers, ...(options?.headers as Record<string, string>) },
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(err.message || `HTTP ${res.status}`);
    }

    return res.json();
}

// Auth
export const loginWithGoogle = (credential: string) =>
    request<{ token: string; user: any }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential }),
    });

// Customers
export const getCustomers = () => request<any[]>('/customers');

export const createCustomer = (data: { name: string; address?: string }) =>
    request<any>('/customers', { method: 'POST', body: JSON.stringify(data) });

export const updateCustomer = (id: number, data: { name: string; address?: string }) =>
    request<any>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteCustomer = (id: number) =>
    request<void>(`/customers/${id}`, { method: 'DELETE' });

// Income
export const getIncome = (month?: number, year?: number, customer_id?: number) => {
    const sp = new URLSearchParams();
    if (month) sp.set('month', String(month));
    if (year) sp.set('year', String(year));
    if (customer_id) sp.set('customer_id', String(customer_id));
    const qs = sp.toString();
    return request<any[]>(`/income${qs ? `?${qs}` : ''}`);
};

export const createIncome = (data: any) =>
    request<any>('/income', { method: 'POST', body: JSON.stringify(data) });

export const updateIncome = (id: number, data: any) =>
    request<any>(`/income/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteIncome = (id: number) =>
    request<void>(`/income/${id}`, { method: 'DELETE' });

// Expenses
export const getExpenses = (month?: number, year?: number, person_name?: string) => {
    const sp = new URLSearchParams();
    if (month) sp.set('month', String(month));
    if (year) sp.set('year', String(year));
    if (person_name) sp.set('person_name', person_name);
    const qs = sp.toString();
    return request<any[]>(`/expenses${qs ? `?${qs}` : ''}`);
};

export const createExpense = (data: any) =>
    request<any>('/expenses', { method: 'POST', body: JSON.stringify(data) });

export const updateExpense = (id: number, data: any) =>
    request<any>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteExpense = (id: number) =>
    request<void>(`/expenses/${id}`, { method: 'DELETE' });

// Reports
export const getMonthlyReport = (month: number, year: number) =>
    request<any>(`/reports/monthly?month=${month}&year=${year}`);

export const getYearlyReport = (year: number) =>
    request<any>(`/reports/yearly?year=${year}`);
