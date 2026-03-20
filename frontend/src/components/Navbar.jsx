import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';

function Navbar() {
    const [hoverHost, setHoverHost] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const [showModal, setShowModal] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        window.location.reload();
    };

    return (
        <>
            {showModal && (
                <AuthModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        window.location.reload();
                    }}
                />
            )}

            <nav style={styles.nav}>
                {/* Logo */}
                <Link to="/" style={styles.logo}>🏠 Homeseek</Link>

                {/* Right side */}
                <div style={styles.right}>
                    {token ? (
                        <>
                            {user?.role === 'host' ? (
                                // Host links
                                <>
                                    <Link to="/host/dashboard" style={styles.dashboardBtn}>
                                        Dashboard
                                    </Link>
                                    <Link to="/create-listing" style={styles.hostBtn}>
                                        + List Property
                                    </Link>
                                </>
                            ) : (
                                // Guest links — nothing extra for now
                                null
                            )}
                            <span style={styles.userName}>Hi, {user?.name}</span>
                            <button onClick={handleLogout} style={styles.logoutBtn}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/register"
                            style={{
                                ...styles.hostBtn,
                                ...(hoverHost ? styles.hostBtnHover : {})
                            }}
                            onMouseEnter={() => setHoverHost(true)}
                            onMouseLeave={() => setHoverHost(false)}
                        >
                            Become a host
                        </Link>
                    )}
                </div>
            </nav>
        </>
    );
}

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        borderBottom: '1px solid #eee',
        backgroundColor: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 100
    },
    logo: {
        fontSize: '22px',
        fontWeight: 'bold',
        textDecoration: 'none',
        color: '#ff385c'
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    hostBtn: {
        background: '#ff385c',
        color: '#fff',
        textDecoration: 'none',
        padding: '10px 20px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'background 0.2s'
    },
    hostBtnHover: {
        background: '#e0314f',
    },
    userName: {
        fontSize: '14px',
        color: '#444',
        fontWeight: '500'
    },
    logoutBtn: {
        background: 'none',
        border: '1px solid #ddd',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        cursor: 'pointer',
        color: '#222'
    }
};

export default Navbar;