export interface User {
    id: number;
    google_id?: string;
    email: string;
    name: string;
    avatar: string;
}

export interface Customer {
    id: number;
    user_id: number;
    name: string;
    address: string;
    created_at: string;
}

export interface Income {
    id: number;
    user_id: number;
    customer_id: number;
    customer_name?: string;
    source: string;
    amount: number;
    month: number;
    year: number;
    description: string;
    created_at: string;
}

export interface Expense {
    id: number;
    user_id: number;
    person_name: string;
    category: string;
    amount: number;
    month: number;
    year: number;
    description: string;
    created_at: string;
}

export interface MonthlyReport {
    month: number;
    year: number;
    total_income: number;
    total_expenses: number;
    net_profit: number;
    income_by_source: { source: string; total: number }[];
    expenses_by_person: { person_name: string; total: number }[];
}

export interface YearlyReport {
    year: number;
    total_income: number;
    total_expenses: number;
    net_profit: number;
    monthly_breakdown: { month: number; income: number; expenses: number }[];
    income_by_source: { source: string; total: number }[];
    expenses_by_person: { person_name: string; total: number }[];
}
