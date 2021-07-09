require("dotenv").config()
const Discord = require('discord.js')
const { GCommands } = require("gcommands");
const client = new Discord.Client({ partials: ['MESSAGE', 'REACTION', 'GUILD_MEMBER']});

client.tickets = {
    category: process.env.ticketCategory,
    closedCategory: process.env.ticketClosedCategory,
    archiveCategory: process.env.archiveCategory,
    claimedCategory: process.env.claimedCategory,
    moderatorRole: process.env.ticketModeratorRole
}

client.on('ready', async () => {
    const GCommandsClient = new GCommands(client, {
        cmdDir: "commands/",
        eventDir: "events/",
        unkownCommandMessage: false,
        language: "english",
        slash: {
            slash: 'both',
            prefix: '.'
        },
        defaultCooldown: 1,
    })

    GCommandsClient.on("debug", console.log)
    GCommandsClient.on("log", console.log)
    console.log('logged in')
})

client.login(process.env.token)
