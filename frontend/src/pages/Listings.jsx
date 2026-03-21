import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ListingCard from '../components/ListingCard';
import AuthModal from '../components/AuthModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiSearch } from 'react-icons/fi';

function Listings() {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [pendingId, setPendingId] = useState(null);
    const [search, setSearch] = useState({
        location: '', check_in: '', check_out: '', guests: ''
    });
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        api.get('/listings')
            .then(res => setListings(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

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

    const handleSearch = (e) => {
        e.preventDefault();
        // filter listings by location
        api.get('/listings')
            .then(res => {
                const filtered = res.data.filter(l =>
                    l.location.toLowerCase().includes(search.location.toLowerCase())
                );
                setListings(filtered);
            });
    };

    return (
        <div style={styles.page}>
            {showModal && (
                <AuthModal
                    onClose={() => setShowModal(false)}
                    onSuccess={handleAuthSuccess}
                />
            )}

            {/* Search Bar */}
            <div style={styles.searchWrapper}>
                <form onSubmit={handleSearch} style={styles.searchBar}>
                    <div style={styles.searchField}>
                        <span style={styles.searchLabel}>Where</span>
                        <input
                            style={styles.searchInput}
                            type="text"
                            placeholder="Search destinations"
                            value={search.location}
                            onChange={(e) => setSearch({...search, location: e.target.value})}
                        />
                    </div>
                    <div style={styles.searchDivider} />
                    <div
                        style={styles.searchField}
                        onClick={() => setShowDatePicker(!showDatePicker)}
                    >
                        <span style={styles.searchLabel}>When</span>
                        <span style={{...styles.searchInput, color: startDate ? '#222' : '#666'}}>
                            {startDate && endDate
                                ? `${startDate.toLocaleDateString()} → ${endDate.toLocaleDateString()}`
                                : startDate
                                ? `${startDate.toLocaleDateString()} → Add checkout`
                                : 'Add dates'
                            }
                        </span>

                        {showDatePicker && (
                            <div
                                style={styles.calendarDropdown}
                                onClick={e => e.stopPropagation()}
                            >
                                <DatePicker
                                    selected={startDate}
                                    onChange={(dates) => {
                                        const [start, end] = dates;
                                        setStartDate(start);
                                        setEndDate(end);
                                        if (start && end) setShowDatePicker(false);
                                    }}
                                    startDate={startDate}
                                    endDate={endDate}
                                    selectsRange
                                    inline
                                    monthsShown={2}
                                    minDate={new Date()}
                                />
                            </div>
                        )}
                    </div>
                    <div style={styles.searchDivider} />
                    <div style={styles.searchField}>
                        <span style={styles.searchLabel}>Who</span>
                        <input
                            style={styles.searchInput}
                            type="number"
                            placeholder="Add guests"
                            min="1"
                            value={search.guests}
                            onChange={(e) => setSearch({...search, guests: e.target.value})}
                        />
                    </div>
                    <button type="submit" style={styles.searchBtn}>
                        <FiSearch size={18} color="#fff" />
                    </button>
                </form>
            </div>

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
    searchWrapper: {
        display: 'flex',
        justifyContent: 'center',
        padding: '24px 24px 32px',
        borderBottom: '1px solid #eee',
        position: 'relative',
        zIndex: 200
    },
    datePicker: {
    position: 'absolute',
    top: '70px',
    left: '0',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    padding: '20px',
    zIndex: 200,
    width: '320px'
},
calendarDropdown: {
    position: 'absolute',
    top: '70px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#fff',
    borderRadius: '24px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
    zIndex: 300,
    padding: '16px',
    border: '1px solid #eee',
    width: 'max-content'
},
datePickerRow: {
    display: 'flex',
    gap: '12px'
},
searchField: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 20px',
    flex: 1,
    cursor: 'pointer',
    position: 'relative', // ← add this
},
datePickerField: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
},
datePickerLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#222',
    letterSpacing: '0.04em'
},
datePickerInput: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '8px',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
},
    searchBar: {
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '40px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
        maxWidth: '860px',
        width: '100%'
    },
    searchLabel: {
        fontSize: '11px',
        fontWeight: '700',
        color: '#222',
        letterSpacing: '0.04em'
    },
    searchInput: {
        border: 'none',
        outline: 'none',
        fontSize: '13px',
        color: '#666',
        background: 'transparent',
        width: '100%',
        marginTop: '2px'
    },
    searchDivider: {
        width: '1px',
        height: '32px',
        background: '#ddd',
        flexShrink: 0
    },
    searchBtn: {
        background: '#2196f3',
        border: 'none',
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        margin: '6px',
        cursor: 'pointer',
        fontSize: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
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