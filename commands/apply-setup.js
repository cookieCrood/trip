const { SlashCommandBuilder } = require("discord.js");
const SetupHandler = require("../util/SetupHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply-setup')
        .setDescription('Apply your current setup'),
    
    async execute(interaction, client) {
        await interaction.editReply('.')
        await interaction.deleteReply()
        SetupHandler.grab(client, interaction.guild.id)
    }
}