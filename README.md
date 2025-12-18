# Mini Event Platform (MERN Stack)

A full-stack web application for creating, viewing, and RSVPing to events with strict capacity enforcement.

## 🚀 Features
- **User Authentication**: Secure Login/Register with JWT.
- **Event Management**: Create, Edit (Creator only), Delete (Creator only) events.
- **RSVP System**: Join/Leave events with **real-time capacity checks**.
- **Concurrency Handling**: Tested to prevent overbooking using atomic database operations.
- **Premium UI**: Responsive React frontend with dark theme.

## 🛠 Tech Stack
- **Frontend**: React, Vite, CSS Modules (Global Styles).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Atlas).

## 🏃‍♂️ Quick Start (Local)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mini-event
   ```

2. **Setup Server**
   ```bash
   cd server
   npm install
   # Create .env file with MONGO_URI
   node server.js
   ```

3. **Setup Client**
   ```bash
   cd client
   npm install
   npm run dev
   ```

## 🧠 Technical Explanation: Concurrency
To ensure that an event never exceeds its capacity, even when multiple users RSVP simultaneously, we use **MongoDB Atomic Updates**.

Instead of a "Read-Check-Write" pattern (which is vulnerable to race conditions), we use a single query found in `server/controllers/eventController.js`:

```javascript
const updatedEvent = await Event.findOneAndUpdate(
  { 
    _id: eventId, 
    $expr: { $lt: [{ $size: "$attendees" }, "$capacity"] } 
  },
  { $addToSet: { attendees: userId } },
  { new: true }
);
```

This query only executes the update **IF** the current number of attendees is strictly less than the capacity. The database locking mechanism ensures serialized execution of this check-and-update.

## 🧪 Verification
A stress-test script is included to verify this behavior:
```bash
node server/scripts/test-concurrency.js
```
This script registers 20 users and fires 20 simultaneous RSVP requests to an event with 5 spots. The result is always exactly 5 attendees.
