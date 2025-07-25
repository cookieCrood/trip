const { Client, Events, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, Collection } = require("discord.js");
const {token} = require("./config.json")
const fs = require('node:fs')
const SetupHandler = require('./util/SetupHandler')

const { MessageFlags, ButtonStyle } = require('discord-api-types/v10');
const EPHEMERAL = MessageFlags.Ephemeral

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences
	],
});

client.commands = getCommands('./commands');

client.logQueue = []


client.log = async () => {
    if (client.logQueue.length) client.consoleChannel.send(`\`\`\`ansi\n${client.logQueue.join('\n')}\n\`\`\``)
    client.logQueue = []
}

client.logInteraction = (interaction) => {
    client.logQueue.push(`\u001b[0;1;31m${interaction.customId ? "Button" : "Interaction"} \u001b[0;1m${interaction.customId ? interaction.customId : interaction}\u001b[0;31m ran by \u001b[0;1m${interaction.user.tag} \u001b[0;34m[${interaction.user.id}] \u001b[0;31min \u001b[0;1m${interaction.guild.name}`)
}

client.once(Events.ClientReady, (c) => {
    console.log(`Logged in as ${c.user.tag}`);
    client.consoleChannel = client.channels.cache.get('1389684748837982328')
    setTimeout(loopLog, 30_000)
    SetupHandler.grab(client)
    
});

client.on(Events.InteractionCreate, (interaction) => {

    console.log(`Interaction: ${interaction.customId || interaction} | ran by ${interaction.user.tag} or ${interaction.user.id} | in ${interaction.guild.name}`)
    client.logInteraction(interaction)

    interaction.deferReply().then(() => {
        if (!interaction.isChatInputCommand()) {
            buttons(interaction, client)
            return
        }

        let command = client.commands.get(interaction.commandName)

        try{
            if(interaction.replied) return;
            command.execute(interaction, client)
        } catch (error) {
            console.error(error);
        }
    })
});

client.on(Events.GuildMemberAdd, (member) => {
    console.log(member)
    SetupHandler.tryJoin(member, client)
})

client.on(Events.GuildMemberRemove, (member) => {
    SetupHandler.tryLeave(member, client)
})

client.on(Events.MessageCreate, (message) => {
    SetupHandler.tryAutoreply(message)
})

client.login(token);

function buttons(interaction, client) {

    if (interaction.customId) {

        client.commands.get(interaction.customId.split(':')[0]).buttons(interaction, client)

    }
}

function getCommands(dir) {
    let commands = new Collection();
    const commandFiles = getFiles(dir)

    for (const commandFile of commandFiles) {
        const command = require(commandFile);
        commands.set(command.data.toJSON().name, command)
    }
    return commands;
}

function getFiles(dir) {

    const files = fs.readdirSync(dir, {
        withFileTypes: true
    })
    let commandFiles = [];

    for (const file of files) {
        if(file.isDirectory()) {
            commandFiles = [
                ...commandFiles,
                ...getFiles(`${dir}/${file.name}`)
            ]
        } else if (file.name.endsWith(".js")) {
            commandFiles.push(`${dir}/${file.name}`)
        }
    }
    return commandFiles;
}

function loopLog() {
    client.log()
    setTimeout(loopLog, 30_000)
}