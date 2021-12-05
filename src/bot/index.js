require('dotenv').config();
const { Intents } = require('discord.js');
const path = require('path');
const TicketClient = require('./structures/TicketClient');

const client = new TicketClient({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
    ],
    language: 'english',
    loader: {
        cmdDir: path.join(__dirname, 'commands'),
        eventDir: path.join(__dirname, 'events'),
    },
    commands: {
        slash: 'slash',
        context: 'false',
    },
    token: process.env.DISCORD_TOKEN,
});

client.parseConfig();