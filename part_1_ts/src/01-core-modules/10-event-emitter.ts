/**
 * Event Emitter: Allows different parts of an application to communicate without being tightly coupled.

 * Workflow:
 *  1. Register one or more listeners using `on()` or `once()`.
 *  2. Emit an event using `emit()`.
 *  3. Every registered listener for that event executes.

 *  Multiple listeners can subscribe to the same event. They execute in the order they were registered.
 *  Listeners run synchronously by default. But if we write listener as async But appEvents.emit(...) does not await those promises.

 *  Benefits:
 *      1. Loose coupling - e.g. registration function only knows about saving the user and emitting an event. It doesn't care who listens.
        2. Flexibility - For future enhancements [] Without EventEmitter, you must modify function [registerUser()] every time, but With EventEmitter, we just need to add another listener:

* Methods
 *  - emit(): Triggers an event and passes data to the listener
        e.g.: ____.emit('event_name', data)    
 *  - on(): Registers a listener that runs every time the event is emitted.
        e.g.: ____.on('event_name', (data) => {})
 *  - once(): Registers a listener that runs only the first time the event is emitted.
        e.g.: ____.once('event_name', (data) => {})
 *  - off(eventName, listener): Removes a specific listener.

* Common Use Cases:
    1. • User registration
    2. User login
    3. Order placed
    4. Payment completed
    5. File uploaded
    6. Email sent
    7. Cache cleared
    8. Background jobs
    9. Notifications
    10.Logging
 */

import EventEmitter from "node:events";

const appEvents = new EventEmitter()
const USER_REGISTER_EVENT = "user:register";

type UserRegistration = {
    id: number,
    email: string
}

appEvents.on(USER_REGISTER_EVENT, (user: UserRegistration) => {
    console.log(`Email listener: Send welcome email to: ${user.email}`)
})

appEvents.on(USER_REGISTER_EVENT, async (user: UserRegistration) => {
    console.log(`Log listener: Log the registered user: ${user.id} - ${user.email}`)
})

appEvents.once("server:start", () => {
    console.log("Server started.");
});

function registerUser(): void {

    appEvents.emit("server:start");
    appEvents.emit("server:start");   // Event will be listened only once as 'once' method is used by listener

    const user = {
        id: 1,
        email: 'user@example.com'
    }

    // Simulate saving the user to the database. 
    console.log("User saved to DB.")

    appEvents.emit(USER_REGISTER_EVENT, user)

    console.log("User registration Event completed.")
}

registerUser()