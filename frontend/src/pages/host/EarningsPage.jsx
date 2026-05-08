import styles from '../../components/shared/dashboardStyles';

function EarningsPage() {
    return (
        <div>
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>Earnings</h1>
                    <p style={styles.pageSub}>Your payout history</p>
                </div>
            </div>
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <span style={styles.statIcon}>💰</span>
                    <span style={styles.statNum}>₱0</span>
                    <span style={styles.statLabel}>This Month</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statIcon}>📈</span>
                    <span style={styles.statNum}>₱0</span>
                    <span style={styles.statLabel}>All Time</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statIcon}>⏳</span>
                    <span style={styles.statNum}>₱0</span>
                    <span style={styles.statLabel}>Pending</span>
                </div>
            </div>
            <div style={styles.emptyBox}>
                <p style={styles.emptyIcon}>📊</p>
                <p style={styles.emptyTitle}>No earnings yet</p>
                <p style={styles.emptyText}>Your earnings will show up here once you get bookings.</p>
            </div>
        </div>
    );
}

export default EarningsPage;