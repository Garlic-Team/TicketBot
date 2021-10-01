require("dotenv").config()
const { Intents } = require('discord.js')
const { GCommandsClient, MessageSelectMenu, MessageSelectMenuOption } = require("gcommands");

const client = new GCommandsClient({
    cmdDir: __dirname + "/commands/",
    eventDir: __dirname + "/events/",
    language: "english",
    commands: {
        slash: 'both',
        context: 'false',
        prefix: '.'
    },
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES]
});

client.config = require("./config.json");
client.categories = new MessageSelectMenu().setPlaceholder("Select category").setMinValues(1).setMaxValues(1).setCustomId('support_ticket_selectCategory')
for(let category of client.config.categories) {
    client.categories.addOptions([
        new MessageSelectMenuOption().setLabel(category.menu.label).setDescription(category.menu.description).setDefault(category.menu.default).setValue(category.value)
    ])
}

client.on("ready", () => {
    console.log("ready")
})

client
    .on("log", console.log)
    .on("debug", console.log)

process.on('uncaughtException', console.log)
    .on('unhandledRejection', console.log);

client.login(process.env.token)
