import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function ListingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ check_in: '', check_out: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [booking, setBooking] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        api.get(`/listings/${id}`)
            .then(res => setListing(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!token) {
            navigate('/login');
            return;
        }
        setBooking(true);
        setError('');
        try {
            await api.post('/bookings', {
                listing_id: id,
                check_in: form.check_in,
                check_out: form.check_out
            });
            setSuccess('Booking confirmed! 🎉');
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed');
        } finally {
            setBooking(false);
        }
    };

    // Calculate nights and total
    const nights = form.check_in && form.check_out
        ? Math.ceil((new Date(form.check_out) - new Date(form.check_in)) / (1000 * 60 * 60 * 24))
        : 0;
    const total = listing ? nights * listing.price_per_night : 0;

    if (loading) return <p style={styles.loading}>Loading...</p>;
    if (!listing) return <p style={styles.loading}>Listing not found.</p>;

    return (
        <div style={styles.container}>
            {/* Photo */}
            <div style={styles.imgBox}>
                {listing.photo
                    ? <img src={listing.photo} alt={listing.title} style={styles.img} />
                    : <div style={styles.noImg}>🏠</div>
                }
            </div>

            <div style={styles.content}>
                {/* Left side - details */}
                <div style={styles.left}>
                    <h1 style={styles.title}>{listing.title}</h1>
                    <p style={styles.location}>📍 {listing.location}</p>
                    <p style={styles.guests}>👥 Max {listing.max_guests} guests</p>
                    <p style={styles.hosted}>
                        Hosted by <strong>{listing.user?.name}</strong>
                    </p>
                    <hr style={styles.divider} />
                    <h3 style={styles.aboutTitle}>About this place</h3>
                    <p style={styles.desc}>{listing.description}</p>
                </div>

                {/* Right side - booking card */}
                <div style={styles.right}>
                    <div style={styles.bookCard}>
                        <p style={styles.price}>
                            ₱{Number(listing.price_per_night).toLocaleString()}
                            <span style={styles.night}> / night</span>
                        </p>

                        {success ? (
                            <div style={styles.success}>{success}</div>
                        ) : (
                            <form onSubmit={handleBooking}>
                                {error && <p style={styles.error}>{error}</p>}
                                <div style={styles.dates}>
                                    <div style={styles.dateField}>
                                        <label style={styles.label}>Check in</label>
                                        <input
                                            style={styles.input}
                                            type="date"
                                            name="check_in"
                                            value={form.check_in}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div style={styles.dateField}>
                                        <label style={styles.label}>Check out</label>
                                        <input
                                            style={styles.input}
                                            type="date"
                                            name="check_out"
                                            value={form.check_out}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {nights > 0 && (
                                    <div style={styles.summary}>
                                        <span>₱{Number(listing.price_per_night).toLocaleString()} x {nights} nights</span>
                                        <span>₱{Number(total).toLocaleString()}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    style={styles.btn}
                                    disabled={booking}
                                >
                                    {booking ? 'Booking...' : token ? 'Reserve' : 'Login to Book'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' },
    imgBox: {
        width: '100%', height: '400px', borderRadius: '16px',
        overflow: 'hidden', background: '#f0f0f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '32px'
    },
    img: { width: '100%', height: '100%', objectFit: 'cover' },
    noImg: { fontSize: '80px' },
    content: { display: 'flex', gap: '48px', flexWrap: 'wrap' },
    left: { flex: 1, minWidth: '280px' },
    right: { width: '360px', flexShrink: 0 },
    title: { fontSize: '28px', fontWeight: 'bold', color: '#222', marginBottom: '8px' },
    location: { fontSize: '15px', color: '#666', marginBottom: '6px' },
    guests: { fontSize: '15px', color: '#666', marginBottom: '6px' },
    hosted: { fontSize: '15px', color: '#666', marginBottom: '24px' },
    divider: { border: 'none', borderTop: '1px solid #eee', margin: '24px 0' },
    aboutTitle: { fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#222' },
    desc: { fontSize: '15px', color: '#555', lineHeight: '1.7' },
    bookCard: {
        border: '1px solid #ddd', borderRadius: '16px',
        padding: '24px', boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
        position: 'sticky', top: '100px', background: '#fff'
    },
    price: { fontSize: '22px', fontWeight: 'bold', color: '#222', marginBottom: '20px' },
    night: { fontSize: '15px', fontWeight: 'normal', color: '#888' },
    dates: { display: 'flex', gap: '8px', marginBottom: '12px' },
    dateField: { flex: 1 },
    label: { display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#444', textTransform: 'uppercase' },
    input: {
        width: '100%', padding: '10px', border: '1px solid #ddd',
        borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box'
    },
    summary: {
        display: 'flex', justifyContent: 'space-between',
        fontSize: '14px', color: '#444', marginBottom: '16px',
        padding: '12px 0', borderTop: '1px solid #eee'
    },
    btn: {
        width: '100%', padding: '14px', background: '#ff385c',
        color: '#fff', border: 'none', borderRadius: '8px',
        fontSize: '16px', fontWeight: '600', cursor: 'pointer'
    },
    error: {
        background: '#fff0f0', color: '#e00', padding: '10px',
        borderRadius: '8px', marginBottom: '12px', fontSize: '13px'
    },
    success: {
        background: '#f0fff4', color: '#090', padding: '16px',
        borderRadius: '8px', fontSize: '15px', textAlign: 'center',
        fontWeight: '600'
    },
    loading: { textAlign: 'center', padding: '60px', color: '#888' }
};

export default ListingDetail;