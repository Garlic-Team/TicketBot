require("dotenv").config()
const Discord = require('discord.js')
const { GCommands } = require("gcommands");
require("./classes/TextChannel")
const client = new Discord.Client({ partials: ['MESSAGE', 'REACTION', 'GUILD_MEMBER']});

client.tickets = {
    category: process.env.ticketCategory,
    closedCategory: process.env.ticketClosedCategory,
    archiveCategory: process.env.archiveCategory,
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

    GCommandsClient.on("debug", (debug)=>{
        console.log(debug)
    })
    console.log('logged in')
})

client.login(process.env.token)