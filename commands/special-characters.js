const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require("discord.js");
const { embedColor } = require('./theme.json')
const ephemeral = MessageFlags.Ephemeral

module.exports = {
    data: new SlashCommandBuilder()
        .setName('special-characters')
        .setDescription('Get a list of special characters'),
    
    async execute(interaction, client) {
        const skyblock = [
            '❁', '❤', '♥', '❈', '❂', '✦', '✎', '☣', '☠', '⚔', '⫽', '✯', '♣', 'α', '๑',
            '⸕', '✧', '☘', '⸎', 'ʬ', '♨', '᠅', '≈', '☠', '❣', '✆', '✪', '➊', '➋', '➌', '➍', '➎',
            '☀', '☽', '⏣', '✌', '♲', '☀', '☠', '⚠', '◆', '✿', '♪', '♫', '⓪', 'ⓩ', '▲', '⁍', '❤',
            '✦', '⚚', '✖', '✔', '➜', '✯', '☠', '﴾', '﴿', '☬', '☄', '⚑', 'Ⓑ', '✦', '☺', '✧', '♞',
            '✷', '❤', '❈', '✎', '❁', '☘', '⸕', '✧', '❂', '☠', '☤', '⚔', '✦', '❂', '⦾', '⦾',
            '⦾', '⦾', '⦾', '☂', '☯', '☄', '♨', '❣', '♨', 'ﬗ', 'Ⓐ', 'Ⓑ', 'Ⓒ', 'Ⓓ', 'ቾ', '⚒',
            'ᝐ', '҉', '⁑', 'Ѫ', 'ᛤ', '⋗', '¦', '▬', '⚡', '▶', '▁', '▂', '▃', '▄', '▅', '▆', '■',
            '♢', '○', '∞', '©', '∫', '•', '‣', 'ℏ'
        ]

        const skyblockFormatted = skyblock.map(ch => `\`${ch}\``).join(' ')

        const embed = new EmbedBuilder()
            .setTitle('Special Characters')
            .setDescription(`
**SkyBlock** ${skyblockFormatted} [Source](https://hypixel.net/threads/every-skyblock-stat-skill-item-symbol-for-item-creation-ideas.5230474/)`)
            .setColor(embedColor)
            .setFooter({ text: 'Powered by trip' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: ephemeral });
    }
}
