const { MessageEmbed, Message, MessageAttachment } = require("discord.js");
const { MessageButton, MessageActionRow } = require("gcommands/src");

module.exports = {
    name: "clickButton",
    once: false,
    run: async(client, button) => {
        if(button.customId !== "support_ticket_create") await button.defer();

        let buttonMember = button.clicker.member;
        let guild = button.guild;

        if(button.customId == "support_ticket_create") {
            let allChannels = client.channels.cache.filter(m => ["GUILD_TEXT","text"].includes(m.type) && m.name.includes("ticket-")).map(m => m.name.split("ticket-")[1]);
            
            let already = allChannels.some(v => buttonMember.user.id == v)
            if(already === true) {
                return button.reply.send({ 
                    content: "Sorry, you already have ticket.",
                    ephemeral: true
                })
            }

            button.reply.send({
                content: "Creating ticket...",
                ephemeral: true
            })

            let ticketChannel = await guild.channels.create(`ticket-${buttonMember.user.id}`, {
                type: "text",
                topic: `${buttonMember.user.username}'s ticket`,
                parent: client.tickets.category,
                permissionOverwrites: [
                    {
                        id: buttonMember.id,
                        allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                    },
                    {
                        id: guild.roles.everyone,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: client.tickets.moderatorRole,
                        allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                    }
                ]
            })

            let supportEmbed = new MessageEmbed()
                .setColor("#32a852")
                .setDescription("Support will be with you shortly.\nTo close this ticket react with :lock:")
                .setFooter("By Hyro#8938")
                .setTimestamp();

            let supportButton = new MessageButton()
                .setLabel("Close")
                .setEmoji("🔒")
                .setStyle("gray")
                .setCustomId(`ticket_close_${ticketChannel.id}`)

            let claimButton = new MessageButton()
                .setLabel("Claim")
                .setEmoji("📌")
                .setStyle("gray")
                .setCustomId(`ticket_claim_${ticketChannel.id}`)   
            
            ticketChannel.send({
                content: `<@${buttonMember.user.id}> Welcome!`, 
                embeds: supportEmbed, 
                allowedMentions: { parse: ["users"] },
                components: new MessageActionRow().addComponent(supportButton).addComponent(claimButton)
            })

            button.reply.edit({
                content: `Your ticket has been created. ${ticketChannel}`,
                ephemeral: true
            })
        }

        if(button.customId == `ticket_close_${button.channel.id}`) {
            let ticketChannel = button.channel;
            let createdBy = client.users.cache.get(ticketChannel.name.split("ticket-")[1]) || client.users.cache.get(ticketChannel.name.split("ticket-claimed-")[1]) || client.users.cache.get(ticketChannel.name.split("ticket-closed-")[1])

            let yes = new MessageButton().setLabel("Yes").setEmoji("✅").setStyle("gray").setCustomId(`ticket_close_yes_${buttonMember.user.id}`)
            let no = new MessageButton().setLabel("No").setEmoji("❌").setStyle("gray").setCustomId(`ticket_close_no_${buttonMember.user.id}`)

            let msg = await ticketChannel.send({content: `${buttonMember.user} Do you really want close ticket?`, components: new MessageActionRow().addComponent(yes).addComponent(no)})
            let filter = (interaction) => interaction.isButton() && buttonMember.user.id == interaction.member.user.id
            let collected = await msg.awaitMessageComponents(filter, { max: 1, time: 60000, errors: ["time"] })
            if(!collected || collected.size < 0) return msg.delete(); 
            msg.delete();

            let closedEmbed = new MessageEmbed()
                .setColor("#4287f5")
                .setDescription(`Ticket closed by <@${collected.first().member.user.id}>\nTicket created by <@${createdBy.id}>\n\n🔓 Reopen Ticket\n📛 Delete Ticket\n💨 Archive Ticket\n💫 Transcript Ticket`)

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
                parentID: client.tickets.closedCategory,
                permissionOverwrites: [
                    {
                        id: createdBy.id,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: guild.roles.everyone,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: client.tickets.moderatorRole,
                        allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                    }
                ]
            })

            button.channel.send({embeds: closedEmbed, components: new MessageActionRow().addComponents([reopen, deleteButton, archiveButton, transcriptButton])})
        }

        if(button.customId == `ticket_reopen_${button.channel.id}`) {
            let ticketChannel = button.channel;
            let createdBy = client.users.cache.get(ticketChannel.name.split("ticket-")[1]) || client.users.cache.get(ticketChannel.name.split("ticket-claimed-")[1]) || client.users.cache.get(ticketChannel.name.split("ticket-closed-")[1])

            let allMessages = await ticketChannel.messages.fetch()
            let systemMessages = allMessages.filter(m => m.embeds && m.author.id == client.user.id);
            systemMessages.forEach(msg => {msg.delete()})

            let supportEmbed = new MessageEmbed()
                .setColor("#32a852")
                .setDescription("Support will be with you shortly.\nTo close this ticket react with :lock:")
                .setFooter("By Hyro#8938")
                .setTimestamp();

            let supportButton = new MessageButton()
                .setLabel("Close")
                .setEmoji("🔒")
                .setStyle("gray")
                .setCustomId(`ticket_close_${ticketChannel.id}`)

            let claimButton = new MessageButton()
                .setLabel("Claim")
                .setEmoji("📌")
                .setStyle("gray")
                .setCustomId(`ticket_claim_${ticketChannel.id}`)
            
            ticketChannel.edit({
                name: `ticket-${createdBy.id}`,
                parentID: client.tickets.category,
                permissionOverwrites: [
                    {
                        id: createdBy.id,
                        allow: ["VIEW_CHANNEL"]
                    },
                    {
                        id: guild.roles.everyone,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: client.tickets.moderatorRole,
                        allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                    }
                ]
            })

            ticketChannel.send({content: `<@${createdBy}> Welcome back!`, embeds: supportEmbed, components: new MessageActionRow().addComponents([supportButton, claimButton])})
        }

        if(button.customId == `ticket_delete_${button.channel.id}`) {
            let ticketChannel = button.channel;

            let deleteEmbed = new MessageEmbed()
                .setColor("#f54257")
                .setDescription("Ticket deleted in 5s")
            
            ticketChannel.send({embeds: deleteEmbed})
            setTimeout(() => {ticketChannel.delete()}, 5000);
        }

        if(button.customId == `ticket_archive_${button.channel.id}`) {
            let ticketChannel = button.channel;
            let createdBy = client.users.cache.get(ticketChannel.name.split("ticket-")[1]) || client.users.cache.get(ticketChannel.name.split("ticket-claimed-")[1]) || client.users.cache.get(ticketChannel.name.split("ticket-closed-")[1])

            let allMessages = await ticketChannel.messages.fetch()
            let systemMessages = allMessages.filter(m => m.embeds && m.author.id == client.user.id);
            systemMessages.forEach(msg => {msg.delete()})

            let archiveEmbed = new MessageEmbed()
                .setColor("#f5bf42")
                .setDescription("The ticket has been archived. You can just delete it.")

            button.channel.edit({
                name: `ticket-archived-${createdBy}`,
                parentID: client.tickets.archiveCategory,
                permissionOverwrites: [
                    {
                        id: createdBy.id,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: guild.roles.everyone,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: client.tickets.moderatorRole,
                        deny: ["SEND_MESSAGES"]
                    }
                ]
            })

            button.channel.send({embeds: archiveEmbed})
        }

        if(button.customId == `ticket_transcript_${button.channel.id}`) {
            let ticketChannel = button.channel;

            let allMessages = await ticketChannel.messages.fetch()
            let systemMessages = allMessages.filter(m => m.content && m.author.id != client.user.id && !m.author.bot).map(m => msToTime(m.createdTimestamp) +" | "+ m.author.tag + ": " + m.cleanContent).join("\n");
            if(!systemMessages) systemMessages = "No messages were found."

            let attch = new MessageAttachment(Buffer.from(systemMessages), `saved_transcript_${button.channel.id}.txt`)
            ticketChannel.send({
                content: `${button.clicker.user} your transcript is ready!`,
                attachments: [attch]
            })
        }

        if(button.customId == `ticket_claim_${button.channel.id}`) {
            let ticketChannel = button.channel;
            let createdBy = client.users.cache.get(ticketChannel.name.split("ticket-")[1]) || client.users.cache.get(ticketChannel.name.split("ticket-claimed-")[1]) || client.users.cache.get(ticketChannel.name.split("ticket-closed-")[1])

            if(!button.member._roles.includes(client.tickets.moderatorRole)) return;

            let claimEmbed = new MessageEmbed()
                .setColor("#f5bf42")
                .setDescription(`${button.clicker.user} claimed this ticket.`)

            button.channel.edit({
                name: `ticket-claimed-${createdBy}`,
                parentID: client.tickets.claimedCategory,
                permissionOverwrites: [
                    {
                        id: createdBy.id,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: guild.roles.everyone,
                        deny: ["VIEW_CHANNEL"]
                    },
                    {
                        id: client.tickets.moderatorRole,
                        deny: ["SEND_MESSAGES"]
                    }
                ]
            })

            button.channel.send({embeds: claimEmbed})
        }    
        
        function msToTime(ms) {
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
}
