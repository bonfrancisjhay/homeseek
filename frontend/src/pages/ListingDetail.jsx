import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import {
  Wifi, Wind, UtensilsCrossed, ParkingCircle, Waves, Dumbbell,
  Tv, WashingMachine, Shirt, PawPrint, MapPin, Medal, KeyRound,
  Star, Users, Heart, Lock, CreditCard, ChevronLeft, AlertCircle,
  IdCard, CheckCircle, Upload, Home, Check, MessageCircle 
} from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const BASE_URL = (import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000').replace(/\/$/, '');

const AMENITY_ICONS = {
  'WiFi':            <Wifi className="w-5 h-5" />,
  'Air Conditioning':<Wind className="w-5 h-5" />,
  'Kitchen':         <UtensilsCrossed className="w-5 h-5" />,
  'Parking':         <ParkingCircle className="w-5 h-5" />,
  'Pool':            <Waves className="w-5 h-5" />,
  'Gym':             <Dumbbell className="w-5 h-5" />,
  'TV':              <Tv className="w-5 h-5" />,
  'Washer':          <WashingMachine className="w-5 h-5" />,
  'Dryer':           <Shirt className="w-5 h-5" />,
  'Pet Friendly':    <PawPrint className="w-5 h-5" />,
};

const HIGHLIGHTS = [
  { icon: <Medal className="w-6 h-6 text-blue-500" />,   title: 'Superhost',      sub: 'Highly-rated and experienced host.'       },
  { icon: <MapPin className="w-6 h-6 text-blue-500" />,  title: 'Great location', sub: '95% of guests gave the location 5 stars.' },
  { icon: <KeyRound className="w-6 h-6 text-blue-500" />,title: 'Self check-in',  sub: 'Check yourself in with the smart lock.'   },
];


// ── Multi-step booking card steps ──
// 0 = dates/guests form
// 1 = upload valid ID
// 2 = review & pay
// 3 = success

export default function ListingDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [listing,      setListing]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [bookedDates,  setBookedDates]  = useState([]);
  const [form,         setForm]         = useState({ check_in: '', check_out: '', guests: 1 });
  const [step,         setStep]         = useState(0);
  const [idFile,       setIdFile]       = useState(null);
  const [idPreview,    setIdPreview]    = useState(null);
  const [idPath,       setIdPath]       = useState('');
  const [uploading,    setUploading]    = useState(false);
  const [paying,       setPaying]       = useState(false);
  const [error,        setError]        = useState('');
  const [saved,        setSaved]        = useState(false);
  const [reviews, setReviews] = useState([]);


  const token = localStorage.getItem('token');
  const today = new Date().toISOString().split('T')[0];


  const handleMessageHost = async () => {
  if (!token) { navigate('/login'); return; }
  try {
    const res = await api.post('/conversations', {
      host_id:    listing.user?.id,
      listing_id: listing.id,
    });
    // Navigate directly to the conversation (new or existing)
    navigate(`/messages/${res.data.id}`);
  } catch (err) {
    console.error('Failed to open conversation', err);
  }
};

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(res => setListing(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    api.get(`/listings/${id}/booked-dates`)
      .then(res => setBookedDates(res.data))
      .catch(console.error);
  }, [id]);
  useEffect(() => {
  api.get(`/listings/${id}/reviews`)
    .then(res => setReviews(res.data))
    .catch(console.error);
}, [id]);

  // ── helpers ──
  const rangeHasBlockedDates = (ci, co) => {
    if (!ci || !co) return false;
    const d = new Date(ci);
    const end = new Date(co);
    while (d <= end) {
      if (bookedDates.includes(d.toISOString().split('T')[0])) return true;
      d.setDate(d.getDate() + 1);
    }
    return false;
  };

  const nights     = form.check_in && form.check_out
    ? Math.max(0, Math.ceil((new Date(form.check_out) - new Date(form.check_in)) / 86400000))
    : 0;
  const subtotal   = listing ? nights * listing.price_per_night : 0;
  const serviceFee = Math.round(subtotal * 0.14);
  const grandTotal = subtotal + serviceFee;

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'check_in') {
      setForm(prev => ({
        ...prev,
        check_in:  value,
        check_out: prev.check_out && prev.check_out <= value ? '' : prev.check_out,
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Step 0 → Step 1
  const handleReserve = e => {
    e.preventDefault();
    if (!token) { navigate('/login'); return; }
    if (rangeHasBlockedDates(form.check_in, form.check_out)) {
      setError('Your selected dates include already-booked nights.');
      return;
    }
    setError('');
    setStep(1);
  };

  // Step 1: handle ID file select
  const handleIdSelect = e => {
    const file = e.target.files[0];
    if (!file) return;
    setIdFile(file);
    setIdPreview(URL.createObjectURL(file));
    setError('');
  };

  // Step 1 → Step 2: upload ID
  const handleUploadId = async () => {
    if (!idFile) { setError('Please select a valid ID image.'); return; }
    setUploading(true); setError('');
    try {
      const formData = new FormData();
      formData.append('valid_id', idFile);
      const res = await api.post('/bookings/upload-id', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIdPath(res.data.valid_id_path);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload ID. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Step 2: create PayMongo payment link and redirect
  const handlePay = async () => {
    setPaying(true); setError('');
    try {
      const res = await api.post('/bookings/pay', {
        listing_id:    id,
        check_in:      form.check_in,
        check_out:     form.check_out,
        guests:        form.guests,
        valid_id_path: idPath,
      });
      // Redirect to PayMongo checkout
      window.location.href = res.data.payment_url;
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setPaying(false);
    }
  };

  // Step indicator labels
  const STEPS = ['Dates', 'Verify ID', 'Pay'];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading listing…</p>
      </div>
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-xl font-semibold text-gray-800 mb-2">Listing not found</p>
        <button onClick={() => navigate(-1)} className="text-sm text-rose-500 underline">Go back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1120px] mx-auto px-6 py-6">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 mb-5 group transition">
          <span className="group-hover:-translate-x-0.5 transition-transform inline-block">←</span>
          Back to listings
        </button>

        {/* Title */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-[26px] font-semibold text-gray-900 leading-tight">{listing.title}</h1>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => setSaved(s => !s)} className="flex items-center gap-1.5 text-sm font-medium text-gray-700 underline px-3 py-2 rounded-xl hover:bg-gray-100 transition">
              <svg className={`w-4 h-4 transition-colors ${saved ? 'fill-rose-500 stroke-rose-500' : 'stroke-gray-700 fill-none'}`} viewBox="0 0 24 24" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-5 flex-wrap">
          <span className="font-semibold flex items-center gap-1">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2) : '—'}
        </span>
        <span className="text-gray-300">·</span>
        <span className="underline cursor-pointer font-medium">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </span>
          <span className="text-gray-300">·</span>
          <span className="underline cursor-pointer font-medium flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />{listing.location}
        </span>
        </div>

        {/* Photo Grid */}
        {listing.images && listing.images.length > 0 ? (
          <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[480px] mb-10">
            <div className="col-span-2 row-span-2 overflow-hidden group cursor-pointer">
              <img src={`${BASE_URL}${listing.images[0]}`} alt={listing.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
            </div>
            {listing.images.slice(1, 5).map((img, i) => (
              <div key={i} className="overflow-hidden group cursor-pointer relative">
                <img src={`${BASE_URL}${img}`} alt="" className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500" />
                {i === 3 && (
                  <div className="absolute inset-0 bg-black/10 flex items-end justify-end p-3">
                    <button className="bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow border border-gray-200 hover:bg-gray-50 transition">Show all photos</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-[400px] bg-gray-100 rounded-2xl flex items-center justify-center mb-10">
            <Home className="w-20 h-20 text-gray-300" />
          </div>
        )}

        {/* Content Row */}
        <div className="flex gap-16 items-start flex-wrap lg:flex-nowrap">

          {/* LEFT */}
          <div className="flex-1 min-w-[300px]">

            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Hosted by {listing.user?.name || 'Host'}</h2>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <Users className="w-4 h-4 inline" />
                  Up to {listing.max_guests} guests · Entire home
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold flex-shrink-0 shadow">
                  {listing.user?.name?.[0]?.toUpperCase() || 'H'}
                </div>
                {token && (
                  <button
                    onClick={handleMessageHost}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-50 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Message host
                  </button>
                )}
              </div>
            </div>

            <div className="py-6 border-b border-gray-200 space-y-5">
              {HIGHLIGHTS.map(h => (
                <div key={h.title} className="flex items-start gap-4">
                  <span className="text-2xl leading-none flex-shrink-0 mt-0.5">{h.icon}</span>
                  <div>
                    <p className="text-[15px] font-medium text-gray-900">{h.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{h.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="py-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About this place</h3>
              <p className="text-gray-600 text-[15px] leading-relaxed">{listing.description}</p>
            </div>

            <div className="py-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">What this place offers</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                {(listing.amenities || []).map(a => (
                  <div key={a} className="flex items-center gap-3 text-[15px] text-gray-700">
                  <span className="text-gray-500">{AMENITY_ICONS[a] || <CheckCircle className="w-5 h-5" />}</span>
                  {a}
                </div>
                ))}
              </div>
            </div>

            <div className="py-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Where you'll be</h3>
              <MapPin className="w-4 h-4 inline mr-1" />{listing.location}
              <div className="rounded-2xl overflow-hidden border border-gray-200">
                <MapContainer key={`${listing.latitude}-${listing.longitude}`} center={[listing.latitude, listing.longitude]} zoom={13} scrollWheelZoom={false} className="w-full h-72 z-0">
                  <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[listing.latitude, listing.longitude]}><Popup>{listing.title}</Popup></Marker>
                </MapContainer>
              </div>
            </div>
          </div>

          {/* RIGHT — Booking Card */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <div className="border border-blue-100 rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(59,130,246,0.15)] sticky top-24">

              {/* Blue header — always visible */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 px-6 py-5">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-white">₱{Number(listing.price_per_night).toLocaleString()}</span>
                  <span className="text-blue-200 text-sm">/ night</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="font-semibold text-white flex items-center gap-1">
                  <Star className="w-4 h-4 fill-white text-white" />
                  {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2) : 'No reviews'}
                </span>
                  {reviews.length > 0 && (
                    <>
                      <span className="text-blue-300">·</span>
                      <span className="text-blue-100">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Step indicator */}
              {step < 3 && (
                <div className="px-6 pt-4 pb-2">
                  {/* Top row: circles + lines */}
                  <div className="flex items-center">
                    {STEPS.map((label, i) => (
                      <div key={i} className="flex items-center flex-1 last:flex-none">
                        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all
                          ${i < step ? 'bg-blue-500 text-white' : i === step ? 'bg-blue-500 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-400'}`}>
                          {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`h-[2px] flex-1 mx-2 rounded-full ${i < step ? 'bg-blue-500' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Bottom row: labels */}
                  <div className="flex items-center mt-1">
                    {STEPS.map((label, i) => (
                      <div key={i} className="flex-1 last:flex-none">
                        <span className={`text-[10px] font-medium ${i === step ? 'text-blue-500' : 'text-gray-400'}`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-6 py-4">

                {/* ── STEP 0: Dates & Guests ── */}
                {step === 0 && (
                  <form onSubmit={handleReserve}>
                    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                      <div className="flex divide-x divide-gray-200">
                        <div className="flex-1 p-3 hover:bg-blue-50 transition">
                          <label className="block text-[10px] font-bold tracking-widest text-blue-500 uppercase mb-1">Check-in</label>
                          <input type="date" name="check_in" value={form.check_in} onChange={handleChange} min={today} required className="w-full text-[13px] text-gray-800 bg-transparent outline-none cursor-pointer font-medium" />
                        </div>
                        <div className="flex-1 p-3 hover:bg-blue-50 transition">
                          <label className="block text-[10px] font-bold tracking-widest text-blue-500 uppercase mb-1">Checkout</label>
                          <input type="date" name="check_out" value={form.check_out} onChange={handleChange}
                            min={form.check_in ? (() => { const d = new Date(form.check_in); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })() : today}
                            required className="w-full text-[13px] text-gray-800 bg-transparent outline-none cursor-pointer font-medium" />
                        </div>
                      </div>
                      <div className="border-t border-gray-200 p-3 hover:bg-blue-50 transition">
                        <label className="block text-[10px] font-bold tracking-widest text-blue-500 uppercase mb-1">Guests</label>
                        <input type="number" name="guests" min="1" max={listing.max_guests} value={form.guests} onChange={handleChange} className="w-full text-[13px] text-gray-800 bg-transparent outline-none font-medium" />
                      </div>
                    </div>

                    {form.check_in && form.check_out && rangeHasBlockedDates(form.check_in, form.check_out) && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
                        <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                          Your selected dates include already-booked nights.
                      </p>
                    )}

                    {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

                    <button type="submit"
                      disabled={form.check_in && form.check_out && rangeHasBlockedDates(form.check_in, form.check_out)}
                      className="w-full py-3.5 rounded-xl font-semibold text-[15px] text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                    >
                      {token ? 'Continue' : 'Log in to book'}
                    </button>

                    <p className="text-center text-xs text-gray-400 mt-3">You won't be charged yet</p>

                    {nights > 0 && (
                      <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>₱{Number(listing.price_per_night).toLocaleString()} × {nights} night{nights !== 1 ? 's' : ''}</span>
                          <span className="font-medium text-gray-800">₱{Number(subtotal).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span className="underline cursor-pointer">Service fee</span>
                          <span className="font-medium text-gray-800">₱{Number(serviceFee).toLocaleString()}</span>
                        </div>
                        <div className="pt-4 border-t border-gray-100 flex justify-between text-[15px] font-bold">
                          <span className="text-gray-900">Total</span>
                          <span className="text-blue-600">₱{Number(grandTotal).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </form>
                )}

                {/* ── STEP 1: Upload Valid ID ── */}
                {step === 1 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Upload a valid ID</h3>
                    <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                      We require a government-issued ID (passport, driver's license, national ID) to verify your identity before booking.
                    </p>

                    {/* Upload area */}
                    <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition
                      ${idPreview ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'}`}>
                      {idPreview ? (
                        <img src={idPreview} alt="ID preview" className="h-full w-full object-contain rounded-xl p-1" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <IdCard className="w-7 h-7 text-gray-400" />
                          <span className="text-xs font-medium">Click to upload ID</span>
                          <span className="text-[10px]">JPG, PNG, WEBP · Max 5MB</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleIdSelect} className="hidden" />
                    </label>

                    {idPreview && (
                      <button onClick={() => { setIdFile(null); setIdPreview(null); }} className="text-xs text-gray-400 underline mt-2 hover:text-gray-600 transition">
                        Remove and choose again
                      </button>
                    )}

                    {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mt-3">{error}</div>}

                    <div className="flex gap-2 mt-4">
                      <button onClick={() => { setStep(0); setError(''); }} className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-1.5">
                        <ChevronLeft className="w-4 h-4" /> Back
                      </button>
                      <button onClick={handleUploadId} disabled={uploading || !idFile}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        {uploading
                          ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading…</>
                          : 'Continue →'
                        }
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Review & Pay ── */}
                {step === 2 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Review & pay</h3>

                    {/* Booking summary */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 mb-4 border border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Check-in</span>
                        <span className="font-medium text-gray-800">{form.check_in}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Check-out</span>
                        <span className="font-medium text-gray-800">{form.check_out}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Guests</span>
                        <span className="font-medium text-gray-800">{form.guests} guest{form.guests > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Nights</span>
                        <span className="font-medium text-gray-800">{nights}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 flex justify-between text-sm">
                        <span className="text-gray-500">₱{Number(listing.price_per_night).toLocaleString()} × {nights} nights</span>
                        <span className="font-medium text-gray-800">₱{Number(subtotal).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 underline cursor-pointer">Service fee (14%)</span>
                        <span className="font-medium text-gray-800">₱{Number(serviceFee).toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-[15px]">
                        <span className="text-gray-900">Total</span>
                        <span className="text-blue-600">₱{Number(grandTotal).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* ID confirmed badge */}
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 mb-4">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-xs text-green-700 font-medium">Valid ID uploaded successfully</span>
                    </div>

                    {/* PayMongo badge */}
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 mb-3">
                      <Lock className="w-3 h-3" />
                      Secured by PayMongo
                    </div>

                    {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

                    <div className="flex gap-2">
                      <button onClick={() => { setStep(1); setError(''); }} className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-1.5">
                        <ChevronLeft className="w-4 h-4" /> Back
                      </button>
                      <button onClick={handlePay} disabled={paying}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        {paying
                          ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Redirecting…</>
                          : <><CreditCard className="w-4 h-4" /> Pay now</>
                        }
                      </button>
                    </div>
                  </div>
                )}
                   <p className="text-center text-xs text-gray-400 mt-4 underline cursor-pointer hover:text-gray-600 transition">
                    Report this listing
                  </p>
              </div>
            </div>
     
            
          </div>
          
        </div>

        {/* Reviews */}
        <div className="mt-10 pt-8 border-t border-gray-200">

        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
        {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2) : '—'} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
      </h3>

  {reviews.length === 0 ? (
    <p className="text-sm text-gray-400">No reviews yet.</p>
  ) : (
    <div className="grid md:grid-cols-2 gap-8">
      {reviews.map(r => (
        <div key={r.id} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm flex-shrink-0">
              {r.user?.name?.[0]?.toUpperCase() || 'G'}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{r.user?.name || 'Guest'}</p>
              <p className="text-xs text-gray-400">
                {new Date(r.created_at).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="ml-auto flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`}
              />
            ))}
          </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
        </div>
      ))}
    </div>
  )}
</div>

      </div>
    </div>
  );
}