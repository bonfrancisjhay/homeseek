import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: '', email: '', password: '', role: 'guest'
    });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Step 1 — Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/send-otp', { email: form.email });
            setSuccess(`OTP sent to ${form.email}`);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2 — Verify OTP and Register
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/register', { ...form, otp });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                {/* Step indicators */}
                <div style={styles.steps}>
                    <div style={{...styles.step, ...(step >= 1 ? styles.stepActive : {})}}>
                        1
                    </div>
                    <div style={styles.stepLine} />
                    <div style={{...styles.step, ...(step >= 2 ? styles.stepActive : {})}}>
                        2
                    </div>
                </div>

                {step === 1 ? (
                    <>
                        <h2 style={styles.title}>Create your account</h2>
                        <p style={styles.sub}>Fill in your details to get started</p>

                        {error && <p style={styles.error}>{error}</p>}

                        <form onSubmit={handleSendOtp}>
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
                                <label style={styles.label}>Email</label>
                                <input
                                    style={styles.input}
                                    type="email"
                                    name="email"
                                    placeholder="john@example.com"
                                    value={form.email}
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
                                    <option value="guest">Guest — I want to book properties</option>
                                    <option value="host">Host — I want to list properties</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                style={styles.btn}
                                disabled={loading}
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP to Email'}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <h2 style={styles.title}>Check your email</h2>
                        <p style={styles.sub}>
                            We sent a 6-digit code to <strong>{form.email}</strong>
                        </p>

                        {success && <p style={styles.successMsg}>{success}</p>}
                        {error && <p style={styles.error}>{error}</p>}

                        <form onSubmit={handleRegister}>
                            <div style={styles.field}>
                                <label style={styles.label}>Enter OTP Code</label>
                                <input
                                    style={{...styles.input, ...styles.otpInput}}
                                    type="text"
                                    placeholder="123456"
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
                                {loading ? 'Verifying...' : 'Verify & Create Account'}
                            </button>
                            <button
                                type="button"
                                style={styles.resendBtn}
                                onClick={() => {
                                    setStep(1);
                                    setError('');
                                    setSuccess('');
                                }}
                            >
                                ← Back / Resend OTP
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
        backgroundColor: '#f7f7f7',
        padding: '40px 24px'
    },
    card: {
        background: '#fff',
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
    },
    steps: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '28px',
        gap: '8px'
    },
    step: {
        width: '32px', height: '32px',
        borderRadius: '50%',
        background: '#eee',
        color: '#888',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '600'
    },
    stepActive: {
        background: '#ff385c',
        color: '#fff'
    },
    stepLine: {
        width: '40px',
        height: '2px',
        background: '#eee'
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#222',
        marginBottom: '4px'
    },
    sub: { color: '#888', marginBottom: '24px', fontSize: '14px' },
    error: {
        background: '#fff0f0', color: '#e00',
        padding: '10px', borderRadius: '8px',
        marginBottom: '16px', fontSize: '13px'
    },
    successMsg: {
        background: '#f0fff4', color: '#090',
        padding: '10px', borderRadius: '8px',
        marginBottom: '16px', fontSize: '13px'
    },
    field: { marginBottom: '16px' },
    label: {
        display: 'block', fontSize: '13px',
        fontWeight: '600', marginBottom: '6px', color: '#444'
    },
    input: {
        width: '100%', padding: '10px 14px',
        border: '1px solid #ddd', borderRadius: '8px',
        fontSize: '14px', outline: 'none',
        boxSizing: 'border-box'
    },
    otpInput: {
        fontSize: '24px',
        textAlign: 'center',
        letterSpacing: '8px',
        fontWeight: '600'
    },
    btn: {
        width: '100%', padding: '12px',
        background: '#ff385c', color: '#fff',
        border: 'none', borderRadius: '8px',
        fontSize: '15px', fontWeight: '600',
        cursor: 'pointer', marginTop: '8px'
    },
    resendBtn: {
        width: '100%', padding: '10px',
        background: 'none', border: 'none',
        color: '#666', fontSize: '14px',
        cursor: 'pointer', marginTop: '8px'
    }
};

export default Register;