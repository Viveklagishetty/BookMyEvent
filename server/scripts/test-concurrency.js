const axios = require('axios');
const mongoose = require('mongoose');

const API_URL = 'http://localhost:5000/api';
const NUM_USERS = 20;
const CAPACITY = 5;

// Utils
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
    console.log('Starting Concurrency Test...');

    // 1. Register Creator
    let creatorToken;
    try {
        const res = await axios.post(`${API_URL}/auth/register`, {
            username: `creator_${Date.now()}`,
            email: `creator_${Date.now()}@test.com`,
            password: 'password123'
        });
        creatorToken = res.data.token;
        console.log('Creator registered');
    } catch (e) {
        console.error('Failed to register creator', e.response?.data);
        return;
    }

    // 2. Create Event
    let eventId;
    try {
        const res = await axios.post(`${API_URL}/events`, {
            title: 'Concurrency Test Event',
            description: 'Testing race conditions',
            date: new Date(),
            location: 'Test Lab',
            capacity: CAPACITY
        }, {
            headers: { Authorization: `Bearer ${creatorToken}` }
        });
        eventId = res.data._id;
        console.log(`Event created with capacity ${CAPACITY}: ${eventId}`);
    } catch (e) {
        console.error('Failed to create event', e.response?.data);
        return;
    }

    // 3. Register Users
    console.log(`Registering ${NUM_USERS} users...`);
    const userTokens = [];
    for (let i = 0; i < NUM_USERS; i++) {
        try {
            const res = await axios.post(`${API_URL}/auth/register`, {
                username: `user_${Date.now()}_${i}`,
                email: `user_${Date.now()}_${i}@test.com`,
                password: 'password123'
            });
            userTokens.push(res.data.token);
        } catch (e) {
            console.error(`Failed to register user ${i}`);
        }
    }
    console.log(`${userTokens.length} users registered.`);

    // 4. Simultaneous RSVPs
    console.log('Firing simultaneous RSVPs...');
    const promises = userTokens.map(token => {
        return axios.post(`${API_URL}/events/${eventId}/rsvp`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => ({ status: 'success', data: res.data }))
            .catch(err => ({ status: 'fail', error: err.response?.data }));
    });

    const results = await Promise.all(promises);

    // 5. Analyze Results
    const successes = results.filter(r => r.status === 'success').length;
    const failures = results.filter(r => r.status === 'fail').length;

    console.log(`Test Complete.`);
    console.log(`Successful RSVPs: ${successes}`);
    console.log(`Failed RSVPs: ${failures}`);

    if (successes > CAPACITY) {
        console.error('❌ RACE CONDITION DETECTED! Overbooking occurred.');
    } else if (successes === CAPACITY) {
        console.log('✅ CAPACITY ENFORCED. Exact number of spots filled.');
    } else {
        console.log('⚠️ Underbooked? (Maybe some requests failed for other reasons)');
    }
}

runTest();
