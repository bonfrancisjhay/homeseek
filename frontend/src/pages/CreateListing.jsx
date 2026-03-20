import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CreateListing() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        description: '',
        location: '',
        price_per_night: '',
        max_guests: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/listings', form);
            navigate('/listings');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>List your property</h2>
                <p style={styles.sub}>Fill in the details below</p>

                {error && <p style={styles.error}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label style={styles.label}>Property Title</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="title"
                            placeholder="e.g. Cozy Beach House"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            style={styles.textarea}
                            name="description"
                            placeholder="Describe your property..."
                            value={form.description}
                            onChange={handleChange}
                            required
                            rows={4}
                        />
                    </div>
                    <div style={styles.field}>
                        <label style={styles.label}>Location</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="location"
                            placeholder="e.g. Cebu City, Philippines"
                            value={form.location}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label}>Price per night (₱)</label>
                            <input
                                style={styles.input}
                                type="number"
                                name="price_per_night"
                                placeholder="e.g. 2500"
                                value={form.price_per_night}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Max Guests</label>
                            <input
                                style={styles.input}
                                type="number"
                                name="max_guests"
                                placeholder="e.g. 4"
                                value={form.max_guests}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        style={styles.btn}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Listing'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7f7f7',
        padding: '40px 24px'
    },
    card: {
        background: '#fff',
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
    },
    title: { fontSize: '24px', fontWeight: 'bold', color: '#222', marginBottom: '4px' },
    sub: { color: '#888', marginBottom: '24px', fontSize: '14px' },
    error: {
        background: '#fff0f0',
        color: '#e00',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontSize: '14px'
    },
    field: { marginBottom: '16px', flex: 1 },
    row: { display: 'flex', gap: '16px' },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '600',
        marginBottom: '6px',
        color: '#444'
    },
    input: {
        width: '100%',
        padding: '10px 14px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box'
    },
    textarea: {
        width: '100%',
        padding: '10px 14px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        resize: 'vertical'
    },
    btn: {
        width: '100%',
        padding: '12px',
        background: '#ff385c',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '8px'
    }
};

export default CreateListing;