const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require("discord.js");
const { embedColor } = require('./theme.json')
const { skyblock, boxes, arrows } = require('./assets/icons.json')
const EPHEMERAL = MessageFlags.Ephemeral

module.exports = {
    data: new SlashCommandBuilder()
        .setName('special-characters')
        .setDescription('Get a list of special characters'),
    
    async execute(interaction, client) {

        const embed = new EmbedBuilder()
            .setTitle('Special Characters')

            .setDescription(
`Use these Characters to spice up your Text

**SkyBlock**
${format(skyblock)} [Source](https://hypixel.net/threads/every-skyblock-stat-skill-item-symbol-for-item-creation-ideas.5230474/)

**Box Drawing**
${format(boxes)}

**Arrows**
${format(arrows)}`
)

            .setColor(embedColor)
            .setFooter({ text: 'Powered by trip' })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
}

function format(list) {
    let r = ""
    for (const subList of list) {
        r += subList.join(' ') + '\n'
    }
    return r
} 
