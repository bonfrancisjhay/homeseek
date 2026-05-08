import styles from '../../components/shared/dashboardStyles';

function BookingsPage() {
    return (
        <div>
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>Bookings</h1>
                    <p style={styles.pageSub}>Manage your reservations</p>
                </div>
            </div>
            <div style={styles.emptyBox}>
                <p style={styles.emptyIcon}>📅</p>
                <p style={styles.emptyTitle}>No bookings yet</p>
                <p style={styles.emptyText}>Bookings from guests will appear here.</p>
            </div>
        </div>
    );
}

export default BookingsPage;