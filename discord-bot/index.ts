const config = require('./config.json');

import * as Discord from 'discord.js';
import axios, { AxiosResponse } from 'axios';
import moment from 'moment';
import { NewsInterfaceUnion } from './interfaces/news-union.type';
import { from, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NewsTypes } from './interfaces/news-types.enum';

const client: Discord.Client = new Discord.Client();
const postedNews: string[] = ['461', '454', '456', '458'];

client.login(config.BOT_TOKEN);

client.on('ready', () => {
    if (client.user) {
        console.log(`${client.user.tag} is online!`);
    }

    // Getting the channel from client.channels Collection.
    // TODO each server should be configurable by command (only available to admin)
    const newsChannel: Discord.TextChannel | undefined = client.channels.cache.get('762053640047296548') as Discord.TextChannel;

    if (!newsChannel) {
        return console.error("Couldn't find the channel.");
    }

    newsChannel.send(
        `Hi! I'm DFComps bot. I will send messages about ongoing competitions. In time I will be able to do a lot more, so stay tuned and check https://dfcomps.ru/discord-bot to see the list of available commands.`,
    );

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

    // TODO change to interval
    timer(0)
        .pipe(
            switchMap(() => from(axios.get('https://dfcomps.ru/api/news/mainpage'))),
            map(({ data }: AxiosResponse) => data),
            map((news: NewsInterfaceUnion[]) =>
                news
                    .filter((newsElem: NewsInterfaceUnion) => [NewsTypes.OFFLINE_START, NewsTypes.OFFLINE_RESULTS].includes(newsElem.type))
                    .filter((newsElem: NewsInterfaceUnion) => !postedNews.includes(newsElem.id)),
            ),
        )
        .subscribe((news: NewsInterfaceUnion[]) =>
            news.forEach((newsElem: NewsInterfaceUnion) => {
                postedNews.push(newsElem.id);
                postNews(newsChannel, newsElem);
            }),
        );
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
                **Finish**: ${moment(news.cup.endDateTime).add(-3, 'hours').format('DD.MM.YYYY HH:mm')} GMT,
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
