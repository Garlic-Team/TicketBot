require("dotenv").config()
const { Intents, MessageSelectMenu } = require('discord.js')
const { GCommandsClient } = require("gcommands");

const client = new GCommandsClient({
    loader: {
        cmdDir: __dirname + "/commands/",
        eventDir: __dirname + "/events/",
    },
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
        {
            label: category.menu.label,
            description: category.menu.description,
            default: category.menu.default,
            value: category.value
        }
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
