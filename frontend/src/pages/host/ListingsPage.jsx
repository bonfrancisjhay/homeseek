import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from '../../components/shared/dashboardStyles';
import './ListingsPage.css';

const AMENITIES = [
    'WiFi', 'Air Conditioning', 'Kitchen', 'Parking',
    'Pool', 'Gym', 'TV', 'Washer', 'Dryer', 'Pet Friendly',
];

const EMPTY_FORM = {
    title: '',
    description: '',
    location: '',
    price_per_night: '',
    max_guests: '',
    amenities: [],
};

function ListingsPage({ listings, loading, onDelete, onRefresh }) {
    const navigate = useNavigate();
    const [hoverRow, setHoverRow]   = useState(null);
    const [showPanel, setShowPanel] = useState(false);
    const [form, setForm]           = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]         = useState('');

    const openPanel  = () => { setForm(EMPTY_FORM); setError(''); setShowPanel(true); };
    const closePanel = () => setShowPanel(false);

    const toggleAmenity = (a) => {
        setForm(f => ({
            ...f,
            amenities: f.amenities.includes(a)
                ? f.amenities.filter(x => x !== a)
                : [...f.amenities, a],
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!form.title || !form.location || !form.price_per_night) {
            setError('Title, location, and price are required.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            await api.post('/listings', {
                ...form,
                price_per_night: Number(form.price_per_night),
                max_guests: Number(form.max_guests),
            });
            closePanel();
            if (onRefresh) onRefresh();
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
         
            <div className="lp-wrap">

                {/* Slide overlay */}
                <div
                    className={`slide-overlay ${showPanel ? 'open' : ''}`}
                    onClick={closePanel}
                />

                {/* Slide panel */}
                <div className={`slide-panel ${showPanel ? 'open' : ''}`}>
                    <div className="panel-header">
                        <div>
                            <p className="panel-title">Add New Listing</p>
                            <p className="panel-sub">Fill in your property details below</p>
                        </div>
                        <button className="panel-close" onClick={closePanel}>✕</button>
                    </div>

                    <div className="panel-body">

                        {/* Title */}
                        <div className="field">
                            <label className="field-label">
                                Property Title <span className="field-required">*</span>
                            </label>
                            <input
                                className="field-input"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="e.g. Cozy Studio in Makati"
                            />
                        </div>

                        {/* Description */}
                        <div className="field">
                            <label className="field-label">Description</label>
                            <textarea
                                className="field-textarea"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Describe your property..."
                            />
                        </div>

                        {/* Location */}
                        <div className="field">
                            <label className="field-label">
                                Location <span className="field-required">*</span>
                            </label>
                            <input
                                className="field-input"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="e.g. Makati City, Metro Manila"
                            />
                        </div>

                        {/* Price + Guests */}
                        <div className="field-row">
                            <div className="field">
                                <label className="field-label">
                                    Price / Night <span className="field-required">*</span>
                                </label>
                                <input
                                    className="field-input"
                                    name="price_per_night"
                                    type="number"
                                    value={form.price_per_night}
                                    onChange={handleChange}
                                    placeholder="₱ 0"
                                />
                            </div>
                            <div className="field">
                                <label className="field-label">Max Guests</label>
                                <input
                                    className="field-input"
                                    name="max_guests"
                                    type="number"
                                    value={form.max_guests}
                                    onChange={handleChange}
                                    placeholder="e.g. 4"
                                />
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="field">
                            <label className="field-label">Amenities</label>
                            <div className="amenities-grid">
                                {AMENITIES.map(a => (
                                    <button
                                        key={a}
                                        className={`amenity-chip ${form.amenities.includes(a) ? 'selected' : ''}`}
                                        onClick={() => toggleAmenity(a)}
                                    >
                                        {form.amenities.includes(a) ? '✓ ' : ''}{a}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Error */}
                        {error && <div className="form-error">⚠ {error}</div>}

                    </div>

                    <div className="panel-footer">
                        <button className="btn-cancel" onClick={closePanel}>Cancel</button>
                        <button
                            className="btn-submit"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Saving...' : '+ Publish Listing'}
                        </button>
                    </div>
                </div>

                {/* Page header */}
                <div className="lp-header">
                    <div>
                        <h1 className="lp-title">Listings</h1>
                        <p className="lp-sub">{listings.length} propert{listings.length === 1 ? 'y' : 'ies'}</p>
                    </div>
                    <button className="lp-add-btn" onClick={openPanel}>
                        + Add listing
                    </button>
                </div>

                {/* Table */}
                {loading ? (
                    <p style={{ color: '#bbb', fontFamily: 'DM Sans, sans-serif' }}>Loading...</p>
                ) : listings.length === 0 ? (
                    <div className="empty-box">
                        <p style={{ fontSize: '36px', margin: '0 0 10px' }}>🏠</p>
                        <p style={{ fontSize: '16px', fontWeight: '700', color: '#222', margin: '0 0 6px', fontFamily: 'DM Sans, sans-serif' }}>No listings yet</p>
                        <p style={{ fontSize: '13px', color: '#aaa', margin: '0 0 20px', fontFamily: 'DM Sans, sans-serif' }}>Add your first property to start earning.</p>
                        <button className="lp-add-btn" onClick={openPanel}>+ Add your first listing</button>
                    </div>
                ) : (
                    <div className="lp-table">
                        <div className="lp-table-header">
                            <span style={{ flex: 2 }}>Property</span>
                            <span style={{ flex: 1 }}>Location</span>
                            <span style={{ flex: 1 }}>Price/night</span>
                            <span style={{ flex: 1 }}>Max guests</span>
                            <span style={{ flex: 1 }}>Actions</span>
                        </div>
                        {listings.map((listing, i) => (
                            <div
                                key={listing.id}
                                className="lp-table-row"
                                style={{ background: hoverRow === i ? '#fafafa' : '#fff' }}
                                onMouseEnter={() => setHoverRow(i)}
                                onMouseLeave={() => setHoverRow(null)}
                            >
                                <span style={{ flex: 2, fontWeight: '600', color: '#111' }}>{listing.title}</span>
                                <span style={{ flex: 1, color: '#888' }}>📍 {listing.location}</span>
                                <span style={{ flex: 1, color: '#2196f3', fontWeight: '700' }}>
                                    ₱{Number(listing.price_per_night).toLocaleString()}
                                </span>
                                <span style={{ flex: 1, color: '#888' }}>👥 {listing.max_guests}</span>
                                <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                                    <button className="btn-edit" onClick={() => navigate(`/host/listings/${listing.id}/edit`)}>Edit</button>
                                    <button className="btn-delete" onClick={() => onDelete(listing.id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default ListingsPage;