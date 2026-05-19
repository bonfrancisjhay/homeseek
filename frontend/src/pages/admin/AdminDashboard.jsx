import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../components/shared/dashboardStyles';
import AdminSidebar from './AdminSidebar';
import AdminDashboardPage from './AdminDashboardPage';
// import AdminUsersPage from './AdminUsersPage';
// import AdminListingsPage from './AdminListingsPage';
// import AdminBookingsPage from './AdminBookingsPage';
// import AdminSettingsPage from './AdminSettingsPage';
import api from '../../services/api';

function AdminDashboard() {
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user || user.role !== 'admin') { navigate('/'); return; }
        api.get('/admin/stats')
            .then(res => setStats(res.data))
            .catch(console.error)
            .finally(() => setStatsLoading(false));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        window.location.reload();
    };

    return (
        <div style={styles.shell}>
            <AdminSidebar
                activePage={activePage}
                setActivePage={setActivePage}
                user={user}
                onLogout={handleLogout}
            />
            <main style={styles.main}>
                {activePage === 'dashboard' && <AdminDashboardPage stats={stats} loading={statsLoading} />}
                {/* {activePage === 'users'     && <AdminUsersPage />}
                {activePage === 'listings'  && <AdminListingsPage />}
                {activePage === 'bookings'  && <AdminBookingsPage />}
                {activePage === 'settings'  && <AdminSettingsPage user={user} />} */}
            </main>
        </div>
    );
}

export default AdminDashboard;