const config = require('./config.json');

import * as Discord from 'discord.js';
import axios, { AxiosResponse } from 'axios';
import moment from 'moment';
import { NewsInterfaceUnion } from './interfaces/news-union.type';
import { from, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NewsTypes } from './interfaces/news-types.enum';

const client: Discord.Client = new Discord.Client();

let newsChannelsInfo: Record<string, { newsChannels: { name: string; postedNews: string[] }[] }> = {
    'DFComps Bot Testing Server': {
        newsChannels: [{ name: 'general', postedNews: ['461', '454', '456', '458'] }],
    },
};

client.login(config.BOT_TOKEN);

client.on('ready', () => {
    if (client.user) {
        console.log(`${client.user.tag} is online!`);
    }

    Object.keys(newsChannelsInfo).forEach((serverName: string) =>
        newsChannelsInfo[serverName].newsChannels.forEach((newsChannelInfo: { name: string; postedNews: string[] }) =>
            setSubscription(serverName, newsChannelInfo.name),
        ),
    );

    // newsChannel.send(
    //     `Hi! I'm DFComps bot. I will send messages about ongoing competitions. In time I will be able to do a lot more, so stay tuned and check https://dfcomps.ru/discord-bot to see the list of available commands.`,
    // );

    // Type 3: duel result
    const duelResult = new Discord.MessageEmbed()
        .setColor('#00ffde')
        .setTitle(`\:flag_ru: oblepiha wins a duel vs \:flag_ru: podokarpus`)
        .setURL('https://dfcomps.ru/1v1/777')
        .setThumbnail('https://ws.q3df.org/images/levelshots/512x384/cityrocket.jpg')
        .setDescription(
            `
            **Map**: cityrocket

            \`${formatNick('oblepiha', 1)} | 54.216 | +15 rating points\`
            \`${formatNick('podokarpus', 2)} | 58.768 | -15 rating points \`
        `,
        )
        .setFooter('https://dfcomps.ru/1v1/777');
});

client.on('message', (message: Discord.Message) => {
    if (!message.content.startsWith('!')) {
        return;
    }

    // TODO
    // !dfcomps-help
    // !dfcomps-my-stats
    // !dfcomps-cup-info

    if (message.content.startsWith('!dfcomps-warcup-suggest')) {
        const map: string | undefined = message.content.split(' ')[1];

        if (map) {
            if (map.includes('gneg')) {
                message.reply(`no gnegs for warcups`);
            } else {
                message.reply(`thanks for you suggestion!`);
            }
        } else {
            message.reply(`no map specified`);
        }
    }

    // admin and mods probably
    if (message.member && message.member.hasPermission('MUTE_MEMBERS')) {
        if (message.content.startsWith('!dfcomps-add-news-channel')) {
            const channelName: string | undefined = message.content.split(' ')[1];

            if (channelName) {
                const serverChannel = (client.channels.cache as Discord.Collection<string, Discord.TextChannel>).find(
                    (discordChannel: Discord.TextChannel) => discordChannel.type === 'text' && discordChannel.name === channelName,
                );

                if (serverChannel) {
                    setSubscription(serverChannel.guild.name, channelName);
                    message.reply(`added news channel ${channelName} to server \`${serverChannel.guild.name}\``);
                } else {
                    message.reply(`cannot find text channel ${channelName}`);
                }
            }
        }

        if (message.content.startsWith('!dfcomps-list-news-channels')) {
            // TODO
            // message.reply(`current news channels are: ${newsChannels.join(', ')}`);
        }

        if (message.content.startsWith('!dfcomps-remove-news-channel')) {
            const channel: string | undefined = message.content.split(' ')[1];

            // TODO
            // if (channel) {
            //     if (newsChannels.find((c) => c === channel)) {
            //         message.reply(`removed news channel ${channel}`);
            //     } else {
            //         message.reply(`channel ${channel} not found`);
            //     }
            //     newsChannels = newsChannels.filter((c) => c !== channel);
            // }
        }
    }
});

function formatNick(nick: string, place: number): string {
    return `${place}. ${nick.padEnd(15, ' ')}`;
}

function postNews(newsChannel: Discord.TextChannel, news: NewsInterfaceUnion) {
    if (news.type === NewsTypes.OFFLINE_START) {
        const competitionStartEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(news.headerEn)
            .setURL(`https://dfcomps.ru/news/${news.id}`)
            .setDescription(
                [
                    `**Map**: ${news.cup.map1}`,
                    `**Start**: ${moment(news.cup.startDateTime).add(-3, 'hours').format('DD.MM.YYYY HH:mm')} GMT`,
                    `**Finish**: ${moment(news.cup.endDateTime).add(-3, 'hours').format('DD.MM.YYYY HH:mm')} GMT`,
                    `**Author**: ${news.cup.mapAuthor}`,
                    `**Weapons**: ${mapWeapons(news.cup.mapWeapons)}`,
                    `**Download**: ${news.cup.mapPk3} (${news.cup.mapSize}MB)`,
                ].join('\n'),
            )
            .setImage(`http://ws.q3df.org/images/levelshots/512x384/${news.cup.map1}.jpg`)
            .setTimestamp()
            .setFooter(`https://dfcomps.ru/news/${news.id}`);

        newsChannel.send(competitionStartEmbed);
    }
    if (news.type === NewsTypes.OFFLINE_RESULTS) {
        const competitionEndEmbed = new Discord.MessageEmbed()
            .setColor('#39be27')
            .setTitle(news.headerEn)
            .setURL(`https://dfcomps.ru/news/${news.id}`)
            .setDescription(
                `**Map**: ${news.cup.map1}
                **Finish**: ${moment(news.cup.endDateTime).add(-3, 'hours').format('DD.MM.YYYY HH:mm')} GMT
                **Weapons**: ${mapWeapons(news.cup.mapWeapons)}

                **VQ3 (top 3):**
                \:flag_${news.vq3Results.valid[0].country}: \`${formatNick(news.vq3Results.valid[0].nick, 1)} | ${news.vq3Results.valid[0].time.replace(
                    '.',
                    ':',
                )}\`
                \:flag_${news.vq3Results.valid[1].country}: \`${formatNick(news.vq3Results.valid[1].nick, 2)} | ${news.vq3Results.valid[1].time.replace(
                    '.',
                    ':',
                )}\`
                \:flag_${news.vq3Results.valid[2].country}: \`${formatNick(news.vq3Results.valid[2].nick, 3)} | ${news.vq3Results.valid[2].time.replace(
                    '.',
                    ':',
                )}\`

                **CPM (top 3):**
                \:flag_${news.cpmResults.valid[0].country}: \`${formatNick(news.cpmResults.valid[0].nick, 1)} | ${news.cpmResults.valid[0].time.replace(
                    '.',
                    ':',
                )}\`
                \:flag_${news.cpmResults.valid[1].country}: \`${formatNick(news.cpmResults.valid[1].nick, 2)} | ${news.cpmResults.valid[1].time.replace(
                    '.',
                    ':',
                )}\`
                \:flag_${news.cpmResults.valid[2].country}: \`${formatNick(news.cpmResults.valid[2].nick, 3)} | ${news.cpmResults.valid[2].time.replace(
                    '.',
                    ':',
                )}\`
            `,
            )
            .setThumbnail(`http://ws.q3df.org/images/levelshots/512x384/${news.cup.map1}.jpg`)
            .setTimestamp()
            .setFooter(`https://dfcomps.ru/news/${news.id}`);

        newsChannel.send(competitionEndEmbed);
    }
}

function mapWeapons(weapons: string): string {
    const weaponMap: Record<string, string> = {
        G: 'Grenade',
        R: 'Rocket',
        P: 'Plasma',
        B: 'BFG',
        U: 'Gauntlet',
        S: 'Shotgun',
        L: 'Lightning',
        I: 'Railgun',
        H: 'Grappling hook',
    };

    return weapons
        .split('')
        .map((weaponLetter: string) => weaponMap[weaponLetter])
        .join(', ');
}

function setSubscription(serverName: string, channelName: string): void {
    const server = client.guilds.cache.find((s) => s.name === serverName);

    if (!server) {
        return;
    }

    const newsChannel = server.channels.cache.find((c) => c.name === channelName && c.type === 'text') as Discord.TextChannel;

    if (!newsChannel) {
        return;
    }

    if (!newsChannelsInfo[serverName]) {
        newsChannelsInfo = { ...newsChannelsInfo, [serverName]: { newsChannels: [] } };
    }

    if (!newsChannelsInfo[serverName].newsChannels.find((c) => c.name === channelName)) {
        newsChannelsInfo = {
            ...newsChannelsInfo,
            [serverName]: { newsChannels: [...newsChannelsInfo[serverName].newsChannels, { name: channelName, postedNews: [] }] },
        };
    }

    // TODO change to interval and general subscription
    timer(0)
        .pipe(
            switchMap(() => from(axios.get('https://dfcomps.ru/api/news/mainpage'))),
            map(({ data }: AxiosResponse) => data),
            map((news: NewsInterfaceUnion[]) =>
                news
                    .filter((newsElem: NewsInterfaceUnion) => [NewsTypes.OFFLINE_START, NewsTypes.OFFLINE_RESULTS].includes(newsElem.type))
                    .filter((newsElem: NewsInterfaceUnion) => {
                        const newsChannel = newsChannelsInfo[serverName].newsChannels.find((c) => c.name === channelName);

                        return newsChannel ? !newsChannel.postedNews.includes(newsElem.id) : false;
                    }),
            ),
        )
        .subscribe((news: NewsInterfaceUnion[]) =>
            news.forEach((newsElem: NewsInterfaceUnion) => {
                const foundChannel = newsChannelsInfo[serverName].newsChannels.find((c) => c.name === channelName);

                if (foundChannel) {
                    foundChannel.postedNews.push(newsElem.id);
                    postNews(newsChannel, newsElem);
                }
            }),
        );
}
