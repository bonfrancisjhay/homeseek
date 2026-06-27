import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Auth from './pages/Auth';
import Listings from './pages/Listings';
import CreateListing from './pages/CreateListing';
import ListingDetail from './pages/ListingDetail';
import MyBookings from './pages/MyBookings'; // adjust path if needed
import HostDashboard from './pages/host/HostDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import TrialBanner from './components/TrialBanner';
import SubscriptionModal from './components/SubscriptionModal'; 
import PaymentSuccess from "./pages/PaymentSuccess"; 
import PaymentFailed  from "./pages/PaymentFailed";  
import MessagesPage from './pages/MessagesPage';
import { subscriptionEvents } from './utils/subscriptionEvents';
import axios from 'axios';


const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    return children;
};

function App() {
  const [searchFilter, setSearchFilter] = useState({});
  const [showSubModal, setShowSubModal]       = useState(false); 
  const [subModalData, setSubModalData] = useState(null); // ADD THIS LINE
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
 
  useEffect(() => {
    const checkSub = async () => {
      const token = localStorage.getItem('token');
      const user  = JSON.parse(localStorage.getItem('user'));

      if (!token || user?.role !== 'host') return;

      try {
        const res = await axios.get('http://127.0.0.1:8000/api/subscription/status', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const sub = res.data.subscription;

        if (sub?.status === 'expired') {
          setShowSubModal(true);
        }

      } catch (err) {
        console.error(err);
      }
    };

    checkSub();
  }, []);

  useEffect(() => {
    const unsubscribe = subscriptionEvents.on((data) => {
      setSubModalData(data);
      setShowSubModal(true);
    });
    return unsubscribe;
  }, []);

  return (
    
    <BrowserRouter>
      <Navbar onSearch={(params) => setSearchFilter(params)} />
      <TrialBanner />
      {showSubModal && (
        <SubscriptionModal
          message={subModalData?.message}
          trialEndsAt={subModalData?.trial_ends_at}
          onClose={() => setShowSubModal(false)}
        />
      )}
      <Routes>
        <Route
          path="/"
          element={
            token && user?.role === 'host'
              ? <Navigate to="/host/dashboard" />
              : token && user?.role === 'admin'
              ? <Navigate to="/admin" />       
              : <Listings searchFilter={searchFilter} />
          }
        />
        <Route path="/register"       element={<Auth />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/messages/:conversationId" element={<MessagesPage />} /> 
        <Route path="/createlisting"  element={<CreateListing />} />
        <Route path="/listings/:id"   element={<ListingDetail />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route
          path="/host/dashboard"
          element={
            localStorage.getItem('token') &&
            JSON.parse(localStorage.getItem('user'))?.role === 'host'
              ? <HostDashboard />
              : <Navigate to="/login" />
          }
        />
         <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="/payment/success" element={<PaymentSuccess />} /> 
        <Route path="/payment/failed"  element={<PaymentFailed />} />  
      </Routes>
    </BrowserRouter>
  );
}

export default App;