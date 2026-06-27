import { useEffect, useState } from 'react';
import {
  Users, Home, CalendarDays, BadgeDollarSign,
  TrendingUp, ShieldCheck, AlertCircle, CheckCircle,
  XCircle, Clock, UserCheck, UserX,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import api from '../../services/api';

const BASE_URL = (import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000').replace(/\/$/, '');


const BLUE       = '#3b82f6';
const BLUE_LIGHT = '#eff6ff';
const MONTHS     = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_COLOR = {
  confirmed:   '#22c55e',
  pending:     '#f59e0b',
  cancelled:   '#ef4444',
  checked_in:  BLUE,
  checked_out: '#a78bfa',
};

const ROLE_CFG = {
  admin: { cls: 'bg-blue-50 text-blue-600',     label: 'Admin' },
  host:  { cls: 'bg-emerald-50 text-emerald-700', label: 'Host'  },
  guest: { cls: 'bg-gray-100 text-gray-500',     label: 'Guest' },
};

function RoleBadge({ role }) {
  const cfg = ROLE_CFG[role] ?? ROLE_CFG.guest;
  return (
    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const color = STATUS_COLOR[status] ?? '#9ca3af';
  return (
    <span
      className="text-[10px] font-medium px-2.5 py-1 rounded-full capitalize"
      style={{ background: color + '18', color }}
    >
      {status?.replace('_', ' ')}
    </span>
  );
}

function StatCard({ label, value, icon, iconBg, badge, badgeCls, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden hover:shadow-md transition-shadow">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: iconBg }}>
        {icon}
      </div>
      <span className={`absolute top-4 right-4 text-[10px] font-medium px-2.5 py-1 rounded-full ${badgeCls}`}>
        {badge}
      </span>
      <p className="text-2xl font-light text-gray-800" style={{ fontFamily: "'Fraunces', serif" }}>
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
      {sub && <p className="text-[10px] text-gray-300 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats,    setStats]    = useState(null);
  const [users,    setUsers]    = useState([]);
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/bookings'),
      api.get('/admin/listings'),
    ]).then(([sRes, uRes, bRes, lRes]) => {
      setStats(sRes.data);
      setUsers(uRes.data);
      setBookings(bRes.data);
      setListings(lRes.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading dashboard…</p>
      </div>
    </div>
  );

  // ── Derived analytics ──────────────────────────────────────────────

  const currentYear  = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // User role breakdown
  const roleCount = { admin: 0, host: 0, guest: 0 };
  users.forEach(u => { if (roleCount[u.role] !== undefined) roleCount[u.role]++; });

  // New users this month
  const newUsersThisMonth = users.filter(u => {
    const d = new Date(u.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // Booking status breakdown
  const statusCount = { pending: 0, confirmed: 0, cancelled: 0, checked_in: 0, checked_out: 0 };
  bookings.forEach(b => { if (statusCount[b.status] !== undefined) statusCount[b.status]++; });

  // Booking status pie data
  const pieData = Object.entries(statusCount)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name:  key.replace('_', ' '),
      value,
      color: STATUS_COLOR[key],
    }));

  // Monthly revenue (confirmed bookings by created_at)
  const monthlyRevenue = Array(12).fill(0);
  bookings
    .filter(b => ['confirmed', 'checked_in', 'checked_out'].includes(b.status))
    .forEach(b => {
      const d = new Date(b.created_at);
      if (d.getFullYear() === currentYear) {
        monthlyRevenue[d.getMonth()] += Number(b.total_price);
      }
    });
  const chartData = MONTHS.map((month, i) => ({ month, revenue: monthlyRevenue[i] }));

  // Monthly new users
  const monthlyUsers = Array(12).fill(0);
  users.forEach(u => {
    const d = new Date(u.created_at);
    if (d.getFullYear() === currentYear) monthlyUsers[d.getMonth()]++;
  });

  // Total revenue (all time from stats)
  const totalRevenue = Number(stats?.total_revenue ?? 0);

  // Avg revenue per booking
  const revenueBookings = bookings.filter(b =>
    ['confirmed', 'checked_in', 'checked_out'].includes(b.status)
  );
  const avgRevenue = revenueBookings.length
    ? Math.round(revenueBookings.reduce((s, b) => s + Number(b.total_price), 0) / revenueBookings.length)
    : 0;

  // Listings with most bookings
  const listingBookingCount = {};
  bookings.forEach(b => {
    if (b.listing_id) listingBookingCount[b.listing_id] = (listingBookingCount[b.listing_id] || 0) + 1;
  });
  const topListings = listings
    .map(l => ({ ...l, bookingCount: listingBookingCount[l.id] ?? 0 }))
    .sort((a, b) => b.bookingCount - a.bookingCount)
    .slice(0, 5);

  // Cancellation rate
  const cancelRate = bookings.length
    ? Math.round((statusCount.cancelled / bookings.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-5 font-sans">

      {/* ── HERO ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-widest text-gray-400 uppercase mb-1">Admin Dashboard</p>
          <h1 className="text-2xl font-light text-gray-800" style={{ fontFamily: "'Fraunces', serif" }}>
            Platform{' '}
            <span className="italic" style={{ color: BLUE }}>Overview</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Monitor and manage all platform activity</p>
        </div>
        <div className="hidden md:flex items-center gap-6 text-right">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Platform Revenue</p>
            <p className="text-2xl font-light text-gray-800 mt-0.5" style={{ fontFamily: "'Fraunces', serif" }}>
              ₱{totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: BLUE_LIGHT }}>
            <ShieldCheck size={20} color={BLUE} strokeWidth={1.75} />
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats?.total_users ?? 0}
          icon={<Users size={17} color={BLUE} strokeWidth={1.75} />}
          iconBg={BLUE_LIGHT}
          badge={`+${newUsersThisMonth} this month`}
          badgeCls="bg-blue-50 text-blue-600"
          sub={`${roleCount.host} hosts · ${roleCount.guest} guests`}
        />
        <StatCard
          label="Total Listings"
          value={stats?.total_listings ?? 0}
          icon={<Home size={17} color="#16a34a" strokeWidth={1.75} />}
          iconBg="#f0fdf4"
          badge="Active"
          badgeCls="bg-emerald-50 text-emerald-700"
          sub={`${listings.length > 0 ? (bookings.length / listings.length).toFixed(1) : 0} bookings/listing avg`}
        />
        <StatCard
          label="Total Bookings"
          value={stats?.total_bookings ?? 0}
          icon={<CalendarDays size={17} color="#ca8a04" strokeWidth={1.75} />}
          iconBg="#fefce8"
          badge={`${cancelRate}% cancel rate`}
          badgeCls={cancelRate > 20 ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-700'}
          sub={`${statusCount.pending} pending · ${statusCount.confirmed} confirmed`}
        />
        <StatCard
          label="Total Revenue"
          value={`₱${totalRevenue.toLocaleString()}`}
          icon={<BadgeDollarSign size={17} color={BLUE} strokeWidth={1.75} />}
          iconBg={BLUE_LIGHT}
          badge="Confirmed"
          badgeCls="bg-blue-50 text-blue-600"
          sub={`₱${avgRevenue.toLocaleString()} avg per booking`}
        />
      </div>

      {/* ── REVENUE CHART + BOOKING STATUS PIE ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Revenue bar chart — takes 2/3 */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-sm font-medium text-gray-700">Monthly revenue</p>
              <p className="text-xs text-gray-400 mt-0.5">Confirmed bookings · {currentYear}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-light text-gray-800" style={{ fontFamily: "'Fraunces', serif" }}>
                ₱{monthlyRevenue[currentMonth].toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400">This month</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barCategoryGap="30%" margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#d1d5db' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#d1d5db' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => v === 0 ? '0' : `₱${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, padding: '6px 10px' }}
                labelStyle={{ color: '#9ca3af', fontSize: 10, marginBottom: 2 }}
                itemStyle={{ color: '#fff', fontSize: 11, fontWeight: 500 }}
                formatter={v => [`₱${Number(v).toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === currentMonth ? BLUE : chartData[i].revenue > 0 ? '#bfdbfe' : '#f3f4f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Booking status pie — takes 1/3 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Booking status</p>
            <p className="text-xs text-gray-400 mt-0.5">{bookings.length} total</p>
          </div>
          {pieData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center my-auto py-8">No bookings yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={38} outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, padding: '6px 10px' }}
                    itemStyle={{ color: '#fff', fontSize: 11 }}
                    formatter={(v, name) => [v, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-xs text-gray-500 capitalize">{d.name}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-700">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── USER GROWTH + TOP LISTINGS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* User role breakdown + new signups */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-sm font-medium text-gray-700">User growth</p>
              <p className="text-xs text-gray-400 mt-0.5">New signups · {currentYear}</p>
            </div>
            <div className="flex gap-2">
              {Object.entries(roleCount).map(([role, count]) => (
                <div key={role} className="text-center">
                  <p className="text-sm font-light text-gray-800" style={{ fontFamily: "'Fraunces', serif" }}>{count}</p>
                  <RoleBadge role={role} />
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart
              data={MONTHS.map((month, i) => ({ month, users: monthlyUsers[i] }))}
              barCategoryGap="30%"
              margin={{ top: 4, right: 0, left: -28, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#d1d5db' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#d1d5db' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, padding: '6px 10px' }}
                labelStyle={{ color: '#9ca3af', fontSize: 10, marginBottom: 2 }}
                itemStyle={{ color: '#fff', fontSize: 11 }}
                formatter={v => [v, 'New users']}
              />
              <Bar dataKey="users" radius={[4, 4, 0, 0]}>
                {MONTHS.map((_, i) => (
                  <Cell key={i} fill={i === currentMonth ? '#8b5cf6' : monthlyUsers[i] > 0 ? '#ede9fe' : '#f3f4f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top listings by bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
  <div className="px-5 py-4 border-b border-gray-50">
    <p className="text-sm font-medium text-gray-700">Top listings</p>
    <p className="text-xs text-gray-400 mt-0.5">Ranked by booking count</p>
  </div>
  {topListings.length === 0 ? (
    <p className="text-center text-sm text-gray-400 py-8">No listings yet</p>
  ) : (
    topListings.map((l, i) => {
  const raw = l.images?.[0] || l.photo || null;
  const thumb = raw
    ? (raw.startsWith('http') ? raw : `${BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`)
    : null;
  return (
    <div key={l.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-300 w-4 flex-shrink-0">#{i + 1}</span>
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={l.title}
            className="w-full h-full object-cover"
            onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className="w-full h-full flex items-center justify-center" style={{ display: thumb ? 'none' : 'flex' }}>
          <Home size={14} color="#3b82f6" strokeWidth={1.75} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{l.title}</p>
        <p className="text-xs text-gray-400 truncate">{l.location}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-medium text-gray-700">{l.bookingCount}</p>
        <p className="text-[10px] text-gray-400">bookings</p>
      </div>
    </div>
  );
})
  )}
</div>
</div>
      {/* ── RECENT USERS + RECENT BOOKINGS ── */}

  

        {/* Recent bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Recent bookings</p>
              <p className="text-xs text-gray-400 mt-0.5">Latest booking activity</p>
            </div>
            {statusCount.pending > 0 && (
              <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 flex items-center gap-1">
                <AlertCircle size={10} />
                {statusCount.pending} pending
              </span>
            )}
          </div>
          {(stats?.recent_bookings ?? []).length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No bookings yet</p>
          ) : (
            (stats?.recent_bookings ?? []).map((b, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-yellow-50">
                  <CalendarDays size={14} color="#ca8a04" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{b.listing?.title ?? 'Listing'}</p>
                  <p className="text-xs text-gray-400 truncate">{b.user?.name} · ₱{Number(b.total_price).toLocaleString()}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))
          )}
        </div>
      </div>

  );
}