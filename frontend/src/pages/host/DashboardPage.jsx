import { useNavigate } from 'react-router-dom';

const MONTHS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec'
];

const MONTHLY_DATA = MONTHS.map(month => ({ month, value: 0 }));

function DashboardPage({ listings, user }) {
  const navigate = useNavigate();

  const currentMonth = new Date().getMonth();
  const maxValue = Math.max(...MONTHLY_DATA.map(d => d.value), 1);

  return (
    <div className="min-h-screen bg-white p-4 md:p-6 space-y-6">
      {/* HERO */}
      <div className="bg-white border rounded-xl p-4 md:p-6 shadow-sm">
        <p className="text-[10px] md:text-xs tracking-widest text-gray-400">
            DASHBOARD OVERVIEW
        </p>

        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
            Welcome back, {user?.name} 👋
        </h1>

        <p className="text-gray-500 mt-2 text-xs md:text-sm">
            Manage listings and track performance
        </p>
        </div>

      {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT - STATS */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Total Listings', value: listings.length, icon: '🏠', color: 'blue' },
            { label: 'Active Bookings', value: 0, icon: '📅', color: 'green' },
            { label: 'Monthly Earnings', value: '₱0', icon: '💰', color: 'yellow' },
            { label: 'Average Rating', value: '—', icon: '⭐', color: 'orange' },
          ].map((item, i) => (
            <div key={i} className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-center">
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs text-green-500">↑ 12%</span>
              </div>

              <h2 className="text-xl font-bold mt-3 text-gray-800">
                {item.value}
              </h2>

              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-xs text-gray-400 mt-1">Updated analytics</p>
            </div>
          ))}

        </div>

        {/* RIGHT - CHART */}
        <div className="border rounded-xl p-4 shadow-sm overflow-x-auto">
          <div className="flex justify-between mb-4">
            <div>
              <p className="font-semibold text-gray-700">Monthly Earnings</p>
              <p className="text-xs text-gray-400">Jan - Dec {new Date().getFullYear()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">₱0</p>
              <p className="text-xs text-gray-400">Total</p>
            </div>
          </div>

        <div className="flex items-end gap-2 h-32 sm:h-40">
            {MONTHLY_DATA.map((d, i) => {
              const height = (d.value / maxValue) * 150;

              return (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-3 bg-blue-500 rounded-t`}
                    style={{ height: `${Math.max(height, 5)}px` }}
                  />
                  <span className="text-[10px] text-gray-400 mt-1">
                    {d.month}
                  </span>
                </div>
              );
            })}

          </div>

        </div>
      </div>

      {/* INSIGHTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">Occupancy Rate</p>
          <h2 className="text-xl font-bold">82%</h2>
          <span className="text-green-500 text-xs">↑ +5%</span>
        </div>

        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">Avg Stay</p>
          <h2 className="text-xl font-bold">3.4 days</h2>
          <span className="text-gray-500 text-xs">Stable</span>
        </div>

        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">New Guests</p>
          <h2 className="text-xl font-bold">12</h2>
          <span className="text-green-500 text-xs">↑ +3</span>
        </div>

      </div>

    </div>
  );
}

export default DashboardPage;