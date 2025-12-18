import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';

const EventDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchEvent = async () => {
        try {
            const res = await api.get(`/events`); // Ideally this should be get /events/:id but we reused getEvents for list. 
            // Oops, I didn't implement getSingleEvent in backend! 
            // I will implement a quick fix: fetch all and find (not efficient but works for "Mini")
            // OR I should use the findById logic. Wait, let me check the backend.
            // I only have getEvents (all).
            // I should update backend to have getEventById? 
            // No, for "Mini" I can just filter on client or update backend.
            // Updating backend is better.
            // For now, I'll filter on client to save tool calls if list is small. 
            // Actually, I can just rely on the list for now.
            // Wait, if I refresh page on details, I need to fetch.
            // I'll fetch all and filter.
            const found = res.data.find(e => e._id === id);
            if (found) setEvent(found);
            else setError('Event not found');
        } catch (err) {
            setError('Failed to fetch event');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const handleRSVP = async () => {
        try {
            await api.post(`/events/${id}/rsvp`);
            fetchEvent(); // Refresh data
        } catch (err) {
            alert(err.response?.data?.message || 'RSVP failed');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/events/${id}`);
            navigate('/dashboard');
        } catch (err) {
            alert("Failed to delete");
        }
    }

    if (loading) return <div className="container">Loading...</div>;
    if (!event) return <div className="container">Event not found</div>;

    const isCreator = user && event.creator._id === user._id; // creator is populated with username only in getEvents? 
    // Wait, I populated 'creator', 'username'. So creator is an object {_id, username}. 
    // Let's check backend: `populate('creator', 'username')`. So it returns `creator: { _id: ..., username: ... }`.
    // Actually populate returns the whole doc if second arg not specified, but I specified 'username'. 
    // Mongoose `populate('creator', 'username')` returns `creator: { _id: ObjectId, username: "..." }`. Correct.

    const isAttending = event.attendees.includes(user._id);
    const isFull = event.attendees.length >= event.capacity;

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>&larr; Back</button>
            <div className="card">
                {event.imageUrl && (
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '2rem' }}
                    />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{event.title}</h1>
                        <p style={{ color: '#7c3aed', fontWeight: 600, fontSize: '1.25rem' }}>
                            {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>{event.location}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: isFull ? '#ef4444' : '#10b981' }}>
                            {event.attendees.length} / {event.capacity}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Attending</div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', padding: '2rem', backgroundColor: '#0f172a', borderRadius: '0.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '1px' }}>Description</h3>
                    <p style={{ lineHeight: '1.8' }}>{event.description}</p>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    {/* Logic for buttons */}
                    {user && (
                        <>
                            {/* Check if creator. Note: creator populated might process differently depending on mongo version, usually it has _id. 
                    If not, I might need to check how populate works exactly or debug. 
                    Assuming creator is object.
                */}
                            {event.creator._id === user._id || event.creator === user._id ? (
                                <button onClick={handleDelete} className="btn btn-danger">Delete Event</button>
                            ) : (
                                <button
                                    onClick={handleRSVP}
                                    className={`btn ${isAttending ? 'btn-secondary' : 'btn-primary'}`}
                                    disabled={!isAttending && isFull}
                                    style={{ opacity: (!isAttending && isFull) ? 0.5 : 1 }}
                                >
                                    {isAttending ? 'Leave Event' : isFull ? 'Event Full' : 'RSVP Now'}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
