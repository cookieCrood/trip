const MessageParser = require("./MessageParser")

class SetupHandler {
    static setup = {}
    static setupTemplate = {
        "joinleave": {
            "JOIN":false,
            "LEAVE":false,
            "CHANNEL":false
        },
        "autoreply": {},
        "blackjack": {
            "PLAYER_BLACKJACK": "Setup this message using\n`@BLACKJACK\n#PLAYER_BLACKJACK`",
            "DEALER_BLACKJACK": "Setup this message using\n`@BLACKJACK\n#DEALER_BLACKJACK`",
            "PLAYER_BUST": "Setup this message using\n`@BLACKJACK\n#PLAYER_BUST`",
            "DEALER_BUST": "Setup this message using\n`@BLACKJACK\n#DEALER_BUST`",
            "PLAYER_HIGHER": "Setup this message using\n`@BLACKJACK\n#PLAYER_HIGHER`",
            "DEALER_HIGHER": "Setup this message using\n`@BLACKJACK\n#DEALER_HIGHER`",
            "PUSH": "Setup this message using `\n@BLACKJACK\n#PUSH`"
        }
    }

    static async grab(client, guild = false) {
        let setupChannels = []
        if (guild) {
            setupChannels = client.channels.cache.filter(channel => {
                return channel.name === 'trip-setup' && channel.type === 0 && channel.guildId === guild
            })
        } else {
            setupChannels = client.channels.cache.filter(channel => {
                return channel.name === 'trip-setup' && channel.type === 0
            })
        }

        for (const channel of setupChannels.values()) {
            try {
                const setupMessage = await this.getSetupMessage(channel)
                if (!setupMessage) continue

                const guildId = channel.guildId;
                const setup = setupMessage.content.split('@START')[1].split('@END')[0].trim();

                this.setup[guildId] = this.setupTemplate

                this.parseSetup(setup, guildId)

            } catch (error) {
                console.error(`Failed parsing channel in ${client.guilds.cache.get(channel.guildId)}:`, error)
            }
        }
    }

    static async getSetupMessage(channel) {
        try {
            const messages = await channel.messages.fetch({ limit: 2 });
            return messages.size === 1 ? messages.first() : false;
        } catch (err) {
            console.error(`Error fetching messages in #${channel.name}:`, err);
            return false;
        }
    }

    static async parseSetup(setup, guildId) {
        let isOpened = false
        let currentSection = ''

        const lines = setup.split('\n')

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i]

            if (line == '@OPEN' && !isOpened) {
                isOpened = true
                i++
                currentSection = lines[i].substring(1)
                continue

            } else if (line == '@CLOSE' && isOpened) {
                isOpened = false
                continue

            } else if (isOpened) {
                switch (currentSection.split(' ')[0]) {
                    case 'AUTOREPLY': {
                        const args = line.split('=>')
                        this.setup[guildId].autoreply[args[0]] = args[1]
                    }
                    case 'BLACKJACK': {
                        const args = line.split(/ (.+)/, 2)
                        if (!args[0].startsWith('#')) continue
                        args[0] = args[0].substring(1)

                        if (Object.keys(this.setupTemplate.blackjack).includes(args[0])) {
                            this.setup[guildId].blackjack[args[0]] = args[1]
                        }
                    }
                    case 'JOINLEAVE': {
                        const args = line.split(/ (.+)/, 2)
                        if (!args[0].startsWith('#')) continue
                        args[0] = args[0].substring(1)

                        if (Object.keys(this.setupTemplate.joinleave).includes(args[0])) {
                            this.setup[guildId].joinleave[args[0]] = args[0] == "CHANNEL" ? args[1].trim().substring(2).substring(0, args[1].length - 3) : args[1]
                        }
                    }
                }
            }
        }
    }

    static async tryAutoreply(message) {
        const content = message.content
        const autoreply = (this.setup[message.guild.id] || {autoreply: {}}).autoreply[content]

        if (autoreply) {
            return message.reply(autoreply)
        }
    }

    static async tryJoin(member, client) {
        const setup = this.setup[member.guild.id]
        if (!setup) return

        const join = this.setup[member.guild.id].joinleave.JOIN
        const channelId = this.setup[member.guild.id].joinleave.CHANNEL

        console.log(join, channelId)
        if (join && channelId) {
            const channel = client.channels.cache.get(channelId)
            if (!channel) return
            channel.send(MessageParser.parse(join, {userId: member.id}, {user:true}))
        }
    }

    static async tryLeave(member, client) {
        const leave = this.setup[member.guild.id].joinleave.LEAVE
        const channelId = this.setup[member.guild.id].joinleave.CHANNEL
        if (leave && channelId) {
            const channel = client.channels.cache.get(channelId)
            if (!channel) return
            channel.send(MessageParser.parse(leave, {userId: member.id}, {user:true}))
        }
    }

}

module.exports = SetupHandler;
