const config = require('./config.json');

import * as Discord from 'discord.js';

const client: Discord.Client = new Discord.Client();

client.login(config.BOT_TOKEN);

client.on('ready', () => {
    if (client.user) {
        console.log(`${client.user.tag} is online!`);
    }

    // Getting the channel from client.channels Collection.
    const newsChannel: Discord.TextChannel | undefined = client.channels.cache.get('762053640047296548') as Discord.TextChannel;

    if (!newsChannel) {
        return console.error("Couldn't find the channel.");
    }

    // newsChannel.send(
    //     `Hi! I'm DFComps bot. I will send messages about ongoing competitions. In time I will be able to do a lot more,
    //     so stay tuned and check https://dfcomps.ru/discord-bot to see the list of available commands.`,
    // );

    // Type 1: Competition start
    const competitionStartEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('WarCup #303 start!')
        .setURL('https://dfcomps.ru/news/465')
        .setDescription(
            [
                '**Map**: BardoK-Rum',
                '**Start**: 03.10.2020 19:30 GMT',
                '**Finish**: 10.10.2020 19:30 GMT',
                '**Author**: BardoK',
                '**Weapons**: Plasma',
                '**Download**: http://ws.q3df.org/maps/downloads/BardoK-Rum.pk3 (0.22MB)',
            ].join('\n'),
        )
        .setImage('https://ws.q3df.org/images/levelshots/512x384/BardoK-Rum.jpg')
        .setTimestamp()
        .setFooter('https://dfcomps.ru/news/465');

    // Type 2: Competition end
    const warcupEndEmbed = new Discord.MessageEmbed()
        .setColor('#39be27')
        .setTitle('WarCup #301 finish!')
        .setURL('https://dfcomps.ru/news/465')
        .setDescription(
            `**Map**: bug73
            **Finish**: 03.10.2020 19:30 GMT,
            **Weapons**: Rocket

            **VQ3 (top 3):**
            \:flag_ru: \`${formatNick('uN*DeaD|w00dy-', 1)} | 36:766\`
            \:flag_ru: \`${formatNick('haze', 2)} | 40:504\`
            \:flag_ru: \`${formatNick('[fps]Proky', 3)} | 42:152\`

            **CPM (top 3):**
            \:flag_ru: \`${formatNick('uN*DeaD|w00dy-', 1)} | 36:766\`
            \:flag_ru: \`${formatNick('haze', 2)} | 40:504\`
            \:flag_ru: \`${formatNick('[fps]Proky', 3)} | 42:152\``,
        )
        .setThumbnail('https://ws.q3df.org/images/levelshots/512x384/bug73.jpg')
        .setTimestamp()
        .setFooter('https://dfcomps.ru/news/777');

    // Type 3: duel result
    const duelResult = new Discord.MessageEmbed()
        .setColor('#00ffde')
        .setTitle(`\:flag_ru: oblepiha wins a duel vs \:flag_ru: podokarpus`)
        .setURL('https://dfcomps.ru/1v1/777')
        .setThumbnail('https://ws.q3df.org/images/levelshots/512x384/cityrocket.jpg')
        .setDescription(`
            **Map**: cityrocket

            \`${formatNick('oblepiha', 1)} | 54.216 | +15 rating points\`
            \`${formatNick('podokarpus', 2)} | 58.768 | -15 rating points \`
        `)
        .setFooter('https://dfcomps.ru/1v1/777');

    newsChannel.send(duelResult);
});

function formatNick(nick: string, place: number): string {
    return `${place}. ${nick.padEnd(15, ' ')}`;
}
