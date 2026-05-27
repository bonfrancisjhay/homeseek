import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ListingCard from '../components/ListingCard';
import AuthModal from '../components/AuthModal';

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
        <div className="bg-white min-h-screen">
            {showModal && (
                <AuthModal
                    onClose={() => setShowModal(false)}
                    onSuccess={handleAuthSuccess}
                />
            )}

            <div className="max-w-[1400px] mx-auto px-6 py-8">
                {loading ? (
                    // Skeleton
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="h-[320px] rounded-2xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : listings.length === 0 ? (
                    // Empty state
                    <div className="text-center py-20">
                        <p className="text-5xl mb-4">🏠</p>
                        <p className="text-xl font-semibold text-gray-800 mb-2">No listings found</p>
                        <p className="text-sm text-gray-400">Try searching a different location</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
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

export default Listings;