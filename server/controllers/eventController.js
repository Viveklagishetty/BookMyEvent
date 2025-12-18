const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('creator', 'username').sort({ date: 1 });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
    const { title, description, date, location, capacity, imageUrl } = req.body;

    if (!title || !description || !date || !location || !capacity) {
        return res.status(400).json({ message: 'Please add all required fields' });
    }

    try {
        const event = await Event.create({
            title,
            description,
            date,
            location,
            capacity,
            imageUrl,
            creator: req.user.id
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Creator only)
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the event creator
        if (event.creator.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Creator only)
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (event.creator.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await event.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    RSVP to event
// @route   POST /api/events/:id/rsvp
// @access  Private
const rsvpEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        // Check if event exists first (optional but good for error messages)
        // However, for strict concurrency, we proceed to the atomic update.

        // 1. Check if user already joined
        const eventCheck = await Event.findById(eventId);
        if (!eventCheck) {
            return res.status(404).json({ message: 'Event not found' });
        }
        if (eventCheck.attendees.includes(userId)) {
            // Toggle RSVP off (Leave event)
            const updatedEvent = await Event.findByIdAndUpdate(
                eventId,
                { $pull: { attendees: userId } },
                { new: true }
            );
            return res.status(200).json({ message: 'RSVP removed', event: updatedEvent });
        }

        // 2. Try to add user with capacity check (Atomic)
        // The query part checks two things:
        // - _id matches
        // - The size of attendees array (current logic needs aggregation/expr for strict atomic read-write)
        // Standard Mongo way:
        const updatedEvent = await Event.findOneAndUpdate(
            {
                _id: eventId,
                $expr: { $lt: [{ $size: "$attendees" }, "$capacity"] }
            },
            { $addToSet: { attendees: userId } }, // $addToSet mainly for safety, though we checked includes above
            { new: true }
        );

        if (!updatedEvent) {
            // Either event doesn't exist OR capacity is full
            // We verified existence above, so it must be capacity.
            // Double check existence just in case of race condition delete?
            // But mainly it's capacity.

            // Let's re-fetch to see why
            const currentEvent = await Event.findById(eventId);
            if (currentEvent && currentEvent.attendees.length >= currentEvent.capacity) {
                return res.status(400).json({ message: 'Event is at full capacity' });
            }
            return res.status(400).json({ message: 'Could not RSVP' });
        }

        res.status(200).json({ message: 'RSVP successful', event: updatedEvent });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    rsvpEvent
};
