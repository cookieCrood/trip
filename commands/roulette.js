const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { embedColor } = require('./theme.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roulette')
        .setDescription('Test OUR luck')
        .addBooleanOption((option) =>
            option
                .setName('fair')
                .setDescription('Is this a fair game?')
                .setRequired(true)
        ),
    
    async execute(interaction, client) {
        await interaction.deferReply();

        const players = ['trip', interaction.user.displayName]

        const isFair = interaction.options.getBoolean('fair');
        const gameMode = isFair ? "Fair Game" : "Unfair Game";

        const embed = new EmbedBuilder()
            .setTitle('Communism Roulette')
            .setDescription(`WE are testing OUR luck in a **${gameMode}**`)
            .setColor(embedColor)
            .setFooter({ text: 'Powered by trip' })
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });

        for (let i = 0; i < 6; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const bullet = Math.floor(Math.random() * (6 - i)) == 0

            embed.addFields([
                { name: players[i % 2], value: `Round ${i+1}: ${bullet ? '**BANG!** :boom:' : 'Click :dash:'}` }
            ])
            if (bullet) {
                embed.addFields([
                    { name: 'Game over!', value: `${players[i % 2]} is died${ !isFair && i % 2 == 0 ? `\n\n**But** the game is unfair so **${interaction.user.displayName}** dies\ngg ez :v:`: ''}` }
                ])
                if (!isFair) i == 1
                embed.setDescription(`WE were testing OUR luck in a **${gameMode}**\n\nBut **${players[i % 2]}** decided to die\nR.I.P. King fly high :wilted_flower:`)
                return interaction.editReply({ embeds: [embed] })
            }
            await interaction.editReply({ embeds: [embed] })
        }
    }
}
