import { Users, Home, CalendarDays, BadgeDollarSign, TrendingUp, ShieldCheck } from 'lucide-react';

const BLUE       = '#3b82f6';
const BLUE_LIGHT = '#eff6ff';

function AdminDashboardPage({ stats, loading }) {
    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-sm text-gray-400">Loading...</p>
        </div>
    );

    const cards = [
        {
            label:    'Total Users',
            value:    stats?.total_users    ?? 0,
            icon:     <Users size={17} color={BLUE} strokeWidth={1.75} />,
            iconBg:   BLUE_LIGHT,
            badge:    'Total',
            badgeCls: 'bg-gray-100 text-gray-500',
        },
        {
            label:    'Total Listings',
            value:    stats?.total_listings ?? 0,
            icon:     <Home size={17} color="#16a34a" strokeWidth={1.75} />,
            iconBg:   '#f0fdf4',
            badge:    'Active',
            badgeCls: 'bg-emerald-50 text-emerald-700',
        },
        {
            label:    'Total Bookings',
            value:    stats?.total_bookings ?? 0,
            icon:     <CalendarDays size={17} color="#ca8a04" strokeWidth={1.75} />,
            iconBg:   '#fefce8',
            badge:    'All',
            badgeCls: 'bg-yellow-50 text-yellow-700',
        },
        {
            label:    'Total Revenue',
            value:    `₱${Number(stats?.total_revenue ?? 0).toLocaleString()}`,
            icon:     <BadgeDollarSign size={17} color={BLUE} strokeWidth={1.75} />,
            iconBg:   BLUE_LIGHT,
            badge:    'Confirmed',
            badgeCls: 'bg-blue-50 text-blue-600',
        },
    ];

    const insights = [
        {
            label:    'Total Users',
            value:    stats?.total_users ?? 0,
            icon:     <Users size={15} color={BLUE} strokeWidth={1.75} />,
            tag:      'Registered on platform',
            tagColor: 'text-blue-500',
            progress: Math.min((stats?.total_users ?? 0) * 10, 100),
        },
        {
            label:    'Total Listings',
            value:    stats?.total_listings ?? 0,
            icon:     <Home size={15} color="#16a34a" strokeWidth={1.75} />,
            tag:      'Active properties',
            tagColor: 'text-emerald-600',
            progress: Math.min((stats?.total_listings ?? 0) * 10, 100),
        },
        {
            label:    'Total Bookings',
            value:    stats?.total_bookings ?? 0,
            icon:     <TrendingUp size={15} color="#ca8a04" strokeWidth={1.75} />,
            tag:      'All time bookings',
            tagColor: 'text-yellow-600',
            progress: Math.min((stats?.total_bookings ?? 0) * 5, 100),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-5 font-sans">

            {/* HERO */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-6 flex items-center justify-between">
                <div>
                    <p className="text-[10px] tracking-widest text-gray-400 uppercase mb-1">
                        Admin Dashboard
                    </p>
                    <h1 className="text-2xl font-light text-gray-800" style={{ fontFamily: "'Fraunces', serif" }}>
                        Platform{' '}
                        <span className="italic" style={{ color: BLUE }}>Overview</span>
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Monitor and manage all platform activity
                    </p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: BLUE_LIGHT }}>
                    <ShieldCheck size={20} color={BLUE} strokeWidth={1.75} />
                </div>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cards.map((item, i) => (
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

            {/* RECENT SECTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Recent Users */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50">
                        <p className="text-sm font-semibold text-gray-700">Recent Users</p>
                        <p className="text-xs text-gray-400 mt-0.5">Latest registered accounts</p>
                    </div>
                    {(stats?.recent_users ?? []).length === 0 && (
                        <p className="text-center text-sm text-gray-400 py-8">No users yet</p>
                    )}
                    {(stats?.recent_users ?? []).map((u, i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ background: BLUE_LIGHT, color: BLUE }}
                            >
                                {u.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                                <p className="text-xs text-gray-400 truncate">{u.email}</p>
                            </div>
                            <RoleBadge role={u.role} />
                        </div>
                    ))}
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50">
                        <p className="text-sm font-semibold text-gray-700">Recent Bookings</p>
                        <p className="text-xs text-gray-400 mt-0.5">Latest booking activity</p>
                    </div>
                    {(stats?.recent_bookings ?? []).length === 0 && (
                        <p className="text-center text-sm text-gray-400 py-8">No bookings yet</p>
                    )}
                    {(stats?.recent_bookings ?? []).map((b, i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-yellow-50">
                                <CalendarDays size={14} color="#ca8a04" strokeWidth={1.75} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{b.listing?.title ?? 'Listing'}</p>
                                <p className="text-xs text-gray-400 truncate">{b.user?.name}</p>
                            </div>
                            <StatusBadge status={b.status} />
                        </div>
                    ))}
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

function RoleBadge({ role }) {
    const map = {
        admin: 'bg-blue-50 text-blue-600',
        host:  'bg-emerald-50 text-emerald-700',
        guest: 'bg-gray-100 text-gray-500',
    };
    const labels = { admin: 'Admin', host: 'Host', guest: 'Guest' };
    return (
        <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${map[role] ?? map.guest}`}>
            {labels[role] ?? 'Guest'}
        </span>
    );
}

function StatusBadge({ status }) {
    const map = {
        confirmed: 'bg-emerald-50 text-emerald-700',
        pending:   'bg-yellow-50 text-yellow-700',
        cancelled: 'bg-red-50 text-red-500',
    };
    return (
        <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full capitalize ${map[status] ?? map.pending}`}>
            {status}
        </span>
    );
}

export default AdminDashboardPage;