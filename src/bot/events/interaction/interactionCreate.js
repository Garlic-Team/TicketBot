const { Event } = require('gcommands');
const Ticket = require('../../structures/Ticket');

class Interaction extends Event {
    constructor(client) {
        super(client, {
            name: 'interactionCreate',
            ws: false,
            once: false,
        });
    }

    async run(client, interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'create_ticket') {
            const ticket = new Ticket(interaction);

            ticket.selectCategory();
        }

        if (interaction.customId === 'ticket_close') {
            const ticket = new Ticket(interaction);

            ticket.closeTicket()
        }

        if (interaction.customId === 'ticket_reopen') {
            const ticket = new Ticket(interaction);

            ticket.reopenTicket()
        }

        if (interaction.customId === 'ticket_transcript') {
            const ticket = new Ticket(interaction);

            ticket.transcriptTicket()
        }

        if (interaction.customId === 'ticket_delete') {
            const ticket = new Ticket(interaction);

            ticket.deleteTicket()
        }
    }
}

module.exports = Interaction;
