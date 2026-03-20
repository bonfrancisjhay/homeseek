import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function HostDashboard() {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        // Redirect if not host
        if (!user || user.role !== 'host') {
            navigate('/');
            return;
        }
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

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Host Dashboard</h1>
                    <p style={styles.sub}>Welcome back, {user?.name} 👋</p>
                </div>
                <button
                    style={styles.addBtn}
                    onClick={() => navigate('/create-listing')}
                >
                    + Add Listing
                </button>
            </div>

            {/* Stats */}
            <div style={styles.stats}>
                <div style={styles.statCard}>
                    <span style={styles.statNum}>{listings.length}</span>
                    <span style={styles.statLabel}>Total Listings</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statNum}>0</span>
                    <span style={styles.statLabel}>Total Bookings</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statNum}>₱0</span>
                    <span style={styles.statLabel}>Total Earnings</span>
                </div>
            </div>

            {/* Listings */}
            <h2 style={styles.sectionTitle}>Your Listings</h2>

            {loading ? (
                <p style={styles.empty}>Loading...</p>
            ) : listings.length === 0 ? (
                <div style={styles.emptyBox}>
                    <p style={styles.emptyText}>You haven't listed any properties yet.</p>
                    <button
                        style={styles.addBtn}
                        onClick={() => navigate('/create-listing')}
                    >
                        + Add your first listing
                    </button>
                </div>
            ) : (
                <div style={styles.table}>
                    {/* Table header */}
                    <div style={styles.tableHeader}>
                        <span style={{flex: 2}}>Property</span>
                        <span style={{flex: 1}}>Location</span>
                        <span style={{flex: 1}}>Price/night</span>
                        <span style={{flex: 1}}>Max Guests</span>
                        <span style={{flex: 1}}>Actions</span>
                    </div>

                    {/* Table rows */}
                    {listings.map(listing => (
                        <div key={listing.id} style={styles.tableRow}>
                            <span style={{flex: 2, fontWeight: '500'}}>
                                {listing.title}
                            </span>
                            <span style={{flex: 1, color: '#666'}}>
                                📍 {listing.location}
                            </span>
                            <span style={{flex: 1, color: '#ff385c', fontWeight: '600'}}>
                                ₱{Number(listing.price_per_night).toLocaleString()}
                            </span>
                            <span style={{flex: 1, color: '#666'}}>
                                👥 {listing.max_guests}
                            </span>
                            <div style={{flex: 1, display: 'flex', gap: '8px'}}>
                                <button
                                    style={styles.editBtn}
                                    onClick={() => navigate(`/host/listings/${listing.id}/edit`)}
                                >
                                    Edit
                                </button>
                                <button
                                    style={styles.deleteBtn}
                                    onClick={() => handleDelete(listing.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '40px 24px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#222'
    },
    sub: { color: '#888', fontSize: '15px', marginTop: '4px' },
    addBtn: {
        background: '#ff385c',
        color: '#fff',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    stats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '40px'
    },
    statCard: {
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    statNum: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#222'
    },
    statLabel: {
        fontSize: '14px',
        color: '#888'
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#222',
        marginBottom: '16px'
    },
    table: {
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: '12px',
        overflow: 'hidden'
    },
    tableHeader: {
        display: 'flex',
        padding: '14px 20px',
        background: '#f7f7f7',
        borderBottom: '1px solid #eee',
        fontSize: '13px',
        fontWeight: '600',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    tableRow: {
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #f0f0f0',
        fontSize: '14px'
    },
    editBtn: {
        background: '#f0f0f0',
        border: 'none',
        padding: '6px 14px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500'
    },
    deleteBtn: {
        background: '#fff0f0',
        color: '#e00',
        border: 'none',
        padding: '6px 14px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500'
    },
    empty: { color: '#888' },
    emptyBox: {
        textAlign: 'center',
        padding: '60px',
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: '12px'
    },
    emptyText: {
        color: '#888',
        marginBottom: '16px',
        fontSize: '15px'
    }
};

export default HostDashboard;