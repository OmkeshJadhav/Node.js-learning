// Real world example : User Registration System
// When a user registers, multiple things should happen:
// Save user to DB
// Send welcome email
// Log activity
// Maybe trigger analytics

// Step 1: Create Emitter
const EventEmitter = require('events');

class UserEmitter extends EventEmitter { }

const userEmitter = new UserEmitter();

// Step 2: Emit Event After Registration
async function registerUser(userData) {
    const user = await saveUserToDB(userData);

    userEmitter.emit('userRegistered', user);

    return user;
}

// Step 3: Listen to Events (Separate Concerns)
// Send Email
userEmitter.on('userRegistered', (user) => {
    sendWelcomeEmail(user.email);
});

// Logging
userEmitter.on('userRegistered', (user) => {
    console.log('User created:', user.id);
});

// Analytics
userEmitter.on('userRegistered', (user) => {
    sendAnalyticsEvent(user);
});