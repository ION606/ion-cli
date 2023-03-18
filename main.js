#!/usr/bin/env node

import chalk from 'chalk';
import { getAndParse } from './startup/getAndParseArgs.js';
import animeMain from './anime/getAndSave.js';
import help from './help.js'


function executeCommand(command, content = null) {
    return new Promise((resolve) => {
        switch(command) {
            case 'help': help(content);
            resolve(true);
            break;

            case 'anime': resolve(animeMain(content));
            break;

            default: console.log(chalk.red("Unknown command! try using"), chalk.red.bold("ion --help"));
            resolve(false);
        }
    });
}


async function main() {

    //REMOVE THIS
    return import('./anime_fromCLI.js');

    const args = await getAndParse();

    if (JSON.stringify(args) == "{}") {
        return await executeCommand('error');
    }

    for (const i in args) {
        // console.log(chalk.blue(i) + ": " + args[i])
        const worked = await executeCommand(i, args[i]);
        if (!worked) break;
    }
}


main();