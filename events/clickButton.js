const { MessageEmbed, MessageAttachment, MessageActionRow, MessageButton } = require("discord.js");
const { Event } = require("gcommands");

module.exports = class extends Event {
    constructor(...args) {
        super(...args, {
            name: "interactionCreate",
            ws: false,
            once: false
        })
    }

    async run(client, button) {
        if(!button.isButton()) return;

        if(button.customId !== 'support_ticket_create') button.deferReply();

        if(button.customId === 'support_ticket_create') {
            let msg = await button.reply({
                content: 'Select category',
                ephemeral: true,
                fetchReply: true,
                components: [new MessageActionRow().addComponents([client.categories])]
            })

            let filter = (i) => i.isSelectMenu() && msg.id === i.message.id && button.user.id === i.user.id && i.customId === 'support_ticket_selectCategory';
            let collector = await button.channel.awaitMessageComponent({ filter, max: 1, time: 30000 }).catch(e => e);
            if(!collector) button.editReply('Time :(');

            let findChannels = client.config.categories.find(c => c.value === String(collector.values[0]));

            let alrCreated = collector.guild.channels.cache.filter(m => m.parentId === findChannels.channels.category && ["GUILD_TEXT","text"].includes(m.type) && m.name.includes("ticket-") && m.name.split("-")[1] === collector.user.id);
            if(alrCreated.size > 0) {
                return collector.reply({
                    content: client.config.alreadyTicket,
                    ephemeral: true
                })
            }

            let perms = findChannels.roles.moderator.map(id => {
                return {
                    id: id,
                    allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                }
            })

            let ticketChannel = await collector.guild.channels.create(`ticket-${collector.user.id}`, {
                type: "text",
                topic: `${collector.user.username}'s ticket`,
                parent: findChannels.channels.category,
                permissionOverwrites: [
                    {
                        id: collector.user.id,
                        allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                    },
                    {
                        id: collector.guild.roles.everyone,
                        deny: ["VIEW_CHANNEL"]
                    },
                    ...perms
                ]
            })

            let supportEmbed = new MessageEmbed()
                .setColor(findChannels.embed.open.color).setDescription(findChannels.embed.open.description).setFooter(findChannels.embed.open.footer);
            
            if(findChannels.embed.open.timestamp) supportEmbed.setTimestamp();

            let supportButton = new MessageButton()
                .setLabel("Close")
                .setEmoji("🔒")
                .setStyle("gray")
                .setCustomId(`support_ticket_close`)
            
            ticketChannel.send({
                content: findChannels.embed.open.text.replace("{USER}", `<@${collector.user.id}>`), 
                embeds: [supportEmbed], 
                allowedMentions: { parse: ["users"] },
                components: [new MessageActionRow().addComponent(supportButton)]
            })

            collector.reply({
                content: `Your ticket has been created. ${ticketChannel}`,
                ephemeral: true
            })
            return;
        }
        
        if(button.customId === 'support_ticket_close') {
            let ticketChannel = button.channel;
            let createdBy = client.users.cache.get(ticketChannel.name.split('-').slice(-1)[0]);

            let findChannels = client.config.categories.find(c => Object.values(c.channels).includes(ticketChannel.parentId));
            let perms = findChannels.roles.moderator.map(id => {
                return {
                    id: id,
                    allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                }
            })

            let yes = new MessageButton().setLabel("Yes").setEmoji("✅").setStyle("gray").setCustomId(`ticket_close_yes_${button.user.id}`)
            let no = new MessageButton().setLabel("No").setEmoji("❌").setStyle("gray").setCustomId(`ticket_close_no_${button.user.id}`)

            let msg = await ticketChannel.send({content: `${button.user} Do you really want close ticket?`, components: new MessageActionRow().addComponent(yes).addComponent(no)})
            let filter = (interaction) => interaction.isButton() && button.user.id == interaction.member.user.id && interaction?.message?.id === msg.id;
            let collected = await msg.awaitMessageComponent({ filter, max: 1, time: 60000, errors: ["time"] }).catch(e => e);
            if(!collected) return msg.delete().catch(e => {}); 
            msg.delete().catch(e => {});

            let closedEmbed = new MessageEmbed()
                .setColor("#4287f5")
                .setDescription(findChannels.embed.close.description.replace("{CLOSEDBY}", `<@${collected.first().user.id}>`).replace("{CREATEDBY}", `<@${createdBy.id}>`))

            let reopen = new MessageButton()
                .setLabel("Reopen")
                .setCustomId(`ticket_reopen_${ticketChannel.id}`)
                .setEmoji("🔓")
                .setStyle("green")
            
            let deleteButton = new MessageButton()
                .setLabel("Delete")
                .setCustomId(`ticket_delete_${ticketChannel.id}`)
                .setEmoji("📛")
                .setStyle("red")

            let archiveButton = new MessageButton()
                .setLabel("Archive")
                .setCustomId(`ticket_archive_${ticketChannel.id}`)
                .setEmoji("💨")
                .setStyle("gray")

            let transcriptButton = new MessageButton()
                .setLabel("Transcript")
                .setCustomId(`ticket_transcript_${ticketChannel.id}`)
                .setEmoji("💫")
                .setStyle("gray")

            button.channel.edit({
                name: `ticket-closed-${createdBy.id}`,
                parent: client.channels.cache.get(findChannels.channels.closed),
                permissionOverwrites: [
                    {
                        id: createdBy.id,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: collected.first().guild.roles.everyone,
                        deny: ["VIEW_CHANNEL"]
                    },
                    ...perms
                ]
            })

            button.channel.send({
                embeds: [closedEmbed],
                components: [new MessageActionRow().addComponents([reopen, deleteButton, archiveButton, transcriptButton])]
            })
            return;
        }

        if(button.customId.includes('ticket_reopen')) {
            let channel = button.channel;
            let createdBy = channel.name.split('-').slice(-1)[0];

            let allMessages = await channel.messages.fetch()
            let systemMessages = allMessages.filter(m => m.embeds && m.author.id == client.user.id);
            systemMessages.forEach(msg => {msg.delete().catch(e => {})})

            let findChannels = client.config.categories.find(c => Object.values(c.channels).includes(channel.parentId));

            let supportEmbed = new MessageEmbed()
                .setColor(findChannels.embed.open.color).setDescription(findChannels.embed.open.description).setFooter(findChannels.embed.open.footer);
            
            if(findChannels.embed.open.timestamp) supportEmbed.setTimestamp();

            let supportButton = new MessageButton()
                .setLabel("Close")
                .setEmoji("🔒")
                .setStyle("gray")
                .setCustomId(`support_ticket_close`)
            
            channel.edit({
                name: `ticket-${createdBy}`,
                parent: client.channels.cache.get(findChannels.channels.category),
            })

            channel.send({
                content: findChannels.embed.open.text.replace("{USER}", `<@${createdBy}>`), 
                embeds: [supportEmbed], 
                allowedMentions: { parse: ["users"] },
                components: [new MessageActionRow().addComponent(supportButton)]
            })
            return;
        }

        if(button.customId.includes('ticket_delete')) {
            let channel = button.channel;
            channel.delete();
            return;
        }

        if(button.customId.includes('ticket_transcript')) {
            let channel = button.channel;

            let allMessages = await channel.messages.fetch();
            let systemMessages = allMessages.filter(m => m.content && m.author.id != client.user.id && !m.author.bot).map(m => this.msToTime(m.createdTimestamp) +" | "+ m.author.tag + ": " + m.cleanContent).join("\n");
            if(!systemMessages) systemMessages = "No messages were found."

            let attch = new MessageAttachment(Buffer.from(systemMessages), `saved_transcript_${channel.id}.txt`);
            channel.send({
                content: `${button.clicker.user} your transcript is ready!`,
                attachments: [attch]
            })
            return;
        }

        if(button.customId.includes('ticket_archive')) {
            let channel = button.channel;
            let createdBy = client.users.cache.get(channel.name.split('-').slice(-1)[0]);

            let findChannels = client.config.categories.find(c => Object.values(c.channels).includes(channel.parentId));

            let allMessages = await channel.messages.fetch()
            let systemMessages = allMessages.filter(m => m.embeds && m.author.id == client.user.id);
            systemMessages.forEach(msg => {msg.delete()})

            let perms = findChannels.roles.moderator.map(id => {
                return {
                    id: id,
                    allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                }
            })

            let archiveEmbed = new MessageEmbed()
                .setColor("#f5bf42")
                .setDescription("The ticket has been archived. You can just delete it.")

            button.channel.edit({
                name: `ticket-archived-${createdBy}`,
                parent: findChannels.channels.archived,
                permissionOverwrites: [
                    {
                        id: createdBy.id,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: button.guild.roles.everyone,
                        deny: ["VIEW_CHANNEL"]
                    },
                    ...perms
                ]
            })

            channel.send({embeds: [archiveEmbed]})
            return;
        }
    }

    msToTime(ms) {
        let fullFill = (a, limit) => ("0".repeat(69) + a.toString()).slice(limit ? -limit : -2);

        let daet = new Date(ms);
        
        let day = fullFill(daet.getDate());
        let month = fullFill(daet.getMonth());
        let year = fullFill(daet.getFullYear(), 4);
        
        let hours = fullFill(daet.getHours());
        let mins = fullFill(daet.getMinutes());
        let secs = fullFill(daet.getSeconds());
        
        return `${day}/${month}/${year} ${hours}:${mins}:${secs}`;
    }
}