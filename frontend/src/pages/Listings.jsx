import { useEffect, useState } from 'react';
import api from '../services/api';
import ListingCard from '../components/ListingCard';

function Listings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/listings')
            .then(res => setListings(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Available Properties</h2>
            <p style={styles.sub}>Find your perfect place to stay</p>

            {loading ? (
                <p style={styles.loading}>Loading listings...</p>
            ) : listings.length === 0 ? (
                <p style={styles.empty}>No listings yet.</p>
            ) : (
                <div style={styles.grid}>
                    {listings.map(listing => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 24px'
    },
    title: { fontSize: '28px', fontWeight: 'bold', color: '#222' },
    sub: { color: '#888', marginBottom: '32px', fontSize: '15px' },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
    },
    loading: { color: '#888', fontSize: '16px' },
    empty: { color: '#888', fontSize: '16px' }
};

export default Listings;