import { useNavigate } from 'react-router-dom';

function ListingCard({ listing }) {
        const navigate = useNavigate();

    return (
        <div style={styles.card}
            onClick={() => navigate(`/listings/${listing.id}`)}>        
            <div style={styles.imgBox}>
                {listing.photo ? (
                    <img
                        src={listing.photo}
                        alt={listing.title}
                        style={styles.img}
                    />
                ) : (
                    <div style={styles.noImg}>🏠</div>
                )}
            </div>
            <div style={styles.body}>
                <h3 style={styles.title}>{listing.title}</h3>
                <p style={styles.location}>📍 {listing.location}</p>
                <p style={styles.desc}>{listing.description}</p>
                <div style={styles.footer}>
                    <span style={styles.price}>
                        ₱{Number(listing.price_per_night).toLocaleString()}
                        <span style={styles.night}> / night</span>
                    </span>
                    <span style={styles.guests}>
                        👥 {listing.max_guests} guests
                    </span>
                </div>
            </div>
        </div>
    );
}

const styles = {
    card: {
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #eee',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        background: '#fff'
    },
    imgBox: {
        height: '200px',
        background: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    img: { width: '100%', height: '100%', objectFit: 'cover' },
    noImg: { fontSize: '64px' },
    body: { padding: '16px' },
    title: { fontSize: '17px', fontWeight: '600', marginBottom: '6px', color: '#222' },
    location: { fontSize: '13px', color: '#888', marginBottom: '8px' },
    desc: {
        fontSize: '13px',
        color: '#666',
        marginBottom: '16px',
        lineHeight: '1.5',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    price: { fontSize: '16px', fontWeight: 'bold', color: '#ff385c' },
    night: { fontSize: '13px', fontWeight: 'normal', color: '#888' },
    guests: { fontSize: '13px', color: '#666' }
};

export default ListingCard;