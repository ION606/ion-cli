import fs from 'fs'
import m3u8stream from 'm3u8stream';
import chalk from 'chalk';
import axios from "axios";
import readline from 'readline'
import path from 'path';
import generateQuery from './userQuery.js';
import { getJSON, setJSON } from '../utils/JSON.js';
import https from 'https';
import downloadStream from './downloadVideo.js';


/**
 * @param {String} query 
 * @returns {Promise<String>}
 */
function askUserQuery(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))

}


async function getAnime9(id, episode = null) {
    var url = `https://api.consumet.org/anime/9anime/info/${id}`;
    try {
        const response = await axios.get(url, {params: {id: id}});
        const { data } = response;
        console.log(chalk.green('done!'));

        var epNumber;

        if (!episode) {
            var query = generateQuery("animeep");
            const userResp = (await askUserQuery(query)).toLowerCase();

            if (userResp == "dumpdata") {
                return console.log(data);
            }
            else if (userResp == "desc") {
                return console.log(data.description)
            }
            else if (userResp == "episodes-all") {
                return console.log(data.episodes);
            }
            else {
                if (Number.isNaN(Number(userResp))) {
                    return console.log(chalk.red(`${userResp} is not an integer (1, 2, 3, 4, etc)`));
                }

                epNumber = Number(userResp);
            }
        } else {
            epNumber = episode;
        }

        const episodeData = data.episodes.find((e) => e.number == epNumber);
        if (!episodeData) {
            return console.log(chalk.red(`ERROR: No data found for ` + chalk.bold(`${data.title} (episode ${epNumber})`)));
        }

        
        //get the urls
        console.log(chalk.green('Fetching video sources...'));
        url = `https://api.consumet.org/anime/9anime/watch/${episodeData.id}`; //?server={serverName}`
        const epResp = await axios.get(url);
        console.log(epResp.data)
        const epSource = epResp.data.sources[0];
        
        const vidPath = await getJSON("apath");

        const newpath = path.resolve(vidPath, data.title + ' - ' + episodeData.title + '.m3u8');
        
        console.log(chalk.green('done!'));
        console.log(chalk.green('writing to local file...'));

        console.log(epSource);

        //Download the file
        downloadStream(epSource.url, newpath);


        console.log(chalk.green('done!'));
    } catch (err) {
        console.error(err);
        return console.log(chalk.red(`ERROR: ${err.message}\n\nTask aborted`));
    }
}



async function getSearchTerm(name, episode = null) {
    return new Promise(async (resolve) => {
        console.log(chalk.green('Fetching data'));

        var url = `https://api.consumet.org/anime/crunchyroll/${name}`;
        // try {
        //     const response = await axios.get(url);
        //     const { data } = response;
        //     return resolve(data);
        // } catch (err) {
        //     console.log(chalk.red(`ERROR: ${err.message}\n\nTrying backup method...`));
        // }


        //Backup section
        url = `https://api.consumet.org/anime/9anime/${name}`;
        try {
            const { data } = await axios.get(url);
            
            if (data.results.length == 0) {
                // console.log(data);
                return console.log(chalk.red("No results found (is the API down?)"));
            }
            
            getAnime9(data.results[0].id, episode);
            // return resolve(data);
        } catch (err) {
            console.error(err);
            console.log(chalk.red(`ERROR: ${err.message}\n\nTask aborted`));
        }
    });
}


async function getUrl(name, episode = null) {
    const animeTerm = await getSearchTerm(name, episode);
    return console.log(animeTerm);
    const animeEpisode = animeTerm.episodesList.find((a) => (a.episodeNum == episode));

    console.log(animeEpisode);

    fetch(`https://api.consumet.stream/vidcdn/watch/${animeEpisode.episodeId}`)
    .then((response) => response.json())
    .then((animelist) => console.log(animelist));
}


// fetch(`https://gogoanime.consumet.stream/search?keyw=${"jojo"}`)
// .then((response) => response.json())
// .then((animelist) => console.log(animelist));



async function getAnime(name, subcommand, episode = null) {
    return downloadStream("https://xege.vizcloud.club/simple/EqPFIf4QWADtjDlGha7rC8Iu+lwW5ry2Fxh7rqk+wYMnU94US2El_Po4w12g/br/list.m3u8");

    switch (subcommand) {
        default: getUrl(name, episode);
    }
}


/**
 * @param {Array<String>} command 
 * @returns 
 */
export default async function animeMain(command) {
    const apath = getJSON("apath");
    if (!apath) {
        const apath = await askUserQuery("Please specify a path to save to:\n");
        if (!apath || (apath === path.basename(apath))) {
            return console.log(chalk.red('Incorrect path!'));
        }

        setJSON("apath", apath);
    }

    const vpath = getJSON("vpath");
    if (!vpath) {
        const vpath = await askUserQuery("Please specify a path to your vlc.exe:\n");
        if (!vpath || (vpath === path.basename(vpath))) {
            return console.log(chalk.red('Incorrect path!'));
        }

        setJSON("vpath", vpath);
    }

    const nameOpt = command.find((o) => (o.indexOf('name=') != -1));
    const subCommandOpt = command.find((o) => (o.indexOf('option=') != -1));
    const episodeOpt = command.find((o) => (o.indexOf('episode=') != -1));

    if (command.length == 0 || nameOpt.length == 0) {
        console.log(chalk.red("Please specify an anime title!"));
        return false;
    }

    console.log(episodeOpt);

    const name = nameOpt.split('=')[1];
    const subCommand = (subCommandOpt && subCommandOpt.length != 0) ? subCommandOpt.split('=')[1] : null;
    const episode = (episodeOpt && episodeOpt.length != 0) ? Number(episodeOpt.split('=')[1]) : null;
    getAnime(name, subCommand, episode);
    return true;
    // m3u8stream('http://somesite.com/link/to/the/playlist.m3u8')
    // .pipe(fs.createWriteStream('videofile.mp4'));
}