import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import logo from '../assets/homeseek_logo_prototype.png';

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
                <Link to="/" style={styles.logo}>
                    <img src={logo} alt="Homeseek" style={styles.logoImg} />
                </Link>

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
        padding: '0 32px',
        borderBottom: '1px solid #eee',
        backgroundColor: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '72px', 
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    },
    hostBtn: {
        color: '#444444',
        textDecoration: 'none',
        padding: '10px 20px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'background 0.2s'
    },
    hostBtnHover: {
        background: '#dddddd',
    },
    userName: {
        fontSize: '14px',
        color: '#444',
        fontWeight: '500'
    },
    logo: {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center'
    },
    logoImg: {
        height: '120px',    // ← adjust this to make it bigger or smaller
        width: 'auto',
        objectFit: 'contain'
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