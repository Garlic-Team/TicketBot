const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { Command } = require("gcommands");

class Send extends Command {
    constructor(client) {
        super(client, {
            name: 'send',
            description: 'Send ticket panel',
            guildOnly: '747526604116459691',
            userRequiredPermissions: ['MANAGE_GUILD']
        });
    }

    run({ client, respond }) {
        const embed = new MessageEmbed()
            .setAuthor(client.config.embed.author)
            .setDescription(client.config.embed.description)
            .setColor(client.config.embed.color)
            .setFooter(client.config.embed.footer)

        if (client.config.embed.timestamp) embed.setTimestamp();

        const row = new MessageActionRow()
            .addComponents([
                new MessageButton()
                    .setLabel(client.config.button.label)
                    .setStyle(client.config.button.style)
                    .setCustomId('create_ticket')
            ])

        respond({
            embeds: [embed],
            components: [row]
        })
    }
}

module.exports = Send;