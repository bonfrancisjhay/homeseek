import { useNavigate } from 'react-router-dom';
import styles from './dashboardStyles';

const NAV_ITEMS = [
    { key: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { key: 'listings',  icon: '🏠', label: 'Listings'  },
    { key: 'bookings',  icon: '📅', label: 'Bookings'  },
    { key: 'earnings',  icon: '₱',  label: 'Earnings'  },
    { key: 'settings',  icon: '⚙',  label: 'Settings'  },
];

function Sidebar({ activePage, setActivePage, user, onLogout }) {
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'H';

    return (
        <aside style={styles.sidebar}>
            <nav style={styles.sidebarNav}>
                {NAV_ITEMS.map(item => (
                    <button
                        key={item.key}
                        style={{
                            ...styles.navItem,
                            ...(activePage === item.key ? styles.navItemActive : {})
                        }}
                        onClick={() => setActivePage(item.key)}
                    >
                        <span style={styles.navIcon}>{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div style={styles.sidebarBottom}>
                <div style={styles.dividerLine} />
                <div style={styles.profileRow}>
                    <div style={styles.avatar}>{initials}</div>
                    <div style={styles.profileInfo}>
                        <span style={styles.profileName}>{user?.name}</span>
                        <span style={styles.profileRole}>Host</span>
                    </div>
                </div>
                <button style={styles.logoutBtn} onClick={onLogout}>
                    ← Log out
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;