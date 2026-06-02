import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthModal from './AuthModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Search, MapPin, CalendarDays, Users, BookOpen, LogOut, Navigation, Building2, Palmtree, Mountain, Waves, Umbrella, Moon, MessageCircle } from 'lucide-react';
import logo from '../assets/homeseek_logo_prototype1.png';
import { createPortal } from 'react-dom';

const SUGGESTED_DESTINATIONS = [
  { icon: <Navigation className="w-5 h-5 text-blue-500" />,  iconBg: 'bg-blue-50',  name: 'Nearby',              desc: "Find what's around you",      isNearby: true },
  { icon: <Building2 className="w-5 h-5 text-blue-500" />,  iconBg: 'bg-blue-50', name: 'Manila, Philippines',  desc: 'The bustling capital city'                  },
  { icon: <Palmtree className="w-5 h-5 text-blue-500" />,   iconBg: 'bg-blue-50', name: 'Boracay, Philippines', desc: 'For its white sand beaches'                 },
  { icon: <Mountain className="w-5 h-5 text-blue-500" />,   iconBg: 'bg-blue-50', name: 'Baguio, Philippines',  desc: 'For sights like Burnham Park'               },
  { icon: <Waves className="w-5 h-5 text-blue-500" />,      iconBg: 'bg-blue-50', name: 'Palawan, Philippines', desc: 'For its stunning lagoons'                   },
  { icon: <Umbrella className="w-5 h-5 text-blue-500" />,   iconBg: 'bg-blue-50', name: 'Panglao, Philippines', desc: 'For its seaside allure'                     },
  { icon: <Moon className="w-5 h-5 text-blue-500" />,       iconBg: 'bg-blue-50', name: 'Makati, Philippines',  desc: 'For its bustling nightlife'                 },
];

const GUEST_TYPES = [
  { key: 'adults',   label: 'Adults',   desc: 'Ages 13 or above',           min: 0               },
  { key: 'children', label: 'Children', desc: 'Ages 2 – 12',                min: 0               },
  { key: 'infants',  label: 'Infants',  desc: 'Under 2',                    min: 0               },
  { key: 'pets',     label: 'Pets',     desc: 'Bringing a service animal?', min: 0, descLink: true },
];

function Navbar({ onSearch }) {
  const [scrolled,         setScrolled]         = useState(false);
  const [showModal,        setShowModal]         = useState(false);
  const [showDatePicker,   setShowDatePicker]    = useState(false);
  const [showSuggestions,  setShowSuggestions]   = useState(false);
  const [showGuestPicker,  setShowGuestPicker]   = useState(false);
  const [dateTab,          setDateTab]           = useState('Dates');
  const [startDate,        setStartDate]         = useState(null);
  const [endDate,          setEndDate]           = useState(null);
  const [locationInput,    setLocationInput]     = useState('');
  const [guests,           setGuests]            = useState({ adults: 0, children: 0, infants: 0, pets: 0 });

  // For portal positioning
  const [locationRect, setLocationRect] = useState(null);
  const [dateRect,     setDateRect]     = useState(null);
  const [guestRect,    setGuestRect]    = useState(null);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const dateRef     = useRef(null);
  const locationRef = useRef(null);
  const guestRef    = useRef(null);

  const navigate  = useNavigate();
  const location  = useLocation();
  const token     = localStorage.getItem('token');
  const user      = JSON.parse(localStorage.getItem('user'));
  const isListingsPage = location.pathname === '/listings' || location.pathname === '/';

  // ── Scroll with hysteresis (no rapid flipping) ──
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;

          setShowSuggestions(false);
          setShowDatePicker(false);
          setShowGuestPicker(false);

          setScrolled(prev => {
            if (!prev && y > 120) return true;
            if (prev  && y < 60) return false;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Click outside to close dropdowns ──
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dateRef.current     && !dateRef.current.contains(e.target))     setShowDatePicker(false);
      if (locationRef.current && !locationRef.current.contains(e.target)) setShowSuggestions(false);
      if (guestRef.current    && !guestRef.current.contains(e.target))    setShowGuestPicker(false);
      if (menuRef.current     && !menuRef.current.contains(e.target))     setShowMenu(false); // ← add this

    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Update portal rects when dropdowns open ──
  const openSuggestions = () => {
    setLocationRect(locationRef.current?.getBoundingClientRect());
    setShowSuggestions(true);
  };
  const openDatePicker = () => {
    setDateRect(dateRef.current?.getBoundingClientRect());
    setShowSuggestions(false);
    setShowGuestPicker(false);
    setShowDatePicker(v => !v);
  };
  const openGuestPicker = () => {
    setGuestRect(guestRef.current?.getBoundingClientRect());
    setShowSuggestions(false);
    setShowDatePicker(false);
    setShowGuestPicker(v => !v);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const totalGuests = guests.adults + guests.children;
  const guestLabel = () => {
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
    setTimeout(() => {
      setDateRect(dateRef.current?.getBoundingClientRect());
      setShowDatePicker(true);
    }, 100);
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

          {/* Mini pill */}
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
    {user?.role !== 'host' && user?.role !== 'admin' && (
      <div className="relative flex items-center gap-3" ref={menuRef}>
  {/* Name — plain, not clickable */}
  <span className="text-sm text-gray-500 font-medium">Hi, {user?.name}</span>

  {/* Burger icon — separate button */}
  <button
    onClick={() => setShowMenu(v => !v)}
    className="flex flex-col gap-[4px] border border-gray-200 rounded-full p-2.5 hover:shadow-md transition"
  >
    <span className="w-4 h-[1.5px] bg-gray-600 block" />
    <span className="w-4 h-[1.5px] bg-gray-600 block" />
    <span className="w-4 h-[1.5px] bg-gray-600 block" />
  </button>

  {/* Dropdown */}
  {showMenu && (
    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
     <Link
      to="/my-bookings"
      onClick={() => setShowMenu(false)}
      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
    >
      <BookOpen className="w-4 h-4 text-gray-400" /> My Bookings
    </Link>
    <Link
      to="/messages"
      onClick={() => setShowMenu(false)}
      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
    >
      <MessageCircle className="w-4 h-4 text-gray-400" /> Messages
    </Link>
    <div className="h-px bg-gray-100 mx-3" />
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
    >
      <LogOut className="w-4 h-4 text-gray-400" /> Logout
    </button>
        </div>
      )}
    </div>
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
            style={{
              maxHeight:  scrolled ? '0px' : '120px',
              opacity:    scrolled ? 0 : 1,
              visibility:  scrolled ? 'hidden' : 'visible',
              pointerEvents: scrolled ? 'none' : 'auto',
              overflow:   'hidden',   // safe now — dropdowns are portaled out
              transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
            }}
          >
            <div className="flex justify-center px-6 pb-4">
              <form
                onSubmit={handleSearch}
                className="flex items-center bg-white border border-gray-200 rounded-full shadow-lg max-w-[860px] w-full"
                style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}
              >
                {/* WHERE */}
                <div
                  ref={locationRef}
                  className="flex flex-col px-5 py-3 flex-1 cursor-pointer"
                  onClick={openSuggestions}
                >
                  <span className="text-[11px] font-bold text-gray-800 tracking-wide uppercase flex items-center gap-1">
                    <MapPin size={11} className="text-[#3b82f6]" /> Where
                  </span>
                  <input
                    className="border-none outline-none text-[13px] text-gray-500 bg-transparent w-full mt-0.5 placeholder-gray-400"
                    type="text"
                    placeholder="Search destinations"
                    value={locationInput}
                    onChange={(e) => { setLocationInput(e.target.value); openSuggestions(); }}
                    onFocus={openSuggestions}
                  />
                </div>

                <div className="w-px h-8 bg-gray-200 flex-shrink-0" />

                {/* WHEN */}
                <div
                  ref={dateRef}
                  className="flex flex-col px-5 py-3 flex-1 cursor-pointer"
                  onClick={openDatePicker}
                >
                  <span className="text-[11px] font-bold text-gray-800 tracking-wide uppercase flex items-center gap-1">
                    <CalendarDays size={11} className="text-[#3b82f6]" /> When
                  </span>
                  <span className={`text-[13px] mt-0.5 ${startDate ? 'text-gray-700' : 'text-gray-400'}`}>
                    {dateLabel}
                  </span>
                </div>

                <div className="w-px h-8 bg-gray-200 flex-shrink-0" />

                {/* WHO */}
                <div
                  ref={guestRef}
                  className="flex flex-col px-5 py-3 flex-1 cursor-pointer"
                  onClick={openGuestPicker}
                >
                  <span className="text-[11px] font-bold text-gray-800 tracking-wide uppercase flex items-center gap-1">
                    <Users size={11} className="text-[#3b82f6]" /> Who
                  </span>
                  <span className={`text-[13px] mt-0.5 ${totalGuests > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                    {guestLabel()}
                  </span>
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

      {/* ── PORTALED DROPDOWNS (render outside nav so overflow:hidden can't clip them) ── */}

      {showSuggestions && locationRect && filteredSuggestions.length > 0 && createPortal(
        <div
          style={{ position: 'fixed', top: locationRect.bottom + 8, left: locationRect.left, zIndex: 9999 }}
          className="bg-white rounded-2xl shadow-2xl py-4 px-2 border border-gray-100 w-[340px] max-h-[400px] overflow-y-auto"
          onMouseDown={e => e.stopPropagation()}
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
               {dest.icon}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-gray-800">{dest.name}</span>
                <span className="text-[13px] text-gray-400">{dest.desc}</span>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}

      {showDatePicker && dateRect && createPortal(
        <div
          style={{ position: 'fixed', top: dateRect.bottom + 8, left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}
          className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-100 w-max min-w-[680px]"
          onMouseDown={e => e.stopPropagation()}
        >
          {/* Tabs */}
          <div className="flex justify-center gap-1 bg-gray-100 rounded-full p-1 w-fit mx-auto mb-5">
            {['Dates', 'Months', 'Flexible'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setDateTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  dateTab === tab ? 'bg-white text-gray-900 font-semibold shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
                    key={m} type="button"
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
                  key={opt.label} type="button"
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
        </div>,
        document.body
      )}

      {showGuestPicker && guestRect && createPortal(
        <div
          style={{ position: 'fixed', top: guestRect.bottom + 8, left: guestRect.right - 340, zIndex: 9999 }}
          className="bg-white rounded-2xl shadow-2xl px-7 py-4 border border-gray-100 w-[340px]"
          onMouseDown={e => e.stopPropagation()}
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
                  >−</button>
                  <span className="text-[15px] text-gray-800 min-w-[16px] text-center">{guests[type.key]}</span>
                  <button
                    type="button"
                    onClick={() => adjustGuest(type.key, 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 bg-white text-gray-500 flex items-center justify-center text-lg leading-none cursor-pointer hover:border-gray-500 transition"
                  >+</button>
                </div>
              </div>
              {i < GUEST_TYPES.length - 1 && <div className="h-px bg-gray-100" />}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

export default Navbar;