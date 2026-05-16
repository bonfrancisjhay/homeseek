import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, FileSpreadsheet, FileText, Printer,
  MapPin, Users, Pencil, Trash2, X, TriangleAlert,
  Home, CheckSquare, Square,
} from 'lucide-react';
import api, { createListing, updateListing } from '../../services/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ImageUploader from '../../components/ImageUploader';
import MapPicker from '../../components/MapPicker';

const BLUE        = '#3b82f6';
const BLUE_LIGHT  = '#eff6ff';
const BLUE_BORDER = '#bfdbfe';

const AMENITIES = [
  'WiFi', 'Air Conditioning', 'Kitchen', 'Parking',
  'Pool', 'Gym', 'TV', 'Washer', 'Dryer', 'Pet Friendly',
];

const EMPTY_FORM = {
    title: '', description: '', location: '',
    price_per_night: '', max_guests: '', amenities: [],
    images: [],       // new File objects
    keepImages: [],   // existing URLs to keep
    latitude: null,
    longitude: null,
};

/* ─── tiny reusable input styles ─── */
const inputCls = {
  width: '100%', padding: '10px 12px', borderRadius: '10px',
  border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none',
  fontFamily: 'inherit', color: '#111', background: '#fff',
  boxSizing: 'border-box',
};
const labelCls = {
  fontSize: '12px', fontWeight: 500, color: '#6b7280',
  marginBottom: '6px', display: 'block',
};

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelCls}>
        {label}{required && <span style={{ color: BLUE, marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function ListingsPage({ listings, loading, onDelete, onRefresh }) {
  const navigate      = useNavigate();
  const [editingId, setEditingId]             = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [hoverRow, setHoverRow]               = useState(null);
  const [showPanel, setShowPanel]             = useState(false);
  const [form, setForm]                       = useState(EMPTY_FORM);
  const [submitting, setSubmitting]           = useState(false);
  const [error, setError]                     = useState('');

  const openPanel = (listing = null) => {
    setError('');
    if (listing) {
      setEditingId(listing.id);
      setForm({
        title:           listing.title || '',
        description:     listing.description || '',
        location:        listing.location || '',
        price_per_night: listing.price_per_night || '',
        max_guests:      listing.max_guests || '',
        amenities:       listing.amenities || [],
        images:          [],
        keepImages:      listing.images || [],   // ← existing photos
        latitude:        listing.latitude  || null,
        longitude:       listing.longitude || null,
      });
    } else {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
    setShowPanel(true);
  };

  const closePanel   = () => setShowPanel(false);
  const openDeleteModal = (id) => { setSelectedDeleteId(id); setShowDeleteModal(true); };
  const confirmDelete = async () => {
    if (selectedDeleteId) await onDelete(selectedDeleteId);
    setShowDeleteModal(false);
    setSelectedDeleteId(null);
  };

  const toggleAmenity = (a) =>
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter(x => x !== a)
        : [...f.amenities, a],
    }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.location || !form.price_per_night) {
        setError('Title, location, and price are required.');
        return;
    }
    setSubmitting(true); setError('');
    try {
        const fd = new FormData();
        fd.append('title',           form.title);
        fd.append('description',     form.description);
        fd.append('location',        form.location);
        fd.append('price_per_night', form.price_per_night);
        fd.append('max_guests',      form.max_guests);
        fd.append('amenities',       JSON.stringify(form.amenities));
        fd.append('keepImages',      JSON.stringify(form.keepImages));
        if (form.latitude)  fd.append('latitude',  form.latitude);
        if (form.longitude) fd.append('longitude', form.longitude);
        if (editingId)      fd.append('_method',   'PUT'); // Laravel method spoofing

        form.images.forEach(file => fd.append('images[]', file)); // note images[]

        if (editingId) await updateListing(editingId, fd);
        else           await createListing(fd);

        closePanel();
        if (onRefresh) onRefresh();
    } catch {
        setError('Something went wrong. Please try again.');
    } finally {
        setSubmitting(false);
    }
};

  const handleExcel = () => {
    const data = listings.map((l, i) => ({
      '#': i + 1, 'Title': l.title, 'Location': l.location,
      'Price/Night': `₱${Number(l.price_per_night).toLocaleString()}`,
      'Max Guests': l.max_guests, 'Description': l.description || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Listings');
    XLSX.writeFile(wb, 'listings.xlsx');
  };

  const handlePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text('My Listings', 14, 20);
    doc.setFontSize(11);
    doc.text(`Total: ${listings.length} propert${listings.length === 1 ? 'y' : 'ies'} · ${new Date().toLocaleDateString()}`, 14, 30);
    autoTable(doc, {
      startY: 40,
      head: [['#', 'Title', 'Location', 'Price/Night', 'Max Guests']],
      body: listings.map((l, i) => [i + 1, l.title, l.location, `Php${Number(l.price_per_night).toLocaleString()}`, l.max_guests]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    doc.save('listings.pdf');
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Listings</title><style>
      body{font-family:sans-serif;padding:24px;color:#111}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th{background:#f5f5f5;padding:10px 12px;text-align:left;border-bottom:2px solid #eee}
      td{padding:10px 12px;border-bottom:1px solid #eee}
    </style></head><body>
      <h1 style="font-size:20px;margin-bottom:4px">My Listings</h1>
      <p style="color:#888;font-size:13px">${listings.length} propert${listings.length === 1 ? 'y' : 'ies'} · ${new Date().toLocaleDateString()}</p>
      <table><thead><tr><th>#</th><th>Title</th><th>Location</th><th>Price/Night</th><th>Max Guests</th></tr></thead>
      <tbody>${listings.map((l, i) => `<tr><td>${i + 1}</td><td>${l.title}</td><td>${l.location}</td><td>₱${Number(l.price_per_night).toLocaleString()}</td><td>${l.max_guests}</td></tr>`).join('')}</tbody>
      </table></body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <>
      <div style={{ padding: '24px', fontFamily: 'DM Sans, sans-serif', minHeight: '100vh', background: '#f9fafb' }}>

        {/* ── SLIDE OVERLAY ── */}
        {showPanel && (
          <div
            onClick={closePanel}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 40, backdropFilter: 'blur(2px)' }}
          />
        )}

        {/* ── SLIDE PANEL ── */}
        <div style={{
          position: 'fixed', top: 0, right: 0, height: '100vh', width: '420px', maxWidth: '95vw',
          background: '#fff', zIndex: 50, display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.08)',
          transform: showPanel ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}>
          {/* Panel header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#111', margin: 0 }}>
                {editingId ? 'Edit Listing' : 'Add New Listing'}
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: 4 }}>Fill in your property details below</p>
            </div>
            <button onClick={closePanel} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={15} color="#6b7280" />
            </button>
          </div>

          {/* Panel body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            <Field label="Property Title" required>
              <input style={inputCls} name="title" value={form.title} onChange={handleChange} placeholder="e.g. Cozy Studio in Makati" />
            </Field>
            <Field label="Description">
              <textarea style={{ ...inputCls, minHeight: 90, resize: 'vertical' }} name="description" value={form.description} onChange={handleChange} placeholder="Describe your property..." />
            </Field>
            <Field label="Location" required>
              <input style={inputCls} name="location" value={form.location} onChange={handleChange} placeholder="e.g. Makati City, Metro Manila" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelCls}>Price / Night <span style={{ color: BLUE }}>*</span></label>
                <input style={inputCls} name="price_per_night" type="number" value={form.price_per_night} onChange={handleChange} placeholder="₱ 0" />
              </div>
              <div>
                <label style={labelCls}>Max Guests</label>
                <input style={inputCls} name="max_guests" type="number" value={form.max_guests} onChange={handleChange} placeholder="e.g. 4" />
              </div>
            </div>
            {/* Photos */}
            <Field label="Property Photos">
                <ImageUploader
                    existingImages={form.keepImages}
                    onFilesChange={(files) => setForm(f => ({ ...f, images: files }))}
                    onRemoveExisting={(url) =>
                        setForm(f => ({ ...f, keepImages: f.keepImages.filter(i => i !== url) }))
                    }
                />
            </Field>

            {/* Map */}
            <Field label="Pin your location">
                <MapPicker
                    lat={form.latitude}
                    lng={form.longitude}
                    onChange={(lat, lng) => setForm(f => ({ ...f, latitude: lat, longitude: lng }))}
                />
            </Field>
            <Field label="Amenities">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {AMENITIES.map(a => {
                  const selected = form.amenities.includes(a);
                  return (
                    <button
                      key={a}
                      onClick={() => toggleAmenity(a)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '8px 12px', borderRadius: '10px', fontSize: '12px',
                        fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                        border: selected ? `1px solid ${BLUE_BORDER}` : '1px solid #e5e7eb',
                        background: selected ? BLUE_LIGHT : '#fafafa',
                        color: selected ? BLUE : '#6b7280',
                      }}
                    >
                      {selected
                        ? <CheckSquare size={13} color={BLUE} />
                        : <Square size={13} color="#d1d5db" />}
                      {a}
                    </button>
                  );
                })}
              </div>
            </Field>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
                <TriangleAlert size={14} /> {error}
              </div>
            )}
          </div>

          {/* Panel footer */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 10 }}>
            <button onClick={closePanel} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '13px', fontWeight: 500, color: '#6b7280', cursor: 'pointer' }}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', background: submitting ? '#93c5fd' : BLUE, fontSize: '13px', fontWeight: 600, color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Plus size={14} />
              {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Publish Listing'}
            </button>
          </div>
        </div>

        {/* ── PAGE HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111', margin: 0 }}>Listings</h1>
            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>
              {listings.length} propert{listings.length === 1 ? 'y' : 'ies'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Excel',  icon: <FileSpreadsheet size={14} color="#16a34a" />, action: handleExcel, color: '#16a34a' },
              { label: 'PDF',    icon: <FileText size={14} color="#dc2626" />,        action: handlePDF,   color: '#dc2626' },
              { label: 'Print',  icon: <Printer size={14} color={BLUE} />,            action: handlePrint, color: BLUE      },
            ].map(({ label, icon, action, color }) => (
              <button
                key={label}
                onClick={action}
                disabled={listings.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: '10px',
                  border: '1px solid #e5e7eb', background: '#fff',
                  fontSize: '13px', fontWeight: 500, color,
                  cursor: listings.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: listings.length === 0 ? 0.5 : 1,
                }}
              >
                {icon}{label}
              </button>
            ))}
            <button
              onClick={() => openPanel()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: '10px', border: 'none',
                background: BLUE, color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Add listing
            </button>
          </div>
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading...</p>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: '#fff', borderRadius: 16, border: '1px solid #f3f4f6' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: BLUE_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Home size={24} color={BLUE} strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: '0 0 6px' }}>No listings yet</p>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 20px' }}>Add your first property to start earning.</p>
            <button
              onClick={() => openPanel()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: '10px', border: 'none', background: BLUE, color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              <Plus size={14} /> Add your first listing
            </button>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
              {['Property', 'Location', 'Price / night', 'Max guests', 'Actions'].map((h, i) => (
                <span key={h} style={{ flex: i === 0 ? 2 : 1, fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
              ))}
            </div>
            {/* Table rows */}
            {listings.map((listing, i) => (
              <div
                key={listing.id}
                onMouseEnter={() => setHoverRow(i)}
                onMouseLeave={() => setHoverRow(null)}
                style={{
                  display: 'flex', alignItems: 'center', padding: '16px 20px',
                  borderBottom: i < listings.length - 1 ? '1px solid #f3f4f6' : 'none',
                  background: hoverRow === i ? '#fafafa' : '#fff',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ flex: 2, fontWeight: 600, fontSize: 14, color: '#111' }}>{listing.title}</span>
                <span style={{ flex: 1, fontSize: 13, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <MapPin size={13} color="#d1d5db" /> {listing.location}
                </span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: BLUE }}>
                  ₱{Number(listing.price_per_night).toLocaleString()}
                </span>
                <span style={{ flex: 1, fontSize: 13, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Users size={13} color="#d1d5db" /> {listing.max_guests}
                </span>
                <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => openPanel(listing)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '12px', fontWeight: 500, color: '#374151', cursor: 'pointer' }}
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(listing.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fff7f7', fontSize: '12px', fontWeight: 500, color: '#dc2626', cursor: 'pointer' }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── DELETE MODAL ── */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '32px 28px', width: 340, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={22} color="#dc2626" strokeWidth={1.75} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#111', margin: '0 0 8px' }}>Delete listing?</h3>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 24px', lineHeight: 1.5 }}>This action cannot be undone. The listing will be permanently removed.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '13px', fontWeight: 500, color: '#6b7280', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{ flex: 1, padding: '11px', borderRadius: '10px', border: 'none', background: '#dc2626', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ListingsPage;