import styles from '../../components/shared/dashboardStyles';

function SettingsPage({ user }) {
    return (
        <div>
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>Settings</h1>
                    <p style={styles.pageSub}>Manage your account</p>
                </div>
            </div>
            <div style={styles.settingsCard}>
                <div style={styles.settingsRow}>
                    <div>
                        <p style={styles.settingsLabel}>Full name</p>
                        <p style={styles.settingsValue}>{user?.name}</p>
                    </div>
                    <button style={styles.editBtn}>Edit</button>
                </div>
                <div style={styles.dividerLine} />
                <div style={styles.settingsRow}>
                    <div>
                        <p style={styles.settingsLabel}>Email</p>
                        <p style={styles.settingsValue}>{user?.email || '—'}</p>
                    </div>
                    <button style={styles.editBtn}>Edit</button>
                </div>
                <div style={styles.dividerLine} />
                <div style={styles.settingsRow}>
                    <div>
                        <p style={styles.settingsLabel}>Role</p>
                        <p style={styles.settingsValue}>Host</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;