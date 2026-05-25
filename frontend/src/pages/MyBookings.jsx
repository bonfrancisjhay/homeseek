import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import QRCode from "react-qr-code";


const BASE_URL = (import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000').replace(/\/$/, '');

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    badge: 'bg-amber-100 text-amber-700 border border-amber-200',
    dot: 'bg-amber-500',
  },
  confirmed: {
    label: 'Confirmed',
    badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-gray-100 text-gray-500 border border-gray-200',
    dot: 'bg-gray-400',
  },
  checked_in: {
  label: 'Checked In',
  badge: 'bg-blue-100 text-blue-700 border border-blue-200',
  dot: 'bg-blue-500',
},
};

export default function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    api.get('/bookings')
      .then(res => setBookings(res.data))
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;

    setCancelling(id);

    try {
      await api.patch(`/bookings/${id}/cancel`);

      setBookings(prev =>
        prev.map(b =>
          b.id === id
            ? { ...b, status: 'cancelled' }
            : b
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel booking.');
    } finally {
      setCancelling(null);
    }
  };

  const nights = (a, b) =>
    Math.max(
      0,
      Math.ceil((new Date(b) - new Date(a)) / 86400000)
    );

  const filtered =
    filter === 'all'
      ? bookings
      : bookings.filter(b => b.status === filter);

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    checked_in: bookings.filter(b => b.status === 'checked_in').length,
  };

  const formatDate = (d) => {
    if (!d) return '—';

    return new Date(d).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-gray-200 border-t-blue-500 rounded-full animate-spin" />

        <p className="mt-4 text-sm text-gray-500">
          Fetching your bookings...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">      
      
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        {/* HEADER */}


  <div className="flex items-center justify-between flex-wrap gap-5">

    <div>

      <button
        onClick={() => navigate(-1)}
        className="
          flex items-center gap-2
          px-4 py-2 mb-5
          rounded-full
          border border-gray-200
          bg-white
          text-sm text-gray-600
          hover:bg-gray-50
          transition
        "
      >
        ← Back
      </button>

  </div>

</div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { key: 'all', label: 'All' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'pending', label: 'Pending' },
            { key: 'cancelled', label: 'Cancelled' },
            { key: 'checked_in', label: 'Checked In' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`
                px-5 py-2 rounded-full text-sm font-medium transition-all
                ${
                  filter === f.key
                    ? 'bg-blue-600 text-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] shadow-blue-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              {f.label}
              <span className="ml-2 opacity-80">
                {counts[f.key]}
              </span>
            </button>
          ))}
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {filtered.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[32px] shadow-xl p-16 text-center">
            <div className="text-6xl mb-5">🧳</div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No bookings found
            </h2>

            <p className="text-gray-500 mb-6">
              {filter === 'all'
                ? 'Start exploring amazing places to stay.'
                : `No ${filter} bookings available.`}
            </p>

            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-medium shadow-[0_8px_30px_rgba(0,0,0,0.06)] shadow-blue-200 hover:scale-[1.02] transition"
            >
              Explore Listings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {filtered.map((b) => {

              const n = nights(b.check_in, b.check_out);

              const imgSrc =
                b.listing?.images?.[0]
                  ? `${BASE_URL}${b.listing.images[0]}`
                  : null;

              const isPast =
                new Date(b.check_out) < new Date();

              const canCancel =
                b.status === 'pending' && !isPast;

              const cfg =
                STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;

              return (
                <div
  key={b.id}
  className="
    bg-white
    border border-gray-200
    rounded-2xl
    overflow-hidden
    shadow-[0_4px_20px_rgba(0,0,0,0.05)]
    hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]
    transition-all
    duration-300
    hover:-translate-y-1
    flex
    flex-col
  "
>

  {/* IMAGE */}
  <div
    onClick={() => navigate(`/listings/${b.listing_id}`)}
    className="relative h-52 cursor-pointer overflow-hidden"
  >
    {imgSrc ? (
      <img
        src={imgSrc}
        alt={b.listing?.title}
        className="
          w-full h-full object-cover
          transition duration-500
          hover:scale-105
        "
      />
    ) : (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-5xl">
        🏠
      </div>
    )}

    {/* STATUS */}
    <div className="absolute top-3 right-3">
      <div
        className={`
          px-3 py-1 rounded-full text-[11px]
          font-semibold backdrop-blur-sm
          ${cfg.badge}
        `}
      >
        {cfg.label}
      </div>
    </div>
  </div>

  {/* CONTENT */}
  <div className="p-5 flex flex-col flex-1">

    {/* TITLE */}
    <div className="mb-4">
      <h2
        onClick={() => navigate(`/listings/${b.listing_id}`)}
        className="
          text-lg font-bold text-gray-900
          cursor-pointer hover:text-blue-600
          transition line-clamp-1
        "
      >
        {b.listing?.title || 'Listing'}
      </h2>

      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
        📍 {b.listing?.location || 'Unknown location'}
      </p>
    </div>

    {/* DETAILS */}
    <div className="space-y-3 mb-5">

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Check-in</span>
        <span className="font-semibold text-gray-800">
          {formatDate(b.check_in)}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Check-out</span>
        <span className="font-semibold text-gray-800">
          {formatDate(b.check_out)}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Guests</span>
        <span className="font-semibold text-gray-800">
          {b.guests ?? 1}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Nights</span>
        <span className="font-semibold text-gray-800">
          {n}
        </span>
      </div>

    </div>

    {/* PRICE */}
    <div className="mt-auto pt-4 border-t border-gray-100">

      <div className="mb-4">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
          Total Paid
        </p>

        <h3 className="text-2xl font-black text-gray-900">
          ₱{Number(b.total_price).toLocaleString()}
        </h3>
      </div>

      {/* QR CODE - only show for confirmed bookings */}
{b.status === 'confirmed' && b.qr_token && (
  <div className="mb-4 flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
    <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
      Check-in QR Code
    </p>
    <QRCode value={b.qr_token} size={110} />
    <p className="text-xs text-gray-400 mt-3 text-center">
      Show this to your host upon arrival
    </p>
  </div>
)}

      {/* BUTTONS */}
      <div className="flex flex-col gap-2">

        <button
          onClick={() => navigate(`/listings/${b.listing_id}`)}
          className="
            w-full py-3 rounded-xl
            bg-blue-600 hover:bg-blue-700
            text-white text-sm font-semibold
            transition
          "
        >
          View Listing
        </button>

        {canCancel && (
          <button
            onClick={() => handleCancel(b.id)}
            disabled={cancelling === b.id}
            className="
              w-full py-3 rounded-xl
              border border-red-200
              text-red-500
              hover:bg-red-50
              text-sm font-semibold
              transition
            "
          >
            {cancelling === b.id
              ? 'Cancelling...'
              : 'Cancel Booking'}
          </button>
        )}

      </div>

    </div>

  </div>

</div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}