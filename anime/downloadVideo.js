import { execFileSync } from 'child_process';
import { getJSON } from '../utils/JSON.js';
import chalk from 'chalk';

export default async function donwloadFromStream(url, newpath) {
    try {
        const vpath = await getJSON("vpath");
        // start "C:\Program Files\VideoLAN\VLC\vlc.exe" url

        execFileSync(vpath, [url], {
            stdio: ['ignore']
        });
    } catch (err) {
        console.error(err);
        console.log(chalk.red(`ERROR:\n${err.message}`));
    }
}