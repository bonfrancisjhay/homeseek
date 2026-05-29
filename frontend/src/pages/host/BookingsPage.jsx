import { useEffect, useState, useRef } from 'react';
import { CalendarDays, Users, BadgeDollarSign, Clock, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import jsQR from 'jsqr';


const BASE_URL = (import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000').replace(/\/$/, '');

const BLUE        = '#3b82f6';
const BLUE_LIGHT  = '#eff6ff';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   pill: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-400'  },
  confirmed: { label: 'Confirmed', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  cancelled: { label: 'Cancelled', pill: 'bg-gray-100 text-gray-400 border-gray-200',    dot: 'bg-gray-300'   },
  checked_in: {
  label: 'Checked In',
  pill: 'bg-blue-50 text-blue-700 border-blue-200',
  dot: 'bg-blue-400'
  },
  checked_out: {
      label: 'Checked Out',
      pill: 'bg-purple-50 text-purple-700 border-purple-200',
      dot: 'bg-purple-400'
  },
};

const FILTERS = [
  { key: 'all',       label: 'All'       },
  { key: 'pending',   label: 'Pending'   },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'checked_in', label: 'Checked In' },
  { key: 'checked_out', label: 'Checked Out' },
  { key: 'cancelled', label: 'Cancelled' },
];

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const nights = (a, b) =>
  Math.max(0, Math.ceil((new Date(b) - new Date(a)) / 86400000));

function QRScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const rafRef = useRef(null);

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // use back camera
        });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scan();
      } catch (e) {
        alert('Camera access denied or unavailable.');
        onClose();
      }
    };

    const scan = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          onScan(code.data);
          return;
        }
      }
      rafRef.current = requestAnimationFrame(scan);
    };

    startCamera();

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-5 w-80 shadow-xl">
        <p className="text-sm font-semibold text-gray-700 mb-3 text-center">Scan Guest QR Code</p>
        <video ref={videoRef} className="w-full rounded-xl" playsInline muted />
        <p className="text-xs text-gray-400 text-center mt-2">Point camera at guest's QR code</p>
        <button onClick={onClose} className="mt-4 w-full py-2 rounded-xl border border-blue-200 text-blue-500 text-sm hover:bg-blue-50 transition">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const [bookings,  setBookings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all');
  const [updating,  setUpdating]  = useState(null);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');
  const [expanded,  setExpanded]  = useState(null);
  const [scanning, setScanning] = useState(false);


  const handleCheckIn = async (qrToken) => {
  try {
    const res = await api.post('/bookings/check-in', {
      qr_token: qrToken
    });

    alert(res.data.message);

    // update UI instantly
    setBookings(prev =>
      prev.map(b =>
        b.qr_token === qrToken
          ? { ...b, status: 'checked_in', checked_in_at: new Date().toISOString() }
          : b
      )
    );

  } catch (err) {
    alert(err.response?.data?.message || 'Check-in failed');
  }
};

  useEffect(() => {
    api.get('/host/bookings')
      .then(res => setBookings(res.data))
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id, status) => {
    setUpdating(id + status);
    try {
      await api.patch(`/host/bookings/${id}/status`, { status });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update booking.');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = bookings
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        b.listing?.title?.toLowerCase().includes(q) ||
        b.user?.name?.toLowerCase().includes(q) ||
        b.listing?.location?.toLowerCase().includes(q)
      );
    });

  const counts = {
    all:       bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    checked_in: bookings.filter(b => b.status === 'checked_in').length,
    checked_out: bookings.filter(b => b.status === 'checked_out').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  const totalRevenue = bookings
  .filter(b => b.status === 'confirmed' || b.status === 'checked_in')
  .reduce((sum, b) => sum + Number(b.total_price), 0);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading bookings…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-5 font-sans">

      {/* ── HERO HEADER — matches DashboardPage hero style ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-light text-gray-800" style={{ fontFamily: "'Fraunces', serif" }}>
            Bookings
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Review and manage reservation requests from your guests
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl outline-none w-52 focus:border-blue-400 bg-gray-50 text-gray-700 placeholder-gray-400 transition"
            placeholder="Search guest, listing…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── STAT CARDS — same pattern as DashboardPage ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label:   'Total Bookings',
            value:   counts.all,
            icon:    <CalendarDays size={17} color={BLUE} strokeWidth={1.75} />,
            iconBg:  BLUE_LIGHT,
            badge:   'Total',
            badgeCls:'bg-gray-100 text-gray-500',
          },
          {
            label:   'Pending Review',
            value:   counts.pending,
            icon:    <Clock size={17} color="#d97706" strokeWidth={1.75} />,
            iconBg:  '#fffbeb',
            badge:   'Awaiting',
            badgeCls:'bg-amber-50 text-amber-600',
          },
          {
            label:   'Confirmed',
            value:   counts.confirmed,
            icon:    <CheckCircle size={17} color="#16a34a" strokeWidth={1.75} />,
            iconBg:  '#f0fdf4',
            badge:   'Active',
            badgeCls:'bg-emerald-50 text-emerald-700',
          },
          {
            label:   'Confirmed Revenue',
            value:   `₱${totalRevenue.toLocaleString()}`,
            icon:    <BadgeDollarSign size={17} color={BLUE} strokeWidth={1.75} />,
            iconBg:  BLUE_LIGHT,
            badge:   'Earned',
            badgeCls:'bg-emerald-50 text-emerald-700',
          },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: s.iconBg }}>
              {s.icon}
            </div>
            <span className={`absolute top-4 right-4 text-[10px] font-medium px-2.5 py-1 rounded-full ${s.badgeCls}`}>
              {s.badge}
            </span>
            <p className="text-2xl font-light text-gray-800" style={{ fontFamily: "'Fraunces', serif" }}>
              {s.value}
            </p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── FILTER PILLS ── */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border transition-all
              ${filter === f.key
                ? 'bg-blue-50 border-blue-300 text-blue-600 font-semibold'
                : 'bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500'
              }`}
          >
            {f.label}
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
              ${filter === f.key ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}`}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* ── BOOKING LIST ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-base font-light text-gray-700" style={{ fontFamily: "'Fraunces', serif" }}>
            No bookings found
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {filter === 'all' ? 'Guest bookings will appear here.' : `No ${filter} bookings right now.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((b, idx) => {
            const cfg        = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
            const n          = nights(b.check_in, b.check_out);
            const imgSrc     = b.listing?.images?.[0] ? `${BASE_URL}${b.listing.images[0]}` : null;
            const isPending  = b.status === 'pending';
            const isExpanded = expanded === b.id;
            const initial    = b.user?.name?.[0]?.toUpperCase() || 'G';

            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow
                  ${b.status === 'cancelled' ? 'opacity-60' : ''}`}
              >
                {/* ── MAIN ROW ── */}
                <div className="flex items-center gap-4 px-5 py-4 flex-wrap">

                  {/* Listing image */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-blue-50 flex items-center justify-center text-xl">
                    {imgSrc
                      ? <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                      : '🏠'
                    }
                  </div>

                  {/* Listing title + location */}
                  <div className="flex-1 min-w-[130px]">
                    <p className="text-sm font-medium text-gray-800 truncate leading-snug">
                      {b.listing?.title || 'Listing'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                        <circle cx="12" cy="9" r="2.5"/>
                      </svg>
                      {b.listing?.location || '—'}
                    </p>
                  </div>

                  {/* Guest */}
                  <div className="flex items-center gap-2.5 min-w-[120px]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                      style={{ background: BLUE_LIGHT, color: BLUE }}>
                      {initial}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 leading-none">{b.user?.name || 'Guest'}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <Users size={9} strokeWidth={2} />
                        {b.guests ?? 1} guest{(b.guests ?? 1) > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="min-w-[150px]">
                    <p className="text-xs font-medium text-gray-600 flex items-center gap-1">
                      <CalendarDays size={10} strokeWidth={2} color="#9ca3af" />
                      {formatDate(b.check_in)} → {formatDate(b.check_out)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 ml-3.5">{n} night{n !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Price */}
                  <div className="min-w-[80px] text-right">
                    <p className="text-lg font-light text-gray-800" style={{ fontFamily: "'Fraunces', serif" }}>
                      ₱{Number(b.total_price).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400">total</p>
                  </div>

                  {/* Status badge */}
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${cfg.pill}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    {cfg.label}
                  </span>

                  {/* Actions */}
<div className="flex items-center gap-2 flex-shrink-0">

  {/* Pending actions */}
  {b.status === 'pending' && (
    <>
      <button
        disabled={!!updating}
        onClick={() => handleStatus(b.id, 'confirmed')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Confirm
      </button>

      <button
        disabled={!!updating}
        onClick={() => handleStatus(b.id, 'cancelled')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border bg-red-50 border-red-200 text-red-600 hover:bg-red-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Reject
      </button>
    </>
  )}

  {/* Check-in button (ONLY confirmed) */}
  {b.status === 'confirmed' && (
  <button
    onClick={() => {
      console.log('qr_token:', b.qr_token); // ← add this
      setScanning(b.qr_token);
    }}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition"
  >
    Scan QR
  </button>
)}

  {/* Expand */}
  <button
    onClick={() => setExpanded(isExpanded ? null : b.id)}
    className="text-gray-300 hover:text-blue-400 transition p-1.5 rounded-lg hover:bg-blue-50"
  >
    <ChevronDown
      size={15}
      strokeWidth={2}
      className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
    />
  </button>

</div>
</div>

                {/* ── EXPANDED DETAIL PANEL ── */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Booking ID',  value: `#${b.id}`                                  },
                      { label: 'Check-in',    value: formatDate(b.check_in)                       },
                      { label: 'Check-out',   value: formatDate(b.check_out)                      },
                      { label: 'Nights',      value: `${n} night${n !== 1 ? 's' : ''}`            },
                      { label: 'Guests',      value: b.guests ?? 1                                },
                      { label: 'Total Price', value: `₱${Number(b.total_price).toLocaleString()}` },
                      { label: 'Guest Email', value: b.user?.email || '—'                         },
                      { label: 'Booked On',   value: formatDate(b.created_at)                     },
                    ].map(chip => (
                      <div key={chip.label} className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                          {chip.label}
                        </span>
                        <span className="text-sm font-light text-gray-700" style={{ fontFamily: "'Fraunces', serif" }}>
                          {chip.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {scanning && (
  <QRScanner
    onScan={(token) => {
      setScanning(false);
      handleCheckIn(token);
    }}
    onClose={() => setScanning(false)}
  />
)}
    </div>
  );
}