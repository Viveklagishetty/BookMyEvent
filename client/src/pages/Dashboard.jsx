import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get('/events');
                setEvents(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) return <div className="container">Loading events...</div>;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>Upcoming Events</h1>
                <Link to="/create-event" className="btn btn-primary">Create Event</Link>
            </div>

            {events.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem' }}>No events found</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Be the first to create an event!</p>
                    <Link to="/create-event" className="btn btn-primary">Create Event</Link>
                </div>
            ) : (
                <div className="grid grid-3">
                    {events.map(event => (
                        <div key={event._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                            {event.imageUrl && (
                                <img
                                    src={event.imageUrl}
                                    alt={event.title}
                                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1rem' }}
                                />
                            )}
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{event.title}</h3>
                            <p style={{ color: '#7c3aed', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                {new Date(event.date).toLocaleDateString()}
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem', flex: 1 }}>
                                {event.description.substring(0, 100)}...
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                    {event.location}
                                </span>
                                <Link to={`/events/${event._id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                    Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
