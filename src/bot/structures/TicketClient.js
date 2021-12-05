const { MessageSelectMenu } = require('discord.js');
const { GCommandsClient } = require('gcommands');
const path = require('path');

class TicketClient extends GCommandsClient {
    constructor(options) {
        super(options);

        this.token = options.token;
        this.categories = null;
    }

    get config() {
        return require(path.join(__dirname, '../../../config.json'));
    }

    parseConfig() {
        const categories = new MessageSelectMenu()
            .setPlaceholder('Select')
            .setMinValues(1)
            .setMaxValues(1)
            .setCustomId('select_category');

        categories.addOptions(this.config.categories.map(category => {
            return {
                label: category.menu.label,
                description: category.menu.description,
                default: category.menu.default,
                value: category.value
            }
        }))

        this.categories = categories;

        this.run();
    }

    run() {
        this.login(this.token);
    }
}

module.exports = TicketClient;