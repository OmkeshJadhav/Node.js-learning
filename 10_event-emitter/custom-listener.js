const EventEmitter = require('events');

class MyCustomEmitter extends EventEmitter{
    constructor(){
        super();
        this.greeting = 'Hello'
    }

    greet(name){
        this.emit('greeting', `${this.greeting}, ${name}`)
    }
}

const myCustomEmitter = new MyCustomEmitter();

myCustomEmitter.on('greeting', (input) => {
    console.log(`Greeting Event`, input);
    
});

myCustomEmitter.greet('Omkesh')


// Special Case: error Event
emitter.on('error', (err) => {
    console.error('Error occurred:', err.message);
});

// .once() – One-Time Listener
emitter.once('init', () => {
    console.log('Runs only once');
});

// Removing Event Listeners
function handler() {
    console.log('Handler called');
}

emitter.on('event', handler);
emitter.off('event', handler);


// Listener Limit & Memory Leak Warning
emitter.setMaxListeners(20);


// EventEmitter is Synchronous
emitter.emit('event');
console.log('This runs after all listeners');
