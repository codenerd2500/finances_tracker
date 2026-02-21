import { useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import * as api from '../api';
import type { User } from '../types';

export default function Login({ onLogin }: { onLogin: (u: User) => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Called when Google sign-in succeeds — sends real JWT credential to backend
    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) return;
        setLoading(true);
        setError('');
        try {
            const res = await api.loginWithGoogle(credentialResponse.credential);
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            onLogin(res.user);
        } catch (err: any) {
            setError('Google sign-in failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google sign-in was cancelled or failed.');
    };

    // Demo / email login fallback
    const handleDemoLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.loginWithGoogle('demo');
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            onLogin(res.user);
        } catch {
            const demoUser: User = { id: 1, name: 'Demo User', email: 'demo@budgetx.app', avatar: '' };
            localStorage.setItem('token', 'demo-token');
            localStorage.setItem('user', JSON.stringify(demoUser));
            onLogin(demoUser);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">
                        <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--primary)' }}>
                            account_balance_wallet
                        </span>
                    </div>
                    <div className="login-brand">BudgetX</div>
                </div>

                <div className="login-body">
                    <div className="login-welcome">
                        <h1>Welcome back</h1>
                        <p>Enter your details to manage your finances</p>
                    </div>

                    {/* Official Google Sign-In button */}
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap
                            shape="rectangular"
                            size="large"
                            text="continue_with"
                            logo_alignment="left"
                        />
                    </div>

                    {error && (
                        <p style={{ color: 'var(--danger, #ef4444)', fontSize: 13, textAlign: 'center', margin: '4px 0' }}>
                            {error}
                        </p>
                    )}

                    <div className="divider">
                        <span>or continue with email</span>
                    </div>

                    <form className="login-form" onSubmit={handleDemoLogin}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div className="form-input-wrap">
                                <span className="material-symbols-outlined icon">mail</span>
                                <input
                                    className="form-input with-icon"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="form-label-row">
                                <label className="form-label">Password</label>
                                <button type="button" className="form-label-link">Forgot Password?</button>
                            </div>
                            <div className="form-input-wrap">
                                <span className="material-symbols-outlined icon">lock</span>
                                <input
                                    className="form-input with-icon"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Don't have an account? <a href="#">Sign up</a></p>
                    </div>
                </div>

                <div className="login-bar" />
            </div>
        </div>
    );
}
