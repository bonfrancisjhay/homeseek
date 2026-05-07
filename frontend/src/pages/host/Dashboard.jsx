import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const NAV_ITEMS = [
    { key: 'dashboard',  icon: '⊞', label: 'Dashboard'  },
    { key: 'listings',   icon: '🏠', label: 'Listings'   },
    { key: 'bookings',   icon: '📅', label: 'Bookings'   },
    { key: 'earnings',   icon: '₱',  label: 'Earnings'   },
    { key: 'settings',   icon: '⚙',  label: 'Settings'   },
];

function HostDashboard() {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState('dashboard');
    const [hoverRow, setHoverRow] = useState(null);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user || user.role !== 'host') { navigate('/'); return; }
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const res = await api.get('/host/listings');
            setListings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this listing?')) return;
        try {
            await api.delete(`/listings/${id}`);
            setListings(listings.filter(l => l.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        window.location.reload();
    };

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'H';

    return (
        <div style={styles.shell}>

            {/* ── Sidebar ── */}
            <aside style={styles.sidebar}>
               

                {/* Nav */}
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

                {/* Bottom: profile + logout */}
                <div style={styles.sidebarBottom}>
                    <div style={styles.dividerLine} />
                    <div style={styles.profileRow}>
                        <div style={styles.avatar}>{initials}</div>
                        <div style={styles.profileInfo}>
                            <span style={styles.profileName}>{user?.name}</span>
                            <span style={styles.profileRole}>Host</span>
                        </div>
                    </div>
                    <button style={styles.logoutBtn} onClick={handleLogout}>
                        ← Log out
                    </button>
                </div>
            </aside>

            {/* ── Main content ── */}
            <main style={styles.main}>

                {/* Dashboard page */}
                {activePage === 'dashboard' && (
                    <div>
                        {/* Page header */}
                        <div style={styles.pageHeader}>
                            <div>
                                <h1 style={styles.pageTitle}>Dashboard</h1>
                                <p style={styles.pageSub}>Welcome back, {user?.name} 👋</p>
                            </div>
                            <button style={styles.addBtn} onClick={() => navigate('/create-listing')}>
                                + Add listing
                            </button>
                        </div>

                        {/* Stats */}
                        <div style={styles.statsGrid}>
                            <div style={styles.statCard}>
                                <span style={styles.statIcon}>🏠</span>
                                <span style={styles.statNum}>{listings.length}</span>
                                <span style={styles.statLabel}>Total Listings</span>
                            </div>
                            <div style={styles.statCard}>
                                <span style={styles.statIcon}>📅</span>
                                <span style={styles.statNum}>0</span>
                                <span style={styles.statLabel}>Active Bookings</span>
                            </div>
                            <div style={styles.statCard}>
                                <span style={styles.statIcon}>💰</span>
                                <span style={styles.statNum}>₱0</span>
                                <span style={styles.statLabel}>This Month</span>
                            </div>
                            <div style={styles.statCard}>
                                <span style={styles.statIcon}>⭐</span>
                                <span style={styles.statNum}>—</span>
                                <span style={styles.statLabel}>Avg. Rating</span>
                            </div>
                        </div>

                        {/* Recent listings preview */}
                        <div style={styles.sectionHeader}>
                            <h2 style={styles.sectionTitle}>Your listings</h2>
                            <button style={styles.seeAllBtn} onClick={() => setActivePage('listings')}>
                                See all →
                            </button>
                        </div>

                        {loading ? (
                            <div style={styles.skeletonGrid}>
                                {[1,2,3].map(i => <div key={i} style={styles.skeleton} />)}
                            </div>
                        ) : listings.length === 0 ? (
                            <div style={styles.emptyBox}>
                                <p style={styles.emptyIcon}>🏠</p>
                                <p style={styles.emptyTitle}>No listings yet</p>
                                <p style={styles.emptyText}>Start earning by adding your first property.</p>
                                <button style={styles.addBtn} onClick={() => navigate('/create-listing')}>
                                    + Add your first listing
                                </button>
                            </div>
                        ) : (
                            <div style={styles.cardGrid}>
                                {listings.slice(0, 3).map(listing => (
                                    <div key={listing.id} style={styles.listingCard}>
                                        <div style={styles.listingCardImg}>
                                            {listing.images?.[0]
                                                ? <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                : <span style={{ fontSize: '32px' }}>🏠</span>
                                            }
                                        </div>
                                        <div style={styles.listingCardBody}>
                                            <p style={styles.listingCardTitle}>{listing.title}</p>
                                            <p style={styles.listingCardLocation}>📍 {listing.location}</p>
                                            <div style={styles.listingCardFooter}>
                                                <span style={styles.listingCardPrice}>
                                                    ₱{Number(listing.price_per_night).toLocaleString()}<span style={{ fontWeight: 400, color: '#888', fontSize: '12px' }}>/night</span>
                                                </span>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button style={styles.editBtn} onClick={() => navigate(`/host/listings/${listing.id}/edit`)}>Edit</button>
                                                    <button style={styles.deleteBtn} onClick={() => handleDelete(listing.id)}>Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Listings page */}
                {activePage === 'listings' && (
                    <div>
                        <div style={styles.pageHeader}>
                            <div>
                                <h1 style={styles.pageTitle}>Listings</h1>
                                <p style={styles.pageSub}>{listings.length} propert{listings.length === 1 ? 'y' : 'ies'}</p>
                            </div>
                            <button style={styles.addBtn} onClick={() => navigate('/create-listing')}>
                                + Add listing
                            </button>
                        </div>

                        {loading ? (
                            <p style={{ color: '#888' }}>Loading...</p>
                        ) : listings.length === 0 ? (
                            <div style={styles.emptyBox}>
                                <p style={styles.emptyIcon}>🏠</p>
                                <p style={styles.emptyTitle}>No listings yet</p>
                                <button style={styles.addBtn} onClick={() => navigate('/create-listing')}>
                                    + Add your first listing
                                </button>
                            </div>
                        ) : (
                            <div style={styles.table}>
                                <div style={styles.tableHeader}>
                                    <span style={{ flex: 2 }}>Property</span>
                                    <span style={{ flex: 1 }}>Location</span>
                                    <span style={{ flex: 1 }}>Price/night</span>
                                    <span style={{ flex: 1 }}>Max guests</span>
                                    <span style={{ flex: 1 }}>Actions</span>
                                </div>
                                {listings.map((listing, i) => (
                                    <div key={listing.id}
                                        style={{
                                            ...styles.tableRow,
                                            background: hoverRow === i ? '#fafafa' : '#fff'
                                        }}
                                        onMouseEnter={() => setHoverRow(i)}
                                        onMouseLeave={() => setHoverRow(null)}
                                    >
                                        <span style={{ flex: 2, fontWeight: '600', color: '#222' }}>{listing.title}</span>
                                        <span style={{ flex: 1, color: '#666' }}>📍 {listing.location}</span>
                                        <span style={{ flex: 1, color: '#ff385c', fontWeight: '700' }}>
                                            ₱{Number(listing.price_per_night).toLocaleString()}
                                        </span>
                                        <span style={{ flex: 1, color: '#666' }}>👥 {listing.max_guests}</span>
                                        <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                                            <button style={styles.editBtn} onClick={() => navigate(`/host/listings/${listing.id}/edit`)}>Edit</button>
                                            <button style={styles.deleteBtn} onClick={() => handleDelete(listing.id)}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Bookings page */}
                {activePage === 'bookings' && (
                    <div>
                        <div style={styles.pageHeader}>
                            <div>
                                <h1 style={styles.pageTitle}>Bookings</h1>
                                <p style={styles.pageSub}>Manage your reservations</p>
                            </div>
                        </div>
                        <div style={styles.emptyBox}>
                            <p style={styles.emptyIcon}>📅</p>
                            <p style={styles.emptyTitle}>No bookings yet</p>
                            <p style={styles.emptyText}>Bookings from guests will appear here.</p>
                        </div>
                    </div>
                )}

                {/* Earnings page */}
                {activePage === 'earnings' && (
                    <div>
                        <div style={styles.pageHeader}>
                            <div>
                                <h1 style={styles.pageTitle}>Earnings</h1>
                                <p style={styles.pageSub}>Your payout history</p>
                            </div>
                        </div>
                        <div style={styles.statsGrid}>
                            <div style={styles.statCard}>
                                <span style={styles.statIcon}>💰</span>
                                <span style={styles.statNum}>₱0</span>
                                <span style={styles.statLabel}>This Month</span>
                            </div>
                            <div style={styles.statCard}>
                                <span style={styles.statIcon}>📈</span>
                                <span style={styles.statNum}>₱0</span>
                                <span style={styles.statLabel}>All Time</span>
                            </div>
                            <div style={styles.statCard}>
                                <span style={styles.statIcon}>⏳</span>
                                <span style={styles.statNum}>₱0</span>
                                <span style={styles.statLabel}>Pending</span>
                            </div>
                        </div>
                        <div style={styles.emptyBox}>
                            <p style={styles.emptyIcon}>📊</p>
                            <p style={styles.emptyTitle}>No earnings yet</p>
                            <p style={styles.emptyText}>Your earnings will show up here once you get bookings.</p>
                        </div>
                    </div>
                )}

                {/* Settings page */}
                {activePage === 'settings' && (
                    <div>
                        <div style={styles.pageHeader}>
                            <div>
                                <h1 style={styles.pageTitle}>Settings</h1>
                                <p style={styles.pageSub}>Manage your account</p>
                            </div>
                        </div>
                        <div style={styles.settingsCard}>
                            <div style={styles.settingsRow}>
                                <div>
                                    <p style={styles.settingsLabel}>Full name</p>
                                    <p style={styles.settingsValue}>{user?.name}</p>
                                </div>
                                <button style={styles.editBtn}>Edit</button>
                            </div>
                            <div style={styles.dividerLine} />
                            <div style={styles.settingsRow}>
                                <div>
                                    <p style={styles.settingsLabel}>Email</p>
                                    <p style={styles.settingsValue}>{user?.email || '—'}</p>
                                </div>
                                <button style={styles.editBtn}>Edit</button>
                            </div>
                            <div style={styles.dividerLine} />
                            <div style={styles.settingsRow}>
                                <div>
                                    <p style={styles.settingsLabel}>Role</p>
                                    <p style={styles.settingsValue}>Host</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

const styles = {
    shell: {
        display: 'flex',
        minHeight: '100vh',
        background: '#f7f7f7',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },

    // Sidebar
    sidebar: {
        width: '240px',
        flexShrink: 0,
        background: '#fff',
        borderRight: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
    },
    sidebarLogo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '24px 20px 20px',
        cursor: 'pointer',
        borderBottom: '1px solid #f0f0f0',
        marginBottom: '8px',
    },
    logoText: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#222',
        letterSpacing: '-0.3px',
    },
    logoTag: {
        fontSize: '11px',
        fontWeight: '600',
        color: '#ff385c',
        background: '#fff0f3',
        padding: '2px 7px',
        borderRadius: '20px',
    },
    sidebarNav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        padding: '0 12px',
        flex: 1,
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '11px 14px',
        borderRadius: '10px',
        border: 'none',
        background: 'transparent',
        fontSize: '14px',
        fontWeight: '500',
        color: '#555',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s, color 0.15s',
        width: '100%',
    },
    navItemActive: {
        background: '#f7f7f7',
        color: '#222',
        fontWeight: '600',
    },
    navIcon: {
        fontSize: '17px',
        width: '22px',
        textAlign: 'center',
        flexShrink: 0,
    },
    sidebarBottom: {
        padding: '12px',
    },
    dividerLine: {
        height: '1px',
        background: '#f0f0f0',
        margin: '12px 0',
    },
    profileRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 6px',
    },
    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: '#222',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: '700',
        flexShrink: 0,
    },
    profileInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    profileName: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#222',
    },
    profileRole: {
        fontSize: '11px',
        color: '#ff385c',
        fontWeight: '500',
    },
    logoutBtn: {
        width: '100%',
        padding: '10px 14px',
        background: 'none',
        border: '1px solid #eee',
        borderRadius: '10px',
        fontSize: '13px',
        color: '#888',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.15s',
    },

    // Main
    main: {
        flex: 1,
        padding: '40px 40px',
        overflowY: 'auto',
        maxWidth: '1000px',
    },
    pageHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
    },
    pageTitle: {
        fontSize: '26px',
        fontWeight: '700',
        color: '#222',
        margin: 0,
    },
    pageSub: {
        fontSize: '14px',
        color: '#888',
        marginTop: '4px',
    },
    addBtn: {
        background: '#ff385c',
        color: '#fff',
        border: 'none',
        padding: '12px 22px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    },

    // Stats
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '40px',
    },
    statCard: {
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: '14px',
        padding: '22px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    statIcon: { fontSize: '20px' },
    statNum: { fontSize: '28px', fontWeight: '700', color: '#222' },
    statLabel: { fontSize: '13px', color: '#888' },

    // Section header
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    sectionTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#222',
        margin: 0,
    },
    seeAllBtn: {
        background: 'none',
        border: 'none',
        fontSize: '14px',
        color: '#ff385c',
        fontWeight: '600',
        cursor: 'pointer',
    },

    // Listing cards
    cardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
    },
    listingCard: {
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: '14px',
        overflow: 'hidden',
    },
    listingCardImg: {
        height: '140px',
        background: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    listingCardBody: {
        padding: '14px 16px',
    },
    listingCardTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#222',
        margin: '0 0 4px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    listingCardLocation: {
        fontSize: '12px',
        color: '#888',
        margin: '0 0 12px',
    },
    listingCardFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    listingCardPrice: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#222',
    },

    // Table
    table: {
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: '14px',
        overflow: 'hidden',
    },
    tableHeader: {
        display: 'flex',
        padding: '14px 20px',
        background: '#f9f9f9',
        borderBottom: '1px solid #eee',
        fontSize: '12px',
        fontWeight: '700',
        color: '#aaa',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
    },
    tableRow: {
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #f5f5f5',
        fontSize: '14px',
        transition: 'background 0.15s',
    },

    // Buttons
    editBtn: {
        background: '#f5f5f5',
        border: 'none',
        padding: '6px 14px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        color: '#444',
    },
    deleteBtn: {
        background: '#fff0f2',
        color: '#ff385c',
        border: 'none',
        padding: '6px 14px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
    },

    // Empty
    emptyBox: {
        textAlign: 'center',
        padding: '64px 40px',
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: '14px',
    },
    emptyIcon: { fontSize: '40px', margin: '0 0 12px' },
    emptyTitle: { fontSize: '17px', fontWeight: '700', color: '#222', margin: '0 0 6px' },
    emptyText: { fontSize: '14px', color: '#888', margin: '0 0 20px' },

    // Skeleton
    skeletonGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
    },
    skeleton: {
        height: '220px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
        borderRadius: '14px',
    },

    // Settings
    settingsCard: {
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: '14px',
        padding: '8px 24px',
        maxWidth: '560px',
    },
    settingsRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '18px 0',
    },
    settingsLabel: {
        fontSize: '12px',
        color: '#888',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        margin: '0 0 4px',
    },
    settingsValue: {
        fontSize: '15px',
        fontWeight: '500',
        color: '#222',
        margin: 0,
    },
};

export default HostDashboard;