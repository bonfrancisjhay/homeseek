import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function AuthModal({ onClose, onSuccess }) {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [mode, setMode] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [form, setForm] = useState({ name: '', password: '', role: 'guest' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCheckEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/check-email', { email });
            if (res.data.exists) {
                setMode('login');
                setStep(2);
            } else {
                await api.post('/send-otp', { email });
                setMode('register');
                setStep(2);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
        const res = await api.post('/login', { email, password: form.password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        const role = res.data.user.role;

        if (role === 'host') {
            // Host tried to login through guest modal — block it
            setError('You are a host. Please use the host login page.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return;
        }

        onSuccess?.();
        navigate('/');
        window.location.reload();
    } catch (err) {
        setError(err.response?.data?.message || 'Invalid password');
    } finally {
        setLoading(false);
    }
};

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }
        setError('');
        setStep(3);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/register', { ...form, email, otp });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            onSuccess?.();
            const role = res.data.user.role;
            navigate(role === 'host' ? '/host/dashboard' : '/');
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const stepCount = mode === 'register' ? 3 : 2;

    return (
        <>
            <div onClick={onClose} style={styles.backdrop} />
            <div style={styles.modal}>

                {/* Header */}
                <div style={styles.header}>
                    <button onClick={onClose} style={styles.close}>✕</button>
                    <h3 style={styles.headerTitle}>
                        {step === 1 && 'Log in or sign up'}
                        {step === 2 && mode === 'login' && 'Welcome back'}
                        {step === 2 && mode === 'register' && 'Check your email'}
                        {step === 3 && 'Sign up'}
                    </h3>
                    <span style={{ width: 28 }} />
                </div>

                <div style={styles.body}>

                    {/* Step dots */}
                    <div style={styles.dots}>
                        {Array.from({ length: stepCount }).map((_, i) => (
                            <div key={i} style={{
                                ...styles.dot,
                                background: i < step ? '#2196f3' : '#ddd'
                            }} />
                        ))}
                    </div>

                    {error && <p style={styles.error}>{error}</p>}

                    {/* Step 1 — Email */}
                    {step === 1 && (
                        <>
                            <h2 style={styles.title}>Log in or sign up</h2>
                            <p style={styles.sub}>Enter your email to continue</p>
                            <form onSubmit={handleCheckEmail}>
                                <div style={styles.field}>
                                    <label style={styles.label}>Email address</label>
                                    <input
                                        style={styles.input}
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button style={styles.btn} disabled={loading}>
                                    {loading ? 'Checking...' : 'Continue'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 2 — Login */}
                    {step === 2 && mode === 'login' && (
                        <>
                            <h2 style={styles.title}>Welcome back!</h2>
                            <p style={styles.sub}>Logging in as <strong>{email}</strong></p>
                            <form onSubmit={handleLogin}>
                                <div style={styles.field}>
                                    <label style={styles.label}>Password</label>
                                    <input
                                        style={styles.input}
                                        type="password"
                                        name="password"
                                        placeholder="Enter your password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <button style={styles.btn} disabled={loading}>
                                    {loading ? 'Logging in...' : 'Log in'}
                                </button>
                                <button type="button" style={styles.backBtn}
                                    onClick={() => { setStep(1); setError(''); }}>
                                    ← Change email
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 2 — OTP */}
                    {step === 2 && mode === 'register' && (
                        <>
                            <h2 style={styles.title}>Check your email</h2>
                            <p style={styles.sub}>We sent a 6-digit code to <strong>{email}</strong></p>
                            <form onSubmit={handleVerifyOtp}>
                                <div style={styles.field}>
                                    <input
                                        style={{ ...styles.input, ...styles.otpInput }}
                                        type="text"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                        required
                                    />
                                </div>
                                <button style={styles.btn} disabled={loading}>
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <button type="button" style={styles.backBtn}
                                    onClick={() => { setStep(1); setError(''); setOtp(''); }}>
                                    ← Change email
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 3 — Register */}
                    {step === 3 && (
                        <>
                            <h2 style={styles.title}>Finish signing up</h2>
                            <p style={styles.sub}>Tell us a bit about yourself</p>
                            <form onSubmit={handleRegister}>
                                <div style={styles.field}>
                                    <label style={styles.label}>Full name</label>
                                    <input style={styles.input} type="text" name="name"
                                        placeholder="John Doe" value={form.name}
                                        onChange={handleChange} required />
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Password</label>
                                    <input style={styles.input} type="password" name="password"
                                        placeholder="Minimum 6 characters" value={form.password}
                                        onChange={handleChange} required />
                                </div>
                                {/* <div style={styles.field}>
                                    <label style={styles.label}>I am a</label>
                                    <select style={styles.input} name="role"
                                        value={form.role} onChange={handleChange}>
                                        <option value="guest">Guest — I want to book</option>
                                        <option value="host">Host — I want to list</option>
                                    </select>
                                </div> */}
                                <button style={styles.btn} disabled={loading}>
                                    {loading ? 'Creating account...' : 'Create account'}
                                </button>
                                <button type="button" style={styles.backBtn}
                                    onClick={() => { setStep(2); setError(''); }}>
                                    ← Back
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

const styles = {
    backdrop: {
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 200
    },
    modal: {
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#fff', borderRadius: '16px',
        width: '100%', maxWidth: '480px',
        zIndex: 201, boxShadow: '0 8px 40px rgba(0,0,0,0.2)'
    },
    header: {
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: '1px solid #eee'
    },
    headerTitle: { fontSize: '14px', fontWeight: '500', color: '#222', margin: 0 },
    close: {
        background: 'none', border: 'none',
        fontSize: '16px', cursor: 'pointer',
        color: '#222', padding: '4px 8px', borderRadius: '50%'
    },
    body: { padding: '24px' },
    dots: { display: 'flex', gap: '6px', marginBottom: '20px' },
    dot: { flex: 1, height: '3px', borderRadius: '2px' },
    title: { fontSize: '20px', fontWeight: 'bold', color: '#222', margin: '0 0 4px' },
    sub: { fontSize: '13px', color: '#666', margin: '0 0 18px' },
    error: {
        background: '#fff0f0', color: '#d32f2f',
        padding: '10px', borderRadius: '8px',
        marginBottom: '14px', fontSize: '13px'
    },
    field: { marginBottom: '12px' },
    label: { display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' },
    input: {
        width: '100%', padding: '11px 13px',
        border: '1px solid #ddd', borderRadius: '8px',
        fontSize: '14px', boxSizing: 'border-box', outline: 'none'
    },
    otpInput: {
        textAlign: 'center', fontSize: '22px',
        letterSpacing: '8px', fontWeight: '500'
    },
    btn: {
        width: '100%', padding: '12px',
        background: '#2196f3', color: '#fff',
        border: 'none', borderRadius: '8px',
        fontSize: '14px', fontWeight: '600',
        cursor: 'pointer', marginTop: '4px'
    },
    backBtn: {
        background: 'none', border: 'none',
        color: '#888', fontSize: '13px',
        cursor: 'pointer', padding: '8px 0 0',
        display: 'block'
    }
};

export default AuthModal;