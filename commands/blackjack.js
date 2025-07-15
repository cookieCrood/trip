const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags, escapeHeading } = require("discord.js");
const { embedColor } = require('./theme.json')

const SetupHandler = require('../util/SetupHandler')
const MessageParser = require('../util/MessageParser')

const EPHEMERAL = MessageFlags.Ephemeral
const MESSAGE_PARSING_FLAGS = { user:true }

const RANKS = {
    "0": "A",
    "1": "2",
    "2": "3",
    "3": "4",
    "4": "5",
    "5": "6",
    "6": "7",
    "7": "8",
    "8": "9",
    "9": "10",
    "10": "J",
    "11": "Q",
    "12": "K"
}

const SUITS = {
    "0": ":spades:",
    "1": ":hearts:",
    "2": ":diamonds:",
    "3": ":clubs:"
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Gambling')

        .addIntegerOption((option) =>
            option
                .setName('bet')
                .setDescription('Bet')
                .setMinValue(0)
                .setMaxValue(10_000)
                .setRequired(false)),
    
    async execute(interaction, client) {
        const setup = SetupHandler.setup[interaction.guild.id].blackjack
        const playerCards = []
        for (let i = 0; i < 2; i++) {
            playerCards.push(getRandomCard(buildDeck(playerCards)))
        }
        const dealerCards = []
        for (let i = 0; i < 2; i++) {
            dealerCards.push(getRandomCard(buildDeck([...dealerCards, ...playerCards])))
        }

        const isPlayerBlackjack = analyse(playerCards) == 21
        const isDealerBlackjack = analyse(dealerCards) == 21

        const isAnyBlackjack = isPlayerBlackjack || isDealerBlackjack

        const embed = new EmbedBuilder()
            .setTitle('Blackjack')
            .setDescription(`**${interaction.user.tag}** is Gambling\nwith a bet of **${interaction.options.getInteger('bet') || 'zero'}** :coin:`)
            .setColor(embedColor)
            .setFooter({ text: 'Powered by trip' })
            .setTimestamp()

            .addFields([
            {
                name: interaction.user.tag,
                value: playerCards.map(prettifyCard).join(' '),
                inline: true
            },
            {
                name: 'Total',
                value: `>> **${analyse(playerCards)}** <<${isPlayerBlackjack ? ' **BLACKJACK**' : ''}`,
                inline: true
            },
            {
                name: '\u200B',
                value: '\u200B',
                inline: true
            },



            {
                name: 'Dealer',
                value: `${prettifyCard(dealerCards[0])} ${isDealerBlackjack ? prettifyCard(dealerCards[1]) : ':question:'}`,
                inline: true
            },
            {
                name: 'Total',
                value: isDealerBlackjack
                    ? `>> **${analyse(dealerCards)}** << **BLACKJACK**`
                    : '>> **??** <<',
                inline: true
            },
            {
                name: '\u200B',
                value: '\u200B',
                inline: true
            }
        ])

        const row = new ActionRowBuilder()
        let response = false

        if (!isAnyBlackjack) {
            buildRow(row, playerCards, dealerCards)
        } else {
            if (isPlayerBlackjack && isDealerBlackjack) {
                response = MessageParser.parse(setup.PUSH, interaction, MESSAGE_PARSING_FLAGS)
            } else if (isPlayerBlackjack) {
                response = MessageParser.parse(setup.PLAYER_BLACKJACK, { userId: interaction.user.id }, MESSAGE_PARSING_FLAGS)
            } else {
                response = MessageParser.parse(setup.DEALER_BLACKJACK, { userId: interaction.user.id }, MESSAGE_PARSING_FLAGS)
            }
        }
        
        await interaction.editReply(!isAnyBlackjack ? { embeds: [embed], components: [row] } : { embeds: [embed], components: [] })
        if (response) interaction.followUp(response)
    },

    async buttons(interaction, client) {
        const setup = SetupHandler.setup[interaction.guild.id].blackjack
        await interaction.editReply({ content:'.' })
        interaction.deleteReply()

        const oldMessage = await interaction.message

        if (oldMessage.interaction.user.id != interaction.user.id) {
            return
        }

        const playerCards = interaction.customId.split(':')[2].split(',')
        const dealerCards = interaction.customId.split(':')[3].split(',')

        const embed = oldMessage.embeds[0]

        switch (interaction.customId.split(':')[1]) {
            case 'hit': {
                playerCards.push(getRandomCard(buildDeck([...playerCards, ...dealerCards])))

                const isBusted = analyse(playerCards) > 21
                const isPlayerBlackjack = analyse(playerCards) == 21

                const end = isBusted || isPlayerBlackjack

                embed.fields[0].value = playerCards.map(prettifyCard).join(' ')
                embed.fields[1].value = `>> **${analyse(playerCards)}** <<${isBusted ? ' **BUSTED**' : (isPlayerBlackjack ? ' **BLACKJACK**' : '')}`

                const row = new ActionRowBuilder()

                if (!end) {
                    buildRow(row, playerCards, dealerCards)
                } else {
                    let response = 'ERROR'

                    if (isBusted) {
                        response = MessageParser.parse(setup.PLAYER_BUST, { userId: interaction.user.id }, MESSAGE_PARSING_FLAGS)
                    } else if (isPlayerBlackjack) {
                        response = MessageParser.parse(setup.PLAYER_BLACKJACK, { userId: interaction.user.id }, MESSAGE_PARSING_FLAGS)
                    }
                    oldMessage.reply(response)
                }
            
                await oldMessage.edit(!end ? { embeds: [embed], components: [row] } : { embeds: [embed], components: [] })

                break
            }
            case 'stand': {
                while (analyse(dealerCards) < 17) {
                    dealerCards.push(getRandomCard(buildDeck([...playerCards, ...dealerCards])))
                }

                embed.fields[3].value = dealerCards.map(prettifyCard).join(' ')

                let result = MessageParser.parse(setup.DEALER_BUST, { userId: interaction.user.id }, MESSAGE_PARSING_FLAGS)

                if (analyse(dealerCards) > 21) {
                    embed.fields[4].value = `>> **${analyse(dealerCards)}** << **BUSTED**`

                } else if (analyse(dealerCards) > analyse(playerCards)) {
                    embed.fields[4].value = `>> **${analyse(dealerCards)}** <<`
                    result = MessageParser.parse(setup.DEALER_HIGHER, { userId: interaction.user.id }, MESSAGE_PARSING_FLAGS)

                } else if (analyse(dealerCards) == analyse(playerCards)) {
                    embed.fields[4].value = `>> **${analyse(dealerCards)}** <<`
                    result = MessageParser.parse(setup.PUSH, { userId: interaction.user.id }, MESSAGE_PARSING_FLAGS)

                } else {
                    embed.fields[4].value = `>> **${analyse(dealerCards)}** <<`
                    result = MessageParser.parse(setup.PLAYER_HIGHER, { userId: interaction.user.id }, MESSAGE_PARSING_FLAGS)

                }

                await oldMessage.edit({ embeds: [embed], components: [] })
                oldMessage.reply({ content: result })
                break
            }
            case 'double': {
                playerCards.push(getRandomCard(buildDeck([...playerCards, ...dealerCards])))

                const playerTotal = analyse(playerCards)
                const isBusted = playerTotal > 21
                const isPlayerBlackjack = playerTotal === 21

                embed.fields[0].value = playerCards.map(prettifyCard).join(' ')
                embed.fields[1].value = `>> **${playerTotal}** <<${isBusted ? ' **BUSTED**' : (isPlayerBlackjack ? ' **BLACKJACK**' : '')}`

                let resultMessage

                if (isBusted) {
                    embed.fields[4].value = '>> **??** <<'
                    resultMessage = MessageParser.parse(setup.PLAYER_BUST, { userId: interaction.user.id }, MESSAGE_PARSING_FLAGS)
                } else {
                    while (analyse(dealerCards) < 17) {
                        dealerCards.push(getRandomCard(buildDeck([...playerCards, ...dealerCards])))
                    }

                    const dealerTotal = analyse(dealerCards)
                    embed.fields[3].value = dealerCards.map(prettifyCard).join(' ')
                    embed.fields[4].value = `>> **${dealerTotal}** <<${dealerTotal > 21 ? ' **BUSTED**' : ''}`

                    if (dealerTotal > 21) {
                        resultMessage = MessageParser.parse(setup.DEALER_BUST, { userId: interaction.user.id }, MESSAGE_PARSING_FLAGS)
                    } else if (dealerTotal > playerTotal) {
                        resultMessage = MessageParser.parse(setup.DEALER_HIGHER, { userId: interaction.user.id }, MESSAGE_PARSING_FLAGS)
                    } else if (dealerTotal < playerTotal) {
                        resultMessage = MessageParser.parse(setup.PLAYER_HIGHER, { userId: interaction.user.id }, MESSAGE_PARSING_FLAGS)
                    } else {
                        resultMessage = MessageParser.parse(setup.PUSH, { userId: interaction.user.id }, MESSAGE_PARSING_FLAGS)
                    }
                }

                await oldMessage.edit({ embeds: [embed], components: [] })
                await oldMessage.reply(resultMessage)

                break
            }
        }
    }
}

function prettifyCard(code) {
    const suit = code[0]
    const rank = code.slice(1)
    return `${SUITS[suit]}${RANKS[rank]}`
}


function buildDeck(exept) {
    let deck = []
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 13; j++) {
            let card = `${i}${j}`;
            if (exept.includes(card)) continue
            deck.push(card)
        }
    }
    return deck
}

function analyse(cards) {
    let total = 0;
    let aces = 0;

    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const rank = Number(card.slice(1));

        if (rank === 0) {
            aces++;
            total += 11;
        } else if (rank > 9) {
            total += 10;
        } else {
            total += rank + 1;
        }
    }

    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    return total;
}


function getRandomCard(deck) {
    return deck[Math.floor(Math.random() * deck.length)]
}

function buildRow(row, playerCards, dealerCards){
    const hitButton = new ButtonBuilder()
        .setLabel('Hit')
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`blackjack:hit:${playerCards.join(',')}:${dealerCards.join(',')}`)
    
    const standButton = new ButtonBuilder()
        .setLabel('Stand')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(`blackjack:stand:${playerCards.join(',')}:${dealerCards.join(',')}`)
    
    const doubleButton = new ButtonBuilder()
        .setLabel('Double')
        .setStyle(ButtonStyle.Danger)
        .setCustomId(`blackjack:double:${playerCards.join(',')}:${dealerCards.join(',')}`)
    
    row.addComponents(hitButton, standButton, doubleButton)
}