import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Auth from './pages/Auth';
import Listings from './pages/Listings';
import CreateListing from './pages/CreateListing';
import ListingDetail from './pages/ListingDetail';
import HostDashboard from './pages/host/HostDashboard';
import TrialBanner from './components/TrialBanner';
import SubscriptionModal from './components/SubscriptionModal'; 
import PaymentSuccess from "./pages/PaymentSuccess"; 
import PaymentFailed  from "./pages/PaymentFailed";  
import axios from 'axios';

function App() {
  const [searchFilter, setSearchFilter]       = useState('');
  const [showSubModal, setShowSubModal]       = useState(false); 
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

        // Show modal if expired
        if (sub?.status === 'expired') {
          setShowSubModal(true);
        }

      } catch (err) {
        console.error(err);
      }
    };

    checkSub();
  }, []);

  return (
    <BrowserRouter>
      <Navbar onSearch={(params) => setSearchFilter(params.location)} />
      <TrialBanner />

      {/* ✅ ADD — force subscribe modal */}
      {showSubModal && <SubscriptionModal />}

      <Routes>
        <Route
          path="/"
          element={
            token && user?.role === 'host'
              ? <Navigate to="/host/dashboard" />
              : <Listings searchFilter={searchFilter} />
          }
        />
        {/* <Route path="/login"          element={<Login />} /> */}
        <Route path="/register"       element={<Auth />} />
        <Route path="/createlisting"  element={<CreateListing />} />
        <Route path="/listings/:id"   element={<ListingDetail />} />
        <Route
          path="/host/dashboard"
          element={
            localStorage.getItem('token') &&
            JSON.parse(localStorage.getItem('user'))?.role === 'host'
              ? <HostDashboard />
              : <Navigate to="/login" />
          }
        />
        <Route path="/payment/success" element={<PaymentSuccess />} /> 
        <Route path="/payment/failed"  element={<PaymentFailed />} />  
      </Routes>
    </BrowserRouter>
  );
}

export default App;