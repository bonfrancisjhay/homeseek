import { LayoutDashboard, Users, Home, CalendarDays, Settings, LogOut, ShieldCheck } from 'lucide-react';

const BLUE       = '#3b82f6';
const BLUE_LIGHT = '#eff6ff';
const RED        = '#ef4444';

const NAV_ITEMS = [
    { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { key: 'users',     icon: Users,           label: 'Users'     },
    { key: 'listings',  icon: Home,            label: 'Listings'  },
    { key: 'bookings',  icon: CalendarDays,    label: 'Bookings'  },
    { key: 'settings',  icon: Settings,        label: 'Settings'  },
];

function AdminSidebar({ activePage, setActivePage, user, onLogout }) {
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'A';

    return (
        <aside className="w-[240px] h-screen sticky top-0 flex flex-col bg-white border-r border-gray-100">

            {/* Nav */}
            <nav className="flex flex-col gap-0.5 px-3 flex-1">
                {NAV_ITEMS.map(({ key, icon: Icon, label }) => {
                    const isActive = activePage === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setActivePage(key)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left"
                            style={{
                                background: isActive ? BLUE_LIGHT : 'transparent',
                                color:      isActive ? BLUE : '#6b7280',
                            }}
                            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = BLUE_LIGHT; e.currentTarget.style.color = BLUE; } }}
                            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; } }}
                        >
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: isActive ? '#dbeafe' : '#f3f4f6' }}
                            >
                                <Icon size={15} strokeWidth={1.75} color={isActive ? BLUE : '#9ca3af'} />
                            </div>
                            <span>{label}</span>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: BLUE }} />}
                        </button>
                    );
                })}
            </nav>

            {/* Profile */}
            <div className="p-3">
                <div className="h-px bg-gray-100 mb-3" />
                <div className="flex items-center gap-3 px-2 py-2 rounded-xl mb-2">
                    <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0"
                        style={{ background: BLUE_LIGHT, color: BLUE }}
                    >
                        {initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-gray-800 truncate">{user?.name ?? 'Admin'}</span>
                        <span className="text-xs font-medium" style={{ color: BLUE }}>Administrator</span>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm rounded-xl border border-gray-100 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100"
                >
                    <LogOut size={14} strokeWidth={1.75} />
                    Log out
                </button>
            </div>
        </aside>
    );
}

export default AdminSidebar;