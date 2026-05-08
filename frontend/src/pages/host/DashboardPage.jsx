import { useNavigate } from 'react-router-dom';
import styles from '../../components/shared/dashboardStyles';
import './DashboardPage.css';

const MONTHLY_DATA = [
    { month: 'Jan', value: 0 },
    { month: 'Feb', value: 0 },
    { month: 'Mar', value: 0 },
    { month: 'Apr', value: 0 },
    { month: 'May', value: 0 },
    { month: 'Jun', value: 0 },
    { month: 'Jul', value: 0 },
    { month: 'Aug', value: 0 },
    { month: 'Sep', value: 0 },
    { month: 'Oct', value: 0 },
    { month: 'Nov', value: 0 },
    { month: 'Dec', value: 0 },
];

function DashboardPage({ listings, loading, onDelete, onViewAll, user }) {
    const navigate = useNavigate();
    const maxValue = Math.max(...MONTHLY_DATA.map(d => d.value), 1);

    return (
        <div>

            <div className="dash-wrap">

                {/* Header */}
                <div className="dash-header">
                    <div>
                        <h1 className="dash-title">Dashboard</h1>
                        <p className="dash-sub">Welcome back, {user?.name} 👋</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-icon-row">
                            <div className="stat-icon-wrap red">🏠</div>
                            <span className="stat-badge">Total</span>
                        </div>
                        <span className="stat-num">{listings.length}</span>
                        <span className="stat-label">Listings</span>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon-row">
                            <div className="stat-icon-wrap blue">📅</div>
                            <span className="stat-badge">Active</span>
                        </div>
                        <span className="stat-num">0</span>
                        <span className="stat-label">Bookings</span>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon-row">
                            <div className="stat-icon-wrap green">💰</div>
                            <span className="stat-badge">Month</span>
                        </div>
                        <span className="stat-num">₱0</span>
                        <span className="stat-label">Earnings</span>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon-row">
                            <div className="stat-icon-wrap amber">⭐</div>
                            <span className="stat-badge">Avg</span>
                        </div>
                        <span className="stat-num">—</span>
                        <span className="stat-label">Rating</span>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div>
                            <p className="chart-title">Monthly Earnings</p>
                            <p className="chart-sub">Jan – Dec {new Date().getFullYear()}</p>
                        </div>
                        <div className="chart-total">
                            <div className="chart-total-num">₱0</div>
                            <div className="chart-total-label">Total this year</div>
                        </div>
                    </div>

                    <div className="bar-chart">
                        {MONTHLY_DATA.map((d, i) => {
                            const currentMonth = new Date().getMonth();
                            const heightPct = (d.value / maxValue) * 132;
                            return (
                                <div
                                    key={d.month}
                                    className={`bar-col ${i === currentMonth ? 'current-month' : ''}`}
                                >
                                    <div
                                        className={`bar-fill ${d.value > 0 ? 'has-value' : ''}`}
                                        style={{ height: `${Math.max(heightPct, 4)}px` }}
                                    />
                                    <span className="bar-month">{d.month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Listings */}
                <div className="section-hdr">
                    <h2 className="section-title">Your listings</h2>
                    <button className="see-all-btn" onClick={onViewAll}>See all →</button>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
                        {[1,2,3].map(i => <div key={i} className="skeleton" />)}
                    </div>
                ) : listings.length === 0 ? (
                    <div className="empty-box">
                        <p style={{ fontSize: '36px', margin: '0 0 10px' }}>🏠</p>
                        <p style={{ fontSize: '16px', fontWeight: '700', color: '#222', margin: '0 0 6px' }}>No listings yet</p>
                        <p style={{ fontSize: '13px', color: '#aaa', margin: '0 0 20px' }}>Start earning by adding your first property.</p>
                        <button className="dash-add-btn" onClick={() => navigate('/create-listing')}>
                            + Add your first listing
                        </button>
                    </div>
                ) : (
                    <div className="card-grid">
                        {listings.slice(0, 3).map(listing => (
                            <div key={listing.id} className="listing-card">
                                <div className="listing-img">
                                    {listing.images?.[0]
                                        ? <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : <span style={{ fontSize: '30px' }}>🏠</span>
                                    }
                                </div>
                                <div className="listing-body">
                                    <p className="listing-title">{listing.title}</p>
                                    <p className="listing-loc">📍 {listing.location}</p>
                                    <div className="listing-footer">
                                        <span className="listing-price">
                                            ₱{Number(listing.price_per_night).toLocaleString()}
                                            <span>/night</span>
                                        </span>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button className="btn-edit" onClick={() => navigate(`/host/listings/${listing.id}/edit`)}>Edit</button>
                                            <button className="btn-delete" onClick={() => onDelete(listing.id)}>Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;