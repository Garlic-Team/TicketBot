const { Structures } = require("discord.js");
const ButtonCollector = require("gcommands/src/structures/v12/ButtonCollector");

module.exports = Structures.extend("TextChannel", TextChannel => {
    class GTextChannel extends TextChannel {
        constructor(...args) {
            super(...args)
        }

        async send(content, options) {
            if(!options) options = {};

            var embed = null;
            if(typeof content == "object") {
                embed = content;
                content = "\u200B"
            }
    
            if (!options.components) {
                options.components = [];
            }
    
            if(!options.allowedMentions) {
                options.allowedMentions = { parse: [] };
            }
    
            if(!Array.isArray(options.components)) options.components = [options.components];
            options.components = options.components;
    
            if(options.embeds) embed = options.embeds
    
            return this.client.api.channels[this.id].messages.post({
                data: {
                    allowed_mentions: options.allowedMentions,
                    content: content,
                    components: options.components,
                    options,
                    embed: embed || null
                }
            })
            .then(d => this.client.actions.MessageCreate.handle(d).message);
        }

        createButtonCollector(msg, filter, options = {}) {
            return new ButtonCollector(msg, filter, options);
        }
    
        awaitButtons(msg, filter, options = {}) {
            return new Promise((resolve, reject) => {
                const collector = this.createButtonCollector(msg, filter, options);
                collector.once('end', (buttons, reason) => {
                    if (options.errors && options.errors.includes(reason)) {
                        reject(buttons);
                    } else {
                        resolve(buttons);
                    }
                });
            })
        }
    }

    return GTextChannel;
})