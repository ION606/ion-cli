import chalk from 'chalk';
import axios from "axios";
import downloadStream from './downloadVideo.js';
import { askUserQuery, generateQuery } from './userQuery.js';


export default async function getAnime9(id, episode = null) {
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
        const epSource = epResp.data.sources[0];
        
        // const vidPath = await getJSON("apath");
        // const newpath = path.resolve(vidPath, data.title + ' - ' + episodeData.title + '.m3u8');
        
        console.log(chalk.green('done!'));
        console.log(chalk.green(`Now playing ${chalk.bold(`${data.title} episode ${epNumber} - ${episodeData.title}`)}`));

        //Download the file
        downloadStream(epSource.url);
    } catch (err) {
        console.error(err);
        return console.log(chalk.red(`ERROR: ${err.message}\n\nTask aborted`));
    }
}