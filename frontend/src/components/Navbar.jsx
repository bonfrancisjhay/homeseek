import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthModal from './AuthModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiSearch } from 'react-icons/fi';
import logo from '../assets/homeseek_logo_prototype1.png';

const SUGGESTED_DESTINATIONS = [
    { icon: '📍', iconBg: '#e8f4ff', name: 'Nearby', desc: "Find what's around you", isNearby: true },
    { icon: '🏙️', iconBg: '#e8f4e8', name: 'Manila, Philippines', desc: 'The bustling capital city' },
    { icon: '🌴', iconBg: '#e8f4e8', name: 'Boracay, Philippines', desc: 'For its white sand beaches' },
    { icon: '🏔️', iconBg: '#e8f4e8', name: 'Baguio, Philippines', desc: 'For sights like Burnham Park' },
    { icon: '🌊', iconBg: '#e8f4e8', name: 'Palawan, Philippines', desc: 'For its stunning lagoons' },
    { icon: '🏖️', iconBg: '#e8f4e8', name: 'Panglao, Philippines', desc: 'For its seaside allure' },
    { icon: '🌃', iconBg: '#e8f4e8', name: 'Makati, Philippines', desc: 'For its bustling nightlife' },
];

const GUEST_TYPES = [
    { key: 'adults',   label: 'Adults',   desc: 'Ages 13 or above', min: 0 },
    { key: 'children', label: 'Children', desc: 'Ages 2 – 12',      min: 0 },
    { key: 'infants',  label: 'Infants',  desc: 'Under 2',          min: 0 },
    { key: 'pets',     label: 'Pets',     desc: 'Bringing a service animal?', min: 0, descLink: true },
];

function Navbar({ onSearch }) {
    const [hoverHost, setHoverHost] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showGuestPicker, setShowGuestPicker] = useState(false);
    const [dateTab, setDateTab] = useState('Dates');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [locationInput, setLocationInput] = useState('');
    const [guests, setGuests] = useState({ adults: 0, children: 0, infants: 0, pets: 0 });

    const dateRef = useRef(null);
    const locationRef = useRef(null);
    const guestRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const isListingsPage = location.pathname === '/listings' || location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dateRef.current && !dateRef.current.contains(e.target)) setShowDatePicker(false);
            if (locationRef.current && !locationRef.current.contains(e.target)) setShowSuggestions(false);
            if (guestRef.current && !guestRef.current.contains(e.target)) setShowGuestPicker(false);
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
    const guestLabel = () => {
        if (totalGuests === 0 && guests.infants === 0 && guests.pets === 0) return 'Add guests';
        const parts = [];
        if (totalGuests > 0) parts.push(`${totalGuests} guest${totalGuests > 1 ? 's' : ''}`);
        if (guests.infants > 0) parts.push(`${guests.infants} infant${guests.infants > 1 ? 's' : ''}`);
        if (guests.pets > 0) parts.push(`${guests.pets} pet${guests.pets > 1 ? 's' : ''}`);
        return parts.join(', ');
    };

    const adjustGuest = (key, delta) => {
        setGuests(prev => ({
            ...prev,
            [key]: Math.max(0, prev[key] + delta)
        }));
    };

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
        { label: 'Weekend', days: 2 },
        { label: '1 week', days: 7 },
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

            <nav style={{ ...styles.nav, boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.10)' : '0 1px 0 #eee' }}>

                {/* Top row */}
                <div style={styles.topRow}>
                    <Link to="/" style={styles.logo}>
                        <img src={logo} alt="Homeseek" style={styles.logoImg} />
                    </Link>

                    {/* Mini pill */}
                    {isListingsPage && (
                        <div
                            style={{
                                ...styles.miniPillWrapper,
                                opacity: scrolled ? 1 : 0,
                                transform: scrolled
                                    ? 'translateX(-50%) translateY(0) scale(1)'
                                    : 'translateX(-50%) translateY(6px) scale(0.97)',
                                pointerEvents: scrolled ? 'auto' : 'none',
                            }}
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <span style={styles.miniText}>{miniLabel[0]}</span>
                            <div style={styles.miniDot} />
                            <span style={styles.miniText}>{miniLabel[1]}</span>
                            <div style={styles.miniDot} />
                            <span style={styles.miniSubText}>{miniLabel[2]}</span>
                            <div style={styles.miniBtn}><FiSearch size={13} color="#fff" /></div>
                        </div>
                    )}

                    {/* Right */}
                    <div style={styles.right}>
                        {token ? (
                            <>
                                {user?.role === 'host' && (
                                    <>
                                        <Link to="/host/dashboard" style={styles.navLink}>Dashboard</Link>
                                        <Link to="/create-listing" style={styles.hostBtn}>+ List Property</Link>
                                    </>
                                )}
                                <span style={styles.userName}>Hi, {user?.name}</span>
                                <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                            </>
                        ) : (
                            <Link
                                to="/register"
                                style={{ ...styles.hostBtn, ...(hoverHost ? styles.hostBtnHover : {}) }}
                                onMouseEnter={() => setHoverHost(true)}
                                onMouseLeave={() => setHoverHost(false)}
                            >
                                Become a host
                            </Link>
                        )}
                    </div>
                </div>

                {/* Search bar collapse wrapper */}
                {isListingsPage && (
                    <div style={{
                        maxHeight: scrolled ? '0px' : '120px',
                        opacity: scrolled ? 0 : 1,
                        pointerEvents: scrolled ? 'none' : 'auto',
                        transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
                    }}>
                        <div style={{ ...styles.searchWrapper, paddingBottom: '14px', overflow: 'visible' }}>
                            <form onSubmit={handleSearch} style={styles.searchBar}>

                                {/* WHERE */}
                                <div ref={locationRef} style={{ ...styles.searchField, position: 'relative' }}
                                    onClick={() => setShowSuggestions(true)}>
                                    <span style={styles.searchLabel}>Where</span>
                                    <input
                                        style={styles.searchInput}
                                        type="text"
                                        placeholder="Search destinations"
                                        value={locationInput}
                                        onChange={(e) => { setLocationInput(e.target.value); setShowSuggestions(true); }}
                                        onFocus={() => setShowSuggestions(true)}
                                    />
                                    {showSuggestions && filteredSuggestions.length > 0 && (
                                        <div style={styles.suggestionsDropdown} onClick={e => e.stopPropagation()}>
                                            <p style={styles.suggestionsTitle}>Suggested destinations</p>
                                            {filteredSuggestions.map((dest, i) => (
                                                <div key={i} style={styles.suggestionItem}
                                                    onClick={() => handleSelectDestination(dest)}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#f7f7f7'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    <div style={{ ...styles.suggestionIcon, background: dest.iconBg }}>
                                                        <span style={{ fontSize: '20px' }}>{dest.icon}</span>
                                                    </div>
                                                    <div style={styles.suggestionText}>
                                                        <span style={styles.suggestionName}>{dest.name}</span>
                                                        <span style={styles.suggestionDesc}>{dest.desc}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={styles.searchDivider} />

                                {/* WHEN */}
                                <div ref={dateRef} style={{ ...styles.searchField, position: 'relative' }}
                                    onClick={() => { setShowSuggestions(false); setShowGuestPicker(false); setShowDatePicker(v => !v); }}>
                                    <span style={styles.searchLabel}>When</span>
                                    <span style={{ ...styles.searchInput, color: startDate ? '#222' : '#666', cursor: 'pointer' }}>
                                        {dateLabel}
                                    </span>
                                    {showDatePicker && (
                                        <div style={styles.calendarDropdown} onClick={e => e.stopPropagation()}>
                                            <div style={styles.tabRow}>
                                                {['Dates', 'Months', 'Flexible'].map(tab => (
                                                    <button key={tab} type="button"
                                                        style={{ ...styles.tab, ...(dateTab === tab ? styles.tabActive : {}) }}
                                                        onClick={() => setDateTab(tab)}>{tab}</button>
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
                                                <div style={styles.flexGrid}>
                                                    {months.map((m, i) => {
                                                        const now = new Date();
                                                        const year = now.getMonth() > i ? now.getFullYear() + 1 : now.getFullYear();
                                                        return (
                                                            <button key={m} type="button" style={styles.flexChip}
                                                                onClick={() => { setStartDate(new Date(year, i, 1)); setEndDate(new Date(year, i + 1, 0)); setShowDatePicker(false); }}>
                                                                <span style={styles.flexChipMain}>{m}</span>
                                                                <span style={styles.flexChipSub}>{year}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {dateTab === 'Flexible' && (
                                                <div style={styles.flexGrid}>
                                                    {flexOptions.map(opt => (
                                                        <button key={opt.label} type="button" style={styles.flexChip}
                                                            onClick={() => { const s = new Date(); const e = new Date(); e.setDate(e.getDate() + opt.days); setStartDate(s); setEndDate(e); setShowDatePicker(false); }}>
                                                            <span style={styles.flexChipMain}>{opt.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {(startDate || endDate) && (
                                                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                                                    <button type="button" style={styles.clearBtn}
                                                        onClick={() => { setStartDate(null); setEndDate(null); }}>
                                                        Clear dates
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div style={styles.searchDivider} />

                                {/* WHO */}
                                <div ref={guestRef} style={{ ...styles.searchField, position: 'relative' }}
                                    onClick={() => { setShowSuggestions(false); setShowDatePicker(false); setShowGuestPicker(v => !v); }}>
                                    <span style={styles.searchLabel}>Who</span>
                                    <span style={{ ...styles.searchInput, color: totalGuests > 0 ? '#222' : '#666', cursor: 'pointer' }}>
                                        {guestLabel()}
                                    </span>

                                    {/* Guest picker dropdown */}
                                    {showGuestPicker && (
                                        <div style={styles.guestDropdown} onClick={e => e.stopPropagation()}>
                                            {GUEST_TYPES.map((type, i) => (
                                                <div key={type.key}>
                                                    <div style={styles.guestRow}>
                                                        <div>
                                                            <p style={styles.guestLabel}>{type.label}</p>
                                                            <p style={{
                                                                ...styles.guestDesc,
                                                                ...(type.descLink ? styles.guestDescLink : {})
                                                            }}>{type.desc}</p>
                                                        </div>
                                                        <div style={styles.guestCounter}>
                                                            <button
                                                                type="button"
                                                                style={{
                                                                    ...styles.counterBtn,
                                                                    opacity: guests[type.key] === 0 ? 0.3 : 1,
                                                                    cursor: guests[type.key] === 0 ? 'not-allowed' : 'pointer',
                                                                }}
                                                                onClick={() => adjustGuest(type.key, -1)}
                                                                disabled={guests[type.key] === 0}
                                                            >−</button>
                                                            <span style={styles.counterNum}>{guests[type.key]}</span>
                                                            <button
                                                                type="button"
                                                                style={styles.counterBtn}
                                                                onClick={() => adjustGuest(type.key, 1)}
                                                            >+</button>
                                                        </div>
                                                    </div>
                                                    {i < GUEST_TYPES.length - 1 && <div style={styles.guestDivider} />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button type="submit" style={styles.searchBtn}>
                                    <FiSearch size={18} color="#fff" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}

const styles = {
    nav: { backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 100, padding: '0 32px', transition: 'box-shadow 0.3s ease' },
    topRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px', position: 'relative' },
    logo: { textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 },
    logoImg: { height: '120px', width: 'auto', objectFit: 'contain' },
    right: { display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 },
    navLink: { color: '#444', textDecoration: 'none', padding: '10px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' },
    hostBtn: { color: '#444', textDecoration: 'none', padding: '10px 20px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', transition: 'background 0.2s' },
    hostBtnHover: { background: '#ddd' },
    userName: { fontSize: '14px', color: '#444', fontWeight: '500' },
    logoutBtn: { background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', cursor: 'pointer', color: '#222' },

    miniPillWrapper: { position: 'absolute', left: '50%', display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #ddd', borderRadius: '40px', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', height: '44px', padding: '0 4px 0 18px', gap: '10px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.4,0,0.2,1)' },
    miniText: { fontSize: '13px', fontWeight: '600', color: '#222' },
    miniSubText: { fontSize: '12px', color: '#888' },
    miniDot: { width: '4px', height: '4px', borderRadius: '50%', background: '#ccc', flexShrink: 0 },
    miniBtn: { background: '#2196f3', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

    searchWrapper: { display: 'flex', justifyContent: 'center', paddingLeft: '24px', paddingRight: '24px', position: 'relative', zIndex: 200 },
    searchBar: { display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #ddd', borderRadius: '40px', boxShadow: '0 2px 16px rgba(0,0,0,0.12)', maxWidth: '860px', width: '100%', position: 'relative' },
    searchField: { display: 'flex', flexDirection: 'column', padding: '12px 20px', flex: 1, cursor: 'pointer' },
    searchLabel: { fontSize: '11px', fontWeight: '700', color: '#222', letterSpacing: '0.04em' },
    searchInput: { border: 'none', outline: 'none', fontSize: '13px', color: '#666', background: 'transparent', width: '100%', marginTop: '2px' },
    searchDivider: { width: '1px', height: '32px', background: '#ddd', flexShrink: 0 },
    searchBtn: { background: '#2196f3', border: 'none', borderRadius: '50%', width: '48px', height: '48px', margin: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

    suggestionsDropdown: { position: 'absolute', top: '70px', left: '0', background: '#fff', borderRadius: '24px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', zIndex: 300, padding: '16px 8px', border: '1px solid #eee', width: '340px', maxHeight: '400px', overflowY: 'auto' },
    suggestionsTitle: { fontSize: '12px', fontWeight: '700', color: '#888', letterSpacing: '0.04em', padding: '0 16px', marginBottom: '8px', textTransform: 'uppercase' },
    suggestionItem: { display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.15s' },
    suggestionIcon: { width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    suggestionText: { display: 'flex', flexDirection: 'column', gap: '2px' },
    suggestionName: { fontSize: '14px', fontWeight: '600', color: '#222' },
    suggestionDesc: { fontSize: '13px', color: '#888' },

    calendarDropdown: { position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: '24px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', zIndex: 300, padding: '20px 24px 16px', border: '1px solid #eee', width: 'max-content', minWidth: '680px' },
    tabRow: { display: 'flex', justifyContent: 'center', gap: '4px', background: '#f7f7f7', borderRadius: '40px', padding: '4px', width: 'fit-content', margin: '0 auto 20px' },
    tab: { padding: '8px 20px', borderRadius: '40px', border: 'none', background: 'transparent', fontSize: '14px', fontWeight: '500', color: '#444', cursor: 'pointer', transition: 'background 0.2s' },
    tabActive: { background: '#fff', color: '#222', fontWeight: '600', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' },
    flexGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', padding: '8px 0 12px', minWidth: '500px' },
    flexChip: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 20px', border: '1px solid #ddd', borderRadius: '12px', background: '#fff', cursor: 'pointer', minWidth: '90px' },
    flexChipMain: { fontSize: '14px', fontWeight: '600', color: '#222' },
    flexChipSub: { fontSize: '12px', color: '#888', marginTop: '2px' },
    clearBtn: { background: 'none', border: 'none', fontSize: '13px', color: '#444', cursor: 'pointer', textDecoration: 'underline', padding: '4px 8px' },

    // Guest picker
    guestDropdown: { position: 'absolute', top: '70px', right: '0', background: '#fff', borderRadius: '24px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', zIndex: 300, padding: '24px 28px', border: '1px solid #eee', width: '340px' },
    guestRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' },
    guestLabel: { fontSize: '15px', fontWeight: '600', color: '#222', margin: 0 },
    guestDesc: { fontSize: '13px', color: '#888', margin: '2px 0 0' },
    guestDescLink: { color: '#222', textDecoration: 'underline', cursor: 'pointer' },
    guestDivider: { height: '1px', background: '#f0f0f0' },
    guestCounter: { display: 'flex', alignItems: 'center', gap: '14px' },
    counterBtn: { width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #bbb', background: '#fff', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#444', lineHeight: 1, transition: 'border-color 0.2s' },
    counterNum: { fontSize: '15px', fontWeight: '400', color: '#222', minWidth: '16px', textAlign: 'center' },
};

export default Navbar;