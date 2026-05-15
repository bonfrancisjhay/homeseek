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
        <div className="dash-wrap">

    {/* HERO (OUTSIDE GRID) */}
    <div className="hero-card">
        <div>
            <p className="hero-label">DASHBOARD OVERVIEW</p>

            <h1 className="hero-title">
                Welcome back, {user?.name} 👋
            </h1>

            <p className="hero-sub">
                Manage your listings, monitor analytics,
                and track your property performance.
            </p>
        </div>
    </div>

    {/* TOP GRID: LEFT STATS + RIGHT CHART */}
    <div className="dash-grid">

        {/* LEFT: STATS */}
        <div className="dash-left">
            <div className="modern-stats-grid">
                <div className="modern-stat-card">

                    <div className="modern-stat-top">
                        <div className="modern-stat-icon blue">
                            🏠
                        </div>

                        <span className="modern-growth positive">
                            ↑ 12%
                        </span>
                    </div>

                    <h2 className="modern-stat-number">
                        {listings.length}
                    </h2>

                    <p className="modern-stat-label">
                        Total Listings
                    </p>

                    <div className="modern-stat-bottom">
                        Active rental properties
                    </div>

                </div>

                <div className="modern-stat-card">

                    <div className="modern-stat-top">
                        <div className="modern-stat-icon green">
                            📅
                        </div>

                        <span className="modern-growth positive">
                            ↑ 4%
                        </span>
                    </div>

                    <h2 className="modern-stat-number">
                        0
                    </h2>

                    <p className="modern-stat-label">
                        Active Bookings
                    </p>

                    <div className="modern-stat-bottom">
                        Current reservations
                    </div>

                </div>

                <div className="modern-stat-card">

                    <div className="modern-stat-top">
                        <div className="modern-stat-icon yellow">
                            💰
                        </div>

                        <span className="modern-growth positive">
                            ↑ 18%
                        </span>
                    </div>

                    <h2 className="modern-stat-number">
                        PHP 0
                    </h2>

                    <p className="modern-stat-label">
                        Monthly Earnings
                    </p>

                    <div className="modern-stat-bottom">
                        Earnings this month
                    </div>

                </div>

                <div className="modern-stat-card">

                    <div className="modern-stat-top">
                        <div className="modern-stat-icon orange">
                            ⭐
                        </div>

                        <span className="modern-growth neutral">
                            New
                        </span>
                    </div>

                    <h2 className="modern-stat-number">
                        —
                    </h2>

                    <p className="modern-stat-label">
                        Average Rating
                    </p>

                    <div className="modern-stat-bottom">
                        Guest satisfaction
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT: CHART */}
        <div className="dash-right">

            <div className="chart-card-modern">
                <div className="chart-header-modern">
                    <div>
                        <p className="chart-title-modern">Monthly Earnings</p>
                        <p className="chart-sub-modern">
                            Jan – Dec {new Date().getFullYear()}
                        </p>
                    </div>

                    <div className="chart-total-modern">
                        <div className="chart-total-num-modern">PHP 0</div>
                        <div className="chart-total-label-modern">Total this year</div>
                    </div>
                </div>

                <div className="bar-chart-modern">
                    {MONTHLY_DATA.map((d, i) => {
                        const currentMonth = new Date().getMonth();
                        const maxValue = Math.max(...MONTHLY_DATA.map(d => d.value), 1);
                        const heightPct = (d.value / maxValue) * 160;

                        return (
                            <div
                                key={d.month}
                                className={`bar-col-modern ${i === currentMonth ? 'active-month' : ''}`}
                            >
                                <div
                                    className={`bar-fill-modern ${d.value > 0 ? 'has-value' : ''}`}
                                    style={{ height: `${Math.max(heightPct, 6)}px` }}
                                />
                                <span className="bar-month-modern">{d.month}</span>
                            </div>
                        );
                    })}
                </div>

            </div>

        </div>

    </div>

    {/* BOTTOM: INSIGHTS (FULL WIDTH) */}
    <div className="dash-bottom">

        <h3 className="analytics-title">Insights</h3>

        <div className="insight-row">

            <div className="insight-card">
                <p className="insight-label">Occupancy Rate</p>
                <h2 className="insight-value">82%</h2>
                <span className="insight-tag positive">↑ +5%</span>
            </div>

            <div className="insight-card">
                <p className="insight-label">Avg Stay</p>
                <h2 className="insight-value">3.4 days</h2>
                <span className="insight-tag neutral">Stable</span>
            </div>

            <div className="insight-card">
                <p className="insight-label">New Guests</p>
                <h2 className="insight-value">12</h2>
                <span className="insight-tag positive">↑ +3</span>
            </div>

        </div>

    </div>

</div>
    );
}

export default DashboardPage;