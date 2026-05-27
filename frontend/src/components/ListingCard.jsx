import { useState, useEffect } from 'react';

function ListingCard({ listing, onClick, index }) {
    const [liked, setLiked] = useState(false);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        setImgError(false);
    }, [listing.id]);

    const placeholders = [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500',
        'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=500',
    ];

    const BASE_URL = (import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000').replace(/\/$/, '');

    const firstImage = listing.images?.[0];

    const getImageSrc = () => {
        if (imgError || !firstImage) return placeholders[index % placeholders.length];
        if (firstImage.startsWith('http')) return firstImage;
        return `${BASE_URL}${firstImage}`;
    };

    // Real average rating from reviews
    const avgRating = listing.reviews?.length > 0
        ? (listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length).toFixed(2)
        : null;

    return (
        <div className="cursor-pointer rounded-2xl overflow-hidden bg-white transition-transform duration-200 hover:-translate-y-1" onClick={onClick}>

            {/* Image */}
            <div className="relative w-full pb-[66%] overflow-hidden rounded-2xl bg-gray-100">
                <img
                    src={getImageSrc()}
                    alt={listing.title}
                    className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={() => { if (!imgError) setImgError(true); }}
                />

                {/* Like button */}
                <button
                    className="absolute top-3 right-3 bg-none border-none text-[22px] cursor-pointer z-10 drop-shadow-md"
                    onClick={e => { e.stopPropagation(); setLiked(!liked); }}
                >
                    {liked ? '❤️' : '🤍'}
                </button>

                {/* Guest favorite badge */}
                {index % 3 === 0 && (
                    <div className="absolute top-3 left-3 bg-white text-gray-800 text-[11px] font-semibold px-3 py-1 rounded-full shadow-md">
                        Guest favorite
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="pt-3 px-1 pb-1">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm font-semibold text-gray-800 flex-1 mr-2 leading-snug line-clamp-1">
                        {listing.title}
                    </h3>
                    <div className="text-[13px] text-gray-800 font-medium flex-shrink-0">
                        {avgRating ? `★ ${avgRating}` : '★ New'}
                    </div>
                </div>

                <p className="text-[13px] text-gray-500 mb-0.5">{listing.location}</p>
                <p className="text-[13px] text-gray-500 mb-1.5">Up to {listing.max_guests} guests</p>
                <p className="text-[13px] text-gray-800 mt-1">
                    <span className="font-semibold">₱{Number(listing.price_per_night).toLocaleString()}</span>
                    {' '}/ night
                </p>
            </div>
        </div>
    );
}

export default ListingCard;