import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/homeseek_logo_bg.png';

function Auth() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [mode, setMode] = useState(''); // 'login' or 'register'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [form, setForm] = useState({
        name: '', password: '', role: 'guest'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Step 1 — Check if email exists
    const handleCheckEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/check-email', { email });
            if (res.data.exists) {
                // Email exists → go to login
                setMode('login');
                setStep(2);
            } else {
                // Email not found → send OTP → register
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

    // Step 2 Login — Submit password
    const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
        const res = await api.post('/login', {
            email,
            password: form.password
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        // ← redirect based on role
        const role = res.data.user.role;
        if (role === 'host') {
            navigate('/host/dashboard');
        } else {
            navigate('/');
        }
        window.location.reload();
    } catch (err) {
        setError(err.response?.data?.message || 'Invalid password');
    } finally {
        setLoading(false);
    }
};

    // Step 2 Register — Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }
        setStep(3);
        setError('');
    };

    // Step 3 — Complete registration
    const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
        const res = await api.post('/register', {
            ...form,
            email,
            otp
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        // ← redirect based on role
        const role = res.data.user.role;
        if (role === 'host') {
            navigate('/host/dashboard');
        } else {
            navigate('/');
        }
        window.location.reload();
    } catch (err) {
        setError(err.response?.data?.message || 'Registration failed');
    } finally {
        setLoading(false);
    }
};

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                {/* Logo */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80px', marginBottom: '8px' }}>
                    <img src={logo} alt="Logo" style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
                </div>

                {/* Step 1 — Email */}
                {step === 1 && (
                    <>
                        <h2 style={styles.title}>Log in or sign up</h2>
                        {error && <p style={styles.error}>{error}</p>}
                        <form onSubmit={handleCheckEmail}>
                            <div style={styles.field}>
                                <input
                                    style={styles.input}
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                style={styles.btn}
                                disabled={loading}
                            >
                                {loading ? 'Checking...' : 'Continue'}
                            </button>
                        </form>
                    </>
                )}

                {/* Step 2 Login — Password */}
                {step === 2 && mode === 'login' && (
                    <>
                        <h2 style={styles.title}>Welcome back!</h2>
                        <p style={styles.sub}>
                            Logging in as <strong>{email}</strong>
                        </p>
                        {error && <p style={styles.error}>{error}</p>}
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
                            <button
                                type="submit"
                                style={styles.btn}
                                disabled={loading}
                            >
                                {loading ? 'Logging in...' : 'Log in'}
                            </button>
                            <button
                                type="button"
                                style={styles.backBtn}
                                onClick={() => {
                                    setStep(1);
                                    setError('');
                                }}
                            >
                                ← Change email
                            </button>
                        </form>
                    </>
                )}

                {/* Step 2 Register — OTP */}
                {step === 2 && mode === 'register' && (
                    <>
                        <h2 style={styles.title}>Check your email</h2>
                        <p style={styles.sub}>
                            We sent a 6-digit code to <strong>{email}</strong>
                        </p>
                        {error && <p style={styles.error}>{error}</p>}
                        <form onSubmit={handleVerifyOtp}>
                            <div style={styles.field}>
                                <input
                                    style={{...styles.input, ...styles.otpInput}}
                                    type="text"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                style={styles.btn}
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button
                                type="button"
                                style={styles.backBtn}
                                onClick={() => {
                                    setStep(1);
                                    setError('');
                                    setOtp('');
                                }}
                            >
                                ← Change email
                            </button>
                        </form>
                    </>
                )}

                {/* Step 3 — Complete registration */}
                {step === 3 && (
                    <>
                        <h2 style={styles.title}>Finish signing up</h2>
                        <p style={styles.sub}>Tell us a bit about yourself</p>
                        {error && <p style={styles.error}>{error}</p>}
                        <form onSubmit={handleRegister}>
                            <div style={styles.field}>
                                <label style={styles.label}>Full Name</label>
                                <input
                                    style={styles.input}
                                    type="text"
                                    name="name"
                                    placeholder="John Doe"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Password</label>
                                <input
                                    style={styles.input}
                                    type="password"
                                    name="password"
                                    placeholder="minimum 6 characters"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>I am a</label>
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
                            <button
                                type="submit"
                                style={styles.btn}
                                disabled={loading}
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                            <button
                                type="button"
                                style={styles.backBtn}
                                onClick={() => {
                                    setStep(2);
                                    setError('');
                                }}
                            >
                                ← Back
                            </button>
                        </form>
                    </>
                )}

            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: '40px 24px'
    },
    card: {
        background: '#fff',
        border: '1px solid #ddd',
        padding: '40px',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
        overflow: 'hidden'
    },
    logoBox: {
        fontSize: '36px',
        textAlign: 'center',
        marginBottom: '16px',
        height: '100px'
    },
    title: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#222',
        marginBottom: '8px',
        textAlign: 'center'
    },
    sub: {
        color: '#888',
        marginBottom: '24px',
        fontSize: '14px',
        textAlign: 'center'
    },
    error: {
        background: '#fff0f0',
        color: '#e00',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '13px'
    },
    field: { marginBottom: '16px' },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '600',
        marginBottom: '6px',
        color: '#444'
    },
    input: {
        width: '100%',
        padding: '14px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '15px',
        outline: 'none',
        boxSizing: 'border-box'
    },
    otpInput: {
        fontSize: '24px',
        textAlign: 'center',
        letterSpacing: '8px',
        fontWeight: '600'
    },
    btn: {
        width: '100%',
        padding: '14px',
        background: '#2196f3',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '4px'
    },
    backBtn: {
        width: '100%',
        padding: '10px',
        background: 'none',
        border: 'none',
        color: '#666',
        fontSize: '14px',
        cursor: 'pointer',
        marginTop: '8px',
        textAlign: 'center'
    }
};

export default Auth;