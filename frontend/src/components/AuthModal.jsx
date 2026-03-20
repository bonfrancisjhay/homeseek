import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function AuthModal({ onClose, onSuccess }) {
    const navigate = useNavigate();
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'guest' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const endpoint = mode === 'login' ? '/login' : '/register';
            const res = await api.post(endpoint, form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div onClick={onClose} style={styles.backdrop} />
            <div style={styles.modal}>
                <div style={styles.header}>
                    <button onClick={onClose} style={styles.close}>✕</button>
                    <h3 style={styles.headerTitle}>
                        {mode === 'login' ? 'Log in' : 'Sign up'}
                    </h3>
                    <span />
                </div>

                <div style={styles.body}>
                    <h2 style={styles.title}>
                        {mode === 'login' ? 'Welcome back' : 'Create your account'}
                    </h2>

                    {error && <p style={styles.error}>{error}</p>}

                    {/* Google Button */}
                    <button style={styles.googleBtn}>
                        <img
                            src="https://www.google.com/favicon.ico"
                            width="18"
                            height="18"
                            alt="Google"
                        />
                        Continue with Google
                    </button>

                    <div style={styles.divider}>
                        <span style={styles.dividerLine} />
                        <span style={styles.dividerText}>or</span>
                        <span style={styles.dividerLine} />
                    </div>

                    <form onSubmit={handleSubmit}>
                        {mode === 'register' && (
                            <div style={styles.field}>
                                <input
                                    style={styles.input}
                                    type="text"
                                    name="name"
                                    placeholder="Full name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}
                        <div style={styles.field}>
                            <input
                                style={styles.input}
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={styles.field}>
                            <input
                                style={styles.input}
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {mode === 'register' && (
                            <div style={styles.field}>
                                <select
                                    style={styles.input}
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                >
                                    <option value="guest">Guest — I want to book</option>
                                    <option value="host">Host — I want to list</option>
                                </select>
                            </div>
                        )}
                        <button
                            type="submit"
                            style={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Sign up'}
                        </button>
                    </form>

                    <p style={styles.switchText}>
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            style={styles.switchBtn}
                            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        >
                            {mode === 'login' ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </div>
        </>
    );
}

const styles = {
    backdrop: {
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 200
    },
    modal: {
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#fff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '480px',
        zIndex: 201,
        boxShadow: '0 8px 40px rgba(0,0,0,0.2)'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: '1px solid #eee'
    },
    headerTitle: { fontSize: '15px', fontWeight: '600', color: '#222' },
    close: {
        background: 'none', border: 'none',
        fontSize: '16px', cursor: 'pointer',
        color: '#222', padding: '4px 8px',
        borderRadius: '50%'
    },
    body: { padding: '24px' },
    title: { fontSize: '22px', fontWeight: 'bold', color: '#222', marginBottom: '20px' },
    error: {
        background: '#fff0f0', color: '#e00',
        padding: '10px', borderRadius: '8px',
        marginBottom: '16px', fontSize: '13px'
    },
    googleBtn: {
        width: '100%', padding: '12px',
        border: '1px solid #ddd', borderRadius: '8px',
        background: '#fff', cursor: 'pointer',
        fontSize: '15px', fontWeight: '500',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '10px',
        marginBottom: '16px', color: '#222'
    },
    divider: {
        display: 'flex', alignItems: 'center',
        gap: '12px', marginBottom: '16px'
    },
    dividerLine: { flex: 1, height: '1px', background: '#eee' },
    dividerText: { fontSize: '13px', color: '#888' },
    field: { marginBottom: '12px' },
    input: {
        width: '100%', padding: '12px 14px',
        border: '1px solid #ddd', borderRadius: '8px',
        fontSize: '14px', boxSizing: 'border-box', outline: 'none'
    },
    submitBtn: {
        width: '100%', padding: '13px',
        background: '#ff385c', color: '#fff',
        border: 'none', borderRadius: '8px',
        fontSize: '15px', fontWeight: '600',
        cursor: 'pointer', marginTop: '4px'
    },
    switchText: {
        textAlign: 'center', marginTop: '16px',
        fontSize: '14px', color: '#444'
    },
    switchBtn: {
        background: 'none', border: 'none',
        color: '#ff385c', fontWeight: '600',
        cursor: 'pointer', fontSize: '14px',
        textDecoration: 'underline'
    }
};

export default AuthModal;