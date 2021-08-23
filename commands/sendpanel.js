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
      .setAuthor("Support")
      .setDescription("You may ask any questions you have about the Garlic Team.")
      .setColor("#fcba03")
      .setFooter("By Hyro#8938")
      .setTimestamp();

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
