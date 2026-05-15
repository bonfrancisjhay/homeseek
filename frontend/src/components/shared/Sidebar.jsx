import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
    { key: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { key: 'listings',  icon: '🏠', label: 'Listings'  },
    { key: 'bookings',  icon: '📅', label: 'Bookings'  },
    { key: 'earnings',  icon: '₱',  label: 'Earnings'  },
    { key: 'settings',  icon: '⚙',  label: 'Settings'  },
];

function Sidebar({ activePage, setActivePage, user, onLogout }) {
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'H';

    return (
        <aside className="w-[240px] h-screen sticky top-0 flex flex-col border-r border-gray-200 bg-white">

    {/* NAV */}
    <nav className="flex flex-col gap-1 p-3 flex-1">

        {NAV_ITEMS.map(item => (
            <button
                key={item.key}
                onClick={() => setActivePage(item.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${activePage === item.key
                        ? "bg-[#2196f3] text-white shadow-md"
                        : "text-gray-600 hover:bg-blue-50 hover:text-[#2196f3] hover:translate-x-1"
                    }`
                }
            >
                <span className="text-lg w-6 text-center">{item.icon}</span>
                <span>{item.label}</span>
            </button>
        ))}

    </nav>

    {/* BOTTOM PROFILE */}
    <div className="p-3">

        <div className="h-px bg-gray-200 my-3" />

        <div className="flex items-center gap-3 px-2 py-2">

            <div className="w-9 h-9 rounded-full bg-[#2196f3] text-white flex items-center justify-center font-bold text-sm">
                {user?.name
                    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : 'H'}
            </div>

            <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">
                    {user?.name}
                </span>
                <span className="text-xs text-[#2196f3] font-medium">
                    Host
                </span>
            </div>

        </div>

        <button
            onClick={onLogout}
            className="w-full mt-3 py-2 text-sm border border-gray-200 rounded-xl text-gray-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition"
        >
            ← Log out
        </button>

    </div>

</aside>
    );
}

export default Sidebar;