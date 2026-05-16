import { useNavigate } from 'react-router-dom';
import { Home, CalendarDays, BadgeDollarSign, Star, TrendingUp, Clock, Users } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHLY_DATA = MONTHS.map(month => ({ month, value: 0 }));

const BLUE       = '#3b82f6';
const BLUE_LIGHT = '#eff6ff';
const BLUE_BORDER= '#bfdbfe';
const BLUE_DARK  = '#1d4ed8';

function DashboardPage({ listings = [], user }) {
  const navigate = useNavigate();

  const currentMonth   = new Date().getMonth();
  const maxValue       = Math.max(...MONTHLY_DATA.map(d => d.value), 1);
  const totalEarnings  = MONTHLY_DATA.reduce((sum, d) => sum + d.value, 0);

  const stats = [
    {
      label:     'Total Listings',
      value:     listings.length,
      icon:      <Home size={17} color={BLUE} strokeWidth={1.75} />,
      badge:     'Total',
      badgeCls:  'bg-gray-100 text-gray-500',
      iconBg:    BLUE_LIGHT,
    },
    {
      label:     'Active Bookings',
      value:     0,
      icon:      <CalendarDays size={17} color="#16a34a" strokeWidth={1.75} />,
      badge:     'Live',
      badgeCls:  'bg-emerald-50 text-emerald-700',
      iconBg:    '#f0fdf4',
    },
    {
      label:     'Monthly Earnings',
      value:     '₱0',
      icon:      <BadgeDollarSign size={17} color={BLUE} strokeWidth={1.75} />,
      badge:     '↑ 12%',
      badgeCls:  'bg-emerald-50 text-emerald-700',
      iconBg:    BLUE_LIGHT,
    },
    {
      label:     'Average Rating',
      value:     '—',
      icon:      <Star size={17} color="#ca8a04" strokeWidth={1.75} />,
      badge:     'Avg',
      badgeCls:  'bg-gray-100 text-gray-500',
      iconBg:    '#fefce8',
    },
  ];

  const insights = [
    {
      label:    'Occupancy Rate',
      value:    '82%',
      icon:     <TrendingUp size={15} color={BLUE} strokeWidth={1.75} />,
      tag:      '↑ +5% this month',
      tagColor: 'text-emerald-600',
      progress: 82,
    },
    {
      label:    'Avg Stay',
      value:    '3.4 days',
      icon:     <Clock size={15} color="#9ca3af" strokeWidth={1.75} />,
      tag:      'Stable trend',
      tagColor: 'text-gray-400',
      progress: 45,
    },
    {
      label:    'New Guests',
      value:    '12',
      icon:     <Users size={15} color="#16a34a" strokeWidth={1.75} />,
      tag:      '↑ +3 from last month',
      tagColor: 'text-emerald-600',
      progress: 60,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-5 font-sans">

      {/* HERO */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-widest text-gray-400 uppercase mb-1">
            Host Dashboard
          </p>
          <h1 className="text-2xl font-light text-gray-800" style={{ fontFamily: "'Fraunces', serif" }}>
            Welcome back,{' '}
            <span className="italic" style={{ color: BLUE }}>{user?.name ?? 'Host'}</span> 
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Here's how your properties are performing this month
          </p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden hover:shadow-md transition-shadow"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
              style={{ background: item.iconBg }}
            >
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

      {/* EARNINGS CHART */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-sm font-medium text-gray-700">Monthly earnings</p>
            <p className="text-xs text-gray-400 mt-0.5">Jan – Dec {new Date().getFullYear()}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-light text-gray-800" style={{ fontFamily: "'Fraunces', serif" }}>
              ₱{totalEarnings.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-400">Total</p>
          </div>
        </div>

        <div className="flex items-end gap-1.5 h-28">
          {MONTHLY_DATA.map((d, i) => {
            const isActive  = i === currentMonth;
            const heightPct = Math.max((d.value / maxValue) * 100, 5);
            return (
              <div key={i} className="flex flex-col items-center flex-1 gap-1">
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height:     `${heightPct}%`,
                    background: isActive ? BLUE : '#dbeafe',
                  }}
                />
                <span
                  className="text-[9px]"
                  style={{ color: isActive ? BLUE : '#d1d5db', fontWeight: isActive ? 500 : 400 }}
                >
                  {d.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* INSIGHTS */}
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
              <div
                className="h-full rounded-full"
                style={{ width: `${item.progress}%`, background: BLUE }}
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default DashboardPage;