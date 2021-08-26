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
      .setAuthor(process.env.embedAuthor)
      .setDescription(process.env.embedDescription)
      .setColor(process.env.embedColor)
      .setFooter(process.env.embedFooter);

    if (process.env.embedTimestampEnabled === true) embed.setTimestamp()

    let button = new MessageButton()
      .setLabel("Support")
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
