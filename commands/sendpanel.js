const { MessageEmbed } = require("discord.js");
const { MessageButton, MessageActionRow } = require("gcommands/src");

module.exports = {
    name: "sendpanel",
    description: "Send panel :O",
    guildOnly: "747526604116459691",
    slash: false,
    userRequiredPermissions: "ADMINISTRATOR",
    run: async({client, respond}) => {
      let embed = new MessageEmbed()
        .setAuthor("Support")
        .setDescription("You may ask any questions you have about the @Karot bot.")
        .setColor("#fcba03")
        .setFooter("By Hyro#8938")
        .setTimestamp();

      let button = new MessageButton()
        .setLabel("Support")
        .setStyle("red")
        .setID("support_ticket_create")

      respond({
        content: embed,
        ephemeral: true,
        components: new MessageActionRow().addComponent(button)
      })
  }
};