import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/homeseek_logo_bg.png';
import './Auth.css';

const RESEND_COOLDOWN = 60;

function Auth() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [mode, setMode] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [form, setForm] = useState({ name: '', password: '', role: 'host' });
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

    // Step 1 — Check if email exists
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

    // Step 2 Login — Submit password
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

    // Step 3 — Complete registration
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/register', { ...form, email, otp });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

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
        <div className="auth-container">
            <div className="auth-card">

                {/* Logo */}
                <div className="auth-logo">
                    <img src={logo} alt="Logo" />
                </div>

                {error && <p className="auth-error">{error}</p>}

                {/* Step 1 — Email */}
                {step === 1 && (
                    <>
                        <h2 className="auth-title">Log in or sign up</h2>
                        <form onSubmit={handleCheckEmail}>
                            <div className="auth-field">
                                <input
                                    className="auth-input"
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? 'Checking...' : 'Continue'}
                            </button>
                        </form>
                    </>
                )}

                {/* Step 2 Login — Password */}
                {step === 2 && mode === 'login' && (
                    <>
                        <h2 className="auth-title">Welcome back!</h2>
                        <p className="auth-sub">Logging in as <strong>{email}</strong></p>
                        <form onSubmit={handleLogin}>
                            <div className="auth-field">
                                <label className="auth-label">Password</label>
                                <input
                                    className="auth-input"
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? 'Logging in...' : 'Log in'}
                            </button>
                            <button type="button" className="auth-back-btn"
                                onClick={() => { setStep(1); setError(''); }}>
                                ← Change email
                            </button>
                        </form>
                    </>
                )}

                {/* Step 2 Register — OTP */}
                {step === 2 && mode === 'register' && (
                    <>
                        <h2 className="auth-title">Check your email</h2>
                        <p className="auth-sub">We sent a 6-digit code to <strong>{email}</strong></p>
                        <form onSubmit={handleVerifyOtp}>
                            <div className="auth-field">
                                <input
                                    className="auth-input otp"
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

                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button type="button" className="auth-back-btn"
                                onClick={() => { setStep(1); setError(''); setOtp(''); }}>
                                ← Change email
                            </button>
                        </form>
                    </>
                )}

                {/* Step 3 — Complete registration */}
                {step === 3 && (
                    <>
                        <h2 className="auth-title">Finish signing up</h2>
                        <p className="auth-sub">Tell us a bit about yourself</p>
                        <form onSubmit={handleRegister}>
                            <div className="auth-field">
                                <label className="auth-label">Full Name</label>
                                <input
                                    className="auth-input"
                                    type="text"
                                    name="name"
                                    placeholder="John Doe"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="auth-field">
                                <label className="auth-label">Password</label>
                                <input
                                    className="auth-input"
                                    type="password"
                                    name="password"
                                    placeholder="Minimum 6 characters"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="auth-btn" disabled={loading}>
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                            <button type="button" className="auth-back-btn"
                                onClick={() => { setStep(2); setError(''); }}>
                                ← Back
                            </button>
                        </form>
                    </>
                )}

            </div>
        </div>
    );
}

export default Auth;