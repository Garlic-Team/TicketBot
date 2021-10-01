const { MessageEmbed } = require("discord.js");
const { MessageButton, MessageActionRow, Command } = require("gcommands");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "sendpanel",
      description: "Send panel :O",
      guildOnly: "747526604116459691",
      userRequiredPermissions: "ADMINISTRATOR",   
    })
  }

  async run({client, channel, respond}) {
    let embed = new MessageEmbed()
      .setAuthor(client.config.embed.author)
      .setDescription(client.config.embed.description)
      .setColor(client.config.embed.color)
      .setFooter(client.config.embed.footer);

    if (client.config.embed.timestamp === true) embed.setTimestamp()

    let button = new MessageButton()
      .setLabel("Create")
      .setStyle("red")
      .setCustomId("support_ticket_create")

    respond({
      content: "Sended!",
      ephemeral: true
    })

    channel.send({
      content: embed,
      inlineReply: false,
      components: new MessageActionRow().addComponents([button])
    })
  }
};
