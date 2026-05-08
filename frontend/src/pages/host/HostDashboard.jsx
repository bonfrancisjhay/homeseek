import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../components/shared/dashboardStyles';
import { useListing } from '../../hooks/useListing';
import Sidebar from '../../components/shared/Sidebar';
import DashboardPage from './DashboardPage';
import ListingsPage from './ListingsPage';
import BookingsPage from './BookingsPage';
import EarningsPage from './EarningsPage';
import SettingsPage from './SettingsPage';



function HostDashboard() {
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState('dashboard');
    const { listings, loading, handleDelete, refetch } = useListing();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!user || user.role !== 'host') { navigate('/'); return; }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        window.location.reload();
    };


    return (
        <div style={styles.shell}>

            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
                user={user}
                onLogout={handleLogout}
            />

            <main style={styles.main}>

            {activePage === 'dashboard' && (
                    <DashboardPage
                        listings={listings}
                        loading={loading}
                        onDelete={handleDelete}
                        onViewAll={() => setActivePage('listings')}
                        user={user}
                    />
                )}

            {activePage === 'listings' && (
                    <ListingsPage
                        listings={listings}
                        loading={loading}
                        onDelete={handleDelete}
                        onRefresh={refetch}
                    />
                )}

            {activePage === 'bookings' && <BookingsPage />}
            {activePage === 'earnings' && <EarningsPage />}
            {activePage === 'settings' && <SettingsPage user={user} />}

            </main>
        </div>
    );
}

export default HostDashboard;