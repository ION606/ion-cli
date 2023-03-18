import chalk from 'chalk';
import axios from "axios";
import path from 'path';
import { getJSON, setJSON } from '../utils/JSON.js';
import getAnime9 from './9anime.js';
import getGogo from './gogoAnime.js';



async function getSearchTerm(name, episode = null) {
    return new Promise(async (resolve) => {
        console.log(chalk.green('Fetching data'));

        // Using the example query "demon", and looking at the 2nd page of results.
        var url = `https://api.consumet.org/anime/gogoanime/${name}`;

        try {
            const { data } = await axios.get(url);
            if (data.results.length == 0) {
                // console.log(data);
                return console.log(chalk.red("No results found (is the API down?)"));
            }

            return getGogo(data.results[0].id, episode);
        } catch (err) {
            console.log(chalk.red(`ERROR: ${err.message}\n\nTrying backup method...`));
        }


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
    getSearchTerm(name, episode);
}


async function getAnime(name, subcommand, episode = null) {

    switch (subcommand) {
        default: getUrl(name.replaceAll(" ", '-'), episode);
    }
}


/**
 * @param {Array<String>} command 
 * @returns 
 */
export default async function animeMain(command) {
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

    if (command.length == 0 || !nameOpt || nameOpt.length == 0) {
        console.log(chalk.red("Please specify an anime title like so: " + chalk.bold("--anime name=name_here")));
        return false;
    }

    const name = nameOpt.split('=')[1];
    const subCommand = (subCommandOpt && subCommandOpt.length != 0) ? subCommandOpt.split('=')[1] : null;
    const episode = (episodeOpt && episodeOpt.length != 0) ? Number(episodeOpt.split('=')[1]) : null;
    getAnime(name, subCommand, episode);
}