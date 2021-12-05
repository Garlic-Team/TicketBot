const { Event } = require('gcommands');

class Ready extends Event {
    constructor(client) {
        super(client, {
            name: 'ready',
            ws: false,
            once: true,
        });
    }

    run(client) {
        let users = 0;
        for (let guild of [...client.guilds.cache.values()]) users += guild.memberCount;

        console.log([
            `${client.user.tag} is ready!`,
            ``,
            `Servers: ${client.guilds.cache.size}`,
            `Users: ${users}`,
        ].join('\n'));
    }
}

module.exports = Ready;
