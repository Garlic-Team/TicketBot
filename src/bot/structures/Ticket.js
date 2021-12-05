const { MessageActionRow, MessageEmbed, MessageButton, MessageAttachment } = require('discord.js');
const Utils = require('./Utils');

class Ticket {
    constructor(interaction) {
        this.client = interaction.client;
        this.interaction = interaction;

        this.member = interaction.member;
        this.user = interaction.user;
        
        this.guild = interaction.guild;
        this.channel = interaction.channel;

        this.customId = interaction.customId;
    }

    async selectCategory() {
        const embed = new MessageEmbed()
            .setAuthor(this.client.config.selectEmbed.author)
            .setDescription(this.client.config.selectEmbed.description)
            .setColor(this.client.config.selectEmbed.color)
            .setFooter(this.client.config.selectEmbed.footer)

        if (this.client.config.selectEmbed.timestamp) embed.setTimestamp();

        const message = await this.interaction.reply({
            embeds: [embed],
            ephemeral: true,
            fetchReply: true,
            components: [ new MessageActionRow().addComponents([this.client.categories]) ]
        })

        const filter = (i) => i.message?.id === message.id;
        const collector = await this.channel.awaitMessageComponent({ filter, max: 1, time: 60000 }).catch(e => {});

        if(!collector) this.interaction.editReply('Out of time :(');

        const category = this.client.config.categories.find(c => c.value === collector.values[0]);

        if(this.alreadyExist(category)) 
            return collector.reply({
                content: this.client.config.alreadyTicket,
                ephemeral: true
            })

        this.createTicket(category);
    }

    async createTicket(category) {
        const channel = await this.guild.channels.create(`ticket-${this.user.id}`, {
            type: 'GUILD_TEXT',
            topic: `${this.user.tag}'s ticket'`,
            parent: category.channels.category,
            permissionOverwrites: [
                {
                    id: this.user.id,
                    allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
                },
                {
                    id: this.guild.roles.everyone,
                    deny: ["VIEW_CHANNEL"]
                },
                ...this.getPermissions(category)
            ]
        })

        const supportMessage = this.getSupportMessage(category);
        channel.send({
            content: category.embed.open.text.replace("{USER}", this.user.toString()), 
            embeds: [supportMessage[0]],
            components: [supportMessage[1]]
        })

        this.interaction.editReply({
            content: `Your ticket has been created. ${channel.toString()}`,
            components: [],
            embeds: []
        })
    }

    async closeTicket(ignorCollector) {
        const creator = this.client.users.cache.get(this.channel.name.split('-').slice(-1)[0]);

        const category = this.client.config.categories.find(c => Object.values(c.channels).includes(this.channel.parentId));

        const message = await this.interaction.reply({
            content: `${this.user.toString()} Do you really want to close ticket?`,
            components: [
                new MessageActionRow().addComponents([
                    new MessageButton().setLabel("Yes").setEmoji("✅").setStyle("SUCCESS").setCustomId('ticket_close_yes'),
                    new MessageButton().setLabel("No").setEmoji("❌").setStyle("DANGER").setCustomId('ticket_close_no')
                ])
            ],
            fetchReply: true
        })

        const filter = (i) => i.user.id === this.user.id && i.message?.id === message.id;
        const collector = await this.channel.awaitMessageComponent({ filter, max: 1, time: 60000 }).catch(e => {});

        if (!collector) return this.interaction.deleteReply();
        if (collector.customId === 'ticket_close_no') return this.interaction.deleteReply();

        await collector.deferUpdate();

        this.channel.edit({
            name: `ticket-closed-${creator.id}`,
            parent: category.channels.closed,
            permissionOverwrites: [
                {
                    id: creator.id,
                    deny: ["VIEW_CHANNEL"]
                },
                {
                    id: this.guild.roles.everyone,
                    deny: ["VIEW_CHANNEL"]
                },
                ...this.getPermissions(category)
            ]
        })

        this.interaction.editReply({
            content: null,
            embeds: [
                new MessageEmbed()
                    .setColor("#4287f5")
                    .setDescription(category.embed.close.description.replace("{CLOSEDBY}", this.user.toString()).replace("{CREATEDBY}", creator.toString()))
            ],
            components: [
                new MessageActionRow().addComponents([
                    new MessageButton()
                        .setLabel("Reopen")
                        .setCustomId('ticket_reopen')
                        .setEmoji("🔓")
                        .setStyle("SUCCESS"),
                    new MessageButton()
                        .setLabel("Delete")
                        .setCustomId('ticket_delete')
                        .setEmoji("📛")
                        .setStyle("DANGER"),
                    new MessageButton()
                        .setLabel("Transcript")
                        .setCustomId('ticket_transcript')
                        .setEmoji("💫")
                        .setStyle("SECONDARY")
                ])
            ]
        })
    }

    reopenTicket() {
        this.interaction.deferUpdate();
        
        const creator = this.client.users.cache.get(this.channel.name.split('-').slice(-1)[0]);
        const category = this.client.config.categories.find(c => Object.values(c.channels).includes(this.channel.parentId));

        this.channel.edit({
            name: `ticket-${creator.id}`,
            parent: category.channels.category,
            permissionOverwrites: [
                {
                    id: creator.id,
                    allow: ["VIEW_CHANNEL"]
                },
                {
                    id: this.guild.roles.everyone,
                    allow: ["VIEW_CHANNEL"]
                },
                ...this.getPermissions(category)
            ]
        })

        this.interaction.message.delete();
    }

    deleteTicket() {
        this.interaction.deferUpdate();

        if (this.member.permissions.has('MANAGE_CHANNELS')) this.channel.delete();
        else this.closeTicket();
    }

    async transcriptTicket() {
        this.interaction.deferUpdate();

        let messages = await this.channel.messages.fetch();

        messages = messages.filter(m => m.content && m.author.id != this.client.user.id && !m.author.bot).map(m => Utils.msToTime(m.createdTimestamp) +" | "+ m.author.tag + ": " + m.cleanContent).join("\n") || "No messages were found.";

        this.channel.send({
            files: [
                new MessageAttachment(Buffer.from(messages), `transcript_${this.channel.id}.txt`)
            ]
        })
    }

    getSupportMessage(category) {
        return [
            new MessageEmbed()
                .setColor(category.embed.open.color)
                .setDescription(category.embed.open.description)
                .setFooter(category.embed.open.footer),
            
            new MessageActionRow().addComponents([
                new MessageButton()
                    .setLabel("Close")
                    .setEmoji("🔒")
                    .setStyle("SECONDARY")
                    .setCustomId(`ticket_close`)
            ])
        ]
    }

    getPermissions(category) {
        return category.roles.moderator.map(id => {
            return {
                id: id,
                allow: ["SEND_MESSAGES","VIEW_CHANNEL"]
            }
        });
    }

    alreadyExist(category) {
        return !!this.guild.channels.cache.find(channel => 
            channel.parentId === category.channels.category &&
            channel.type === 'GUILD_TEXT' &&
            channel.name.includes('ticket-') &&
            channel.name.split('-')[1] === this.user.id
        )
    }
}

module.exports = Ticket;