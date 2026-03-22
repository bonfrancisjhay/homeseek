import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ListingCard from '../components/ListingCard';
import AuthModal from '../components/AuthModal';
import 'react-datepicker/dist/react-datepicker.css';


function Listings({ searchFilter }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [pendingId, setPendingId] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        api.get('/listings')
            .then(res => {
                const filtered = searchFilter
                    ? res.data.filter(l =>
                        l.location.toLowerCase().includes(searchFilter.toLowerCase()))
                    : res.data;
                setListings(filtered);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [searchFilter]);

    const handleCardClick = (id) => {
        if (!token) {
            setPendingId(id);
            setShowModal(true);
        } else {
            navigate(`/listings/${id}`);
        }
    };

    const handleAuthSuccess = () => {
        setShowModal(false);
        if (pendingId) navigate(`/listings/${pendingId}`);
    };

    return (
        <div style={styles.page}>
            {showModal && (
                <AuthModal
                    onClose={() => setShowModal(false)}
                    onSuccess={handleAuthSuccess}
                />
            )}

            {/* Listings Grid */}
            <div style={styles.container}>
                {loading ? (
                    <div style={styles.loadingGrid}>
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} style={styles.skeleton} />
                        ))}
                    </div>
                ) : listings.length === 0 ? (
                    <div style={styles.empty}>
                        <p style={styles.emptyIcon}>🏠</p>
                        <p style={styles.emptyText}>No listings found</p>
                        <p style={styles.emptySub}>Try searching a different location</p>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {listings.map((listing, i) => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                onClick={() => handleCardClick(listing.id)}
                                index={i}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: { background: '#fff', minHeight: '100vh' },
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '24px'
    },
    loadingGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '24px'
    },
    skeleton: {
        height: '320px',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        borderRadius: '16px',
        animation: 'pulse 1.5s infinite'
    },
    empty: {
        textAlign: 'center',
        padding: '80px 24px'
    },
    emptyIcon: { fontSize: '48px', marginBottom: '16px' },
    emptyText: { fontSize: '22px', fontWeight: '600', color: '#222', marginBottom: '8px' },
    emptySub: { fontSize: '15px', color: '#888' }
};

export default Listings;