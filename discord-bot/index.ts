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

    const warcupStartEmbed = new Discord.MessageEmbed()
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

    newsChannel.send(warcupStartEmbed);
});
