const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const { embedColor } = require('./theme.json')
const ephemeral = MessageFlags.Ephemeral

module.exports = {
    data: new SlashCommandBuilder()
        .setName('font')
        .setDescription('Generate text in cool fonts')
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('Text to generate')
                .setRequired(true)
        ),
    
    async execute(interaction, client) {
        const str = interaction.options.getString('text');
        const data = getFonted(str);

        const embed = new EmbedBuilder()
            .setTitle('Font Generator')
            .setColor(embedColor)
            .setDescription(`**Original** \`${str}\`\n${data}\n\nIssued by ${interaction.user}`)
            .setFooter({ text: 'Powered by trip' })
            .setTimestamp()

        await interaction.reply({ embeds: [embed], flags: ephemeral });
    }
};

function getFonted(text) {
    const fancyMap = {
        A: 'Ａ', B: 'Ｂ', C: 'Ｃ', D: 'Ｄ', E: 'Ｅ', F: 'Ｆ', G: 'Ｇ',
        H: 'Ｈ', I: 'Ｉ', J: 'Ｊ', K: 'Ｋ', L: 'Ｌ', M: 'Ｍ', N: 'Ｎ',
        O: 'Ｏ', P: 'Ｐ', Q: 'Ｑ', R: 'Ｒ', S: 'Ｓ', T: 'Ｔ', U: 'Ｕ',
        V: 'Ｖ', W: 'Ｗ', X: 'Ｘ', Y: 'Ｙ', Z: 'Ｚ',
        a: 'ａ', b: 'ｂ', c: 'ｃ', d: 'ｄ', e: 'ｅ', f: 'ｆ', g: 'ｇ',
        h: 'ｈ', i: 'ｉ', j: 'ｊ', k: 'ｋ', l: 'ｌ', m: 'ｍ', n: 'ｎ',
        o: 'ｏ', p: 'ｐ', q: 'ｑ', r: 'ｒ', s: 'ｓ', t: 'ｔ', u: 'ｕ',
        v: 'ｖ', w: 'ｗ', x: 'ｘ', y: 'ｙ', z: 'ｚ'
    };

    const cuteMap = {
        a: 'ɑ', b: 'ʙ', c: 'ᴄ', d: 'ɖ', e: 'ҽ', f: 'ƒ', g: 'ɢ',
        h: 'հ', i: 'ɨ', j: 'ʝ', k: 'ҡ', l: 'ʟ', m: 'ʍ', n: 'ռ',
        o: 'օ', p: 'ք', q: 'զ', r: 'ʀ', s: 'Տ', t: 'ƚ', u: 'ʊ',
        v: 'ʋ', w: 'ա', x: 'հ', y: 'ʏ', z: 'ȥ'
    };

    const smallMap = {
        a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ',
        h: 'ʰ', i: 'ᶦ', j: 'ʲ', k: 'ᵏ', l: 'ˡ', m: 'ᵐ', n: 'ᶰ',
        o: 'ᵒ', p: 'ᵖ', q: 'ᑫ', r: 'ʳ', s: 'ˢ', t: 'ᵗ', u: 'ᵘ',
        v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ'
    };

    const circleMap = {
        a: 'ⓐ', b: 'ⓑ', c: 'ⓒ', d: 'ⓓ', e: 'ⓔ', f: 'ⓕ', g: 'ⓖ',
        h: 'ⓗ', i: 'ⓘ', j: 'ⓙ', k: 'ⓚ', l: 'ⓛ', m: 'ⓜ', n: 'ⓝ',
        o: 'ⓞ', p: 'ⓟ', q: 'ⓠ', r: 'ⓡ', s: 'ⓢ', t: 'ⓣ', u: 'ⓤ',
        v: 'ⓥ', w: 'ⓦ', x: 'ⓧ', y: 'ⓨ', z: 'ⓩ'
    };

    const smallCapsMap = {
        a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ',
        h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ',
        o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ',
        v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
    };

    const mapText = (str, map) => {
        return str.split('').map(char => {
            const lower = char.toLowerCase();
            const upper = char.toUpperCase();
            return map[char] || map[lower] || map[upper] || char;
        }).join('');
    };

    return `
**Fancy Font** \`${mapText(text, fancyMap)}\`
**Cute Font** \`${mapText(text, cuteMap)}\`
**Small Font** \`${mapText(text, smallMap)}\`
**Circled Font** \`${mapText(text, circleMap)}\`
**Small Caps Font** \`${mapText(text, smallCapsMap)}\``
    
}
