import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, CalendarDays, BadgeDollarSign, Star,
  TrendingUp, Clock, Users, AlertCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import api from '../../services/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const BLUE       = '#3b82f6';
const BLUE_LIGHT = '#eff6ff';

const nights = (a, b) =>
  Math.max(0, Math.ceil((new Date(b) - new Date(a)) / 86400000));

export default function DashboardPage({ user }) {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/host/listings'),
      api.get('/host/bookings'),
    ])
      .then(([lRes, bRes]) => {
        setListings(lRes.data);
        setBookings(bRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Derived analytics ──────────────────────────────────────────────

  const currentMonth = new Date().getMonth();
  const currentYear  = new Date().getFullYear();

  // Pipeline counts
  const pending     = bookings.filter(b => b.status === 'pending').length;
  const confirmed   = bookings.filter(b => b.status === 'confirmed').length;
  const checkedIn   = bookings.filter(b => b.status === 'checked_in').length;
  const checkedOut  = bookings.filter(b => b.status === 'checked_out').length;
  const cancelled   = bookings.filter(b => b.status === 'cancelled').length;
  const total       = bookings.length;

  // Revenue — confirmed + checked_in + checked_out
  const revenueBookings = bookings.filter(b =>
    ['confirmed', 'checked_in', 'checked_out'].includes(b.status)
  );
  const totalRevenue = revenueBookings.reduce((s, b) => s + Number(b.total_price), 0);

  // Monthly earnings chart (current year, revenue bookings by created_at month)
  const monthlyEarnings = Array(12).fill(0);
  revenueBookings.forEach(b => {
    const d = new Date(b.created_at);
    if (d.getFullYear() === currentYear) {
      monthlyEarnings[d.getMonth()] += Number(b.total_price);
    }
  });

  const chartData = MONTHS.map((month, i) => ({ month, earnings: monthlyEarnings[i] }));

  // This month's earnings
  const thisMonthEarnings = monthlyEarnings[currentMonth];

  // Avg stay (nights) across all non-cancelled bookings
  const stayableBookings = bookings.filter(b => b.status !== 'cancelled');
  const avgStay = stayableBookings.length
    ? (stayableBookings.reduce((s, b) => s + nights(b.check_in, b.check_out), 0) / stayableBookings.length).toFixed(1)
    : '—';

  // Avg rating from reviews embedded on bookings
  const reviews = bookings.flatMap(b => b.review ? [b.review] : []);
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1)
    : '—';

  // Occupancy rate = (confirmed + checked_in + checked_out) / total (exclude cancelled)
  const occupancyBase = total - cancelled;
  const occupancyPct = occupancyBase > 0
    ? Math.round(((confirmed + checkedIn + checkedOut) / occupancyBase) * 100)
    : 0;

  // New guests this month (unique user_ids from bookings created this month)
  const thisMonthBookings = bookings.filter(b => {
    const d = new Date(b.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const newGuestsThisMonth = new Set(thisMonthBookings.map(b => b.user?.id)).size;

  // Last month new guests (for trend)
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthBookings = bookings.filter(b => {
    const d = new Date(b.created_at);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });
  const lastMonthGuests = new Set(lastMonthBookings.map(b => b.user?.id)).size;
  const guestDiff = newGuestsThisMonth - lastMonthGuests;

  // Pipeline steps
  const pipelineSteps = [
    { label: 'Pending',     count: pending,   color: '#f59e0b', pct: total > 0 ? Math.round((pending   / total) * 100) : 0 },
    { label: 'Confirmed',   count: confirmed, color: '#22c55e', pct: total > 0 ? Math.round((confirmed / total) * 100) : 0 },
    { label: 'Checked In',  count: checkedIn, color: BLUE,      pct: total > 0 ? Math.round((checkedIn / total) * 100) : 0 },
    { label: 'Checked Out', count: checkedOut,color: '#a78bfa', pct: total > 0 ? Math.round((checkedOut/ total) * 100) : 0 },
    { label: 'Cancelled',   count: cancelled, color: '#d1d5db', pct: total > 0 ? Math.round((cancelled / total) * 100) : 0 },
  ];

  // Stat cards
  const stats = [
    {
      label:    'Total Listings',
      value:    listings.length,
      icon:     <Home size={17} color={BLUE} strokeWidth={1.75} />,
      badge:    'Total',
      badgeCls: 'bg-gray-100 text-gray-500',
      iconBg:   BLUE_LIGHT,
    },
    {
      label:    'Total Bookings',
      value:    total,
      icon:     <CalendarDays size={17} color="#16a34a" strokeWidth={1.75} />,
      badge:    'All time',
      badgeCls: 'bg-emerald-50 text-emerald-700',
      iconBg:   '#f0fdf4',
    },
    {
      label:    'Total Revenue',
      value:    `₱${totalRevenue.toLocaleString()}`,
      icon:     <BadgeDollarSign size={17} color={BLUE} strokeWidth={1.75} />,
      badge:    'Earned',
      badgeCls: 'bg-emerald-50 text-emerald-700',
      iconBg:   BLUE_LIGHT,
    },
    {
      label:    'Average Rating',
      value:    avgRating === '—' ? '—' : `${avgRating} ★`,
      icon:     <Star size={17} color="#ca8a04" strokeWidth={1.75} />,
      badge:    `${reviews.length} review${reviews.length !== 1 ? 's' : ''}`,
      badgeCls: 'bg-gray-100 text-gray-500',
      iconBg:   '#fefce8',
    },
  ];

  // Insight rows
  const insights = [
    {
      label:    'Occupancy Rate',
      value:    `${occupancyPct}%`,
      icon:     <TrendingUp size={15} color={BLUE} strokeWidth={1.75} />,
      tag:      occupancyPct >= 50 ? `↑ ${occupancyPct}% of active bookings` : `${occupancyPct}% of active bookings`,
      tagColor: occupancyPct >= 50 ? 'text-emerald-600' : 'text-amber-600',
      progress: occupancyPct,
      bar:      BLUE,
    },
    {
      label:    'Avg Stay',
      value:    avgStay === '—' ? '—' : `${avgStay} nights`,
      icon:     <Clock size={15} color="#9ca3af" strokeWidth={1.75} />,
      tag:      stayableBookings.length > 0 ? `Across ${stayableBookings.length} bookings` : 'No data yet',
      tagColor: 'text-gray-400',
      progress: avgStay === '—' ? 0 : Math.min(Math.round((parseFloat(avgStay) / 14) * 100), 100),
      bar:      '#9ca3af',
    },
    {
      label:    'New Guests This Month',
      value:    String(newGuestsThisMonth),
      icon:     <Users size={15} color="#16a34a" strokeWidth={1.75} />,
      tag:      guestDiff > 0
                  ? `↑ +${guestDiff} from last month`
                  : guestDiff < 0
                  ? `↓ ${Math.abs(guestDiff)} from last month`
                  : 'Same as last month',
      tagColor: guestDiff > 0 ? 'text-emerald-600' : guestDiff < 0 ? 'text-red-500' : 'text-gray-400',
      progress: lastMonthGuests > 0
                  ? Math.min(Math.round((newGuestsThisMonth / lastMonthGuests) * 100), 100)
                  : newGuestsThisMonth > 0 ? 100 : 0,
      bar:      '#22c55e',
    },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-5 font-sans">

      {/* ── HERO ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-widest text-gray-400 uppercase mb-1">Host Dashboard</p>
          <h1 className="text-2xl font-light text-gray-800" style={{ fontFamily: "'Fraunces', serif" }}>
            Welcome back,{' '}
            <span className="italic" style={{ color: BLUE }}>{user?.name ?? 'Host'}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Here's how your properties are performing</p>
        </div>
        {thisMonthEarnings > 0 && (
          <div className="hidden md:block text-right">
            <p className="text-xs text-gray-400 uppercase tracking-widest">This month</p>
            <p className="text-2xl font-light text-gray-800 mt-0.5" style={{ fontFamily: "'Fraunces', serif" }}>
              ₱{thisMonthEarnings.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: item.iconBg }}>
              {item.icon}
            </div>
            <span className={`absolute top-4 right-4 text-[10px] font-medium px-2.5 py-1 rounded-full ${item.badgeCls}`}>
              {item.badge}
            </span>
            <p className="text-2xl font-light text-gray-800" style={{ fontFamily: "'Fraunces', serif" }}>
              {item.value}
            </p>
            <p className="text-xs text-gray-400 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      {/* ── PIPELINE + EARNINGS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Booking pipeline */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-sm font-medium text-gray-700">Booking pipeline</p>
              <p className="text-xs text-gray-400 mt-0.5">{total} total bookings</p>
            </div>
            <button
              onClick={() => navigate('/host/bookings')}
              className="text-xs text-blue-500 hover:text-blue-700 font-medium transition"
            >
              View all →
            </button>
          </div>

          {total === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {pipelineSteps.map(step => (
                <div key={step.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{step.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-700">{step.count}</span>
                      <span className="text-[10px] text-gray-400">{step.pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${step.pct}%`, background: step.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {pending > 0 && (
            <div className="mt-5 flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertCircle size={14} color="#d97706" strokeWidth={2} className="flex-shrink-0" />
              <p className="text-xs text-amber-700">
                <span className="font-semibold">{pending} booking{pending > 1 ? 's' : ''}</span> awaiting your review
              </p>
              <button
                onClick={() => navigate('/host/bookings')}
                className="ml-auto text-xs font-semibold text-amber-600 hover:text-amber-800 transition whitespace-nowrap"
              >
                Review →
              </button>
            </div>
          )}
        </div>

        {/* Monthly earnings chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-sm font-medium text-gray-700">Monthly earnings</p>
              <p className="text-xs text-gray-400 mt-0.5">Jan – Dec {currentYear}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-light text-gray-800" style={{ fontFamily: "'Fraunces', serif" }}>
                ₱{totalRevenue.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400">All time</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barCategoryGap="30%" margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: '#d1d5db' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#d1d5db' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v === 0 ? '0' : `₱${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{
                  background: '#1f2937',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 10px',
                }}
                labelStyle={{ color: '#9ca3af', fontSize: 10, marginBottom: 2 }}
                itemStyle={{ color: '#fff', fontSize: 11, fontWeight: 500 }}
                formatter={v => [`₱${Number(v).toLocaleString()}`, 'Earnings']}
              />
              <Bar dataKey="earnings" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === currentMonth ? BLUE : chartData[i].earnings > 0 ? '#bfdbfe' : '#f3f4f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── INSIGHTS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {insights.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-1.5 mb-2">
              {item.icon}
              <p className="text-xs text-gray-400">{item.label}</p>
            </div>
            <p className="text-2xl font-light text-gray-800" style={{ fontFamily: "'Fraunces', serif" }}>
              {item.value}
            </p>
            <p className={`text-xs font-medium mt-1 ${item.tagColor}`}>{item.tag}</p>
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${item.progress}%`, background: item.bar }} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}