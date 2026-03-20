import { BrowserRouter, Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Auth from './pages/Auth';
import Listings from './pages/Listings';
import CreateListing from './pages/CreateListing';
import ListingDetail from './pages/ListingDetail';
import HostDashboard from './pages/host/Dashboard';
import api from './services/api'


function App() {
  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route path="/" element={<Listings/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Auth/>} />
        <Route path="/createlisting" element={<CreateListing/>} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/host/dashboard" element={<HostDashboard />} />
      </Routes>
    </BrowserRouter>
  );
 
}

export default App