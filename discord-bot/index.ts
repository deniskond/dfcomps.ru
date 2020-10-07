const config = require('./config.json');

import * as Discord from 'discord.js';
import axios, { AxiosResponse } from 'axios';
import moment from 'moment';
import fs from 'fs';
import { NewsInterfaceUnion } from './interfaces/news-union.type';
import { from, interval, ReplaySubject, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NewsTypes } from './interfaces/news-types.enum';

const client: Discord.Client = new Discord.Client();
const news$ = new ReplaySubject<NewsInterfaceUnion[]>(1);
const subscriptions: Map<string, Subscription> = new Map();

let newsChannelsInfo: Record<string, { newsChannels: { name: string; postedNews: string[] }[] }> = {};

client.login(config.BOT_TOKEN);

client.on('ready', () => {
    if (client.user) {
        console.log(`${client.user.tag} is online!`);
    }

    restoreFromFile();
    setupGeneralSubscription();

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

    // TODO add error logging 

    // TODO
    // !dfcomps-my-stats
    // !dfcomps-cup-info
    // !dfcomps-link-account

    // TODO
    // if (message.content.startsWith('!dfcomps-warcup-suggest')) {
    //     const map: string | undefined = message.content.split(' ')[1];

    //     if (map) {
    //         if (map.includes('gneg')) {
    //             message.reply(`no gnegs for warcups`);
    //         } else {
    //             message.reply(`thanks for you suggestion!`);
    //         }
    //     } else {
    //         message.reply(`no map specified`);
    //     }
    // }

    if (message.content.startsWith('!dfcomps-help')) {
        message.reply(
            `bot commands list:\n` +
            `\`!dfcomps-add-news-channel {channel-name}\` adds channel to dfcomps news posting list (only works for admins and mods)\n` +
            `\`!dfcomps-list-news-channels\` lists all channels in dfcomps news posting list (only works for admins and mods)\n` +
            `\`!dfcomps-remove-news-channel {channel-name}\` removes channel from dfcomps news posting list (only works for admins and mods)\n`,
        );
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
                    if (newsChannelsInfo[serverChannel.guild.name] && newsChannelsInfo[serverChannel.guild.name].newsChannels.find((c) => c.name === channelName)) {
                        message.reply(`channel ${channelName} already added`);

                        return;
                    }

                    setSubscription(serverChannel.guild.name, channelName);
                    message.reply(`added news channel ${channelName} to server \`${serverChannel.guild.name}\``);
                } else {
                    message.reply(`cannot find text channel ${channelName}`);
                }
            }
        }

        if (message.content.startsWith('!dfcomps-list-news-channels')) {
            const serverName: string | undefined = message.guild?.name;

            if (serverName && newsChannelsInfo[serverName]) {
                const channelsList = newsChannelsInfo[serverName].newsChannels.map((c) => c.name);

                if (channelsList.length) {
                    message.reply(`current news channels are: ${channelsList.join(', ')}`);
                } else {
                    message.reply(`no news channels for this server`);
                }
            } else {
                message.reply(`no news channels for this server`);
            }
        }

        if (message.content.startsWith('!dfcomps-remove-news-channel')) {
            const channel: string | undefined = message.content.split(' ')[1];
            const serverName: string | undefined = message.guild?.name;

            if (!channel) {
                message.reply(`no channel name specified`);

                return;
            }

            if (serverName && newsChannelsInfo[serverName] && newsChannelsInfo[serverName].newsChannels.find((c) => c.name === channel)) {
                newsChannelsInfo[serverName].newsChannels = newsChannelsInfo[serverName].newsChannels.filter((c) => c.name !== channel);
                subscriptions.get(JSON.stringify({ serverName, channelName: channel }))?.unsubscribe();
                subscriptions.delete(JSON.stringify({ serverName, channelName: channel }));
                message.reply(`news channel ${channel} removed`);
                saveToFile();
            } else {
                message.reply(`no such news channel`);
            }
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
        saveToFile();
    }

    if (!newsChannelsInfo[serverName].newsChannels.find((c) => c.name === channelName)) {
        newsChannelsInfo = {
            ...newsChannelsInfo,
            [serverName]: { newsChannels: [...newsChannelsInfo[serverName].newsChannels, { name: channelName, postedNews: [] }] },
        };
        saveToFile();
    }

    subscriptions.set(
        JSON.stringify({ serverName, channelName }),
        news$
            .pipe(
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
                        newsChannelsInfo[serverName].newsChannels = [
                            ...newsChannelsInfo[serverName].newsChannels.filter((c) => c.name !== foundChannel.name),
                            foundChannel,
                        ];
                        saveToFile();
                    }
                }),
            ),
    );
}

function setupGeneralSubscription(): void {
    interval(60000)
        .pipe(
            switchMap(() => from(axios.get('https://dfcomps.ru/api/news/mainpage'))),
            map(({ data }: AxiosResponse) => data),
            map((news: NewsInterfaceUnion[]) =>
                news
                    .filter((newsElem: NewsInterfaceUnion) => [NewsTypes.OFFLINE_START, NewsTypes.OFFLINE_RESULTS].includes(newsElem.type))
                    .filter((newsElem: NewsInterfaceUnion) => moment(newsElem.datetimezone).isSameOrAfter(moment(new Date()).add(-5, 'hours'))),
            ),
        )
        .subscribe((news: NewsInterfaceUnion[]) => news$.next(news));
}

function saveToFile(): void {
    fs.writeFile('db.txt', JSON.stringify(newsChannelsInfo), () => {});
}

function restoreFromFile(): void {
    fs.readFile('db.txt', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }

        try {
            newsChannelsInfo = JSON.parse(data);

            Object.keys(newsChannelsInfo).forEach((serverName: string) =>
                newsChannelsInfo[serverName].newsChannels.forEach((channel) => setSubscription(serverName, channel.name)),
            );

            console.log(`restored database: ${data}`);
        } catch {
            newsChannelsInfo = {};
            console.log(`no database found, using empty database`);
        }
    });
}
