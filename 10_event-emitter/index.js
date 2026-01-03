// Events module offers EventEmitter class which is used to handle events
// emit method - Used to trigger an event
// on method - Used to add a callback function that's going to be executed when the event is triggered.

const EventEmitter = require('events');

const myEventEmitter = new EventEmitter()

// Register a listener - Emitter name and a callback as argumnets to on method
myEventEmitter.on('greet', (name) => {
    console.log(`Hello ${name}`);  
})

// Call the emitter - Emit event
myEventEmitter.emit('greet', 'Omkesh')
