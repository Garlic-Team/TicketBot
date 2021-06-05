require("dotenv").config()
const Discord = require('discord.js')
const { GCommands } = require("gcommands");
require("./classes/TextChannel")
const client = new Discord.Client({ partials: ['MESSAGE', 'REACTION', 'GUILD_MEMBER']});

client.tickets = {
    category: "850668511935725568",
    closedCategory: "850688724513849374",
    moderatorRole: "772018468198416404"
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