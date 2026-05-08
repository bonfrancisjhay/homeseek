import { useState, useEffect } from 'react';
import api from '../services/api';

export function useListing() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchListings = async () => {
        try {
            const res = await api.get('/host/listings');
            setListings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this listing?')) return;
        try {
            await api.delete(`/listings/${id}`);
            setListings(prev => prev.filter(l => l.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

return { listings, loading, handleDelete, refetch: fetchListings };
}