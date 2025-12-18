import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CreateEvent = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        capacity: 10,
        imageUrl: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { title, description, date, location, capacity, imageUrl } = formData;

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/events', formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <div className="card">
                <h1 className="page-title">Create New Event</h1>
                {error && <div className="btn-danger" style={{ padding: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="form-label">Event Title</label>
                        <input type="text" className="form-input" name="title" value={title} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-textarea" name="description" value={description} onChange={onChange} rows="4" required></textarea>
                    </div>
                    <div className="grid grid-2" style={{ gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input type="date" className="form-input" name="date" value={date} onChange={onChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Capacity</label>
                            <input type="number" className="form-input" name="capacity" value={capacity} onChange={onChange} min="1" required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Location</label>
                        <input type="text" className="form-input" name="location" value={location} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Image URL (Optional)</label>
                        <input type="text" className="form-input" name="imageUrl" value={imageUrl} onChange={onChange} placeholder="https://..." />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Event</button>
                </form>
            </div>
        </div>
    );
};

export default CreateEvent;
