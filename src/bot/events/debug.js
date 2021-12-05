const { Event } = require('gcommands');

class Debug extends Event {
    constructor(client) {
        super(client, {
            name: 'debug',
            ws: false,
            once: false,
        });
    }

    run(client, debug) {
        console.log(debug);
    }
}

module.exports = Debug;
