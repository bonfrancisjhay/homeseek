import { useState } from 'react';

function ListingCard({ listing, onClick, index }) {
    const [liked, setLiked] = useState(false);
    const [imgError, setImgError] = useState(false);

    // Placeholder images for listings without photos
    const placeholders = [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500',
        'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=500',
    ];

    const imgSrc = listing.photo && !imgError
        ? listing.photo
        : placeholders[index % placeholders.length];

    return (
        <div style={styles.card} onClick={onClick}>
            {/* Image */}
            <div style={styles.imgWrapper}>
                <img
                    src={imgSrc}
                    alt={listing.title}
                    style={styles.img}
                    onError={() => setImgError(true)}
                />
                {/* Like button */}
                <button
                    style={styles.likeBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        setLiked(!liked);
                    }}
                >
                    {liked ? '❤️' : '🤍'}
                </button>
                {/* Guest favorite badge */}
                {index % 3 === 0 && (
                    <div style={styles.badge}>Guest favorite</div>
                )}
            </div>

            {/* Info */}
            <div style={styles.info}>
                <div style={styles.row}>
                    <h3 style={styles.title}>{listing.title}</h3>
                    <div style={styles.rating}>
                        ★ {(4.5 + Math.random() * 0.5).toFixed(2)}
                    </div>
                </div>
                <p style={styles.location}>{listing.location}</p>
                <p style={styles.guests}>Up to {listing.max_guests} guests</p>
                <p style={styles.price}>
                    <span style={styles.priceNum}>
                        ₱{Number(listing.price_per_night).toLocaleString()}
                    </span>
                    {' '}for 1 night
                </p>
            </div>
        </div>
    );
}

const styles = {
    card: {
        cursor: 'pointer',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'transform 0.2s',
        background: '#fff'
    },
    imgWrapper: {
        position: 'relative',
        width: '100%',
        paddingBottom: '66%',
        overflow: 'hidden',
        borderRadius: '16px',
        background: '#f0f0f0'
    },
    img: {
        position: 'absolute',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.3s',
    },
    likeBtn: {
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: 'none',
        border: 'none',
        fontSize: '22px',
        cursor: 'pointer',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
        zIndex: 1
    },
    badge: {
        position: 'absolute',
        top: '12px',
        left: '12px',
        background: '#fff',
        color: '#222',
        fontSize: '11px',
        fontWeight: '600',
        padding: '5px 10px',
        borderRadius: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    },
    info: {
        padding: '12px 4px 0'
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '4px'
    },
    title: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#222',
        flex: 1,
        marginRight: '8px',
        lineHeight: '1.3'
    },
    rating: {
        fontSize: '13px',
        color: '#222',
        fontWeight: '500',
        flexShrink: 0
    },
    location: {
        fontSize: '13px',
        color: '#717171',
        marginBottom: '2px'
    },
    guests: {
        fontSize: '13px',
        color: '#717171',
        marginBottom: '6px'
    },
    price: {
        fontSize: '13px',
        color: '#222',
        marginTop: '4px'
    },
    priceNum: {
        fontWeight: '600'
    }
};

export default ListingCard;