import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './AuthModal.css';

const RESEND_COOLDOWN = 60;

function AuthModal({ onClose, onSuccess }) {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [mode, setMode] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [form, setForm] = useState({ name: '', password: '', role: 'guest' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const cooldownTimer = useRef(null);

    useEffect(() => {
        if (step === 2 && mode === 'register') {
            startCooldown();
        }
        return () => clearInterval(cooldownTimer.current);
    }, [step, mode]);

    const startCooldown = () => {
        setResendCooldown(RESEND_COOLDOWN);
        setResendSuccess(false);
        clearInterval(cooldownTimer.current);
        cooldownTimer.current = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(cooldownTimer.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleResendOtp = async () => {
        setResendLoading(true);
        setResendSuccess(false);
        setError('');
        try {
            await api.post('/send-otp', { email });
            setResendSuccess(true);
            setOtp('');
            startCooldown();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP. Try again.');
        } finally {
            setResendLoading(false);
        }
    };

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
        setLoading(true);
        setError('');
        try {
            await api.post('/verify-otp', { email, otp });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
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
            <div onClick={onClose} className="backdrop" />
            <div className="modal">

                {/* Header */}
                <div className="modal-header">
                    <button onClick={onClose} className="modal-close">✕</button>
                    <h3 className="modal-header-title">
                        {step === 1 && 'Log in or sign up'}
                        {step === 2 && mode === 'login' && 'Welcome back'}
                        {step === 2 && mode === 'register' && 'Check your email'}
                        {step === 3 && 'Sign up'}
                    </h3>
                    <span style={{ width: 28 }} />
                </div>

                <div className="modal-body">

                    {/* Step dots */}
                    <div className="step-dots">
                        {Array.from({ length: stepCount }).map((_, i) => (
                            <div key={i} className={`step-dot ${i < step ? 'active' : ''}`} />
                        ))}
                    </div>

                    {error && <p className="modal-error">{error}</p>}

                    {/* Step 1 — Email */}
                    {step === 1 && (
                        <>
                            <h2 className="modal-title">Log in or sign up</h2>
                            <p className="modal-sub">Enter your email to continue</p>
                            <form onSubmit={handleCheckEmail}>
                                <div className="form-field">
                                    <label className="form-label">Email address</label>
                                    <input
                                        className="form-input"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button className="btn-primary" disabled={loading}>
                                    {loading ? 'Checking...' : 'Continue'}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 2 — Login */}
                    {step === 2 && mode === 'login' && (
                        <>
                            <h2 className="modal-title">Welcome back!</h2>
                            <p className="modal-sub">Logging in as <strong>{email}</strong></p>
                            <form onSubmit={handleLogin}>
                                <div className="form-field">
                                    <label className="form-label">Password</label>
                                    <input
                                        className="form-input"
                                        type="password"
                                        name="password"
                                        placeholder="Enter your password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <button className="btn-primary" disabled={loading}>
                                    {loading ? 'Logging in...' : 'Log in'}
                                </button>
                                <button type="button" className="btn-back"
                                    onClick={() => { setStep(1); setError(''); }}>
                                    ← Change email
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 2 — OTP */}
                    {step === 2 && mode === 'register' && (
                        <>
                            <h2 className="modal-title">Check your email</h2>
                            <p className="modal-sub">We sent a 6-digit code to <strong>{email}</strong></p>
                            <form onSubmit={handleVerifyOtp}>
                                <div className="form-field">
                                    <input
                                        className="form-input otp"
                                        type="text"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        maxLength={6}
                                        required
                                    />
                                </div>

                                {/* Resend section */}
                                <div className="resend-box">
                                    <p className="resend-hint">
                                        Didn't receive the code? Check your spam folder or request a new one.
                                    </p>
                                    {resendSuccess && (
                                        <p className="resend-success">
                                            ✓ A new code was sent to {email}
                                        </p>
                                    )}
                                    <button
                                        type="button"
                                        className="resend-btn"
                                        onClick={handleResendOtp}
                                        disabled={resendCooldown > 0 || resendLoading}
                                    >
                                        {resendLoading
                                            ? 'Sending...'
                                            : resendCooldown > 0
                                                ? `Resend code in ${resendCooldown}s`
                                                : 'Resend code'}
                                    </button>
                                </div>

                                <button className="btn-primary" disabled={loading}>
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <button type="button" className="btn-back"
                                    onClick={() => { setStep(1); setError(''); setOtp(''); }}>
                                    ← Change email
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 3 — Register */}
                    {step === 3 && (
                        <>
                            <h2 className="modal-title">Finish signing up</h2>
                            <p className="modal-sub">Tell us a bit about yourself</p>
                            <form onSubmit={handleRegister}>
                                <div className="form-field">
                                    <label className="form-label">Full name</label>
                                    <input className="form-input" type="text" name="name"
                                        placeholder="John Doe" value={form.name}
                                        onChange={handleChange} required />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Password</label>
                                    <input className="form-input" type="password" name="password"
                                        placeholder="Minimum 6 characters" value={form.password}
                                        onChange={handleChange} required />
                                </div>
                                <button className="btn-primary" disabled={loading}>
                                    {loading ? 'Creating account...' : 'Create account'}
                                </button>
                                <button type="button" className="btn-back"
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

export default AuthModal;