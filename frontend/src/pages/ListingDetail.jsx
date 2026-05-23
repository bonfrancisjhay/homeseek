import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const BASE_URL = (import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000').replace(/\/$/, '');

const AMENITY_ICONS = {
  'WiFi':              '📶',
  'Air Conditioning':  '❄️',
  'Kitchen':           '🍳',
  'Parking':           '🅿️',
  'Pool':              '🏊',
  'Gym':               '🏋️',
  'TV':                '📺',
  'Washer':            '🫧',
  'Dryer':             '🌀',
  'Pet Friendly':      '🐾',
};

const HIGHLIGHTS = [
  { icon: '🏅', title: 'Superhost',      sub: 'Highly-rated and experienced host.'          },
  { icon: '📍', title: 'Great location', sub: '95% of guests gave the location 5 stars.'    },
  { icon: '🔑', title: 'Self check-in',  sub: 'Check yourself in with the smart lock.'      },
];

export default function ListingDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [listing, setListing]  = useState(null);
  const [loading, setLoading]  = useState(true);
  const [form, setForm] = useState({ check_in: '', check_out: '', guests: 1 });
  const [error,   setError]    = useState('');
  const [success, setSuccess]  = useState(false);
  const [booking, setBooking]  = useState(false);
  const [saved,   setSaved]    = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(res => setListing(res.data))
      
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);
  console.log(listing);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleBooking = async e => {
    e.preventDefault();
    if (!token) { navigate('/login'); return; }
    setBooking(true); setError('');
    try {
      await api.post('/bookings', {
        listing_id: id,
        check_in:   form.check_in,
        check_out:  form.check_out,
        guests:     form.guests,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const nights     = form.check_in && form.check_out
    ? Math.max(0, Math.ceil((new Date(form.check_out) - new Date(form.check_in)) / 86400000))
    : 0;
  const subtotal   = listing ? nights * listing.price_per_night : 0;
  const serviceFee = Math.round(subtotal * 0.14);
  const grandTotal = subtotal + serviceFee;
  const today      = new Date().toISOString().split('T')[0];

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
        <p className="text-5xl mb-4">🏠</p>
        <p className="text-xl font-semibold text-gray-800 mb-2">Listing not found</p>
        <button onClick={() => navigate(-1)} className="text-sm text-rose-500 underline">Go back</button>
      </div>
    </div>
  );

//   /* Build photo array from listing photo */
//   const photos = listing.images || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1120px] mx-auto px-6 py-6">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 mb-5 group transition"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform inline-block">←</span>
          Back to listings
        </button>

        {/* Title */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-[26px] font-semibold text-gray-900 leading-tight">
            {listing.title}
          </h1>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setSaved(s => !s)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 underline px-3 py-2 rounded-xl hover:bg-gray-100 transition"
            >
              <svg
                className={`w-4 h-4 transition-colors ${saved ? 'fill-rose-500 stroke-rose-500' : 'stroke-gray-700 fill-none'}`}
                viewBox="0 0 24 24" strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              {saved ? 'Saved' : 'Save'}
            </button>
            <button className="flex items-center gap-1.5 text-sm font-medium text-gray-700 underline px-3 py-2 rounded-xl hover:bg-gray-100 transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-5 flex-wrap">
          <span className="font-semibold">★ 4.92</span>
          <span className="text-gray-300">·</span>
          <span className="underline cursor-pointer font-medium">28 reviews</span>
          <span className="text-gray-300">·</span>
          <span className="underline cursor-pointer font-medium">📍 {listing.location}</span>
        </div>

        {/* Photo Grid */}
{listing.images && listing.images.length > 0 ? (
  <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[480px] mb-10">

    {/* Main Large Image */}
    <div className="col-span-2 row-span-2 overflow-hidden group cursor-pointer">
      <img
        src={`${BASE_URL}${listing.images[0]}`}
        alt={listing.title}
        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
      />
    </div>

    {/* Small Images */}
    {listing.images.slice(1, 5).map((img, i) => (
      <div
        key={i}
        className="overflow-hidden group cursor-pointer relative"
      >
        <img
          src={`${BASE_URL}${img}`}
          alt=""
          className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
        />

        {i === 3 && (
          <div className="absolute inset-0 bg-black/10 flex items-end justify-end p-3">
            <button className="bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow border border-gray-200 hover:bg-gray-50 transition">
              Show all photos
            </button>
          </div>
        )}
      </div>
    ))}
  </div>
) : (
  <div className="w-full h-[400px] bg-gray-100 rounded-2xl flex items-center justify-center mb-10">
    <span className="text-7xl">🏠</span>
  </div>
)}

        {/* Content Row */}
        <div className="flex gap-16 items-start flex-wrap lg:flex-nowrap">

          {/* LEFT */}
          <div className="flex-1 min-w-[300px]">

            {/* Host row */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Hosted by {listing.user?.name || 'Host'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  👥 Up to {listing.max_guests} guests · Entire home
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold flex-shrink-0 shadow">
                {listing.user?.name?.[0]?.toUpperCase() || 'H'}
              </div>
            </div>

            {/* Highlights */}
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

            {/* Description */}
            <div className="py-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About this place</h3>
              <p className="text-gray-600 text-[15px] leading-relaxed">{listing.description}</p>
            </div>

            {/* Amenities */}
            <div className="py-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">What this place offers</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                {(listing.amenities || []).map(a => (
                <div key={a} className="flex items-center gap-3 text-[15px] text-gray-700">
                    <span className="text-xl">{AMENITY_ICONS[a] || '✔️'}</span>
                    {a}
                </div>
                ))}
            </div>
            {(listing.amenities || []).length > 6 && (
                <button className="mt-6 px-5 py-2.5 border border-gray-800 rounded-xl text-sm font-semibold text-gray-900 hover:bg-gray-50 transition">
                Show all amenities
                </button>
            )}
            </div>

            {/* Map */}
            <div className="py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Where you'll be
            </h3>

            <p className="text-sm text-gray-500 mb-4">
                📍 {listing.location}
            </p>

            <div className="rounded-2xl overflow-hidden border border-gray-200">
                <MapContainer
            key={`${listing.latitude}-${listing.longitude}`}
            center={[listing.latitude, listing.longitude]}
            zoom={13}
            scrollWheelZoom={false}
            className="w-full h-72 z-0"
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[listing.latitude, listing.longitude]}>
                    <Popup>
                    {listing.title}
                    </Popup>
                </Marker>
                </MapContainer>
            </div>
            </div>

          </div>

          {/* RIGHT — Booking Card */}
<div className="w-full lg:w-[380px] flex-shrink-0">
  <div className="border border-blue-100 rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(59,130,246,0.15)] sticky top-24">

    {success ? (
      <div className="text-center py-10 px-6">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🎉</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">You're booked!</h3>
        <p className="text-gray-400 text-sm mb-6">Check your email for confirmation details.</p>
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition"
        >
          Back to home
        </button>
      </div>
    ) : (
      <>
        {/* Blue gradient header */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 px-6 py-5">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-bold text-white">
              ₱{Number(listing.price_per_night).toLocaleString()}
            </span>
            <span className="text-blue-200 text-sm">/ night</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-semibold text-white">★ 4.92</span>
            <span className="text-blue-300">·</span>
            <span className="text-blue-100 underline cursor-pointer">28 reviews</span>
          </div>
        </div>

        {/* Form body */}
        <div className="px-6 py-5">
          <form onSubmit={handleBooking}>

            {/* Date + Guests box */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <div className="flex divide-x divide-gray-200">
                <div className="flex-1 p-3 hover:bg-blue-50 transition">
                  <label className="block text-[10px] font-bold tracking-widest text-blue-500 uppercase mb-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    name="check_in"
                    value={form.check_in}
                    onChange={handleChange}
                    min={today}
                    required
                    className="w-full text-[13px] text-gray-800 bg-transparent outline-none cursor-pointer font-medium"
                  />
                </div>
                <div className="flex-1 p-3 hover:bg-blue-50 transition">
                  <label className="block text-[10px] font-bold tracking-widest text-blue-500 uppercase mb-1">
                    Checkout
                  </label>
                  <input
                    type="date"
                    name="check_out"
                    value={form.check_out}
                    onChange={handleChange}
                    min={form.check_in || today}
                    required
                    className="w-full text-[13px] text-gray-800 bg-transparent outline-none cursor-pointer font-medium"
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 p-3 hover:bg-blue-50 transition">
                <label className="block text-[10px] font-bold tracking-widest text-blue-500 uppercase mb-1">
                    Guests
                </label>
                <input
                    type="number"
                    name="guests"
                    min="1"
                    max={listing.max_guests}
                    value={form.guests}
                    onChange={handleChange}
                    placeholder={`Max ${listing.max_guests}`}
                    className="w-full text-[13px] text-gray-800 bg-transparent outline-none font-medium"
                />
                </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={booking}
              className="w-full py-3.5 rounded-xl font-semibold text-[15px] text-white
                bg-gradient-to-r from-blue-500 to-blue-600
                hover:from-blue-600 hover:to-blue-700
                disabled:opacity-60 disabled:cursor-not-allowed
                shadow-md hover:shadow-lg transition-all"
            >
              {booking ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Booking…
                </span>
              ) : token ? 'Reserve' : 'Log in to book'}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              You won't be charged yet
            </p>

            {/* Price breakdown */}
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
        </div>
      </>
    )}
  </div>

  <p className="text-center text-xs text-gray-400 mt-4 underline cursor-pointer hover:text-gray-600 transition">
    Report this listing
  </p>
</div>

        </div>

        {/* Reviews */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">★ 4.92 · 28 reviews</h3>

          {/* Rating bars */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[
              ['Cleanliness', 5.0],
              ['Accuracy',    4.9],
              ['Communication', 4.8],
              ['Location',    5.0],
              ['Check-in',    5.0],
              ['Value',       4.7],
            ].map(([cat, score]) => (
              <div key={cat} className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-700 whitespace-nowrap">{cat}</span>
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full"
                      style={{ width: `${score * 20}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-6">{score.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sample reviews */}
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { name: 'Maria S.', date: 'April 2025', text: 'Absolutely stunning property! The location was perfect and the host was so welcoming. Would definitely come back.' },
              { name: 'James L.', date: 'March 2025', text: 'Everything was exactly as described. Clean, beautiful views, and very comfortable. Highly recommend!' },
            ].map(r => (
              <div key={r.name} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm flex-shrink-0">
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.date}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}