import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthModal from './AuthModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Search, MapPin, CalendarDays, Users } from 'lucide-react';
import logo from '../assets/homeseek_logo_prototype1.png';

const SUGGESTED_DESTINATIONS = [
  { icon: '📍', iconBg: 'bg-blue-50',  name: 'Nearby',              desc: "Find what's around you",      isNearby: true },
  { icon: '🏙️', iconBg: 'bg-green-50', name: 'Manila, Philippines',  desc: 'The bustling capital city'                  },
  { icon: '🌴', iconBg: 'bg-green-50', name: 'Boracay, Philippines', desc: 'For its white sand beaches'                 },
  { icon: '🏔️', iconBg: 'bg-green-50', name: 'Baguio, Philippines',  desc: 'For sights like Burnham Park'               },
  { icon: '🌊', iconBg: 'bg-green-50', name: 'Palawan, Philippines', desc: 'For its stunning lagoons'                   },
  { icon: '🏖️', iconBg: 'bg-green-50', name: 'Panglao, Philippines', desc: 'For its seaside allure'                     },
  { icon: '🌃', iconBg: 'bg-green-50', name: 'Makati, Philippines',  desc: 'For its bustling nightlife'                 },
];

const GUEST_TYPES = [
  { key: 'adults',   label: 'Adults',   desc: 'Ages 13 or above',            min: 0              },
  { key: 'children', label: 'Children', desc: 'Ages 2 – 12',                 min: 0              },
  { key: 'infants',  label: 'Infants',  desc: 'Under 2',                     min: 0              },
  { key: 'pets',     label: 'Pets',     desc: 'Bringing a service animal?',  min: 0, descLink: true },
];

function Navbar({ onSearch }) {
  const [hoverHost, setHoverHost]           = useState(false);
  const [scrolled, setScrolled]             = useState(false);
  const [showModal, setShowModal]           = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [dateTab, setDateTab]               = useState('Dates');
  const [startDate, setStartDate]           = useState(null);
  const [endDate, setEndDate]               = useState(null);
  const [locationInput, setLocationInput]   = useState('');
  const [guests, setGuests]                 = useState({ adults: 0, children: 0, infants: 0, pets: 0 });

  const dateRef     = useRef(null);
  const locationRef = useRef(null);
  const guestRef    = useRef(null);

  const navigate  = useNavigate();
  const location  = useLocation();
  const token     = localStorage.getItem('token');
  const user      = JSON.parse(localStorage.getItem('user'));
  const isListingsPage = location.pathname === '/listings' || location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dateRef.current     && !dateRef.current.contains(e.target))     setShowDatePicker(false);
      if (locationRef.current && !locationRef.current.contains(e.target)) setShowSuggestions(false);
      if (guestRef.current    && !guestRef.current.contains(e.target))    setShowGuestPicker(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const totalGuests = guests.adults + guests.children;
  const guestLabel  = () => {
    if (totalGuests === 0 && guests.infants === 0 && guests.pets === 0) return 'Add guests';
    const parts = [];
    if (totalGuests > 0)    parts.push(`${totalGuests} guest${totalGuests > 1 ? 's' : ''}`);
    if (guests.infants > 0) parts.push(`${guests.infants} infant${guests.infants > 1 ? 's' : ''}`);
    if (guests.pets > 0)    parts.push(`${guests.pets} pet${guests.pets > 1 ? 's' : ''}`);
    return parts.join(', ');
  };

  const adjustGuest = (key, delta) =>
    setGuests(prev => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    setShowDatePicker(false);
    setShowGuestPicker(false);
    if (onSearch) onSearch({ location: locationInput, guests: totalGuests, startDate, endDate });
  };

  const handleSelectDestination = (dest) => {
    setLocationInput(dest.isNearby ? 'Nearby' : dest.name);
    setShowSuggestions(false);
    setTimeout(() => setShowDatePicker(true), 100);
  };

  const filteredSuggestions = locationInput
    ? SUGGESTED_DESTINATIONS.filter(d =>
        d.name.toLowerCase().includes(locationInput.toLowerCase()) ||
        d.desc.toLowerCase().includes(locationInput.toLowerCase()))
    : SUGGESTED_DESTINATIONS;

  const dateLabel = startDate && endDate
    ? `${startDate.toLocaleDateString()} → ${endDate.toLocaleDateString()}`
    : startDate ? `${startDate.toLocaleDateString()} → Add checkout` : 'Add dates';

  const miniLabel = [
    locationInput || 'Anywhere',
    startDate && endDate
      ? `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`
      : 'Any week',
    guestLabel(),
  ];

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const flexOptions = [
    { label: 'Weekend', days: 2  },
    { label: '1 week',  days: 7  },
    { label: '2 weeks', days: 14 },
    { label: '1 month', days: 30 },
  ];

  return (
    <>
      {showModal && (
        <AuthModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); window.location.reload(); }}
        />
      )}

      <nav className={`bg-white sticky top-0 z-[100] px-6 md:px-8 transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>

        {/* ── TOP ROW ── */}
        <div className="flex items-center justify-between h-[72px] relative">

          {/* Logo */}
          <Link to={user?.role === 'host' ? '/host/dashboard' : '/'} className="flex items-center flex-shrink-0">
            <img src={logo} alt="Homeseek" className="h-[120px] w-auto object-contain" />
          </Link>

          {/* Mini pill (visible on scroll) */}
          {isListingsPage && (
            <div
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="absolute left-1/2 flex items-center bg-white border border-gray-200 rounded-full shadow-md h-11 pl-4 pr-1 gap-2.5 cursor-pointer whitespace-nowrap transition-all duration-300"
              style={{
                transform: scrolled
                  ? 'translateX(-50%) translateY(0) scale(1)'
                  : 'translateX(-50%) translateY(6px) scale(0.97)',
                opacity:       scrolled ? 1 : 0,
                pointerEvents: scrolled ? 'auto' : 'none',
              }}
            >
              <span className="text-[13px] font-semibold text-gray-800">{miniLabel[0]}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
              <span className="text-[13px] font-semibold text-gray-800">{miniLabel[1]}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
              <span className="text-[12px] text-gray-400">{miniLabel[2]}</span>
              <div className="bg-[#3b82f6] rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                <Search size={13} color="#fff" />
              </div>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {token ? (
              <>
                <span className="text-sm text-gray-500 font-medium">Hi, {user?.name}</span>
                {user?.role !== 'host' && user?.role !== 'admin' && (
                  <button
                    onClick={handleLogout}
                    className="border border-gray-200 text-sm text-gray-700 font-medium px-4 py-2 rounded-full hover:bg-gray-50 transition"
                  >
                    Logout
                  </button>
                )}
              </>
            ) : (
              <Link
                to="/register"
                className="text-sm font-semibold text-gray-600 px-4 py-2 rounded-full hover:bg-gray-100 transition"
              >
                Become a host
              </Link>
            )}
          </div>
        </div>

        {/* ── SEARCH BAR ── */}
        {isListingsPage && (
          <div
            className="overflow-visible transition-all duration-400"
            style={{
              maxHeight:     scrolled ? '0px' : '120px',
              opacity:       scrolled ? 0 : 1,
              pointerEvents: scrolled ? 'none' : 'auto',
              transition:    'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
            }}
          >
            <div className="flex justify-center px-6 pb-4 relative z-[200]">
              <form
                onSubmit={handleSearch}
                className="flex items-center bg-white border border-gray-200 rounded-full shadow-lg max-w-[860px] w-full relative"
                style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}
              >

                {/* WHERE */}
                <div
                  ref={locationRef}
                  className="flex flex-col px-5 py-3 flex-1 cursor-pointer relative"
                  onClick={() => setShowSuggestions(true)}
                >
                  <span className="text-[11px] font-bold text-gray-800 tracking-wide uppercase flex items-center gap-1">
                    <MapPin size={11} className="text-[#3b82f6]" /> Where
                  </span>
                  <input
                    className="border-none outline-none text-[13px] text-gray-500 bg-transparent w-full mt-0.5 placeholder-gray-400"
                    type="text"
                    placeholder="Search destinations"
                    value={locationInput}
                    onChange={(e) => { setLocationInput(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                  />

                  {/* Suggestions dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div
                      className="absolute top-[70px] left-0 bg-white rounded-2xl shadow-2xl z-[300] py-4 px-2 border border-gray-100 w-[340px] max-h-[400px] overflow-y-auto"
                      onClick={e => e.stopPropagation()}
                    >
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-2">
                        Suggested destinations
                      </p>
                      {filteredSuggestions.map((dest, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 transition"
                          onClick={() => handleSelectDestination(dest)}
                        >
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${dest.iconBg}`}>
                            <span className="text-xl">{dest.icon}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold text-gray-800">{dest.name}</span>
                            <span className="text-[13px] text-gray-400">{dest.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-px h-8 bg-gray-200 flex-shrink-0" />

                {/* WHEN */}
                <div
                  ref={dateRef}
                  className="flex flex-col px-5 py-3 flex-1 cursor-pointer relative"
                  onClick={() => { setShowSuggestions(false); setShowGuestPicker(false); setShowDatePicker(v => !v); }}
                >
                  <span className="text-[11px] font-bold text-gray-800 tracking-wide uppercase flex items-center gap-1">
                    <CalendarDays size={11} className="text-[#3b82f6]" /> When
                  </span>
                  <span className={`text-[13px] mt-0.5 ${startDate ? 'text-gray-700' : 'text-gray-400'}`}>
                    {dateLabel}
                  </span>

                  {/* Calendar dropdown */}
                  {showDatePicker && (
                    <div
                      className="absolute top-[70px] left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl z-[300] p-5 border border-gray-100 w-max min-w-[680px]"
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Tabs */}
                      <div className="flex justify-center gap-1 bg-gray-100 rounded-full p-1 w-fit mx-auto mb-5">
                        {['Dates', 'Months', 'Flexible'].map(tab => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setDateTab(tab)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                              dateTab === tab
                                ? 'bg-white text-gray-900 font-semibold shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      {dateTab === 'Dates' && (
                        <DatePicker
                          selected={startDate}
                          onChange={(dates) => {
                            const [start, end] = dates;
                            setStartDate(start); setEndDate(end);
                            if (start && end) setShowDatePicker(false);
                          }}
                          startDate={startDate} endDate={endDate}
                          selectsRange inline monthsShown={2} minDate={new Date()}
                        />
                      )}

                      {dateTab === 'Months' && (
                        <div className="flex flex-wrap gap-2.5 justify-center py-2 min-w-[500px]">
                          {months.map((m, i) => {
                            const now  = new Date();
                            const year = now.getMonth() > i ? now.getFullYear() + 1 : now.getFullYear();
                            return (
                              <button
                                key={m}
                                type="button"
                                className="flex flex-col items-center px-5 py-3.5 border border-gray-200 rounded-xl bg-white hover:border-[#3b82f6] hover:bg-blue-50 transition min-w-[90px]"
                                onClick={() => { setStartDate(new Date(year, i, 1)); setEndDate(new Date(year, i + 1, 0)); setShowDatePicker(false); }}
                              >
                                <span className="text-sm font-semibold text-gray-800">{m}</span>
                                <span className="text-xs text-gray-400 mt-0.5">{year}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {dateTab === 'Flexible' && (
                        <div className="flex flex-wrap gap-2.5 justify-center py-2 min-w-[500px]">
                          {flexOptions.map(opt => (
                            <button
                              key={opt.label}
                              type="button"
                              className="flex flex-col items-center px-6 py-3.5 border border-gray-200 rounded-xl bg-white hover:border-[#3b82f6] hover:bg-blue-50 transition min-w-[90px]"
                              onClick={() => { const s = new Date(); const e = new Date(); e.setDate(e.getDate() + opt.days); setStartDate(s); setEndDate(e); setShowDatePicker(false); }}
                            >
                              <span className="text-sm font-semibold text-gray-800">{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {(startDate || endDate) && (
                        <div className="text-center mt-3">
                          <button
                            type="button"
                            className="text-sm text-gray-500 underline hover:text-gray-700 transition"
                            onClick={() => { setStartDate(null); setEndDate(null); }}
                          >
                            Clear dates
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="w-px h-8 bg-gray-200 flex-shrink-0" />

                {/* WHO */}
                <div
                  ref={guestRef}
                  className="flex flex-col px-5 py-3 flex-1 cursor-pointer relative"
                  onClick={() => { setShowSuggestions(false); setShowDatePicker(false); setShowGuestPicker(v => !v); }}
                >
                  <span className="text-[11px] font-bold text-gray-800 tracking-wide uppercase flex items-center gap-1">
                    <Users size={11} className="text-[#3b82f6]" /> Who
                  </span>
                  <span className={`text-[13px] mt-0.5 ${totalGuests > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                    {guestLabel()}
                  </span>

                  {/* Guest picker dropdown */}
                  {showGuestPicker && (
                    <div
                      className="absolute top-[70px] right-0 bg-white rounded-2xl shadow-2xl z-[300] px-7 py-4 border border-gray-100 w-[340px]"
                      onClick={e => e.stopPropagation()}
                    >
                      {GUEST_TYPES.map((type, i) => (
                        <div key={type.key}>
                          <div className="flex items-center justify-between py-4">
                            <div>
                              <p className="text-[15px] font-semibold text-gray-800">{type.label}</p>
                              <p className={`text-[13px] mt-0.5 ${type.descLink ? 'text-gray-800 underline cursor-pointer' : 'text-gray-400'}`}>
                                {type.desc}
                              </p>
                            </div>
                            <div className="flex items-center gap-3.5">
                              <button
                                type="button"
                                disabled={guests[type.key] === 0}
                                onClick={() => adjustGuest(type.key, -1)}
                                className={`w-8 h-8 rounded-full border border-gray-300 bg-white text-gray-500 flex items-center justify-center text-lg leading-none transition hover:border-gray-500 ${guests[type.key] === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                −
                              </button>
                              <span className="text-[15px] text-gray-800 min-w-[16px] text-center">
                                {guests[type.key]}
                              </span>
                              <button
                                type="button"
                                onClick={() => adjustGuest(type.key, 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 bg-white text-gray-500 flex items-center justify-center text-lg leading-none cursor-pointer hover:border-gray-500 transition"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          {i < GUEST_TYPES.length - 1 && <div className="h-px bg-gray-100" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search button */}
                <button
                  type="submit"
                  className="bg-[#3b82f6] hover:bg-[#2563eb] border-none rounded-full w-12 h-12 m-1.5 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors"
                >
                  <Search size={18} color="#fff" />
                </button>
              </form>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar;